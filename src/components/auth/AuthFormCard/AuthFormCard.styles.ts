import { motion } from 'motion/react';
import styled, { type DefaultTheme } from 'styled-components';
import { Caption, Eyebrow, SectionTitle, Subtitle } from '@/styles/typography';

export const AuthCard = styled(motion.section)`
  width: min(100%, 480px);
  margin: 48px auto;
  padding: 36px;
  border: 1px solid ${({ theme }: { theme: DefaultTheme }) => theme.colors.border};
  border-radius: ${({ theme }: { theme: DefaultTheme }) => theme.radii.large};
  background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.surface};
  box-shadow: ${({ theme }: { theme: DefaultTheme }) => theme.shadows.card};
  display: grid;
  gap: 24px;

  @media (max-width: 640px) {
    padding: 28px 22px;
    margin: 28px auto;
  }
`;

export const Header = styled.div`
  display: grid;
  gap: 8px;
`;

export const CardEyebrow = styled(Eyebrow)``;

export const CardTitle = styled(SectionTitle)`
  font-size: 1.75rem;
`;

export const CardSubtitle = styled(Subtitle)`
  font-size: 0.95rem;
`;

export const Form = styled.form`
  display: grid;
  gap: 16px;
`;

export const Feedback = styled.p<{ $type?: 'error' | 'success' | 'neutral' }>`
  padding: 12px 14px;
  border-radius: 10px;
  font-size: 0.9rem;
  background: ${({
    theme,
    $type,
  }: {
    theme: DefaultTheme;
    $type?: 'error' | 'success' | 'neutral';
  }) => {
    if ($type === 'error') return theme.colors.errorBackground;
    if ($type === 'success') return theme.colors.successBackground;
    return theme.colors.neutralBackground;
  }};
  color: ${({ theme, $type }: { theme: DefaultTheme; $type?: 'error' | 'success' | 'neutral' }) => {
    if ($type === 'error') return theme.colors.errorText;
    if ($type === 'success') return theme.colors.successText;
    return theme.colors.neutralText;
  }};
`;

export const Footer = styled(Caption)`
  text-align: center;

  a {
    color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.accent};
    font-weight: 600;
  }
`;
