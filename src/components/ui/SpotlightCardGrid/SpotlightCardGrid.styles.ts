import { Link } from 'react-router-dom';
import styled from 'styled-components';

export const GridContainer = styled.div`
  --pad-grid-gap: clamp(16px, 2vw, 28px);
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(16px, 2.5vh, 28px) clamp(16px, 2.5vw, 32px);
  box-sizing: border-box;
  overflow: hidden;

  @media (max-width: 960px) {
    height: auto;
    min-height: 100vh;
    overflow-y: auto;
  }
`;

export const CardsGrid = styled.div<{ $count: number }>`
  position: relative;
  display: grid;
  grid-template-columns: repeat(${({ $count }) => Math.max(1, $count)}, 1fr);
  gap: var(--pad-grid-gap);
  width: 100%;
  max-width: 1540px;
  height: 100%;
  align-items: stretch;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
    height: auto;
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
  border-radius: 28px;
  pointer-events: none;
  z-index: 0;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transform: ${({ $activeIndex }) =>
    `translateX(calc(${$activeIndex} * (100% + var(--pad-grid-gap)))) translateY(-8px) scale(1.015)`};
  background: radial-gradient(
    circle at center,
    ${({ $accentColor }) => `${$accentColor}40`} 0%,
    ${({ $accentColor }) => `${$accentColor}14`} 60%,
    transparent 85%
  );
  box-shadow:
    0 0 28px ${({ $accentColor }) => `${$accentColor}59`},
    0 2px 10px ${({ $accentColor }) => `${$accentColor}33`};
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
      `translateY(calc(${$activeIndex} * (100% + var(--pad-grid-gap)))) scale(1.02)`};
  }
`;

export const CardLink = styled(Link)<{ $hovered: boolean; $accentColor: string }>`
  --pad-accent: ${({ $accentColor }) => $accentColor};
  --pad-accent-bg: ${({ $accentColor }) => `${$accentColor}1f`};
  --pad-accent-border: ${({ $accentColor }) => `${$accentColor}59`};
  --pad-glow: ${({ $accentColor }) => `${$accentColor}4d`};

  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  text-align: center;
  padding: clamp(20px, 3.2vh, 40px) clamp(16px, 2vw, 28px);
  border-radius: 28px;
  border: 1px solid ${({ $hovered }) => ($hovered ? 'var(--pad-accent)' : '#1f293d')};
  background: linear-gradient(180deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%);
  backdrop-filter: blur(14px);
  text-decoration: none;
  cursor: pointer;
  overflow: hidden;
  height: 100%;
  box-sizing: border-box;
  transform: ${({ $hovered }) => ($hovered ? 'translateY(-8px) scale(1.015)' : 'none')};
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 10px 32px rgba(0, 0, 0, 0.45);

  @media (max-width: 960px) {
    min-height: 260px;
  }
`;
