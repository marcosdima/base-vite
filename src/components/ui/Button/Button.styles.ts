import styled, { css, keyframes, type DefaultTheme } from 'styled-components';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const sizeStyles: Record<ButtonSize, ReturnType<typeof css>> = {
  sm: css`
    min-height: 34px;
    padding: 6px 12px;
    font-size: ${({ theme }: { theme: DefaultTheme }) => theme.fontSizes.xs};
    border-radius: ${({ theme }: { theme: DefaultTheme }) => theme.radii.small};
  `,
  md: css`
    min-height: 42px;
    padding: 10px 16px;
    font-size: ${({ theme }: { theme: DefaultTheme }) => theme.fontSizes.sm};
    border-radius: ${({ theme }: { theme: DefaultTheme }) => theme.radii.small};
  `,
  lg: css`
    min-height: 48px;
    padding: 12px 22px;
    font-size: ${({ theme }: { theme: DefaultTheme }) => theme.fontSizes.md};
    border-radius: ${({ theme }: { theme: DefaultTheme }) => theme.radii.small};
  `,
};

const variantStyles: Record<ButtonVariant, ReturnType<typeof css>> = {
  primary: css`
    border: 1px solid transparent;
    background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.accent};
    color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.accentText};

    &:hover:not(:disabled) {
      background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.accentHover};
    }
  `,
  secondary: css`
    border: 1px solid ${({ theme }: { theme: DefaultTheme }) => theme.colors.borderStrong};
    background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.surfaceMuted};
    color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.textStrong};

    &:hover:not(:disabled) {
      background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.surface};
      border-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.accent};
    }
  `,
  ghost: css`
    border: 1px solid ${({ theme }: { theme: DefaultTheme }) => theme.colors.border};
    background: transparent;
    color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.textMuted};

    &:hover:not(:disabled) {
      background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.surfaceMuted};
      color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.textStrong};
    }
  `,
  danger: css`
    border: 1px solid transparent;
    background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.danger};
    color: #ffffff;

    &:hover:not(:disabled) {
      background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.dangerHover};
    }
  `,
};

export const StyledButton = styled.button<{
  $variant: ButtonVariant;
  $size: ButtonSize;
  $fullWidth: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition:
    background ${({ theme }: { theme: DefaultTheme }) => theme.transitions.default},
    border-color ${({ theme }: { theme: DefaultTheme }) => theme.transitions.default},
    color ${({ theme }: { theme: DefaultTheme }) => theme.transitions.default},
    box-shadow ${({ theme }: { theme: DefaultTheme }) => theme.transitions.default};

  ${({ $size }) => sizeStyles[$size]}
  ${({ $variant }) => variantStyles[$variant]}

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px ${({ theme }: { theme: DefaultTheme }) => theme.colors.focusRing};
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
`;

export const ButtonSpinner = styled.span`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid currentColor;
  border-right-color: transparent;
  animation: ${spin} 0.7s linear infinite;
`;
