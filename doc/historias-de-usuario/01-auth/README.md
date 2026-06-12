# Módulo 01 — Autenticación y Usuarios

> **Rama módulo**: `feat/appbit/auth` (en monorepo `server/auth/`)
> **Rama épica padre**: `feat/appbit`
> **Endpoints**: `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/forgot-password`
> **Entidades DB**: `usuario` (PostgreSQL), `refresh_tokens` y `revoked_tokens` (SQLite en `auth-svc`)
> **SLO**: **99.5% disponibilidad** (servicio crítico)

> **Decisiones de arquitectura aplicadas** (ver `doc/arquitectura/seguridad-compliance.md`):
> - JWT **RS256** (asimétrico), no HS256
> - **Blacklist** del `jti` para revocación inmediata (Redis dockerizado + SQLite local)
> - **Rate limit** estricto en login (5/min, 15min lockout tras 10)
> - Hash de passwords con **argon2id** (memory=64MB, time=3, parallelism=4)
> - Rate limit por endpoint (ver `seguridad-compliance.md` §10)

---

## Personas

- **Persona primaria**: Estudiante o profesional sub-representado que quiere crear su cuenta para acceder a los 5 servicios.
- **Persona secundaria**: Persona que vuelve al día siguiente y necesita re-entrar sin fricción.
- **Persona administrativa**: `admin_clinico` o `admin_eventos` que accede al panel con **MFA obligatorio** (TOTP).

---

## US-01-AUTH-01 — Registro de cuenta con email y contraseña

**Como** persona visitante  
**quiero** crear una cuenta con email y contraseña  
**para** acceder a la plataforma y completar mi perfil.

### Criterios de aceptación

- [ ] Formulario con: nombre, email, contraseña, confirmación de contraseña.
- [ ] Email válido y único en `usuario.email` (validación server-side).
- [ ] Contraseña mínimo 8 caracteres, 1 mayúscula, 1 dígito.
- [ ] Se persiste `password_hash` con **argon2id** (memory=64MB, time=3, parallelism=4), nunca el texto plano.
- [ ] Si el email ya existe, retorna `409 Conflict` con mensaje claro.
- [ ] Al éxito, devuelve JWT de acceso (RS256, 1h expiración) + refresh token (7 días).
- [ ] Devuelve `201 Created` con el `id` del usuario recién creado.
- [ ] Se publica evento `auth.usuario.creado.v1` (CloudEvents 1.0) con `{ usuario_id, email, idioma_preferido: 'pt' }` para que `perfil-svc` inicialice el perfil en blanco.
- [ ] **NO** se loguea la contraseña (ni en texto plano ni hasheada) en ningún log.
- [ ] **GlitchTip** captura cualquier excepción de este endpoint.

### Tareas técnicas derivadas

- `task/appbit/auth/register-screen` — UI del formulario
- `task/appbit/auth/register-endpoint` — `POST /auth/register`
- `task/appbit/auth/password-hash-util` — util de hash argon2id
- `task/appbit/auth/jwt-issue` — emisión de tokens RS256
- `task/appbit/auth/outbox-write` — INSERT en outbox_events para el evento
- `task/appbit/auth/rate-limit-middleware` — 3 registros/hora por IP
- `task/appbit/auth/glitchtip-instrumentation`
- `task/appbit/auth/k6-shallow-test` — 10 VUs registrando usuarios en CI
- `task/appbit/auth/dockerfile` — multi-stage, distroless

---

## US-01-AUTH-02 — Inicio de sesión

**Como** usuario registrado  
**quiero** iniciar sesión con email y contraseña  
**para** retomar mi progreso en la plataforma.

### Criterios de aceptación

- [ ] Formulario email + contraseña.
- [ ] Credenciales inválidas → `401 Unauthorized` con mensaje genérico (no revela si el email existe).
- [ ] Al éxito, devuelve JWT (RS256, 1h) + refresh token (7 días, rotado en cada uso).
- [ ] **Rate limit**: 5 intentos / minuto por IP + email. Tras 10 intentos fallidos en 15 min, **lockout de 15 min** para esa combinación IP+email.
- [ ] **Audit log** registra `login_success` y `login_failed` con: `email`, `ip`, `user_agent`, `timestamp`, `outcome`. Sin password.
- [ ] GlitchTip captura errores 5xx.
- [ ] **Lockout cooperativo**: si la cuenta está bloqueada, el lockout es por cuenta+IP (no global) para no permitir DoS de cuenta ajena.

### Tareas técnicas derivadas

- `task/appbit/auth/login-screen`
- `task/appbit/auth/login-endpoint` — `POST /auth/login`
- `task/appbit/auth/rate-limit-redis` — sliding window 5/min
- `task/appbit/auth/lockout-logic` — 15 min tras 10 fallos
- `task/appbit/auth/audit-log` — JSON estructurado, redacción de password
- `task/appbit/auth/glitchtip-instrumentation`
- `task/appbit/auth/k6-shallow-test` — login success + login fail rate-limited

---

## US-01-AUTH-03 — Recuperación de contraseña

