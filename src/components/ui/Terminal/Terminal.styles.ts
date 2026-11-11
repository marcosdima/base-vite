import styled, { type DefaultTheme } from 'styled-components';

export const TerminalContainer = styled.div`
  display: flex;
  flex-direction: column;
  background: #0f172a;
  color: #e2e8f0;
  border-radius: ${({ theme }: { theme: DefaultTheme }) => theme.radii.medium};
  border: 1px solid #1e293b;
  box-shadow:
    0 20px 35px -5px rgba(0, 0, 0, 0.4),
    0 10px 15px -5px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  font-family: 'Fira Code', 'JetBrains Mono', 'Consolas', 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  width: 100%;
`;

export const TerminalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: #1e293b;
  border-bottom: 1px solid #334155;
  user-select: none;
`;

export const TerminalControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const WindowDot = styled.span<{ $color: 'red' | 'yellow' | 'green' }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${({ $color }) => {
    switch ($color) {
      case 'red':
        return '#ef4444';
      case 'yellow':
        return '#f59e0b';
      case 'green':
        return '#10b981';
      default:
        return '#64748b';
    }
  }};
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.2);
`;

export const TerminalTitle = styled.div`
  color: #94a3b8;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const TerminalBody = styled.div<{ $height?: string; $maxHeight?: string }>`
  padding: 16px;
  overflow-y: auto;
  height: ${({ $height }) => $height ?? '380px'};
  max-height: ${({ $maxHeight }) => $maxHeight ?? '600px'};
  display: flex;
  flex-direction: column;
  gap: 6px;

  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: #0f172a;
  }
  &::-webkit-scrollbar-thumb {
    background: #334155;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #475569;
  }
`;

export const LineWrapper = styled.div<{ $type: string }>`
  white-space: pre-wrap;
  word-break: break-word;
  color: ${({ $type }) => {
    switch ($type) {
      case 'error':
        return '#f87171';
      case 'success':
        return '#4ade80';
      case 'warning':
        return '#fbbf24';
      case 'info':
        return '#60a5fa';
      case 'muted':
        return '#64748b';
      case 'input':
        return '#38bdf8';
      default:
        return '#e2e8f0';
    }
  }};
`;

export const InputForm = styled.form`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
`;

export const PromptText = styled.span`
  color: #38bdf8;
  font-weight: 600;
  user-select: none;
  white-space: nowrap;
`;

export const CommandInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #f8fafc;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  caret-color: #38bdf8;
  padding: 0;

  &::placeholder {
    color: #475569;
  }
`;
