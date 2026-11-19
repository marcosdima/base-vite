import { useState } from 'react';
import { FiCode, FiCpu, FiLayers, FiSearch, FiSliders, FiTerminal } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'styled-components';
import {
  Badge,
  Button,
  Card,
  Input,
  Stack,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import { Terminal } from '@/components/widgets';
import { usePlayback, usePoll } from '@/hooks';
import {
  BlockCaption,
  BlockTitle,
  HeroHeader,
  HeroSubtitle,
  HeroTitle,
  HooksGrid,
  PlaygroundContainer,
  PollAddRow,
  PollOptionCard,
  PollOptionHeader,
  PollOptionLabel,
  PollOptionMeta,
  PollProgressFill,
  PollProgressTrack,
  PollQuestionText,
  PrimitivesGrid,
  SectionBlock,
  StepPill,
  StepperTrack,
  SwatchCard,
  SwatchColor,
  SwatchMeta,
  SwatchName,
  SwatchValue,
  TokensGrid,
} from './PlaygroundPage.styles';

const PLAYBACK_TOTAL_STEPS = 5;

export function PlaygroundPage() {
  const { t } = useTranslation();
  const theme = useTheme();
  const [sampleText, setSampleText] = useState('');
  const [clickCount, setClickCount] = useState(0);
  const [newPollOption, setNewPollOption] = useState('');

  const poll = usePoll({
    question: t('playground.hooks.pollQuestion'),
    options: [
      { id: 'rbac', label: t('playground.hooks.pollOptionA'), votes: 3 },
      { id: 'realtime', label: t('playground.hooks.pollOptionB'), votes: 5 },
      { id: 'audit', label: t('playground.hooks.pollOptionC'), votes: 2 },
    ],
  });

  const playback = usePlayback({
    totalSteps: PLAYBACK_TOTAL_STEPS,
    initialSpeed: 1200,
  });

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

  function handleAddPollOption(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newPollOption.trim()) return;
    poll.addOption(newPollOption);
    setNewPollOption('');
  }

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

      <Tabs defaultValue="primitives">
        <TabsList aria-label={t('playground.categoriesAria')}>
          <TabsTrigger value="primitives">
            <FiLayers />
            <span>{t('playground.tabs.primitives')}</span>
          </TabsTrigger>
          <TabsTrigger value="tokens">
            <FiSliders />
            <span>{t('playground.tabs.tokens')}</span>
          </TabsTrigger>
          <TabsTrigger value="hooks">
            <FiCpu />
            <span>{t('playground.tabs.hooks')}</span>
          </TabsTrigger>
          <TabsTrigger value="widgets">
            <FiTerminal />
            <span>{t('playground.tabs.widgets')}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="primitives">
          <SectionBlock>
            <BlockTitle>{t('playground.sections.primitives')}</BlockTitle>

            <PrimitivesGrid>
              <Card>
                <Stack gap="component">
                  <BlockCaption>{t('playground.primitives.buttons')}</BlockCaption>
                  <Stack direction="row" gap="compact" wrap>
                    <Button variant="primary" onClick={() => setClickCount((c) => c + 1)}>
                      {`${t('playground.primitives.primaryAction')} (${clickCount})`}
                    </Button>
                    <Button variant="secondary">
                      {t('playground.primitives.secondaryAction')}
                    </Button>
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
        </TabsContent>

        <TabsContent value="tokens">
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
        </TabsContent>

        <TabsContent value="hooks">
          <SectionBlock>
            <BlockTitle>{t('playground.sections.hooks')}</BlockTitle>

            <HooksGrid>
              <Card>
                <Stack gap="component">
                  <Stack direction="row" justify="space-between" align="center" wrap>
                    <BlockCaption>{t('playground.hooks.pollTitle')}</BlockCaption>
                    <Stack direction="row" gap="compact" align="center">
                      <Badge tone={poll.isOpen ? 'success' : 'neutral'}>
                        {poll.isOpen
                          ? t('playground.hooks.pollOpenBadge')
                          : t('playground.hooks.pollClosedBadge')}
                      </Badge>
                      <Badge tone="accent">
                        {t('playground.hooks.pollTotalVotes', { count: poll.totalVotes })}
                      </Badge>
                    </Stack>
                  </Stack>

                  <PollQuestionText>{poll.question}</PollQuestionText>

                  <Stack gap="compact">
                    {poll.options.map((option) => {
                      const isLeading = poll.leadingOptionId === option.id;

                      return (
                        <PollOptionCard
                          key={option.id}
                          type="button"
                          disabled={!poll.isOpen}
                          $isLeading={isLeading}
                          onClick={() => poll.vote(option.id)}
                        >
                          <PollOptionHeader>
                            <PollOptionLabel>{option.label}</PollOptionLabel>
                            <PollOptionMeta>
                              {isLeading ? (
                                <Badge tone="accent">
                                  {t('playground.hooks.pollLeadingBadge')}
                                </Badge>
                              ) : null}
                              <span>{`${option.votes} (${option.percentage}%)`}</span>
                            </PollOptionMeta>
                          </PollOptionHeader>

                          <PollProgressTrack aria-hidden="true">
                            <PollProgressFill
                              $percentage={option.percentage}
                              $isLeading={isLeading}
                            />
                          </PollProgressTrack>
                        </PollOptionCard>
                      );
                    })}
                  </Stack>

                  <PollAddRow onSubmit={handleAddPollOption}>
                    <Input
                      placeholder={t('playground.hooks.pollAddPlaceholder')}
                      aria-label={t('playground.hooks.pollAddPlaceholder')}
                      value={newPollOption}
                      onChange={(event) => setNewPollOption(event.target.value)}
                    />
                    <Button type="submit" variant="secondary">
                      {t('playground.hooks.pollAddAction')}
                    </Button>
                  </PollAddRow>

                  <Stack direction="row" gap="compact" wrap>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => (poll.isOpen ? poll.close() : poll.reopen())}
                    >
                      {poll.isOpen
                        ? t('playground.hooks.pollClose')
                        : t('playground.hooks.pollReopen')}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => poll.reset()}>
                      {t('playground.hooks.pollReset')}
                    </Button>
                  </Stack>
                </Stack>
              </Card>

              <Card>
                <Stack gap="component">
                  <Stack direction="row" justify="space-between" align="center" wrap>
                    <BlockCaption>{t('playground.hooks.playbackTitle')}</BlockCaption>
                    <Stack direction="row" gap="compact" align="center">
                      <Badge tone={playback.isPlaying ? 'success' : 'neutral'}>
                        {playback.isPlaying
                          ? t('playground.hooks.playbackPlaying')
                          : t('playground.hooks.playbackPaused')}
                      </Badge>
                      <Badge tone="accent">
                        {t('playground.hooks.playbackStepLabel', {
                          current: playback.stepIndex + 1,
                          total: PLAYBACK_TOTAL_STEPS,
                        })}
                      </Badge>
                    </Stack>
                  </Stack>

                  <BlockCaption>{t('playground.hooks.playbackDescription')}</BlockCaption>

                  <StepperTrack>
                    {Array.from({ length: PLAYBACK_TOTAL_STEPS }, (_, index) => (
                      <StepPill
                        key={index}
                        type="button"
                        $active={playback.stepIndex === index}
                        $completed={index < playback.stepIndex}
                        onClick={() => playback.setStepIndex(index)}
                      >
                        {`#${index + 1}`}
                      </StepPill>
                    ))}
                  </StepperTrack>

                  <Stack direction="row" gap="compact" wrap>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={playback.stepIndex === 0}
                      onClick={playback.prev}
                    >
                      {t('playground.hooks.playbackPrev')}
                    </Button>
                    <Button variant="primary" size="sm" onClick={playback.togglePlay}>
                      {playback.isPlaying
                        ? t('playground.hooks.playbackPause')
                        : t('playground.hooks.playbackPlay')}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={playback.stepIndex >= PLAYBACK_TOTAL_STEPS - 1}
                      onClick={playback.next}
                    >
                      {t('playground.hooks.playbackNext')}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => playback.reset(0)}>
                      {t('playground.hooks.playbackReset')}
                    </Button>
                  </Stack>
                </Stack>
              </Card>
            </HooksGrid>
          </SectionBlock>
        </TabsContent>

        <TabsContent value="widgets">
          <SectionBlock>
            <BlockTitle>{t('playground.sections.widgets')}</BlockTitle>
            <BlockCaption>{t('playground.widgets.terminalCaption')}</BlockCaption>

            <Terminal
              title="Base-Vite Playground Terminal"
              height="320px"
              commands={{
                theme: {
                  description: 'Print the currently active theme name',
                  handler: (_args, { print }) => {
                    print(`Active theme: ${theme.name}`, 'info');
                  },
                },
              }}
            />
          </SectionBlock>
        </TabsContent>
      </Tabs>
    </PlaygroundContainer>
  );
}
