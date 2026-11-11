export type TerminalLineType =
  'input' | 'output' | 'error' | 'success' | 'info' | 'warning' | 'muted';

export interface TerminalLine {
  id: string;
  type: TerminalLineType;
  text: string;
  timestamp?: number;
}

export interface TerminalContext {
  print: (text: string, type?: TerminalLineType) => void;
  clear: () => void;
  getHistory: () => string[];
}

export type TerminalCommandHandler = (
  args: string[],
  context: TerminalContext,
  rawInput: string,
) => void | Promise<void>;

export interface TerminalCommandDefinition {
  description: string;
  usage?: string;
  handler: TerminalCommandHandler;
}

export interface TerminalProps {
  /** Title shown on the terminal window titlebar */
  title?: string;
  /** Initial welcome message */
  welcomeMessage?: string;
  /** Prompt prefix string (e.g. 'guest@system:~$ ') */
  prompt?: string;
  /** Height of the terminal body */
  height?: string;
  /** Max height of the terminal body */
  maxHeight?: string;
  /** Registered commands map */
  commands?: Record<string, TerminalCommandDefinition>;
  /** Optional custom fallback command handler */
  onCommand?: (
    command: string,
    print: (text: string, type?: TerminalLineType) => void,
    clear: () => void,
  ) => void | Promise<void>;
  /** If true, the terminal input is focused on mount */
  autoFocus?: boolean;
  /** Class name for the outer container */
  className?: string;
}
