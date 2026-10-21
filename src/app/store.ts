import { configureStore } from '@reduxjs/toolkit';
import { authReducer, type AuthSliceState } from '../features/auth/authSlice';
import { authApi } from '../services/authApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware),
});

export type RootState = {
  auth: AuthSliceState;
  [authApi.reducerPath]: ReturnType<typeof authApi.reducer>;
};

export type AppDispatch = typeof store.dispatch;