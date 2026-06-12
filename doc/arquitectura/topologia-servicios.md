# Topología de Servicios y Comunicación — App BiT

> Documento vivo. Define qué servicios existen, qué endpoints exponen, cómo se comunican entre sí y qué eventos publican.
> Lee primero `distribucion-db.md` para entender qué DB usa cada servicio.

---

## 1. Principios de diseño

1. **Cada bounded context = un servicio** con su propia DB
2. **Sin shared database** — si un servicio necesita datos de otro, los pide por API o se suscribe al evento
3. **Comunicación sincrónica (HTTP/gRPC) para queries**, asincrónica (eventos) para efectos colaterales
4. **Eventos son la fuente de verdad para integraciones cross-service** — el emisor publica, los interesados se suscriben
5. **API Gateway es el único punto de entrada público** — los servicios no son alcanzables directamente desde internet
6. **Chat tiene su propio gateway WebSocket** separado del HTTP gateway (ciclo de vida distinto)
7. **Idempotencia obligatoria** en todo endpoint que pueda ser retry (POST, PATCH, DELETE)

---

## 2. Inventario de servicios

### 2.1 Servicios de dominio (HTTP REST)

| Servicio | Puerto | DB | Módulo | Responsabilidad |
|---|---|---|---|---|
| `auth-svc` | 8001 | PostgreSQL | 01-auth | Registro, login, refresh, revocación |
| `perfil-svc` | 8002 | PostgreSQL | 02-perfil | Onboarding, edición, eliminación de cuenta |
| `orientar-svc` | 8003 | PostgreSQL | 03-orientar | Endpoint `/orientar`, generación de trayectoria |
| `empleabilidad-svc` | 8004 | MariaDB | 04-empleabilidad | Vacantes, match, postulaciones |
| `formaciones-svc` | 8005 | MariaDB | 05-formaciones | Cursos, trayectorias, progreso |
| `experiencias-svc` | 8006 | MariaDB | 06-experiencias | Eventos, testimonios |
| `mentor-core-svc` | 8007 | MariaDB | 07-mentorias | Perfil mentor, invitaciones (no el chat) |
| `salud-svc` | 8008 | PostgreSQL | 08-salud-mental | Check-in, `/salud`, derivaciones CVV |
| `geo-svc` | 8009 | MariaDB | 09-geolocalizacion | Vísent, eventos cercanos, cobertura |
| `i18n-svc` | 8010 | SQLite | 10-multilenguaje | Catálogo de strings (read-through cache) |

### 2.2 Servicios de chat (WebSocket + HTTP)

| Servicio | Puerto | DB | Feature | Protocolo |
|---|---|---|---|---|
| `chat-mentoria-svc` | 9001 | MongoDB `chat_mentoria` | Chat mentor ↔ usuario | WSS + REST |
| `chat-agente-orientar-svc` | 9002 | MongoDB `chat_agente_orientar` | Chat usuario ↔ agente /orientar | WSS + REST |
| `chat-agente-salud-svc` | 9003 | MongoDB `chat_salud_mental` | Chat usuario ↔ agente /salud | WSS + REST (aislado) |

### 2.3 Servicios transversales (infra)

| Servicio | Puerto | Responsabilidad |
|---|---|---|
| `api-gateway` | 80/443 | Ruteo HTTP, rate limit, auth header injection |
| `chat-gateway` | 443/wss | Ruteo WebSocket, sticky sessions, auth por JWT en handshake |
| `event-bus` | 5672 (AMQP) / 6379 (pub/sub) | RabbitMQ para eventos duraderos, Redis para pub/sub efímero |
| `notification-svc` | 8011 | Emails, push notifications |
| `audit-svc` | 8012 | Sink de logs de auditoría (especialmente salud-mental) |
| `search-svc` | 8013 | (futuro) indexador cross-service para búsqueda global |

---

## 3. Mapa de endpoints por servicio

### 3.1 `auth-svc`

| Método | Path | Auth | Descripción |
|---|---|---|---|
| POST | `/auth/register` | público | Crear cuenta |
| POST | `/auth/login` | público | Login con email+password |
| POST | `/auth/refresh` | refresh token | Renovar access token |
| POST | `/auth/logout` | access token | Revocar refresh token |
| POST | `/auth/forgot-password` | público | Solicitar reset |
| POST | `/auth/reset-password` | reset token | Confirmar nueva password |

