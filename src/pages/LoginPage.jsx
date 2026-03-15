import { AuthFormCard } from '../components/auth/AuthFormCard'
import { useLocation } from 'react-router-dom'

export function LoginPage() {
  const location = useLocation()

  return <AuthFormCard mode="login" notice={location.state?.successMessage ?? ''} />
}