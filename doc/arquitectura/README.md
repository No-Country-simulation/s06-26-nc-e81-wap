# Arquitectura — App BiT

Documentos de diseño técnico de alto nivel. No son código, son las decisiones que guían al equipo.

---

## Restricciones globales (decisión de equipo, 2026-06-11)

- **Todo dockerizado**: cada servicio, DB y herramienta de infra corre como contenedor
- **Todo free tier**: Railway $5/mes, MongoDB Atlas M0 free (x2), GitHub Actions free, Backblaze B2 free, Cloudflare free, CloudAMQP free, GlitchTip self-hosted
- **Sin Kubernetes en MVP**
- **Sin servicios gestionados de pago**
- **Backups automatizados con script bash dockerizado**, no dependemos de backups gestionados
- **NO se implementa interoperabilidad FHIR real en MVP**, pero el schema queda "FHIR-friendly" para Brasil/LATAM

---

## Índice

| Documento | Propósito |
|---|---|
| `distribucion-db.md` | Qué motor de DB usa cada módulo, por qué, y trade-offs (PostgreSQL + MariaDB + MongoDB + SQLite) |
| `topologia-servicios.md` | 13 servicios + 2 gateways, endpoints, eventos, **saga con reintentos activos + outbox + DLQ + rollback** |
| `seguridad-compliance.md` | Auth, autorización, cifrado, retención, LGPD/GDPR, **interoperabilidad clínica regional Brasil+LATAM** |
| `despliegue.md` | Railway + Docker, backups vía script, **GlitchTip + Redis docker + k6 hybrid**, 2 Atlas M0 free, SLOs revisados |

---

## Decisiones cerradas (no se reabren en MVP)

| # | Decisión | Doc de referencia |
|---|---|---|
| 1 | JWT RS256 con blacklist Redis+SQLite | seguridad §3 |
| 2 | Cifrado a nivel de documento para mensajes de salud | seguridad §5 |
| 3 | Doble cifrado (disco + aplicación) para datos de salud | seguridad §5 |
| 4 | MFA obligatorio para `admin_clinico` y `admin_eventos` | seguridad §3 |
| 5 | Retención indefinida de mensajes de salud con anonimización a 24 meses | seguridad §7 |
| 6 | Saga con reintentos activos (5 intentos) + outbox + DLQ + rollback explícito | topología §7.3 |
| 7 | 2 gateways separados (api-gateway HTTP + chat-gateway WSS) | topología §2 |
| 8 | ISO 27001 año 1 + SOC 2 año 2 como objetivo | seguridad §13 |
| 9 | MariaDB + PostgreSQL como contenedores dockerizados en Railway, backups vía script | despliegue §6.4, §9 |
| 10 | Mantener `server/` como monorepo único (refactor cuando crezca) | despliegue §3 |
| 11 | Redis dockerizado en Railway para sticky sessions | despliegue §6.3 |
| 12 | GlitchTip dockerizado (error tracking) | despliegue §10.1 |
| 13 | k6 shallow en cada PR + k6 deep mensual o pre-release | despliegue §10.5 |
| 14 | No Kubernetes en MVP | despliegue §1 |
| 15 | MongoDB Atlas M0 free, **2 cuentas separadas** (chat_general + chat_salud) | despliegue §6.5 |
| 16 | SLOs 99.5% para auth y salud, 99% para el resto | despliegue §10.4 |

---

## Roadmap de docs a crear

_(vacío por ahora — los 4 docs base + decisiones están completos)_

Posibles futuros:
- `decisiones-arquitectonicas.md` — log de ADRs para registrar nuevas decisiones
- `cost-optimization.md` — análisis de costos y cuándo conviene pagar
- `capacity-planning.md` — proyecciones de crecimiento
