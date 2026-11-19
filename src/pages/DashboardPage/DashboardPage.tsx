import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/app/hooks';
import { Badge, Button, Stack } from '@/components/ui';
import { selectAuthToken, selectAuthUser } from '@/features/auth/authSlice';
import { useGetProfileQuery } from '@/services/authApi';
import { API_BASE_URL } from '@/utils/config';
import {
  CardNote,
  CardTitle,
  DashboardCard,
  InfoRow,
  Label,
  Page,
  Value,
} from './DashboardPage.styles';

export function DashboardPage() {
  const { t } = useTranslation();
  const authUser = useAppSelector(selectAuthUser);
  const authToken = useAppSelector(selectAuthToken);

  const { isFetching, isError, refetch } = useGetProfileQuery(undefined, { skip: !authToken });

  const username = authUser?.username ?? authUser?.name ?? t('dashboard.greetingFallback');

  return (
    <Page>
      <DashboardCard>
        <Stack direction="row" justify="space-between" align="center" wrap>
          <Badge tone="accent">{t('dashboard.badge')}</Badge>
          <Button variant="secondary" size="sm" isLoading={isFetching} onClick={() => refetch()}>
            {isFetching ? t('dashboard.refreshing') : t('dashboard.refresh')}
          </Button>
        </Stack>

        <CardTitle>{t('dashboard.greeting', { username })}</CardTitle>
        <CardNote>{t('dashboard.description')}</CardNote>

        {isError ? <Badge tone="warning">{t('dashboard.profileRequestFailed')}</Badge> : null}

        <div>
          <InfoRow>
            <Label>{t('dashboard.name')}</Label>
            <Value>{authUser?.name ?? authUser?.username ?? t('dashboard.fallbackUser')}</Value>
          </InfoRow>

          <InfoRow>
            <Label>{t('dashboard.sessionTokenLabel')}</Label>
            <Value>{authToken ? `${authToken.slice(0, 20)}…` : t('dashboard.noToken')}</Value>
          </InfoRow>

          <InfoRow>
            <Label>{t('dashboard.apiCardTitle')}</Label>
            <Value>{API_BASE_URL}</Value>
          </InfoRow>
        </div>
      </DashboardCard>
    </Page>
  );
}
