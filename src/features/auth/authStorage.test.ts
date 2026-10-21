import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  AUTH_STORAGE_KEY,
  loadAuthState,
  saveAuthState,
  clearAuthState,
  getStoredToken,
} from './authStorage';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('authStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  it('should return null token and user when storage is empty', () => {
    const result = loadAuthState();
    expect(result.token).toBeNull();
    expect(result.user).toBeNull();
  });

  it('should load persisted auth state', () => {
    const state = {
      token: 'abc-123',
      user: { id: '1', username: 'jane', name: 'Jane', email: 'jane@test.com' },
    };
    localStorageMock.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));

    const result = loadAuthState();
    expect(result.token).toBe('abc-123');
    expect(result.user).toEqual(state.user);
  });

  it('should handle corrupted storage gracefully', () => {
    localStorageMock.setItem(AUTH_STORAGE_KEY, 'not-valid-json');

    const result = loadAuthState();
    expect(result.token).toBeNull();
    expect(result.user).toBeNull();
  });

  it('should save auth state to storage', () => {
    const state = {
      token: 'abc-123',
      user: { id: '1', username: 'jane', name: 'Jane', email: 'jane@test.com' },
    };
    saveAuthState(state);

    expect(localStorageMock.setItem).toHaveBeenCalledWith(AUTH_STORAGE_KEY, JSON.stringify(state));
  });

  it('should clear auth state from storage', () => {
    localStorageMock.setItem(AUTH_STORAGE_KEY, 'some-data');
    clearAuthState();

    expect(localStorageMock.removeItem).toHaveBeenCalledWith(AUTH_STORAGE_KEY);
  });

  it('should get stored token', () => {
    localStorageMock.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 'abc-123', user: null }));
    expect(getStoredToken()).toBe('abc-123');
  });

  it('should return null token when storage is empty', () => {
    expect(getStoredToken()).toBeNull();
  });
});
