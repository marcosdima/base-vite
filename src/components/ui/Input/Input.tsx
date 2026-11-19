import { forwardRef, useId } from 'react';
import { FieldLabel, FieldWrapper, HelperText, InputShell, StyledInput } from './Input.styles';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { id, label, hint, error, leftIcon, fullWidth = true, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const helperId = `${inputId}-helper`;
  const hasHelper = Boolean(error || hint);

  return (
    <FieldWrapper $fullWidth={fullWidth}>
      {label ? <FieldLabel htmlFor={inputId}>{label}</FieldLabel> : null}

      <InputShell $hasIcon={Boolean(leftIcon)} $hasError={Boolean(error)}>
        {leftIcon ? <span aria-hidden="true">{leftIcon}</span> : null}
        <StyledInput
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={hasHelper ? helperId : undefined}
          {...props}
        />
      </InputShell>

      {error ? (
        <HelperText id={helperId} role="alert" $isError>
          {error}
        </HelperText>
      ) : hint ? (
        <HelperText id={helperId}>{hint}</HelperText>
      ) : null}
    </FieldWrapper>
  );
});
