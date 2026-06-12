# ADR-015: No Kubernetes en MVP (Railway free tier)

## Status

Accepted

## Context

**Problem**: La plataforma tiene 13 microservicios + 4 motores de DB. K8s es el estándar de facto para aplicaciones de esta escala, pero tiene costos operacionales altos (especialmente con 1-2 personas). Necesitamos decidir si adoptamos K8s desde el inicio o si usamos Railway con dockerizado.

**Constraints**:
- 1-2 personas mantienen todo
- Free tier obligatorio
- MVP de hackathon
- 13 servicios + 4 DBs + Redis + GlitchTip + monitoring stack
- Mercado: Brasil + LATAM (picos impredecibles)

**Options considered**:

1. **Kubernetes desde día 1** (EKS, GKE, AKS, o self-hosted)
   - Pros: estándar de la industria, portable, maduro, escala horizontal nativa
   - Cons: operacionalmente pesado (1-2 personas no pueden), costo de cluster, complejidad de networking
2. **Kubernetes con servicio gestionado** (EKS + Fargate, GKE Autopilot)
   - Pros: menos operacional que self-hosted
   - Cons: $$, todavía requiere conocimiento de K8s, lock-in con el provider
3. **Railway + dockerizado, sin K8s**
   - Pros: simple, $0, deploy con git push, focus en producto
   - Cons: vendor lock-in con Railway, menos portable
4. **Fly.io** (alternativa Railway con multi-región)
   - Pros: multi-región nativo (importante para LATAM + Angola), pricing predecible
   - Cons: menos maduro, comunidad más chica

## Decision

Elegimos **Opción 3**: **NO Kubernetes en MVP**, usar Railway con dockerizado.

**Razonamiento**:
- 1-2 personas NO pueden mantener K8s en producción (clusters, upgrades, networking, RBAC, monitoring)
- Railway maneja el ciclo de vida completo (deploy, SSL, DNS, monitoring básico) sin que el equipo lo opere
- Free tier de Railway es suficiente para MVP
- Dockerizar todo da portabilidad: si migramos a Render, Fly.io, DigitalOcean, es `docker compose up`
- El locking con Railway es real pero aceptable: si se necesita migrar, los Dockerfiles y la config son portables

**Cuándo migrar a K8s (criterios)**:
- Equipo pasa de 3+ personas
- > 20 servicios
- Necesidad de multi-cloud o multi-región que Railway no soporte
- Clientes enterprise que exijan K8s por compliance

**Trade-offs aceptados**:
- Sin auto-scaling fino (Railway hace HPA básico)
- Sin service mesh (Istio, Linkerd)
- Sin operators de DB (PostgreSQL Operator, MongoDB Operator)
- Sin GitOps nativo (ArgoCD, Flux)
- Sin canary deployments nativos (se hacen manual)

**Alternativa si Railway limita**: migrar a **Fly.io** (multi-región nativo, importante para LATAM + Angola). Los Dockerfiles son los mismos, solo cambia la config de deploy.

## Consequences

**Positive**:
- 1-2 personas pueden mantener todo
- $0 de costo de infraestructura
- Focus en producto, no en operaciones
- Deploy rápido (git push → producción en minutos)
- La portabilidad Docker nos da seguro contra lock-in

**Negative**:
- Vendor lock-in con Railway (mitigado por Docker)
- Sin features avanzadas de K8s (auto-scaling fino, canary, service mesh)
- Si Railway se cae, todo se cae (sin redundancia multi-cloud)
- No podemos atender clientes enterprise que exijan K8s por compliance
- Migrar a K8s en el futuro será costoso (re-escribir config, aprender tooling)

**Neutral**:
- La decisión se revisa en 12 meses según tracción
- Si Railway se vuelve limitante, se migra a Fly.io (mismo Docker, mismo workflow)
- El `Dockerfile` de cada servicio está pensado para ser portable (multi-stage, distroless, no assumptions sobre el runtime)

## Superseded by

## Supersedes

---

**Keywords**: kubernetes, k8s, railway, docker, mvp, hackathon, deployment

**Date**: 2026-06-11

**Authors**: arquitectura App BiT
