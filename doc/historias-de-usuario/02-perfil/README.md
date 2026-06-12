# Módulo 02 — Perfil de Usuario (Onboarding)

> **Rama módulo**: `feat/appbit/perfil` (en monorepo `server/perfil/`)
> **Endpoints**: `GET /usuarios/me`, `PATCH /usuarios/me`, `POST /usuarios/me/onboarding-complete`, `DELETE /usuarios/me`, `GET /usuarios/me/export`
> **Entidades DB**: `usuario` (PostgreSQL)
> **SLO**: 99% disponibilidad

> **Decisiones de arquitectura aplicadas** (ver `doc/arquitectura/topologia-servicios.md` §7.3 y `seguridad-compliance.md` §8):
> - **Saga coreografiada por eventos** para la eliminación cross-DB (PostgreSQL + MariaDB + MongoDB x2)
> - **Outbox pattern** en PostgreSQL de `perfil-svc` para garantizar publicación del evento `perfil.usuario.eliminado.v1`
> - **Estados visibles al usuario** con timeouts explícitos (ver `topologia-servicios.md` §7.6)
> - **Anonimización** (no hard delete) tras 30 días para datos no sensibles, **24 meses** para datos de salud
> - **Exportación** en JSON con schema documentado (LGPD art. 18, GDPR art. 15)

---

## US-02-PER-01 — Onboarding completo en un solo flujo

**Como** persona recién registrada  
**quiero** completar mis datos personales y profesionales en un flujo guiado  
**para** que la plataforma pueda orientarme con precisión.

### Datos requeridos

**Personales**: nombre, fecha de nacimiento, género, escolaridad, continente, país, estado (BR), ciudad, WhatsApp.  
**Profesionales**: nivel, área de tecnología, objetivo (`estudiar` | `definir_camino` | `buscar_empleo` | `cambiar_empleo`).  
**Preferencias**: idioma preferido (`pt` | `es`) — **se pide en el paso 1 del onboarding, no en el 3**, para que toda la UI se renderice correctamente desde el primer momento.  
**Identificadores regionales** (opcional): CPF (Brasil), documento nacional con tipo y país (LATAM/Angola). Se cifran a nivel de aplicación al persistir.

### Criterios de aceptación

- [ ] Flujo paso a paso con barra de progreso visible.
- [ ] Campos opcionales marcados explícitamente como tales (incluyendo identificadores regionales).
- [ ] El botón "Finalizar" se habilita solo cuando los campos obligatorios están completos.
- [ ] Al finalizar, `usuario.onboarding_completo = true`.
- [ ] El usuario es redirigido a `/home` con un mensaje de bienvenida.
- [ ] Datos parcialmente completados se guardan como borrador si el usuario abandona.
- [ ] GlitchTip captura errores.

### Tareas técnicas derivadas

- `task/appbit/perfil/onboarding-step1-idioma` — paso 1: idioma + datos personales
- `task/appbit/perfil/onboarding-step2-profesional` — paso 2: datos profesionales
- `task/appbit/perfil/onboarding-step3-confirmacion` — paso 3: revisión + finalizar
- `task/appbit/perfil/onboarding-endpoint` — `POST /usuarios/me`
- `task/appbit/perfil/onboarding-progress-save`
- `task/appbit/perfil/cpf-encryption` — KMS para CPF
- `task/appbit/perfil/documento-encryption` — KMS para documento nacional
- `task/appbit/perfil/glitchtip-instrumentation`

---

## US-02-PER-02 — Editar perfil después del onboarding

**Como** usuario registrado  
**quiero** actualizar mis datos personales y profesionales  
**para** reflejar cambios en mi trayectoria (nuevo país, nuevo objetivo, etc.).

### Criterios de aceptación

