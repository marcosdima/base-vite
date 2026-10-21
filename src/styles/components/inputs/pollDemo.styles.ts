import styled, { type DefaultTheme } from 'styled-components';

export const PollWrap = styled.div`
  display: grid;
  gap: 10px;
`;

export const PollQuestion = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.text};
`;

export const PollOptions = styled.div`
  display: grid;
  gap: 8px;
`;

export const PollOptionButton = styled.button`
  width: 100%;
  text-align: left;
  border: 1px solid ${({ theme }: { theme: DefaultTheme }) => theme.colors.borderStrong};
  border-radius: ${({ theme }: { theme: DefaultTheme }) => theme.radii.small};
  background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.surface};
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.text};
  padding: 8px 10px;
  font-size: 0.85rem;
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.accent};
    background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.accentSoft};
  }
`;

export const PollResult = styled.span`
  font-size: 0.78rem;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.textSubtle};
  margin-left: 8px;
`;

export const PollActions = styled.div`
  display: flex;
  gap: 8px;
`;

export const PollActionButton = styled.button`
  border: 1px solid ${({ theme }: { theme: DefaultTheme }) => theme.colors.border};
  border-radius: ${({ theme }: { theme: DefaultTheme }) => theme.radii.small};
  background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.surface};
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.textMuted};
  padding: 6px 10px;
  font-size: 0.78rem;
  cursor: pointer;

  &:hover {
    color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.accent};
    border-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.accentBorder};
  }
`;