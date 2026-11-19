import { forwardRef } from 'react';
import { ButtonSpinner, StyledButton, type ButtonSize, type ButtonVariant } from './Button.styles';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    isLoading = false,
    fullWidth = false,
    disabled,
    type = 'button',
    children,
    ...props
  },
  ref,
) {
  return (
    <StyledButton
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      {...props}
    >
      {isLoading ? <ButtonSpinner aria-hidden="true" /> : null}
      {children}
    </StyledButton>
  );
});
