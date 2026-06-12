# Módulo 04 — Empleabilidad (Vacantes y Match)

> **Rama módulo**: `feat/appbit/empleabilidad` (en monorepo `server/empleabilidad/`)
> **DB**: **MariaDB 11+** (dockerizado en Railway) — ver `doc/arquitectura/distribucion-db.md`
> **SLO**: 99% disponibilidad
> **Modelo de negocio**: comisión por contratación, usuario no paga (B2C)

> **Decisiones de arquitectura aplicadas** (ver `doc/arquitectura/topologia-servicios.md` §7.2 y `despliegue.md` §6.4):
> - **Outbox pattern completo** para el evento `empleabilidad.aplicacion.contratado.v1`
> - **Saga con reintentos activos** si la postulación dispara acciones downstream (notificación a la empresa, derivación de comisión, etc.)
> - **Dockerfile** multi-stage distroless, parte del monorepo

---

## US-04-EM-01 — Ver vacantes compatibles con mi perfil

**Como** usuario en búsqueda de empleo o cambio de empleo  
**quiero** ver una lista de vacantes ordenadas por compatibilidad  
**para** enfocarme en las que están a mi alcance inmediato.

### Criterios de aceptación

- [ ] Ruta `/empleabilidad` o integrada en `/orientar` (sección vacantes).
- [ ] **Endpoint en MariaDB**: `GET /vacantes?area=&nivel=&idioma=&page=1&limit=20`.
- [ ] Lista paginada (20 por página).
- [ ] Cada card muestra: título, empresa, área, nivel, **gap porcentual** destacado, ubicación, idioma.
- [ ] Filtros: área, nivel, idioma, remoto/presencial, rango de gap.
- [ ] Orden por defecto: gap ascendente (más cercanas al perfil).
- [ ] Vacante sin match: badge "necesitas formación" en vez de gap.
- [ ] **Cacheable por 5 min** (las vacantes cambian poco).
- [ ] GlitchTip captura errores.
- [ ] **k6 shallow en CI** valida latencia.

### Tareas técnicas derivadas

- `task/appbit/empleabilidad/list-screen`
- `task/appbit/empleabilidad/vacante-filters`
- `task/appbit/empleabilidad/vacante-detail`
- `task/appbit/empleabilidad/vacante-feed` — endpoint paginado en MariaDB
- `task/appbit/empleabilidad/vacante-cache` — Redis cache 5min
- `task/appbit/empleabilidad/glitchtip-instrumentation`
- `task/appbit/empleabilidad/k6-shallow-test`
- `task/appbit/empleabilidad/dockerfile`

---

## US-04-EM-02 — Ver detalle de una vacante con gap explicativo

**Como** usuario  
**quiero** ver el detalle de una vacante con explicación clara de mi gap  
**para** saber exactamente qué me falta y cómo resolverlo.

### Criterios de aceptación

- [ ] Ruta `/empleabilidad/vacante/[id]`.
- [ ] Muestra: descripción completa, requisitos (todos), empresa, datos de contacto.
- [ ] Sección "Tu match con esta vacante": porcentaje de gap, lista visual de skills cumplidos ✓ y faltantes ✗.
- [ ] CTA "Cerrar mi gap" lleva a la pantalla de formaciones con los cursos sugeridos (llama a `formaciones-svc`).
- [ ] CTA "Postular" abre modal de confirmación + redirige a URL externa (la vacante en sí vive fuera de la plataforma).
- [ ] GlitchTip captura errores.

### Tareas técnicas derivadas

- `task/appbit/empleabilidad/vacante-detail-screen`
- `task/appbit/empleabilidad/gap-explanation`
- `task/appbit/empleabilidad/postular-action` — registra la postulación en `aplicacion`
- `task/appbit/empleabilidad/glitchtip-instrumentation`

---

## US-04-EM-03 — Postular a una vacante

**Como** usuario  
**quiero** registrar mi postulación desde la app  
**para** que mi historial quede y la plataforma reciba la comisión si soy contratado.

