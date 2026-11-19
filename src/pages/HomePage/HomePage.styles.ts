import styled from 'styled-components';
import { Paragraph, SectionTitle } from '@/styles/typography';

export const Page = styled.section`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
`;

export const Placeholder = styled.div`
  text-align: center;
  display: grid;
  gap: 8px;
`;

export const HomeTitle = styled(SectionTitle)`
  font-size: 1.5rem;
`;

export const HomeParagraph = styled(Paragraph)``;
