import {
  BackLink,
  Code,
  Content,
  Description,
  ErrorTitle,
  Page,
} from '../styles/pages/notFoundPage.styles';
import { useTranslation } from 'react-i18next';

export function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <Page>
      <Content>
        <Code>404</Code>
        <ErrorTitle>{t('notFound.title')}</ErrorTitle>
        <Description>{t('notFound.description')}</Description>
        <BackLink to="/">{t('notFound.action')}</BackLink>
      </Content>
    </Page>
  );
}
