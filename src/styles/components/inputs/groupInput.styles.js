import styled from 'styled-components'

export const GroupInputWrap = styled.div`
  display: grid;
  gap: 12px;
`

export const GroupColumns = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`

export const GroupColumn = styled.section`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.small};
  background: ${({ theme }) => theme.colors.surfaceMuted};
  padding: 10px;
  min-height: 176px;
  display: grid;
  gap: 10px;
`

export const GroupNameInput = styled.input`
  width: 100%;
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: ${({ theme }) => theme.radii.small};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  padding: 8px 10px;
  font-size: 0.85rem;
`

export const KeysList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

export const KeyItem = styled.li`
  border: 1px dashed ${({ theme }) => theme.colors.borderStrong};
  border-radius: ${({ theme }) => theme.radii.small};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.82rem;
  padding: 8px 10px;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
`

export const EmptyState = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSubtle};
  font-size: 0.8rem;
`

export const DragHint = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSubtle};
  font-size: 0.75rem;
`
