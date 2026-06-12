# ADR-013: GlitchTip dockerizado para error tracking

## Status

Accepted

## Context

**Problem**: Necesitamos capturar errores de los 13 microservicios y de los 3 servicios de chat, idealmente con stack traces, contexto del request, y agrupación inteligente. Es crítico para debuggear el chat de salud (donde los errores pueden afectar a personas en crisis).

**Constraints**:
- Free tier obligatorio
- Stack dockerizado
- Datos sensibles: los stack traces NO deben contener mensajes del chat de salud
- Compatible con SDK estándar (idealmente drop-in con Sentry)

**Options considered**:

1. **Sentry free tier** (SaaS)
   - Pros: zero config, tier free generoso (5k eventos/mes)
   - Cons: SaaS externo, contradice la promesa de "todo en tu infra" para datos sensibles
2. **GlitchTip self-hosted** (dockerizado)
   - Pros: compatible con SDK de Sentry (drop-in), sin límite de eventos, datos en nuestra infra
   - Cons: hay que mantener el contenedor, UI menos pulida que Sentry
3. **Sentry self-hosted** (oficial)
   - Pros: mismas features que Sentry SaaS
   - Cons: muy pesado, free tier descontinuado, complicado de mantener
4. **No usar error tracking**, solo logs
   - Pros: $0
   - Cons: no hay grouping, no hay alertas, no hay UI para buscar

## Decision

Elegimos **Opción 2**: GlitchTip dockerizado en Railway, compatible con SDK de Sentry.

**Razonamiento**:
- Para un producto que se jacta de cuidar la privacidad del chat de salud, enviar errores a un SaaS externo (Sentry) es contradictorio
- GlitchTip es open source, dockerizable, compatible con `@sentry/node` y `sentry-sdk` (drop-in replacement)
- Sin límite de eventos: cuando el equipo esté debugueando a las 3am haciendo 50 capturas, Sentry free se queda corto
- El costo operacional es bajo: 1 contenedor más, mismo patrón que ya tenemos
- Si en el futuro queremos migrar a Sentry pago, es cambiar la variable de entorno del DSN

**Lo que se pierde vs Sentry pago**:
- Menos integraciones de terceros (no crítico en MVP)
- Sin release health avanzado (no crítico en MVP)
- Sin performance monitoring detallado (suplido por OpenTelemetry que ya tenemos en el plan)
- UI menos bonita (funcional, no estética)

**Configuración**:
- GlitchTip corre como contenedor en Railway, depende de PostgreSQL (ya tenemos)
- Variable de entorno `GLITCHTIP_DSN` en cada servicio con formato `http://<key>@glitchtip:8000/<project>`
- SDK de Sentry en cada servicio: `Sentry.init({ dsn: process.env.GLITCHTIP_DSN, ... })`
- **Sanitización obligatoria**: el agente de seguridad o developer debe revisar que no se loguea contenido del chat de salud (solo metadata, stack trace, contexto)

## Consequences

**Positive**:
- Datos de errores en nuestra propia infra (privacidad)
- Sin límite de eventos (cero riesgo de "se nos acabaron los free events")
- Compatible con SDK de Sentry (migración trivial si se decide pagar)
- Drop-in replacement, no requiere reescribir instrumentación
- Un contenedor más al stack, mismo patrón operacional

**Negative**:
- 1 contenedor más a mantener (pero ya tenemos el patrón)
- UI menos pulida que Sentry oficial
- Algunas features avanzadas faltan (release health, performance monitoring)
- Hay que configurar sanitización de datos sensibles manualmente
- Si GlitchTip se cae, perdemos visibilidad de errores (los logs siguen funcionando)

**Neutral**:
- El `SLO` no se ve afectado: error tracking es observabilidad, no uptime del producto
- Cuando crezca, se evalúa migrar a Sentry pago o quedarse en GlitchTip
- La sanitización es responsabilidad del developer de cada servicio (no automatizada)

## Superseded by

## Supersedes

---

**Keywords**: error-tracking, glitchtip, sentry, docker, observabilidad, sdk-compatible

**Date**: 2026-06-11

**Authors**: arquitectura App BiT
