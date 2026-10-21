import { describe, it, expect, beforeEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { httpClient } from './httpClient';
import { authApi } from './authApi';
import { authReducer } from '../features/auth/authSlice';

vi.mock('./httpClient', () => ({
  httpClient: vi.fn(),
}));

vi.mock('../features/auth/authStorage', () => ({
  getStoredToken: vi.fn(() => null),
  loadAuthState: vi.fn(() => ({ token: null, user: null })),
  saveAuthState: vi.fn(),
  clearAuthState: vi.fn(),
}));

const mockedHttpClient = vi.mocked(httpClient);

const user = { id: '1', username: 'jane', name: 'Jane', email: 'jane@test.com' };

function createStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
      [authApi.reducerPath]: authApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(authApi.middleware),
  });
}

describe('authApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should normalize a login response with a nested user', async () => {
    mockedHttpClient.mockResolvedValue({
      data: { token: 'abc-123', user },
    } as never);

    const store = createStore();
    const result = await store.dispatch(
      authApi.endpoints.login.initiate({ username: 'jane', password: 'secret' }),
    );

    expect(result.data).toEqual({ token: 'abc-123', user });
  });

  it('should normalize a login response with a flat user payload', async () => {
    mockedHttpClient.mockResolvedValue({
      data: { accessToken: 'xyz-789', username: 'jane', name: 'Jane', email: 'jane@test.com' },
    } as never);

    const store = createStore();
    const result = await store.dispatch(
      authApi.endpoints.login.initiate({ username: 'jane', password: 'secret' }),
    );

    expect(result.data).toEqual({
      token: 'xyz-789',
      user: { id: null, username: 'jane', name: 'Jane', email: 'jane@test.com' },
    });
  });

  it('should normalize a profile response nested under data', async () => {
    mockedHttpClient.mockResolvedValue({
      data: { data: { user } },
    } as never);

    const store = createStore();
    const result = await store.dispatch(authApi.endpoints.getProfile.initiate());

    expect(result.data).toEqual({ user });
  });

  it('should surface the error payload when the request fails', async () => {
    mockedHttpClient.mockRejectedValue({
      response: { status: 400, data: { message: 'Invalid credentials' } },
    } as never);

    const store = createStore();
    const result = await store.dispatch(
      authApi.endpoints.login.initiate({ username: 'jane', password: 'wrong' }),
    );

    expect(result.error).toEqual({ status: 400, data: { message: 'Invalid credentials' } });
  });
});
