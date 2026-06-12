# Distribución de Persistencia — App BiT

> Documento vivo. Define qué motor de base de datos usa cada bounded context y por qué.
> Decisión de equipo: 2026-06-11 — distribución multi-motor para MVP extensible.

---

## 1. Resumen ejecutivo

App BiT usa **cuatro motores de persistencia** en su arquitectura objetivo, cada uno elegido por una razón concreta:

| Motor | Rol | Casos de uso |
|---|---|---|
| **PostgreSQL 15+** | Source of truth transaccional | Auth, perfil, agente sensible, datos con JSONB |
| **MariaDB 11+** | Catálogos estructurados de alto volumen | Vacantes, cursos, eventos, geolocalización |
| **MongoDB 7+** | Mensajería y documentos semi-estructurados | 3 features de chat con modelos distintos |
| **SQLite 3** | Cache local read-heavy y state efímero | i18n, sesiones, respuestas del agente |

**Principio rector**: cada bounded context elige su motor según la forma de sus datos, no por moda.

---

## 2. Mapeo módulo → motor (actualizado)

| Módulo | Motor | Justificación |
|---|---|---|
| `01-auth` | **PostgreSQL** | ACID crítico (revocación de tokens, sesiones), JSONB para claims |
| `02-perfil` | **PostgreSQL** | Joins con auth, consistencia transaccional con onboarding |
| `03-orientar` | **PostgreSQL** | El agente cruza muchas entidades en una sola response — joins nativos |
| `04-empleabilidad` | **MariaDB** | Catálogo de vacantes + empresas, alto volumen, filtros multi-campo |
| `05-formaciones` | **MariaDB** | Catálogo de cursos de terceros (GEAR, ONE, etc.), lectura intensiva |
| `06-experiencias` | **MariaDB** | Eventos y testimonios, CRUD admin, casi sin lógica compleja |
| `07-mentorias` | **MariaDB** (datos core) + **MongoDB** (chat mentor↔usuario) | Datos estructurados del mentor + mensajería asíncrona |
| `08-salud-mental` | **PostgreSQL** (datos) + **MongoDB** (chat crítico) | **DATOS SENSIBLES**: logs cifrados, derivaciones, aislamiento de compliance |
| `09-geolocalizacion` | **MariaDB** | Dataset Vísent, datos semi-estáticos, lectura por coordenadas |
| `10-multilenguaje` | **SQLite** (cache distribuido) | Catálogo de strings i18n, read-only en runtime |
| Chat mentor↔usuario | **MongoDB** | Mensajería asíncrona, threads, presencia |
| Chat usuario↔agente (orientar) | **MongoDB** | Historial conversacional con LLM, contexto acumulativo |
| Chat usuario↔agente (salud) | **MongoDB** | **CRÍTICO**: trazabilidad del diálogo empático, evidencia para auditoría |

---

## 3. Las 3 features de chat en MongoDB

MongoDB es una sola infraestructura pero **tres databases lógicas separadas** dentro del cluster. Esto permite:
- Permisos por DB (la DB de salud-mental no comparte credenciales con el resto)
- Retención independiente (los logs de salud-mental se pueden cifrar/anonimizar aparte)
- Backups independientes
- Cero acoplamiento entre features

### 3.1 Feature A — Chat mentor ↔ usuario (soporte a `07-mentorias`)

**Propósito**: mensajería asíncrona entre un mentor humano y un usuario, anclada a una `mentoria_invitacion` (que vive en MariaDB).

**Modelo de datos (MongoDB)**:

```javascript
// DB: chat_mentoria
// Colección: conversations
{
  _id: ObjectId,
  invitacion_id: "uuid",  // FK lógica a MariaDB.mentoria_invitacion.id
  mentor_id: "uuid",
  usuario_id: "uuid",
  estado: "activa" | "cerrada",
  created_at: ISODate,
  last_message_at: ISODate,
  metadata: {
    tipo: "conversacion" | "practica",  // copiado de la invitación
    area: "string"
  }
}

// DB: chat_mentoria
// Colección: messages
{
  _id: ObjectId,
  conversation_id: ObjectId,
  sender_id: "uuid",
  sender_rol: "mentor" | "usuario",
  content: "string",  // texto o markdown simple
  attachments: [
    { tipo: "imagen" | "archivo" | "link", url: "string", nombre: "string" }
  ],
  read_by: [
    { user_id: "uuid", read_at: ISODate }
  ],
  created_at: ISODate,
  edited_at: ISODate | null,
  deleted: false
}
```

