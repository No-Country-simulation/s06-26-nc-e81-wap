# Historias de Usuario — App BiT

Documentación viva de las historias de usuario del proyecto. Cada módulo vive en su propia carpeta, siguiendo la convención `01-modulo` para mantener el orden de la épica.

> Las plantillas de `doc/planeacion de trabajo/` (`01-epic.md`, `02-module.md`, `03-task.md`, etc.) se usan para crear los **issues** y **PRs** en GitHub, no como contenedor de historias. Acá documentamos el **qué**; en GitHub vamos al **cómo**.

---

## Estructura

| Carpeta | Módulo | Rama | Prioridad MVP | SLO |
|---|---|---|---|---|
| `01-auth/` | Autenticación y usuarios | `feat/appbit/auth` | Crítico | 99.5% |
| `02-perfil/` | Onboarding y edición de perfil | `feat/appbit/perfil` | Crítico | 99% |
| `03-orientar/` | Endpoint `/orientar` + pantalla de orientación | `feat/appbit/orientar` | Crítico | 99% |
| `04-empleabilidad/` | Vacantes, match, postulación (MariaDB) | `feat/appbit/empleabilidad` | Crítico | 99% |
| `05-formaciones/` | Cursos y trayectorias (MariaDB) | `feat/appbit/formaciones` | Crítico | 99% |
| `06-experiencias/` | Eventos y testimonios (MariaDB) | `feat/appbit/experiencias` | Importante | 99% |
| `07-mentorias/` | Mentores e invitaciones (MariaDB) | `feat/appbit/mentorias` | Importante | 99% |
| `08-salud-mental/` | Check-in, agente empático, CVV (PostgreSQL) | `feat/appbit/salud-mental` | Crítico (sensible) | **99.5%** |
| `09-geolocalizacion/` | Vísent CDRView + offline (MariaDB) | `feat/appbit/geolocalizacion` | Opcional | 99% |
| `10-multilenguaje/` | i18n PT/ES (SQLite) | `feat/appbit/multilenguaje` | Opcional | 99.5% |
| **`11-chat/`** | **3 features de mensajería (MongoDB)** | `feat/appbit/chat` | **Crítico** | 99% / **99.5% (salud)** |

> **Nota sobre nomenclatura**: el template `doc/planeacion de trabajo/` referencia `startup-crm`. Lo adaptamos a `appbit` porque es el nombre real del proyecto (definido en `doc/project.md`). Si el equipo decide otro nombre, se actualiza masivamente con `git mv` y edición de ramas.

> **Nota sobre ramas**: aunque la convención sea `feat/appbit/<modulo>`, el `server/` es un **monorepo único** (decisión de despliegue). Cada módulo tiene su sub-carpeta `server/<modulo>/` y su propio `ENABLED_SERVICES` flag. Las ramas se mergean a `feat/appbit` que va a `dev`.

---

## Convención de IDs de historia

```
US-[MM]-[XX]-[NN]
 │   │    │    └─ número secuencial dentro del módulo
 │   │    └────── código de 2 letras del módulo
 │   └─────────── número del módulo (01-11)
 └─────────────── prefijo "User Story"
```

Ejemplos:
- `US-01-AUTH-01` — Registro de cuenta
- `US-08-SM-04` — Derivación CVV (sensible)
- `US-11-CHAT-C-02` — Chat salud con safety layer (crítico)

---

## Convención de nombres de tareas (ramas)

```
task/appbit/[modulo]/[tarea-corta-kebab-case]
```

Ejemplos:
- `task/appbit/auth/register-endpoint`
- `task/appbit/orientar/gap-calculator`
- `task/appbit/salud/cvv-derivacion-logic`
- `task/appbit/chat/salud/document-encryption`

---

## MVP — funcionalidades exigidas vs opcionales

### Exigidas (del PDF)
1. Onboarding completo — **US-02-PER-01**
2. Endpoint `/orientar` con gap + trayectoria — **US-03-OR-01**
3. Endpoint `/salud` con check-in + acción — **US-08-SM-01, US-08-SM-02**
4. Interfaz responsiva (home + 1 pantalla funcional) — pantallas base
5. README con instrucciones — fuera de este directorio

### Opcionales (mejora calidad)
1. Ambos endpoints en producción integrados — depende del deploy
2. Integración Vísent — **US-09-GE-01, US-09-GE-02**
3. Sección Experiencias — **US-06-EX-01, US-06-EX-02**
4. Módulo de mentorías — **US-07-MT-01, US-07-MT-02** + chat 11.A
5. Descarga offline — **US-09-GE-02** + US PWA
6. Notificaciones push diarias — **US-11-CHAT-A-02**
7. Multilengüe PT + ES — **módulo 10**
8. Derivación automática CVV — **US-08-SM-04** + **US-11-CHAT-C-02**

---

## Alineación con arquitectura (auditado 2026-06-11)

Las historias están alineadas con las **16 decisiones de arquitectura cerradas** y referencian explícitamente a:

- `topologia-servicios.md` (servicios, endpoints, eventos, saga)
- `seguridad-compliance.md` (auth, cifrado, LGPD, retención, salud)
- `distribucion-db.md` (qué motor usa cada módulo)
- `despliegue.md` (SLOs, deploy, k6, GlitchTip)

Las tareas técnicas derivadas siguen la convención de **ramas + monorepo** y mencionan cuando aplica: dockerfile, k6 test, GlitchTip instrumentation, outbox pattern, MongoDB cluster (general vs salud aislado).

---

## Cómo crear un issue desde una historia

1. Abrir el README del módulo correspondiente.
2. Elegir la US por número.
3. Crear un **Epic** con `01-epic.md` de `doc/planeacion de trabajo/` (adaptado a `appbit`).
4. Crear un **Módulo** con `02-module.md` (rama `feat/appbit/<modulo>`).
5. Por cada US, crear **N Tasks** con `03-task.md` (una por entregable de los criterios de aceptación).
6. PRs según `04-pr-task.md`, `05-pr-module.md`, `06-pr-final.md`.

---

## Responsables globales sugeridos

| Rol | Responsabilidad |
|---|---|
| Backend/API | Endpoints, modelos, agente IA no sensible |
| Frontend | Pantallas, componentes, responsive |
| Agente IA | Prompts de `/orientar` y `/salud` |
| Data | Seeds de cursos, vacantes, eventos, Vísent, terminología clínica |
| Ética/Producto | Validar prompts sensibles, contenido, CVV |
| Seguridad | Auth, cifrado, RGPD/LGPD, compliance |
| DevOps | Deploy Railway dockerizado, CI, k6, GlitchTip, backups |
| DPO | Data Protection Officer, retenciones, anonimización |
