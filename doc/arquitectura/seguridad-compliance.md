# Seguridad y Compliance — App BiT

> Documento vivo. Define políticas de autenticación, autorización, cifrado, retención de datos y cumplimiento normativo.
> No negociable para producción. Bloquea releases que no cumplan.

---

## 1. Marco regulatorio aplicable

| Norma | Aplica por | A qué afecta |
|---|---|---|
| **LGPD** (Lei Geral de Proteção de Dados, Brasil) | Usuarios en Brasil | Todos los datos personales |
| **GDPR** (Europa) | Usuarios en Angola/Portugal/LATAM con tratamiento EU | Datos de europeos |
| **Marco Civil da Internet** (Brasil) | Usuarios en Brasil | Logs, retención, contenido |
| **Estatuto da Criança e do Adolescente** | Usuarios < 18 años | Consentimiento parental, datos de menores |
| **Resolução CFP 010/2005** (Brasil) | Agente de salud mental | Confidencialidad clínica |
| **Código de Ética del Psicólogo** | Cualquier usuario que use /salud | Secreto profesional |

App BiT es **internacional** (BR + Angola + LATAM). Asumimos el estándar más estricto (GDPR) como baseline.

---

## 2. Clasificación de datos

Cada dato tiene un nivel de sensibilidad que define cómo se trata:

| Nivel | Definición | Ejemplos | Almacenamiento |
|---|---|---|---|
| **P0 — Crítico** | Dato cuyo compromiso causa daño severo | Mensajes de salud-mental, derivaciones CVV, datos de geolocalización de zonas sensibles | Cluster MongoDB aislado, cifrado AES-256, acceso por rol |
| **P1 — Personal identificable** | Dato que identifica a una persona | Email, nombre, WhatsApp, fecha de nacimiento | PostgreSQL, cifrado en reposo, acceso por el propio usuario |
| **P2 — Personal seudonimizado** | Dato que puede re-vincularse con esfuerzo | `usuario_id` (UUID), sesiones | Todas las DBs |
| **P3 — Operacional** | Dato técnico no personal | Logs de request, métricas, trazas | Todas las DBs e infra |
| **P4 — Público** | Dato no sensible por diseño | Catálogo de cursos, testimonios públicos | MariaDB y frontend |

### Matriz de exposición

| Dato | Nivel | ¿Quién accede? |
|---|---|---|
| Mensaje de chat mentor↔usuario | P1 | Los 2 participantes + admin del sistema |
| Mensaje de chat agente orientar | P1 | El propio usuario + admin del sistema |
| **Mensaje de chat salud-mental** | **P0** | **Solo el usuario + admin_clinico** (no devs) |
| Check-in emocional (humor) | P1 | El propio usuario + admin del sistema |
| **Derivación CVV** | **P0** | **Solo el usuario + admin_clinico** |
| Email del usuario | P1 | El propio usuario, sistema de auth |
| Perfil profesional | P2 | El propio usuario, otros usuarios ven versión pública (mentores) |
| Vacante aplicada | P2 | El usuario, la empresa, sistema |
| Recursos de bienestar | P4 | Todos |
| Catálogo de cursos | P4 | Todos |
| Eventos / testimonios | P4 | Todos |
| Datos Vísent | P3 | Todos (son datos agregados, no personales) |

---

## 3. Autenticación

### 3.1 Estrategia

- **JWT firmado con RS256** (asimétrico, no HS256) para que el gateway pueda verificar sin tener la clave privada
- **Access token**: 1 hora de expiración
- **Refresh token**: 7 días, rotado en cada uso, almacenado hasheado en SQLite de auth-svc
- **Revocación inmediata** posible: el `jti` del token se agrega a una blacklist en SQLite (cacheada en Redis para performance)

### 3.2 Claims del JWT

