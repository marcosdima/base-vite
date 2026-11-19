import styled, { type DefaultTheme } from 'styled-components';
import { Paragraph, SectionTitle } from '@/styles/typography';

export const FallbackWrapper = styled.section`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.section};
`;

export const FallbackCard = styled.div`
  width: min(100%, 480px);
  padding: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.section};
  border: 1px solid ${({ theme }: { theme: DefaultTheme }) => theme.colors.border};
  border-radius: ${({ theme }: { theme: DefaultTheme }) => theme.radii.medium};
  background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.surface};
  box-shadow: ${({ theme }: { theme: DefaultTheme }) => theme.shadows.card};
  display: grid;
  gap: 14px;
  text-align: center;
  justify-items: center;
`;

export const FallbackTitle = styled(SectionTitle)`
  font-size: 1.4rem;
`;

export const FallbackMessage = styled(Paragraph)`
  font-size: ${({ theme }: { theme: DefaultTheme }) => theme.fontSizes.sm};
`;
