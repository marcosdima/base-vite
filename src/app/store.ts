import { configureStore } from '@reduxjs/toolkit';
import { authReducer, type AuthSliceState } from '../features/auth/authSlice';
import { osReducer, type OsState } from '../features/os/osSlice';
import { authApi } from '../services/authApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    os: osReducer,
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // `os.fs.now` es el reloj del filesystem virtual: es una función por diseño,
      // así que se excluye del aviso de serialización de Redux.
      serializableCheck: { ignoredPaths: ['os.fs.now'] },
    }).concat(authApi.middleware),
});

export type RootState = {
  auth: AuthSliceState;
  os: OsState;
  [authApi.reducerPath]: ReturnType<typeof authApi.reducer>;
};

export type AppDispatch = typeof store.dispatch;
