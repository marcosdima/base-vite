import { useTranslation } from 'react-i18next';
import { HomeParagraph, HomeTitle, Page, Placeholder } from './HomePage.styles';

export function HomePage() {
  const { t } = useTranslation();

  return (
    <Page>
      <Placeholder>
        <HomeTitle>{t('home.title')}</HomeTitle>
        <HomeParagraph>{t('home.description')}</HomeParagraph>
      </Placeholder>
    </Page>
  );
}
