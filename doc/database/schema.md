# Esquema de Base de Datos — App BiT

> Documento vivo. Las historias de usuario referencian entidades por nombre.
> Convenciones: snake_case, PK `id` UUID, timestamps `created_at` / `updated_at` en todas las tablas.

---

## 1. Diagrama lógico de alto nivel

```
                        ┌──────────────┐
                        │   usuario    │ (perfil personal + profesional)
                        └──────┬───────┘
                               │ 1
        ┌──────────────┬───────┼──────────────┬──────────────┬──────────────┐
        │ N            │ N     │ N            │ N            │ N            │ N
   ┌────▼─────┐  ┌─────▼────┐ ┌▼────────────┐ ┌▼───────────┐ ┌▼────────────┐ ┌▼────────────┐
   │ formacion│  │  vacante │ │ checkin     │ │experiencia │ │mentoria     │ │sesion_      │
   │ trayecto │  │ aplicac. │ │ emocional   │ │ evento     │ │invitacion   │ │ derivacion  │
   └────┬─────┘  └─────┬────┘ └─────┬───────┘ └─────┬──────┘ └──────┬──────┘ └──────┬──────┘
        │              │            │               │              │               │
        │              │            │               │              │               │
        ▼              ▼            ▼               ▼              ▼               ▼
   ┌─────────┐  ┌──────────┐ ┌──────────┐  ┌──────────────┐ ┌──────────┐   ┌────────────┐
   │ curso   │  │ empresa  │ │ recurso  │  │ testimonio   │ │ mentor   │   │ cvv_       │
   │         │  │          │ │ bienestar│  │              │ │          │   │ derivacion │
   └─────────┘  └──────────┘ └──────────┘  └──────────────┘ └──────────┘   └────────────┘

   ┌──────────────────────┐    ┌──────────────────┐
   │ zona_visent (geo)    │    │ evento_visent    │
   └──────────────────────┘    └──────────────────┘
```

---

## 2. Entidades

### 2.1 `usuario`
Perfil unificado de la persona usuaria. Combina datos personales y profesionales.

| Campo | Tipo | Restricciones | Notas |
|---|---|---|---|
| id | UUID | PK | |
| email | VARCHAR(255) | UNIQUE, NOT NULL | |
| password_hash | VARCHAR(255) | NOT NULL | |
| nombre | VARCHAR(120) | NOT NULL | |
| fecha_nacimiento | DATE | NOT NULL | |
| genero | VARCHAR(40) | NULL | libre, sin enum rígido |
| escolaridad | VARCHAR(80) | NOT NULL | |
| continente | VARCHAR(60) | NOT NULL | |
| pais | VARCHAR(60) | NOT NULL | ISO-3166 |
| estado | VARCHAR(60) | NULL | sub-nacional (BR) |
| ciudad | VARCHAR(120) | NOT NULL | |
| whatsapp | VARCHAR(30) | NULL | E.164 |
| idioma_preferido | VARCHAR(5) | NOT NULL DEFAULT 'pt' | BCP-47 (`pt`, `es`) |
| nivel_profesional | VARCHAR(40) | NOT NULL | estudiante / graduado / profesional |
| area_tecnologia | VARCHAR(80) | NULL | |
| objetivo | VARCHAR(40) | NOT NULL | estudiar / definir_camino / buscar_empleo / cambiar_empleo |
| lat | DECIMAL(9,6) | NULL | geolocalización aproximada |
| lng | DECIMAL(9,6) | NULL | |
| **cpf** | **VARCHAR(11)** | **UNIQUE NULL, cifrado aplicación** | **Brasileños, opcional, futuro RNDS/SUS** |
| **documento_nacional_tipo** | **VARCHAR(20)** | **NULL** | **DNI, Cédula, CPF, etc.** |
| **documento_nacional_numero** | **VARCHAR(40)** | **NULL, cifrado aplicación** | **Número del documento** |
| **documento_nacional_pais** | **VARCHAR(60)** | **NULL** | **País emisor ISO-3166** |
| onboarding_completo | BOOLEAN | NOT NULL DEFAULT FALSE | |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | |

