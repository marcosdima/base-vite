import styled, { type DefaultTheme } from 'styled-components';

export const Wrapper = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  border: 1px solid ${({ theme }: { theme: DefaultTheme }) => theme.colors.border};
  border-radius: ${({ theme }: { theme: DefaultTheme }) => theme.radii.pill};
  background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.surfaceOverlay};
`;

export const GlobeIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.textMuted};
`;

export const LangButton = styled.button<{ $active?: boolean }>`
  padding: 5px 10px;
  min-height: 30px;
  border-radius: ${({ theme }: { theme: DefaultTheme }) => theme.radii.pill};
  border: none;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    background ${({ theme }: { theme: DefaultTheme }) => theme.transitions.default},
    color ${({ theme }: { theme: DefaultTheme }) => theme.transitions.default};
  background: ${({ theme, $active }: { theme: DefaultTheme; $active?: boolean }) =>
    $active ? theme.colors.accent : 'transparent'};
  color: ${({ $active }: { $active?: boolean }) => ($active ? '#fff' : 'inherit')};

  &:hover {
    background: ${({ theme, $active }: { theme: DefaultTheme; $active?: boolean }) =>
      $active ? theme.colors.accentHover : theme.colors.surfaceMuted};
    color: ${({ theme, $active }: { theme: DefaultTheme; $active?: boolean }) =>
      $active ? '#fff' : theme.colors.textStrong};
  }
`;