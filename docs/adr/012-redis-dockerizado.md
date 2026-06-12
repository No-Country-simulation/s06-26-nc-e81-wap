# ADR-012: Redis dockerizado en Railway para sticky sessions de WebSocket

## Status

Accepted

## Context

**Problem**: El chat de la plataforma (3 features: mentor, agente orientar, agente salud) usa WebSocket. Railway no soporta sticky sessions nativamente. Cuando un usuario envía un mensaje, el `chat-gateway` debe enrutar consistentemente al mismo backend de chat, sino se pierde el estado.

**Constraints**:
- Free tier de Railway
- Stack dockerizado
- WebSocket con conexiones largas (horas)
- 1-2 personas mantienen todo
- 3 features de chat diferentes (pueden tener su propio backend)

**Options considered**:

1. **Pin en memoria del `chat-gateway`** (mapa `usuario_id → backend_id` local)
   - Pros: simple, sin dependencias extra
   - Cons: si el `chat-gateway` se reinicia, se pierde el pin; no escala horizontalmente
2. **Redis dockerizado compartido** entre N instancias del `chat-gateway`
   - Pros: el pin sobrevive a restart del gateway, escala horizontal
   - Cons: Redis como SPOF en MVP
3. **Redis Sentinel / Cluster** (HA real)
   - Pros: alta disponibilidad
   - Cons: 3+ contenedores, complejidad para MVP
4. **Long polling en vez de WebSocket**
   - Pros: sin sticky sessions
   - Cons: peor latencia, menos natural para chat

## Decision

Elegimos **Opción 2**: Redis dockerizado en Railway como contenedor custom, compartido entre N instancias del `chat-gateway` para sticky sessions.

**Razonamiento**:
- El pin en memoria (Opción 1) es demasiado frágil para datos sensibles del chat
- Long polling degrada la experiencia de usuario (chat se siente lento)
- Redis Sentinel (Opción 3) es over-engineering para MVP
- **Aceptamos SPOF del Redis en MVP**: si se cae, los usuarios reconectan y se reasignan automáticamente. Ventana de inconsistencia de segundos, aceptable
- La migración a Sentinel/Cluster es directa cuando se justifique (5k+ usuarios activos)

**Flujo del sticky pin**:
```
1. Handshake WebSocket con JWT
2. chat-gateway consulta Redis: `GET user:<uuid>:backend`
3. Si existe: enrutar a esa instancia
4. Si no: elegir backend (round-robin), guardar en Redis con TTL 3600s
5. Si la instancia del backend se cae: el TTL expira, próximo reconnect reasigna
```

## Consequences

**Positive**:
- El pin sobrevive a reinicios del `chat-gateway`
- Escala horizontalmente (varias instancias del `chat-gateway` comparten el pin)
- Latencia del lookup en Redis: ~1ms (despreciable)
- Si una instancia del backend de chat se cae, los usuarios se reasignan en el próximo reconnect
- Migración futura a Sentinel/Cluster es directa

**Negative**:
- Redis es SPOF en MVP: si se cae, todas las sticky sessions se invalidan
- Hay que monitorear Redis (healthcheck, alerta P1 si se cae)
- El TTL del pin (1h) significa que tras 1h de inactividad, el usuario puede ir a otro backend
- Si el chat tiene 3 backends diferentes (mentor, orientar, salud), hay 3 sticky pins por usuario

**Neutral**:
- Cuando el chat crezca, se evalúa Redis Sentinel (HA) o Redis managed (Upstash)
- El script de backup de Redis NO existe (Redis no se respalda, se reconstruye)
- La librería cliente es Redis estándar (compatible con cualquier driver)

## Superseded by

## Supersedes

---

**Keywords**: redis, websocket, wss, sticky-sessions, chat-gateway, docker, spof

**Date**: 2026-06-11

**Authors**: arquitectura App BiT