### 2.2 `empresa`
Empleadores que publican vacantes (HU-04-EM).

| Campo | Tipo | Restricciones |
|---|---|---|
| id | UUID | PK |
| nombre | VARCHAR(160) | NOT NULL |
| sitio_web | VARCHAR(255) | NULL |
| pais | VARCHAR(60) | NOT NULL |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |

### 2.3 `vacante`
Oportunidades laborales (HU-04-EM).

| Campo | Tipo | Restricciones |
|---|---|---|
| id | UUID | PK |
| empresa_id | UUID | FK → empresa.id, NOT NULL |
| titulo | VARCHAR(160) | NOT NULL |
| descripcion | TEXT | NOT NULL |
| requisitos | JSONB | NOT NULL — lista de skills/competencias |
| nivel | VARCHAR(40) | NOT NULL |
| area | VARCHAR(80) | NOT NULL |
| idioma | VARCHAR(5) | NOT NULL DEFAULT 'pt' |
| activa | BOOLEAN | NOT NULL DEFAULT TRUE |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |

### 2.4 `aplicacion`
Postulación de un usuario a una vacante.

| Campo | Tipo | Restricciones |
|---|---|---|
| id | UUID | PK |
| usuario_id | UUID | FK → usuario.id, NOT NULL |
| vacante_id | UUID | FK → vacante.id, NOT NULL |
| gap_porcentual | SMALLINT | NOT NULL CHECK (gap_porcentual BETWEEN 0 AND 100) |
| estado | VARCHAR(30) | NOT NULL DEFAULT 'pendiente' |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |

UNIQUE (usuario_id, vacante_id).

### 2.5 `curso`
Formaciones disponibles gratuitas o pagas.

| Campo | Tipo | Restricciones |
|---|---|---|
| id | UUID | PK |
| titulo | VARCHAR(200) | NOT NULL |
| proveedor | VARCHAR(120) | NOT NULL | Google Cloud, Oracle/Alura, etc. |
| url | VARCHAR(500) | NOT NULL |
| es_gratuito | BOOLEAN | NOT NULL |
| duracion_horas | INT | NULL |
| nivel | VARCHAR(40) | NOT NULL |
| area | VARCHAR(80) | NOT NULL |
| skills_impartidos | JSONB | NOT NULL | array de skills |
| idioma | VARCHAR(5) | NOT NULL DEFAULT 'pt' |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |

### 2.6 `trayectoria`
Secuencia sugerida de cursos para cerrar el gap de un usuario.

| Campo | Tipo | Restricciones |
|---|---|---|
| id | UUID | PK |
| usuario_id | UUID | FK → usuario.id, NOT NULL |
| gap_items | JSONB | NOT NULL | skills faltantes |
| cursos_sugeridos | JSONB | NOT NULL | orden de cursos |
| generada_en | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |
| activa | BOOLEAN | NOT NULL DEFAULT TRUE |

### 2.7 `checkin_emocional`
Registro diario de humor (HU-08-SM). Schema "FHIR-friendly" para futura interoperabilidad clínica.

| Campo | Tipo | Restricciones | Notas |
|---|---|---|---|
| id | UUID | PK | |
| usuario_id | UUID | FK → usuario.id, NOT NULL | |
| humor | VARCHAR(20) | NOT NULL | feliz / cansado / triste / ansioso / sobrecargado |
| **humor_codigo** | **VARCHAR(20)** | **NULL** | **Código SNOMED, ej: `44054006` (tristeza)** |
| nota_semanal | SMALLINT | NULL CHECK (0-10) | gatillo CVV si < 4 |
| **escala_usada** | **VARCHAR(40)** | **NULL** | **PHQ-9, GAD-7, WHO-5, libre** |
| **escala_codigo_loinc** | **VARCHAR(20)** | **NULL** | **Código LOINC de la escala, ej: `44261-6` (PHQ-9)** |
| **escala_items_json** | **JSONB** | **NULL** | **Items individuales: `{"q1": 2, "q2": 3, ...}`** |
| **puntuacion_total** | **DECIMAL(5,2)** | **NULL** | **Puntuación estandarizada según escala** |
| **interpretacion** | **VARCHAR(40)** | **NULL** | **leve, moderado, severo, etc.** |
| contexto | JSONB | NULL | texto libre, region, hora |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | |

