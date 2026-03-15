import { createSlice } from '@reduxjs/toolkit'
import { clearAuthState, loadAuthState, saveAuthState } from './authStorage'

const persistedAuth = loadAuthState()

const initialState = {
  token: persistedAuth.token,
  user: persistedAuth.user,
  isAuthenticated: Boolean(persistedAuth.token),
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const nextToken = action.payload?.token ?? null
      const nextUser = action.payload?.user ?? null

      state.token = nextToken
      state.user = nextUser
      state.isAuthenticated = Boolean(nextToken)

      if (nextToken) {
        // This persists the latest session so refreshes do not drop the auth state.
        saveAuthState({ token: nextToken, user: nextUser })
        return
      }

      clearAuthState()
    },
    setUser: (state, action) => {
      state.user = action.payload

      if (state.token) {
        saveAuthState({ token: state.token, user: action.payload })
      }
    },
    logout: (state) => {
      state.token = null
      state.user = null
      state.isAuthenticated = false
      clearAuthState()
    },
  },
})

export const { logout, setCredentials, setUser } = authSlice.actions
export const authReducer = authSlice.reducer

export const selectAuthToken = (state) => state.auth.token
export const selectAuthUser = (state) => state.auth.user
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated