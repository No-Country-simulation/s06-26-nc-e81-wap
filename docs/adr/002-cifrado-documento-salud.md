# ADR-002: Cifrado AES-256-GCM a nivel de documento para mensajes de salud

## Status

Accepted

## Context

**Problem**: Los mensajes del chat de salud mental son los datos más sensibles del producto. Necesitamos protegerlos contra múltiples vectores de ataque: robo del disco (snapshots, backups), acceso de insider (empleado malicioso), compromiso del cluster MongoDB.

**Constraints**:
- Compliance: LGPD, Resoluções CFM/CFP (Brasil)
- Retención indefinida por compliance clínico (24 meses de anonimización progresiva)
- Performance aceptable: p95 de TTFT < 3s para chat de salud
- Stack dockerizado free tier

**Options considered**:

1. **Solo cifrado de disco** (EBS/LUKS AES-256-XTS)
   - Pros: simple, transparente para la app
   - Cons: no protege contra insider threat (quien tiene acceso al volumen ve los datos en claro), no protege si el cluster se ve comprometido
2. **Cifrado de aplicación a nivel de campo** (solo el campo `content` cifrado, el resto del documento en claro)
   - Pros: el `content` está cifrado con clave KMS, no se ve sin descifrar
   - Cons: el documento en sí mismo es legible (estructura, timestamps, IDs)
3. **Cifrado de aplicación a nivel de documento completo** (todo el documento cifrado con AES-256-GCM)
   - Pros: máxima protección, ni estructura ni contenido visible sin descifrar, no leak de metadata
   - Cons: ~10-15% overhead de CPU, no se pueden hacer queries sobre el contenido cifrado (se necesita `content_hash` para búsqueda)

## Decision

Elegimos **Opción 3**: cifrado AES-256-GCM con clave KMS a nivel de **documento completo** para `chat_salud_mental.messages`.

**Razonamiento**:
- El chat de salud es el ÚNICO dato donde vale la pena el overhead
- El cifrado de disco (ADR-003) protege contra robo de hardware pero no contra insider
- El cifrado de aplicación a nivel de documento protege incluso si el cluster completo es comprometido
- Se mantiene un `content_hash` (SHA-256) del texto plano para búsquedas sin descifrar (privacidad: solo el hash, no el contenido)
- La clave vive en KMS dedicado, no en código ni en variables de entorno

## Consequences

**Positive**:
- Defensa en profundidad: ni robo de disco ni insider threat ni compromiso del cluster expone el contenido
- Cumple compliance estricto (CFP 010/2005: secreto profesional del psicólogo)
- Permite acceder al contenido con la clave KMS, que está auditada
- `content_hash` permite búsqueda sin descifrar (búsqueda de mensajes por similitud aproximada)

**Negative**:
- ~10-15% overhead de CPU en lecturas/escrituras del cluster de salud
- No se pueden hacer queries SQL-like sobre el contenido (solo equality lookup por `content_hash`)
- Complejidad operacional: el equipo debe saber descifrar para debuggear
- Si se pierde la clave KMS, **todos los mensajes son irrecuperables** (riesgo de disaster recovery)

**Neutral**:
- Los `sessions` de salud NO se cifran (solo metadata: humor, escalas, timestamps) — son necesarios para queries
- El cifrado aplica solo a `chat_salud_mental.messages`, NO a `chat_mentoria.messages` ni a `chat_agente_orientar.messages` (menor sensibilidad)

## Superseded by

## Supersedes

---

**Keywords**: encryption, mongodb, salud-mental, aes-256-gcm, kms, compliance, lgpd

**Date**: 2026-06-11

**Authors**: arquitectura App BiT