### 2.8 `recurso_bienestar`
Catálogo de acciones concretas (libro, podcast, serie, caminata).

| Campo | Tipo | Restricciones | Notas |
|---|---|---|---|
| id | UUID | PK | |
| tipo | VARCHAR(30) | NOT NULL | libro / podcast / serie / actividad / otro |
| titulo | VARCHAR(200) | NOT NULL | |
| url | VARCHAR(500) | NULL | |
| descripcion | TEXT | NOT NULL | |
| humor_asociado | JSONB | NOT NULL | array de humores donde aplica |
| **categoria_clinica** | **VARCHAR(40)** | **NULL** | **Categoría SNOMED (actividad, mindfulness, etc.)** |
| **indicaciones_json** | **JSONB** | **NULL** | **Array de códigos SNOMED/LOINC para los que aplica** |
| region | VARCHAR(60) | NULL | si es actividad física/geográfica |
| idioma | VARCHAR(5) | NOT NULL DEFAULT 'pt' | |
| descargable | BOOLEAN | NOT NULL DEFAULT FALSE | para modo offline |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | |

### 2.9 `derivacion_cvv`
Log de derivaciones al CVV por crisis (HU-08-SM).

| Campo | Tipo | Restricciones | Notas |
|---|---|---|---|
| id | UUID | PK | |
| usuario_id | UUID | FK → usuario.id, NOT NULL | |
| checkin_id | UUID | FK → checkin_emocional.id, NOT NULL | |
| nota_detectada | SMALLINT | NOT NULL | |
| **motivo_clinico_codigo** | **VARCHAR(20)** | **NULL** | **Código CID-10 o SNOMED del motivo** |
| **servicio_destino** | **VARCHAR(80)** | **NULL** | **CVV, CAPS, SUS-emergencia, hospital** |
| **urgencia** | **VARCHAR(20)** | **NULL** | **inmediata, 24h, 1-semana** |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | |

### 2.10 `experiencia_evento`
Eventos en vivo o grabados con testimonios (HU-06-EX).

| Campo | Tipo | Restricciones |
|---|---|---|
| id | UUID | PK |
| titulo | VARCHAR(200) | NOT NULL |
| descripcion | TEXT | NOT NULL |
| fecha_evento | TIMESTAMPTZ | NULL | NULL si es grabado |
| es_en_vivo | BOOLEAN | NOT NULL |
| url | VARCHAR(500) | NULL |
| idioma | VARCHAR(5) | NOT NULL DEFAULT 'pt' |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |

### 2.11 `testimonio`
Historias reales de referentes usadas en eventos (HU-06-EX).

| Campo | Tipo | Restricciones |
|---|---|---|
| id | UUID | PK |
| evento_id | UUID | FK → experiencia_evento.id, NULL | puede ser independiente |
| nombre | VARCHAR(160) | NOT NULL |
| rol_actual | VARCHAR(200) | NOT NULL | CEO, líder, etc. |
| trayectoria_resumida | TEXT | NOT NULL |
| url_video | VARCHAR(500) | NULL |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |

### 2.12 `mentor`
Profesionales que ofrecen mentorías (HU-07-MT).

| Campo | Tipo | Restricciones |
|---|---|---|
| id | UUID | PK |
| usuario_id | UUID | FK → usuario.id, UNIQUE, NOT NULL |
| area | VARCHAR(80) | NOT NULL |
| biografia | TEXT | NOT NULL |
| ofrece_practica | BOOLEAN | NOT NULL DEFAULT TRUE | networking humanizado |
| disponibilidad | JSONB | NOT NULL | slots semanales |
| activo | BOOLEAN | NOT NULL DEFAULT TRUE |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |

### 2.13 `mentoria_invitacion`
Invitaciones mentor → usuario (práctica o conversación).

| Campo | Tipo | Restricciones |
|---|---|---|
| id | UUID | PK |
| mentor_id | UUID | FK → mentor.id, NOT NULL |
| usuario_id | UUID | FK → usuario.id, NOT NULL |
| tipo | VARCHAR(20) | NOT NULL | conversacion / practica |
| mensaje | TEXT | NULL |
| estado | VARCHAR(20) | NOT NULL DEFAULT 'pendiente' |
| agendada_para | TIMESTAMPTZ | NULL |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |

### 2.14 `zona_visent`
Dataset Vísent CDRView: concentración de personas + cobertura ERB (HU-09-GE).

| Campo | Tipo | Restricciones |
|---|---|---|
| id | UUID | PK |
| lat | DECIMAL(9,6) | NOT NULL |
| lng | DECIMAL(9,6) | NOT NULL |
| concentracion_personas | INT | NOT NULL |
| cobertura_red | VARCHAR(10) | NOT NULL | 5G / 4G / 3G / sin_cobertura |

### 2.15 `evento_visent`
Eventos y recursos cercanos inferidos desde el dataset.

| Campo | Tipo | Restricciones |
|---|---|---|
| id | UUID | PK |
| zona_id | UUID | FK → zona_visent.id, NOT NULL |
| titulo | VARCHAR(200) | NOT NULL |
| descripcion | TEXT | NOT NULL |
| lat | DECIMAL(9,6) | NOT NULL |
| lng | DECIMAL(9,6) | NOT NULL |
| fecha | TIMESTAMPTZ | NULL |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |

### 2.16 `terminologia_clinica`
Catálogo de vocabularios clínicos controlados (LOINC, SNOMED CT, CID-10, CIAP-2). Soporta la interoperabilidad clínica regional (ver `doc/arquitectura/seguridad-compliance.md` §16).

| Campo | Tipo | Restricciones | Notas |
|---|---|---|---|
| id | UUID | PK | |
| sistema | VARCHAR(20) | NOT NULL | `LOINC` / `SNOMED` / `CID-10` / `CIAP-2` |
| codigo | VARCHAR(40) | NOT NULL | código del término en el sistema |
| descripcion | TEXT | NOT NULL | glosa del término |
| categoria | VARCHAR(80) | NULL | agrupamiento (ej: "escala-depresion") |
| padre | VARCHAR(40) | NULL | para jerarquías SNOMED |
| idioma | VARCHAR(5) | NOT NULL DEFAULT 'pt' | BCP-47 |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | |

UNIQUE (sistema, codigo, idioma).

**Seed inicial** (cantidades estimadas):
- LOINC: ~50 códigos de escalas (PHQ-9, GAD-7, WHO-5, BDI)
- SNOMED CT: ~200 códigos (síntomas emocionales, trastornos, actividades de bienestar)
- CID-10: capítulo V (F00-F99) completo, ~300 códigos
- CIAP-2: componente 2 (problemas psicológicos) completo, ~80 códigos

### 2.17 `outbox_events`
Patrón outbox para garantizar publicación de eventos cross-service. Vive en la misma DB que el agregado que origina el evento, en la misma transacción.

| Campo | Tipo | Restricciones | Notas |
|---|---|---|---|
| id | UUID | PK | |
| aggregate_id | UUID | NOT NULL | ID del agregado (ej: invitación_id) |
| aggregate_type | VARCHAR(40) | NOT NULL | tipo de agregado (ej: `mentoria_invitacion`) |
| event_type | VARCHAR(80) | NOT NULL | tipo del evento (ej: `mentoria.invitacion.aceptada.v1`) |
| payload | JSONB | NOT NULL | contenido del evento (CloudEvents 1.0) |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | |
| published_at | TIMESTAMPTZ | NULL | cuando el outbox poller lo publicó a RabbitMQ |
| attempts | INT | NOT NULL DEFAULT 0 | contador de reintentos del poller |
| last_error | TEXT | NULL | último error de publicación |