**Eventos publicados**:
- `auth.usuario.creado` → payload `{ usuario_id, email, created_at }`
- `auth.usuario.eliminado` → payload `{ usuario_id, deleted_at }`
- `auth.password.cambiada` → payload `{ usuario_id, changed_at }`

### 3.2 `perfil-svc`

| Método | Path | Auth | Descripción |
|---|---|---|---|
| GET | `/usuarios/me` | access token | Perfil completo del usuario autenticado |
| PATCH | `/usuarios/me` | access token | Actualizar perfil (parcial) |
| POST | `/usuarios/me/onboarding-complete` | access token | Marcar onboarding como completo |
| DELETE | `/usuarios/me` | access token | Soft delete con confirmación |
| PATCH | `/usuarios/me/idioma` | access token | Cambiar idioma preferido |

**Eventos publicados**:
- `perfil.onboarding.completado` → payload `{ usuario_id, area, nivel, objetivo }`
- `perfil.objetivo.cambiado` → payload `{ usuario_id, objetivo_anterior, objetivo_nuevo }`
- `perfil.usuario.eliminado` → payload `{ usuario_id, deleted_at }` (replica de auth)

**Eventos consumidos**:
- `auth.usuario.creado` → inicializar perfil en blanco
- `auth.usuario.eliminado` → anonimizar perfil

### 3.3 `orientar-svc`

| Método | Path | Auth | Descripción |
|---|---|---|---|
| POST | `/orientar` | access token | Endpoint principal, devuelve gap + trayectoria |
| GET | `/orientar/historial` | access token | Histórico de orientaciones del usuario |
| GET | `/orientar/ultima` | access token | Última orientación (cache) |

**Eventos consumidos**:
- `perfil.onboarding.completado` → pre-calcular primera orientación
- `perfil.objetivo.cambiado` → invalidar trayectoria activa

### 3.4 `empleabilidad-svc`

| Método | Path | Auth | Descripción |
|---|---|---|---|
| GET | `/vacantes` | access token | Feed paginado con filtros |
| GET | `/vacantes/:id` | access token | Detalle + gap explicativo |
| POST | `/aplicaciones` | access token | Registrar postulación |
| GET | `/aplicaciones/me` | access token | Mis postulaciones |
| PATCH | `/aplicaciones/:id/estado` | access token (empresa) | Actualizar estado |

**Eventos publicados**:
- `empleabilidad.aplicacion.creada` → payload `{ usuario_id, vacante_id, gap_porcentual }`
- `empleabilidad.aplicacion.contratado` → payload `{ usuario_id, vacante_id, empresa_id }`

**Eventos consumidos**:
- `perfil.onboarding.completado` → pre-cachear feed

### 3.5 `formaciones-svc`

| Método | Path | Auth | Descripción |
|---|---|---|---|
| GET | `/cursos` | access token | Catálogo con filtros |
| GET | `/cursos/:id` | access token | Detalle del curso |
| GET | `/trayectoria/me/activa` | access token | Trayectoria activa del usuario |
| POST | `/trayectoria/:id/progreso` | access token | Marcar curso como completado |
| POST | `/cursos` | admin | CRUD de cursos (admin) |
| PATCH | `/cursos/:id` | admin | CRUD de cursos (admin) |
| DELETE | `/cursos/:id` | admin | Soft delete de curso |

**Eventos consumidos**:
- `perfil.onboarding.completado` → generar primera trayectoria
- `perfil.objetivo.cambiado` → invalidar y regenerar trayectoria
- `empleabilidad.aplicacion.creada` → opcional: refinar trayectoria según vacante objetivo

### 3.6 `experiencias-svc`

| Método | Path | Auth | Descripción |
|---|---|---|---|
| GET | `/experiencias` | access token | Listado con tabs (vivo, grabado, próximo) |
| GET | `/experiencias/:id` | access token | Detalle con testimonios |
| POST | `/experiencias/:id/inscribirse` | access token | Inscripción a evento en vivo |
| CRUD | `/admin/experiencias` | admin_eventos | Gestión de eventos (admin) |
| CRUD | `/admin/testimonios` | admin_eventos | Gestión de testimonios (admin) |

**Eventos publicados**:
- `experiencias.inscripcion.creada` → payload `{ usuario_id, evento_id }`

### 3.7 `mentor-core-svc`

