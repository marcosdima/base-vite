export const AUTH_STORAGE_KEY = 'starter-forge-auth';

export interface AuthState {
  token: string | null;
  user: {
    id: string | null;
    username: string | null;
    name: string | null;
    email: string | null;
  } | null;
}

function getStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage;
}

export function loadAuthState(): AuthState {
  const storage = getStorage();

  if (!storage) {
    return { token: null, user: null };
  }

  try {
    const rawState = storage.getItem(AUTH_STORAGE_KEY);

    if (!rawState) {
      return { token: null, user: null };
    }

    const parsedState = JSON.parse(rawState);

    return {
      token: parsedState?.token ?? null,
      user: parsedState?.user ?? null,
    };
  } catch {
    return { token: null, user: null };
  }
}

export function saveAuthState(authState: AuthState): void {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
}

export function clearAuthState(): void {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  storage.removeItem(AUTH_STORAGE_KEY);
}

export function getStoredToken(): string | null {
  return loadAuthState().token;
}
