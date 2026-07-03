# Orienta360 — Frontend

## Stack

| Herramienta | Versión |
|---|---|
| Vite | 8.x |
| React | 19.x |
| TypeScript | 6.x |
| Tailwind CSS | 4.x |
| shadcn/ui | 4.x |
| react-router-dom | 7.x |
| @tanstack/react-query | 5.x |
| Zustand | 5.x |
| Axios | 1.x |
| i18next + react-i18next | 26.x / 17.x |

## Arquitectura

```
client/src/
├── pages/               # 🎯 Solo pages conocen el back
│   ├── auth/            #   login, register, onboarding
│   ├── dashboard/       #   layout + home
│   ├── training/        #   formación
│   ├── employability/   #   empleabilidad
│   ├── experiences/     #   experiencias
│   ├── mentorship/      #   mentorías
│   └── mental-health/   #   salud mental
├── features/            # 🧩 Lógica de dominio (no sabe del back)
│   └── <domain>/
│       ├── components/
│       ├── hooks/
│       └── types/
├── shared/              # 🔧 Compartido
│   ├── ui/              #   shadcn/ui + atoms custom
│   ├── hooks/
│   ├── utils/
│   └── types/
├── services/            # 🌐 Comunicación con el back
│   ├── http-client.ts   #   Única instancia de Axios
│   ├── query-client.tsx #   Único QueryClientProvider
│   └── api/             #   Endpoints por dominio
├── i18n/                # 🌍 es (default), pt, en
├── store/               # 🗄️ Zustand
│   ├── auth.store.ts
│   └── ui.store.ts
└── config/
    └── index.ts         #   Variables de entorno, constantes
```

## Principios

- **Backend-agnostic**: `pages/` es la única capa que importa de `services/`. El resto del código (features, shared) recibe datos por props y no depende del backend.
- **Single instances**: un solo `axios.create()` en `http-client.ts` y un solo `QueryClient` en `query-client.tsx`.
- **i18n**: detección del lenguaje del navegador + selector manual. Español como default. Soporte: ES, PT, EN.
- **Global state**: Zustand para auth y UI (sidebar). No para datos de API.
- **Design system**: oscuro inspirado en wongola — fondo `#151515`, acento `#888888`, texto `#ffffff`, tipografía Lato.

## Scripts

```bash
npm run dev        # Desarrollo
npm run build      # Build producción
npm run preview    # Preview del build
npm run lint       # ESLint
```

## Ramas

```
main ──► develop ──► feat/app-bit/<domain>
```

- `main`: producción
- `develop`: integración (recibe PRs)
- `feat/app-bit/<domain>`: cada feature nace de develop y vuelve vía PR

## Convención de commits

```
<tipo>(<alcance>): <mensaje>
```

Ejemplos:
- `feat(auth): add login page`
- `fix(dashboard): resolve layout bug`
- `chore(setup): initial project scaffolding`