| Método | Path | Auth | Descripción |
|---|---|---|---|
| GET | `/mentores` | access token | Listado con filtros |
| GET | `/mentores/:id` | access token | Detalle del mentor |
| POST | `/mentor-invitaciones` | access token (mentor) | Crear invitación |
| GET | `/mentor-invitaciones/me` | access token | Mis invitaciones (bandeja) |
| PATCH | `/mentor-invitaciones/:id` | access token | Cambiar estado (aceptar/rechazar) |
| POST | `/mentores/onboarding` | access token | Convertirse en mentor |

**Eventos publicados**:
- `mentoria.invitacion.creada` → payload `{ mentor_id, usuario_id, tipo }`
- `mentoria.invitacion.aceptada` → payload `{ invitacion_id, mentor_id, usuario_id }` (CRÍTICO: dispara creación de conversación en MongoDB)

**Eventos consumidos**:
- `mentoria.invitacion.aceptada` → trigger para `chat-mentoria-svc` de crear la conversación

### 3.8 `salud-svc`

| Método | Path | Auth | Descripción |
|---|---|---|---|
| POST | `/salud` | access token | Check-in diario/semanal + acción sugerida |
| POST | `/checkin` | access token | Check-in diario simple (sin nota numérica) |
| GET | `/salud/historial` | access token | Histórico del usuario (solo metadatos en MVP) |
| GET | `/salud/recurso-bienestar` | access token | Catálogo de recursos |

**Eventos publicados**:
- `salud.checkin.creado` → payload `{ usuario_id, humor, nota_semanal, created_at }` (sin contenido)
- `salud.crisis.detectada` → payload `{ usuario_id, nota_semanal, checkin_id, timestamp }` (CRÍTICO)

**Eventos consumidos**:
- `salud.crisis.detectada` (interno) → trigger derivación CVV + notificación a `audit-svc`

### 3.9 `geo-svc`

| Método | Path | Auth | Descripción |
|---|---|---|---|
| GET | `/geo/zona-cercana` | access token | Zona Vísent más cercana al usuario |
| GET | `/geo/eventos-cercanos` | access token | Eventos en radio configurable |
| GET | `/geo/cobertura` | access token | Cobertura de red de la zona |
| GET | `/geo/heatmap` | access token | Datos agregados para visualización |

**Eventos publicados**: ninguno (es data de solo lectura sobre el dataset Vísent)

### 3.10 `i18n-svc`

| Método | Path | Auth | Descripción |
|---|---|---|---|
| GET | `/i18n/strings/:locale` | access token (o público con cache) | Strings del sistema |
| GET | `/i18n/agent-messages/:agent/:locale` | access token | Mensajes pre-canned del agente |

Sin eventos.

---

## 4. Servicios de chat

### 4.1 `chat-mentoria-svc`

**Endpoints REST** (consultar historial, gestión de conversaciones):
| Método | Path | Auth | Descripción |
|---|---|---|---|
| GET | `/chat/mentoria/conversations` | access token | Mis conversaciones |
| GET | `/chat/mentoria/conversations/:id/messages?before=X&limit=N` | access token | Historial paginado |
| POST | `/chat/mentoria/conversations/:id/messages` | access token | Enviar mensaje |
| PATCH | `/chat/mentoria/messages/:id` | access token | Editar (autor, 15min) |
| DELETE | `/chat/mentoria/messages/:id` | access token | Soft delete (autor) |
| PATCH | `/chat/mentoria/messages/:id/read` | access token | Marcar leído |

**WebSocket** (`wss://chat.appbit.com/mentoria`):
- Handshake: header `Authorization: Bearer <access_token>`
- Cliente se suscribe a `conversation:<id>`
- Eventos servidor → cliente: `message.new`, `message.read`, `conversation.closed`
- Eventos cliente → servidor: `typing.start`, `typing.stop`, `presence.heartbeat`

**Eventos consumidos**:
- `mentoria.invitacion.aceptada` → crear conversación automáticamente

**Eventos publicados**:
- `chat.mentoria.mensaje.enviado` → para notificaciones push si el destinatario está offline

### 4.2 `chat-agente-orientar-svc`

