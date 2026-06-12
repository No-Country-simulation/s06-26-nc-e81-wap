# Despliegue — App BiT

> Documento vivo. Define cómo se deploya, configura, monitorea y opera App BiT en producción.
> Lee primero `distribucion-db.md`, `topologia-servicios.md` y `seguridad-compliance.md`.

---

## 0. Restricciones globales (decisión de equipo)

- **Todo dockerizado**: cada servicio, cada DB, cada herramienta de infra corre como contenedor Docker
- **Todo free tier**: Railway free, MongoDB Atlas M0 free (x2), GitHub Actions free tier, Backblaze B2 o Cloudflare R2 free, GlitchTip self-hosted
- **Sin Kubernetes en MVP** — Railway maneja todo el ciclo de vida
- **Sin servicios gestionados de pago** — todos los trade-offs operacionales se aceptan como costo de mantener $0 en infra
- **Backups automatizados con script bash dockerizado** (no dependemos de backups gestionados)

Estas decisiones se mantienen hasta que el producto justifique infraestructura paga (ver §15).

---

## 1. Plataforma objetivo

**Railway** como plataforma principal de deploy para MVP, con fallback documentado a **Render**.

### Por qué Railway

- Soporta deploy de **contenedores custom dockerizados** (no solo runtime gestionado)
- Deploy desde GitHub sin config adicional
- Variables de entorno cifradas
- Dominios custom con TLS automático
- Free tier: $5 de crédito/mes por cuenta, suficiente para MVP pequeño
- Compatible con Docker Compose, podemos portar entre providers

### Por qué NO (todavía) Kubernetes

- 13 microservicios + 4 motores de DB es manejable en Railway
- K8s sumaría complejidad operacional que un equipo de hackathon no puede mantener
- Si el producto crece, se migra a K8s o ECS con Terraform
- Los manifests de Docker son portables a cualquier cloud

### Limitaciones conocidas de Railway free tier que hay que diseñar alrededor

- **$5 de crédito/mes por cuenta** — hay que ser eficiente en consumo
- **Límites de memoria por servicio** — ajustar tamaño de pool de conexiones
- **Sin multi-región** — para LATAM+Angola se evalúa Fly.io o Render Multi-Region
- **Sin bases de datos gestionadas free para MariaDB y PostgreSQL** — corren como contenedores custom dockerizados
- **WebSocket sticky sessions** — requiere config especial (Redis dockerizado compartido, ver §6.2)

---

## 2. Topología de entornos

| Entorno | Propósito | URL | Rama deploy | Datos |
|---|---|---|---|---|
| **local** | Desarrollo en máquina propia | `localhost:PUERTO` | cualquier feature branch | SQLite + contenedores Docker locales |
| **preview** | PR preview, validación antes de merge | `pr-{N}.preview.appbit.com` | PR abierto | DB efímera, seed mínimo |
| **staging** | Integración continua, demos internos | `staging.appbit.com` | `dev` | DBs compartidas, datos sintéticos |
| **production** | Usuarios reales | `appbit.com` | `main` (solo main, no feat branches) | DBs gestionadas, datos reales |

### Reglas

- **Local**: cada dev levanta lo que necesita con `docker-compose.dev.yml`
- **Preview**: cada PR abre un entorno temporal con dominio público
- **Staging**: deploy automático al mergear a `dev`, corre smoke tests post-deploy
- **Production**: deploy manual desde `main` con tag semántico, requiere aprobación de 1 persona

---

## 3. Estructura del monorepo

App BiT es un **monorepo** con 13+ servicios. Estructura actual confirmada con el equipo:

```
s06-26-nc-e81-wap/
├── client/                      # PWA (frontend)
├── server/                      # Monorepo backend con 13 sub-carpetas
│   ├── auth/                    # Servicio de autenticación
│   ├── perfil/                  # Servicio de perfil
│   ├── orientar/                # Servicio /orientar
│   ├── empleabilidad/           # Servicio de vacantes
│   ├── formaciones/             # Servicio de cursos
│   ├── experiencias/            # Servicio de eventos
│   ├── mentor/                  # Servicio de mentorías
│   ├── salud/                   # Servicio de salud-mental
│   ├── geo/                     # Servicio de geolocalización
│   ├── i18n/                    # Servicio de i18n
│   ├── chat-mentoria/           # Chat mentor↔usuario
│   ├── chat-agente-orientar/    # Chat con agente de orientación
│   ├── chat-agente-salud/       # Chat con agente de salud (cluster aislado)
│   ├── shared/                  # Código compartido (tipos, utils, errores)
│   ├── Dockerfile               # Un Dockerfile multi-stage para todos
│   └── docker-entrypoint.sh     # Decide qué servicios levantar
├── landing/                     # Sitio público marketing
├── ai/                          # Prompts y configs de agentes IA
├── doc/                         # Documentación
├── infra/
│   ├── docker/
│   │   ├── docker-compose.dev.yml        # Postgres, MariaDB, Mongo, Redis, GlitchTip
│   │   └── docker-compose.preview.yml
│   ├── mongodb/                 # Migraciones de Mongo (índices)
│   ├── backups/                 # Scripts bash de backup
│   │   ├── backup-postgres.sh
│   │   ├── backup-mariadb.sh
│   │   ├── backup-mongodb-general.sh
│   │   ├── backup-mongodb-salud.sh
│   │   └── lib/                 # Funciones compartidas
│   ├── seeds/                   # Datos iniciales
│   ├── observability/
│   │   ├── prometheus/
│   │   ├── grafana/
│   │   └── otel-collector/
│   └── scripts/                 # Scripts operativos
├── .github/
│   └── workflows/               # CI/CD
└── README.md
```

