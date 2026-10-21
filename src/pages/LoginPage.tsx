import { useLocation } from 'react-router-dom';
import { AuthFormCard } from '../components/auth/AuthFormCard';

export function LoginPage() {
  const location = useLocation();

  return <AuthFormCard mode="login" notice={location.state?.successMessage ?? ''} />;
}
