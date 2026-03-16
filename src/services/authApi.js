import { createApi } from '@reduxjs/toolkit/query/react'
import { logout, setUser } from '../features/auth/authSlice'
import { httpClient } from './httpClient'


function normalizeUserPayload(payload) {
  if (!payload) {
    return null
  }

  if (payload.user) {
    return payload.user
  }

  if (payload.profile) {
    return payload.profile
  }

  if (payload.data?.user) {
    return payload.data.user
  }

  if (payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
    return payload.data
  }

  if (payload.username || payload.name || payload.email || payload.id || payload._id) {
    return {
      id: payload.id ?? payload._id ?? null,
      username: payload.username ?? payload.userName ?? null,
      name: payload.name ?? null,
      email: payload.email ?? null,
    }
  }

  return null
}

function normalizeAuthResponse(response) {
  const payload = response?.data ?? response

  return {
    token: payload?.token ?? payload?.accessToken ?? payload?.jwt ?? null,
    user: normalizeUserPayload(payload),
  }
}


function normalizeProfileResponse(response) {
  const payload = response?.data ?? response
  return normalizeUserPayload(payload)
}


const axiosBaseQuery = () => async ({ url, method = 'GET', data, params }, api) => {
  try {
    const response = await httpClient({
      url,
      method,
      data,
      params,
    })

    return { data: response.data }
  } catch (error) {
    const status = error.response?.status ?? 500
    const responseData = error.response?.data ?? { message: error.message }

    if (status === 401) {
      api.dispatch(logout())
    }

    return {
      error: {
        status,
        data: responseData,
      },
    }
  }
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Auth'],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/users/login',
        method: 'POST',
        data: credentials,
      }),
      transformResponse: normalizeAuthResponse,
      invalidatesTags: ['Auth'],
    }),
    signIn: builder.mutation({
      query: (payload) => ({
        url: '/users/signin',
        method: 'POST',
        data: payload,
      }),
      transformResponse: normalizeAuthResponse,
      invalidatesTags: ['Auth'],
    }),
    getProfile: builder.query({
      query: () => ({
        url: '/users/me',
      }),
      transformResponse: (response) => ({
        user: normalizeProfileResponse(response),
      }),
      providesTags: ['Auth'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled

          if (data?.user) {
            // This syncs the persisted user with the latest profile payload.
            dispatch(setUser(data.user))
          }
        } catch {
          // This stays empty because the UI already handles query errors.
        }
      },
    }),
  }),
})

export const {
  useGetProfileQuery,
  useLoginMutation,
  useSignInMutation,
} = authApi