**Como** usuario que olvidó su contraseña  
**quiero** recibir un enlace de recuperación por email  
**para** volver a entrar a mi cuenta.

### Criterios de aceptación

- [ ] Pantalla con input de email.
- [ ] Backend envía email con **token firmado de un solo uso**, expiración 1h, vía SMTP (Mailgun free o Resend free).
- [ ] Endpoint `POST /auth/forgot-password` **siempre** responde `200 OK` aunque el email no exista (evita enumeración de cuentas).
- [ ] Pantalla de reset acepta nueva contraseña + confirmación (con las mismas reglas de validación que en registro).
- [ ] Token usado se invalida; intentar reusarlo retorna `400 Bad Request`.
- [ ] **Cambio de contraseña invalida todas las sesiones previas** (revoca todos los refresh tokens activos del usuario).
- [ ] Se publica evento `auth.password.cambiada.v1` para que `notification-svc` envíe email de "tu password fue cambiada".
- [ ] GlitchTip captura errores.
- [ ] El email NO contiene la contraseña anterior (obvio) ni el hash de la nueva (por seguridad).

### Tareas técnicas derivadas

- `task/appbit/auth/forgot-screen`
- `task/appbit/auth/forgot-endpoint` — `POST /auth/forgot-password`
- `task/appbit/auth/reset-endpoint` — `POST /auth/reset-password`
- `task/appbit/auth/email-sender-mailgun` — o Resend
- `task/appbit/auth/reset-token` — token firmado de un solo uso
- `task/appbit/auth/revoke-all-on-password-change`
- `task/appbit/auth/glitchtip-instrumentation`

---

## US-01-AUTH-04 — Refresh, logout y revocación inmediata

**Como** usuario activo  
**quiero** que mi sesión se renueve automáticamente y poder cerrarla cuando quiera  
**para** no tener que volver a iniciar sesión cada hora y para tener control sobre mi cuenta.

### Criterios de aceptación

- [ ] `POST /auth/refresh` recibe refresh token válido, devuelve nuevo access token (y opcionalmente nuevo refresh rotado).
- [ ] Refresh token expirado o revocado → `401 Unauthorized` con mensaje claro.
- [ ] **`POST /auth/logout`** revoca el refresh token actual Y agrega el `jti` del access token a la **blacklist en Redis** (TTL = tiempo restante del access).
- [ ] Próxima petición con ese access token → `401` (consulta blacklist en Redis con fallback a SQLite).
- [ ] **Cambio de contraseña** desde otro dispositivo invalida todas las sesiones del usuario (revoca todos los `jti` activos vía evento `auth.password.cambiada.v1` que dispara invalidación masiva).
- [ ] GlitchTip captura errores.

### Tareas técnicas derivadas

- `task/appbit/auth/refresh-endpoint` — `POST /auth/refresh`
- `task/appbit/auth/logout-endpoint` — `POST /auth/logout`
- `task/appbit/auth/blacklist-jti-redis` — agregar/consultar `jti` con TTL
- `task/appbit/auth/blacklist-fallback-sqlite` — si Redis está caído
- `task/appbit/auth/revoke-all-consumer` — escucha `auth.password.cambiada.v1` y revoca masivamente
- `task/appbit/auth/refresh-rotation` — refresh tokens de un solo uso
- `task/appbit/auth/glitchtip-instrumentation`

---

## US-01-AUTH-05 — MFA obligatorio para administradores

**Como** `admin_clinico` o `admin_eventos`  
**quiero** que se me pida un segundo factor de autenticación  
**para** proteger datos sensibles por si me roban la contraseña.

### Criterios de aceptación

- [ ] Tras login exitoso con email+password, si el `rol` del usuario es `admin_clinico` o `admin_eventos`, se requiere **TOTP** (RFC 6238).
- [ ] Usuario debe haber enrolado TOTP previamente (QR code la primera vez).
- [ ] TOTP secret se cifra en reposo con KMS (mismo esquema que el chat de salud).
- [ ] TOTP válido → JWT + refresh normales.
- [ ] TOTP inválido → `401`, se loguea como `login_failed_mfa` con rate limit reducido (3/min).
- [ ] **NO** aplica a usuarios normales (solo admins).
- [ ] Si el admin pierde acceso al TOTP, flujo de recovery con `admin_clinico` senior (proceso manual documentado en runbook).

### Tareas técnicas derivadas

- `task/appbit/auth/mfa-totp-enroll` — genera secret + QR
- `task/appbit/auth/mfa-totp-verify` — valida TOTP en login
- `task/appbit/auth/mfa-secret-encryption` — KMS-cifrado
- `task/appbit/auth/mfa-recovery-runbook` — manual, no automatizado
- `task/appbit/auth/glitchtip-instrumentation`

---

## Responsables sugeridos

- **Backend**: equipo API — 1 persona
- **Frontend**: equipo UI — 1 persona
- **Seguridad**: revisar la persona de backend + auditor
- **Ética/Producto**: validar política de recovery de MFA (no automatizar acceso de admin en ningún caso)
