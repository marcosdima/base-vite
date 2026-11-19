import styled, { type DefaultTheme } from 'styled-components';

export const FieldWrapper = styled.div<{ $fullWidth: boolean }>`
  display: grid;
  gap: 6px;
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
`;

export const FieldLabel = styled.label`
  font-size: ${({ theme }: { theme: DefaultTheme }) => theme.fontSizes.sm};
  font-weight: 600;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.text};
`;

export const InputShell = styled.div<{ $hasIcon: boolean; $hasError: boolean }>`
  display: grid;
  grid-template-columns: ${({ $hasIcon }) => ($hasIcon ? '20px minmax(0, 1fr)' : 'minmax(0, 1fr)')};
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  min-height: 46px;
  border: 1px solid
    ${({ theme, $hasError }: { theme: DefaultTheme; $hasError: boolean }) =>
      $hasError ? theme.colors.danger : theme.colors.borderStrong};
  border-radius: ${({ theme }: { theme: DefaultTheme }) => theme.radii.small};
  background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.surfaceMuted};
  transition:
    border-color ${({ theme }: { theme: DefaultTheme }) => theme.transitions.default},
    box-shadow ${({ theme }: { theme: DefaultTheme }) => theme.transitions.default};

  &:focus-within {
    border-color: ${({ theme, $hasError }: { theme: DefaultTheme; $hasError: boolean }) =>
      $hasError ? theme.colors.danger : theme.colors.accent};
    box-shadow: 0 0 0 3px ${({ theme }: { theme: DefaultTheme }) => theme.colors.focusRing};
  }

  svg {
    color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.textSubtle};
  }
`;

export const StyledInput = styled.input`
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.textStrong};
  font-size: ${({ theme }: { theme: DefaultTheme }) => theme.fontSizes.sm};

  &::placeholder {
    color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.textSubtle};
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
`;

export const HelperText = styled.p<{ $isError?: boolean }>`
  margin: 0;
  font-size: ${({ theme }: { theme: DefaultTheme }) => theme.fontSizes.xs};
  color: ${({ theme, $isError }: { theme: DefaultTheme; $isError?: boolean }) =>
    $isError ? theme.colors.errorText : theme.colors.textMuted};
`;
