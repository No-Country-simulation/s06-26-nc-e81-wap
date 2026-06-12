# Módulo 09 — Geolocalización (Dataset Vísent CDRView)

> **Rama módulo**: `feat/appbit/geolocalizacion` (en monorepo `server/geo/`)
> **Entidades DB**: `zona_visent`, `evento_visent` (**MariaDB**)
> **Fuente**: github.com/wongola-bit/appbit-hackathon
> **SLO**: 99% disponibilidad

> **Decisiones de arquitectura aplicadas** (ver `doc/arquitectura/distribucion-db.md`):
> - MariaDB dockerizado en Railway
> - **Latencia objetivo**: < 200ms para query de cobertura (sync con `/salud` y `/orientar`)
> - **Contrato explícito** con `chat-agente-salud-svc` (H5 del reporte de auditoría): cómo se propaga la info de cobertura al chat de salud que vive en cluster MongoDB aislado

---

## Personas

- **Persona primaria**: usuario en zona urbana o periurbana con conectividad variable.
- **Persona secundaria**: usuario rural con conectividad limitada que necesita contenido offline.

---

## US-09-GE-01 — Mostrar eventos cercanos según zona

**Como** usuario  
**quiero** ver eventos y recursos cerca de mi zona geográfica  
**para** encontrar oportunidades en mi región.

### Criterios de aceptación

- [ ] Pantalla `/cercanos` muestra mapa o lista de `evento_visent` en un radio configurable (default 50km).
- [ ] Usa `usuario.lat` / `usuario.lng` (seteados en onboarding o manualmente).
- [ ] Si no hay coordenadas, fallback a `usuario.ciudad` (match por nombre).
- [ ] Cada evento muestra: título, descripción, fecha, distancia estimada.
- [ ] Datos agregados, NO individuales (privacidad).
- [ ] **Endpoint en MariaDB** (`empleabilidad-svc` NO, este módulo sí): `GET /geo/eventos-cercanos?lat=X&lng=Y&radio_km=50` retorna lista paginada.
- [ ] GlitchTip captura errores.

### Tareas técnicas derivadas

- `task/appbit/geolocalizacion/cercanos-screen`
- `task/appbit/geolocalizacion/eventos-cercanos-endpoint` — `GET /geo/eventos-cercanos` (consulta MariaDB)
- `task/appbit/geolocalizacion/seed-visent` — cargar dataset Vísent
- `task/appbit/geolocalizacion/geo-spatial-index` — índice espacial en MariaDB
- `task/appbit/geolocalizacion/glitchtip-instrumentation`
- `task/appbit/geolocalizacion/k6-shallow-test`

---

## US-09-GE-02 — Detectar cobertura de red de la zona

**Como** usuario en zona de baja cobertura  
**quiero** que la app lo sepa y adapte la experiencia  
**para** acceder a contenido aún sin internet estable.

### Criterios de aceptación

- [ ] El backend consulta `zona_visent` más cercana al usuario y devuelve `cobertura_red` (5G/4G/3G/sin_cobertura).
- [ ] Frontend muestra un indicador sutil: "Conectividad limitada" si es 3G o sin cobertura.
- [ ] **CONTRATO CROSS-SERVICE (H5)**: el `chat-agente-salud-svc` (cluster MongoDB aislado) **recibe la cobertura como claim del JWT o la pide vía HTTP a `geo-svc`** — ver US-09-GE-04.
- [ ] Si la cobertura es 3G o peor, el agente de salud sugiere recursos `descargable=true` de `recurso_bienestar` con preferencia por contenido offline.
- [ ] Si la cobertura es 3G o peor, el agente de orientación también lo sabe y reduce la cantidad de vacantes mostradas.
- [ ] Recursos descargables se persisten en cache del navegador (PWA — ver US-09-PWA-01).
- [ ] GlitchTip captura errores.

### Tareas técnicas derivadas

- `task/appbit/geolocalizacion/cobertura-check` — `GET /geo/cobertura?lat=X&lng=Y`
- `task/appbit/geolocalizacion/cobertura-middleware` — agrega claim `cobertura` al JWT
- `task/appbit/geolocalizacion/offline-bundle` — PWA service worker + cache de recursos
- `task/appbit/chat/salud/cobertura-aware` — el safety layer / LLM recibe cobertura
- `task/appbit/orientar/cobertura-aware` — `/orientar` filtra vacantes
- `task/appbit/geolocalizacion/glitchtip-instrumentation`

---

## US-09-GE-03 — Ver concentración de personas por zona (mapa de calor)

**Como** usuario  
**quiero** ver un mapa de calor con concentración de personas y cobertura  
**para** entender el contexto de mi región.

### Criterios de aceptación

- [ ] Mapa con capas toggleables: concentración, cobertura.
- [ ] Click en zona muestra métricas agregadas.
- [ ] Datos agregados, no individuales (privacidad).
- [ ] **Endpoint en MariaDB**: `GET /geo/heatmap?bbox=...&capa=concentracion|cobertura`.
- [ ] GlitchTip captura errores.

### Tareas técnicas derivadas

- `task/appbit/geolocalizacion/heatmap-screen`
- `task/appbit/geolocalizacion/zona-metricas-endpoint`
- `task/appbit/geolocalizacion/glitchtip-instrumentation`

---