**Índices clave**:
- `messages`: `{ conversation_id: 1, created_at: -1 }` — feed cronológico por conversación
- `conversations`: `{ usuario_id: 1, last_message_at: -1 }` — bandeja del usuario
- `conversations`: `{ mentor_id: 1, last_message_at: -1 }` — bandeja del mentor
- `messages`: `{ conversation_id: 1, read_by.user_id: 1 }` — contar no leídos

**Servicios**:
- `POST /chat/mentoria/conversations` — crear (al aceptar invitación)
- `GET /chat/mentoria/conversations/:id/messages` — historial paginado
- `POST /chat/mentoria/conversations/:id/messages` — enviar mensaje
- `PATCH /chat/mentoria/messages/:id/read` — marcar leído
- `WebSocket /ws/chat/mentoria` — tiempo real (opcional MVP)

**Retención**: 24 meses. Soft delete (`deleted: true` mantiene el registro).

---

### 3.2 Feature B — Chat usuario ↔ agente de orientación (soporte a `03-orientar`)

**Propósito**: historial conversacional con el agente IA que genera `/orientar`. Permite al usuario hacer preguntas de seguimiento, refinar la búsqueda de vacantes, explorar cursos de la trayectoria.

**Modelo de datos (MongoDB)**:

```javascript
// DB: chat_agente_orientar
// Colección: sessions
{
  _id: ObjectId,
  usuario_id: "uuid",
  idioma: "pt" | "es",
  started_at: ISODate,
  last_activity_at: ISODate,
  contexto_perfil: {
    nivel: "string",
    area: "string",
    objetivo: "string",
    gap_actual: ["skill1", "skill2"]  // snapshot al inicio
  },
  // resumen acumulado para no enviar toda la historia al LLM en cada turno
  resumen: "string",
  // referencias a entidades de otras DBs que el agente ya mencionó
  entidades_mencionadas: {
    vacantes: ["uuid"],
    cursos: ["uuid"],
    trayectorias: ["uuid"]
  },
  total_tokens_estimados: 1234
}

// DB: chat_agente_orientar
// Colección: messages
{
  _id: ObjectId,
  session_id: ObjectId,
  rol: "user" | "assistant" | "system" | "tool",
  content: "string",
  tool_calls: [
    { nombre: "calcular_gap", args: {...}, resultado_id: "uuid" }
  ],
  // metadata de la llamada al LLM para reproducibilidad y cost tracking
  llm_metadata: {
    model: "string",
    prompt_tokens: 123,
    completion_tokens: 45,
    latency_ms: 800,
    temperature: 0.7
  },
  feedback: {
    util: true | false | null,
    comentario: "string" | null
  },
  created_at: ISODate
}
```

**Índices clave**:
- `messages`: `{ session_id: 1, created_at: 1 }` — feed cronológico
- `sessions`: `{ usuario_id: 1, last_activity_at: -1 }` — sesiones activas del usuario
- `messages`: `{ rol: 1, "feedback.util": 1 }` — análisis de calidad de respuestas
- `sessions`: TTL index de 90 días en `last_activity_at` (limpieza automática)

**Servicios**:
- `POST /chat/orientar/sessions` — abrir sesión (asociada a un `/orientar` previo)
- `GET /chat/orientar/sessions/:id/messages` — historial
- `POST /chat/orientar/sessions/:id/messages` — enviar pregunta
- `POST /chat/orientar/messages/:id/feedback` — 👍 / 👎
- `WebSocket /ws/chat/orientar` — streaming de la respuesta del LLM (opcional MVP)

**Retención**: 90 días con TTL automático. Resumen se conserva en `sessions.resumen` para dar contexto si el usuario vuelve.

---

### 3.3 Feature C — Chat usuario ↔ agente de salud mental (soporte a `08-salud-mental`)

**Propósito**: diálogo empático con el agente. **Es la feature más sensible del producto**. Cada mensaje se preserva por auditoría, derivación al CVV y aprendizaje supervisado.

**Modelo de datos (MongoDB)**:

