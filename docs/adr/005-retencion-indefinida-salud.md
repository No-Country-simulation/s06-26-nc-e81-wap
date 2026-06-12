# ADR-005: Retención indefinida de mensajes de salud con anonimización a 24 meses

## Status

Accepted

## Context

**Problem**: Los mensajes del chat de salud mental pueden necesitarse como evidencia clínica años después del intercambio (auditoría, derivación a CVV, investigación, defensa legal). Pero LGPD art. 18 da derecho al usuario a solicitar supresión.

**Constraints**:
- LGPD: derecho de supresión a solicitud del usuario
- Resoluções CFM (Brasil): historia clínica debe conservarse ≥ 20 años
- CFP 010/2005: secreto profesional del psicólogo
- El usuario debe poder pedir que sus datos se borren
- Si un admin_clinico necesita revisar el caso de un usuario, debe poder hacerlo

**Options considered**:

1. **TTL agresivo** (borrar mensajes a 6 meses, 1 año, 2 años)
   - Pros: cumple LGPD proactivamente, no hay datos viejos que proteger
   - Cons: pierde evidencia clínica, viola CFM (conservar ≥ 20 años), no permite auditoría retrospectiva
2. **Retención indefinida con anonimización progresiva** (anonimizar tras 24 meses de inactividad)
   - Pros: conserva evidencia clínica, anonimiza lo suficiente para que no sea dato personal
   - Cons: hay que implementar el job de anonimización correctamente, riesgo de re-identificación
3. **Borrado total al solicitarlo** (hard delete tras pedido del usuario)
   - Pros: cumple LGPD literalmente
   - Cons: viola retención clínica, imposible de auditar
4. **Retención indefinida sin anonimización** (nunca borrar)
   - Pros: máxima disponibilidad para auditoría
   - Cons: viola LGPD art. 18, acumula riesgo de breach

## Decision

Elegimos **Opción 2**: retención indefinida con **anonimización progresiva a 24 meses de inactividad** + hard delete solo por solicitud explícita del usuario (LGPD art. 18).

**Razonamiento**:
- Cumplimos CFM (≥ 20 años) manteniendo la disponibilidad clínica
- A los 24 meses, el `usuario_id_hash` se reemplaza por un nuevo hash anónimo, NO se puede re-vincular con la persona
- El verbatim cifrado se conserva tal cual (la anonimización es solo del vínculo, no del contenido)
- Si el usuario pide supresión, hard delete de TODO (excepto metadata de auditoría de que existió la derivación)
- El job de anonimización corre nightly (cron 3am) y audita cada acción

**Lo que cambia a 24 meses**:
- `chat_salud_mental.sessions.usuario_id_hash` → nuevo hash anónimo (no se puede re-vincular)
- `chat_salud_mental.messages.content_encrypted` → se conserva (cifrado)
- `chat_salud_mental.sessions.alertas` → se conserva (es metadata de seguridad, no PII)
- Audit log: registra la anonimización con timestamp + hash anterior (sin contenido)

**Lo que NO se anonimiza**:
- Eventos de auditoría (cuándo se detectó una crisis, cuándo se derivó al CVV) — esto es necesario para auditoría clínica retrospectiva
- Metadata de que existió la sesión (cuándo se creó, cuándo se cerró) — necesario para estadísticas agregadas

## Consequences

**Positive**:
- Cumplimiento simultáneo de LGPD (derecho de supresión) y CFM (retención ≥ 20 años)
- Disponibilidad para auditoría clínica retrospectiva
- Si el usuario pide supresión, hard delete real de su contenido
- Anonimización reduce gradualmente el riesgo de breach a lo largo del tiempo

**Negative**:
- Complejidad: hay que implementar y mantener el job de anonimización correctamente
- Riesgo de re-identificación: si se conserva metadata suficiente (timestamps, escalas, alertas), alguien con acceso podría re-vincular
- A 24 meses, los mensajes siguen existiendo aunque ya no son atribuibles — esto es delicado legalmente
- Si el cluster MongoDB de salud se ve comprometido, los mensajes anónimos siguen siendo confidenciales (cifrados)

**Neutral**:
- Los otros chats (mentor, agente orientar) tienen TTL de 24 meses y 90 días respectivamente
- La anonimización no aplica a `terminologia_clinica` (catálogo público)
- Los audit logs de salud (5 años de retención) NO se anonimizan porque son necesarios para auditoría clínica

## Superseded by

## Supersedes

---

**Keywords**: retencion, anonimizacion, salud-mental, lgpd, cfp, cfm, compliance

**Date**: 2026-06-11

**Authors**: arquitectura App BiT
