import { createApi } from '@reduxjs/toolkit/query/react'
import { logout, setUser } from '../features/auth/authSlice'
import { httpClient } from './httpClient'

function normalizeAuthResponse(response) {
  const payload = response?.data ?? response

  return {
    token: payload?.token ?? payload?.accessToken ?? payload?.jwt ?? null,
    user: payload?.user ?? payload?.profile ?? payload?.data?.user ?? payload?.data ?? null,
  }
}


function normalizeProfileResponse(response) {
  const payload = response?.data ?? response
  return payload?.user ?? payload?.profile ?? payload?.data ?? payload ?? null
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
    signIn: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        data: credentials,
      }),
      transformResponse: normalizeAuthResponse,
      invalidatesTags: ['Auth'],
    }),
    signUp: builder.mutation({
      query: (payload) => ({
        url: '/auth/register',
        method: 'POST',
        data: payload,
      }),
      transformResponse: normalizeAuthResponse,
      invalidatesTags: ['Auth'],
    }),
    getProfile: builder.query({
      query: () => ({
        url: '/auth/me',
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
  useSignInMutation,
  useSignUpMutation,
} = authApi