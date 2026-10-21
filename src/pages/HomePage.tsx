import { useTranslation } from 'react-i18next';
import { HomeParagraph, HomeTitle, Page, Placeholder } from '../styles/pages/homePage.styles';

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
