import { useSelector } from 'react-redux';
import { selectAuthToken, selectAuthUser } from '../features/auth/authSlice';
import { useGetProfileQuery } from '../services/authApi';
import { useTranslation } from 'react-i18next';
// @ts-ignore - FeatureShowcase.jsx will be migrated to TypeScript in a later phase
import { FeatureShowcase } from '../components/features/FeatureShowcase';
// @ts-ignore - dashboardPage.styles.js will be migrated to TypeScript in a later phase
import {
  Card,
  CardNote,
  CardTitle,
  InfoRow,
  Label,
  Page,
  Value,
} from '../styles/pages/dashboardPage.styles';

export function DashboardPage() {
  const { t } = useTranslation();
  const authUser = useSelector(selectAuthUser);
  const authToken = useSelector(selectAuthToken);

  useGetProfileQuery(undefined, { skip: !authToken });

  const username = authUser?.username ?? authUser?.name ?? t('dashboard.greetingFallback');

  return (
    <Page>
      <Card>
        <CardTitle>{t('dashboard.greeting', { username })}</CardTitle>
        <CardNote>{t('dashboard.baseDescription')}</CardNote>

        <InfoRow>
          <Label>{t('dashboard.sessionTokenLabel')}</Label>
          <Value>{authToken ? `${authToken.slice(0, 20)}…` : t('dashboard.noToken')}</Value>
        </InfoRow>
      </Card>

      <FeatureShowcase />
    </Page>
  );
}