- [ ] Pantalla `/perfil` muestra todos los campos del usuario (incluyendo identificadores regionales).
- [ ] `PATCH /usuarios/me` actualiza solo los campos enviados.
- [ ] Cambios en `objetivo` invalidan la última `trayectoria` activa (se marca `activa=false` y se regenera).
- [ ] Cambios en `objetivo` se publican como evento `perfil.objetivo.cambiado.v1` (consumido por `orientar-svc` y `formaciones-svc`).
- [ ] Confirmación visual tras guardar exitosamente.
- [ ] GlitchTip captura errores.

### Tareas técnicas derivadas

- `task/appbit/perfil/edit-screen`
- `task/appbit/perfil/edit-endpoint` — `PATCH /usuarios/me`
- `task/appbit/perfil/trayectoria-invalidate` — llamar a formaciones
- `task/appbit/perfil/objetivo-event-publisher` — outbox
- `task/appbit/perfil/glitchtip-instrumentation`

---

## US-02-PER-03 — Eliminar cuenta y datos personales (LGPD/GDPR) — SAGA CROSS-DB

**Como** usuario  
**quiero** poder eliminar mi cuenta  
**para** ejercer mi derecho de supresión de datos (LGPD art. 18, GDPR art. 17).

> ⚠️ **Crítico**: la eliminación NO es un `DELETE` en una sola tabla. Es una **saga cross-DB** que debe coordinar PostgreSQL, MariaDB, MongoDB (chat general) y MongoDB (chat salud aislado). Sin la saga, quedan datos huérfanos y se rompe compliance.

### Criterios de aceptación

- [ ] Opción en `/perfil/configuracion` → "Eliminar mi cuenta".
- [ ] Confirmación con **doble factor**: escribir "ELIMINAR" + contraseña actual.
- [ ] **Pantalla de progreso** con estados visibles (ver `topologia-servicios.md` §7.6):
  - `pending` → "preparando eliminación"
  - `processing` → "eliminando tus datos" (con timeout explícito de 30s)
  - `rolling_back` → "revertimos los cambios, intenta de nuevo"
  - `rolled_back` → "no pudimos eliminar, inténtalo más tarde"
  - `completed` → "tu cuenta fue eliminada"