**Endpoints REST**:
| Método | Path | Auth | Descripción |
|---|---|---|---|
| POST | `/chat/orientar/sessions` | access token | Abrir sesión (asociada a un /orientar previo) |
| GET | `/chat/orientar/sessions/:id/messages` | access token | Historial |
| POST | `/chat/orientar/sessions/:id/messages` | access token | Enviar pregunta |
| POST | `/chat/orientar/messages/:id/feedback` | access token | 👍 / 👎 |

**WebSocket** (`wss://chat.appbit.com/orientar`):
- Soporta **streaming de la respuesta del LLM** (token a token)
- Eventos: `message.start`, `message.delta`, `message.complete`, `tool.call`, `tool.result`

**Eventos publicados**:
- `chat.orientar.sesion.cerrada` → (futuro) análisis de uso del agente

### 4.3 `chat-agente-salud-svc` (cluster aislado)

**Endpoints REST** (acceso restringido):
| Método | Path | Auth | Descripción |
|---|---|---|---|
| POST | `/chat/salud/sessions` | access token | Abrir sesión |
| POST | `/chat/salud/sessions/:id/messages` | access token (gated por safety layer) | Enviar mensaje |
| POST | `/chat/salud/sessions/:id/close` | access token | Cerrar sesión |
| GET | `/chat/salud/sessions/:id/messages` | access token (dueño) o `admin_clinico` | Historial |
| POST | `/chat/salud/sessions/:id/derivar-cvv` | access token o system | Forzar derivación manual |

**WebSocket** (`wss://chat.appbit.com/salud`):
- Handshake: doble factor (JWT + `safety_handshake` cookie httpOnly)
- Cada mensaje entrante pasa por `safety-layer` antes de llegar al LLM
- El safety layer puede: derivar, escalar a humano, censurar, redirigir

**Eventos publicados**:
- `chat.salud.mensaje.enviado` → sin contenido, solo metadata para auditoría
- `chat.salud.crisis.derivada` → payload mínimo para `audit-svc`

**Eventos consumidos**:
- `salud.crisis.detectada` (de `salud-svc`) → abrir sesión proactiva y forzar derivación

---

## 5. Comunicación entre servicios

### 5.1 HTTP síncrono (REST)

Usado para **queries que el usuario está esperando**.

| Origen | Destino | Ejemplo |
|---|---|---|
| `chat-agente-orientar-svc` | `orientar-svc` | El agente necesita recalcular gap en medio de la conversación |
| `orientar-svc` | `empleabilidad-svc` | `/orientar` necesita listar vacantes compatibles |
| `orientar-svc` | `formaciones-svc` | `/orientar` necesita cursos para cerrar el gap |
| `chat-mentoria-svc` | `mentor-core-svc` | Validar que la conversación pertenece a una invitación aceptada |
| `salud-svc` | `recurso-bienestar` (mismo servicio) | Buscar recursos por humor |

**Reglas**:
- Timeout: 2s p99
- Circuit breaker: 3 fallos en 30s → abre por 60s
- Retry: solo para GET idempotente, máximo 2 reintentos con backoff exponencial
- Tracing: cada llamada lleva `X-Request-ID` propagado

### 5.2 Eventos asíncronos (RabbitMQ)

Usado para **efectos colaterales que pueden esperar**.

| Evento | Emisor | Consumidores | Garantía |
|---|---|---|---|
| `auth.usuario.creado` | `auth-svc` | `perfil-svc`, `notification-svc` | At-least-once |
| `perfil.onboarding.completado` | `perfil-svc` | `orientar-svc`, `formaciones-svc` | At-least-once |
| `perfil.objetivo.cambiado` | `perfil-svc` | `orientar-svc`, `formaciones-svc` | At-least-once |
| `mentoria.invitacion.aceptada` | `mentor-core-svc` | `chat-mentoria-svc` | At-least-once |
| `chat.mentoria.mensaje.enviado` | `chat-mentoria-svc` | `notification-svc` | At-most-once (idempotente) |
| `salud.crisis.detectada` | `salud-svc` | `chat-agente-salud-svc`, `audit-svc` | At-least-once + DLQ |
| `chat.salud.crisis.derivada` | `chat-agente-salud-svc` | `audit-svc` | At-least-once + DLQ |

**Reglas**:
- Todos los eventos en formato CloudEvents 1.0
- Schema versionado: `auth.usuario.creado.v1`
- Consumidores idempotentes (usan `event_id` para deduplicación)
- Dead Letter Queue obligatoria (DLQ) para eventos que fallan 3 veces
- Retención en RabbitMQ: 7 días, después se purgan (los consumidores ya deben haberlos procesado)

