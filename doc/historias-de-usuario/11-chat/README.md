# Módulo 11 — Mensajería (Chat) — 3 features en MongoDB

> **Rama módulo**: `feat/appbit/chat` (monorepo: 3 sub-servicios en `server/chat-*`)
> **Endpoints REST**: ver cada feature abajo
> **WebSocket**: `wss://chat.appbit.com/<feature>` (sticky sessions via Redis dockerizado)
> **Entidades DB**:
> - `chat_mentoria` (MongoDB Atlas cuenta #1, M0 free) → `conversations`, `messages`
> - `chat_agente_orientar` (MongoDB Atlas cuenta #1) → `sessions`, `messages`
> - `chat_salud_mental` (**MongoDB Atlas cuenta #2, M0 free, cluster físicamente aislado**) → `sessions`, `messages` (cifrado AES-256-GCM a nivel de documento)

> ⚠️ **Las 3 features son INDEPENDIENTES en producto, código e infraestructura**. Comparten el patrón (conversación + mensajes + WebSocket) pero no comparten DB, no comparten credenciales, y los timeouts/SLOs son diferentes.

---

## Overview de las 3 features

| Feature | Quiénes chatean | DB | Latencia objetivo | SLO disponibilidad |
|---|---|---|---|---|
| **11.A — Chat mentor ↔ usuario** | 1 mentor humano + 1 usuario | `chat_mentoria` | < 200 ms mensaje | 99% |
| **11.B — Chat usuario ↔ agente /orientar** | 1 usuario + LLM | `chat_agente_orientar` | Streaming | 99% |
| **11.C — Chat usuario ↔ agente /salud** | 1 usuario + LLM + safety layer | `chat_salud_mental` (aislado) | Streaming | **99.5%** |

---

## 11.A — Chat mentor ↔ usuario

### US-11-CHAT-A-01 — Crear conversación cuando se acepta una invitación

**Como** usuario con una invitación de mentoría aceptada  
**quiero** que se cree automáticamente una conversación de chat  
**para** empezar a hablar con mi mentor.

### Criterios de aceptación

- [ ] Se dispara desde el evento `mentoria.invitacion.aceptada.v1` (consumido por `chat-mentoria-svc`).
- [ ] Crea documento en `chat_mentoria.conversations` con `invitacion_id` (FK lógica a MariaDB), `mentor_id`, `usuario_id`, `metadata.tipo`, `metadata.area`.
- [ ] Saga con **outbox + reintentos + DLQ** (ver `topologia-servicios.md` §7.3): si falla la creación, se reintenta 5 veces con backoff.
- [ ] Estado de la saga visible en `sagas` (ver `topologia-servicios.md` §7.6): `pending → processing → completed` o `rolled_back`.
- [ ] Si la saga falla definitivamente (DLQ agotada): la invitación queda `aceptada` pero la conversación no se crea; UI muestra "preparando tu chat" y un job de reconciliación lo intenta de nuevo.
- [ ] **Idempotencia**: si el mismo `event_id` llega 2 veces, no se duplica la conversación (UNIQUE en `invitacion_id`).

### Tareas técnicas derivadas

- `task/appbit/chat/mentoria/conversation-create-consumer` — consume evento, crea conversación
- `task/appbit/chat/mentoria/outbox-reader` — patrón outbox local
- `task/appbit/chat/mentoria/mongodb-migration` — índice UNIQUE en `invitacion_id`
- `task/appbit/chat/mentoria/kafka-test` — test de idempotencia del consumer
- `task/appbit/chat/mentoria/docker-compose-service` — Dockerfile del servicio

---

### US-11-CHAT-A-02 — Enviar mensaje en una conversación

**Como** participante de una conversación mentor↔usuario  
**quiero** enviar mensajes de texto (y opcionalmente adjuntos)  
**para** comunicarme con el otro.

### Criterios de aceptación

- [ ] `POST /chat/mentoria/conversations/:id/messages` con `content` y opcional `attachments`.
- [ ] Crea documento en `chat_mentoria.messages` con `sender_id`, `sender_rol`, `content`, `attachments[]`, `read_by[]`, `created_at`.
- [ ] Mensaje se entrega al destinatario en tiempo real vía **WebSocket** (`wss://chat.appbit.com/mentoria`).
- [ ] Si el destinatario está desconectado, el mensaje se persiste y se dispara **notificación push** vía `notification-svc`.
- [ ] Rate limit: 60 mensajes / minuto por conversación (configurable, ver `seguridad-compliance.md` §10).
- [ ] Mensajes editables por el autor durante 15 minutos; soft delete después de eso.
- [ ] Validación: `content` no vacío, máximo 4000 caracteres, sin HTML (markdown simple permitido).
- [ ] Adjuntos: máximo 5 por mensaje, 10 MB cada uno, tipos `imagen`/`archivo`/`link`.

### Tareas técnicas derivadas

- `task/appbit/chat/mentoria/message-send-endpoint`
- `task/appbit/chat/mentoria/websocket-gateway-integration` — handshake JWT + routing
- `task/appbit/chat/mentoria/message-persistence` — escribir a MongoDB
- `task/appbit/chat/mentoria/rate-limit-middleware` — 60/min/conversación
- `task/appbit/chat/mentoria/attachment-upload` — POST a storage, URL firmada
- `task/appbit/chat/mentoria/notification-trigger` — push si destinatario offline
- `task/appbit/chat/mentoria/content-validator` — markdown safe, length check
- `task/appbit/chat/mentoria/glitchtip-instrumentation` — captura errores en este endpoint

---

### US-11-CHAT-A-03 — Ver historial paginado de mensajes

**Como** participante  
**quiero** ver el historial de mensajes de una conversación  
**para** releer lo que hablamos.

### Criterios de aceptación

- [ ] `GET /chat/mentoria/conversations/:id/messages?before=<timestamp>&limit=50`.
- [ ] Retorna mensajes en orden cronológico inverso (más recientes primero).
- [ ] Paginación por cursor (`before`), no por offset.
- [ ] Mensajes con `deleted: true` se omiten del feed pero persisten en DB (soft delete).
- [ ] Marca automáticamente como leídos los mensajes hasta `before` para el usuario que consulta.
- [ ] WebSocket entrega `message.read` en tiempo real al otro participante.

### Tareas técnicas derivadas

- `task/appbit/chat/mentoria/message-list-endpoint`
- `task/appbit/chat/mentoria/cursor-pagination`
- `task/appbit/chat/mentoria/mark-read-on-fetch` — actualiza `read_by[]`
- `task/appbit/chat/mentoria/broadcast-read-event` — emite vía WebSocket

---

### US-11-CHAT-A-04 — Indicador de "escribiendo" y presencia

**Como** participante  
**quiero** ver cuándo el otro está escribiendo  
**para** saber que me va a llegar un mensaje pronto.

### Criterios de aceptación

- [ ] Cliente envía `typing.start` / `typing.stop` por WebSocket.
- [ ] Servidor hace broadcast al otro participante (no se persiste en DB).
- [ ] Indicador expira automáticamente tras 5s sin `typing.stop` (heartbeat implícito).
- [ ] Estado de presencia (online/away/offline) basado en heartbeat cada 30s.
- [ ] Sin estado de presencia para la **lista de conversaciones** (solo dentro de una conversación activa).

### Tareas técnicas derivadas

- `task/appbit/chat/mentoria/typing-broadcast`
- `task/appbit/chat/mentoria/presence-heartbeat` — Redis para estado efímero
- `task/appbit/chat/mentoria/presence-expiry` — TTL en Redis

---

## 11.B — Chat usuario ↔ agente de orientación

### US-11-CHAT-B-01 — Abrir sesión de chat con el agente

**Como** usuario con una `/orientar` reciente  
**quiero** abrir una sesión de chat con el agente IA  
**para** hacer preguntas de seguimiento y refinar mi orientación.

### Criterios de aceptación

- [ ] `POST /chat/orientar/sessions` con opcional `orientar_request_id` para enlazar a la última `/orientar`.
- [ ] Crea documento en `chat_agente_orientar.sessions` con `contexto_perfil` (snapshot del perfil al inicio), `resumen` (acumulado), `entidades_mencionadas`.
- [ ] El `resumen` se conserva tras la expiración de la sesión (TTL 90 días) para dar contexto si el usuario vuelve.
- [ ] Mensaje de bienvenida del agente en el `idioma_preferido` del usuario (US-10-ML-03).
- [ ] Sesión única por usuario si no hay otra activa; si hay, se reutiliza.

### Tareas técnicas derivadas

- `task/appbit/chat/orientar/session-create-endpoint`
- `task/appbit/chat/orientar/session-reuse-logic`
- `task/appbit/chat/orientar/snapshot-perfil`
- `task/appbit/chat/orientar/welcome-message-i18n`
- `task/appbit/chat/orientar/mongodb-ttl-index` — 90 días

---

### US-11-CHAT-B-02 — Enviar pregunta y recibir respuesta streamed

**Como** usuario  
**quiero** enviar una pregunta al agente  
**para** recibir la respuesta con streaming token a token.

### Criterios de aceptación

- [ ] `POST /chat/orientar/sessions/:id/messages` con `content`.
- [ ] Persiste mensaje del usuario en `chat_agente_orientar.messages`.
- [ ] Llama al LLM con el contexto acumulado (`resumen` + últimos N mensajes + system prompt).
- [ ] **Streaming** vía WebSocket: eventos `message.start` → `message.delta` (cada chunk) → `message.complete` (respuesta final).
- [ ] Si el LLM llama una tool (ej: `calcular_gap`), persiste `tool_calls` y resultado.
- [ ] Metadata LLM guardada: `model`, `prompt_tokens`, `completion_tokens`, `latency_ms`, `temperature`.
- [ ] Latencia p95 de **primera respuesta (TTFT) < 2s**.
- [ ] Rate limit: 30 mensajes / minuto por sesión.

### Tareas técnicas derivadas

- `task/appbit/chat/orientar/message-send-endpoint`
- `task/appbit/chat/orientar/llm-streaming-client`
- `task/appbit/chat/orientar/context-window-manager` — gestiona `resumen` cuando se acerca al límite
- `task/appbit/chat/orientar/tool-call-handler` — invoca `calcular_gap`, `sugerir_vacante`
- `task/appbit/chat/orientar/llm-metadata-capture`
- `task/appbit/chat/orientar/rate-limit-middleware`

---

### US-11-CHAT-B-03 — Dar feedback sobre la respuesta del agente

**Como** usuario  
**quiero** marcar las respuestas del agente como útiles o no  
**para** ayudar a mejorar la calidad.

### Criterios de aceptación

- [ ] `POST /chat/orientar/messages/:id/feedback` con `{ util: true|false, comentario: string }`.
- [ ] Feedback se persiste en `chat_agente_orientar.messages.feedback`.
- [ ] Métricas agregadas disponibles: ratio útil/total por agente, por idioma, por hora del día.
- [ ] El feedback NO se usa para entrenar el modelo en MVP (opt-in pendiente, ver seguridad §10).

### Tareas técnicas derivadas

- `task/appbit/chat/orientar/feedback-endpoint`
- `task/appbit/chat/orientar/feedback-aggregations` — job diario
- `task/appbit/chat/orientar/grafana-feedback-dashboard`

---

## 11.C — Chat usuario ↔ agente de salud (CLUSTER AISLADO)

> ⚠️ **CRÍTICO**: este chat vive en un cluster MongoDB Atlas separado, con cuenta Atlas distinta del cluster general, IP allowlist estricto, acceso por `admin_clinico` con MFA. Cifrado AES-256-GCM a nivel de documento. Toda decisión de seguridad se valida contra `seguridad-compliance.md` §6 y §16.

### US-11-CHAT-C-01 — Abrir sesión de chat con el agente empático

**Como** usuario después de un check-in emocional  
**quiero** abrir una sesión de chat con el agente de salud  
**para** hablar sobre cómo me siento.

### Criterios de aceptación

- [ ] `POST /chat/salud/sessions` con opcional `checkin_id` para enlazar.
- [ ] Crea documento en `chat_salud_mental.sessions` con `estado_inicial` (snapshot del check-in), `resumen_clinico` (sin verbatim), `alertas[]`.
- [ ] El `usuario_id` se **seudonimiza** (SHA-256 + sal por entorno) antes de persistir — nunca el UUID real.
- [ ] Se inicializa `estado: "activa"`.
- [ ] El agente tiene un saludo cálido en el `idioma_preferido` (no clínico).
- [ ] Si `checkin.nota_semanal < 4`, la sesión se abre con el modal de crisis pre-cargado (acoplamiento con US-08-SM-04).

### Tareas técnicas derivadas

- `task/appbit/chat/salud/session-create-endpoint`
- `task/appbit/chat/salud/usuario-pseudonymization` — SHA-256 con sal en HSM
- `task/appbit/chat/salud/state-snapshot-from-checkin`
- `task/appbit/chat/salud/safety-layer-bootstrap` — pre-carga filtros
- `task/appbit/chat/salud/atlas-account-2-config` — config del cluster aislado

---

### US-11-CHAT-C-02 — Enviar mensaje con safety layer

**Como** usuario  
**quiero** enviar un mensaje al agente  
**para** recibir una respuesta empática y útil.

### Criterios de aceptación

- [ ] `POST /chat/salud/sessions/:id/messages` con `content`.
- [ ] **Safety layer obligatorio** (ver `topologia-servicios.md` §4.3 y `seguridad-compliance.md` §6): cada mensaje pasa por 3 capas en orden:
  1. **Regex patterns** — palabras clave de crisis (`suicid*`, `matar*`, `acabar con*`, etc.)
  2. **Clasificador de riesgo** — modelo binario `bajo`/`medio`/`alto`
  3. **LLM con system prompt seguro** — no genera contenido dañino
- [ ] Si safety layer detecta `alto`: **interrumpe la respuesta del LLM**, deriva inmediatamente (ver US-08-SM-04).
- [ ] Si detecta `medio`: LLM responde con redirección a recurso de bienestar + línea de ayuda.
- [ ] Si detecta `bajo`: respuesta normal del LLM empático.
- [ ] Mensaje del usuario se **cifra a nivel de documento** (AES-256-GCM con KMS) antes de persistir.
- [ ] Análisis automático: `sentimiento`, `riesgo_autolesion`, `entidades` se computan y persisten.
- [ ] Latencia p95 de TTFT < 3s (más alta que en 11.B por el safety layer).
- [ ] Rate limit: 10 mensajes / minuto (más estricto por sensibilidad).
- [ ] **Audit log a SIEM externo** por cada mensaje enviado (sin contenido, solo metadata).

### Tareas técnicas derivadas

- `task/appbit/chat/salud/safety-layer` — orquestador de las 3 capas
- `task/appbit/chat/salud/safety-regex-patterns`
- `task/appbit/chat/salud/safety-classifier` — modelo binario
- `task/appbit/chat/salud/safety-llm-system-prompt` — prompt seguro revisado por ético
- `task/appbit/chat/salud/document-encryption` — AES-256-GCM con KMS
- `task/appbit/chat/salud/message-analysis` — sentimiento, riesgo, entidades
- `task/appbit/chat/salud/siem-audit-emitter` — cada mensaje genera audit log
- `task/appbit/chat/salud/ip-allowlist-validator` — rechaza requests desde IPs no permitidas

---

### US-11-CHAT-C-03 — Respuesta del agente con escalamiento a clínico

**Como** agente de salud  
**quiero** poder escalar una conversación a un humano (admin_clinico)  
**para** cuando la situación lo requiera.

### Criterios de aceptación

- [ ] El LLM puede emitir una señal `escalate_to_clinician` cuando detecta patrones de crisis persistente.
- [ ] Crea un `human_handoff_request` en `chat_salud_mental.sessions.alertas[]` con tipo `escalamiento_humano`.
- [ ] Notifica a `admin_clinico` por Slack `#salud-guardia` y por email.
- [ ] `admin_clinico` puede ver la sesión **después de descifrar** con su clave KMS.
- [ ] La sesión se marca `estado: "derivada_clinico"`, no se cierra.
- [ ] El clínico puede dejar notas internas (cifradas) que el agente LLM no ve.

### Tareas técnicas derivadas

- `task/appbit/chat/salud/escalation-trigger`
- `task/appbit/chat/salud/clinician-dashboard` — UI con descifrado on-demand
- `task/appbit/chat/salud/clinician-notes` — campo cifrado separado del usuario
- `task/appbit/chat/salud/clinician-access-audit` — log a SIEM de cada acceso

---

### US-11-CHAT-C-04 — Retención indefinida y anonimización progresiva

**Como** plataforma  
**quiero** cumplir la política de retención indefinida con anonimización a 24 meses  
**para** cumplir compliance clínico y LGPD.

### Criterios de aceptación

- [ ] Mensajes **NO** tienen TTL (a diferencia de 11.B que sí).
- [ ] Job nocturno (cron 3am) busca sesiones con `last_activity_at < NOW() - 24 meses`.
- [ ] Reemplaza `usuario_id_hash` por un nuevo hash anónimo (no se puede re-vincular).
- [ ] El verbatim cifrado se conserva tal cual.
- [ ] Log de auditoría registra la anonimización con timestamp y hash anterior (sin contenido).
- [ ] Solo `admin_clinico` puede consultar sesiones anonimizadas (con descifrado on-demand).

### Tareas técnicas derivadas

- `task/appbit/chat/salud/retention-job` — cron 3am
- `task/appbit/chat/salud/anonimization-logic`
- `task/appbit/chat/salud/audit-log-retention-action`
- `task/appbit/chat/salud/cron-scheduler` — node-cron o similar dockerizado

---

## Responsables sugeridos (módulo 11)

| Sub-feature | Backend | Frontend | Seguridad/Ética |
|---|---|---|---|
| 11.A Chat mentor | chat-mentoria-svc | UI de chat con scroll infinito | — |
| 11.B Chat agente orientar | chat-agente-orientar-svc | UI de chat con streaming | Revisar prompt |
| 11.C Chat agente salud | chat-agente-salud-svc | UI de chat con modal de crisis | **Psicólogo/ético, DPO, admin_clinico** |

---

## Referencias cruzadas

- `topologia-servicios.md` §4.1-4.3 — detalle de endpoints REST y WebSocket de cada feature
- `seguridad-compliance.md` §6 — aislamiento del cluster MongoDB de salud
- `seguridad-compliance.md` §5.2 — cifrado a nivel de documento
- `seguridad-compliance.md` §10 — rate limits por endpoint
- `topologia-servicios.md` §7.3 — patrón saga con outbox + DLQ
- `topologia-servicios.md` §7.6 — estados visibles al usuario durante sagas
- `despliegue.md` §6.5 — config de 2 cuentas MongoDB Atlas separadas
- `despliegue.md` §10.4 — SLOs (99% para 11.A/B, 99.5% para 11.C)