**Decisión de equipo**: mantener `server/` como **monorepo único** con un solo `Dockerfile` multi-stage. Con 1-2 personas en MVP, refactorizar a `services/<svc>/` separados es over-engineering. La migración se hace cuando el equipo pase de 3+ personas o haya > 20 servicios.

El `docker-entrypoint.sh` decide en runtime qué servicios levantar basándose en env vars (`ENABLED_SERVICES=auth,perfil,orientar`), lo que permite:
- Modo "todo" en staging
- Modo "subset" en preview por PR
- Modo "uno" en testing local

---

## 4. Dockerfiles por servicio

### 4.1 Patrón base

```dockerfile
# Multi-stage build, imagen mínima final
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM gcr.io/distroless/nodejs20-debian12 AS runtime
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
USER 1000  # no-root
EXPOSE 8001
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD ["node", "dist/health.js"]
ENTRYPOINT ["node", "dist/main.js"]
```

### 4.2 Variantes por stack

- **Node.js (TypeScript)**: distroless, multi-stage
- **Python (FastAPI)**: `python:3.12-slim`, multi-stage
- **Go (si algún servicio lo requiere)**: `gcr.io/distroless/static`, compilación estática

### 4.3 Hardening obligatorio

- [ ] Imagen base mínima (alpine, distroless, slim)
- [ ] Usuario no-root (UID 1000)
- [ ] Sin `apt-get`, sin `curl`, sin `wget` en runtime
- [ ] Sin secretos en la imagen
- [ ] `HEALTHCHECK` configurado
- [ ] `LABEL` con versión, commit SHA, fecha
- [ ] Escaneo Trivy en CI, falla si hay CRITICAL

---

## 5. Variables de entorno

### 5.1 Convención

- **Prefijo por servicio**: `AUTH_DB_URL`, `PERFIL_DB_URL`, `ORIENTAR_DB_URL`
- **Secreto**: NUNCA en `.env` commiteado, siempre en Railway/Render secrets
- **Documentación**: cada servicio tiene un `.env.example` con todas las variables
- **Validación al boot**: schema con Zod/Pydantic, el servicio falla si falta variable crítica

### 5.2 Variables comunes a todos

| Variable | Descripción | Ejemplo |
|---|---|---|
| `NODE_ENV` | Ambiente | `production` |
| `SERVICE_NAME` | Nombre del servicio (logs) | `auth-svc` |
| `SERVICE_VERSION` | Versión semántica | `1.2.3` |
| `LOG_LEVEL` | Nivel de logging | `info` |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | Endpoint de tracing | `https://otel.appbit.com` |
| `RABBITMQ_URL` | URL del bus de eventos | `amqps://...` |
| `REDIS_URL` | Cache de blacklist JWT | `rediss://...` |
| `JWT_PUBLIC_KEY` | Clave pública RS256 para validar tokens | (PEM en una línea) |
| `INTERNAL_MTLS_CERT` | Certificado cliente mTLS | (PEM) |
| `INTERNAL_MTLS_KEY` | Llave cliente mTLS | (PEM) |

### 5.3 Variables por servicio

#### `auth-svc`
| Variable | Descripción |
|---|---|
| `AUTH_DB_URL` | PostgreSQL |
| `AUTH_JWT_PRIVATE_KEY` | RS256 privada (secreto) |
| `AUTH_JWT_PUBLIC_KEY` | RS256 pública (compartida con todos) |
| `AUTH_REFRESH_TOKEN_TTL` | Segundos, default `604800` (7 días) |
| `AUTH_ACCESS_TOKEN_TTL` | Segundos, default `3600` (1h) |
| `AUTH_SESSIONS_SQLITE_PATH` | Path al archivo SQLite |
| `AUTH_KMS_KEY_ID` | Key para cifrar refresh tokens hasheados |

#### `salud-svc`
| Variable | Descripción |
|---|---|
| `SALUD_DB_URL` | PostgreSQL |
| `SALUD_KMS_KEY_ID` | Key para cifrar logs de crisis |
| `SALUD_CVV_TABLE_PATH` | Tabla JSON con números de CVV por país |

#### `chat-agente-salud-svc` (aislado)
| Variable | Descripción |
|---|---|
| `CHAT_SALUD_MONGO_URL` | Cluster MongoDB aislado |
| `CHAT_SALUD_KMS_KEY_ID` | Key para cifrado de documentos |
| `CHAT_SALUD_SAFETY_LAYER_URL` | Endpoint del safety layer |
| `CHAT_SALUD_SIEM_ENDPOINT` | Sink de auditoría |
| `CHAT_SALUD_ALLOWED_IPS` | Allowlist de IPs permitidas |

> **Nota crítica**: `chat-agente-salud-svc` se deploya en un **proyecto Railway separado** o con network policies que lo aíslan del resto. Las credenciales MongoDB son distintas y viven en un Vault dedicado.

### 5.4 Gestión de secretos

