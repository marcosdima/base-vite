// @ts-ignore - homePage.styles.js will be migrated to TypeScript in a later phase
import {
  HomeParagraph,
  HomeTitle,
  Page,
  Placeholder,
} from '../styles/pages/homePage.styles';
import { useTranslation } from 'react-i18next';

export function HomePage() {
  const { t } = useTranslation();

  return (
    <Page>
      <Placeholder>
        <HomeTitle>{t('home.simpleTitle')}</HomeTitle>
        <HomeParagraph>{t('home.simpleDescription')}</HomeParagraph>
      </Placeholder>
    </Page>
  );
}