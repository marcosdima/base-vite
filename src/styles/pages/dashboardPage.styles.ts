import styled, { type DefaultTheme } from 'styled-components';
import { Caption, Paragraph, SectionTitle } from '../typography';

export const Page = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  padding: 40px 0;
`;

export const Card = styled.div`
  width: min(100%, 540px);
  padding: 32px;
  border: 1px solid ${({ theme }: { theme: DefaultTheme }) => theme.colors.border};
  border-radius: ${({ theme }: { theme: DefaultTheme }) => theme.radii.medium};
  background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.surface};
  box-shadow: ${({ theme }: { theme: DefaultTheme }) => theme.shadows.card};
  display: grid;
  gap: 20px;
`;

export const CardTitle = styled(SectionTitle)`
  font-size: 1.4rem;
`;

export const CardNote = styled(Paragraph)`
  font-size: 0.9rem;
`;

export const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid ${({ theme }: { theme: DefaultTheme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

export const Label = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  white-space: nowrap;
`;

export const Value = styled(Caption)`
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.text};
  word-break: break-all;
  text-align: right;
`;
