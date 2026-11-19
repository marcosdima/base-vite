import { useState } from 'react';
import { FiCode, FiGrid, FiLayers, FiSearch, FiTerminal } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'styled-components';
import { Badge, Button, Card, Input, Stack } from '@/components/ui';
import {
  GroupInputBoard,
  PollDemo,
  SpotlightCardGrid,
  Terminal,
  type SpotlightCardItem,
} from '@/components/widgets';
import {
  BlockCaption,
  BlockTitle,
  FullSpanCard,
  HeroHeader,
  HeroSubtitle,
  HeroTitle,
  PlaygroundContainer,
  PrimitivesGrid,
  SectionBlock,
  SwatchCard,
  SwatchColor,
  SwatchMeta,
  SwatchName,
  SwatchValue,
  TokensGrid,
  WidgetsGrid,
} from './PlaygroundPage.styles';

export function PlaygroundPage() {
  const { t } = useTranslation();
  const theme = useTheme();
  const [sampleText, setSampleText] = useState('');
  const [clickCount, setClickCount] = useState(0);

  const tokenSwatches = [
    { name: 'background', value: theme.colors.background },
    { name: 'surface', value: theme.colors.surface },
    { name: 'surfaceMuted', value: theme.colors.surfaceMuted },
    { name: 'border', value: theme.colors.border },
    { name: 'accent', value: theme.colors.accent },
    { name: 'danger', value: theme.colors.danger },
    { name: 'successText', value: theme.colors.successText },
    { name: 'warningText', value: theme.colors.warningText },
  ];

  const spotlightItems: SpotlightCardItem[] = [
    {
      id: 'ui-primitives',
      title: t('playground.spotlight.primitivesTitle'),
      path: '/playground#primitives',
      icon: <FiLayers />,
      tag: 'UI',
      description: t('playground.spotlight.primitivesDescription'),
      accentColor: '#38bdf8',
    },
    {
      id: 'terminal-widget',
      title: t('playground.spotlight.terminalTitle'),
      path: '/playground#widgets',
      icon: <FiTerminal />,
      tag: 'Widget',
      description: t('playground.spotlight.terminalDescription'),
      accentColor: '#10b981',
    },
    {
      id: 'interactive-board',
      title: t('playground.spotlight.boardTitle'),
      path: '/dashboard',
      icon: <FiGrid />,
      tag: 'Route',
      description: t('playground.spotlight.boardDescription'),
      accentColor: '#a855f7',
    },
  ];

  return (
    <PlaygroundContainer>
      <HeroHeader>
        <Stack direction="row" gap="compact" align="center" wrap>
          <Badge tone="accent">{t('playground.badge')}</Badge>
          <Badge tone="neutral">{`Theme: ${theme.name}`}</Badge>
        </Stack>
        <HeroTitle>{t('playground.title')}</HeroTitle>
        <HeroSubtitle>{t('playground.subtitle')}</HeroSubtitle>
      </HeroHeader>

      <SectionBlock>
        <BlockTitle>{t('playground.sections.tokens')}</BlockTitle>
        <TokensGrid>
          {tokenSwatches.map((swatch) => (
            <SwatchCard key={swatch.name}>
              <SwatchColor $color={swatch.value} />
              <SwatchMeta>
                <SwatchName>{swatch.name}</SwatchName>
                <SwatchValue>{swatch.value}</SwatchValue>
              </SwatchMeta>
            </SwatchCard>
          ))}
        </TokensGrid>
      </SectionBlock>

      <SectionBlock id="primitives">
        <BlockTitle>{t('playground.sections.primitives')}</BlockTitle>

        <PrimitivesGrid>
          <Card>
            <Stack gap="component">
              <BlockCaption>{t('playground.primitives.buttons')}</BlockCaption>
              <Stack direction="row" gap="compact" wrap>
                <Button variant="primary" onClick={() => setClickCount((c) => c + 1)}>
                  {`${t('playground.primitives.primaryAction')} (${clickCount})`}
                </Button>
                <Button variant="secondary">{t('playground.primitives.secondaryAction')}</Button>
                <Button variant="ghost">{t('playground.primitives.ghostAction')}</Button>
                <Button variant="danger">{t('playground.primitives.dangerAction')}</Button>
              </Stack>
              <Stack direction="row" gap="compact" wrap align="center">
                <Button size="sm">SM</Button>
                <Button size="md">MD</Button>
                <Button size="lg">LG</Button>
                <Button isLoading>{t('playground.primitives.loadingAction')}</Button>
                <Button disabled>{t('playground.primitives.disabledAction')}</Button>
              </Stack>
            </Stack>
          </Card>

          <Card>
            <Stack gap="component">
              <BlockCaption>{t('playground.primitives.inputs')}</BlockCaption>
              <Input
                label={t('playground.primitives.inputLabel')}
                placeholder={t('playground.primitives.inputPlaceholder')}
                hint={t('playground.primitives.inputHint')}
                leftIcon={<FiSearch />}
                value={sampleText}
                onChange={(event) => setSampleText(event.target.value)}
              />
              <Input
                label={t('playground.primitives.errorInputLabel')}
                defaultValue="invalid-value"
                error={t('playground.primitives.errorInputMessage')}
              />
            </Stack>
          </Card>

          <Card variant="muted">
            <Stack gap="component">
              <BlockCaption>{t('playground.primitives.badgesAndCards')}</BlockCaption>
              <Stack direction="row" gap="compact" wrap>
                <Badge tone="neutral">Neutral</Badge>
                <Badge tone="accent">Accent</Badge>
                <Badge tone="success">Success</Badge>
                <Badge tone="warning">Warning</Badge>
                <Badge tone="error">Error</Badge>
              </Stack>
              <Card variant="elevated" padding="sm">
                <Stack direction="row" gap="compact" align="center">
                  <FiCode />
                  <BlockCaption>{t('playground.primitives.elevatedCardNote')}</BlockCaption>
                </Stack>
              </Card>
            </Stack>
          </Card>
        </PrimitivesGrid>
      </SectionBlock>

      <SectionBlock id="widgets">
        <BlockTitle>{t('playground.sections.widgets')}</BlockTitle>

        <WidgetsGrid>
          <FullSpanCard>
            <SpotlightCardGrid items={spotlightItems} actionLabel={t('playground.spotlight.cta')} />
          </FullSpanCard>

          <Card>
            <Stack gap="component">
              <BlockCaption>{t('playground.widgets.poll')}</BlockCaption>
              <PollDemo />
            </Stack>
          </Card>

          <Card>
            <Stack gap="component">
              <BlockCaption>{t('playground.widgets.groupInput')}</BlockCaption>
              <GroupInputBoard />
            </Stack>
          </Card>

          <FullSpanCard>
            <Terminal
              title="Base-Vite Playground Terminal"
              height="280px"
              commands={{
                theme: {
                  description: 'Print the currently active theme name',
                  handler: (_args, { print }) => {
                    print(`Active theme: ${theme.name}`, 'info');
                  },
                },
              }}
            />
          </FullSpanCard>
        </WidgetsGrid>
      </SectionBlock>
    </PlaygroundContainer>
  );
}
