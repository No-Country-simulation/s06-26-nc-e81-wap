# Orienta360 — Frontend

## Stack
- Vite + React 19 + TypeScript
- Tailwind CSS v4 + shadcn/ui
- react-router-dom v7
- @tanstack/react-query (solo GETs)
- Zustand (estado global)
- Axios (cliente HTTP único)
- i18next + react-i18next

## Reglas de arquitectura
1. **Solo `pages/` habla con el back** — features no saben de servicios ni APIs. TanStack Query solo para GETs; POST/PUT/PATCH son llamadas directas con axios desde pages.
2. **Los componentes reciben props** — no llaman hooks, no traen data. Si necesitan datos propios, se pasan desde pages.
3. **Si un patrón de UI se repite** → componente reutilizable con props. No duplicar HTML ni estilos.
4. **Nada inline** — types/interfaces van en `types/`, schemas en `schemas/`, constantes/mapeos en `constants/`. Ningún componente declara tipos, schemas ni constantes en su propio archivo.
5. **Estructura de feature**: `components/`, `hooks/`, `types/`, `schemas/`, `constants/`. No hay services dentro de features.
6. **Mock data** en `services/api/*.api.ts`. Nunca en componentes.

## Tema (dark/light)
- `useTheme()` en `shared/hooks/useTheme` → `{ theme, toggleTheme }`
- Persiste en `localStorage('app-theme')`, default `dark`
- Clases Tailwind custom: `bg-bg`, `bg-surface`, `text-text`, `text-text-secondary`, `border-border`, `text-primary`

## Git
- Rama feature: `feat/app-bit/<dominio>` → PR a `develop`
- Commits: `tipo(alcance): mensaje` — ej: `feat(auth): add login page`
