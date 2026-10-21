import styled, { type DefaultTheme } from 'styled-components';
import { Link } from 'react-router-dom';
import { Eyebrow, Paragraph, SectionTitle } from '../typography';

export const Page = styled.section`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
`;

export const Content = styled.div`
  text-align: center;
  display: grid;
  gap: 12px;
`;

export const Code = styled(Eyebrow)`
  justify-self: center;
`;

export const ErrorTitle = styled(SectionTitle)`
  font-size: 1.5rem;
`;

export const Description = styled(Paragraph)``;

export const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 8px;
  padding: 12px 24px;
  border-radius: ${({ theme }: { theme: DefaultTheme }) => theme.radii.small};
  background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.accent};
  color: #fff;
  font-weight: 600;
  font-size: 0.95rem;
  transition: background ${({ theme }: { theme: DefaultTheme }) => theme.transitions.default};

  &:hover {
    background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.accentHover};
  }
`;