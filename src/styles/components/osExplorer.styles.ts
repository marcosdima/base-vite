import styled, { type DefaultTheme } from 'styled-components';
import { motion } from 'motion/react';
import { Caption, Eyebrow, SectionTitle, Subtitle } from '../typography';

export const Page = styled.section`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px 0 48px;
`;

export const Header = styled.header`
  display: grid;
  gap: 10px;
`;

export const Title = styled(SectionTitle)`
  font-size: clamp(1.6rem, 3vw, 2.1rem);
`;

export const Description = styled(Subtitle)`
  max-width: 68ch;
`;

export const Tabs = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  border-bottom: 1px solid ${({ theme }: { theme: DefaultTheme }) => theme.colors.border};
  padding-bottom: 12px;
`;

export const Tab = styled.button<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  min-height: 38px;
  border: 1px solid
    ${({ theme, $active }: { theme: DefaultTheme; $active: boolean }) =>
      $active ? theme.colors.accentBorder : theme.colors.border};
  border-radius: ${({ theme }: { theme: DefaultTheme }) => theme.radii.pill};
  background: ${({ theme, $active }: { theme: DefaultTheme; $active: boolean }) =>
    $active ? theme.colors.accentSoft : 'transparent'};
  color: ${({ theme, $active }: { theme: DefaultTheme; $active: boolean }) =>
    $active ? theme.colors.accent : theme.colors.textMuted};
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background ${({ theme }: { theme: DefaultTheme }) => theme.transitions.default},
    color ${({ theme }: { theme: DefaultTheme }) => theme.transitions.default};

  &:hover {
    color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.textStrong};
  }
`;

export const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 260px) minmax(0, 1fr);
  gap: 20px;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const Panel = styled.section`
  border: 1px solid ${({ theme }: { theme: DefaultTheme }) => theme.colors.border};
  border-radius: ${({ theme }: { theme: DefaultTheme }) => theme.radii.medium};
  background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.surface};
  box-shadow: ${({ theme }: { theme: DefaultTheme }) => theme.shadows.card};
  overflow: hidden;
`;

export const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 18px;
  border-bottom: 1px solid ${({ theme }: { theme: DefaultTheme }) => theme.colors.border};
  background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.surfaceMuted};
`;

export const PanelTitle = styled(Eyebrow)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

export const PanelBody = styled.div`
  padding: 16px 18px;
  display: grid;
  gap: 12px;
`;

export const Tree = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 2px;
  max-height: 420px;
  overflow: auto;
`;

export const TreeItem = styled.li`
  display: grid;
  gap: 2px;
`;

export const TreeButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 7px 10px;
  border: none;
  border-radius: ${({ theme }: { theme: DefaultTheme }) => theme.radii.small};
  background: ${({ theme, $active }: { theme: DefaultTheme; $active: boolean }) =>
    $active ? theme.colors.accentSoft : 'transparent'};
  color: ${({ theme, $active }: { theme: DefaultTheme; $active: boolean }) =>
    $active ? theme.colors.accent : theme.colors.text};
  font-size: 0.875rem;
  font-weight: ${({ $active }: { $active: boolean }) => ($active ? 600 : 500)};
  text-align: left;
  cursor: pointer;
  transition: background ${({ theme }: { theme: DefaultTheme }) => theme.transitions.default};

  &:hover {
    background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.surfaceMuted};
  }
`;

export const TreeChildren = styled.ul`
  list-style: none;
  margin: 0;
  padding-left: 14px;
  border-left: 1px solid ${({ theme }: { theme: DefaultTheme }) => theme.colors.border};
  display: grid;
  gap: 2px;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;

  th,
  td {
    padding: 9px 10px;
    text-align: left;
    border-bottom: 1px solid ${({ theme }: { theme: DefaultTheme }) => theme.colors.border};
    white-space: nowrap;
  }

  th {
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.textSubtle};
  }

  tbody tr {
    cursor: pointer;
    transition: background ${({ theme }: { theme: DefaultTheme }) => theme.transitions.default};

    &:hover {
      background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.surfaceMuted};
    }
  }
`;

export const TableRow = styled.tr<{ $selected: boolean }>`
  background: ${({ theme, $selected }: { theme: DefaultTheme; $selected: boolean }) =>
    $selected ? theme.colors.accentSoft : 'transparent'};
`;

export const NameCell = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.textStrong};
`;

export const Mono = styled.span`
  font-family: 'SFMono-Regular', 'JetBrains Mono', 'Consolas', monospace;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.textMuted};
`;

export const Breadcrumb = styled.nav`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  font-family: 'SFMono-Regular', 'JetBrains Mono', 'Consolas', monospace;
  font-size: 0.85rem;
`;

export const CrumbButton = styled.button`
  border: none;
  background: transparent;
  padding: 2px 4px;
  border-radius: 6px;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.accent};
  font: inherit;
  cursor: pointer;

  &:hover {
    background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.accentSoft};
  }
`;

export const Inspector = styled.dl`
  display: grid;
  grid-template-columns: minmax(0, 140px) minmax(0, 1fr);
  gap: 8px 16px;
  margin: 0;
  font-size: 0.85rem;

  dt {
    color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.textSubtle};
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-size: 0.7rem;
    align-self: center;
  }

  dd {
    margin: 0;
    color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.textStrong};
    font-family: 'SFMono-Regular', 'JetBrains Mono', 'Consolas', monospace;
    word-break: break-all;
  }
`;

