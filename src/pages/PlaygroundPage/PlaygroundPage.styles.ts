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
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
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

export const WidgetsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.component};
  align-items: start;
`;

export const FullSpanCard = styled.div`
  grid-column: 1 / -1;
`;
