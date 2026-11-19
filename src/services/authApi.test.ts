import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createAppStore } from '@/app/store';
import { authApi } from './authApi';
import { httpClient } from './httpClient';

vi.mock('./httpClient', () => ({
  httpClient: vi.fn(),
}));

vi.mock('@/features/auth/authStorage', () => ({
  getStoredToken: vi.fn(() => null),
  loadAuthState: vi.fn(() => ({ token: null, user: null })),
  saveAuthState: vi.fn(),
  clearAuthState: vi.fn(),
}));

const mockedHttpClient = vi.mocked(httpClient);

const user = { id: '1', username: 'jane', name: 'Jane', email: 'jane@test.com' };

describe('authApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should normalize a login response with a nested user', async () => {
    mockedHttpClient.mockResolvedValue({
      data: { token: 'abc-123', user },
    } as never);

    const store = createAppStore();
    const result = await store.dispatch(
      authApi.endpoints.login.initiate({ username: 'jane', password: 'secret' }),
    );

    expect(result.data).toEqual({ token: 'abc-123', user });
  });

  it('should normalize a login response with a flat user payload', async () => {
    mockedHttpClient.mockResolvedValue({
      data: { accessToken: 'xyz-789', username: 'jane', name: 'Jane', email: 'jane@test.com' },
    } as never);

    const store = createAppStore();
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

    const store = createAppStore();
    const result = await store.dispatch(authApi.endpoints.getProfile.initiate());

    expect(result.data).toEqual({ user });
  });

  it('should surface the error payload when the request fails', async () => {
    mockedHttpClient.mockRejectedValue({
      response: { status: 400, data: { message: 'Invalid credentials' } },
    } as never);

    const store = createAppStore();
    const result = await store.dispatch(
      authApi.endpoints.login.initiate({ username: 'jane', password: 'wrong' }),
    );

    expect(result.error).toEqual({ status: 400, data: { message: 'Invalid credentials' } });
  });

  it('should clear auth session when receiving a 401 response', async () => {
    mockedHttpClient.mockRejectedValue({
      response: { status: 401, data: { message: 'Unauthorized' } },
    } as never);

    const store = createAppStore({
      auth: { token: 'expired-token', user, isAuthenticated: true },
    });

    await store.dispatch(authApi.endpoints.getProfile.initiate());

    expect(store.getState().auth.isAuthenticated).toBe(false);
    expect(store.getState().auth.token).toBeNull();
  });
});
