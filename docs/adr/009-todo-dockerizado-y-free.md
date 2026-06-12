# ADR-009: Todo el stack dockerizado y free tier

## Status

Accepted

## Context

**Problem**: El proyecto es un MVP de hackathon con 1-2 personas y $0 de presupuesto inicial. Necesitamos definir una arquitectura que sea **gratis de operar** durante el MVP, pero que no cierre puertas para escalar después.

**Constraints**:
- Sin presupuesto para infraestructura
- 1-2 personas mantienen todo
- Mercado objetivo: Brasil + LATAM (latencia variable, picos impredecibles)
- Datos sensibles (chat de salud) requieren cumplimiento estricto
- Si el producto funciona, eventualmente hay que migrar a algo pago

**Options considered**:

1. **Servicios gestionados de pago** (AWS, GCP, Azure)
   - Pros: alta disponibilidad, replicación gestionada, backups automáticos
   - Cons: $$$ desde día 1, requiere conocimiento del provider, no se ajusta a 1-2 personas
2. **Kubernetes self-hosted**
   - Pros: portable, maduro
   - Cons: operacionalmente pesado, 1-2 personas no pueden mantenerlo
3. **Railway + Render + servicios free** con todo dockerizado
   - Pros: $0 en MVP, simple, deploy con git push
   - Cons: límites de free tier, hay que dockerizar todo manualmente
4. **Serverless puro** (Cloudflare Workers, Vercel, etc.)
   - Pros: escalado automático, $0 hasta cierto uso
   - Cons: latencia para cold start, vendor lock-in, difícil de hacer WebSocket con sticky sessions

## Decision

Elegimos **Opción 3**: **todo dockerizado** + Railway como plataforma principal + servicios free tier para lo que Railway no tiene (MongoDB Atlas, CloudAMQP, Backblaze B2, Cloudflare CDN, GlitchTip self-hosted).

**Razonamiento**:
- Railway free tier ($5 crédito/mes) es suficiente para MVP pequeño
- Dockerizar todo (servicios + DBs) da portabilidad: si migramos de Railway a Render, Fly.io, DigitalOcean, es `docker compose up`
- MongoDB Atlas M0 free es generoso (512MB), perfecto para chat
- CloudAMQP "Little Lemur" free tier (3 conexiones AMQP) es suficiente para 13 servicios
- Backblaze B2 10GB free alcanza para backups diarios durante 30 días
- GlitchTip self-hosted elimina dependencia de Sentry (que cobra por eventos)
- **El trade-off operacional es explícito**: backups manuales, sin HA, sin soporte — todo eso se documenta y se acepta

**Lo que está dockerizado**:
- Los 13 microservicios del backend
- PostgreSQL y MariaDB (contenedores custom, no gestionados)
- Redis (cache, sticky sessions)
- GlitchTip (error tracking)
- Prometheus, Grafana, Loki, Tempo, OpenTelemetry Collector
- dlq-worker (saga)
- nginx (api-gateway)

**Lo que NO se dockeriza** (es externo):
- 2 clusters MongoDB Atlas M0 (cuentas separadas, aislamiento físico)
- RabbitMQ (CloudAMQP free)
- Backups storage (Backblaze B2)
- CDN (Cloudflare)
- DNS (Cloudflare)
- SMTP (Mailgun/Resend)

**Restricciones de free tier que hay que diseñar alrededor**:
- Railway: ser eficiente en consumo de recursos (1 instancia por servicio, sized just-in-time)
- MongoDB Atlas M0: 512MB, sin replica set real → aceptar pérdida de datos mínima
- CloudAMQP: 3 conexiones AMQP → limita el número de consumers simultáneos
- Backblaze B2: 10GB → alcanza para 30 días de backups

## Consequences

**Positive**:
- $0 de costo de infraestructura en MVP
- Portabilidad: cualquier cloud que soporte Docker funciona
- Simple: 1-2 personas pueden mantener todo
- Aprendemos a hacer las cosas "a mano" (backups, monitoring) — conocimiento profundo
- Cuando crezca, sabemos exactamente qué upgrading nos da valor

**Negative**:
- Sin HA: si Railway se cae, todo se cae (no es inmediato arreglar)
- Backups manuales vía script (no gestionados)
- Sin replicación real de MongoDB Cluster A (M0 free)
- 3 conexiones AMQP limita el paralelismo de consumers
- Si supera el free tier, hay que pagar o migrar (decisión no trivial)

**Neutral**:
- Cuando el producto crezca, se migrará a infraestructura paga (RDS para PostgreSQL, Mongo Atlas M10+, RabbitMQ gestionado, etc.)
- La decisión es **reversible**: cambiar de Railway a Render es cambiar variables de entorno
- Los ADRs futuros se evalúan contra el criterio "es dockerizable y corre en free tier"

## Superseded by

## Supersedes

---

**Keywords**: docker, free-tier, railway, mongodb-atlas, cloudamqp, backblaze, hackathon

**Date**: 2026-06-11

**Authors**: arquitectura App BiT