| Secreto | Dónde vive | Quién accede |
|---|---|---|
| Claves JWT | Railway secrets del proyecto auth | Solo `auth-svc` |
| DB URLs | Railway secrets por servicio | Solo el servicio dueño |
| API keys de LLMs (OpenAI, etc.) | Railway secrets del proyecto | Solo servicios de chat con agentes |
| Certificados mTLS | Vault o Railway secrets | Servicios internos |
| Claves KMS | NUNCA en env vars, se resuelven vía SDK del cloud | Servicios con datos cifrados |
| Credenciales MongoDB salud | **Vault dedicado** | Solo `chat-agente-salud-svc` + `salud-svc` |

---

## 6. Configuración de Railway

### 6.1 Proyecto principal

Todo dockerizado, en una sola cuenta Railway (free tier $5/mes crédito):

```
proyecto: appbit-prod (cuenta Railway #1)
├── api-gateway (Nginx + Lua, contenedor custom)
├── server (monorepo con 13 servicios, ENABLED_SERVICES controla cuáles)
│   ├── auth
│   ├── perfil
│   ├── orientar
│   ├── empleabilidad
│   ├── formaciones
│   ├── experiencias
│   ├── mentor
│   ├── salud
│   ├── geo
│   ├── i18n
│   ├── chat-mentoria
│   ├── chat-agente-orientar
│   ├── chat-agente-salud (sigue en monorepo, config distinto por env)
│   ├── notification
│   └── audit
├── chat-gateway (Node.js, contenedor custom)
├── postgres (contenedor custom, ver §6.4)
├── mariadb (contenedor custom, ver §6.4)
├── redis (contenedor custom, ver §6.4)
├── glitchtip (contenedor custom, ver §10.1)
└── dlq-worker (contenedor custom, ver topologia §7.5)
```

Eventos (RabbitMQ) en **CloudAMQP free tier** (plan "Little Lemur", 3 conexiones concurrentes).

### 6.2 Servicios de DB y cache

| DB / Cache | Servicio | Notas |
|---|---|---|
| PostgreSQL | **Contenedor custom dockerizado en Railway** | Backups vía script (ver §9), volumen persistente |
| MariaDB | **Contenedor custom dockerizado en Railway** | Backups vía script (ver §9), volumen persistente |
| **MongoDB Cluster A (chat_general)** | **MongoDB Atlas M0 free, cuenta Atlas #1** | Chat mentor + chat agente orientar |
| **MongoDB Cluster B (chat_salud)** | **MongoDB Atlas M0 free, cuenta Atlas #2** | **Aislamiento físico real**, IP allowlist estricto |
| Redis | **Contenedor custom dockerizado en Railway** | Sticky sessions, blacklist JWT, rate limit |
| GlitchTip | **Contenedor custom dockerizado en Railway** | Error tracking (ver §10.1) |
| Backblaze B2 | **Externo, free tier 10 GB** | Storage de backups cifrados (ver §9) |
| Cloudflare R2 | **Externo, free tier 10 GB** | Alternativa a B2 para backups |
| SQLite | NO se deploya — vive en el contenedor del servicio | Volumen persistente montado |

### 6.3 Sticky sessions para WebSocket con Redis dockerizado

Railway no soporta sticky sessions nativamente. Implementación MVP: **Redis dockerizado compartido**.

```yaml
# docker-compose.yml (extracto para chat-gateway)
chat-gateway:
  image: appbit/chat-gateway:latest
  environment:
    - REDIS_URL=redis://redis:6379
    - STICKY_SESSION_TTL=3600
```

Lógica del gateway:
```typescript
// En handshake de nueva conexión WSS
const backendId = await redis.get(`user:${userId}:backend`);
if (backendId) {
  // enrutar a esa instancia
} else {
  // elegir backend (round-robin), guardar en Redis con TTL
  const chosen = await pickBackend();
  await redis.set(`user:${userId}:backend`, chosen, 'EX', 3600);
}
```

**Trade-off**: Redis es SPOF en MVP (instancia única). Si se cae, los usuarios reconectan y se reasignan automáticamente. La ventana de inconsistencia es de segundos. Aceptable para MVP.

**Migración futura**: cuando se justifique, pasar a Redis Sentinel o Redis Cluster (3+ nodos). Sigue dockerizado y free si se monta sobre 3 Railway projects o se migra a un VPS.

### 6.4 MariaDB y PostgreSQL como contenedores custom

```dockerfile
# infra/docker/mariadb/Dockerfile
FROM mariadb:11.4
COPY ./conf.d/ /etc/mysql/conf.d/
COPY ./init/ /docker-entrypoint-initdb.d/
HEALTHCHECK --interval=10s --timeout=3s \
  CMD mysqladmin ping -h localhost -u root
VOLUME ["/var/lib/mysql"]
```

```dockerfile
# infra/docker/postgres/Dockerfile
FROM postgres:15-alpine
COPY ./init/ /docker-entrypoint-initdb.d/
COPY ./conf.d/ /etc/postgresql/conf.d/
HEALTHCHECK --interval=10s --timeout=3s \
  CMD pg_isready -U postgres
VOLUME ["/var/lib/postgresql/data"]
```

**Importante**:
- Volumen persistente en Railway para `/var/lib/...`
- Configurar `max_connections` y buffers según memoria asignada
- **Backups vía script bash** (NO dependemos de backups gestionados), ver §9
- Replicación: en MVP, single instance; documentar migración a RDS cuando crezca

### 6.5 MongoDB Atlas — dos cuentas separadas

**Cuenta Atlas #1** (proyecto: `appbit-general`):
- Cluster M0 free
- Databases: `chat_mentoria`, `chat_agente_orientar`
- IP allowlist: IPs de los servicios que la consumen
- Credenciales dedicadas (usuario `appbit-general`)

