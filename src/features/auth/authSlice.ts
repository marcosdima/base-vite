import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { clearAuthState, loadAuthState, saveAuthState, type AuthState } from './authStorage';

const persistedAuth = loadAuthState();

interface AuthSliceState extends AuthState {
  isAuthenticated: boolean;
}

const initialState: AuthSliceState = {
  token: persistedAuth.token,
  user: persistedAuth.user,
  isAuthenticated: Boolean(persistedAuth.token),
};

interface SetCredentialsPayload {
  token?: string | null;
  user: {
    id: string | null;
    username: string | null;
    name: string | null;
    email: string | null;
  } | null;
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<SetCredentialsPayload>) => {
      const nextToken = action.payload?.token ?? null;
      const nextUser = action.payload?.user ?? null;

      state.token = nextToken;
      state.user = nextUser;
      state.isAuthenticated = Boolean(nextToken);

      if (nextToken) {
        saveAuthState({ token: nextToken, user: nextUser });
        return;
      }

      clearAuthState();
    },
    setUser: (
      state,
      action: PayloadAction<{
        id: string | null;
        username: string | null;
        name: string | null;
        email: string | null;
      } | null>,
    ) => {
      state.user = action.payload;

      if (state.token) {
        saveAuthState({ token: state.token, user: action.payload });
      }
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      clearAuthState();
    },
  },
});

export const { logout, setCredentials, setUser } = authSlice.actions;
export const authReducer = authSlice.reducer;

export const selectAuthToken = (state: { auth: AuthSliceState }) => state.auth.token;
export const selectAuthUser = (state: { auth: AuthSliceState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthSliceState }) =>
  state.auth.isAuthenticated;

export type { AuthSliceState };
