import styled, { css, type DefaultTheme } from 'styled-components';

export type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'error';

const toneStyles: Record<BadgeTone, ReturnType<typeof css>> = {
  neutral: css`
    background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.neutralBackground};
    color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.neutralText};
    border-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.border};
  `,
  accent: css`
    background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.accentSoft};
    color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.accent};
    border-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.accentBorder};
  `,
  success: css`
    background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.successBackground};
    color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.successText};
    border-color: transparent;
  `,
  warning: css`
    background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.warningBackground};
    color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.warningText};
    border-color: transparent;
  `,
  error: css`
    background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.errorBackground};
    color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.errorText};
    border-color: transparent;
  `,
};

export const StyledBadge = styled.span<{ $tone: BadgeTone }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: ${({ theme }: { theme: DefaultTheme }) => theme.radii.pill};
  border: 1px solid transparent;
  font-size: ${({ theme }: { theme: DefaultTheme }) => theme.fontSizes.xs};
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;

  ${({ $tone }) => toneStyles[$tone]}
`;