Índice: `CREATE INDEX idx_outbox_pending ON outbox_events (created_at) WHERE published_at IS NULL;`

### 2.18 `sagas`
Estado visible al usuario durante transacciones cross-service. Permite a la UI mostrar "procesando..." con timeout explícito y rollback si es necesario.

| Campo | Tipo | Restricciones | Notas |
|---|---|---|---|
| id | UUID | PK | |
| tipo | VARCHAR(80) | NOT NULL | ej: `mentoria.aceptar`, `vacante.postular` |
| usuario_id | UUID | NOT NULL | dueño de la saga |
| estado | VARCHAR(20) | NOT NULL | `pending` / `processing` / `completed` / `rolling_back` / `rolled_back` |
| metadata | JSONB | NULL | contexto adicional (saga_id del emisor, etc.) |
| started_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | |
| completed_at | TIMESTAMPTZ | NULL | |
| error | TEXT | NULL | motivo de fallo si aplica |

Índices:
- `(usuario_id, started_at DESC)` — sagas del usuario, recientes primero
- `(estado) WHERE estado NOT IN ('completed', 'rolled_back')` — sagas activas

---

## 3. Índices recomendados

- `usuario(email)` UNIQUE
- `vacante(activa, area, nivel)` — feed principal
- `aplicacion(usuario_id, created_at DESC)` — historial del usuario
- `trayectoria(usuario_id, activa)` — última trayectoria activa
- `checkin_emocional(usuario_id, created_at DESC)` — serie temporal
- `curso(area, nivel, es_gratuito)` — buscador de formaciones
- `mentoria_invitacion(usuario_id, estado)` — bandeja del usuario
- `zona_visent(lat, lng)` — radio de búsqueda geográfico
- `evento_visent(zona_id, fecha)` — eventos por zona

---

## 4. Relaciones (resumen)

- `usuario` 1—N `aplicacion`, `trayectoria`, `checkin_emocional`, `mentoria_invitacion`, `derivacion_cvv`, `sagas`
- `empresa` 1—N `vacante`
- `vacante` 1—N `aplicacion`
- `usuario` 1—0..1 `mentor` (mismo registro puede actuar como mentor)
- `mentor` 1—N `mentoria_invitacion`
- `experiencia_evento` 1—N `testimonio`
- `zona_visent` 1—N `evento_visent`
- `outbox_events`: referencia lógica al agregado vía `aggregate_id` (sin FK; vive en la misma DB)
- `terminologia_clinica`: independiente, sin FKs (es un catálogo de referencia)

---

## 5. Consideraciones de diseño

1. **Personalización sin rigidez**: `humor`, `genero`, `escolaridad` son `VARCHAR` libre para no excluir identidades fuera de enums.
2. **Multilengüe desde el inicio**: `idioma` en `vacante`, `curso`, `recurso_bienestar`, `experiencia_evento`. `usuario.idioma_preferido` dirige la consulta.
3. **Offline-friendly**: `recurso_bienestar.descargable` permite bundlear contenido para zonas sin cobertura estable.
4. **Trazabilidad emocional**: `derivacion_cvv` queda en log aunque el checkin sea anónimo en la UI — el sistema necesita evidencia para auditoría.
5. **Gap como dato vivo**: `aplicacion.gap_porcentual` y `trayectoria.gap_items` se recalculan; nunca se borra el histórico, se inactiva la versión vieja (`trayectoria.activa`).
6. **PII mínima para geolocalización**: `lat`/`lng` se almacenan a nivel de perfil para no recalcular por request; el match radio se hace contra `zona_visent` agregada, no contra coordenadas crudas del usuario en cada request.

