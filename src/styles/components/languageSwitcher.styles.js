import styled from 'styled-components'

export const Wrapper = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.surfaceOverlay};
`

export const GlobeIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  color: ${({ theme }) => theme.colors.textMuted};
`

export const LangButton = styled.button`
  padding: 5px 10px;
  min-height: 30px;
  border-radius: ${({ theme }) => theme.radii.pill};
  border: none;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    background ${({ theme }) => theme.transitions.default},
    color ${({ theme }) => theme.transitions.default};
  background: ${({ theme, $active }) => ($active ? theme.colors.accent : 'transparent')};
  color: ${({ $active }) => ($active ? '#fff' : 'inherit')};

  &:hover {
    background: ${({ theme, $active }) => ($active ? theme.colors.accentHover : theme.colors.surfaceMuted)};
    color: ${({ theme, $active }) => ($active ? '#fff' : theme.colors.textStrong)};
  }
`