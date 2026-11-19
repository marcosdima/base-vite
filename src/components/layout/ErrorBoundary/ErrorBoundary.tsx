import { Component, type ErrorInfo } from 'react';
import { useTranslation } from 'react-i18next';
import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router-dom';
import { Badge, Button, Stack } from '@/components/ui';
import {
  FallbackCard,
  FallbackMessage,
  FallbackTitle,
  FallbackWrapper,
} from './ErrorBoundary.styles';

interface ErrorFallbackViewProps {
  message?: string;
  onRetry?: () => void;
}

function ErrorFallbackView({ message, onRetry }: ErrorFallbackViewProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <FallbackWrapper role="alert">
      <FallbackCard>
        <Badge tone="error">{t('errorBoundary.badge')}</Badge>
        <FallbackTitle>{t('errorBoundary.title')}</FallbackTitle>
        <FallbackMessage>{message ?? t('errorBoundary.description')}</FallbackMessage>

        <Stack direction="row" gap="compact" wrap justify="center">
          {onRetry ? (
            <Button variant="primary" onClick={onRetry}>
              {t('errorBoundary.retry')}
            </Button>
          ) : null}
          <Button variant="secondary" onClick={() => navigate('/')}>
            {t('errorBoundary.home')}
          </Button>
        </Stack>
      </FallbackCard>
    </FallbackWrapper>
  );
}

/** Route-level error fallback for React Router `errorElement`. */
export function RouteErrorFallback() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} · ${error.statusText}`
    : error instanceof Error
      ? error.message
      : undefined;

  return <ErrorFallbackView message={message} />;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage?: string;
}

/** Application-level React Error Boundary. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Uncaught render error:', error, info);
  }

  private handleReset = () => {
    this.setState({ hasError: false, errorMessage: undefined });
  };

  render() {
    if (this.state.hasError) {
      return <ErrorFallbackView message={this.state.errorMessage} onRetry={this.handleReset} />;
    }

    return this.props.children;
  }
}
