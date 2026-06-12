# Módulo 10 — Multilenguaje (PT + ES)

> **Rama módulo**: `feat/appbit/multilenguaje`
> **DB**: **SQLite** read-only distribuido (`i18n.sqlite` en cada servicio)
> **Entidades DB**: `usuario.idioma_preferido`, campo `idioma` en `curso`, `recurso_bienestar`, `experiencia_evento`, `vacante`
> **SLO**: 99.5% disponibilidad (bajo costo, alto beneficio)

---

## US-10-ML-01 — Elegir idioma al registrarse

**Como** usuario nuevo  
**quiero** elegir mi idioma preferido (portugués o español)  
**para** usar la app en mi idioma.

### Criterios de aceptación

- [ ] Paso 1 del onboarding pide idioma (default: `pt`).
- [ ] Se persiste en `usuario.idioma_preferido`.
- [ ] Toda la UI renderiza en el idioma elegido.
- [ ] Mensajes del agente en el idioma elegido (ver US-10-ML-03).
- [ ] **Consentimiento granular para uso de IA** (ver seguridad §10): opt-in/opt-out para que el sistema use los mensajes del usuario para mejorar el agente (off por defecto en MVP).
- [ ] GlitchTip captura errores.

### Tareas técnicas derivadas

- `task/appbit/multilenguaje/onboarding-idioma-step`
- `task/appbit/multilenguaje/i18n-config` — `pt-BR` y `es-419` como mínimo
- `task/appbit/multilenguaje/i18n-files` — catálogos de strings

---

## US-02-PER-04 (extensión) — Cambiar idioma en cualquier momento

**Como** usuario registrado  
**quiero** cambiar mi idioma preferido desde configuración  
**para** adaptarme si cambio de país o preferencia.

### Criterios de aceptación

- [ ] Switcher de idioma en `/perfil/configuracion`.
- [ ] Cambio se refleja sin recargar la sesión.
- [ ] Actualiza `usuario.idioma_preferido`.
- [ ] GlitchTip captura errores.

### Tareas técnicas derivadas

- `task/appbit/multilenguaje/idioma-switcher`
- `task/appbit/multilenguaje/idioma-endpoint` — `PATCH /usuarios/me/idioma`

---

## US-10-ML-02 — Filtrar contenido por idioma

**Como** usuario  
**quiero** ver solo contenido en mi idioma  
**para** no perder tiempo con material que no entiendo.

### Criterios de aceptación

- [ ] Por defecto, los listados (vacantes, cursos, eventos, recursos) filtran por `usuario.idioma_preferido`.
- [ ] Toggle "Mostrar otros idiomas" revela el resto.
- [ ] Búsqueda respeta filtro de idioma si está activo.
- [ ] GlitchTip captura errores.

### Tareas técnicas derivadas

- `task/appbit/multilenguaje/idioma-filter-default`
- `task/appbit/multilenguaje/idioma-toggle`

---

## US-10-ML-03 — El agente responde en el idioma del usuario

**Como** usuario que habla español  
**quiero** que el agente de `/orientar` y `/salud` me responda en español  
**para** entenderme sin fricción.

### Criterios de aceptación

- [ ] Prompts del agente llevan el locale como instrucción explícita.
- [ ] Mensajes pre-canned (derivación CVV, etc.) traducidos a `pt` y `es` (almacenados en `i18n.sqlite`, tabla `agent_messages`).
- [ ] Recursos de `recurso_bienestar` filtrados por idioma (con fallback a "es" si no hay en "pt" para un usuario pt).
- [ ] **Mensajes críticos validados por revisor humano bilingüe** antes de producción (derivación CVV, crisis, baja de ánimo).
- [ ] GlitchTip captura errores.

### Tareas técnicas derivadas

- `task/appbit/multilenguaje/agent-locale-prompt`
- `task/appbit/multilenguaje/canned-messages-i18n`

---

## Responsables sugeridos

- **Frontend**: i18n, switcher, filtros
- **Backend**: endpoints, propagación de locale
- **Agente IA**: prompts multi-idioma
- **Contenido**: revisar y traducir mensajes críticos (CVV, crisis)
