import { useLocation } from 'react-router-dom';
// @ts-ignore - AuthFormCard.jsx will be migrated to TypeScript in a later phase
import { AuthFormCard } from '../components/auth/AuthFormCard';

export function LoginPage() {
  const location = useLocation();

  return (
    <AuthFormCard mode="login" notice={location.state?.successMessage ?? ''} />
  );
}