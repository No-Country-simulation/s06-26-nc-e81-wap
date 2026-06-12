# Módulo 05 — Formaciones (Cursos y Trayectorias)

> **Rama módulo**: `feat/appbit/formaciones`
> **DB**: **MariaDB 11+** (dockerizado en Railway)
> **Entidades DB**: `curso`, `trayectoria`
> **SLO**: 99% disponibilidad

---

## US-05-FO-01 — Catálogo de cursos (gratuitos y pagos)

**Como** usuario  
**quiero** explorar el catálogo de cursos disponibles  
**para** elegir formación alineada a mis objetivos.

### Criterios de aceptación

- [ ] Ruta `/formaciones` con grid o lista de cursos.
- [ ] Cada curso muestra: título, proveedor (Google Cloud, Oracle/Alura, etc.), duración, gratuito/pago, idioma, nivel, área.
- [ ] Filtros: área, nivel, gratuito/pago, idioma.
- [ ] Búsqueda por texto en título/proveedor.
- [ ] CTA "Ir al curso" abre URL externa (los cursos se consumen en plataformas partner).
- [ ] Badge "Recomendado para ti" si el curso está en la `trayectoria` activa del usuario.
- [ ] GlitchTip captura errores.
- [ ] **k6 shallow en CI** valida latencia.

### Tareas técnicas derivadas

- `task/appbit/formaciones/catalog-screen`
- `task/appbit/formaciones/catalog-filters`
- `task/appbit/formaciones/curso-endpoint` — `GET /cursos` (MariaDB)
- `task/appbit/formaciones/glitchtip-instrumentation`
- `task/appbit/formaciones/k6-shallow-test`
- `task/appbit/formaciones/dockerfile`

---

## US-05-FO-02 — Trayectoria personalizada para cerrar mi gap

**Como** usuario con gap identificado  
**quiero** ver una trayectoria ordenada de cursos que cierre ese gap  
**para** avanzar con un plan concreto, no a ciegas.

### Criterios de aceptación

- [ ] Ruta `/formaciones/mi-trayectoria` muestra la `trayectoria` activa.
- [ ] Lista ordenada de cursos (de foundational a avanzado).
- [ ] Cada paso muestra: por qué se recomienda (qué skill del gap cubre), duración estimada, link.
- [ ] Marcar curso como "completado" actualiza la UI (no se valida contra plataforma externa en MVP).
- [ ] Al completar todos, mostrar: "Listo, busca vacantes con gap menor" + CTA a `/orientar`.
- [ ] **Saga con outbox**: al marcar curso como completado, se publica `formaciones.curso.completado.v1` (consumido por `orientar-svc` para recalcular gap). Ver `topologia-servicios.md` §7.2.

### Tareas técnicas derivadas

- `task/appbit/formaciones/trayectoria-screen`
- `task/appbit/formaciones/trayectoria-detail`
- `task/appbit/formaciones/mark-complete-endpoint` — `POST /trayectoria/[id]/progreso`
- `task/appbit/formaciones/regenerate-on-change` — recalcular si cambia el gap
- `task/appbit/formaciones/curso-completado-event-publisher` — outbox

---

## US-05-FO-03 — Integración con programas partner (GEAR, ONE)

**Como** equipo de contenido  
**quiero** registrar cursos de Google Cloud (GEAR) y Oracle/Alura (ONE) con metadata correcta  
**para** que aparezcan en el catálogo y la trayectoria.

### Criterios de aceptación

- [ ] Seed inicial de cursos GEAR y ONE en `curso`.
- [ ] Cada curso tiene: `es_gratuito=true`, `proveedor`, `url`, `skills_impartidos`, `idioma`.
- [ ] El agente IA de `/orientar` los referencia por nombre cuando sugiere.

### Tareas técnicas derivadas

- `task/appbit/formaciones/seed-gear`
- `task/appbit/formaciones/seed-one`
- `task/appbit/formaciones/admin-curso-crud` — para añadir más cursos sin redeploy
- `task/appbit/formaciones/admin-rbac` — RBAC para `admin_eventos` o nuevo `admin_formaciones`

---

## US-05-FO-04 — Seguimiento del progreso del usuario

**Como** usuario  
**quiero** ver mi avance (% de cursos completados)  
**para** sentir progreso tangible.

### Criterios de aceptación

- [ ] Indicador de progreso global (ej: "3 de 7 cursos completados — 43%").
- [ ] Barra de progreso en `/formaciones/mi-trayectoria`.
- [ ] Notificación cuando un curso está marcado completo (toast + animación sutil).

### Tareas técnicas derivadas

- `task/appbit/formaciones/progress-bar`
- `task/appbit/formaciones/progress-endpoint`

---

## Responsables sugeridos

- **Backend/API**: catálogo, trayectoria, progreso
- **Frontend**: pantallas y cards
- **Contenido**: seed inicial de GEAR, ONE y otros cursos pagos
- **Agente IA**: integración con `/orientar` para recomendar
