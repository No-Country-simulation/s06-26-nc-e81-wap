# Módulo 07 — Mentorias (Networking Humanizado)

> **Rama módulo**: `feat/appbit/mentorias` (core de mentores, NO el chat — el chat está en módulo 11.A)
> **DB**: **MariaDB 11+** (dockerizado en Railway)
> **Entidades DB**: `mentor`, `mentoria_invitacion` (MariaDB). El chat vive en MongoDB `chat_mentoria` (módulo 11.A)
> **SLO**: 99% disponibilidad

---

## US-07-MT-01 — Ver mentores disponibles

**Como** usuario  
**quiero** ver mentores disponibles en mi área  
**para** elegir con quién quiero conectar.

### Criterios de aceptación

- [ ] Ruta `/mentorias` con grid de mentores.
- [ ] Cada card muestra: nombre, área, biografía breve, disponibilidad próxima, badge "ofrece práctica".
- [ ] Filtros: área, idioma, ofrece_practica, disponibilidad.
- [ ] Búsqueda por texto.

### Tareas técnicas derivadas

- `task/appbit/mentorias/mentor-list-screen`
- `task/appbit/mentorias/mentor-filters`
- `task/appbit/mentorias/mentor-endpoint` — `GET /mentores` (MariaDB)
- `task/appbit/mentorias/glitchtip-instrumentation`
- `task/appbit/mentorias/k6-shallow-test`
- `task/appbit/mentorias/dockerfile`

---

## US-07-MT-02 — Ver detalle de un mentor

**Como** usuario  
**quiero** ver el perfil completo de un mentor  
**para** decidir si es buena opción para mí.

### Criterios de aceptación

- [ ] Ruta `/mentorias/[id]`.
- [ ] Muestra: nombre, rol actual, biografía, áreas de expertise, trayectoria.
- [ ] Slots de disponibilidad próximos (semana actual y siguiente).
- [ ] CTA "Solicitar conversación" o "Pedir práctica" según `ofrece_practica`.

### Tareas técnicas derivadas

- `task/appbit/mentorias/mentor-detail-screen`
- `task/appbit/mentorias/disponibilidad-render`

---

## US-07-MT-03 — Solicitar mentoría

**Como** usuario  
**quiero** enviar una solicitud de mentoría a un mentor  
**para** iniciar la conversación.

### Criterios de aceptación

- [ ] Modal con: tipo (`conversacion` | `practica`), mensaje libre (opcional), slot preferido.
- [ ] Crea `mentoria_invitacion` con `estado='pendiente'`.
- [ ] Notifica al mentor por email.
- [ ] Usuario ve la solicitud en `/mentorias/mis-solicitudes`.
- [ ] GlitchTip captura errores.

### Tareas técnicas derivadas

- `task/appbit/mentorias/solicitud-modal`
- `task/appbit/mentorias/solicitud-endpoint` — `POST /mentoria-invitaciones`
- `task/appbit/mentorias/email-notify`

---

## US-07-MT-04 — Gestionar invitaciones como mentor

**Como** mentor  
**quiero** ver, aceptar o rechazar invitaciones  
**para** organizar mi agenda.

### Criterios de aceptación

- [ ] Bandeja `/mentorias/bandeja` con invitaciones pendientes.
- [ ] Acciones: Aceptar (solicita agendar slot), Rechazar, Sugerir otro horario.
- [ ] Al aceptar, `estado='aceptada'`, `agendada_para` se setea.
- [ ] **Saga coreografiada por eventos** (ver `topologia-servicios.md` §7.3):
  - Al aceptar, `mentor-core-svc` (MariaDB) hace INSERT en `outbox_events` con `mentoria.invitacion.aceptada.v1`.
  - `chat-mentoria-svc` (MongoDB `chat_mentoria`) consume el evento y crea la conversación (ver US-11-CHAT-A-01).
  - Si la creación del chat falla: reintentos con backoff, DLQ, rollback (volver invitación a `pendiente`).
- [ ] Al rechazar, `estado='rechazada'`, motivo opcional.
- [ ] Notifica al usuario del resultado.
- [ ] GlitchTip captura errores.

### Tareas técnicas derivadas

- `task/appbit/mentorias/bandeja-screen`
- `task/appbit/mentorias/estado-endpoint` — `PATCH /mentoria-invitaciones/[id]`
- `task/appbit/mentorias/calendario-basico` — opcional MVP, puede ser solo timestamp

---

## US-07-MT-05 — Convertirse en mentor

**Como** profesional consolidado  
**quiero** registrarme como mentor  
**para** ofrecer mi experiencia a otros.

### Criterios de aceptación

- [ ] Opción en `/perfil`: "Quiero ser mentor".
- [ ] Crea registro en `mentor` con biografía, área, `ofrece_practica`, disponibilidad.
- [ ] Aprobación manual por admin (fuera de scope MVP, puede ser auto en MVP).
- [ ] GlitchTip captura errores.

### Tareas técnicas derivadas

- `task/appbit/mentorias/mentor-onboarding-screen`
- `task/appbit/mentorias/mentor-create-endpoint`

---

## US-07-MT-06 — Chat con el mentor después de aceptar invitación

**Como** usuario o mentor con una invitación aceptada  
**quiero** conversar por chat con el otro  
**para** coordinar la práctica o conversación.

> **Esta US es de referencia**: el detalle completo vive en el **módulo 11.A** (`doc/historias-de-usuario/11-chat/README.md`), específicamente en `US-11-CHAT-A-01` a `US-11-CHAT-A-04`.

### Criterios de aceptación

- [ ] Una vez que `mentoria.invitacion.aceptada.v1` se procesa correctamente, el chat está disponible en `/mentorias/chat/:invitacion_id`.
- [ ] Mensajes persisten en `chat_mentoria.messages` (MongoDB Atlas cuenta #1).
- [ ] Mensajes en tiempo real vía WebSocket.
- [ ] Historial paginado con cursor.
- [ ] Adjuntos permitidos (imagen, archivo, link).

### Tareas técnicas derivadas

Ver módulo 11.A:
- `task/appbit/chat/mentoria/conversation-create-consumer`
- `task/appbit/chat/mentoria/message-send-endpoint`
- `task/appbit/chat/mentoria/websocket-gateway-integration`
- `task/appbit/chat/mentoria/message-list-endpoint`

---

## Responsables sugeridos

- **Backend/API**: endpoints, estados, outbox para saga de aceptación
- **Frontend**: lista, detalle, bandeja, integración con chat (módulo 11)
- **Comunicaciones**: emails transaccionales
- **Producto**: política de aprobación de mentores
- **Chat**: módulo 11.A (servicio MongoDB separado)
