import styled, { type DefaultTheme } from 'styled-components';
import { Caption, Paragraph, SectionTitle } from '@/styles/typography';

export const PlaygroundContainer = styled.div`
  display: grid;
  gap: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.section};
`;

export const HeroHeader = styled.header`
  display: grid;
  gap: 10px;
`;

export const HeroTitle = styled(SectionTitle)`
  font-size: clamp(1.6rem, 2.5vw, 2.15rem);
`;

export const HeroSubtitle = styled(Paragraph)`
  max-width: 72ch;
`;

export const SectionBlock = styled.section`
  display: grid;
  gap: 14px;
`;

export const BlockTitle = styled.h2`
  margin: 0;
  font-size: ${({ theme }: { theme: DefaultTheme }) => theme.fontSizes.lg};
  font-weight: 700;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.textStrong};
`;

export const BlockCaption = styled(Caption)`
  margin: 0;
`;

export const PrimitivesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
  gap: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.component};
  align-items: start;
`;

export const TokensGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 12px;
`;

export const SwatchCard = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: ${({ theme }: { theme: DefaultTheme }) => theme.radii.small};
  border: 1px solid ${({ theme }: { theme: DefaultTheme }) => theme.colors.border};
  background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.surface};
`;

export const SwatchColor = styled.span<{ $color: string }>`
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 1px solid ${({ theme }: { theme: DefaultTheme }) => theme.colors.borderStrong};
  background: ${({ $color }) => $color};
  flex-shrink: 0;
`;

export const SwatchMeta = styled.div`
  display: grid;
  gap: 2px;
  min-width: 0;
`;

export const SwatchName = styled.span`
  font-size: ${({ theme }: { theme: DefaultTheme }) => theme.fontSizes.xs};
  font-weight: 600;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.textStrong};
`;

export const SwatchValue = styled.span`
  font-family: ${({ theme }: { theme: DefaultTheme }) => theme.fonts.mono};
  font-size: 0.7rem;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.textMuted};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const HooksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.component};
  align-items: start;
`;

export const PollQuestionText = styled.p`
  margin: 0;
  font-size: ${({ theme }: { theme: DefaultTheme }) => theme.fontSizes.md};
  font-weight: 600;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.textStrong};
`;

export const PollOptionCard = styled.button<{ $isLeading: boolean }>`
  position: relative;
  overflow: hidden;
  width: 100%;
  display: grid;
  gap: 8px;
  padding: 12px 14px;
  text-align: left;
  border-radius: ${({ theme }: { theme: DefaultTheme }) => theme.radii.small};
  border: 1px solid
    ${({ theme, $isLeading }: { theme: DefaultTheme; $isLeading: boolean }) =>
      $isLeading ? theme.colors.accent : theme.colors.borderStrong};
  background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.surfaceMuted};
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.textStrong};
  cursor: pointer;
  transition:
    border-color ${({ theme }: { theme: DefaultTheme }) => theme.transitions.default},
    background ${({ theme }: { theme: DefaultTheme }) => theme.transitions.default};

  &:hover:not(:disabled) {
    border-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.accent};
    background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.surface};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.75;
  }
`;

export const PollOptionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
`;

export const PollOptionLabel = styled.span`
  font-size: ${({ theme }: { theme: DefaultTheme }) => theme.fontSizes.sm};
  font-weight: 600;
`;

export const PollOptionMeta = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: ${({ theme }: { theme: DefaultTheme }) => theme.fontSizes.xs};
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.textMuted};
  font-family: ${({ theme }: { theme: DefaultTheme }) => theme.fonts.mono};
`;

export const PollProgressTrack = styled.div`
  width: 100%;
  height: 6px;
  border-radius: ${({ theme }: { theme: DefaultTheme }) => theme.radii.pill};
  background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.border};
  overflow: hidden;
`;

export const PollProgressFill = styled.div<{ $percentage: number; $isLeading: boolean }>`
  height: 100%;
  width: ${({ $percentage }) => `${Math.min(100, Math.max(0, $percentage))}%`};
  border-radius: ${({ theme }: { theme: DefaultTheme }) => theme.radii.pill};
  background: ${({ theme, $isLeading }: { theme: DefaultTheme; $isLeading: boolean }) =>
    $isLeading ? theme.colors.accent : theme.colors.textMuted};
  transition: width 0.25s ease;
`;

export const PollAddRow = styled.form`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
  align-items: start;
`;

export const StepperTrack = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
`;

export const StepPill = styled.button<{ $active: boolean; $completed: boolean }>`
  padding: 10px 8px;
  border-radius: ${({ theme }: { theme: DefaultTheme }) => theme.radii.small};
  border: 1px solid
    ${({ theme, $active }: { theme: DefaultTheme; $active: boolean }) =>
      $active ? theme.colors.accent : theme.colors.border};
  background: ${({
    theme,
    $active,
    $completed,
  }: {
    theme: DefaultTheme;
    $active: boolean;
    $completed: boolean;
  }) =>
    $active
      ? theme.colors.accentSoft
      : $completed
        ? theme.colors.surfaceMuted
        : theme.colors.surface};
  color: ${({ theme, $active }: { theme: DefaultTheme; $active: boolean }) =>
    $active ? theme.colors.accent : theme.colors.textMuted};
  font-family: ${({ theme }: { theme: DefaultTheme }) => theme.fonts.mono};
  font-size: ${({ theme }: { theme: DefaultTheme }) => theme.fontSizes.xs};
  font-weight: 700;
  cursor: pointer;
  transition: all ${({ theme }: { theme: DefaultTheme }) => theme.transitions.default};
`;