```json
{
  "iss": "auth.appbit.com",
  "sub": "uuid-del-usuario",
  "aud": "appbit-api",
  "exp": 1718100000,
  "iat": 1718096400,
  "jti": "uuid-unico-del-token",
  "rol": "usuario",  // usuario | mentor | admin_eventos | admin_clinico | auditor
  "idioma": "pt",
  "email_verified": true,
  "scope": ["orientar:read", "salud:write", ...]
}
```

### 3.3 Flujo de login

```
1. Usuario → POST /auth/login (email, password)
2. auth-svc valida contra PostgreSQL
3. Genera access + refresh token
4. Persiste refresh token hasheado en SQLite (sessions.db)
5. Retorna ambos tokens al cliente
6. Cliente guarda access en memoria (NO localStorage), refresh en httpOnly secure cookie
```

### 3.4 Logout

```
1. Cliente borra tokens locales
2. Cliente → POST /auth/logout con access token
3. auth-svc:
   a. Agrega el jti del access a blacklist (TTL = tiempo restante del token)
   b. Elimina el refresh token de SQLite
4. Próxima petición con ese access token → 401
```

### 3.5 Cambio de contraseña

```
1. Cliente → PATCH /usuarios/me con nueva password
2. perfil-svc → auth-svc vía HTTP interno (mTLS)
3. auth-svc:
   a. Hashea nueva password
   b. Actualiza PostgreSQL
   c. Revoca TODOS los refresh tokens activos del usuario
   d. Emite evento auth.password.cambiada
4. Cliente debe volver a loguearse en otros dispositivos
```

### 3.6 Multi-factor authentication (MFA)

**Decisión**: MFA opcional en MVP, obligatorio para `admin_clinico` y `admin_eventos`.

Para admins: TOTP (Google Authenticator, Authy) — el secret se cifra en reposo.

---

## 4. Autorización

### 4.1 Modelo RBAC + scopes

Cada usuario tiene un **rol** y un conjunto de **scopes**. Los servicios validan ambos.

| Rol | Scopes por defecto | Restricciones |
|---|---|---|
| `usuario` | `orientar:read`, `salud:read`, `salud:write`, `mentor:read`, `chat:write` | Solo sus propios datos |
| `mentor` | `mentor:write`, `chat:write` (mentor) | Solo invitaciones donde es mentor |
| `admin_eventos` | `eventos:write` | Acceso a CRUD de eventos y testimonios |
| `admin_clinico` | `salud:read-all` (seudonimizado) | Puede ver mensajes de salud-mental, **debe firmar acuerdo de confidencialidad** |
| `auditor` | `audit:read` | Solo metadatos, nunca contenido |
| `sistema` | (cuenta de servicio) | mTLS obligatorio, no tiene usuario humano |

### 4.2 Validación en cada servicio

Cada servicio **nunca confía en el gateway**. Re-valida:

1. **Firma del JWT** (RS256 con la clave pública)
2. **Expiración** del token
3. **Blacklist** del `jti` (consulta Redis con fallback a SQLite)
4. **Scope** requerido para la acción
5. **Ownership** del recurso (¿el usuario es dueño de este `usuario_id`?)

### 4.3 Autorización a nivel de recurso

| Recurso | Quién puede leer | Quién puede escribir |
|---|---|---|
| `usuario` (perfil propio) | El propio usuario | El propio usuario |
| `aplicacion` | El usuario dueño, la empresa | El usuario dueño (crear), la empresa (cambiar estado) |
| `checkin_emocional` | El propio usuario, admin_clinico (seudonimizado) | El propio usuario |
| `mensaje_chat_mentoria` | Los 2 participantes | El autor (editar/borrar) |
| `mensaje_chat_salud` | El propio usuario, admin_clinico | El propio usuario, sistema (safety layer) |
| `curso` | Todos | admin_eventos |
| `evento` | Todos | admin_eventos |
| `mentoria_invitacion` | Mentor y usuario involucrados | El mentor (crear, aceptar, rechazar) |

---

## 5. Cifrado

### 5.1 En tránsito

