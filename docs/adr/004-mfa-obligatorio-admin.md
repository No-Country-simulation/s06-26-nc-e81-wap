# ADR-004: MFA obligatorio para admin_clinico y admin_eventos

## Status

Accepted

## Context

**Problem**: Los usuarios con rol `admin_clinico` acceden a la base de datos de salud mental (mensajes cifrados de usuarios en crisis). Los `admin_eventos` pueden publicar/despublicar contenido y ver datos de organizador. Si su password se ve comprometida, el atacante accede a datos extremadamente sensibles.

**Constraints**:
- 1-2 personas en MVP, no podemos operar infraestructura compleja de autenticación
- Free tier: no podemos pagar Auth0 / Okta / Duo
- Los admins son personas del equipo o voluntarios, no usuarios finales

**Options considered**:

1. **Solo email + password** (sin segundo factor)
   - Pros: simple, sin fricción para el admin
   - Cons: si el password se filtra, el atacante accede a datos de salud mental de usuarios
2. **MFA con TOTP** (Google Authenticator, Authy) — el secret se cifra con KMS
   - Pros: estándar RFC 6238, apps gratuitas, secret cifrado en reposo
   - Cons: fricción operacional cada vez que el admin entra
3. **MFA con magic link por email**
   - Pros: sin app, el admin solo necesita email
   - Cons: si el email está comprometido, el MFA no protege
4. **MFA con hardware token** (YubiKey)
   - Pros: máxima seguridad
   - Cons: costo, no todos los admins tienen, fricción alta

## Decision

Elegimos **Opción 2**: MFA con TOTP obligatorio para `admin_clinico` y `admin_eventos`. El secret se cifra en reposo con KMS.

**Razonamiento**:
- TOTP es el estándar de facto para MFA en apps self-hosted
- Apps gratuitas disponibles (Google Authenticator, Authy, 1Password, Bitwarden)
- El secret TOTP se cifra con la misma KMS que el resto de datos sensibles (consistencia)
- El costo operacional es aceptable: el admin tarda 10 segundos más en cada login
- Magic link es vulnerable si el email se ve comprometido (escenario realista)
- Hardware token es over-engineering para MVP

**Reglas**:
- Tras login con email + password, si el `rol` del usuario es `admin_clinico` o `admin_eventos`, se requiere TOTP
- TOTP secret se cifra en reposo con KMS
- Si el admin pierde acceso al TOTP, flujo de recovery manual con `admin_clinico` senior (proceso documentado en runbook, no automatizado)
- Rate limit reducido para intentos MFA fallidos (3/min vs 5/min para login normal)

## Consequences

**Positive**:
- Doble factor protege contra password comprometido (el escenario más común de breach)
- Cumple buenas prácticas de seguridad para acceso a datos clínicos
- El secret TOTP está protegido por KMS (no en texto plano en DB)
- Estándar RFC 6238, compatible con cualquier app de autenticación

**Negative**:
- Fricción operacional: cada login de admin tarda 10 segundos más
- Si el admin pierde el dispositivo TOTP, requiere proceso manual de recovery (no self-service)
- Complejidad de desarrollo: enroll, verify, recovery flow
- 1-2 personas del equipo tienen que usar TOTP todos los días

**Neutral**:
- Los usuarios normales NO tienen MFA (no es el cuello de botella de seguridad)
- Si en el futuro hay muchos admins, considerar upgrade a YubiKey o solución gestionada

## Superseded by

## Supersedes

---

**Keywords**: mfa, totp, admin, autenticacion, seguridad

**Date**: 2026-06-11

**Authors**: arquitectura App BiT
