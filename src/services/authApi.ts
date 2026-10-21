import { createApi } from '@reduxjs/toolkit/query/react';
import { logout, setUser } from '../features/auth/authSlice';
import { httpClient } from './httpClient';

interface UserPayload {
  id: string | null;
  username: string | null;
  name: string | null;
  email: string | null;
}

interface AuthResponse {
  token: string | null;
  user: UserPayload | null;
}

interface ProfileResponse {
  user: UserPayload | null;
}

function normalizeUserPayload(payload: any): UserPayload | null {
  if (!payload) {
    return null;
  }

  if (payload.user) {
    return payload.user;
  }

  if (payload.profile) {
    return payload.profile;
  }

  if (payload.data?.user) {
    return payload.data.user;
  }

  if (payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
    return payload.data;
  }

  if (payload.username || payload.name || payload.email || payload.id || payload._id) {
    return {
      id: payload.id ?? payload._id ?? null,
      username: payload.username ?? payload.userName ?? null,
      name: payload.name ?? null,
      email: payload.email ?? null,
    };
  }

  return null;
}

function normalizeAuthResponse(response: any): AuthResponse {
  const payload = response?.data ?? response;

  return {
    token: payload?.token ?? payload?.accessToken ?? payload?.jwt ?? null,
    user: normalizeUserPayload(payload),
  };
}

function normalizeProfileResponse(response: any): ProfileResponse {
  const payload = response?.data ?? response;
  return {
    user: normalizeUserPayload(payload),
  };
}

const axiosBaseQuery = () => async (
  args: { url: string; method?: string; data?: any; params?: any },
  api: any
) => {
  try {
    const response = await httpClient({
      url: args.url,
      method: args.method ?? 'GET',
      data: args.data,
      params: args.params,
    });

    return { data: response.data };
  } catch (error: any) {
    const status = error.response?.status ?? 500;
    const responseData = error.response?.data ?? { message: error.message };

    if (status === 401) {
      api.dispatch(logout());
    }

    return {
      error: {
        status,
        data: responseData,
      },
    };
  }
};

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Auth'],
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, { username: string; password: string }>({
      query: (credentials) => ({
        url: '/users/login',
        method: 'POST',
        data: credentials,
      }),
      transformResponse: normalizeAuthResponse,
      invalidatesTags: ['Auth'],
    }),
    signIn: builder.mutation<AuthResponse, { username: string; password: string; confirmPassword: string }>({
      query: (payload) => ({
        url: '/users/signin',
        method: 'POST',
        data: payload,
      }),
      transformResponse: normalizeAuthResponse,
      invalidatesTags: ['Auth'],
    }),
    getProfile: builder.query<{ user: UserPayload | null }, void>({
      query: () => ({
        url: '/users/me',
      }),
      transformResponse: (response: any) => ({
        user: normalizeProfileResponse(response).user,
      }),
      providesTags: ['Auth'],
      async onQueryStarted(_arg: unknown, { dispatch, queryFulfilled }: any) {
        try {
          const { data } = await queryFulfilled;

          if (data?.user) {
            dispatch(setUser(data.user));
          }
        } catch {
          // Empty because the UI already handles query errors.
        }
      },
    }),
  }),
});

export const {
  useGetProfileQuery,
  useLoginMutation,
  useSignInMutation,
} = authApi;

export type { AuthResponse, ProfileResponse, UserPayload };