import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authReducer, setCredentials, logout, setUser, type AuthSliceState } from './authSlice';
import { clearAuthState, loadAuthState, saveAuthState } from './authStorage';

vi.mock('./authStorage', () => ({
  loadAuthState: vi.fn(() => ({ token: null, user: null })),
  saveAuthState: vi.fn(),
  clearAuthState: vi.fn(),
}));
const mockedLoadAuthState = vi.mocked(loadAuthState);
const mockedSaveAuthState = vi.mocked(saveAuthState);
const mockedClearAuthState = vi.mocked(clearAuthState);

const initialState: AuthSliceState = {
  token: null,
  user: null,
  isAuthenticated: false,
};

describe('authSlice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedLoadAuthState.mockReturnValue({ token: null, user: null });
  });

  it('should return initial state', () => {
    const state = authReducer(undefined, { type: '@@INIT' });
    expect(state).toEqual(initialState);
  });

  it('should set credentials and persist to storage', () => {
    mockedLoadAuthState.mockReturnValue({ token: null, user: null });

    const state = authReducer(
      initialState,
      setCredentials({
        token: 'abc-123',
        user: { id: '1', username: 'jane', name: 'Jane', email: 'jane@test.com' },
      }),
    );

    expect(state.token).toBe('abc-123');
    expect(state.user).toEqual({ id: '1', username: 'jane', name: 'Jane', email: 'jane@test.com' });
    expect(state.isAuthenticated).toBe(true);
    expect(mockedSaveAuthState).toHaveBeenCalledWith({
      token: 'abc-123',
      user: { id: '1', username: 'jane', name: 'Jane', email: 'jane@test.com' },
    });
  });

  it('should clear credentials on logout', () => {
    const authenticatedState: AuthSliceState = {
      token: 'abc-123',
      user: { id: '1', username: 'jane', name: 'Jane', email: 'jane@test.com' },
      isAuthenticated: true,
    };

    const state = authReducer(authenticatedState, logout());

    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(mockedClearAuthState).toHaveBeenCalled();
  });

  it('should update user via setUser', () => {
    const stateWithToken: AuthSliceState = {
      token: 'abc-123',
      user: { id: '1', username: 'jane', name: 'Jane', email: 'jane@test.com' },
      isAuthenticated: true,
    };

    const state = authReducer(
      stateWithToken,
      setUser({
        id: '1',
        username: 'jane_updated',
        name: 'Jane Updated',
        email: 'jane@test.com',
      }),
    );

    expect(state.user?.username).toBe('jane_updated');
    expect(mockedSaveAuthState).toHaveBeenCalledWith({
      token: 'abc-123',
      user: { id: '1', username: 'jane_updated', name: 'Jane Updated', email: 'jane@test.com' },
    });
  });

  it('should not persist when token is null on setCredentials', () => {
    const state = authReducer(
      initialState,
      setCredentials({
        token: null,
        user: null,
      }),
    );

    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(mockedClearAuthState).toHaveBeenCalled();
  });
});
