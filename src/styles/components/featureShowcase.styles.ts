import styled, { type DefaultTheme } from 'styled-components';
import { Caption } from '../typography';

export const ShowcaseWrapper = styled.section`
  width: min(100%, 720px);
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const ShowcaseHeader = styled.h2`
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.textSubtle};
  margin: 0;
`;

export const ShowcaseGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
`;

export const FeatureCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  border: 1px solid ${({ theme }: { theme: DefaultTheme }) => theme.colors.border};
  border-radius: ${({ theme }: { theme: DefaultTheme }) => theme.radii.medium};
  background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.surface};
`;

export const FeatureLabel = styled(Caption)`
  font-weight: 600;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;