---

## 6. Modelos de MongoDB (mensajería)

La distribución multi-motor (ver `doc/arquitectura/distribucion-db.md`) define que **3 features de chat** viven en MongoDB, una database lógica por feature dentro de un cluster (con la DB de salud-mental en cluster aislado por compliance).

> **Convención**: `_id` es `ObjectId` nativo de MongoDB. Las FKs hacia PostgreSQL/MariaDB son `string` con UUID v4. Los timestamps son `ISODate` (BSON datetime, equivalente a UTC).

### 6.1 Cluster A — `chat_mentoria`

#### 6.1.1 `conversations`
Mensajería asíncrona entre un mentor y un usuario, anclada a una `mentoria_invitacion` (que vive en MariaDB).

```javascript
{
  _id: ObjectId,
  invitacion_id: "uuid",  // FK lógica → MariaDB.mentoria_invitacion.id
  mentor_id: "uuid",      // FK lógica → MariaDB.mentor.usuario_id
  usuario_id: "uuid",     // FK lógica → PostgreSQL.usuario.id
  estado: "activa" | "cerrada",
  metadata: {
    tipo: "conversacion" | "practica",
    area: "frontend",
    idioma: "pt"
  },
  created_at: ISODate,
  last_message_at: ISODate
}
```

**Índices**:
- `{ usuario_id: 1, last_message_at: -1 }` — bandeja del usuario
- `{ mentor_id: 1, last_message_at: -1 }` — bandeja del mentor
- `{ invitacion_id: 1 }` UNIQUE — solo una conversación por invitación aceptada

#### 6.1.2 `messages`

```javascript
{
  _id: ObjectId,
  conversation_id: ObjectId,
  sender_id: "uuid",
  sender_rol: "mentor" | "usuario",
  content: "string",  // texto plano o markdown simple (sin HTML)
  attachments: [
    { tipo: "imagen" | "archivo" | "link", url: "string", nombre: "string" }
  ],
  read_by: [
    { user_id: "uuid", read_at: ISODate }
  ],
  created_at: ISODate,
  edited_at: ISODate | null,
  deleted: false  // soft delete, no se borra el registro
}
```

**Índices**:
- `{ conversation_id: 1, created_at: -1 }` — feed cronológico
- `{ conversation_id: 1, "read_by.user_id": 1 }` — contar no leídos por usuario

**Retención**: 24 meses en estado activo, luego se anonimiza (`content` se reemplaza por hash, `attachments` se eliminan).

---

### 6.2 Cluster A — `chat_agente_orientar`

#### 6.2.1 `sessions`
Sesión conversacional con el agente IA que genera `/orientar`.

```javascript
{
  _id: ObjectId,
  usuario_id: "uuid",
  idioma: "pt" | "es",
  contexto_perfil: {
    nivel: "junior",
    area: "frontend",
    objetivo: "buscar_empleo",
    gap_actual: ["kubernetes", "terraform"]
  },
  resumen: "string",  // resumen acumulado para no enviar todo el historial al LLM
  entidades_mencionadas: {
    vacantes: ["uuid", "uuid"],
    cursos: ["uuid"],
    trayectorias: ["uuid"]
  },
  total_tokens_estimados: 1234,
  started_at: ISODate,
  last_activity_at: ISODate
}
```

**Índices**:
- `{ usuario_id: 1, last_activity_at: -1 }` — sesiones activas del usuario
- `{ last_activity_at: 1 }` con `expireAfterSeconds: 7776000` — TTL 90 días

#### 6.2.2 `messages`

```javascript
{
  _id: ObjectId,
  session_id: ObjectId,
  rol: "user" | "assistant" | "system" | "tool",
  content: "string",
  tool_calls: [
    {
      nombre: "calcular_gap" | "sugerir_vacante" | "recomendar_curso",
      args: { ... },
      resultado_id: "uuid"
    }
  ],
  llm_metadata: {
    model: "gpt-4",
    prompt_tokens: 234,
    completion_tokens: 56,
    latency_ms: 850,
    temperature: 0.7
  },
  feedback: {
    util: true | false | null,
    comentario: "string" | null
  },
  created_at: ISODate
}
```

