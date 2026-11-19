# State Management & API Layer

- **Source**: `src/app/store.ts`, `src/app/hooks.ts`, `src/services/httpClient.ts`, `src/services/baseApi.ts`

## Redux Store (`src/app/store.ts` & `src/app/hooks.ts`)

- `createAppStore(preloadedState?: Partial<RootState>)`: Factory creating a configured Redux Toolkit store with `authReducer` and `baseApi.reducer` + `baseApi.middleware`. Used both for the singleton `store` and isolated unit tests in `src/test/render.tsx`.
- `useAppDispatch()` and `useAppSelector()`: Pre-typed hooks exported from `@/app/hooks`. Always import these instead of raw `react-redux` hooks.

## HTTP Client (`src/services/httpClient.ts`)

Axios instance pre-configured with `baseURL: API_BASE_URL` and `Content-Type: application/json`. Includes a request interceptor that reads `getStoredToken()` from `@/features/auth/authStorage` and attaches `Authorization: Bearer <token>` when present.

## Shared RTK Query API (`src/services/baseApi.ts`)

Single `createApi` instance (`reducerPath: 'api'`) backed by a custom `axiosBaseQuery` wrapping `httpClient`:

- Normalizes errors into `ApiError` (`{ status: number; data: unknown }`).
- Automatically dispatches `logout()` from `@/features/auth/authSlice` whenever a request returns HTTP `401`.
- Declares `tagTypes: ['Auth']` (add new cache tags here when introducing new domain resources).

## Recipe: Adding a New API Endpoint Module

Never create a second `createApi` instance. Inject endpoints into `baseApi`:

```ts
import { baseApi } from './baseApi';

export interface ProjectItem {
  id: string;
  name: string;
}

export const projectsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProjects: builder.query<ProjectItem[], void>({
      query: () => ({ url: '/projects' }),
    }),
  }),
});

export const { useGetProjectsQuery } = projectsApi;
```
