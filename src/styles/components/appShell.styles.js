import styled, { css } from 'styled-components'
import { motion } from 'motion/react'
import { NavLink } from 'react-router-dom'

export const Shell = styled.div`
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
  padding: 24px 0 48px;
`

export const Topbar = styled(motion.header)`
  position: sticky;
  top: 16px;
  z-index: 20;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 14px 20px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.medium};
  background: ${({ theme }) => theme.colors.surfaceOverlay};
  backdrop-filter: blur(14px);
  margin-bottom: 24px;

  @media (max-width: 700px) {
    flex-direction: column;
    align-items: flex-start;
    position: static;
  }
`

export const Brand = styled.span`
  font-weight: 700;
  font-size: 1.05rem;
  color: ${({ theme }) => theme.colors.textStrong};
  white-space: nowrap;
`

export const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`

export const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
`

const pillBase = css`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  min-height: 38px;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: transparent;
  color: ${({ theme }) => theme.colors.textMuted};
  text-decoration: none;
  cursor: pointer;
  transition:
    background ${({ theme }) => theme.transitions.default},
    color ${({ theme }) => theme.transitions.default},
    border-color ${({ theme }) => theme.transitions.default};

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceMuted};
    color: ${({ theme }) => theme.colors.textStrong};
  }
`

export const StyledNavLink = styled(NavLink)`
  ${pillBase}

  &.active {
    background: ${({ theme }) => theme.colors.accentSoft};
    border-color: ${({ theme }) => theme.colors.accentBorder};
    color: ${({ theme }) => theme.colors.accent};
  }
`

export const GhostButton = styled.button`
  ${pillBase}
`