import * as RadixTabs from '@radix-ui/react-tabs';
import styled, { type DefaultTheme } from 'styled-components';

export const StyledTabsRoot = styled(RadixTabs.Root)`
  display: grid;
  gap: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.section};
`;

export const StyledTabsList = styled(RadixTabs.List)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px;
  border-radius: ${({ theme }: { theme: DefaultTheme }) => theme.radii.medium};
  border: 1px solid ${({ theme }: { theme: DefaultTheme }) => theme.colors.border};
  background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.surfaceMuted};
  flex-wrap: wrap;
  justify-self: start;
`;

export const StyledTabsTrigger = styled(RadixTabs.Trigger)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 6px 14px;
  border: 1px solid transparent;
  border-radius: ${({ theme }: { theme: DefaultTheme }) => theme.radii.small};
  background: transparent;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.textMuted};
  font-size: ${({ theme }: { theme: DefaultTheme }) => theme.fontSizes.sm};
  font-weight: 600;
  cursor: pointer;
  transition:
    background ${({ theme }: { theme: DefaultTheme }) => theme.transitions.default},
    color ${({ theme }: { theme: DefaultTheme }) => theme.transitions.default},
    border-color ${({ theme }: { theme: DefaultTheme }) => theme.transitions.default},
    box-shadow ${({ theme }: { theme: DefaultTheme }) => theme.transitions.default};

  &:hover {
    color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.textStrong};
  }

  &[data-state='active'] {
    background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.surface};
    color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.accent};
    border-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.border};
    box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px ${({ theme }: { theme: DefaultTheme }) => theme.colors.focusRing};
  }
`;

export const StyledTabsContent = styled(RadixTabs.Content)`
  &:focus-visible {
    outline: none;
  }
`;
