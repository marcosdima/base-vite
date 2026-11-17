import { useTranslation } from 'react-i18next';
import { GroupInputBoard } from './inputs/groups/GroupInputBoard';
import { PollDemo } from './inputs/poll/PollDemo';
import { ThemeChanger } from './switches/ThemeChanger';
import { Terminal } from '../ui/Terminal';
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
          <FeatureLabel>{t('dashboard.showcase.terminal')}</FeatureLabel>
          <Terminal
            title="Base-Vite Terminal v1.0"
            welcomeMessage='Welcome to the template terminal component! Type "help" or run "echo Hello World".'
            prompt="demo@vite:~$ "
            height="240px"
          />
        </FeatureCard>

        <FeatureCard style={{ gridColumn: '1 / -1' }}>
          <FeatureLabel>{t('dashboard.showcase.groupInput')}</FeatureLabel>
          <GroupInputBoard />
        </FeatureCard>
      </ShowcaseGrid>
    </ShowcaseWrapper>
  );
}