- [ ] **Saga con 5 pasos** (ver `topologia-servicios.md` §7.3 para detalle del patrón):
  1. **`perfil-svc` (PostgreSQL)**: INSERT en `outbox_events` con `event_type='perfil.usuario.eliminado.v1'` + UPDATE `usuario.deleted_at = NOW()` en la misma transacción
  2. **Outbox poller** publica el evento a RabbitMQ
  3. **`orientar-svc` y `formaciones-svc` (PostgreSQL/MariaDB)**: reciben el evento, marcan trayectorias y postulaciones como `canceladas` (NO eliminan, anonimizan FK)
  4. **`chat-mentoria-svc` y `chat-agente-orientar-svc` (MongoDB cuenta #1)**: reciben el evento, marcan conversaciones como `deleted=true` y eliminan PII de los mensajes (conservan el texto)
  5. **`chat-agente-salud-svc` (MongoDB cuenta #2)**: recibe el evento, marca la sesión como `estado='cuenta_eliminada'` y conserva el verbatim cifrado (anonimización a 24 meses aplica después)
- [ ] Si cualquier paso falla → **reintentos con backoff** (5 intentos: inmediato, 5s, 30s, 2min, 10min).
- [ ] Si tras 5 intentos sigue fallando → **DLQ** + worker de DLQ reintenta durante 1 hora.
- [ ] Si se abandona tras 1h → **rollback explícito** (revierte `deleted_at` en PostgreSQL) + alerta a on-call.
- [ ] **Soft delete confirmado**: tras 30 días, los datos personales en PostgreSQL se anonimizan (`nombre` → "Usuario Eliminado", `email` → `deleted-{uuid}@anonimizado.appbit`).
- [ ] Datos de salud mental **NO** se hard-deleted nunca (anonimización a 24 meses, ver US-11-CHAT-C-04).
- [ ] GlitchTip captura errores de la saga.

### Tareas técnicas derivadas

- `task/appbit/perfil/delete-screen` — UI con doble factor
- `task/appbit/perfil/delete-saga-orchestrator` — inicia la saga
- `task/appbit/perfil/delete-outbox-write` — INSERT en outbox_events
- `task/appbit/perfil/saga-state-tracker` — actualiza tabla `sagas`
- `task/appbit/perfil/saga-progress-endpoint` — `GET /sagas/:id` para que la UI muestre el estado
- `task/appbit/orientar/usuario-eliminado-consumer` — anonimiza FK
- `task/appbit/formaciones/usuario-eliminado-consumer` — anonimiza FK
- `task/appbit/mentor/usuario-eliminado-consumer` — anonimiza invitaciones
- `task/appbit/chat/mentoria/usuario-eliminado-consumer` — soft delete conversaciones
- `task/appbit/chat/orientar/usuario-eliminado-consumer` — marca sesiones como eliminadas
- `task/appbit/chat/salud/usuario-eliminado-consumer` — conserva verbatim cifrado, marca cuenta eliminada
- `task/appbit/perfil/anonimization-job` — cron 30 días post-delete
- `task/appbit/perfil/dlq-monitor` — alerta si DLQ > 5 mensajes
- `task/appbit/perfil/glitchtip-instrumentation`
- `task/appbit/perfil/k6-test-saga` — test del flujo completo de eliminación

---

## US-02-PER-04 — Exportar mis datos personales (LGPD art. 18, GDPR art. 15)

**Como** usuario  
**quiero** poder descargar todos mis datos en formato JSON  
**para** ejercer mi derecho de portabilidad.

### Criterios de aceptación

- [ ] Opción en `/perfil/configuracion` → "Descargar mis datos".
- [ ] `GET /usuarios/me/export?format=json` retorna archivo con:
  - Datos personales (PostgreSQL)
  - Trayectorias, postulaciones, mentorias (PostgreSQL + MariaDB)
  - **Conversaciones de chat** (MongoDB cuenta #1 — chat mentor y chat agente orientar) — texto plano
  - **Mensajes de chat de salud** (MongoDB cuenta #2 — **descifrados con la clave del usuario**)
  - Check-ins emocionales (PostgreSQL)
  - Derivaciones CVV (PostgreSQL)
- [ ] Schema del JSON documentado en `doc/api/export-schema.md`.
- [ ] **SLA**: archivo listo en < 24h (proceso batch nocturno).
- [ ] **Retención del archivo**: 7 días, luego se borra.
- [ ] URL firmada de descarga, expira en 24h.
- [ ] GlitchTip captura errores.

### Tareas técnicas derivadas

- `task/appbit/perfil/export-screen`
- `task/appbit/perfil/export-orchestrator` — dispara job batch
- `task/appbit/perfil/export-postgres` — `checkin_emocional`, `trayectoria`, `derivacion_cvv`
- `task/appbit/perfil/export-mariadb` — `aplicacion`, `mentoria_invitacion`
- `task/appbit/perfil/export-mongodb-general` — texto plano de chat mentor y chat agente orientar
- `task/appbit/perfil/export-mongodb-salud` — **descifrado con KMS** de mensajes de salud
- `task/appbit/perfil/export-job` — cron nocturno
- `task/appbit/perfil/export-storage` — Backblaze B2, URL firmada
- `task/appbit/perfil/export-cleanup` — borra archivos > 7 días
- `task/appbit/perfil/glitchtip-instrumentation`

---

## Responsables sugeridos

- **Backend/API**: equipo API
- **Frontend**: equipo UI
- **Privacidad/DPO**: revisar anonimización
- **Ética/Producto**: copy de la pantalla de eliminación (lenguaje cuidadoso)
- **DevOps**: monitorear saga de eliminación en GlitchTip + Grafana
