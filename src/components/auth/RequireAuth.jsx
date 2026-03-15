import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import { selectIsAuthenticated } from '../../features/auth/authSlice'

export function RequireAuth({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    // This keeps the original target so the user returns there after login.
    return <Navigate to="/login" replace state={{ redirectTo: location.pathname }} />
  }

  return children
}