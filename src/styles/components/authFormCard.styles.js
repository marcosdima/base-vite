import styled from 'styled-components'
import { motion } from 'motion/react'
import { Caption, Eyebrow, SectionTitle, Subtitle } from '../typography'

export const Card = styled(motion.section)`
  width: min(100%, 480px);
  margin: 48px auto;
  padding: 36px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.large};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: ${({ theme }) => theme.shadows.card};
  display: grid;
  gap: 24px;

  @media (max-width: 640px) {
    padding: 28px 22px;
    margin: 28px auto;
  }
`

export const Header = styled.div`
  display: grid;
  gap: 8px;
`

export const CardEyebrow = styled(Eyebrow)``

export const CardTitle = styled(SectionTitle)`
  font-size: 1.75rem;
`

export const CardSubtitle = styled(Subtitle)`
  font-size: 0.95rem;
`

export const Form = styled.form`
  display: grid;
  gap: 16px;
`

export const FieldLabel = styled.label`
  display: grid;
  gap: 6px;

  > span {
    font-size: 0.875rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
  }
`

export const FieldInput = styled.div`
  display: grid;
  grid-template-columns: 20px minmax(0, 1fr);
  align-items: center;
  gap: 12px;
  padding: 0 14px;
  min-height: 52px;
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: ${({ theme }) => theme.radii.small};
  background: ${({ theme }) => theme.colors.surfaceMuted};
  transition: border-color ${({ theme }) => theme.transitions.default};

  &:focus-within {
    border-color: ${({ theme }) => theme.colors.accent};
  }

  svg {
    color: ${({ theme }) => theme.colors.textSubtle};
  }

  input {
    width: 100%;
    border: none;
    outline: none;
    background: transparent;
    color: ${({ theme }) => theme.colors.textStrong};

    &::placeholder {
      color: ${({ theme }) => theme.colors.textSubtle};
    }
  }
`

export const Feedback = styled.p`
  padding: 12px 14px;
  border-radius: 10px;
  font-size: 0.9rem;
  background: ${({ theme, $type }) => {
    if ($type === 'error') {
      return theme.colors.errorBackground
    }

    if ($type === 'success') {
      return theme.colors.successBackground
    }

    return theme.colors.neutralBackground
  }};
  color: ${({ theme, $type }) => {
    if ($type === 'error') {
      return theme.colors.errorText
    }

    if ($type === 'success') {
      return theme.colors.successText
    }

    return theme.colors.neutralText
  }};
`

export const SubmitButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  min-height: 50px;
  border: none;
  border-radius: ${({ theme }) => theme.radii.small};
  background: ${({ theme }) => theme.colors.accent};
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background ${({ theme }) => theme.transitions.default},
    transform ${({ theme }) => theme.transitions.default};

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.accentHover};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

export const Spin = styled.span`
  display: inline-flex;
  animation: spin 0.9s linear infinite;

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }
`

export const Footer = styled(Caption)`
  text-align: center;

  a {
    color: ${({ theme }) => theme.colors.accent};
    font-weight: 600;
  }
`