| Tramo | Protocolo | Configuración |
|---|---|---|
| Cliente → Gateway | TLS 1.3 | Certificados de Let's Encrypt, HSTS habilitado |
| Gateway → Servicio | mTLS (HTTP/2) | Certificados internos de la CA del cluster |
| Servicio → DB | TLS nativo del driver | Conexión rechazada si no es TLS |
| RabbitMQ | TLS 1.3 + SASL | Certificados por servicio |
| WebSocket | TLS 1.3 (wss://) | Misma config que HTTPS |

**HSTS**: `max-age=31536000; includeSubDomains; preload`

**Certificados**: rotación automática cada 90 días.

### 5.2 En reposo

| Dato | Cifrado | Algoritmo | Clave |
|---|---|---|---|
| Passwords | bcrypt/argon2id (hash) | argon2id, memory=64MB, time=3, parallelism=4 | N/A |
| JWT refresh tokens | SHA-256 (hash) | N/A | N/A |
| Datos personales en PostgreSQL | Cifrado de disco (LUKS/EBS) | AES-256-XTS | KMS del cloud |
| `messages` en `chat_salud_mental` | **Cifrado a nivel de documento** | AES-256-GCM | KMS dedicado, rotación anual |
| `usuario_id` en eventos de salud | Seudonimización | SHA-256 con sal por entorno | Sal en HSM |
| Backups | Cifrado del bucket | AES-256 | KMS |
| Logs de auditoría | Cifrado del bucket | AES-256 | KMS separado |

### 5.3 Gestión de claves

- **KMS del cloud** (AWS KMS, GCP KMS o equivalente) para todas las claves de cifrado
- **Rotación automática** anual para claves de datos
- **Rotación trimestral** para claves de eventos de salud
- **Doble custody** requerida para rotar manualmente la clave raíz del cluster MongoDB de salud
- **HSM (Hardware Security Module)** para la clave raíz de seudonimización de salud

---

## 6. Aislamiento de compliance (cluster MongoDB de salud-mental)

### 6.1 Por qué aislado

Los datos de salud-mental son los más sensibles del producto. Un breach de esta DB es **catastrófico** legal y reputacionalmente. El aislamiento es la defensa más fuerte.

### 6.2 Configuración

| Aspecto | Configuración |
|---|---|
| Cluster MongoDB | Dedicado, sin otros servicios usando el mismo cluster |
| Región | Misma que el resto (latencia), pero en cuenta separada |
| Red | Subnet privada, sin acceso desde internet, solo desde `chat-agente-salud-svc` y `salud-svc` |
| Credenciales | Distintas del resto, en secreto dedicado en Vault |
| Backups | Cifrados con clave separada, en bucket dedicado |
| Acceso humano | Solo el `admin_clinico` con MFA + aprobación de dos personas para producción |
| Acceso del sistema | mTLS obligatorio + IP allowlist |

### 6.3 Auditoría de accesos

Todo acceso a la DB de salud-mental (lectura, escritura, schema change) se loguea a un **SIEM externo** (Splunk, Elastic SIEM) con:

- Quién (usuario o servicio)
- Qué (query ejecutada)
- Cuándo (timestamp)
- Desde dónde (IP, geo, user-agent)
- Por qué (justificación obligatoria para accesos manuales)

Retención de logs de auditoría: **5 años** (más allá de la retención de los datos clínicos).

### 6.4 Anonimización y seudonimización

| Momento | Acción |
|---|---|
| Almacenamiento | `usuario_id` se seudonimiza con SHA-256 + sal por entorno |
| Tras 24 meses de inactividad del usuario | Reemplazar `usuario_id` por hash anónimo, mantener verbatim cifrado |
| Tras solicitud de supresión (LGPD art. 18) | Borrado real, manteniendo solo metadatos de auditoría de la derivación |

---

## 7. Retención de datos

### 7.1 Tabla de retención

| Dato | Retención activa | Después | Justificación |
|---|---|---|---|
| Cuenta de usuario | Hasta eliminación por usuario | N/A | Base del servicio |
| Perfil | Mientras la cuenta exista | Anonimizado al eliminar | LGPD |
| Check-in emocional | Mientras la cuenta exista | Anonimizado a 24 meses | Análisis de patrones |
| Mensaje chat mentor | 24 meses | Anonimizado | Cumplimiento + memoria |
| Mensaje chat agente orientar | 90 días (TTL MongoDB) | Resumen conservado | Optimización costos |
| **Mensaje chat salud** | **Indefinido** (hasta supresión) | **Anonimizado a 24 meses** | **Compliance clínico** |
| Aplicación a vacante | 12 meses | Anonimizado | Modelo de negocio |
| Logs de auditoría de salud | 5 años | Archivo cifrado separado | Marco Civil da Internet |
| Logs operacionales | 90 días | Purgados | Optimización |
| Métricas de uso agregadas | 36 meses | Anonimizadas | Producto |
| Backups DB | 30 días | Purgados | Disaster recovery |
| Backups DB de salud | 90 días | Purgados con doble confirmación | Compliance |

### 7.2 Implementación

- **TTL indexes** en MongoDB para mensajes con retención fija (chat orientar: 90 días)
- **Jobs de anonimización** nocturnos en cada servicio (cron + worker)
- **Soft delete** en PostgreSQL y MariaDB con `deleted_at`
- **Hard delete** solo tras solicitud explícita de supresión

---

## 8. Derechos del usuario (LGPD/GDPR)

| Derecho | Implementación | Endpoint |
|---|---|---|
| **Acceso** (saber qué datos tengo) | Endpoint que exporta todo en JSON + PDF | `GET /usuarios/me/export` |
| **Rectificación** | `PATCH /usuarios/me` | (ya existe) |
| **Eliminación** | Soft delete + hard delete tras 30 días | `DELETE /usuarios/me` |
| **Portabilidad** | Export en JSON con schema documentado | `GET /usuarios/me/export?format=json` |
| **Oposición** | Opt-out de marketing, análisis, IA | `PATCH /usuarios/me/preferencias` |
| **Revocación de consentimiento** | Cada acción sensible pide consentimiento explícito | N/A (en cada UI) |

**SLA**: cualquier solicitud del usuario se responde en **15 días** (LGPD da 15 días, GDPR da 30).

---

## 9. Logging de seguridad

### 9.1 Eventos auditados

| Evento | Nivel | Destino |
|---|---|---|
| Login exitoso | INFO | Logs operacionales |
| Login fallido | WARN | Logs + contador de rate limit |
| Cambio de password | INFO | Auditoría |
| Eliminación de cuenta | CRITICAL | Auditoría + alerta a producto |
| Acceso a datos de otro usuario | CRITICAL | Auditoría + alerta inmediata |
| Acceso a mensajes de salud | **CRITICAL** | SIEM externo + alerta a guardia |
| Modificación de DB de salud (DDL) | **CRITICAL** | SIEM + aprobación requerida |
| Rotación de claves KMS | INFO | Auditoría |
| Intento de bypass de autorización | WARN → CRITICAL si es repetido | Logs + rate limit + alerta |

### 9.2 Formato

Todos los logs en JSON estructurado:

```json
{
  "timestamp": "2026-06-11T10:00:00Z",
  "level": "WARN",
  "service": "perfil-svc",
  "request_id": "uuid",
  "user_id": "uuid",
  "event": "auth.login.failed",
  "details": {
    "email": "user@example.com",
    "reason": "invalid_password",
    "ip": "203.0.113.42",
    "user_agent": "Mozilla/5.0...",
    "attempt_number": 3
  }
}
```

### 9.3 Lo que **nunca** se loguea

- Contenido de mensajes de salud-mental
- Contraseñas (ni hasheadas, para no leakear el hash)
- Tokens JWT completos (solo el `jti` y el hash)
- Datos de geolocalización precisos
- Emails en texto plano en producción (solo en staging para debug)

---

## 10. Seguridad de aplicación (OWASP Top 10)

| Vulnerabilidad | Mitigación |
|---|---|
| **A01 — Broken Access Control** | RBAC + scopes + validación de ownership en cada servicio |
| **A02 — Cryptographic Failures** | TLS 1.3, AES-256, argon2id, sin algoritmos legacy |
| **A03 — Injection** | Queries parametrizadas, ORM, validación con schemas (Zod/Pydantic) |
| **A04 — Insecure Design** | Threat modeling en cada feature nueva, premortem antes de release |
| **A05 — Security Misconfiguration** | Hardening de imágenes Docker, secrets en Vault, no defaults |
| **A06 — Vulnerable Components** | Dependabot + Renovate + escaneo semanal con Snyk/Trivy |
| **A07 — Auth Failures** | Rate limit en login, MFA en admin, blacklist de jti |
| **A08 — Software & Data Integrity** | Firmas de imágenes, SLSA L3, verificación de artifacts |
| **A09 — Security Logging Failures** | Logging estructurado + SIEM + alertas (ver §9) |
| **A10 — SSRF** | Validación de URLs en webhooks, allowlist de IPs para integraciones |

### Rate limiting (defaults)

| Endpoint | Límite | Ventana | Acción al exceder |
|---|---|---|---|
| `POST /auth/login` | 5 | 1 min | 429 + 15min lockout tras 10 |
| `POST /auth/register` | 3 | 1 hora por IP | 429 |
| `POST /orientar` | 30 | 1 min por usuario | 429 |
| `POST /salud` | 10 | 1 min por usuario | 429 (recursos sensibles) |
| `POST /chat/*/messages` | 60 | 1 min por conversación | 429 |
| Cualquier endpoint | 100 | 1 min por usuario | 429 |

---

## 11. Seguridad de infraestructura

| Aspecto | Configuración |
|---|---|
| Imágenes Docker | Base mínima (alpine, distroless), escaneadas con Trivy en cada build |
| Secrets | Vault o cloud secret manager, nunca en env vars del repo |
| Acceso SSH | Deshabilitado en producción, solo bastion con MFA |
| Red de servicios | Subnets privadas, security groups restrictivos, sin IPs públicas |
| Container runtime | gVisor o Kata Containers para aislamiento extra |
| Secrets en logs | Redacción automática con regex en el log pipeline |
| Backups | Cifrados, probados trimestralmente con restore real |

---

## 12. Respuesta a incidentes

### 12.1 Severidades

| Severidad | Definición | SLA respuesta | SLA resolución |
|---|---|---|---|
| P0 | Breach de datos de salud-mental o credenciales | 15 min | 24 h |
| P1 | Servicio caído > 5 min | 30 min | 4 h |
| P2 | Funcionalidad crítica degradada | 2 h | 24 h |
| P3 | Funcionalidad no crítica rota | 8 h | 1 semana |
| P4 | Cosmético | 1 semana | Backlog |

### 12.2 Runbook de breach de datos de salud-mental

```
1. Confirmar el breach (segundo ingeniero + admin_clinico)
2. Aislar el cluster MongoDB de salud (cortar acceso de red)
3. Preservar evidencia (snapshots, logs)
4. Notificar a:
   - DPO (Data Protection Officer) en < 1h
   - Autoridades regulatorias (ANPD en Brasil) en < 24h
   - Usuarios afectados en < 72h (LGPD)
5. Análisis forense (qué datos, cuántos usuarios, ventana de tiempo)
6. Plan de remediación con timeline
7. Post-mortem público (severidad P0)
8. Rotación de todas las claves de cifrado afectadas
```

### 12.3 Comunicación

- **Interno**: canal de guardia 24/7, escalada a CTO en P0/P1
- **Externo**: solo personal autorizado, DPO firma todos los comunicados
- **Usuarios**: template pre-aprobado por legal, traducido a PT y ES

---

## 13. Compliance y auditoría

### 13.1 Estándares que aplicamos

| Estándar | Aplicación | Auditoría |
|---|---|---|
| **LGPD** | Política de privacidad, consentimientos, derechos del usuario | Anual externa |
| **GDPR** (si entramos a EU) | Equivalente a LGPD, DPO nombrado | Anual externa |
| **ISO 27001** (objetivo año 1) | SGSI completo | Anual externa |
| **SOC 2 Type II** (objetivo año 2) | Controles de seguridad y disponibilidad | Anual externa |

### 13.2 Documentación obligatoria

- [ ] Política de privacidad (PT y ES)
- [ ] Términos de servicio
- [ ] Política de cookies
- [ ] Acuerdo de confidencialidad para admin_clinico
- [ ] DPA (Data Processing Agreement) con proveedores
- [ ] Registro de actividades de tratamiento (LGPD art. 37)
- [ ] Análisis de impacto (DPIA) para /salud
- [ ] Plan de respuesta a incidentes
- [ ] Política de retención documentada (este doc)

---

## 14. Decisiones pendientes

1. **MFA en /salud para profesionales**: ¿TOTP o magic link? — Sugerido: TOTP para clínicos
2. **Retención de audios/videos en chat mentor**: ¿se permiten? Por ahora solo texto e imágenes
3. **Anonimización de testimonios**: ¿se anonimizan al pasar X años o se mantienen con consentimiento renovado cada Y?
4. **Geolocalización precisa**: ¿se guarda la lat/lng exacta del usuario o se redondea a la zona Vísent más cercana? — Sugerido: redondear para no tener dato fino
5. **Consentimiento granular por IA**: ¿el usuario puede desactivar que el agente aprenda de sus mensajes? — Sugerido: sí, opt-out en preferencias

---

## 15. Próximos pasos

1. Contratar/nombrar DPO (Data Protection Officer)
2. Implementar el logging estructurado en todos los servicios (sprint 0)
3. Crear threat model para `/salud` con revisión de psicólogo/ético
4. Configurar Vault para secrets
5. Sprint 1: implementar el cifrado de documentos de salud-mental (crítico)
6. Auditoría externa de LGPD antes de lanzamiento público

---

## 16. Interoperabilidad clínica regional (Brasil + LATAM)

App BiT va a usarse primero en **Brasil** y progresivamente en **Angola y LATAM**. Los datos de salud-mental pueden necesitar interoperar con sistemas clínicos reales (derivación a SUS, integración con EHR de un hospital, exportación a RNDS, etc.). Por eso el schema se diseña **"FHIR-friendly"** desde el inicio, con vocabularios clínicos normalizados.

### 16.1 Estándares aplicables por país

#### Brasil (prioridad 1 — mercado principal)

| Estándar / regulación | Qué regula | Impacto en diseño |
|---|---|---|
| **RNDS (Rede Nacional de Dados em Saúde)** | Red nacional obligatoria del Ministerio de Salud, perfil **FHIR R4** con extensiones brasileñas | Schema debe poder exportarse a FHIR R4 |
| **LGPD + Resoluções CFM 1.821/2007 y 2.217/2018** | Normas del Consejo Federal de Medicina sobre historia clínica | Retención ≥ 20 años para historia clínica, 5 años para registros de salud mental de adultos |
| **Resolução CFP 010/2005** | Código de ética del psicólogo, secreto profesional | Mensajes de salud-mental bajo secreto profesional, no pueden usarse para fines secundarios sin consentimiento |
| **CPF (Cadastro de Pessoas Físicas)** | Identificador nacional único del ciudadano | Campo `cpf` opcional en `usuario` para integración con sistemas públicos |
| **CNS (Cartão Nacional de Saúde)** | Tarjeta sanitaria del SUS | Posible integración futura con SUS vía DATASUS |
| **DATASUS / e-SUS** | Sistemas de información del SUS | Si en el futuro nos integramos, mapeo a SUS-vacina, SISAB, etc. |
| **Portaria 2.073/2011** | Regula el Registro Eletrônico em Saúde (RES) | Estándar técnico del Ministerio |

#### LATAM (prioridad 2)

| País | Estándar | Notas |
|---|---|---|
| **Argentina** | SISA (Sistema Integrado de Información Sanitaria) + FHIR R4 en adopción | Habeas Data, derecho de acceso |
| **México** | SINBA + FHIR en IMSS/ISSSTE | Derechos ARCO, NOM-024-SSA3-2012 |
| **Colombia** | RIPS + MIAS (Modelo Integral de Atención) | Resolución 1995 de 1999 (historia clínica) |
| **Chile** | SIDRA + HL7 | Ley 20.584 de derechos del paciente |
| **Perú, Paraguay, Uruguay** | Sin estándar nacional fuerte aún | Adoptan lo que Brasil/Argentina hacen |
| **Angola** | SINUS (Sistema Nacional de Salud) en desarrollo | Próxima frontera del producto |

### 16.2 Vocabularios clínicos a cargar

El sistema usa **cuatro vocabularios controlados** desde MVP. Todos son open standard:

| Vocabulario | Uso | Disponibilidad |
|---|---|---|
| **LOINC** (Logical Observation Identifiers Names and Codes) | Codificación de observaciones clínicas (escalas, signos vitales) | Universal, free |
| **SNOMED CT** | Codificación de síntomas, trastornos, conceptos clínicos | **Brasil tiene licencia nacional gratuita**, LATAM paga individual |
| **CID-10 / ICD-10** | Clasificación Internacional de Enfermedades | Obligatorio en Brasil y todos los países de LATAM, gratis vía OMS |
| **CIAP-2** | Clasificación Internacional de Atención Primaria | Usado en atención primaria brasilera, gratis |

### 16.3 Escalas de bienestar estandarizadas (seed inicial)

Para que el check-in emocional sea interoperable clínicamente, las escalas se mapean a LOINC:

| Escala | LOINC code | Uso |
|---|---|---|
| PHQ-9 (Patient Health Questionnaire) | `44261-6` | Screening de depresión (9 items, 0-27 puntos) |
| GAD-7 (Generalized Anxiety Disorder) | `70274-6` | Screening de ansiedad (7 items, 0-21 puntos) |
| Beck Depression Inventory (BDI-II) | `89205-7` | Depresión moderada-severa |
| WHO-5 Well-Being Index | `65625-0` | Bienestar general (5 items, 0-100%) |
| Escala de Autoestima de Rosenberg | (pendiente mapeo) | Autoestima |

### 16.4 Schema "FHIR-friendly" (no FHIR nativo)

**Decisión MVP**: no implementamos interoperabilidad FHIR real, pero diseñamos el schema de manera que la migración sea directa cuando se necesite.

#### Cambios concretos en el schema

**`checkin_emocional`** se enriquece:

| Campo | Tipo | Notas |
|---|---|---|
| `humor` (existente) | VARCHAR | Mantener, pero agregar codificación |
| `humor_codigo` (nuevo) | VARCHAR(20) | Código SNOMED, ej: `"44054006"` (tristeza) |
| `nota_semanal` (existente) | SMALLINT | Mantener 0-10 |
| `escala_usada` (nuevo) | VARCHAR(40) | PHQ-9, GAD-7, WHO-5, libre |
| `escala_codigo_loinc` (nuevo) | VARCHAR(20) | Código LOINC de la escala |
| `escala_items_json` (nuevo) | JSONB | Items individuales: `{"q1": 2, "q2": 3, ...}` |
| `puntuacion_total` (nuevo) | DECIMAL(5,2) | Puntuación estandarizada según escala |
| `interpretacion` (nuevo) | VARCHAR(40) | Resultado interpretado: "leve", "moderado", "severo" |
| `contexto` (existente JSONB) | JSONB | Mantener, libre para metadata no clínica |

**`recurso_bienestar`** se enriquece:

| Campo nuevo | Tipo | Notas |
|---|---|---|
| `categoria_clinica` | VARCHAR(40) | Categoría SNOMED (actividad, mindfulness, etc.) |
| `indicaciones_json` | JSONB | Array de códigos SNOMED/LOINC para los que aplica |

**`derivacion_cvv`** se enriquece:

| Campo nuevo | Tipo | Notas |
|---|---|---|
| `motivo_clinico_codigo` | VARCHAR(20) | Código CID-10 o SNOMED del motivo de derivación |
| `servicio_destino` | VARCHAR(80) | "CVV", "CAPS", "SUS-emergencia", "hospital" |
| `urgencia` | VARCHAR(20) | "inmediata", "24h", "1-semana" |

#### `usuario` se enriquece con identificadores regionales

| Campo | Tipo | Restricciones | Notas |
|---|---|---|---|
| `cpf` | VARCHAR(11) | UNIQUE NULL, cifrado en reposo | Brasileños, opcional |
| `documento_nacional_tipo` | VARCHAR(20) | NULL | DNI, Cédula, CPF, etc. |
| `documento_nacional_numero` | VARCHAR(40) | NULL, cifrado en reposo | Número del documento |
| `documento_nacional_pais` | VARCHAR(60) | NULL | País emisor ISO-3166 |

> **Privacidad**: el documento se cifra a nivel de aplicación (mismo esquema que los mensajes de salud). El equipo NO debe tener acceso al documento en producción normal, solo cuando se necesita para una derivación concreta.

### 16.5 Tabla nueva: `terminologia_clinica`

Catálogo de los vocabularios clínicos cargados en el sistema.

```sql
CREATE TABLE terminologia_clinica (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sistema       VARCHAR(20) NOT NULL,  -- 'LOINC' | 'SNOMED' | 'CID-10' | 'CIAP-2'
  codigo        VARCHAR(40) NOT NULL,
  descripcion   TEXT NOT NULL,
  categoria     VARCHAR(80),
  padre         VARCHAR(40),  -- para jerarquías SNOMED
  idioma        VARCHAR(5) NOT NULL DEFAULT 'pt',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (sistema, codigo, idioma)
);

CREATE INDEX idx_terminologia_sistema_codigo ON terminologia_clinica (sistema, codigo);
CREATE INDEX idx_terminologia_categoria ON terminologia_clinica (categoria);
```

**Seed inicial**:
- LOINC: ~50 códigos de escalas PHQ-9, GAD-7, WHO-5, BDI, ítems individuales
- SNOMED: ~200 códigos de síntomas emocionales, trastornos, actividades de bienestar
- CID-10: capítulo V (trastornos mentales, F00-F99) completo
- CIAP-2: componente 2 (problemas psicológicos) completo

### 16.6 Mapeo FHIR futuro (cuándo, no cómo en MVP)

Cuando llegue el momento de integrar con RNDS u otro sistema clínico, el mapeo es:

| App BiT | FHIR R4 Resource |
|---|---|
| `checkin_emocional` | `Observation` (con `category: social-history` o `survey`) |
| `recurso_bienestar` | `ActivityDefinition` o `PlanDefinition` |
| `derivacion_cvv` | `ServiceRequest` (con `intent: order`) |
| `usuario` (perfil clínico) | `Patient` (con identifier = CPF cuando aplique) |
| `sesión chat salud` | `Encounter` (con `class: virtual`) |
| `mensaje chat salud` | `Communication` (con `sent: received` o `sent: sent`) |

**NO se implementa en MVP**, pero queda como referencia para que el equipo entienda la dirección.

### 16.7 Decisiones pendientes

1. **Licencia SNOMED CT en LATAM fuera de Brasil**: ¿se paga individual o se negocia licencia regional? — Sugerido: empezar solo con Brasil (licencia gratis), expandir después
2. **Integración con RNDS**: ¿cuándo? — Depende de si hay socio brasilero con acceso
3. **Consentimiento para uso secundario**: ¿los datos clínicos pueden usarse para investigación o ML? — Requiere consentimiento explícito, separado del consentimiento del servicio

---

*Última actualización: 2026-06-11*
