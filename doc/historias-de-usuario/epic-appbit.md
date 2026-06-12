# 🏗️ Epic - App BiT (B2C)

> **Adaptación del template** `doc/planeacion de trabajo/01-epic.md` al proyecto real definido en `doc/project.md`.
> Convención de ramas: `feat/appbit/<módulo>` y `task/appbit/<módulo>/<tarea>`.

---

## 📋 Descripción

Web app responsiva (PWA) con agente de IA para apoyar a personas de grupos sub-representados en **cinco dimensiones simultáneas**: formación, empleabilidad, experiencias, mentorías y salud mental. Modelo B2C donde el usuario no paga; la monetización viene de comisión por contratación.

## 🎯 Objetivo

Ser un **ecosistema 360°** con empatía, acompañamiento y relevancia cultural — formación, empleabilidad, experiencias, mentorías y salud mental en un solo lugar.

---

## 🧩 Módulos

| # | Módulo | Carpeta | Rama | DB principal | SLO |
|---|---|---|---|---|---|
| 1 | 🔐 Autenticación y Usuarios | `01-auth/` | `feat/appbit/auth` | PostgreSQL | 99.5% |
| 2 | 👤 Perfil y Onboarding | `02-perfil/` | `feat/appbit/perfil` | PostgreSQL | 99% |
| 3 | 🧭 Orientar (endpoint principal) | `03-orientar/` | `feat/appbit/orientar` | PostgreSQL | 99% |
| 4 | 💼 Empleabilidad | `04-empleabilidad/` | `feat/appbit/empleabilidad` | **MariaDB** | 99% |
| 5 | 📚 Formaciones | `05-formaciones/` | `feat/appbit/formaciones` | **MariaDB** | 99% |
| 6 | 🎤 Experiencias Estructurantes | `06-experiencias/` | `feat/appbit/experiencias` | **MariaDB** | 99% |
| 7 | 🤝 Mentorías (core) | `07-mentorias/` | `feat/appbit/mentorias` | **MariaDB** | 99% |
| 8 | 💚 Salud Mental | `08-salud-mental/` | `feat/appbit/salud-mental` | PostgreSQL | **99.5%** |
| 9 | 📍 Geolocalización (Vísent) | `09-geolocalizacion/` | `feat/appbit/geolocalizacion` | **MariaDB** | 99% |
| 10 | 🌐 Multilenguaje PT/ES | `10-multilenguaje/` | `feat/appbit/multilenguaje` | **SQLite** | 99.5% |
| 11 | 💬 **Chat (3 features)** | `11-chat/` | `feat/appbit/chat` | **MongoDB** (x2 Atlas) | 99% / **99.5% (salud)** |