**Cuenta Atlas #2** (proyecto: `appbit-salud`):
- Cluster M0 free
- Database: `chat_salud_mental`
- **IP allowlist MUY estricta**: solo las IPs de `chat-agente-salud` y `salud-svc`
- Credenciales dedicadas, distintas del cluster general
- **NO comparte organización ni equipo Atlas con la cuenta #1**
- Acceso humano: solo admin_clinico con MFA

Aislamiento físico real entre los dos clusters.

---

## 7. CI/CD con GitHub Actions

### 7.1 Workflows

```yaml
# .github/workflows/ci.yml (en cada PR)
name: CI
on: [pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test
      - run: npm run test:e2e
      - name: Trivy scan
        uses: aquasecurity/trivy-action@master
        with:
          severity: 'CRITICAL,HIGH'
          exit-code: '1'
      - name: SonarQube
        uses: sonarcloud/github-action@v2
      # k6 shallow: smoke test de carga en cada PR
      # 2-3 min, 10-50 usuarios virtuales, solo path crítico
      # Detecta regresiones obvias sin consumir mucho CI
      - name: k6 shallow smoke
        uses: grafana/k6-action@v0.3.1
        with:
          filename: infra/load-tests/shallow.js
          flags: --vus 10 --duration 60s
        env:
          BASE_URL: http://localhost:8080
```

```yaml
# .github/workflows/load-test-deep.yml (mensual, manual o programado)
name: Load Test Deep
on:
  workflow_dispatch:  # manual desde GitHub UI
  schedule:
    - cron: '0 6 1 * *'  # día 1 de cada mes, 6am UTC
jobs:
  load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: k6 deep contra staging
        uses: grafana/k6-action@v0.3.1
        with:
          filename: infra/load-tests/deep.js
          flags: --vus 500 --duration 10m
        env:
          BASE_URL: ${{ secrets.STAGING_URL }}
      - name: Publicar resultados
        uses: actions/upload-artifact@v4
        with:
          name: k6-deep-results
          path: results/
```

```yaml
# .github/workflows/backup-cron.yml (backup redundante desde GitHub Actions)
name: Backup (redundancia GitHub)
on:
  schedule:
    - cron: '0 3 * * *'  # diario 3am UTC
jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Ejecutar backups dockerizados
        run: |
          docker compose -f infra/docker/docker-compose.backup.yml up
        env:
          BACKUP_PASSPHRASE: ${{ secrets.BACKUP_PASSPHRASE }}
          B2_KEY_ID: ${{ secrets.B2_KEY_ID }}
          B2_APP_KEY: ${{ secrets.B2_APP_KEY }}
```

```yaml
# .github/workflows/deploy-staging.yml
name: Deploy Staging
on:
  push:
    branches: [dev]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build and push image del monorepo
        run: |
          docker build -t ghcr.io/appbit/server:${{ github.sha }} server/
          docker push ghcr.io/appbit/server:${{ github.sha }}
      - name: Deploy to Railway
        uses: bervProject/railway-deploy@main
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
```

```yaml
# .github/workflows/deploy-prod.yml
name: Deploy Prod
on:
  push:
    tags: ['v*']  # solo tags semánticos
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production  # requiere aprobación manual en GitHub
    steps:
      # ... similar a staging pero con tag y aprobación
```

### 7.2 Pipeline de un cambio

```
PR abierto
  ├── CI: lint + test + typecheck + trivy
  ├── Preview deploy: railway up --service <svc>-preview
  └── Code review (2 approvals)

PR mergeado a dev
  ├── Staging deploy automático
  ├── Smoke tests post-deploy
  └── Notificación a Slack #deploys

Tag v* pusheado
  ├── Production deploy (con aprobación)
  ├── Smoke tests
  ├── Health checks 5 min
  └── Rollback automático si falla
```

---

## 8. Migraciones de DB

### 8.1 PostgreSQL

- **Herramienta**: `node-pg-migrate` o `prisma migrate` (elegir una por servicio)
- **Versionado**: archivos `NNNN_nombre.sql` con timestamp + descripción
- **Aplicación**: job en cada deploy que aplica migraciones pendientes antes de levantar el servicio
- **Rollback**: cada migración tiene su `down.sql`, pero **rollback es manual** (no se hace en deploy automático)

### 8.2 MariaDB

- **Herramienta**: `flyway` o `golang-migrate`
- Mismo patrón que PostgreSQL

### 8.3 MongoDB

- **Schema-less por diseño**, pero `indexes` se crean explícitamente
- **Herramienta**: scripts en `infra/mongodb/migrations/` que crean índices con `db.collection.createIndex()`
- **Versionado**: el script es idempotente (verifica si el índice existe antes de crearlo)

### 8.4 Reglas

- [ ] Toda migración es **forward-only** en producción
- [ ] Backward-compatible por al menos 1 release (para rollback)
- [ ] Probada en staging con datos sintéticos del tamaño de producción
- [ ] Si toca > 1 millón de filas: ejecutar en batch con throttling

---

## 9. Backups y disaster recovery

### 9.1 Política de backups (todo vía script dockerizado)

Como Railway no incluye backups gestionados para nuestras DBs dockerizadas, **toda la política de backups la gestionamos nosotros con scripts bash dockerizados**.

