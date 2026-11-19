import styled, { type DefaultTheme } from 'styled-components';
import type { ThemeSpacing } from '@/styles/theme';

export type StackGap = keyof ThemeSpacing;

export const StyledStack = styled.div<{
  $direction: 'row' | 'column';
  $gap: StackGap;
  $align?: string;
  $justify?: string;
  $wrap: boolean;
}>`
  display: flex;
  flex-direction: ${({ $direction }) => $direction};
  gap: ${({ theme, $gap }: { theme: DefaultTheme; $gap: StackGap }) => theme.spacing[$gap]};
  align-items: ${({ $align }) => $align ?? 'stretch'};
  justify-content: ${({ $justify }) => $justify ?? 'flex-start'};
  flex-wrap: ${({ $wrap }) => ($wrap ? 'wrap' : 'nowrap')};
`;
