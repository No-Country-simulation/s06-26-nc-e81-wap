# App BiT — Frontend

## Stack
- Vite + React 19 + TypeScript
- Tailwind CSS v4
- shadcn/ui (componentes)
- react-router-dom v7
- @tanstack/react-query (solo GETs)
- Zustand (estado global)
- Axios (cliente HTTP único)
- i18next + react-i18next

## Estructura
```
client/src/
├── pages/               # 🎯 Solo pages conocen el back
├── features/<dominio>/  # 🧩 Lógica de dominio (no sabe del back)
│   ├── components/
│   ├── hooks/
│   └── types/
├── shared/              # 🔧 Compartido (UI, hooks, utils)
├── services/            # 🌐 API (Axios + TanStack + endpoints)
├── i18n/                # 🌍 es/pt/en
├── store/               # 🗄️ Zustand
└── config/              # ⚙️ Constantes
```

## Ramas
- `main` — producción
- `develop` — integración (recibe PRs)
- `feat/app-bit/<dominio>` — cada feature nace de develop

## PRs
- Los PRs los crea y mergea el TL (@Felipe).
- Cada feature branch → PR a `develop`.

## Commits
Formato: `tipo(alcance): mensaje`
- `feat(auth): add login page`
- `fix(dashboard): resolve layout bug`

## Devs
- **TL**: Auth + Dashboard + shared/ui + setup
- **Dev 2**: Formación + Empleabilidad
- **Dev 3**: Experiencias + Mentorías + Salud Mental