## US-09-GE-04 — Contrato geo-svc ↔ chat-agente-salud-svc (CRÍTICO, H5)

**Como** arquitecto de plataforma  
**quiero** definir el contrato entre `geo-svc` y `chat-agente-salud-svc`  
**para** que el agente de salud sepa si debe sugerir contenido offline, sin romper el aislamiento del cluster MongoDB de salud.

### Contexto

El cluster MongoDB de `chat_salud_mental` está **físicamente aislado** (cuenta Atlas #2). El `chat-agente-salud-svc` NO tiene acceso a la tabla `zona_visent` (vive en MariaDB) ni a `geo-svc` por red privada compartida. **Pero el agente necesita saber la cobertura del usuario para sugerir contenido descargable**.

### Opciones evaluadas

| Opción | Pros | Contras | Decisión |
|---|---|---|---|
| **A) Claim en el JWT** | Bajo acoplamiento, el chat no llama a `geo-svc` | Requiere regenerar JWT cuando la cobertura cambia (raro); cobertura almacenada en Redis | ✅ **Recomendada** |
| **B) HTTP de `chat-agente-salud` → `geo-svc`** | Cobertura siempre fresca | Rompe aislamiento (chat de salud hace request a `geo-svc` fuera de su cluster) | ❌ No |
| **C) `geo-svc` publica evento `cobertura.cambiada.v1`** | Desacoplado, reactivo | El chat tendría que subscribirse a RabbitMQ desde dentro del cluster aislado (crea dependencia) | ❌ No |

### Contrato elegido: Opción A (claim en JWT)

**Flujo**:

```
1. Login del usuario → /auth/login
2. /auth/login llama a /geo/cobertura?lat=X&lng=Y con la última lat/lng del usuario
3. /auth/login agrega el claim `cobertura: "5G"|"4G"|"3G"|"sin_cobertura"` al JWT
4. /auth/login refresca la cobertura cada 24h (job) para mantener el claim fresco
5. /chat/salud/sessions valida el claim `cobertura` del JWT entrante
6. El agente de salud usa `cobertura` para decidir:
   - 5G/4G → modo normal, puede mostrar video y recursos online
   - 3G → modo conservador, prefiere recursos descargables
   - sin_cobertura → modo offline-first, solo recursos ya descargados en PWA
```

### Criterios de aceptación del contrato

- [ ] Claim `cobertura` agregado al JWT en `auth-svc` con TTL de 24h.
- [ ] Si el usuario no tiene `lat`/`lng`, `cobertura` es `null` (no se filtra contenido).
- [ ] Si el cluster MongoDB de salud rechaza un JWT sin claim `cobertura` (defensa en profundidad), el chat falla con error claro, no con crash.
- [ ] **Audit log en SIEM** cada vez que se cambia la cobertura detectada (para detectar movimiento de zona sospechosa).
- [ ] GlitchTip captura errores de la query a `geo-svc` durante login.
- [ ] **Documentado en `topologia-servicios.md`** como contrato cross-service.

### Tareas técnicas derivadas

- `task/appbit/auth/cobertura-claim-injector` — modifica `auth-svc` para consultar `geo-svc` durante login
- `task/appbit/auth/cobertura-refresh-job` — cron 24h que actualiza el claim
- `task/appbit/chat/salud/cobertura-claim-validator` — valida claim en el handler de sesión
- `task/appbit/chat/salud/cobertura-aware-prompt` — el system prompt del LLM incluye la cobertura
- `task/appbit/geolocalizacion/cobertura-endpoint-public` — endpoint público para `auth-svc` (sin auth previa)
- `task/appbit/geolocalizacion/glitchtip-instrumentation`

---

## US-09-PWA-01 — PWA instalable y offline-first (H13)

**Como** usuario  
**quiero** instalar la app en mi celular como PWA y que funcione offline  
**para** acceder a contenido incluso sin internet.

### Criterios de aceptación

- [ ] Manifest PWA con nombre, ícono, theme color, display: standalone.
- [ ] Service worker que cachea: shell de la app, recursos descargables, últimas 5 conversaciones de chat mentor.
- [ ] Banner "Instalar PWA" aparece en Chrome/Safari después de 2 visitas.
- [ ] Modo offline muestra: últimas conversaciones, recursos descargados, mensaje "no hay conexión, te avisamos cuando vuelvas".
- [ ] Cuando vuelve la conexión, sincroniza los mensajes enviados offline con el server.
- [ ] GlitchTip captura errores del service worker.

### Tareas técnicas derivadas

- `task/appbit/client/pwa-manifest` — manifest.json + íconos
- `task/appbit/client/service-worker` — estrategia de cache (stale-while-revalidate para shell, cache-first para recursos)
- `task/appbit/client/pwa-install-prompt` — UI del banner
- `task/appbit/client/offline-sync` — cola de mensajes pendientes
- `task/appbit/client/glitchtip-instrumentation`

---

## Responsables sugeridos

- **Data**: ingestión del dataset Vísent, seeds en MariaDB
- **Backend/API**: endpoints de consulta geoespacial, claim de cobertura
- **Frontend**: mapa, capas, indicadores, PWA
- **Auth**: integración del claim `cobertura` en JWT
- **Chat/Salud**: adaptar agente sensible a cobertura
- **Chat/Orientar**: adaptar respuesta a cobertura