| DB | Frecuencia | Retención | Almacenamiento | Cifrado |
|---|---|---|---|---|
| PostgreSQL (dockerizado) | Diario (3am UTC) | 30 días | Backblaze B2 (free 10 GB) | GPG con clave en env |
| MariaDB (dockerizado) | Diario (3:30am UTC) | 30 días | Backblaze B2 | GPG |
| MongoDB Cluster A (Atlas M0) | Diario (4am UTC) | 30 días | Backblaze B2 | GPG |
| **MongoDB Cluster B (salud, Atlas M0)** | **Cada 6h** | **90 días** | **Bucket B2 separado** | **GPG con clave distinta** |
| Redis (dockerizado) | NO se respalda (es cache) | N/A | N/A | N/A |
| SQLite (sesiones) | NO se respalda (se reconstruye) | N/A | N/A | N/A |

### 9.2 Scripts de backup (dockerizados)

**Ubicación**: `infra/backups/` con un script por DB y un `lib/` compartido.

**Ejemplo: backup PostgreSQL**:

```bash
#!/bin/bash
# infra/backups/backup-postgres.sh
set -euo pipefail

source /opt/backup/lib/common.sh

FECHA=$(date -u +%Y%m%d-%H%M%S)
DUMP="/tmp/postgres-${FECHA}.sql.gz"
RETENTION_DAYS=30
B2_BUCKET="appbit-backups"

# 1. Dump consistente con transacciones activas
docker exec postgres pg_dump -U postgres --single-transaction \
  | gzip > "$DUMP"

# 2. Verificar integridad del dump
if ! gunzip -t "$DUMP"; then
  send_slack_alert ":fire: Backup PostgreSQL corrupto: $FECHA"
  exit 1
fi

# 3. Cifrar con GPG (clave en env var)
echo "$BACKUP_PASSPHRASE" | gpg --batch --yes --passphrase-fd 0 \
  -c "$DUMP"
DUMP="${DUMP}.gpg"

# 4. Subir a Backblaze B2
b2 upload-file "$B2_BUCKET" "$(basename $DUMP)" "$DUMP" \
  --quiet || { send_slack_alert ":fire: Fallo subiendo a B2: $FECHA"; exit 1; }

# 5. Limpiar local
rm -f "$DUMP"

# 6. Limpiar backups remotos > 30 días
cleanup_old_backups "$B2_BUCKET" "postgres-" $RETENTION_DAYS

send_slack_info ":white_check_mark: Backup PostgreSQL OK: $FECHA ($(du -h $DUMP | cut -f1))"
```

**Idéntico patrón** para `backup-mariadb.sh` (usa `mariadb-dump`), `backup-mongodb-general.sh` y `backup-mongodb-salud.sh` (usan `mongodump --oplog`).

### 9.3 Redundancia del backup: 2 lugares de ejecución

El backup se ejecuta desde **dos lugares** para evitar SPOF:

1. **Cron en el contenedor Railway** (3am UTC) — corre si Railway está vivo
2. **GitHub Actions** (`workflow_dispatch` + `schedule` diario) — corre si GitHub está vivo (más probable)

Ambos suben al mismo bucket B2, así que si uno falla, el otro tiene el dump más reciente. La deduplicación se hace por nombre de archivo con timestamp.

### 9.4 Alertas y monitoreo de backups

- **Alertas Slack**:
  - `:fire:` si un backup falla (inmediato)
  - `:warning:` si no se ejecutó un backup en las últimas 26h (alerta diaria)
  - `:white_check_mark:` confirmación de éxito (opcional, configurable)
- **Healthcheck de frescura**:
  - GitHub Action diario que verifica que el último backup en B2 tiene < 26h de antigüedad
  - Si falla: alerta a Slack `#oncall`
- **Métricas Prometheus**:
  - `backup_last_success_timestamp` (gauge, por DB)
  - `backup_size_bytes` (gauge, último dump)
  - `backup_duration_seconds` (gauge, último dump)

### 9.5 RTO / RPO

| Servicio | RTO (tiempo de recuperación) | RPO (pérdida de datos máxima) |
|---|---|---|
| Auth | 15 min | 24 horas (1 backup diario) |
| Perfil | 30 min | 24 horas |
| Orientar | 1 hora | 24 horas |
| Empleabilidad | 1 hora | 24 horas |
| Salud | 1 hora | 24 horas |
| Chat mentor | 4 horas | 24 horas |
| **Chat salud** | **30 min** | **6 horas** (4 backups/día) |

### 9.3 Runbook de DR

```bash
# 1. Verificar estado de las DBs
./scripts/check-db-health.sh

# 2. Si una DB está caída, levantar desde backup
./scripts/restore-postgres.sh --from latest --env production

# 3. Validar que los servicios reconectan
./scripts/health-check-all-services.sh

# 4. Si los datos están corruptos, levantar DB paralela y comparar
./scripts/verify-data-integrity.sh

# 5. Comunicación a usuarios (si aplica)
./scripts/send-status-notification.sh "Restauración completada"
```

### 9.4 Pruebas de restore

- **Trimestral**: ejecutar restore completo en ambiente de DR
- **Mensual**: restore parcial de una tabla/colección específica
- **Documentado**: tiempo medido, issues encontrados, mejora continua

---

## 10. Observabilidad

### 10.1 Stack (todo dockerizado y free)

