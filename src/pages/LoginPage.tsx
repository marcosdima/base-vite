import { useLocation } from 'react-router-dom';
import { AuthFormCard } from '@/components/auth/AuthFormCard';

export function LoginPage() {
  const location = useLocation();
  const successMessage =
    (location.state as { successMessage?: string } | null)?.successMessage ?? '';

  return <AuthFormCard mode="login" notice={successMessage} />;
}
