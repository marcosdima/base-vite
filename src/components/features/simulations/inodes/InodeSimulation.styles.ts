import styled, { type DefaultTheme } from 'styled-components';
import { SectionTitle, Subtitle } from '../../../../styles/typography';

export const InodeViewContainer = styled.div`
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

export const TopControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding: 14px 18px;
  background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.surface};
  border: 1px solid ${({ theme }: { theme: DefaultTheme }) => theme.colors.border};
  border-radius: ${({ theme }: { theme: DefaultTheme }) => theme.radii.medium};
  box-shadow: ${({ theme }: { theme: DefaultTheme }) => theme.shadows.card};
`;

export const PositionSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

export const ChipGroup = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

export const PresetChip = styled.button<{ $active: boolean }>`
  padding: 4px 10px;
  border-radius: ${({ theme }: { theme: DefaultTheme }) => theme.radii.pill};
  border: 1px solid
    ${({ theme, $active }: { theme: DefaultTheme; $active: boolean }) =>
      $active ? theme.colors.accent : theme.colors.border};
  background: ${({ theme, $active }: { theme: DefaultTheme; $active: boolean }) =>
    $active ? theme.colors.accentSoft : 'transparent'};
  color: ${({ theme, $active }: { theme: DefaultTheme; $active: boolean }) =>
    $active ? theme.colors.accent : theme.colors.text};
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all ${({ theme }: { theme: DefaultTheme }) => theme.transitions.default};

  &:hover {
    border-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.accent};
  }
`;

export const SeedButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: ${({ theme }: { theme: DefaultTheme }) => theme.radii.small};
  border: 1px solid ${({ theme }: { theme: DefaultTheme }) => theme.colors.border};
  background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.surfaceMuted};
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.textStrong};
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all ${({ theme }: { theme: DefaultTheme }) => theme.transitions.default};

  &:hover {
    background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.accentSoft};
    border-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.accentBorder};
    color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.accent};
  }
`;

export const InodeGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(280px, 320px) minmax(360px, 1fr);
  gap: 20px;
  align-items: start;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

export const InodeCard = styled.div`
  background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.surface};
  border: 1px solid ${({ theme }: { theme: DefaultTheme }) => theme.colors.border};
  border-radius: ${({ theme }: { theme: DefaultTheme }) => theme.radii.medium};
  box-shadow: ${({ theme }: { theme: DefaultTheme }) => theme.shadows.card};
  overflow: hidden;
`;

export const InodeCardHeader = styled.div`
  padding: 14px 18px;
  background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.surfaceMuted};
  border-bottom: 1px solid ${({ theme }: { theme: DefaultTheme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const PointerList = styled.div`
  display: flex;
  flex-direction: column;
  padding: 8px 0;
  max-height: 480px;
  overflow-y: auto;
`;

export const PointerRow = styled.div<{ $highlighted: boolean; $routeType?: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  font-size: 0.825rem;
  font-family: monospace;
  background: ${({ $highlighted }) => ($highlighted ? 'rgba(59, 130, 246, 0.12)' : 'transparent')};
  border-left: 3px solid
    ${({ $highlighted, theme }: { $highlighted: boolean; theme: DefaultTheme }) =>
      $highlighted ? theme.colors.accent : 'transparent'};
  cursor: pointer;
  transition: background ${({ theme }: { theme: DefaultTheme }) => theme.transitions.default};

  &:hover {
    background: rgba(59, 130, 246, 0.08);
  }
`;

export const DiskPanel = styled.div`
  background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.surface};
  border: 1px solid ${({ theme }: { theme: DefaultTheme }) => theme.colors.border};
  border-radius: ${({ theme }: { theme: DefaultTheme }) => theme.radii.medium};
  box-shadow: ${({ theme }: { theme: DefaultTheme }) => theme.shadows.card};
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const DiskGridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 5px;
  width: 100%;
`;

export const DiskCell = styled.div<{
  $role: string;
  $highlighted: boolean;
  $selected: boolean;
}>`
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 0.725rem;
  font-family: monospace;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.18s ease;
  user-select: none;
  box-shadow: ${({ $highlighted }) => ($highlighted ? '0 0 10px 2px #3b82f6' : 'none')};
  transform: ${({ $highlighted }) => ($highlighted ? 'scale(1.1)' : 'scale(1)')};
  z-index: ${({ $highlighted }) => ($highlighted ? 2 : 1)};

  /* Color roles */
  background: ${({ $role, $highlighted }) => {
    if ($highlighted) return '#2563eb';
    switch ($role) {
      case 'direct':
        return '#0284c7';
      case 'index_simple':
        return '#8b5cf6';
      case 'indirect_simple_data':
        return '#a78bfa';
      case 'index_double_1':
        return '#d97706';
      case 'index_double_2':
        return '#f59e0b';
      case 'indirect_double_data':
        return '#fbbf24';
      case 'index_triple_1':
      case 'index_triple_sub':
        return '#dc2626';
      case 'indirect_triple_data':
        return '#f87171';
      default:
        return '#334155'; // free
    }
  }};

  color: #ffffff;
  border: 1px solid ${({ $selected }) => ($selected ? '#f8fafc' : 'rgba(255, 255, 255, 0.15)')};
`;

export const CarouselCard = styled.div`
  background: #0f172a;
  color: #e2e8f0;
  border-radius: ${({ theme }: { theme: DefaultTheme }) => theme.radii.medium};
  border: 1px solid #1e293b;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const StepProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: #334155;
  border-radius: 3px;
  overflow: hidden;
`;

export const StepProgressFill = styled.div<{ $percent: number }>`
  height: 100%;
  width: ${({ $percent }) => $percent}%;
  background: #38bdf8;
  transition: width 0.3s ease;
`;

export const FormalCalcBox = styled.div`
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 10px 14px;
  font-family: monospace;
  font-size: 0.85rem;
  color: #38bdf8;
  white-space: pre-wrap;
  word-break: break-all;
`;

export const StepControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;

export const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const ActionBtn = styled.button<{ $primary?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 0.825rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid ${({ $primary }) => ($primary ? '#2563eb' : '#475569')};
  background: ${({ $primary }) => ($primary ? '#2563eb' : 'transparent')};
  color: #f8fafc;

  &:hover:not(:disabled) {
    background: ${({ $primary }) => ($primary ? '#1d4ed8' : '#334155')};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

export const Legend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px 0;
  font-size: 0.775rem;
`;

export const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const LegendColor = styled.span<{ $bg: string }>`
  width: 12px;
  height: 12px;
  border-radius: 3px;
  background: ${({ $bg }) => $bg};
`;