| Capa | Herramienta | Costo | Notas |
|---|---|---|---|
| Logs | **Loki + Grafana** (dockerizado) | $0 | Mismo contenedor que Grafana |
| Métricas | **Prometheus + Grafana** (dockerizado) | $0 | Self-host, 30 días retención |
| Tracing | **OpenTelemetry + Tempo** (dockerizado) | $0 | OpenTelemetry collector también dockerizado |
| Alertas | **Grafana Alerts** → Slack/PagerDuty | $0 (Slack) | PagerDuty solo si se justifica |
| Uptime monitoring | **BetterUptime** (free tier) | $0 | Status page pública incluida |
| Error tracking | **GlitchTip** (dockerizado) | $0 | Self-hosted, compatible con SDK de Sentry, sin límite de eventos |
| APM | **OpenTelemetry** (mismo stack de tracing) | $0 | No Datadog ni Elastic APM de pago |
| Backups | **Script bash + Backblaze B2** | $0 | 10 GB free en B2 |

```yaml
# docker-compose.yml (extracto de observabilidad)
prometheus:
  image: prom/prometheus:latest
  volumes:
    - ./observability/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
    - prometheus-data:/prometheus
  ports: ["9090:9090"]

grafana:
  image: grafana/grafana:latest
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD}
  volumes:
    - grafana-data:/var/lib/grafana
    - ./observability/grafana/dashboards:/etc/grafana/dashboards
  ports: ["3000:3000"]
  depends_on: [prometheus, loki]

loki:
  image: grafana/loki:latest
  volumes:
    - loki-data:/loki
  ports: ["3100:3100"]

tempo:
  image: grafana/tempo:latest
  volumes:
    - tempo-data:/var/tempo
  ports: ["3200:3200"]

otel-collector:
  image: otel/opentelemetry-collector-contrib:latest
  volumes:
    - ./observability/otel-collector/config.yaml:/etc/otelcol/config.yaml
  ports: ["4317:4317", "4318:4318"]

glitchtip:
  image: glitchtip/glitchtip:latest
  depends_on:
    - postgres
  environment:
    - DATABASE_URL=postgres://glitchtip:${GLITCHTIP_DB_PASSWORD}@postgres/glitchtip
    - SECRET_KEY=${GLITCHTIP_SECRET_KEY}
  volumes:
    - glitchtip-data:/code/data
  ports: ["8000:8000"]
```

### 10.2 Dashboards obligatorios

| Dashboard | Métricas |
|---|---|
| **Overview** | Requests/s, error rate, p99 latency, servicios activos |
| **Por servicio** | RED metrics, uso de memoria, conexiones a DB |
| **DB** | Conexiones activas, queries lentas, espacio en disco |
| **Eventos** | Lag en RabbitMQ, dead letter queue size, throughput |
| **Chat** | Conexiones WebSocket activas, mensajes/min, latencia de entrega |
| **Salud-mental** | Check-ins/día, derivaciones CVV, alertas de crisis (GRÁFICO SEPARADO con acceso restringido) |
| **Negocio** | Registros, orientaciones generadas, postulaciones, contratos |
| **Backups** | `backup_last_success_timestamp` por DB, tamaño, duración |

### 10.3 Alertas críticas

| Alerta | Severidad | Canal |
|---|---|---|
| Servicio caído > 2 min | P1 | Slack + (PagerDuty si se justifica) |
| Error rate > 5% en 5 min | P1 | Slack |
| DB primaria caída | P0 | Slack + llamada al on-call |
| **Evento `salud.crisis.detectada`** | **P0** | **Slack #salud-guardia + on-call** |
| Lag en RabbitMQ > 10k mensajes | P2 | Slack |
| Disco DB > 80% | P2 | Slack |
| Certificado TLS expira en < 14 días | P1 | Slack + ticket automático |
| Cualquier acceso a MongoDB salud desde IP no permitida | **P0** | **Slack #security + on-call** |
| **Backup no se ejecutó en últimas 26h** | **P1** | **Slack** |
| **GlitchTip caído** | P2 | Slack |

### 10.4 SLOs (revisados para MVP dockerizado)

Para un stack dockerizado en Railway free tier sin HA, los SLOs originales (99.95%) eran inalcanzables. SLOs revisados, realistas para 1-2 personas:

| Servicio | SLO disponibilidad | Error budget/mes | Justificación |
|---|---|---|---|
| Auth | **99.5%** | 3h 36min | Crítico pero realista sin HA |
| Salud-mental | **99.5%** | 3h 36min | Crítico, mismo nivel que auth |
| Orientar | **99%** | 7h 18min | Acepta degradación |
| Chat (todas las features) | **99%** | 7h 18min | Reconexión del cliente tolera caídas cortas |
| Empleabilidad | **99%** | 7h 18min | No crítico para safety |
| Formaciones | **99%** | 7h 18min | Idem |
| Experiencias | **99%** | 7h 18min | Idem |
| Geolocalización | **99%** | 7h 18min | Idem |
| i18n | **99.5%** | 3h 36min | Bajo costo, alto beneficio |

**Nota sobre SLOs de 99.95% originales**: eran aspiracionales para cuando tengamos HA real (Sentinel, replica sets, multi-región). El SLO objetivo de madurez operativa es 99.95%, pero el SLO **comprometido con usuarios** en MVP es 99.5% para servicios críticos y 99% para el resto.

### 10.5 Load testing (k6)

Estrategia híbrida que equilibra disciplina y costo de CI:

