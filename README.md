# base-vite

Starter base para arrancar proyectos rápidos con **Vite + React 19**.

## Stack

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Build tool | [Vite](https://vitejs.dev/) | ^8.3.5 |
| Framework | [React](https://react.dev/) | ^19.3.1 |
| Router | [React Router](https://reactrouter.com/) | ^7.18.4 |
| Estado global | [Redux Toolkit](https://redux-toolkit.js.org/) | ^2.13.0 |
| API / Data fetching | [RTK Query](https://redux-toolkit.js.org/rtk-query/overview) + [Axios](https://axios-http.com/) | ^1.20.0 |
| Internacionalización | [i18next](https://www.i18next.com/) | ^26.5.4 |
| Animaciones | [Motion](https://motion.dev/) | ^14.5.0 |
| Estilos | [Styled Components](https://styled-components.com/) | ^6.6.0 |
| Iconos | [React Icons](https://react-icons.github.io/react-icons/) | ^5.7.0 |

## Comandos disponibles

```bash
# Instalar dependencias
pnpm install

# Servidor de desarrollo
pnpm dev

# Build de producción
pnpm build

# Previsualizar build
pnpm preview

# Linting
pnpm lint
pnpm lint:fix

# Formateo
pnpm format

# Tests
pnpm test
pnpm test:watch
```

## Estructura del proyecto

```
src/
├── app/              # Configuración global (store de Redux, router)
├── components/       # Componentes React
│   ├── auth/         # Componentes de autenticación
│   ├── features/     # Características funcionales (inputs, encuestas, switches)
│   ├── layout/       # Layout de la aplicación (AppShell)
│   └── ui/           # Componentes UI genéricos (próximamente)
├── features/         # Slices de Redux y lógica de dominio
│   └── auth/         # Autenticación (slice, almacenamiento)
├── i18n/             # Configuración de i18next y recursos de traducción
├── pages/            # Páginas de la aplicación
├── services/         # Clientes de API y capas de servicio
├── styles/           # Temas, estilos globales y styled-components
├── test/             # Configuración de tests (setup)
└── utils/            # Utilidades y configuración de entorno
```

## Variables de entorno

Crea un archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `VITE_API_URL` | URL base de la API REST | `/api/v1` (dev) |
| `VITE_API_PROXY_TARGET` | Target del proxy de Vite para `/api` | `http://localhost:8000` |

## Calidad de código

Este proyecto utiliza:

- **TypeScript** para tipado estático (opcional, archivos `.js` funcionan igual)
- **ESLint** para linting de JS/JSX
- **Prettier** para formateo de código
- **Vitest** para pruebas unitarias
- **Husky** + **lint-staged** para hooks pre-commit
- **Commitlint** para mensajes de commit convencionales

## Licencia

MIT