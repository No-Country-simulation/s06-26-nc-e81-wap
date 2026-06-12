# ADR-001: JWT RS256 con blacklist Redis+SQLite para revocación inmediata

## Status

Accepted

## Context

**Problem**: Necesitamos autenticación stateless para 13 microservicios, pero el flujo de "logout invalida sesión" requiere revocación inmediata del token activo. JWT puro stateless no permite esto: el token sigue siendo válido hasta su expiración natural aunque el usuario cierre sesión.

**Constraints**:
- 1-2 personas en MVP, no podemos operar infraestructura compleja
- Stack dockerizado free tier
- SLO 99.5% para auth (servicio crítico)
- LGPD: registro de accesos obligatorio

**Options considered**:

1. **JWT stateless puro (HS256 o RS256) sin blacklist**
   - Pros: simple, sin estado, fácil de escalar
   - Cons: logout no invalida sesión hasta expiración (1h), cambio de password no cierra otras sesiones, no cumple requisito de "logout inmediato"
2. **Sesiones server-side con Redis**
   - Pros: revocación trivial, control total
   - Cons: cada request hace query a Redis (latencia), Redis como SPOF
3. **JWT RS256 + blacklist del jti en Redis+SQLite**
   - Pros: stateless por default, revocación inmediata vía blacklist, fallback a SQLite si Redis está caído
   - Cons: dos sistemas a mantener, ~5ms extra por request

## Decision

Elegimos **Opción 3**: JWT RS256 con blacklist del `jti` (JWT ID) en Redis dockerizado, con fallback a SQLite local del servicio auth.

**Razonamiento**:
- El token es válido por defecto sin consultar nada (stateless)
- Solo cuando hay que **revocar** se agrega el `jti` a la blacklist con TTL = tiempo restante del access token
- Próxima request con ese token → consulta Redis (con fallback a SQLite) → 401
- RS256 sobre HS256: la clave pública la puede verificar cualquier servicio sin tener la privada, permite separar `auth-svc` (firma) del resto (verifica)

## Consequences

**Positive**:
- Logout invalida sesión de forma inmediata (< 1s en la mayoría de los casos)
- Cambio de password desde un dispositivo cierra todas las sesiones del usuario (vía evento `auth.password.cambiada.v1` que dispara invalidación masiva)
- Cumple requisito LGPD de revocación inmediata
- No introduce latencia significativa en requests normales (solo se consulta blacklist si el token es sospechoso)
- Fallback a SQLite mantiene el sistema funcionando si Redis se cae

**Negative**:
- 2 sistemas de storage para la blacklist (Redis + SQLite como fallback)
- Si ambos sistemas están caídos, no se pueden revocar tokens activos (los tokens siguen válidos hasta expiración)
- ~5ms extra por request cuando se consulta la blacklist
- Complejidad operacional: hay que monitorear Redis + mantener el script de fallback a SQLite

**Neutral**:
- El access token sigue siendo de 1h (no se reduce)
- El refresh token sigue siendo de 7 días, rotado en cada uso
- El TTL de la blacklist es exactamente el tiempo restante del access token (no requiere limpieza manual)

## Superseded by

## Supersedes

---

**Keywords**: jwt, authentication, blacklist, redis, sqlite, revocation, rs256

**Date**: 2026-06-11

**Authors**: arquitectura App BiT