```javascript
// DB: chat_salud_mental  ← REPLICADA EN CLUSTER AISLADO
// Colección: sessions
{
  _id: ObjectId,
  usuario_id: "uuid",  // pseudónimo, no PII
  // el campo usuario_id se cifra en reposo (ver § 5.3)
  idioma: "pt" | "es",
  started_at: ISODate,
  last_activity_at: ISODate,

  // SNAPSHOT emocional al inicio de la sesión
  estado_inicial: {
    humor: "feliz" | "cansado" | "triste" | "ansioso" | "sobrecargado",
    nota_semanal: 7,  // 0-10
    contexto: { region: "BR-SP", hora: "21:34" }
  },

  // EVOLUCIÓN detectada durante la sesión
  alertas: [
    {
      tipo: "derivacion_cvv" | "cambio_emocional_significativo" | "mencion_autolesion",
      nota_detectada: 2,
      timestamp: ISODate,
      accion_tomada: "derivacion_cvv_activada" | "recurso_bienestar_sugerido" | "ninguna"
    }
  ],

  // resumen para continuidad entre sesiones (no contiene verbatim)
  resumen_clinico: "string",

  estado: "activa" | "cerrada" | "derivada_cvv"
}

// DB: chat_salud_mental
// Colección: messages  ← CIFRADO EN REPOSO
{
  _id: ObjectId,
  session_id: ObjectId,
  rol: "user" | "assistant" | "system" | "safety_intervention",
  content: "string",  // cifrado a nivel de documento
  content_hash: "sha256",  // para búsqueda sin descifrar
  // análisis automático de cada mensaje (severidad, entidades)
  analisis: {
    sentimiento: "positivo" | "neutro" | "negativo" | "critico",
    riesgo_autolesion: "bajo" | "medio" | "alto",
    entidades: ["familia", "trabajo", "soledad"]
  },
  // si es una intervención de seguridad automática
  safety_metadata: {
    triggered_by: "regex" | "classifier" | "low_mood",
    recurso_sugerido: "recurso_bienestar_id" | null,
    derivacion_activada: true | false
  },
  llm_metadata: {
    model: "string",
    safety_layer: "string",  // qué filtro aplicó
    prompt_tokens: 123,
    completion_tokens: 45
  },
  created_at: ISODate
}
```

**Índices clave**:
- `messages`: `{ session_id: 1, created_at: 1 }`
- `sessions`: `{ usuario_id: 1, last_activity_at: -1 }`
- `sessions`: `{ "alertas.tipo": 1, started_at: -1 }` — auditoría de crisis
- `messages`: `{ "analisis.riesgo_autolesion": 1, created_at: -1 }` — revisión manual
- TTL: **NO** se aplica TTL. La retención es indefinida por compliance hasta solicitud de supresión (LGPD/GDPR).

**Servicios**:
- `POST /chat/salud/sessions` — abrir sesión (asociada a un `/salud` previo)
- `POST /chat/salud/sessions/:id/messages` — enviar mensaje (gated por safety layer)
- `POST /chat/salud/sessions/:id/close` — cerrar sesión explícitamente
- `GET /chat/salud/sessions/:id/messages` — **acceso restringido al propio usuario + admin clínico**
- `POST /chat/salud/sessions/:id/derivar-cvv` — fuerza derivación manual
- `WebSocket /ws/chat/salud` — streaming con safety filter

**Compliance** (no negociable):
- DB aislada en **cluster MongoDB separado** del resto (cumplimiento, contrato con clínicos)
- Cifrado en reposo (AES-256)
- Cifrado en tránsito (TLS 1.3)
- Acceso por rol: `usuario` (solo sus sesiones), `admin_clinico` (revisión), `auditor` (solo metadatos)
- Logs de acceso a esta DB se duplican a un SIEM externo
- Retención indefinida salvo solicitud explícita de supresión (LGPD art. 18)

---

## 4. Estrategia de SQLite (cache)

SQLite se usa como **capa de cache local**, nunca como source of truth. Tres roles diferenciados:

| Capa | Qué cachea | Ubicación | TTL | Invalidación |
|---|---|---|---|---|
| **i18n** | Strings traducidos, mensajes del agente, textos críticos del CVV | Archivo distribuido con el servicio (`i18n.sqlite`, read-only) | Indefinido | Redeploy / cambio de versión |
| **Sesiones** | JWT refresh tokens, claims decodificados, blacklist | SQLite local del servicio auth (`/var/lib/auth/sessions.db`) | Hasta revocación o expiración | Evento `logout`, cambio de contraseña |
| **Respuestas del agente** | Hash del input → respuesta de `/orientar` y `/salud` (no aplica a chat) | SQLite compartido Read replica local | 5-15 min | Cambio de catálogo, deploy del agente |