### 5.3 WebSocket (tiempo real)

Usado solo para **chat**.

- 2 gateways separados (HTTP y chat WSS) con ciclos de vida independientes
- Sticky sessions obligatorias (el cliente siempre vuelve al mismo backend)
- Reconexión automática del cliente con backoff exponencial
- Mensajes offline: si el destinatario está desconectado, se persiste el mensaje y se envía push notification

---

## 6. Contratos de eventos (ejemplos)

### 6.1 `auth.usuario.creado.v1`

```json
{
  "specversion": "1.0",
  "type": "auth.usuario.creado.v1",
  "source": "auth-svc",
  "id": "01HXXX...",
  "time": "2026-06-11T10:00:00Z",
  "datacontenttype": "application/json",
  "data": {
    "usuario_id": "uuid",
    "email": "user@example.com",
    "idioma_preferido": "pt",
    "created_at": "2026-06-11T10:00:00Z"
  }
}
```

### 6.2 `mentoria.invitacion.aceptada.v1`

```json
{
  "specversion": "1.0",
  "type": "mentoria.invitacion.aceptada.v1",
  "source": "mentor-core-svc",
  "id": "01HYYY...",
  "time": "2026-06-11T10:05:00Z",
  "data": {
    "invitacion_id": "uuid",
    "mentor_id": "uuid",
    "usuario_id": "uuid",
    "tipo": "conversacion",
    "agendada_para": "2026-06-12T15:00:00Z"
  }
}
```

### 6.3 `salud.crisis.detectada.v1`

```json
{
  "specversion": "1.0",
  "type": "salud.crisis.detectada.v1",
  "source": "salud-svc",
  "id": "01HZZZ...",
  "time": "2026-06-11T10:10:00Z",
  "data": {
    "usuario_id": "uuid",  // seudónimo, no PII
    "checkin_id": "uuid",
    "nota_detectada": 2,
    "region": "BR-SP",
    "timestamp": "2026-06-11T10:10:00Z"
  }
}
```

> **Importante**: el evento de crisis **no contiene el contenido del mensaje**. El detalle clínico vive solo en `chat-agente-salud-svc` con su cluster aislado.

---

## 7. Patrones de resiliencia

### 7.1 Circuit breaker

Toda llamada HTTP inter-servicio pasa por un circuit breaker:

| Estado | Comportamiento |
|---|---|
| Cerrado | Pasa normal, cuenta fallos |
| Abierto | Falla rápido, no llama al destino |
| Semi-abierto | Permite 1 llamada de prueba |

**Defaults**: abre tras 5 fallos en 30s, prueba tras 60s.

### 7.2 Outbox pattern (transacciones cross-service)

Problema: si `mentor-core-svc` crea la invitación en MariaDB y publica el evento en RabbitMQ, una falla entre los dos pasos pierde el evento.

Solución: **Outbox table** en la misma DB transaccional.

```sql
CREATE TABLE outbox_events (
  id UUID PRIMARY KEY,
  aggregate_id UUID NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ NULL
);
CREATE INDEX idx_outbox_pending ON outbox_events (created_at) WHERE published_at IS NULL;
```

Un **outbox poller** (worker en cada servicio) lee eventos pendientes y los publica a RabbitMQ, luego marca `published_at`. Garantiza **at-least-once**.

### 7.3 Saga con reintentos activos + outbox + DLQ + rollback explícito

Problema: `chat-mentoria-svc` debe crear la conversación en MongoDB cuando se acepta una invitación, pero `mentor-core-svc` es el dueño de la invitación. Una saga con reconciliación pasiva ("se reintenta en la noche") no alcanza para datos sensibles: el usuario debe ver el resultado de su acción de forma predecible.

Solución: **Saga con reintentos activos + outbox pattern + DLQ con worker + rollback explícito**.

#### Flujo completo

