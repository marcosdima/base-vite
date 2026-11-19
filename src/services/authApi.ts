import { setUser } from '@/features/auth/authSlice';
import { baseApi, isRecord } from './baseApi';

export interface UserPayload {
  id: string | null;
  username: string | null;
  name: string | null;
  email: string | null;
}

export interface AuthResponse {
  token: string | null;
  user: UserPayload | null;
}

export interface ProfileResponse {
  user: UserPayload | null;
}

/**
 * Reads an identifier or text field that a backend might return as a number,
 * normalizing it to `string | null` without dropping numeric IDs.
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

export const authApi = baseApi.injectEndpoints({
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
          // Query errors are handled by the UI layer.
        }
      },
    }),
  }),
});

export const { useGetProfileQuery, useLoginMutation, useSignInMutation } = authApi;