**Reglas**:
- Si SQLite se borra, el sistema sigue funcionando (se reconstruye)
- SQLite no se replica, no se respalda, no es parte del plan de disaster recovery
- Toda escritura crítica se hace en la DB autoritativa antes de retornar al cliente

---

## 5. Diagrama de despliegue

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          PWA Client (Browser)                              │
└──────────────┬─────────────────────────────────────┬──────────────────────┘
               │ HTTPS                               │ WSS (chat)
               ▼                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                     API Gateway / BFF (Nginx / Kong)                        │
└──────┬──────────┬──────────┬──────────┬──────────┬──────────┬─────────────┘
       │          │          │          │          │          │
       ▼          ▼          ▼          ▼          ▼          ▼
   ┌───────┐  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
   │ auth  │  │perfil  │ │orientar│ │empleab.│ │formac. │ │  exp.  │
   │  svc  │  │  svc   │ │  svc   │ │  svc   │ │  svc   │ │  svc   │
   └───┬───┘  └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘
       │          │          │          │          │          │
       │          │          │          │          │          │
       ▼          ▼          ▼          ▼          ▼          ▼
   ┌──────┐  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
   │ PG 1 │  │  PG 1   │ │  PG 1   │ │ Maria 1 │ │ Maria 1 │ │ Maria 1 │
   │ auth │  │ perfil  │ │orientar │ │empleab. │ │ formac. │ │  exp.   │
   └──────┘  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘

   ┌───────┐  ┌────────┐ ┌─────────┐  ┌─────────────┐
   │mentor.│  │salud   │ │   geo   │  │  chat svc   │  ← 3 features en 1 svc
   │  svc  │  │  svc   │ │  svc    │  │             │
   └───┬───┘  └───┬────┘ └───┬─────┘  └──────┬──────┘
       │          │          │              │
       │          │          │              ├──────────────────┐
       ▼          ▼          ▼              ▼                  ▼
   ┌──────┐  ┌─────────┐ ┌─────────┐  ┌──────────┐  ┌────────────────┐
   │Maria2│  │  PG 2   │ │ Maria 3 │  │ MongoDB  │  │ MongoDB        │
   │mentor│  │ salud   │ │  geo    │  │ CLUSTER  │  │ CLUSTER        │
   └──────┘  └─────────┘ └─────────┘  │  A       │  │ B (aislado)    │
                                     │chat_ment.│  │ chat_salud     │
                                     │chat_ag.or│  │                │
                                     └──────────┘  └────────────────┘
                                          ▲               ▲
                                          │               │
                                  (cifrado en         (cifrado en
                                   reposo, regular)    reposo, AES-256,
                                                       cluster aislado)
