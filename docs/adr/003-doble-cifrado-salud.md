# ADR-003: Doble cifrado (disco + aplicación) para datos de salud

## Status

Accepted

## Context

**Problem**: ADR-002 define cifrado de aplicación para mensajes del chat de salud. Pero los datos de salud también viven en `checkin_emocional`, `derivacion_cvv` (PostgreSQL) y `terminologia_clinica` (no sensible). Necesitamos decidir si el cifrado de aplicación se aplica a TODO el cluster PostgreSQL de salud o solo a la parte del chat.

**Constraints**:
- PostgreSQL dockerizado en Railway (volumen persistente)
- Compliance estricto (LGPD, CFM, CFP)
- Performance: p95 < 200ms para queries de check-in
- Backups diarios del cluster de salud (90 días de retención)

**Options considered**:

1. **Solo cifrado de disco** (EBS/LUKS) en todos los nodos PostgreSQL y MongoDB
   - Pros: simple, transparente, performance nativa
   - Cons: no protege contra acceso admin al cluster, no protege backups
2. **Cifrado de aplicación selectivo** (solo `chat_salud_mental.messages`, como en ADR-002)
   - Pros: protege el dato más sensible, resto sin overhead
   - Cons: `checkin_emocional` (con códigos SNOMED, escalas LOINC) queda en claro en disco
3. **Doble cifrado** (disco + aplicación selectiva) para TODO el cluster de salud
   - Pros: defensa en profundidad, `checkin_emocional` también protegido, backups cifrados por partida doble
   - Cons: costo doble de cifrado, más complejidad operacional

## Decision

Elegimos **Opción 3**: doble cifrado (disco del cluster PostgreSQL/MongoDB de salud + aplicación selectiva según sensibilidad del dato).

**Razonamiento**:
- Los datos de salud son la única parte del producto donde el costo de breach es catastrófico (legal, reputacional, ético)
- El cifrado de disco protege contra robo de hardware o snapshot
- El cifrado de aplicación protege contra insider threat o compromiso del cluster
- Las dos capas son **independientes** con claves en KMS separados, así que comprometer una no expone la otra
- El overhead de performance (~10-15% del cifrado de app + 0% extra del cifrado de disco si se hace en hardware) es aceptable para datos de salud

**Qué se cifra y cómo**:
| Dato | Disco | Aplicación |
|---|---|---|
| `checkin_emocional.contexto` (texto libre) | Sí | Sí (AES-256-GCM) |
| `checkin_emocional.escala_items_json` | Sí | No (necesario para queries) |
| `checkin_emocional.humor_codigo` (SNOMED) | Sí | No (códigos estándar) |
| `derivacion_cvv.motivo_clinico_codigo` (CID-10) | Sí | No |
| `chat_salud_mental.messages` | Sí | **Sí, documento completo** (ADR-002) |
| `chat_salud_mental.sessions` | Sí | No (necesario para queries) |
| `usuario.cpf`, `documento_nacional_numero` | Sí | Sí (AES-256-GCM) |
| `terminologia_clinica` (catálogo público) | Sí | No (dato de referencia, no sensible) |

## Consequences

**Positive**:
- Defensa en profundidad real: dos capas independientes
- Si el cluster PostgreSQL se ve comprometido, los datos sensibles siguen protegidos por la capa de aplicación
- Si la clave KMS de aplicación se ve comprometida, los datos siguen protegidos por el cifrado de disco
- Backups del cluster de salud están doblemente cifrados (EBS + KMS de app)
- Cumplimiento estricto de LGPD, CFM, CFP

**Negative**:
- Costo de cifrado doble: ~10-15% overhead de CPU en datos cifrados a nivel de app
- Complejidad operacional: dos claves KMS que rotar, dos sistemas a monitorear
- Si se pierde AMBAS claves, datos irrecuperables (disaster recovery plan debe documentar cómo se recuperan backups con claves externas)

**Neutral**:
- El cluster PostgreSQL de auth/perfil/orientar NO tiene cifrado de aplicación (solo disco) — los datos no son tan sensibles
- `terminologia_clinica` (catálogo público de LOINC/SNOMED/CID-10) NO se cifra a nivel de app (no es dato personal)

## Superseded by

## Supersedes

---

**Keywords**: encryption, postgres, mongodb, salud-mental, defensa-en-profundidad, lgpd

**Date**: 2026-06-11

**Authors**: arquitectura App BiT
