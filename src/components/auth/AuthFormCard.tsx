import { useState } from 'react';
import { FiArrowRight, FiLoader, FiLock, FiUser } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { setCredentials } from '../../features/auth/authSlice';
import { useLoginMutation, useSignInMutation } from '../../services/authApi';
import {
  Card,
  Feedback,
  FieldInput,
  FieldLabel,
  Footer,
  Form,
  Spin,
  SubmitButton,
} from '../../styles/components/authFormCard.styles';

interface InitialFormState {
  username: string;
  password: string;
  confirmPassword: string;
}

const initialFormState: InitialFormState = {
  username: '',
  password: '',
  confirmPassword: '',
};

function getErrorMessage(error: unknown, fallbackMessage: string): string {
  if (!error || typeof error !== 'object') return fallbackMessage;

  const err = error as Record<string, unknown>;
  return (
    ((err.data as Record<string, unknown>)?.message as string) ??
    ((err.data as Record<string, unknown>)?.error as string) ??
    (err.message as string) ??
    fallbackMessage
  );
}

interface AuthFormCardProps {
  mode: 'login' | 'signin';
  notice?: string;
}

export function AuthFormCard({ mode, notice = '' }: AuthFormCardProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [formState, setFormState] = useState<InitialFormState>(initialFormState);
  const [feedbackMessage, setFeedbackMessage] = useState(notice);
  const [feedbackType, setFeedbackType] = useState<'error' | 'success' | 'neutral'>(
    notice ? 'success' : 'neutral',
  );
  const [login, loginResult] = useLoginMutation();
  const [signIn, signInResult] = useSignInMutation();

  const isSignIn = mode === 'signin';
  const isLoading = loginResult.isLoading || signInResult.isLoading;
  const redirectTo = location.state?.redirectTo ?? '/dashboard';

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setFormState((currentState) => ({
      ...currentState,
      [name]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setFeedbackMessage('');
    setFeedbackType('neutral');

    if (isSignIn && formState.password !== formState.confirmPassword) {
      setFeedbackType('error');
      setFeedbackMessage(t('auth.errors.passwordMismatch'));
      return;
    }

    try {
      if (isSignIn) {
        const result = await signIn({
          username: formState.username,
          password: formState.password,
          confirmPassword: formState.confirmPassword,
        }).unwrap();

        if (result.token) {
          dispatch(setCredentials(result));
          navigate('/dashboard', { replace: true });
          return;
        }

        navigate('/login', {
          replace: true,
          state: { successMessage: t('auth.success.accountCreated') },
        });
        return;
      }

      const result = await login({
        username: formState.username,
        password: formState.password,
      }).unwrap();

      dispatch(setCredentials(result));
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setFeedbackType('error');
      setFeedbackMessage(getErrorMessage(error, t('auth.errors.unexpectedResponse')));
    }
  }

  const alternatePath = isSignIn ? '/login' : '/signin';
  const alternateLabel = isSignIn ? t('auth.haveAccount') : t('auth.needAccount');
  const alternateAction = isSignIn ? t('nav.login') : t('nav.signIn');

  return (
    <Card
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <Form onSubmit={handleSubmit}>
        <FieldLabel>
          <span>{t('auth.fields.username')}</span>
          <FieldInput>
            <FiUser />
            <input
              type="text"
              name="username"
              placeholder={t('auth.placeholders.username')}
              value={formState.username}
              onChange={handleChange}
              autoComplete="username"
              required
            />
          </FieldInput>
        </FieldLabel>

        {isSignIn ? (
          <FieldLabel>
            <span>{t('auth.fields.confirmPassword')}</span>
            <FieldInput>
              <FiLock />
              <input
                type="password"
                name="confirmPassword"
                placeholder={t('auth.placeholders.confirmPassword')}
                value={formState.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />
            </FieldInput>
          </FieldLabel>
        ) : null}

        <FieldLabel>
          <span>{t('auth.fields.password')}</span>
          <FieldInput>
            <FiLock />
            <input
              type="password"
              name="password"
              placeholder={t('auth.placeholders.password')}
              value={formState.password}
              onChange={handleChange}
              autoComplete={isSignIn ? 'new-password' : 'current-password'}
              required
            />
          </FieldInput>
        </FieldLabel>

        {feedbackMessage ? <Feedback $type={feedbackType}>{feedbackMessage}</Feedback> : null}

        <SubmitButton type="submit" disabled={isLoading}>
          {isLoading ? (
            <Spin>
              <FiLoader />
            </Spin>
          ) : (
            <FiArrowRight />
          )}
          <span>{isSignIn ? t('auth.actions.createAccount') : t('auth.actions.login')}</span>
        </SubmitButton>
      </Form>

      <Footer>
        {alternateLabel} <Link to={alternatePath}>{alternateAction}</Link>
      </Footer>
    </Card>
  );
}
