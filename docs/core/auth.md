# Authentication System

- **Source**: `src/features/auth/authSlice.ts`, `src/features/auth/authStorage.ts`, `src/services/authApi.ts`, `src/components/auth/`
- **Tests**: `src/features/auth/authSlice.test.ts`, `src/features/auth/authStorage.test.ts`, `src/services/authApi.test.ts`

## Architecture Overview

1. **Persistence (`src/features/auth/authStorage.ts`)**:
   - Stores `{ token, user }` in `localStorage` under `AUTH_STORAGE_KEY` (`${APP_CONFIG.storagePrefix}-auth`).
   - Exports `loadAuthState()`, `saveAuthState(state)`, `clearAuthState()`, and `getStoredToken()`.
   - Safely handles SSR (`typeof window === 'undefined'`) and corrupted JSON.
2. **Redux Slice (`src/features/auth/authSlice.ts`)**:
   - Hydrates initial state from `loadAuthState()`.
   - Actions: `setCredentials({ token, user })`, `setUser(user)`, `logout()`.
   - Selectors: `selectAuthToken`, `selectAuthUser`, `selectIsAuthenticated`.
3. **RTK Query Endpoints (`src/services/authApi.ts`)**:
   - Injected into `baseApi`:
     - `useLoginMutation` (`POST /users/login`)
     - `useSignInMutation` (`POST /users/signin`)
     - `useGetProfileQuery` (`GET /users/me`, automatically syncs `setUser` on fulfillment)
   - Includes payload normalization (`normalizeAuthResponse`, `normalizeProfileResponse`) that accepts common backend response shapes (`{ token, user }`, `{ accessToken, profile }`, `{ data: { user } }`, or flat user objects).
4. **Route Guard (`src/components/auth/RequireAuth.tsx`)**:
   - Redirects unauthenticated users to `/login` with `state={{ redirectTo: location.pathname }}` so login returns them to their original destination.
5. **Form UI (`src/components/auth/AuthFormCard/`)**:
   - Shared card component supporting `mode="login"` and `mode="signin"`, built with `@/components/ui` (`Input`, `Button`), client-side password-confirmation check, and server error message extraction.