**Índices**:
- `{ session_id: 1, created_at: 1 }` — feed cronológico
- `{ rol: 1, "feedback.util": 1 }` — análisis de calidad

**Retención**: TTL 90 días a través de la sesión padre. El `resumen` se conserva en `sessions.resumen` para mantener contexto si el usuario vuelve.

---

### 6.3 Cluster B (aislado) — `chat_salud_mental`

> **Compliance crítico**: cluster MongoDB separado físicamente, cifrado AES-256 a nivel de documento, acceso restringido a `admin_clinico` con acuerdo de confidencialidad, logs de acceso a SIEM externo.

#### 6.3.1 `sessions`

```javascript
{
  _id: ObjectId,
  // usuario_id es seudónimo (SHA-256 + sal por entorno) — no se guarda el UUID real
  usuario_id_hash: "hex_string_64_chars",
  idioma: "pt" | "es",
  estado_inicial: {
    humor: "feliz" | "cansado" | "triste" | "ansioso" | "sobrecargado",
    nota_semanal: 7,  // 0-10
    contexto: { region: "BR-SP", hora: "21:34" }
  },
  alertas: [
    {
      tipo: "derivacion_cvv" | "cambio_emocional_significativo" | "mencion_autolesion",
      nota_detectada: 2,
      timestamp: ISODate,
      accion_tomada: "derivacion_cvv_activada" | "recurso_bienestar_sugerido" | "ninguna"
    }
  ],
  resumen_clinico: "string",  // generado por el LLM, no contiene verbatim
  estado: "activa" | "cerrada" | "derivada_cvv",
  started_at: ISODate,
  last_activity_at: ISODate
}
```

**Índices**:
- `{ usuario_id_hash: 1, last_activity_at: -1 }`
- `{ "alertas.tipo": 1, started_at: -1 }` — auditoría de crisis
- **NO** se aplica TTL (retención indefinida por compliance)

#### 6.3.2 `messages` (cifrado a nivel de documento)

```javascript
{
  _id: ObjectId,
  session_id: ObjectId,
  rol: "user" | "assistant" | "system" | "safety_intervention",
  // content está cifrado con AES-256-GCM usando KMS
  content_encrypted: "base64_blob",
  content_hash: "sha256_hex",  // para búsqueda sin descifrar
  iv: "base64_iv_12_bytes",
  auth_tag: "base64_16_bytes",
  analisis: {
    sentimiento: "positivo" | "neutro" | "negativo" | "critico",
    riesgo_autolesion: "bajo" | "medio" | "alto",
    entidades: ["familia", "trabajo", "soledad"]
  },
  safety_metadata: {
    triggered_by: "regex" | "classifier" | "low_mood",
    recurso_sugerido: "recurso_bienestar_id" | null,
    derivacion_activada: true | false
  },
  llm_metadata: {
    model: "gpt-4",
    safety_layer: "layer-2-clinical",
    prompt_tokens: 234,
    completion_tokens: 56
  },
  created_at: ISODate
}
```

**Índices**:
- `{ session_id: 1, created_at: 1 }`
- `{ "analisis.riesgo_autolesion": 1, created_at: -1 }` — revisión clínica priorizada

**Retención**: indefinida. A los 24 meses de inactividad, el `usuario_id_hash` se reemplaza por un nuevo hash anónimo y se conserva el verbatim cifrado.

---

## 7. Modelo de datos de SQLite (cache)

SQLite se usa en 3 roles diferenciados, **todos como cache local, nunca source of truth**.

### 7.1 `i18n.sqlite` (read-only distribuido)