> **Módulo 11 — Chat**: 3 features independientes en MongoDB:
> - **11.A** Chat mentor↔usuario (`chat_mentoria`, Atlas cuenta #1)
> - **11.B** Chat usuario↔agente `/orientar` (`chat_agente_orientar`, Atlas cuenta #1)
> - **11.C** Chat usuario↔agente `/salud` (`chat_salud_mental`, **Atlas cuenta #2, cluster aislado por compliance**)

Cada módulo tiene su **historias de usuario** en `doc/historias-de-usuario/[modulo]/README.md` y referencia al **esquema de DB** en `doc/database/schema.md`.

---

## 🗄️ Base de datos

Diseño y DDL en `doc/database/`:
- `schema.md` — entidades relacionales, modelos MongoDB, modelos SQLite, decisiones
- `schema.sql` — DDL PostgreSQL 15+ ejecutable (15 tablas relacionales + 3 MongoDB)
- `er.mmd` — diagrama entidad-relación en formato Mermaid

**Motores usados (ver `doc/arquitectura/distribucion-db.md`)**:
- **PostgreSQL 15+** — auth, perfil, orientar, salud
- **MariaDB 11+** — empleabilidad, formaciones, experiencias, mentoria-core, geo
- **MongoDB 7+** — chat (3 features, 2 cuentas Atlas separadas)
- **SQLite 3** — i18n cache, sesiones auth, agent responses cache

15 tablas: `usuario`, `empresa`, `vacante`, `aplicacion`, `curso`, `trayectoria`, `checkin_emocional`, `recurso_bienestar`, `derivacion_cvv`, `experiencia_evento`, `testimonio`, `mentor`, `mentoria_invitacion`, `zona_visent`, `evento_visent`.

---

## 📁 Convención de entregables

| Tipo | Ubicación sugerida |
|---|---|
| Historias de usuario | `doc/historias-de-usuario/[modulo]/` |
| Diseños | `designs/[modulo]/` |
| Interfaces TypeScript | `src/core/[modulo]/interfaces/` |
| Pantallas (Next/Vue/React) | `src/app/[rol]/[ruta]/page.tsx` o equivalente |
| Endpoints | `src/api/[modulo]/` |
| Migraciones DB | `migrations/` |
| Seeds | `seeds/` |
| Mocks | `src/mocks/handlers/[modulo]/` |

---

## 🔀 Estrategia de ramas

```
dev
  └── feat/appbit
        ├── feat/appbit/auth
        ├── feat/appbit/perfil
        ├── feat/appbit/orientar
        ├── feat/appbit/empleabilidad
        ├── feat/appbit/formaciones
        ├── feat/appbit/experiencias
        ├── feat/appbit/mentorias
        ├── feat/appbit/salud-mental
        ├── feat/appbit/geolocalizacion
        └── feat/appbit/multilenguaje
```

Tasks derivadas de cada módulo:

```
task/appbit/[modulo]/[tarea-kebab-case]
```

---

## ✅ Checklist de módulos

| Módulo | Historia | Rama | Estado |
|---|---|---|---|
| 🔐 Auth | `US-01-AUTH-*` | `feat/appbit/auth` | ⏳ |
| 👤 Perfil | `US-02-PER-*` | `feat/appbit/perfil` | ⏳ |
| 🧭 Orientar | `US-03-OR-*` | `feat/appbit/orientar` | ⏳ |
| 💼 Empleabilidad | `US-04-EM-*` | `feat/appbit/empleabilidad` | ⏳ |
| 📚 Formaciones | `US-05-FO-*` | `feat/appbit/formaciones` | ⏳ |
| 🎤 Experiencias | `US-06-EX-*` | `feat/appbit/experiencias` | ⏳ |
| 🤝 Mentorías | `US-07-MT-*` | `feat/appbit/mentorias` | ⏳ |
| 💚 Salud Mental | `US-08-SM-*` | `feat/appbit/salud-mental` | ⏳ |
| 📍 Geolocalización | `US-09-GE-*` | `feat/appbit/geolocalizacion` | ⏳ |
| 🌐 Multilenguaje | `US-10-ML-*` | `feat/appbit/multilenguaje` | ⏳ |
| 💬 **Chat (3 features)** | `US-11-CHAT-A-*` / `B-*` / `C-*` | `feat/appbit/chat` | ⏳ |

---

## 🔌 Endpoints principales (MVP)

| Método | Ruta | Módulo | Historia |
|---|---|---|---|
| POST | `/auth/register` | auth | US-01-AUTH-01 |
| POST | `/auth/login` | auth | US-01-AUTH-02 |
| POST | `/auth/logout` | auth | US-01-AUTH-04 (revocación) |
| POST | `/auth/refresh` | auth | US-01-AUTH-04 |
| GET | `/usuarios/me` | perfil | US-02-PER-02 |
| PATCH | `/usuarios/me` | perfil | US-02-PER-02 |
| DELETE | `/usuarios/me` | perfil | US-02-PER-03 (saga cross-DB) |
| **POST** | **`/orientar`** | **orientar** | **US-03-OR-01** |
| GET | `/vacantes` | empleabilidad | US-04-EM-01 |
| GET | `/vacantes/:id` | empleabilidad | US-04-EM-02 |
| POST | `/aplicaciones` | empleabilidad | US-04-EM-03 |
| GET | `/cursos` | formaciones | US-05-FO-01 |
| GET | `/trayectoria` | formaciones | US-05-FO-02 |
| POST | `/checkin` | salud-mental | US-08-SM-01 |
| **POST** | **`/salud`** | **salud-mental** | **US-08-SM-02/03/04** |
| GET | `/mentores` | mentorias | US-07-MT-01 |
| GET | `/chat/mentoria/conversations/:id/messages` | chat-mentoria | US-11-CHAT-A-03 |
| POST | `/chat/mentoria/conversations/:id/messages` | chat-mentoria | US-11-CHAT-A-02 |
| POST | `/chat/orientar/sessions` | chat-agente-orientar | US-11-CHAT-B-01 |
| POST | `/chat/salud/sessions` | **chat-agente-salud (aislado)** | US-11-CHAT-C-01 |
| POST | `/chat/salud/sessions/:id/messages` | **chat-agente-salud (aislado)** | US-11-CHAT-C-02 |
| POST | `/mentoria-invitaciones` | mentorias | US-07-MT-03 |
| GET | `/experiencias` | experiencias | US-06-EX-01 |
| GET | `/zona/eventos-cercanos` | geolocalizacion | US-09-GE-01 |

---

## 👷 Asignación sugerida de responsabilidades

| Persona | Rol | Módulos principales |
|---|---|---|
| — | Backend/API | auth, perfil, orientar, salud-mental |
| — | Frontend | onboarding, orientar-screen, salud-mental-UI |
| — | Data | formaciones (seeds), empleabilidad (vacantes), experiencias |
| — | Agente IA | prompts de `/orientar` y `/salud` (con revisión ética) |
| — | DevOps | Railway/Render, CI, seeds de DB |
| — | Producto/Ética | validación de contenido sensible (salud mental) |

---

🔀 **Rama madre**: `feat/appbit`  
🎯 **Rama destino**: `dev`  
📅 **Estado**: En planificación → Historias y DB documentadas, pendiente dividir tareas en GitHub
