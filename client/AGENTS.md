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

## Sistema de temas (dark/light)

El layout tiene un sistema de temas funcional con persistencia en `localStorage`.

### Uso en componentes

```tsx
import { useTheme } from '@/shared/hooks/useTheme'

function MiComponente() {
  const { theme, toggleTheme, setTheme } = useTheme()
  // theme: 'dark' | 'light'
  return <button onClick={toggleTheme}>Toggle</button>
}
```

### Cómo funciona
- `ThemeProvider` en `main.tsx` envuelve toda la app
- Togglea el atributo `data-theme="dark"|"light"` en `<html>`
- `index.css` tiene variables CSS separadas para cada tema en `[data-theme="light"]`
- Tema default: `dark`. Persiste en `localStorage('app-theme')`

### Variables CSS disponibles
Usar las clases de Tailwind definidas en `@theme`:
- `bg-bg` / `bg-bg-secondary` / `bg-surface` — fondos
- `text-text` / `text-text-secondary` — colores de texto
- `border-border` — bordes
- `bg-primary` / `text-primary` — color primario

Los componentes shadcn usan variables estándar (`bg-background`, `bg-popover`, etc.) y funcionan en ambos temas automáticamente.

## Layout (Sidebar + Navbar)

El layout principal está en `pages/dashboard/`:

```
pages/dashboard/
├── DashboardLayout.tsx    # Punto de entrada: sidebar + navbar + outlet
├── Sidebar.tsx            # Sidebar colapsable con navegación + avatar
├── Navbar.tsx             # Header con buscador, idioma, tema, avatar
└── nav-items.ts           # Definición compartida de rutas
```

- **Sidebar colapsable**: botón toggle en la parte inferior (`w-64` ↔ `w-16`)
- **Navbar**: buscador (responsive), switch de idioma, toggle de tema, avatar con dropdown
- Los nav items se definen **una sola vez** en `nav-items.ts` y se reusan en Sidebar y Navbar

### Para agregar una nueva ruta al sidebar
Editar `nav-items.ts`:
```ts
{ to: '/dashboard/nueva-ruta', icon: MiIcon, label: 'nav.nueva-ruta' },
```
Luego agregar la ruta en `App.tsx` y la key de traducción en los `common.json`.

## Ramas
- `main` — producción
- `develop` — integración (recibe PRs)
- `feat/app-bit/<dominio>` — cada feature nace de develop

## PRs
- Cada feature branch → PR a `develop`.

## Commits
Formato: `tipo(alcance): mensaje`
- `feat(auth): add login page`
- `fix(dashboard): resolve layout bug`

## Devs
- **Dev 1**: Auth + Dashboard + onboarding + shared/ui + setup
- **Dev 2**: Formación + Empleabilidad
- **Dev 3**: Experiencias + Mentorías + Salud Mental