```sql
CREATE TABLE strings (
  key        TEXT NOT NULL,
  locale     TEXT NOT NULL,  -- 'pt-BR' | 'es-419'
  value      TEXT NOT NULL,
  context    TEXT,           -- 'home', 'error', 'agent' para desambiguar
  updated_at TEXT NOT NULL,
  PRIMARY KEY (key, locale, context)
);

CREATE TABLE agent_messages (
  agent      TEXT NOT NULL,  -- 'orientar' | 'salud' | 'cvv'
  locale     TEXT NOT NULL,
  key        TEXT NOT NULL,  -- 'welcome', 'crisis.intro'
  content    TEXT NOT NULL,
  PRIMARY KEY (agent, locale, key)
);
```

**Distribución**: empaquetado en la imagen Docker, montado read-only en `/var/lib/i18n/i18n.sqlite`.

### 7.2 `sessions.db` (escribible, en auth-svc)

```sql
CREATE TABLE refresh_tokens (
  jti          TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL,
  expires_at   INTEGER NOT NULL,  -- unix timestamp
  claims_json  TEXT NOT NULL,
  created_at   INTEGER NOT NULL
);

CREATE TABLE revoked_tokens (
  jti          TEXT PRIMARY KEY,
  revoked_at   INTEGER NOT NULL,
  expires_at   INTEGER NOT NULL  -- se puede purgar cuando expira
);

CREATE INDEX idx_refresh_user ON refresh_tokens (user_id);
CREATE INDEX idx_refresh_expires ON refresh_tokens (expires_at);
```

**Cleanup**: cron cada hora que borra tokens expirados.

### 7.3 `agent_cache.db` (read-through cache)

```sql
CREATE TABLE agent_responses (
  input_hash    TEXT NOT NULL,        -- SHA-256 del input normalizado
  agent         TEXT NOT NULL,        -- 'orientar' | 'salud'
  model         TEXT NOT NULL,
  response_json TEXT NOT NULL,
  created_at    INTEGER NOT NULL,
  ttl_seconds   INTEGER NOT NULL,
  PRIMARY KEY (agent, input_hash)
);

CREATE INDEX idx_agent_cache_created ON agent_responses (created_at);
```

**Cleanup**: job diario que borra entradas con `created_at + ttl_seconds < NOW()`.

---

## 8. Resumen de DBs y feature → motor

| Feature / bounded context | Motor | Database | Schema/Colección principal |
|---|---|---|---|
| Auth, sesiones | PostgreSQL | `auth` | `usuario`, `outbox_events` |
| Perfil | PostgreSQL | `perfil` | `usuario` (compartido lógicamente) |
| Orientar (datos) | PostgreSQL | `orientar` | `vacante`, `curso`, `trayectoria` |
| Empleabilidad | MariaDB | `empleabilidad` | `empresa`, `vacante`, `aplicacion` |
| Formaciones | MariaDB | `formaciones` | `curso`, `trayectoria` |
| Experiencias | MariaDB | `experiencias` | `experiencia_evento`, `testimonio` |
| Mentoría (core) | MariaDB | `mentoria` | `mentor`, `mentoria_invitacion` |
| Salud (datos) | PostgreSQL | `salud` | `checkin_emocional`, `recurso_bienestar`, `derivacion_cvv` |
| Geolocalización | MariaDB | `geo` | `zona_visent`, `evento_visent` |
| **Chat mentor↔usuario** | **MongoDB** | `chat_mentoria` | `conversations`, `messages` |
| **Chat agente orientar** | **MongoDB** | `chat_agente_orientar` | `sessions`, `messages` |
| **Chat salud (cluster aislado)** | **MongoDB** | `chat_salud_mental` | `sessions`, `messages` (cifrado) |
| i18n cache | SQLite | (archivo) | `strings`, `agent_messages` |
| Auth sessions cache | SQLite | (archivo) | `refresh_tokens`, `revoked_tokens` |
| Agent responses cache | SQLite | (archivo) | `agent_responses` |

> Las FKs entre DBs distintas son siempre **lógicas** (UUID string), nunca constraints. La integridad se valida en el servicio que cruza datos.
