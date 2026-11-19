import styled, { css, type DefaultTheme } from 'styled-components';

export type CardVariant = 'default' | 'muted' | 'elevated';
export type CardPadding = 'sm' | 'md' | 'lg';

const paddingMap: Record<CardPadding, string> = {
  sm: '16px',
  md: '24px',
  lg: '32px',
};

const variantStyles: Record<CardVariant, ReturnType<typeof css>> = {
  default: css`
    background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.surface};
    border: 1px solid ${({ theme }: { theme: DefaultTheme }) => theme.colors.border};
    box-shadow: none;
  `,
  muted: css`
    background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.surfaceMuted};
    border: 1px solid ${({ theme }: { theme: DefaultTheme }) => theme.colors.border};
    box-shadow: none;
  `,
  elevated: css`
    background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.surface};
    border: 1px solid ${({ theme }: { theme: DefaultTheme }) => theme.colors.border};
    box-shadow: ${({ theme }: { theme: DefaultTheme }) => theme.shadows.card};
  `,
};

export const StyledCard = styled.div<{ $variant: CardVariant; $padding: CardPadding }>`
  border-radius: ${({ theme }: { theme: DefaultTheme }) => theme.radii.medium};
  padding: ${({ $padding }) => paddingMap[$padding]};
  ${({ $variant }) => variantStyles[$variant]}
`;
