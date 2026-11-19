import { StyledBadge, type BadgeTone } from './Badge.styles';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export function Badge({ tone = 'neutral', children, ...props }: BadgeProps) {
  return (
    <StyledBadge $tone={tone} {...props}>
      {children}
    </StyledBadge>
  );
}