| Tipo | Cuándo | Duración | Usuarios virtuales | Costo CI | Detecta |
|---|---|---|---|---|---|
| **k6 shallow** (smoke de carga) | En **cada PR** | 60s | 10-50 | ~150 min/mes | Regresiones obvias de performance en el path crítico (login, /orientar, /salud) |
| **k6 deep** (carga real) | **Mensual o pre-release** | 10 min | 500-1000 | Manual / workflow_dispatch | Capacidad real, problemas de concurrencia, memory leaks |

**Path crítico cubierto por k6 shallow**:
- POST /auth/login
- POST /auth/register
- GET /usuarios/me
- POST /orientar
- POST /salud
- GET /cursos (catalogo)

**k6 deep cubre**:
- Todos los endpoints del shallow
- Múltiples conversaciones de chat concurrentes
- Escenarios mixtos (registro + orientación + postulación en la misma sesión)

```javascript
// infra/load-tests/shallow.js
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 10,
  duration: '60s',
  thresholds: {
    http_req_duration: ['p(95)<500'],  // p95 < 500ms
    http_req_failed: ['rate<0.01'],    // < 1% errores
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';

export default function () {
  // 80% GET catalogos, 20% escrituras
  if (Math.random() < 0.8) {
    const res = http.get(`${BASE_URL}/cursos`);
    check(res, { 'status 200': (r) => r.status === 200 });
  } else {
    const res = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
      email: `test${__VU}@appbit.com`,
      password: 'test1234',
    }), { headers: { 'Content-Type': 'application/json' } });
    check(res, { 'login ok': (r) => r.status === 200 });
  }
}
```

---

## 11. On-call y respuesta a incidentes

### 11.1 Rotación

- **Primario**: 1 persona, rotación semanal
- **Secundario**: 1 persona, soporte si el primario no responde en 5 min
- **Manager de incidente**: rota según severidad (P0/P1 → tech lead, P2/P3 → primario)

### 11.2 Herramientas

- **PagerDuty** o **OpsGenie** para pager
- **Slack** `#incidentes` para coordinación
- **Zoom** o **Google Meet** para bridge de voz (P0/P1)
- **Status page** pública: status.appbit.com (Statuspage.io o BetterUptime)

### 11.3 Comunicación

- **Interno**: Slack `#incidentes` con updates cada 15 min durante P0/P1
- **Usuarios**: status page actualizada cuando el impacto es > 15 min
- **Post-mortem**: obligatorio para P0/P1, en `doc/postmortem/AAAA-MM-DD-incidente.md`

---

## 12. Performance y capacidad

### 12.1 Estimaciones MVP (1k usuarios activos)

| Servicio | CPU | RAM | Conexiones DB |
|---|---|---|---|
| auth-svc | 0.5 vCPU | 512 MB | 20 |
| perfil-svc | 0.25 vCPU | 256 MB | 10 |
| orientar-svc | 1 vCPU | 1 GB | 30 |
| empleabilidad-svc | 0.5 vCPU | 512 MB | 20 |
| formaciones-svc | 0.25 vCPU | 256 MB | 10 |
| experiencias-svc | 0.25 vCPU | 256 MB | 10 |
| mentor-core-svc | 0.25 vCPU | 256 MB | 10 |
| salud-svc | 0.5 vCPU | 512 MB | 20 |
| geo-svc | 0.5 vCPU | 512 MB | 15 |
| i18n-svc | 0.1 vCPU | 128 MB | 5 |
| chat-mentoria-svc | 1 vCPU | 1 GB | 30 (Mongo) |
| chat-agente-orientar-svc | 1 vCPU | 1 GB | 30 (Mongo) |
| chat-agente-salud-svc | 0.5 vCPU | 512 MB | 15 (Mongo aislado) |
| api-gateway | 0.5 vCPU | 256 MB | 0 |
| chat-gateway | 0.5 vCPU | 512 MB | 0 |

**Total estimado**: ~8 vCPU, ~7.5 GB RAM

### 12.2 Crecimiento a 10k usuarios

- Escalar horizontalmente los servicios con más carga (orientar, chat)
- Escalar verticalmente las DBs
- Considerar read replicas para PostgreSQL principal
- Sharding de MongoDB Cluster A si pasa de 100GB

### 12.3 Load testing

- **Mensual**: ejecutar k6 o Locust contra staging
- **Escenarios**: login masivo, generación de 1000 orientaciones concurrentes, 500 conversaciones de chat simultáneas
- **SLOs validados**: latencias bajo carga deben cumplir los objetivos
- **Reportes**: comparativa mes a mes, alerta si degradación > 10%

---

## 13. Ambientes de desarrollo local

### 13.1 `docker-compose.dev.yml`

Levanta todas las dependencias locales:

```yaml
version: '3.9'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: dev
    ports: ["5432:5432"]
    volumes: ["./.data/postgres:/var/lib/postgresql/data"]

  mariadb:
    image: mariadb:11.4
    environment:
      MARIADB_ROOT_PASSWORD: dev
    ports: ["3306:3306"]
    volumes: ["./.data/mariadb:/var/lib/mysql"]

  mongodb-cluster-a:
    image: mongo:7
    ports: ["27017:27017"]
    # replica set init en entrypoint
    command: ["--replSet", "rs0", "--bind_ip_all"]

  mongodb-cluster-b:  # simulado en local, no es aislado real
    image: mongo:7
    ports: ["27018:27017"]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  rabbitmq:
    image: rabbitmq:3.13-management
    ports: ["5672:5672", "15672:15672"]
```

