import { useTranslation } from 'react-i18next'
import { ThemeChanger } from './switchs/ThemeChanger'
import {
  FeatureCard,
  FeatureLabel,
  ShowcaseGrid,
  ShowcaseHeader,
  ShowcaseWrapper,
} from '../../styles/components/featureShowcase.styles'


export function FeatureShowcase() {
  const { t } = useTranslation()

  return (
    <ShowcaseWrapper>
      <ShowcaseHeader>{t('dashboard.showcaseTitle')}</ShowcaseHeader>

      <ShowcaseGrid>
        <FeatureCard>
          <FeatureLabel>{t('dashboard.showcase.theme')}</FeatureLabel>
          <ThemeChanger />
        </FeatureCard>
      </ShowcaseGrid>
    </ShowcaseWrapper>
  )
}
