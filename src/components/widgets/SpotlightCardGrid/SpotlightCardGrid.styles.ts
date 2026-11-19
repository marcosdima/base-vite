import { Link } from 'react-router-dom';
import styled, { type DefaultTheme } from 'styled-components';

export const GridContainer = styled.div`
  --pad-grid-gap: clamp(16px, 2vw, 28px);
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
`;

export const CardsGrid = styled.div<{ $count: number }>`
  position: relative;
  display: grid;
  grid-template-columns: repeat(${({ $count }) => Math.max(1, $count)}, minmax(0, 1fr));
  gap: var(--pad-grid-gap);
  width: 100%;
  align-items: stretch;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

export const SlidingShadow = styled.div<{
  $activeIndex: number;
  $count: number;
  $visible: boolean;
  $accentColor: string;
}>`
  position: absolute;
  top: 0;
  left: 0;
  width: ${({ $count }) =>
    `calc((100% - ${Math.max(0, $count - 1)} * var(--pad-grid-gap)) / ${Math.max(1, $count)})`};
  height: 100%;
  border-radius: ${({ theme }: { theme: DefaultTheme }) => theme.radii.large};
  pointer-events: none;
  z-index: 0;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transform: ${({ $activeIndex }) =>
    `translateX(calc(${$activeIndex} * (100% + var(--pad-grid-gap)))) translateY(-6px) scale(1.01)`};
  background: radial-gradient(
    circle at center,
    ${({ $accentColor }) => `${$accentColor}30`} 0%,
    ${({ $accentColor }) => `${$accentColor}12`} 60%,
    transparent 85%
  );
  box-shadow:
    0 0 24px ${({ $accentColor }) => `${$accentColor}40`},
    0 2px 10px ${({ $accentColor }) => `${$accentColor}26`};
  border: 1.5px solid ${({ $accentColor }) => `${$accentColor}73`};
  transition:
    transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 0.25s ease,
    background 0.35s ease,
    box-shadow 0.35s ease,
    border-color 0.35s ease;

  @media (max-width: 960px) {
    width: 100%;
    height: ${({ $count }) =>
      `calc((100% - ${Math.max(0, $count - 1)} * var(--pad-grid-gap)) / ${Math.max(1, $count)})`};
    transform: ${({ $activeIndex }) =>
      `translateY(calc(${$activeIndex} * (100% + var(--pad-grid-gap)))) scale(1.01)`};
  }
`;

export const CardLink = styled(Link)<{ $hovered: boolean; $accentColor: string }>`
  --pad-accent: ${({ $accentColor }) => $accentColor};
  --pad-accent-bg: ${({ $accentColor }) => `${$accentColor}1f`};
  --pad-accent-border: ${({ $accentColor }) => `${$accentColor}59`};

  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  text-align: center;
  padding: 28px 22px;
  border-radius: ${({ theme }: { theme: DefaultTheme }) => theme.radii.large};
  border: 1px solid
    ${({ theme, $hovered }: { theme: DefaultTheme; $hovered: boolean }) =>
      $hovered ? 'var(--pad-accent)' : theme.colors.border};
  background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.surface};
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.text};
  text-decoration: none;
  cursor: pointer;
  overflow: hidden;
  height: 100%;
  box-sizing: border-box;
  transform: ${({ $hovered }) => ($hovered ? 'translateY(-6px) scale(1.01)' : 'none')};
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: ${({ theme }: { theme: DefaultTheme }) => theme.shadows.card};

  .pad-top-tag {
    padding: 4px 10px;
    border-radius: ${({ theme }: { theme: DefaultTheme }) => theme.radii.pill};
    background: var(--pad-accent-bg);
    border: 1px solid var(--pad-accent-border);
    color: var(--pad-accent);
    font-size: ${({ theme }: { theme: DefaultTheme }) => theme.fontSizes.xs};
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .pad-icon-wrapper {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: ${({ theme }: { theme: DefaultTheme }) => theme.radii.medium};
    background: var(--pad-accent-bg);
    color: var(--pad-accent);
    font-size: 1.35rem;
  }

  .pad-title {
    margin: 0;
    color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.textStrong};
    font-size: ${({ theme }: { theme: DefaultTheme }) => theme.fontSizes.lg};
    font-weight: 700;
  }

  .pad-desc {
    margin: 0;
    color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.textMuted};
    font-size: ${({ theme }: { theme: DefaultTheme }) => theme.fontSizes.sm};
    line-height: 1.5;
  }

  .pad-action {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--pad-accent);
    font-size: ${({ theme }: { theme: DefaultTheme }) => theme.fontSizes.sm};
    font-weight: 600;
  }

  .pad-arrow {
    transition: transform ${({ theme }: { theme: DefaultTheme }) => theme.transitions.default};
    transform: ${({ $hovered }) => ($hovered ? 'translateX(4px)' : 'none')};
  }
`;