### Criterios de aceptación

- [ ] `POST /aplicaciones` con `{ vacante_id }` crea registro en `aplicacion` (MariaDB) con `estado='pendiente'` y `gap_porcentual` calculado.
- [ ] Si ya existe postulación previa (UNIQUE constraint), no duplica: muestra estado actual.
- [ ] Redirige a URL externa de la vacante (sistema externo de la empresa).
- [ ] Confirma con toast: "Postulación registrada, te avisaremos".
- [ ] **Saga con outbox pattern** (ver `topologia-servicios.md` §7.2): publica evento `empleabilidad.aplicacion.creada.v1` para que:
  - `notification-svc` envíe email de confirmación al usuario
  - `audit-svc` registre la postulación
- [ ] GlitchTip captura errores.

### Tareas técnicas derivadas

- `task/appbit/empleabilidad/aplicacion-endpoint` — `POST /aplicaciones`
- `task/appbit/empleabilidad/aplicacion-list` — historial del usuario (GET /aplicaciones/me)
- `task/appbit/empleabilidad/outbox-write` — INSERT en outbox_events
- `task/appbit/empleabilidad/notification-trigger` — consumer del evento
- `task/appbit/empleabilidad/glitchtip-instrumentation`

---

## US-04-EM-04 — Comisión por contratación (outbox pattern completo)

**Como** plataforma  
**quiero** trackear contrataciones para cobrar comisión a la empresa  
**para** sostener el modelo B2C donde el usuario no paga.

> ⚠️ Esta US es **crítica para el modelo de negocio**. Implementa el patrón outbox correctamente para que el evento de comisión NO se pierda.

### Criterios de aceptación

- [ ] Cuando una postulación pasa a `estado='contratado'` (vía PATCH desde sistema de la empresa), se dispara la saga de comisión.
- [ ] **Outbox pattern completo** (en la MISMA transacción que el UPDATE):
  ```sql
  BEGIN;
  UPDATE aplicacion SET estado='contratado' WHERE id=X;
  INSERT INTO outbox_events (event_type, aggregate_id, payload) 
  VALUES ('empleabilidad.aplicacion.contratado.v1', X, '{...}');
  COMMIT;
  ```
- [ ] **Outbox poller** (worker) lee eventos pendientes y los publica a RabbitMQ.
- [ ] **Saga con reintentos** (ver `topologia-servicios.md` §7.3):
  1. `empleabilidad-svc` (MariaDB) commit + outbox
  2. RabbitMQ entrega a `billing-svc` (futuro, fuera de MVP)
  3. Si falla: 5 reintentos con backoff (inmediato, 5s, 30s, 2min, 10min)
  4. Si se abandona: DLQ + alerta a on-call
- [ ] Para MVP, el consumer del evento es **mock**: un log en `audit-svc` con el evento recibido.
- [ ] `aplicacion.estado` puede ser: `pendiente`, `en_proceso`, `contratado`, `rechazado`, `retirado`.
- [ ] GlitchTip captura errores.

### Tareas técnicas derivadas

- `task/appbit/empleabilidad/estado-update-endpoint` — PATCH /aplicaciones/:id/estado
- `task/appbit/empleabilidad/outbox-write` — INSERT en outbox_events
- `task/appbit/empleabilidad/outbox-poller` — worker que lee outbox
- `task/appbit/empleabilidad/contratacion-event-mock` — log en audit-svc
- `task/appbit/empleabilidad/dlq-monitor` — alerta si DLQ > 5 mensajes
- `task/appbit/empleabilidad/glitchtip-instrumentation`
- `task/appbit/empleabilidad/k6-test-saga` — test del flujo end-to-end

---

## Responsables sugeridos

- **Backend/API**: feed, detalle, postulación, outbox poller
- **Frontend**: lista, detalle, filtros
- **Data/Business**: definir URL externa de cada vacante y origen del catálogo inicial
- **DevOps**: MariaDB dockerizado, backup diario vía script