export const Terminal = styled(motion.section)`
  border: 1px solid ${({ theme }: { theme: DefaultTheme }) => theme.colors.borderStrong};
  border-radius: ${({ theme }: { theme: DefaultTheme }) => theme.radii.medium};
  background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.surfaceMuted};
  padding: 16px;
  display: grid;
  gap: 12px;
  font-family: 'SFMono-Regular', 'JetBrains Mono', 'Consolas', monospace;
`;

export const TerminalOutput = styled.pre`
  margin: 0;
  min-height: 96px;
  max-height: 260px;
  overflow: auto;
  font-size: 0.82rem;
  line-height: 1.6;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.textStrong};
  white-space: pre-wrap;
  word-break: break-word;
`;

export const TerminalLine = styled.span<{ $type?: 'error' | 'success' | 'muted' }>`
  display: block;
  color: ${({ theme, $type }: { theme: DefaultTheme; $type?: 'error' | 'success' | 'muted' }) => {
    if ($type === 'error') {
      return theme.colors.errorText;
    }

    if ($type === 'success') {
      return theme.colors.successText;
    }

    if ($type === 'muted') {
      return theme.colors.textSubtle;
    }

    return theme.colors.textStrong;
  }};
`;

export const TerminalForm = styled.form`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const TerminalPrompt = styled.span`
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.accent};
  font-weight: 700;
  white-space: nowrap;
`;

export const TerminalInput = styled.input`
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.textStrong};
  font: inherit;
  font-size: 0.85rem;
`;

export const Meter = styled.div`
  display: grid;
  gap: 6px;
`;

export const MeterRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 0.8rem;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.textMuted};
`;

export const MeterTrack = styled.div`
  height: 8px;
  border-radius: ${({ theme }: { theme: DefaultTheme }) => theme.radii.pill};
  background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.neutralBackground};
  overflow: hidden;
`;

export const MeterFill = styled.div<{ $ratio: number }>`
  height: 100%;
  border-radius: ${({ theme }: { theme: DefaultTheme }) => theme.radii.pill};
  background: ${({ theme, $ratio }: { theme: DefaultTheme; $ratio: number }) =>
    $ratio > 0.85 ? theme.colors.errorText : theme.colors.accent};
  width: ${({ $ratio }: { $ratio: number }) => `${Math.min(Math.round($ratio * 100), 100)}%`};
  transition: width ${({ theme }: { theme: DefaultTheme }) => theme.transitions.default};
`;

export const Actions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

export const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  min-height: 34px;
  border: 1px solid ${({ theme }: { theme: DefaultTheme }) => theme.colors.borderStrong};
  border-radius: ${({ theme }: { theme: DefaultTheme }) => theme.radii.small};
  background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.surface};
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.text};
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background ${({ theme }: { theme: DefaultTheme }) => theme.transitions.default},
    color ${({ theme }: { theme: DefaultTheme }) => theme.transitions.default};

  &:hover:not(:disabled) {
    background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.surfaceMuted};
    color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.textStrong};
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

export const StatusText = styled(Caption)<{ $type?: 'info' | 'error' }>`
  color: ${({ theme, $type }: { theme: DefaultTheme; $type?: 'info' | 'error' }) =>
    $type === 'error' ? theme.colors.errorText : theme.colors.textMuted};
`;

export const Field = styled.label`
  display: grid;
  gap: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.textMuted};
`;

export const Input = styled.input`
  width: 100%;
  border: 1px solid ${({ theme }: { theme: DefaultTheme }) => theme.colors.borderStrong};
  border-radius: ${({ theme }: { theme: DefaultTheme }) => theme.radii.small};
  background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.surface};
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.text};
  padding: 8px 10px;
  font-size: 0.85rem;

  &:focus {
    outline: 2px solid ${({ theme }: { theme: DefaultTheme }) => theme.colors.accentBorder};
    outline-offset: 1px;
  }
`;

export const FieldRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
`;

export const Textarea = styled.textarea`
  width: 100%;
  min-height: 160px;
  resize: vertical;
  border: 1px solid ${({ theme }: { theme: DefaultTheme }) => theme.colors.borderStrong};
  border-radius: ${({ theme }: { theme: DefaultTheme }) => theme.radii.small};
  background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.surface};
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.text};
  padding: 10px 12px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.82rem;
  line-height: 1.6;

  &:focus {
    outline: 2px solid ${({ theme }: { theme: DefaultTheme }) => theme.colors.accentBorder};
    outline-offset: 1px;
  }
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
`;

export const StatCard = styled.div`
  border: 1px solid ${({ theme }: { theme: DefaultTheme }) => theme.colors.border};
  border-radius: ${({ theme }: { theme: DefaultTheme }) => theme.radii.small};
  background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.surfaceMuted};
  padding: 14px;
  display: grid;
  gap: 8px;
`;

export const StatValue = styled.span`
  font-size: 1.4rem;
  font-weight: 700;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.textStrong};
`;

export const ContentPreview = styled.pre`
  margin: 0;
  padding: 12px;
  max-height: 240px;
  overflow: auto;
  border: 1px solid ${({ theme }: { theme: DefaultTheme }) => theme.colors.border};
  border-radius: ${({ theme }: { theme: DefaultTheme }) => theme.radii.small};
  background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.surfaceMuted};
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.textStrong};
  font-size: 0.8rem;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
`;
