# ADR-006: Saga con outbox + 5 reintentos + DLQ + rollback explícito

## Status

Accepted

## Context

**Problem**: Las operaciones cross-service (ej: aceptar mentoría → crear conversación en MongoDB) son transaccionalmente distribuidas. Si un paso falla, queda inconsistencia entre DBs. La saga con reconciliación pasiva ("se reintenta en la noche") no es aceptable para datos sensibles: el usuario debe ver el resultado predecible.

**Constraints**:
- 4 motores de DB diferentes (PostgreSQL, MariaDB, MongoDB cuenta #1, MongoDB cuenta #2)
- NO 2PC (two-phase commit) — requiere que las 4 DBs estén en transacción distribuida, complejidad brutal
- Datos sensibles (chat de salud) requieren alta confiabilidad
- 1-2 personas en MVP, sin equipo de operaciones dedicado

**Options considered**:

1. **2PC distribuido** (XA transactions)
   - Pros: atomicidad estricta
   - Cons: casi ningún motor de DB lo soporta bien, latencia alta, single point of failure (el coordinator)
2. **Saga coreografiada simple** (publicar evento, consumirlo, listo)
   - Pros: simple
   - Cons: si un paso falla, queda inconsistencia; reconciliación pasiva en background; UI muestra "preparando..." indefinidamente
3. **Saga coreografiada con outbox + reintentos activos + DLQ + rollback explícito**
   - Pros: garantiza que el trabajo se completa o se cancela limpio, experiencia de usuario predecible
   - Cons: más complejo (outbox poller, worker de DLQ, sistema de rollback)

## Decision

Elegimos **Opción 3**: saga con outbox pattern, 5 reintentos con backoff exponencial, DLQ con worker, y rollback explícito si se abandona.

**Razonamiento**:
- Los datos sensibles del producto (chat de salud, mentoría, postulaciones) NO pueden quedar en estado inconsistente
- La UI debe mostrar el resultado con timeout explícito, no "preparando..." infinito
- Si el trabajo no se completa, debe hacerse rollback limpio y notificar al usuario
- El outbox pattern garantiza que el evento se publique incluso si RabbitMQ está caído (la DB commitea y el poller publica después)
- El DLQ es la red de seguridad para eventos que no se pueden consumir

**Flujo completo**:

```
1. Emisor: ejecuta acción local en transacción ACID + INSERT en outbox_events (misma TX)
2. Outbox poller (worker): lee outbox_events pendientes, publica a RabbitMQ, marca published_at
3. Consumidor: recibe evento, procesa con idempotencia
   - ÉXITO → publica "completado" → UI actualiza a "listo"
   - FALLA → reintenta con backoff:
     - Intento 1: inmediato
     - Intento 2: 5s
     - Intento 3: 30s
     - Intento 4: 2 min
     - Intento 5: 10 min
     - Tras 5 fallos: el evento va a DLQ
4. Worker de DLQ: reintenta el evento cada 1 min durante 1h
   - Si logra: publica "completado"
   - Si no: ROLLBACK EXPLÍCITO (acción compensatoria) + alerta a on-call + mensaje al usuario
5. UI: muestra estado real con timeouts (pending|processing|completed|rolling_back|rolled_back)
```

**Acciones compensatorias por saga**:
- Crear conversación en MongoDB → borrar conversación creada
- Marcar invitación aceptada (MariaDB) → volver a `estado='pendiente'`
- Crear trayectoria (MariaDB) → marcar `activa=false`
- Postular a vacante (MariaDB) → marcar `estado='cancelado'`
- Abrir sesión de chat (MongoDB) → cerrar sesión

## Consequences

**Positive**:
- El trabajo cross-service se completa o se cancela limpio, sin estados intermedios para el usuario
- La UI muestra estado real con timeouts explícitos (no "preparando..." infinito)
- Outbox pattern garantiza que el evento se publique incluso si RabbitMQ está caído
- DLQ es la red de seguridad: si todo falla, el evento queda en DLQ para investigación manual
- Acciones compensatorias documentadas para cada saga

**Negative**:
- Más complejo que una saga simple: requiere outbox poller, worker de DLQ, sistema de rollback
- La tabla `sagas` debe mantenerse sincronizada con el estado real (UI puede mostrar estado stale)
- El job de DLQ worker agrega un contenedor más al stack
- Si la DB del emisor se cae después de la TX pero antes del outbox poller, el evento queda pendiente (consistente con outbox)

**Neutral**:
- Aplica a TODAS las operaciones cross-service del producto (no selectivo)
- El outbox poller corre como worker dentro de cada servicio (no servicio separado)
- Los reintentos son bounded (5) y documentados; no se considera reintento infinito

## Superseded by

## Supersedes

---

**Keywords**: saga, outbox, mq, retry, dlq, transaccion-distribuida, rollback

**Date**: 2026-06-11

**Authors**: arquitectura App BiT
