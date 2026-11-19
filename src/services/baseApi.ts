import { createApi, type BaseQueryFn } from '@reduxjs/toolkit/query/react';
import { logout } from '@/features/auth/authSlice';
import { httpClient } from './httpClient';

export interface BaseQueryArgs {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  data?: unknown;
  params?: unknown;
}

export interface ApiError {
  status: number;
  data: unknown;
}

type UnknownRecord = Record<string, unknown>;

export function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const axiosBaseQuery: BaseQueryFn<BaseQueryArgs, unknown, ApiError> = async (args, api) => {
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
    const status = typeof responseDetails.status === 'number' ? responseDetails.status : 500;
    const responseData =
      responseDetails.data ??
      (typeof details.message === 'string' ? { message: details.message } : undefined);

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

/**
 * Shared RTK Query API instance.
 * Feature modules should inject endpoints here via `baseApi.injectEndpoints(...)`
 * rather than creating separate `createApi` instances.
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery,
  tagTypes: ['Auth'],
  endpoints: () => ({}),
});