```

---

## 6. Comunicación entre servicios

| Origen | Destino | Mecanismo | Por qué |
|---|---|---|---|
| Frontend → servicio | HTTP REST | API Gateway enrutando por path-prefix | Estándar, simple |
| Servicio → Servicio | HTTP REST / gRPC | Llamada síncrona con circuit breaker | Bajo acoplamiento, falla aislada |
| Servicio → chat MongoDB | Driver nativo MongoDB | Lectura/escritura directa | Mismo lenguaje, baja latencia |
| Servicio → otra DB | Driver nativo | Lectura/escritura directa | Sin replicación cross-DB |
| Evento de dominio (ej: `mentoria.aceptada`) | RabbitMQ / Redis Streams | Pub/sub asíncrono | Desacoplamiento, retry, audit |
| Webhook externo (ej: Vísent update) | Endpoint HTTP entrante | POST firmado | Estándar para partners |

**Decisión explícita**: NO usamos **shared database** entre servicios. Cada servicio es dueño de su DB. Si un servicio necesita datos de otro, los pide por HTTP/gRPC o se suscribe al evento.

---

## 7. Estrategia de cache SQLite (detalle)

### 7.1 i18n (read-only distribuido)
- Archivo `i18n.sqlite` empaquetado en la imagen del contenedor
- Tablas: `strings(key, locale, value, context)`, `agent_messages(agent, locale, content)`
- Carga al boot del servicio, vive en memoria
- Cambio: redeploy con nueva versión del archivo

### 7.2 Sesiones (local escribible)
- Archivo `/var/lib/auth/sessions.db`
- Tablas: `active_sessions(jti, user_id, expires_at, claims_json)`, `revoked_tokens(jti, revoked_at)`
- Limpieza periódica de sesiones expiradas (cron cada hora)
- Replicación: ninguna (se reconstruye del servicio auth si se pierde)

### 7.3 Respuestas del agente (read-through)
- Archivo `/var/lib/orientar/cache.db`
- Tabla: `agent_responses(input_hash, model, response_json, created_at, ttl_seconds)`
- Lookup por hash SHA-256 del input
- TTL en columna, cleanup diario
- Permite responder idéntica pregunta en <50ms sin llamar al LLM

---

## 8. Trade-offs explícitos

### Lo que ganamos con la separación

- **Modelo de datos por contexto**: MongoDB para documentos, PostgreSQL para transacciones, MariaDB para catálogos — cada uno con su sweet spot
- **Aislamiento de compliance**: la DB de salud-mental vive en cluster separado, contrato clínico aislado
- **Escalado independiente**: chat puede escalar horizontalmente (MongoDB sharding) sin tocar al resto
- **Chat rápido de iterar**: agregar features a MongoDB (adjuntos, polls, threads) no requiere migraciones relacionales

### Lo que pagamos

- **Operacional**: 4 motores = 4 backups, 4 monitoreos, 4 upgrades de seguridad
- **Transacciones distribuidas**: ej: crear `aplicacion` (MariaDB) + notificar al chat (MongoDB) requiere patrón **saga** o **outbox**
- **Sin joins cross-DB**: si `/orientar` necesita ver mensajes del chat, hay que hacer 2 queries + merge en el servicio
- **Curva de aprendizaje**: el equipo debe conocer 4 motores
- **Costo de infraestructura**: en MVP, 4 DBs pequeñas cuestan más que 1 grande

### Por qué sigue siendo buena idea para este proyecto

- 3 features de chat son fundamentalmente distintas (mentor↔usuario, agente IA, salud mental crítica) y justifican cada una su DB lógica
- La separación por compliance en salud-mental es **no negociable** — no es opcional
- PostgreSQL sigue siendo el backbone para todo lo transaccional (no partimos los datos de usuario)
- SQLite es prácticamente gratis (vive en el contenedor)

---

## 9. Alternativa: arquitectura simplificada (para considerar)

Si la complejidad operativa resulta excesiva, hay un plan B con **una sola PostgreSQL + SQLite**:

| Capa original | Alternativa |
|---|---|
| PostgreSQL auth, perfil, orientar, salud | Una sola PostgreSQL, schemas separados |
| MariaDB catálogos | PostgreSQL con índices optimizados |
| MongoDB chat mentor | PostgreSQL con JSONB (peor performance pero viable) |
| MongoDB chat agente orientar | PostgreSQL con JSONB + tabla de mensajes |
| MongoDB chat salud (cluster aislado) | **Se mantiene en MongoDB aislado** por compliance |
| SQLite cache | Igual |

**Trade-off**: se reduce a 2 motores (PostgreSQL + MongoDB solo para salud) + SQLite. Pierde rendimiento de chat (joins con documentos embebidos) pero operacionalmente es 3x más simple.

---

## 10. Decisiones pendientes

1. **WebSocket para chat**: ¿MVP usa solo polling? ¿O asumimos WebSocket desde día 1? — Afecta el deploy (sticky sessions en Railway)
2. **Sharding de MongoDB**: ¿un solo replica set o cluster shardeado desde el inicio? — Para MVP, replica set de 3 nodos es suficiente
3. **Outbox vs 2PC**: para transacciones cross-DB (ej: aplicacion + chat), ¿implementamos outbox pattern o aceptamos eventual consistency?
4. **Región del cluster de salud-mental**: ¿Brasil (LGPD) o región separada por compliance del proveedor?
5. **Anonimización de mensajes de salud**: ¿a los cuántos meses seudonimizamos al usuario manteniendo el verbatim? — definir política legal

---

## 11. Próximos pasos

1. Validar este documento con el equipo y producto
2. Si se aprueba la distribución multi-motor, agregar a `doc/database/schema.md` los modelos de MongoDB
3. Crear issues con template `03-task.md` para los servicios de chat (3 features)
4. Decidir hosting: Railway soporta PostgreSQL y MongoDB; MariaDB requiere contenedor custom
5. Sprint 0: levantar las 4 DBs vacías con migraciones iniciales y seeds mínimos

---

*Última actualización: 2026-06-11*
