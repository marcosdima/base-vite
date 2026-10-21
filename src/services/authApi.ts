import { createApi } from '@reduxjs/toolkit/query/react';
import type { BaseQueryApi } from '@reduxjs/toolkit/query';
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

/** Respuesta cruda del backend: la forma todavía no está garantizada. */
type UnknownPayload = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownPayload {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

/**
 * Lee un identificador o texto que el backend podría enviar como número.
 * Se convierte a `string` para respetar el contrato `string | null` sin
 * descartar el valor original.
 */
function readText(value: unknown): string | null {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  return null;
}

function readNumber(value: unknown): number | null {
  return typeof value === 'number' ? value : null;
}

function normalizeUserPayload(payload: unknown): UserPayload | null {
  if (!isRecord(payload)) {
    return null;
  }

  if (isRecord(payload.user)) {
    return payload.user as unknown as UserPayload;
  }

  if (isRecord(payload.profile)) {
    return payload.profile as unknown as UserPayload;
  }

  const data = payload.data;

  if (isRecord(data)) {
    if (isRecord(data.user)) {
      return data.user as unknown as UserPayload;
    }

    return data as unknown as UserPayload;
  }

  if (payload.username || payload.name || payload.email || payload.id || payload._id) {
    return {
      id: readText(payload.id) ?? readText(payload._id) ?? null,
      username: readText(payload.username) ?? readText(payload.userName) ?? null,
      name: readText(payload.name) ?? null,
      email: readText(payload.email) ?? null,
    };
  }

  return null;
}

function unwrapData(response: unknown): unknown {
  if (isRecord(response)) {
    return response.data ?? response;
  }

  return response;
}

function normalizeAuthResponse(response: unknown): AuthResponse {
  const payload = unwrapData(response);

  if (!isRecord(payload)) {
    return { token: null, user: null };
  }

  return {
    token:
      readText(payload.token) ?? readText(payload.accessToken) ?? readText(payload.jwt) ?? null,
    user: normalizeUserPayload(payload),
  };
}

function normalizeProfileResponse(response: unknown): ProfileResponse {
  return {
    user: normalizeUserPayload(unwrapData(response)),
  };
}

interface BaseQueryArgs {
  url: string;
  method?: string;
  data?: unknown;
  params?: unknown;
}

const axiosBaseQuery = () => async (args: BaseQueryArgs, api: BaseQueryApi) => {
  try {
    const response = await httpClient({
      url: args.url,
      method: args.method ?? 'GET',
      data: args.data,
      params: args.params,
    });

    return { data: response.data };
  } catch (error: unknown) {
    const details = isRecord(error) ? error : {};
    const responseDetails = isRecord(details.response) ? details.response : {};
    const status = readNumber(responseDetails.status) ?? 500;
    const responseData = responseDetails.data ?? { message: readString(details.message) };

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
    signIn: builder.mutation<
      AuthResponse,
      { username: string; password: string; confirmPassword: string }
    >({
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
      transformResponse: (response: unknown) => ({
        user: normalizeProfileResponse(response).user,
      }),
      providesTags: ['Auth'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
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

export const { useGetProfileQuery, useLoginMutation, useSignInMutation } = authApi;

export type { AuthResponse, ProfileResponse, UserPayload };
