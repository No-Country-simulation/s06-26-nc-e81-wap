# ADR-011: Mantener server/ como monorepo único (no services/&lt;svc&gt;/)

## Status

Accepted

## Context

**Problem**: El proyecto tiene 13 microservicios. Hay una decisión estándar de la industria de separarlos en carpetas `services/<svc>/` con su propio Dockerfile, package.json y CI independiente. Pero con 1-2 personas en MVP, eso puede ser over-engineering.

**Constraints**:
- 1-2 personas en MVP
- Stack dockerizado, todos los servicios comparten `package.json` raíz
- El `server/` actual ya es un monorepo con sub-carpetas
- Convención de ramas: `task/appbit/<modulo>/<tarea>`

**Options considered**:

1. **Monorepo único** (`server/<modulo>/` con sub-carpetas, un solo Dockerfile multi-stage, un solo CI)
   - Pros: simple, 1-2 personas mantienen todo, atomic changes cross-service, menos config
   - Cons: un cambio pequeño rebuilda toda la imagen, CI no puede testear un solo servicio independientemente
2. **Multi-repo** (`services/auth/`, `services/perfil/`, etc., cada uno con su Dockerfile y CI)
   - Pros: cada servicio escala independientemente, CI paralelizable, mejor para muchos equipos
   - Cons: 13 repos a mantener, atomic changes cross-service requieren PRs coordinados, más config
3. **Monorepo con workspaces de npm** (Nx, Turborepo, Lerna)
   - Pros: monorepo + CI inteligente + cache compartido
   - Cons: agrega tooling, curva de aprendizaje, overkill para 1-2 personas

## Decision

Elegimos **Opción 1**: mantener `server/` como monorepo único con 13 sub-carpetas, un solo `Dockerfile` multi-stage, un solo `package.json` raíz.

**Razonamiento**:
- Con 1-2 personas, el costo de mantener 13 repos es prohibitivo
- Los cambios cross-service son frecuentes (saga, refactors de contratos) — monorepo permite PRs atómicos
- Un solo `Dockerfile` con `ENABLED_SERVICES` flag permite deploy selectivo
- El CI corre en el monorepo completo; para aislar tests, se pueden usar tags
- **El trade-off es explícito**: rebuild de toda la imagen cuando cambia un servicio. Es aceptable porque Railway free tier hace el deploy en segundos
- Cuando el equipo crezca a 3+ personas o haya > 20 servicios, se migra a `services/<svc>/`

**Estructura actual**:
```
server/
├── auth/
├── perfil/
├── orientar/
├── ... (13 sub-carpetas)
├── shared/            # código compartido (tipos, utils, errores)
├── Dockerfile         # multi-stage
├── docker-entrypoint.sh  # decide qué servicios levantar
└── package.json       # raíz
```

**Migración futura** (cuando se justifique):
```
services/
├── auth/              # su propio Dockerfile, package.json, CI
├── perfil/
├── ...
```

## Consequences

**Positive**:
- 1-2 personas pueden mantener todo
- Cambios cross-service se hacen en un solo PR
- Menos config: 1 Dockerfile, 1 CI, 1 repo
- Debugging cross-service más fácil (todo en el mismo árbol)
- Deploys atómicos: no hay riesgo de versiones inconsistentes entre servicios

**Negative**:
- Un cambio pequeño rebuilda toda la imagen (~30-60s extra en CI vs segundos en multi-repo)
- No se puede deployar un solo servicio de forma independiente sin redeploy todos
- Si un servicio tiene un bug crítico, hay que redeploy el monorepo completo
- El CI corre tests de todos los servicios en cada PR (más lento que tests por servicio)

**Neutral**:
- La decisión se revisa cuando el equipo pase de 3+ personas o haya > 20 servicios
- Migrar a `services/<svc>/` es directo: copiar la sub-carpeta, agregar su Dockerfile, actualizar CI
- Los tests por servicio se pueden aislar con tags (`npm test -- --testPathPattern=auth`)

## Superseded by

## Supersedes

---

**Keywords**: monorepo, docker, services, server, mvp, refactor-futuro

**Date**: 2026-06-11

**Authors**: arquitectura App BiT
