# Orienta360 — Frontend

**v1.0.0** | MIT License © 2026 @fhdzleon

Ecosistema de orientación personal con IA: formación, empleabilidad y salud mental en un solo lugar.

## Funcionalidades

### 🧭 Orientar (agente IA)
Analiza el perfil profesional contra el mercado real, muestra el gap porcentual y recomienda una trayectoria concreta para cerrarlo — con cursos, vacantes compatibles y recursos.

### ❤️ Salud (check-in emocional)
Check-in diario con un emoji. El agente IA interpreta el estado emocional y sugiere acciones humanas (podcast, caminata, lectura). En situaciones de crisis (nota < 4), deriva automáticamente al CVV.

### Resto del ecosistema
Formaciones personalizadas, match de empleabilidad con gap visible, mentorías con networking humanizado y experiencias estructurantes con testimonios reales.

## Inicio rápido

```bash
git clone <repo-url>
cd client
npm install
npm run dev
```

Abre `http://localhost:5173` — todo funciona con mocks, sin backend necesario.

## Backend-agnostic

Todo el frontend funciona con mocks en `src/services/api/*.api.ts`. Cada archivo devuelve data mockeada con los mismos tipos que esperaría un backend real.

Para conectar un backend real:

1. Crear o editar `.env`:
```
VITE_API_URL=http://localhost:8080
```
2. Reemplazar el contenido de los archivos `*.api.ts` por llamadas HTTP usando el `httpClient` compartido.
3. Los tipos están en `types/` y son compartidos entre mocks y backend real.

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Desarrollo con HMR |
| `npm run build` | Build producción en `dist/` |
| `npm run preview` | Previsualizar build local |
| `npm run lint` | ESLint |

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
│   └── api/             #   Endpoints por dominio (mocks)
├── i18n/                # 🌍 es (default), pt, en
├── store/               # 🗄️ Zustand
│   ├── auth.store.ts
│   └── ui.store.ts
└── config/
    └── index.ts         #   Variables de entorno, constantes
```

## Principios

- **Backend-agnostic**: `pages/` es la única capa que importa de `services/`. El resto recibe datos por props.
- **Single instances**: un solo `axios.create()` en `http-client.ts` y un solo `QueryClient`.
- **i18n**: detección del navegador + selector manual. ES default, soporte PT y EN.
- **Zustand**: solo auth y UI. Los datos de API no pasan por store.
- **Design system**: oscuro — fondo `#151515`, acento `#888888`, texto `#ffffff`, tipografía Lato.

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

## Licencia

MIT © 2026 @fhdzleon — ver [LICENSE](./LICENSE)
