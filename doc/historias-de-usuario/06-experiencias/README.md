# Módulo 06 — Experiencias Estructurantes (Eventos y Testimonios)

> **Rama módulo**: `feat/appbit/experiencias`
> **DB**: **MariaDB 11+** (dockerizado en Railway)
> **Entidades DB**: `experiencia_evento`, `testimonio`
> **SLO**: 99% disponibilidad

---

## US-06-EX-01 — Ver listado de eventos y experiencias

**Como** usuario  
**quiero** ver eventos en vivo y grabados  
**para** reconocer mi propia historia en la de otros referentes.

### Criterios de aceptación

- [ ] Ruta `/experiencias` con tabs: "En vivo" / "Grabados" / "Próximos".
- [ ] Cada card muestra: título, fecha, duración, idioma, badges (en vivo, gratuito).
- [ ] Filtros: idioma, área del referente, fecha.
- [ ] CTA "Inscribirme" para eventos en vivo, "Ver grabación" para grabados.
- [ ] GlitchTip captura errores.

### Tareas técnicas derivadas

- `task/appbit/experiencias/list-screen`
- `task/appbit/experiencias/evento-tabs`
- `task/appbit/experiencias/evento-endpoint` — `GET /experiencias` (MariaDB)
- `task/appbit/experiencias/glitchtip-instrumentation`
- `task/appbit/experiencias/k6-shallow-test`
- `task/appbit/experiencias/dockerfile`

---

## US-06-EX-02 — Ver detalle de experiencia con testimonios

**Como** usuario  
**quiero** ver un evento con los testimonios completos de los referentes  
**para** conectar emocionalmente con su trayectoria.

### Criterios de aceptación

- [ ] Ruta `/experiencias/[id]`.
- [ ] Hero con video embebido o link a plataforma externa.
- [ ] Sección "Quiénes hablan" con cards de testimonios: nombre, rol actual, trayectoria resumida, video.
- [ ] Botón "Guardar" para que aparezca en la biblioteca del usuario.

### Tareas técnicas derivadas

- `task/appbit/experiencias/evento-detail-screen`
- `task/appbit/experiencias/testimonio-card`
- `task/appbit/experiencias/save-endpoint` — opcional MVP

---

## US-06-EX-03 — Inscribirse a evento en vivo

**Como** usuario  
**quiero** inscribirme a un evento en vivo  
**para** recibir el link de acceso y recordatorio.

### Criterios de aceptación

- [ ] Inscripción crea registro en tabla `experiencia_inscripcion` (a crear) o agrega `asistencia` JSONB a `experiencia_evento`.
- [ ] **Saga con outbox**: `experiencias.inscripcion.creada.v1` → email de confirmación + recordatorio 1h antes (job cron).
- [ ] Confirmación con email + recordatorio 1h antes.
- [ ] Lista de inscritos visible para organizadores (fuera de scope MVP).
- [ ] GlitchTip captura errores.

### Tareas técnicas derivadas

- `task/appbit/experiencias/inscripcion-endpoint`
- `task/appbit/experiencias/email-confirmacion`
- `task/appbit/experiencias/recordatorio-job`

---

## US-06-EX-04 — Gestión interna de eventos (admin)

**Como** equipo organizador  
**quiero** crear, editar y publicar eventos desde un panel admin  
**para** mantener el contenido actualizado sin redeploy.

### Criterios de aceptación

- [ ] Panel admin accesible solo a usuarios con rol `admin_eventos` (con **MFA obligatorio** — ver US-01-AUTH-05).
- [ ] CRUD de `experiencia_evento` y `testimonio`.
- [ ] Programar fecha, asignar testimonios, subir link de video.
- [ ] Publicar/despublicar.
- [ ] **Audit log** de cada acción admin (quién, qué, cuándo).
- [ ] GlitchTip captura errores.

### Tareas técnicas derivadas

- `task/appbit/experiencias/admin-screen`
- `task/appbit/experiencias/admin-endpoint` — CRUD con RBAC
- `task/appbit/experiencias/rbac-rol-admin-eventos`

---

## Responsables sugeridos

- **Backend/API**: endpoints y admin
- **Frontend**: pantallas, cards, video embed
- **Contenido**: carga inicial de eventos y testimonios
- **Comunicaciones**: emails de confirmación y recordatorios
