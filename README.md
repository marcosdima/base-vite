# base-vite

Starter base para arrancar proyectos rápidos con **Vite + React 19**.

## Stack

| Capa                 | Tecnología                                                                                      | Versión |
| -------------------- | ----------------------------------------------------------------------------------------------- | ------- |
| Build tool           | [Vite](https://vitejs.dev/)                                                                     | ^8.3.4  |
| Framework            | [React](https://react.dev/)                                                                     | ^19.3.1 |
| Router               | [React Router](https://reactrouter.com/)                                                        | ^7.18.4 |
| Estado global        | [Redux Toolkit](https://redux-toolkit.js.org/)                                                  | ^2.13.0 |
| API / Data fetching  | [RTK Query](https://redux-toolkit.js.org/rtk-query/overview) + [Axios](https://axios-http.com/) | ^1.20.0 |
| Internacionalización | [i18next](https://www.i18next.com/)                                                             | ^26.5.3 |
| Animaciones          | [Motion](https://motion.dev/)                                                                   | ^14.4.0 |
| Estilos              | [Styled Components](https://styled-components.com/)                                             | ^6.6.0  |
| Iconos               | [React Icons](https://react-icons.github.io/react-icons/)                                       | ^5.7.0  |

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
pnpm format:check

# Tipos
pnpm typecheck

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
│   └── ui/           # Componentes UI genéricos (Terminal CLI, etc.)
├── features/         # Slices de Redux y lógica de dominio
│   ├── auth/         # Autenticación (slice, almacenamiento)
│   ├── os/           # Sistema de archivos POSIX virtual
│   └── simulations/  # Simuladores de SO (Inodos y Ciclo de vida de procesos)
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

| Variable                | Descripción                          | Valor por defecto       |
| ----------------------- | ------------------------------------ | ----------------------- |
| `VITE_API_URL`          | URL base de la API REST              | `/api/v1` (dev)         |
| `VITE_API_PROXY_TARGET` | Target del proxy de Vite para `/api` | `http://localhost:8000` |

## Calidad de código

Este proyecto utiliza:

- **TypeScript** para tipado estático (el proyecto es 100 % TypeScript)
- **ESLint** (flat config) para linting de JS/JSX y TS/TSX
- **Prettier** para formateo de código
- **Vitest** + **Testing Library** para pruebas unitarias
- **Husky** + **lint-staged** para hooks pre-commit
- **Commitlint** para mensajes de commit convencionales

El lint usa dos perfiles: uno para `js/jsx` y otro para `ts/tsx` (con `typescript-eslint`), donde las reglas que TypeScript ya cubre (`no-undef`, `no-unused-vars`, `react/prop-types`) se desactivan para evitar falsos positivos.

### Política de dependencias (pnpm 12)

pnpm 12 aplica por defecto `minimumReleaseAge: 1440` (24 h), que bloquea en el `install` cualquier versión publicada hace menos de un día. Por eso el `pnpm-lock.yaml` fija versiones con al menos 24 h de antigüedad (`vite@8.3.4`, `motion@14.4.0`, `i18next@26.5.3`).

Si al actualizar una dependencia el `install` falla con `ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION`, la solución correcta es esperar a que la versión cumpla la ventana de 24 h, no desactivar la política.

`pnpm-workspace.yaml` solo se usa para `peerDependencyRules.allowedVersions`, que silencia el aviso de `eslint-plugin-react` y `eslint-plugin-jsx-a11y` por no declarar todavía soporte para ESLint 10 (verificado: las reglas de ambos plugins se ejecutan correctamente).

## Licencia

MIT
