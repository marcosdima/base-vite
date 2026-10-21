import styled, { type DefaultTheme } from 'styled-components';

export const ToggleButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid ${({ theme }: { theme: DefaultTheme }) => theme.colors.border};
  border-radius: ${({ theme }: { theme: DefaultTheme }) => theme.radii.small};
  background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.surface};
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.textMuted};
  cursor: pointer;
  flex-shrink: 0;
  transition: color ${({ theme }: { theme: DefaultTheme }) => theme.transitions.default},
    border-color ${({ theme }: { theme: DefaultTheme }) => theme.transitions.default},
    background ${({ theme }: { theme: DefaultTheme }) => theme.transitions.default};

  &:hover {
    color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.accent};
    border-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.accentBorder};
    background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.accentSoft};
  }
`;