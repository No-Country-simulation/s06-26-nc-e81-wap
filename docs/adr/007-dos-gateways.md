# ADR-007: 2 gateways separados (api-gateway HTTP + chat-gateway WSS)

## Status

Accepted

## Context

**Problem**: La plataforma tiene 13 microservicios HTTP y 3 servicios de chat con WebSocket. Si usamos un solo gateway, los ciclos de vida diferentes (HTTP request-response vs WSS conexiones largas) y las restricciones operacionales distintas (rate limit, sticky sessions, auth en handshake) chocan en un solo componente.

**Constraints**:
- 1-2 personas en MVP
- Stack dockerizado free tier
- Railway free tier (sticky sessions no son nativas)
- 2 stacks de tecnología: HTTP (Nginx) y WSS (Node.js con sticky sessions)

**Options considered**:

1. **1 solo gateway** que maneja HTTP y WSS
   - Pros: 1 contenedor menos
   - Cons: ciclos de vida mezclados, Nginx no maneja bien WSS nativo, escalar el chat implica escalar el HTTP
2. **3 gateways** (api-gateway HTTP, chat-HTTP para REST, chat-WSS)
   - Pros: separación clara
   - Cons: división artificial (el chat-HTTP y chat-WSS son del mismo feature)
3. **2 gateways** (api-gateway HTTP, chat-gateway WSS+REST)
   - Pros: separación por ciclo de vida (HTTP vs WSS), mismo feature de chat en un gateway
   - Cons: 2 contenedores más

## Decision

Elegimos **Opción 3**: 2 gateways separados por **ciclo de vida**, no por feature.

**Razonamiento**:
- HTTP es request-response, conexiones cortas, no requiere sticky sessions
- WSS son conexiones largas, requieren sticky sessions (vía Redis dockerizado), auth en handshake
- Mezclar ambos en un gateway Nginx es hacky (Nginx maneja WSS pero no es su fuerte)
- Separar por feature (chat-HTTP vs chat-WSS) es artificial porque el mismo cliente del chat usa ambos
- Separar por ciclo de vida permite escalar el chat independientemente cuando crezca

**Arquitectura**:

```
Internet
   │
   ├──► api-gateway (Nginx, puerto 80/443) ──► 13 servicios HTTP
   │      • Ruteo por path-prefix
   │      • Rate limit
   │      • Auth header injection
   │
   └──► chat-gateway (Node.js, puerto 443/wss) ──► 3 servicios de chat
          • Sticky sessions con Redis
          • Auth JWT en handshake WebSocket
          • WSS upgrade
          • Ruteo por URL a chat-mentoria | chat-agente-orientar | chat-agente-salud
```

## Consequences

**Positive**:
- Separación clara de responsabilidades
- Escalar el chat no implica escalar el HTTP (cuando crezca)
- Reiniciar el chat-gateway no afecta al HTTP
- Sticky sessions bien implementadas (Redis compartido entre N instancias del chat-gateway)
- Cada gateway puede tener su propia política de rate limit y seguridad

**Negative**:
- 2 contenedores extra a mantener
- Si el chat-gateway se cae, TODO el chat se cae (mientras el HTTP sigue funcionando)
- Doble deploy si se actualiza el gateway (aunque con CI es trivial)
- El chat-gateway tiene más complejidad (Node.js + WSS + Redis) que un Nginx puro

**Neutral**:
- El dominio `chat.appbit.com` apunta al chat-gateway
- El dominio `appbit.com` apunta al api-gateway
- Los certificados TLS se manejan independientemente en cada gateway

## Superseded by

## Supersedes

---

**Keywords**: gateway, nginx, websocket, wss, sticky-sessions, redis, chat

**Date**: 2026-06-11

**Authors**: arquitectura App BiT