```
1. Emisor (ej: mentor-core-svc):
   a. Ejecuta la acción local en transacción ACID
   b. INSERT en outbox_events (misma DB, misma transacción)
   c. Retorna 200 al usuario con estado "procesando"

2. Outbox poller (worker en cada servicio):
   a. Lee outbox_events pendientes
   b. Publica a RabbitMQ
   c. Marca published_at

3. Consumidor (ej: chat-mentoria-svc):
   a. Recibe el evento
   b. Procesa con idempotencia (usa event_id para deduplicar)
   c. Si ÉXITO → publica evento "completado" → UI actualiza a "listo"
   d. Si FALLA → reintenta con backoff:
      - Intento 1: inmediato
      - Intento 2: 5s
      - Intento 3: 30s
      - Intento 4: 2 min
      - Intento 5: 10 min
      - Tras 5 fallos: el evento va a DLQ

4. Worker de DLQ:
   a. Reintenta el evento cada 1 minuto durante 1 hora
   b. Si logra: publica "completado"
   c. Si no: alerta a on-call + la operación se considera "abandonada"
      → ROLLBACK EXPLÍCITO (acción compensatoria) + mensaje claro al usuario

5. UI:
   a. Mientras se procesa: spinner con texto ("aceptando mentoría…")
   b. Si timeout visible (ej: 30s sin completar): "esto está tardando más de lo normal, te avisamos"
   c. Si rollback: "no pudimos procesar tu solicitud, intenta de nuevo" + log del motivo para soporte
```

#### Acciones compensatorias (rollback por saga)

| Operación forward | Compensación |
|---|---|
| Crear conversación en MongoDB (chat) | Borrar conversación creada |
| Marcar invitación como aceptada (mentor-core) | Volver a `estado='pendiente'`, notificar a las partes |
| Crear trayectoria (formaciones) | Marcar `activa=false`, eliminar |
| Postular a vacante (empleabilidad) | Marcar `estado='cancelado'`, notificar a la empresa |
| Abrir sesión de chat (cualquier feature) | Cerrar sesión, notificar al usuario |
| Aceptar derivación CVV (salud) | Registrar fallo, pedir reintento manual con admin_clinico |

#### Garantías

- **At-least-once con bounded retries**: la operación se intenta entre 2-3 veces con backoff, NO se abandona al primer fallo
- **Visibilidad para el usuario**: la UI muestra estado real con timeouts explícitos
- **No se abandona nunca sin rollback**: si se llega al límite de reintentos, se compensa y se notifica
- **Outbox pattern en el emisor**: garantiza que si la DB commiteó, el evento se publica (independiente de que RabbitMQ esté caído)

#### Trade-off vs 2PC

- **vs 2PC**: 2PC garantiza atomicidad estricta pero requiere 4 DBs en transacción distribuida (complexity brutal, casi nadie lo implementa bien)
- **Esta saga**: garantiza que el trabajo se completa o se cancela limpio, con experiencia de usuario predecible

### 7.4 Bulkhead

Cada servicio tiene su **pool de threads/conexiones limitado** para no saturarse por una dependencia lenta.

- 20 conexiones a PostgreSQL por servicio
- 50 conexiones a RabbitMQ por servicio
- Timeout duro de 2s en llamadas HTTP cross-service

### 7.5 Worker de DLQ

Los eventos que fallan 5 veces consecutivas van a una **Dead Letter Queue (DLQ)**. Un worker dedicado la procesa:

**Configuración del worker**:

```yaml
# docker-compose.yml (extracto)
dlq-worker:
  image: appbit/dlq-worker:latest
  environment:
    - DLQ_BATCH_SIZE=10
    - DLQ_MAX_ATTEMPTS=60        # 60 reintentos × 1 min = 1 hora
    - DLQ_ALERT_WEBHOOK=${SLACK_WEBHOOK}
  depends_on:
    - rabbitmq
```

**Comportamiento**:
- Lee eventos de la DLQ en batch de 10
- Reintenta el procesamiento del evento completo
- Si tiene éxito, lo quita de la DLQ y publica el evento de "completado"
- Si supera 60 intentos (1 hora), marca el evento como "abandonado" y:
  1. Llama a la acción compensatoria (rollback explícito, ver §7.3)
  2. Publica alerta a Slack `#oncall`
  3. Registra en `audit-svc` con `outcome='abandoned'`

**Métricas**:
- `dlq_depth` (gauge) — eventos en DLQ ahora
- `dlq_processing_attempts_total` (counter) — intentos de reprocesar
- `dlq_abandoned_total` (counter) — eventos abandonados tras 60 intentos
- Alerta P2 si `dlq_depth > 100` por más de 5 minutos

### 7.6 Estados visibles al usuario durante una saga

