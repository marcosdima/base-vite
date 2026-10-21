import { useTranslation } from 'react-i18next';
import { GroupInputBoard } from './inputs/groups/GroupInputBoard';
import { PollDemo } from './inputs/poll/PollDemo';
import { ThemeChanger } from './switches/ThemeChanger';
import {
  FeatureCard,
  FeatureLabel,
  ShowcaseGrid,
  ShowcaseHeader,
  ShowcaseWrapper,
} from '../../styles/components/featureShowcase.styles';

export function FeatureShowcase() {
  const { t } = useTranslation();

  return (
    <ShowcaseWrapper>
      <ShowcaseHeader>{t('dashboard.showcaseTitle')}</ShowcaseHeader>

      <ShowcaseGrid>
        <FeatureCard>
          <FeatureLabel>{t('dashboard.showcase.theme')}</FeatureLabel>
          <ThemeChanger />
        </FeatureCard>

        <FeatureCard>
          <FeatureLabel>{t('dashboard.showcase.poll')}</FeatureLabel>
          <PollDemo />
        </FeatureCard>

        <FeatureCard style={{ gridColumn: '1 / -1' }}>
          <FeatureLabel>{t('dashboard.showcase.groupInput')}</FeatureLabel>
          <GroupInputBoard />
        </FeatureCard>
      </ShowcaseGrid>
    </ShowcaseWrapper>
  );
}