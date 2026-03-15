import styled, { css } from 'styled-components'

const titleStyles = css`
  margin: 0;
  color: ${({ theme }) => theme.colors.textStrong};
`

export const Eyebrow = styled.p`
  margin: 0;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.accent};
`

export const Title = styled.h1`
  ${titleStyles};
  font-size: clamp(2rem, 4vw, 3.25rem);
  font-weight: 700;
  line-height: 1.05;
`

export const SectionTitle = styled.h2`
  ${titleStyles};
  font-size: clamp(1.45rem, 2vw, 1.9rem);
  font-weight: 700;
  line-height: 1.1;
`

export const Subtitle = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.98rem;
  line-height: 1.6;
`

export const Paragraph = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 1rem;
  line-height: 1.65;
`

export const Caption = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textMuted};
`