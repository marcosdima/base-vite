import { forwardRef } from 'react';
import { StyledCard, type CardPadding, type CardVariant } from './Card.styles';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant = 'default', padding = 'md', children, ...props },
  ref,
) {
  return (
    <StyledCard ref={ref} $variant={variant} $padding={padding} {...props}>
      {children}
    </StyledCard>
  );
});