Para que el usuario no vea "preparando…" indefinidamente, cada saga expone **estados con timeout explícito** que la UI puede mostrar:

| Estado | Significado | Tiempo máximo visible | Acción al pasar el tiempo |
|---|---|---|---|
| `pending` | La acción del usuario fue recibida, no se empezó a procesar | < 100ms | (transitorio) |
| `processing` | La saga está ejecutándose | 30s para acciones simples, 2min para acciones multi-paso | UI muestra "esto está tardando más de lo normal" |
| `completed` | La saga terminó OK | (estado final) | UI muestra resultado |
| `rolling_back` | La saga falló, ejecutando compensación | 5s | UI muestra "revertiendo cambios" |
| `rolled_back` | La compensación terminó, estado consistente | (estado final) | UI muestra "no pudimos procesar tu solicitud, intenta de nuevo" |

**Cómo se obtiene el estado**:
- Endpoint `GET /sagas/{saga_id}` retorna el estado actual
- WebSocket opcional para actualizaciones en tiempo real (solo MVP+1)
- Polling cada 2s como fallback

**Persistencia del estado**:
- Tabla `sagas` en PostgreSQL del servicio que origina la saga:

```sql
CREATE TABLE sagas (
  id UUID PRIMARY KEY,
  tipo VARCHAR(80) NOT NULL,
  usuario_id UUID NOT NULL,
  estado VARCHAR(20) NOT NULL,  -- pending|processing|completed|rolling_back|rolled_back
  metadata JSONB,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  error TEXT
);

CREATE INDEX idx_sagas_usuario ON sagas (usuario_id, started_at DESC);
CREATE INDEX idx_sagas_estado ON sagas (estado) WHERE estado NOT IN ('completed', 'rolled_back');
```

---

## 8. Versionado de APIs

| Aspecto | Política |
|---|---|
| Path versioning | `/v1/orientar`, `/v2/orientar` |
| Header `Accept` | opcional, para negociación de formato |
| Deprecation | anuncia con 6 meses de anticipación, mantiene versión anterior corriendo |
| Breaking changes | solo en major version |
| Contratos | OpenAPI 3.1 publicado en cada release |

---

## 9. Observabilidad

### 9.1 Logs

- Formato: JSON estructurado
- Campos obligatorios: `timestamp`, `service`, `level`, `request_id`, `user_id` (si aplica)
- Los logs de `chat-agente-salud-svc` **nunca** incluyen el contenido del mensaje — solo metadatos

### 9.2 Métricas

- Cada servicio expone `/metrics` en formato Prometheus
- RED metrics: Rate, Errors, Duration
- Use metrics custom: vacantes servidas, check-ins, derivaciones CVV, mensajes de chat

### 9.3 Tracing

- OpenTelemetry con propagación W3C Trace Context
- Trace completo: frontend → gateway → servicio → DB → servicio downstream
- Sampling: 100% en endpoints críticos (`/orientar`, `/salud`), 10% en el resto

### 9.4 Alertas

- Circuit breaker abierto > 5min
- Cola RabbitMQ con lag > 1000 mensajes
- MongoDB chat_salud: cualquier acceso desde IPs no permitidas
- Evento `salud.crisis.detectada` → notificación inmediata al canal de guardia

---

## 10. Decisiones pendientes

1. **API Gateway concreto**: ¿Kong, Nginx + Lua, o Traefik? — Para MVP, Nginx simple alcanza
2. **gRPC vs REST en inter-service**: REST es más simple; gRPC gana en performance. Empezamos con REST
3. **Rate limiting**: ¿cuántas requests/min por usuario? — Sugerido: 100/min para chat, 30/min para /orientar, 10/min para /salud
4. **Idempotency keys**: ¿dónde se generan? — Cliente genera UUID v4, se valida en servicio
5. **Versionado del prompt del agente**: ¿cómo se actualiza sin redeploy? — Feature flag + caché de prompt versionado en `formaciones-svc` o un nuevo `prompt-svc`

---

## 11. Próximos pasos

1. Crear issues con `03-task.md` para cada servicio nuevo
2. Definir OpenAPI specs de los endpoints críticos
3. Configurar el bus de eventos con los topics iniciales
4. Sprint 0: levantar los 4 motores vacíos y los 13 servicios con `/health`
5. Implementar tracing y métricas antes que cualquier feature

---

*Última actualización: 2026-06-11*
