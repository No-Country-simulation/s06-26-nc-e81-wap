# Módulo 08 — Salud Mental (Check-in, Agente, CVV)

> **Rama módulo**: `feat/appbit/salud-mental` (en monorepo `server/salud/`)
> **Endpoint principal**: `POST /salud`
> **Entidades DB**:
> - `checkin_emocional`, `recurso_bienestar`, `derivacion_cvv` → **PostgreSQL**
> - **Chat con agente** (ver módulo 11.C) → **MongoDB `chat_salud_mental` cluster aislado**
> **SLO**: **99.5% disponibilidad** (servicio crítico, sensible)
> **Compliance**: LGPD, Resoluções CFM/CFP, retención indefinida con anonimización a 24 meses

> ⚠️ **Módulo sensible**. Test exhaustivo antes de producción. Toda decisión del agente es trazable. Toda derivación a CVV genera evento P0 a `#salud-guardia`.

> **Decisiones de arquitectura aplicadas** (ver `doc/arquitectura/seguridad-compliance.md`):
> - **Doble cifrado** (disco + aplicación) para datos de salud
> - **Cifrado AES-256-GCM a nivel de documento** para mensajes del chat
> - **Cluster MongoDB físicamente aislado** para el chat (cuenta Atlas #2)
> - **Interoperabilidad clínica regional**: schema "FHIR-friendly" con LOINC, SNOMED, CID-10, CIAP-2
> - **Escalas clínicas estandarizadas**: PHQ-9, GAD-7, WHO-5, BDI (ver §16 del doc de seguridad)
> - **MFA obligatorio** para `admin_clinico` (ver US-01-AUTH-05)
> - **SLO diferenciado** por criticidad (99.5% vs 99% del resto)

---

## Personas

- **Persona primaria**: usuario que atraviesa un momento emocional difícil y busca un espacio de escucha.
- **Persona secundaria**: usuario que quiere un seguimiento regular de su bienestar emocional.
- **Persona clínica**: `admin_clinico` que accede a datos de salud mental con acuerdo de confidencialidad + MFA.

---

## US-08-SM-01 — Check-in diario con emojis

**Como** usuario  
**quiero** hacer un check-in diario al entrar a la app eligiendo un emoji  
**para** que el sistema sepa cómo estoy.

### Criterios de aceptación

- [ ] Modal de check-in aparece en el primer login del día.
- [ ] Emojis disponibles: feliz, cansado, triste, ansioso, sobrecargado.
- [ ] Se persiste en `checkin_emocional` con:
  - `humor` (texto libre: feliz, cansado, etc.)
  - `humor_codigo` (código **SNOMED** si está mapeado, ver `terminologia_clinica`): ej: `44054006` para tristeza
- [ ] Si ya hizo check-in hoy, no vuelve a preguntar.
- [ ] Es opcional: el usuario puede saltarlo con un "ahora no".
- [ ] GlitchTip captura errores del endpoint.

### Tareas técnicas derivadas

- `task/appbit/salud/checkin-modal`
- `task/appbit/salud/checkin-endpoint` — `POST /checkin`
- `task/appbit/salud/already-checked-today-check`
- `task/appbit/salud/humor-codigo-lookup` — mapeo texto libre → SNOMED
- `task/appbit/salud/glitchtip-instrumentation`
- `task/appbit/salud/k6-shallow-test`

---

## US-08-SM-02 — Recibir acción sugerida del agente

**Como** usuario  
**quiero** que después del check-in el agente me sugiera una acción concreta  
**para** hacer algo por mi bienestar ahora.

### Criterios de aceptación

- [ ] El agente cruza `humor` + `region` + `contexto` y devuelve 1-3 acciones concretas de `recurso_bienestar`.
- [ ] Tipos variados: libro, podcast, serie, actividad física (region-aware).
- [ ] **Recursos filtrados por `categoria_clinica` (SNOMED) e `indicaciones_json` (códigos SNOMED/LOINC)** — el agente sugiere los que aplican al humor.
- [ ] Mensaje del agente en lenguaje cálido, no clínico, en el `idioma_preferido` del usuario.
- [ ] Cada recurso tiene CTA: "Leer", "Escuchar", "Ver", "Hacer".
- [ ] Se puede marcar como "no me interesa" para refinar futuras sugerencias.
- [ ] **Acoplamiento con crisis**: si `nota_semanal < 4` O si el safety layer detecta riesgo, el modal de acción sugerida se reemplaza por el modal de crisis (ver US-08-SM-04 y US-11-CHAT-C-02).
- [ ] GlitchTip captura errores.

### Tareas técnicas derivadas

- `task/appbit/salud/agente-prompt` — prompt base del agente empático (revisado por ético)
- `task/appbit/salud/accion-sugerida` — match humor↔recurso por SNOMED/LOINC
- `task/appbit/salud/checkin-screen` — pantalla post-checkin
- `task/appbit/salud/crisis-redirect` — acoplamiento con US-08-SM-04
- `task/appbit/salud/glitchtip-instrumentation`

---

## US-08-SM-03 — Check-in semanal con escalas clínicas estandarizadas

**Como** usuario  
**quiero** una vez por semana responder una escala validada clínicamente  
**para** tener seguimiento objetivo y que la plataforma detecte crisis a tiempo.

### Criterios de aceptación

- [ ] Cada 7 días, modal de check-in semanal con selector de escala.
- [ ] **Escalas disponibles** (mapeadas a LOINC):
  - **PHQ-9** (LOINC `44261-6`) — 9 ítems, screening de depresión
  - **GAD-7** (LOINC `70274-6`) — 7 ítems, screening de ansiedad
  - **WHO-5** (LOINC `65625-0`) — 5 ítems, bienestar general
  - Libre — sin escala formal, solo `nota_semanal` 0-10
- [ ] Se persiste en `checkin_emocional` con:
  - `escala_usada` (PHQ-9, GAD-7, WHO-5, libre)
  - `escala_codigo_loinc`
  - `escala_items_json` (items individuales: `{"q1": 2, "q2": 3, ...}`)
  - `puntuacion_total` (estandarizada según escala)
  - `interpretacion` ("leve", "moderado", "severo" según baremo)
- [ ] Si `puntuacion_total` indica riesgo (ej: PHQ-9 ≥ 20 = severo, nota < 4 en libre), se activa derivación a CVV (US-08-SM-04).
- [ ] El usuario puede posponer el check-in semanal, no es intrusivo.

### Tareas técnicas derivadas

- `task/appbit/salud/checkin-semanal-modal` — UI con selector de escala
- `task/appbit/salud/checkin-semanal-endpoint` — `POST /salud` con `escala_usada`
- `task/appbit/salud/phq9-baremo` — lógica de interpretación
- `task/appbit/salud/gad7-baremo`
- `task/appbit/salud/who5-baremo`
- `task/appbit/salud/terminologia-seed-loinc` — cargar seeds de LOINC en `terminologia_clinica`
- `task/appbit/salud/terminologia-seed-snomed` — cargar seeds de SNOMED (Brasil gratis)
- `task/appbit/salud/terminologia-seed-cid10-cap-v` — capítulo V de CID-10
- `task/appbit/salud/scheduler-recordatorio`
- `task/appbit/salud/glitchtip-instrumentation`

---

## US-08-SM-04 — Derivación automática a CVV en crisis

**Como** plataforma  
**quiero** detectar y derivar al CVV a usuarios en riesgo  
**para** cuidar su integridad derivando a atención profesional humana.

### Criterios de aceptación

- [ ] Activación por **cualquiera** de:
  - `puntuacion_total` con baremo "severo" (PHQ-9 ≥ 20, GAD-7 ≥ 15)
  - `nota_semanal < 4` (en check-in libre)
  - Safety layer del chat detecta `riesgo_autolesion: alto` (ver US-11-CHAT-C-02)
  - Análisis de mensaje detecta patrones de crisis persistentes
- [ ] `POST /salud` con activación → `derivar_cvv: true` en la response.
- [ ] Crea registro en `derivacion_cvv` con:
  - `motivo_clinico_codigo` (CID-10 o SNOMED del motivo, ej: F32.1 episodio depresivo moderado)
  - `servicio_destino` (CVV 188 Brasil, CAPS, SUS-emergencia, etc., por país)
  - `urgencia` (inmediata / 24h / 1-semana)
- [ ] Se muestra pantalla con:
  - Número del CVV según país (Brasil: 188, Argentina: 135, México: 800-290-0024, etc. — tabla en `cvv_numeros_region.json`)
  - Mensaje empático, **NO clínico**
  - Recursos de respiración / grounding
  - Botones "hablé con alguien" / "necesito más ayuda"
- [ ] **El chat de salud se abre proactivamente** (US-11-CHAT-C-01) con el modal de crisis pre-cargado.
- [ ] **Publica evento `salud.crisis.detectada.v1`** → Slack `#salud-guardia` + on-call (P0).
- [ ] **NO se intenta reemplazar atención profesional humana** (mensaje explícito en la UI).
- [ ] **Logs de auditoría cifrados** (AES-256-GCM) — `audit_log_salud` se persiste en cluster MongoDB aislado.
- [ ] GlitchTip captura errores.

### Tareas técnicas derivadas

- `task/appbit/salud/cvv-derivacion-logic`
- `task/appbit/salud/cvv-screen` — pantalla de crisis
- `task/appbit/salud/cvv-numeros-region` — tabla de números por país (seed inicial: BR, AR, MX, CO, CL, PE, UY, AO)
- `task/appbit/salud/crisis-event-publisher` — outbox para `salud.crisis.detectada.v1`
- `task/appbit/salud/chat-salud-preload` — acoplamiento con US-11-CHAT-C-01
- `task/appbit/salud/audit-log-encrypted` — KMS cifrado
- `task/appbit/salud/glitchtip-instrumentation`

---

## US-08-SM-05 — Historial emocional y exportación de datos (LGPD)

**Como** usuario  
**quiero** ver mi historial de check-ins en un gráfico simple y poder exportar todos mis datos  
**para** reconocer patrones, progreso y ejercer mi derecho de portabilidad (LGPD art. 18).

### Criterios de aceptación

- [ ] Ruta `/salud-mental/mi-historial`.
- [ ] Gráfico de línea con `puntuacion_total` de las últimas 12 semanas (o `nota_semanal` si usó libre).
- [ ] Distribución de `humor` (con códigos SNOMED) en los últimos 30 días.
- [ ] **Exportación completa** vía `GET /usuarios/me/export?format=json&scope=salud` (endpoint centralizado, **NO** específico de salud):
  - Datos de PostgreSQL: `checkin_emocional` (con `humor_codigo`, `escala_codigo_loinc`, items)
  - **Datos de MongoDB**: `chat_salud_mental.sessions` (metadatos) + `chat_salud_mental.messages` (cifrados → descifrados al exportar)
  - `derivacion_cvv`
  - Formato: JSON con schema documentado
- [ ] **SLA de respuesta**: 15 días (LGPD), 30 días (GDPR).
- [ ] Retención del archivo exportado: 7 días, luego se borra automáticamente.
- [ ] GlitchTip captura errores.
- [ ] **Anonimización progresiva** (job nocturno): tras 24 meses de inactividad, `usuario_id_hash` se reemplaza (ver US-11-CHAT-C-04).

### Tareas técnicas derivadas

- `task/appbit/salud/historial-screen`
- `task/appbit/salud/historial-endpoint` — series temporales agregadas
- `task/appbit/salud/export-data` — orquestador que une PostgreSQL + MongoDB descifrado
- `task/appbit/perfil/export-endpoint` — `GET /usuarios/me/export` (en `perfil-svc`, no aquí)
- `task/appbit/salud/anonimization-job` — cron 3am (ver US-11-CHAT-C-04)
- `task/appbit/salud/glitchtip-instrumentation`

---

## Responsables sugeridos

- **Backend/API**: endpoints + agente sensible (revisar con psicólogo/responsable ético)
- **Frontend**: modales, gráficos, pantalla de crisis
- **Ética/Producto**: validar el prompt del agente, evitar lenguaje dañino
- **Seguridad**: cifrado de logs sensibles, KMS para TOTP
- **Cumplimiento**: número de CVV por país, base legal para derivar, DPO
- **Datos clínicos**: cargar seeds de terminología clínica (LOINC, SNOMED Brasil, CID-10 cap V, CIAP-2)
- **DevOps**: cluster MongoDB aislado (Atlas cuenta #2), KMS dedicado
