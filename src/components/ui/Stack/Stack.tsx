import { StyledStack, type StackGap } from './Stack.styles';

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'column';
  gap?: StackGap;
  align?: React.CSSProperties['alignItems'];
  justify?: React.CSSProperties['justifyContent'];
  wrap?: boolean;
}

export function Stack({
  direction = 'column',
  gap = 'component',
  align,
  justify,
  wrap = false,
  children,
  ...props
}: StackProps) {
  return (
    <StyledStack
      $direction={direction}
      $gap={gap}
      $align={align}
      $justify={justify}
      $wrap={wrap}
      {...props}
    >
      {children}
    </StyledStack>
  );
}
