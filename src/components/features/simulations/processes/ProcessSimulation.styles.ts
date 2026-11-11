import styled, { type DefaultTheme } from 'styled-components';
import { SectionTitle, Subtitle } from '../../../../styles/typography';

export const ProcessViewContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
`;

export const ViewHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const ViewTitle = styled(SectionTitle)`
  font-size: 1.5rem;
`;

export const ViewDescription = styled(Subtitle)`
  font-size: 0.95rem;
  max-width: 75ch;
`;

export const NarrationCard = styled.div`
  background: #0f172a;
  color: #e2e8f0;
  border: 1px solid #1e293b;
  border-radius: ${({ theme }: { theme: DefaultTheme }) => theme.radii.medium};
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
`;

export const NarrationHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const NarrationTag = styled.span<{ $isError?: boolean }>`
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${({ $isError }) => ($isError ? '#f87171' : '#38bdf8')};
  background: ${({ $isError }) => ($isError ? 'rgba(239, 68, 68, 0.15)' : 'rgba(56, 189, 248, 0.15)')};
  padding: 4px 10px;
  border-radius: 999px;
`;

export const NarrationText = styled.p`
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.6;
  color: #cbd5e1;
`;

export const ModeTabBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding: 12px 18px;
  background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.surface};
  border: 1px solid ${({ theme }: { theme: DefaultTheme }) => theme.colors.border};
  border-radius: ${({ theme }: { theme: DefaultTheme }) => theme.radii.medium};
`;

export const TabButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

export const ModeTab = styled.button<{ $active: boolean }>`
  padding: 6px 16px;
  border-radius: ${({ theme }: { theme: DefaultTheme }) => theme.radii.pill};
  border: 1px solid
    ${({ theme, $active }: { theme: DefaultTheme; $active: boolean }) =>
      $active ? theme.colors.accent : theme.colors.border};
  background: ${({ theme, $active }: { theme: DefaultTheme; $active: boolean }) =>
    $active ? theme.colors.accentSoft : 'transparent'};
  color: ${({ theme, $active }: { theme: DefaultTheme; $active: boolean }) =>
    $active ? theme.colors.accent : theme.colors.text};
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all ${({ theme }: { theme: DefaultTheme }) => theme.transitions.default};
`;

export const DiagramCard = styled.div`
  position: relative;
  background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.surface};
  border: 1px solid ${({ theme }: { theme: DefaultTheme }) => theme.colors.border};
  border-radius: ${({ theme }: { theme: DefaultTheme }) => theme.radii.medium};
  box-shadow: ${({ theme }: { theme: DefaultTheme }) => theme.shadows.card};
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const DiagramLayout = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: auto auto;
  gap: 16px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

export const StateNode = styled.div<{ $state: string; $active: boolean }>`
  background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.surfaceMuted};
  border: 2px solid
    ${({ $active, theme }: { $active: boolean; theme: DefaultTheme }) =>
      $active ? theme.colors.accent : theme.colors.border};
  border-radius: ${({ theme }: { theme: DefaultTheme }) => theme.radii.medium};
  padding: 14px;
  min-height: 140px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: all 0.2s ease;
  box-shadow: ${({ $active }) => ($active ? '0 0 14px 2px rgba(59, 130, 246, 0.25)' : 'none')};

  ${({ $state }) =>
    $state === 'WAITING' &&
    `
    grid-column: 2 / span 2;
    @media (max-width: 900px) {
      grid-column: 1 / span 2;
    }
  `}
`;

export const StateNodeHeader = styled.div<{ $state: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: ${({ $state }) => {
    switch ($state) {
      case 'NEW':
        return '#0284c7';
      case 'READY':
        return '#8b5cf6';
      case 'RUNNING':
        return '#10b981';
      case 'WAITING':
        return '#f59e0b';
      case 'TERMINATED':
        return '#64748b';
      default:
        return '#1e293b';
    }
  }};
`;

export const TokenList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex: 1;
  align-content: flex-start;
`;

export const ProcessToken = styled.div<{ $selected: boolean; $running: boolean }>`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: ${({ $running }) => ($running ? '#10b981' : '#2563eb')};
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: ${({ $selected }) =>
    $selected ? '0 0 0 3px #f59e0b, 0 4px 10px rgba(0,0,0,0.3)' : '0 2px 6px rgba(0,0,0,0.15)'};
  transform: ${({ $selected }) => ($selected ? 'scale(1.12)' : 'scale(1)')};
  transition: all 0.2s ease;
  user-select: none;

  &:hover {
    transform: scale(1.12);
  }
`;

export const PcbFloatingCard = styled.div`
  background: #0f172a;
  color: #f8fafc;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4);
  max-width: 300px;
  font-size: 0.85rem;
`;

export const PcbRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

export const PcbValControl = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const PcbStepBtn = styled.button`
  width: 22px;
  height: 22px;
  border-radius: 4px;
  border: 1px solid #475569;
  background: #1e293b;
  color: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: bold;
  font-size: 0.85rem;

  &:hover {
    background: #334155;
  }
`;

export const SchedFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding-top: 14px;
  border-top: 1px solid ${({ theme }: { theme: DefaultTheme }) => theme.colors.border};
`;

export const AlgoChipsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const AlgoChip = styled.button<{ $active: boolean }>`
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 0.825rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid
    ${({ $active, theme }: { $active: boolean; theme: DefaultTheme }) =>
      $active ? theme.colors.accent : theme.colors.border};
  background: ${({ $active, theme }: { $active: boolean; theme: DefaultTheme }) =>
    $active ? theme.colors.accent : theme.colors.surfaceMuted};
  color: ${({ $active }: { $active: boolean }) => ($active ? '#ffffff' : 'inherit')};

  &:hover {
    border-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.accent};
  }
`;

export const ActionButtonsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

export const ActionButton = styled.button<{ $variant?: 'primary' | 'danger' | 'warning' }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.825rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;

  ${({ $variant, theme }: { $variant?: 'primary' | 'danger' | 'warning'; theme: DefaultTheme }) => {
    switch ($variant) {
      case 'primary':
        return `
          background: ${theme.colors.accent};
          color: #ffffff;
          &:hover:not(:disabled) { background: ${theme.colors.accentHover}; }
        `;
      case 'danger':
        return `
          background: #ef4444;
          color: #ffffff;
          &:hover:not(:disabled) { background: #dc2626; }
        `;
      case 'warning':
        return `
          background: #f59e0b;
          color: #ffffff;
          &:hover:not(:disabled) { background: #d97706; }
        `;
      default:
        return `
          background: ${theme.colors.surfaceMuted};
          border-color: ${theme.colors.border};
          color: ${theme.colors.textStrong};
          &:hover:not(:disabled) { background: ${theme.colors.accentSoft}; color: ${theme.colors.accent}; }
        `;
    }
  }}

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;