### 13.2 Scripts de setup

```bash
# Setup inicial
make setup  # instala deps, crea archivos .env, levanta DBs

# Levantar todo
make up     # docker compose up + migraciones + seeds

# Tests
make test   # corre tests de todos los servicios

# Reset
make reset  # baja todo y borra datos locales
```

### 13.3 Seeds

- `infra/seeds/dev/` — datos sintéticos para desarrollo
- `infra/seeds/staging/` — datos representativos para staging
- `infra/seeds/prod/` — VACÍO, nunca se seedea producción con datos sintéticos

---

## 14. Configuración de DNS y dominios

| Dominio | Apunta a | Uso |
|---|---|---|
| `appbit.com` | API Gateway | Producción |
| `staging.appbit.com` | API Gateway staging | Staging |
| `chat.appbit.com` | Chat Gateway | WebSocket producción |
| `status.appbit.com` | Statuspage | Estado público |
| `pr-{N}.preview.appbit.com` | Preview deploy | PR previews |

**Certificados**: Let's Encrypt vía Railway, renovación automática.

---

## 15. Decisiones pendientes

1. **Migrar de `server/` monorepo a `services/<svc>` separados**: ¿cuándo se hace? — Cuando el equipo pase de 3+ personas o haya > 20 servicios. Documentar la migración para ese momento
2. **Multi-región**: ¿cuándo se justifica? — Cuando tengamos > 5k usuarios activos en LATAM+Angola con latencia > 200ms
3. **HA para PostgreSQL y MariaDB**: ¿cuándo se justifica pagar por RDS o DigitalOcean Managed? — Cuando el SLO de 99.5% esté en riesgo por caídas de Railway
4. **HA para Redis (Sentinel)**: ¿cuándo? — Cuando el chat sufra más de 1 caída/mes por SPOF de Redis
5. **Feature flags**: ¿LaunchDarkly, Unleash self-hosted, o custom? — Sugerido: Unleash self-hosted para empezar (dockerizable, free)
6. **CDN**: ¿Cloudflare delante del gateway? — Sí, gratis, protección DDoS incluida, **ya confirmado**
7. **Replicación de MongoDB Cluster A**: M0 free no tiene replica set real. Cuando se justifique, migrar a M10 (de pago) o self-hosted

---

## 16. Próximos pasos (orden de ejecución)

1. **Sprint 0 (1 semana) — Setup dockerizado**:
   - [ ] Crear cuenta Railway + proyecto `appbit-prod`
   - [ ] Crear `infra/docker/docker-compose.dev.yml` con: postgres, mariadb, mongo (containers locales), redis, glitchtip, prometheus, grafana, loki, tempo, otel-collector
   - [ ] Crear 2 cuentas MongoDB Atlas free y configurar clusters M0 (general + salud)
   - [ ] Crear cuenta Backblaze B2 + bucket `appbit-backups`
   - [ ] Crear `infra/backups/` con scripts bash dockerizados
   - [ ] Configurar GitHub Actions: CI con k6 shallow + workflow de backup
   - [ ] Primer test end-to-end: levantar todo localmente y verificar que PostgreSQL, MariaDB, MongoDB y Redis responden

2. **Sprint 1 (2 semanas) — Servicios básicos**:
   - [ ] Levantar el monorepo `server/` con `ENABLED_SERVICES=auth,perfil` y verificar `/health` 200
   - [ ] Configurar api-gateway (Nginx) con TLS
   - [ ] Implementar logging estructurado y tracing OTEL
   - [ ] Configurar Prometheus + Grafana con dashboards de Overview y Por servicio
   - [ ] Configurar GlitchTip y verificar que captura errores
   - [ ] Primer deploy a staging end-to-end

3. **Sprint 2 (1 semana) — Servicios completos + chat**:
   - [ ] Levantar los 13 servicios con `ENABLED_SERVICES=*`
   - [ ] Configurar chat-gateway con Redis dockerizado para sticky sessions
   - [ ] Configurar CloudAMQP free (RabbitMQ) + worker de DLQ
   - [ ] Implementar el patrón outbox en al menos 1 servicio
   - [ ] Smoke tests automatizados post-deploy

4. **Sprint 3 (1 semana) — Seguridad y compliance**:
   - [ ] Implementar cifrado a nivel de documento para chat de salud
   - [ ] Cargar seeds de terminología clínica (LOINC, SNOMED, CID-10, CIAP-2)
   - [ ] Implementar rate limiting + blacklist JWT con Redis
   - [ ] Threat model para `/salud` con revisión de ético/psicólogo

5. **Sprint 4 (1 semana) — Observabilidad y on-call**:
   - [ ] Alertas críticas configuradas (Slack webhooks)
   - [ ] Status page pública (BetterUptime free)
   - [ ] Runbooks de DR documentados y probados
   - [ ] Primer k6 deep test contra staging

6. **Pre-producción (1 semana)**:
   - [ ] Auditoría de seguridad externa
   - [ ] Auditoría de LGPD
   - [ ] Backup y restore probados (al menos 1 restore real)
   - [ ] Plan de rollback documentado
   - [ ] Go/No-Go con stakeholders

7. **Producción**:
   - [ ] Deploy desde tag `v1.0.0`
   - [ ] Smoke tests automatizados
   - [ ] Monitoreo 24/7 durante 1 semana
   - [ ] Iteración rápida según feedback

---

*Última actualización: 2026-06-11*
