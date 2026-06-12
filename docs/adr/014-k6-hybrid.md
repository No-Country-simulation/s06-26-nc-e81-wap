# ADR-014: k6 shallow en cada PR + k6 deep mensual o pre-release

## Status

Accepted

## Context

**Problem**: Necesitamos validar performance de la plataforma. Sin load testing, las regresiones de performance pasan desapercibidas hasta producción, donde el costo de arreglarlas es alto. Pero el load testing exhaustivo en cada PR consume demasiado tiempo de CI.

**Constraints**:
- Free tier de GitHub Actions (2.000 min/mes en repos privados)
- 1-2 personas, no hay tiempo para hacer load testing manual cada vez
- Stack dockerizado en Railway free tier (rendimiento realista, no optimizado)
- Productos sensibles (chat de salud) requieren latencia predecible

**Options considered**:

1. **No hacer load testing formal** (reaccionar a problemas en producción)
   - Pros: $0, no consume tiempo
   - Cons: regresiones pasan desapercibidas, SLOs no se validan
2. **k6 deep en cada PR** (10 min, 500+ usuarios)
   - Pros: detecta cualquier regresión de performance
   - Cons: consume ~500 min/mes del free tier de GitHub Actions, CI muy lento
3. **k6 deep mensual** (1 vez al mes, exhaustivo)
   - Pros: balance entre costo y cobertura
   - Cons: regresiones intermedias pasan desapercibidas
4. **k6 shallow en cada PR + k6 deep mensual** (híbrido)
   - Pros: detecta regresiones obvias rápido (shallow en CI), valida capacidad real periódicamente (deep)
   - Cons: complejidad de mantener 2 suites de k6

## Decision

Elegimos **Opción 4**: estrategia híbrida — k6 shallow en cada PR + k6 deep mensual o pre-release.

**Razonamiento**:
- El k6 shallow (60s, 10-50 VUs) en cada PR consume ~150 min/mes del free tier (margen OK)
- El k6 deep (10 min, 500-1000 VUs) mensual o pre-release consume minutos del workflow_dispatch manual
- El shallow detecta regresiones obvias en el path crítico (login, /orientar, /salud)
- El deep valida capacidad real, problemas de concurrencia, memory leaks
- El equipo puede correr el deep en cualquier momento vía GitHub UI antes de un release

**Path crítico cubierto por k6 shallow** (sprint 0):
- POST /auth/login
- POST /auth/register
- GET /usuarios/me
- POST /orientar
- POST /salud
- GET /cursos (catalogo)

**k6 deep cubre** (mensual):
- Todos los endpoints del shallow
- Múltiples conversaciones de chat concurrentes
- Escenarios mixtos (registro + orientación + postulación en la misma sesión)
- 500-1000 VUs durante 10 minutos
- Thresholds estrictos: p95 < 500ms para login, p95 < 5s para /orientar

**Thresholds del shallow**:
- `http_req_duration`: p(95) < 500ms (objetivo MVP)
- `http_req_failed`: rate < 0.01 (< 1% errores)
- Falla el CI si se rompen los thresholds

## Consequences

**Positive**:
- Detección temprana de regresiones de performance (shallow en cada PR)
- Validación de capacidad real periódicamente (deep)
- Consume ~150 min/mes del free tier (margen OK, deja 1.850 min para CI normal)
- El deep se puede correr manualmente antes de releases importantes
- Thresholds automatizados detectan problemas objetivos, no subjetivos

**Negative**:
- Dos suites de k6 que mantener (shallow.js + deep.js)
- El shallow no detecta memory leaks ni problemas de concurrencia complejos
- El deep mensual puede no ejecutarse si el equipo se olvida (disciplina)
- El threshold de 500ms puede ser estricto para el stack dockerizado en Railway free tier (se ajusta si es necesario)

**Neutral**:
- El k6 cloud (SaaS) no se usa — todo es self-hosted via `grafana/k6-action`
- Los resultados del deep se archivan como artifact (no se comparan automáticamente con ejecuciones previas)
- Cuando se migre a infraestructura paga, los thresholds se ajustan (objetivo más estricto)

## Superseded by

## Supersedes

---

**Keywords**: k6, load-testing, ci, github-actions, performance, shallow, deep

**Date**: 2026-06-11

**Authors**: arquitectura App BiT
