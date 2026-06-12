# ADR-010: Backups automatizados con script bash dockerizado + cron redundante

## Status

Accepted

## Context

**Problem**: Las DBs del proyecto (PostgreSQL, MariaDB, MongoDB x2) son dockerizadas en Railway, sin backups gestionados. Necesitamos política de backups automatizada que sea confiable, dockerizable y gratuita.

**Constraints**:
- 1-2 personas, no podemos operar 4 sistemas de backup distintos
- Free tier de Railway no incluye backups gestionados
- Datos sensibles (chat de salud) requieren retención de 90 días
- Si un solo lugar de ejecución falla, no podemos perder backups

**Options considered**:

1. **No hacer backups** (aceptar el riesgo en MVP)
   - Pros: cero trabajo
   - Cons: cualquier pérdida de datos es catastrófica, no apto para producción
2. **Scripts bash con cron local** (en el contenedor Railway)
   - Pros: simple
   - Cons: si el contenedor se cae, los backups también; SPOF
3. **Scripts bash dockerizados con cron redundante** (Railway + GitHub Actions)
   - Pros: dos lugares de ejecución, si uno falla el otro sube, dockerizado y portable
   - Cons: dos sistemas de cron que monitorear
4. **Servicio de backup pago** (Veeam, Acronis, etc.)
   - Pros: backups gestionados, soporte
   - Cons: $$, no dockerizable

## Decision

Elegimos **Opción 3**: scripts bash dockerizados (`infra/backups/`) con **cron redundante** desde dos lugares (Railway + GitHub Actions) y subida a **Backblaze B2** cifrado con GPG.

**Razonamiento**:
- Railway puede caerse (es infraestructura administrada por terceros), no podemos depender solo de su cron
- GitHub Actions tiene cron gratis (2.000 min/mes en repos privados) — alcanza para 1 job diario
- Si uno de los dos lugares falla, el otro tiene el dump más reciente
- Backblaze B2 (10 GB free) es suficiente para 30 días de backups de las 4 DBs
- GPG con clave en variable de entorno cifra el dump antes de subirlo (cifrado en tránsito y reposo)
- El script es **idempotente y verificable**: dump se hace, se verifica integridad, se sube, se limpia, se notifica

**Componentes**:
- `infra/backups/backup-postgres.sh` — script bash para PostgreSQL
- `infra/backups/backup-mariadb.sh` — script bash para MariaDB
- `infra/backups/backup-mongodb-general.sh` — script bash para MongoDB Cluster A
- `infra/backups/backup-mongodb-salud.sh` — script bash para MongoDB Cluster B (90 días de retención, bucket separado)
- `infra/backups/lib/common.sh` — funciones compartidas (cifrado GPG, upload B2, alertas Slack)
- `infra/backups/docker-compose.yml` — dockeriza los scripts
- `infra/backups/scheduler-railway` — cron en Railway (3am UTC)
- `.github/workflows/backup-cron.yml` — cron en GitHub Actions (3am UTC, redundante)

**Política de retención**:
| DB | Frecuencia | Retención | Storage |
|---|---|---|---|
| PostgreSQL | Diario (3am UTC) | 30 días | B2 bucket `appbit-backups` |
| MariaDB | Diario (3:30am UTC) | 30 días | B2 bucket `appbit-backups` |
| MongoDB Cluster A | Diario (4am UTC) | 30 días | B2 bucket `appbit-backups` |
| MongoDB Cluster B (salud) | Cada 6h | 90 días | B2 bucket `appbit-backups-salud` (separado) |
| Redis | NO se respalda | — | — |
| SQLite (sesiones) | NO se respalda | — | — |

**Alertas**:
- Slack webhook en cada ejecución (success, fail, fresh-backup-age)
- Job diario de healthcheck que verifica frescura del último backup
- P1 a on-call si el último backup tiene > 26h de antigüedad

## Consequences

**Positive**:
- Doble lugar de ejecución elimina SPOF
- Backups cifrados con GPG (cifrado en tránsito y reposo)
- Alertas automáticas a Slack si algo falla
- Scripts dockerizados y portables (si migramos de Railway, los scripts siguen funcionando)
- Monitoreo de frescura (healthcheck diario)

**Negative**:
- Hay que mantener 4 scripts bash + 1 lib compartido
- Dos sistemas de cron (Railway + GitHub Actions) que monitorear
- El script de MongoDB Cluster B es más complejo (mongodump con --oplog, cifrado, bucket separado)
- Si el bucket B2 se cae, no hay backups hasta que vuelva
- La verificación de integridad (`gunzip -t`) puede no detectar corrupciones lógicas

**Neutral**:
- El restore NO se automatiza (es proceso manual con runbook documentado)
- Las pruebas de restore se hacen trimestralmente (no automáticamente)
- Cuando se migre a infraestructura paga, se evaluará reemplazar por backups gestionados

## Superseded by

## Supersedes

---

**Keywords**: backups, bash, docker, cron, railway, github-actions, backblaze, gpg, disaster-recovery

**Date**: 2026-06-11

**Authors**: arquitectura App BiT
