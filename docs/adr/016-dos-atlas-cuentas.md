# ADR-016: 2 cuentas MongoDB Atlas M0 free separadas (general + salud aislado)

## Status

Accepted

## Context

**Problem**: El producto tiene 3 features de chat (mentor, agente orientar, agente salud). El chat de salud es **críticamente sensible** por compliance (LGPD, CFP 010/2005 Brasil). Si el cluster MongoDB de salud se ve comprometido, las consecuencias son catastróficas (legal, reputacional, ético).

**Constraints**:
- Compliance estricto: datos de salud deben tener aislamiento físico o lógico fuerte
- Free tier obligatorio
- Acceso por `admin_clinico` requiere acuerdo de confidencialidad + MFA
- 1-2 personas mantienen la infra
- Logs de acceso a la DB de salud van a SIEM externo

**Options considered**:

1. **Un solo cluster MongoDB, dos databases lógicas** (chat_general y chat_salud)
   - Pros: simple, una sola pieza a operar
   - Cons: si el cluster se ve comprometido, AMBAS DBs se ven comprometidas
2. **Dos clusters MongoDB en la misma cuenta Atlas** (proyectos separados dentro de la misma organización)
   - Pros: aislamiento lógico entre clusters, IP allowlist separada
   - Cons: misma organización Atlas, mismo equipo, mismo billing — compromiso administrativo pero no técnico
3. **Dos clusters MongoDB en cuentas Atlas separadas** (aislamiento físico real)
   - Pros: aislamiento físico real, organización separada, billing separado, credenciales separadas
   - Cons: 2 cuentas Atlas que mantener, 2 free tiers que agotar
4. **MongoDB Atlas dedicado de pago** (M10+)
   - Pros: replica set real, mayor uptime, KMS dedicado
   - Cons: $$$/mes

## Decision

Elegimos **Opción 3**: 2 cuentas MongoDB Atlas M0 free **separadas**, con credenciales, IP allowlist y billing independientes.

**Razonamiento**:
- El aislamiento de compliance es **no negociable** para datos de salud
- Una sola cuenta Atlas (incluso con proyectos separados) comparte billing, equipo, organización — si alguien con acceso admin a la organización Atlas compromete la cuenta, accede a AMBOS clusters
- Dos cuentas Atlas distintas = **aislamiento físico real** entre proveedores, organizaciones, equipos
- El costo es $0 (M0 free en ambas) y la complejidad operativa es solo 2 cuentas que configurar
- Si en el futuro se quiere migrar a M10+ por uptime, solo se paga la cuenta de salud (la general puede quedarse en M0)

**Configuración**:

**Cuenta Atlas #1** (proyecto: `appbit-general`):
- Cluster M0 free
- Databases: `chat_mentoria`, `chat_agente_orientar`
- IP allowlist: IPs de los servicios que la consumen
- Credenciales dedicadas (usuario `appbit-general`)
- **NO contiene ningún dato de salud**

**Cuenta Atlas #2** (proyecto: `appbit-salud`):
- Cluster M0 free
- Database: `chat_salud_mental` (única)
- **IP allowlist MUY estricta**: solo las IPs de `chat-agente-salud` y `salud-svc`
- Credenciales dedicadas, distintas del cluster general
- **NO comparte organización ni equipo Atlas con la cuenta #1**
- Acceso humano: solo `admin_clinico` con MFA
- Backups en bucket B2 separado (`appbit-backups-salud`)

**Trade-off de seguridad adicional**:
- El cifrado AES-256-GCM a nivel de documento (ADR-002) sigue aplicando, pero ahora es **doble protección**: aunque alguien comprometa la cuenta Atlas #2, el contenido sigue cifrado con KMS
- Los audit logs a SIEM externo son distintos para cada cluster (SIEM-A para general, SIEM-B para salud)

## Consequences

**Positive**:
- Aislamiento físico real entre los dos clusters (organizaciones Atlas distintas)
- Si la cuenta #1 se ve comprometida, la salud NO se afecta
- Si la cuenta #2 se ve comprometida, el resto del producto NO se afecta
- Credenciales, IP allowlist, KMS keys, SIEM separados
- Cumple el estándar más estricto de compliance para datos clínicos
- Migración futura a M10+ es selectiva (solo la cuenta de salud)

**Negative**:
- 2 cuentas Atlas que mantener (config, IP allowlist, credenciales, backups)
- El equipo tiene que recordar 2 sets de credenciales separadas
- Si una cuenta Atlas free tier se queda sin quota, hay que migrar a la otra (más complejo que tener 1 sola)
- El monitoreo de uptime es 2x (cada cluster tiene su status page)

**Neutral**:
- El cluster general podría estar en otro proveedor (ej: DigitalOcean Managed MongoDB) — se evalúa más adelante
- El chat de salud tiene una DB dedicada (chat_salud_mental) — no comparte con otros chats
- Cuando se pague infraestructura, la prioridad es subir la cuenta #2 a M10 (mayor uptime para datos sensibles)

## Superseded by

## Supersedes

---

**Keywords**: mongodb, atlas, aislamiento, compliance, lgpd, salud-mental, free-tier

**Date**: 2026-06-11

**Authors**: arquitectura App BiT
