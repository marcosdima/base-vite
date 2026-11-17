import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import {
  CommandInput,
  InputForm,
  LineWrapper,
  PromptText,
  TerminalBody,
  TerminalContainer,
  TerminalControls,
  TerminalHeader,
  TerminalTitle,
  WindowDot,
} from './Terminal.styles';
import type {
  TerminalCommandDefinition,
  TerminalContext,
  TerminalLine,
  TerminalLineType,
  TerminalProps,
} from './Terminal.types';

export function Terminal({
  title = 'Terminal',
  welcomeMessage = 'Welcome to the interactive terminal. Type "help" to see available commands.',
  prompt = 'user@system:~$ ',
  height,
  maxHeight,
  commands = {},
  onCommand,
  autoFocus = true,
  className,
}: TerminalProps) {
  const instanceId = useId();
  const [lines, setLines] = useState<TerminalLine[]>(() =>
    welcomeMessage
      ? [
          {
            id: `${instanceId}-init`,
            type: 'muted',
            text: welcomeMessage,
            timestamp: Date.now(),
          },
        ]
      : [],
  );
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);

  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on output change
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [lines]);

  // Auto-focus input
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const print = useCallback((text: string, type: TerminalLineType = 'output') => {
    setLines((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        type,
        text,
        timestamp: Date.now(),
      },
    ]);
  }, []);

  const clear = useCallback(() => {
    setLines([]);
  }, []);

  const getHistory = useCallback(() => history, [history]);

  // Built-in standard commands
  const builtInCommands: Record<string, TerminalCommandDefinition> = {
    help: {
      description: 'List all available commands and their usage',
      handler: () => {
        print('Available commands:', 'info');
        const allCommands = { ...builtInCommands, ...commands };
        Object.entries(allCommands).forEach(([name, def]) => {
          const usage = def.usage ? ` ${def.usage}` : '';
          print(`  ${name.padEnd(14)}${usage.padEnd(20)} - ${def.description}`, 'muted');
        });
      },
    },
    clear: {
      description: 'Clear the terminal output',
      handler: () => {
        clear();
      },
    },
    echo: {
      description: 'Print arguments to the terminal',
      usage: '<text>',
      handler: (args) => {
        print(args.join(' '));
      },
    },
    history: {
      description: 'Show recent command history',
      handler: () => {
        if (history.length === 0) {
          print('History is empty.', 'muted');
          return;
        }
        history.forEach((cmd, idx) => {
          print(`  ${(idx + 1).toString().padStart(3, ' ')}  ${cmd}`);
        });
      },
    },
    date: {
      description: 'Display the current date and time',
      handler: () => {
        print(new Date().toString());
      },
    },
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIndex = historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInputVal(history[nextIndex] ?? '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === null) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= history.length) {
        setHistoryIndex(null);
        setInputVal('');
      } else {
        setHistoryIndex(nextIndex);
        setInputVal(history[nextIndex] ?? '');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const raw = inputVal;
    const trimmed = raw.trim();

    // Print command line
    print(`${prompt}${raw}`, 'input');
    setInputVal('');
    setHistoryIndex(null);

    if (!trimmed) return;

    // Append to history
    setHistory((prev) => [...prev, trimmed]);

    const parts = trimmed.split(/\s+/);
    const cmdName = parts[0]?.toLowerCase() ?? '';
    const args = parts.slice(1);

    const context: TerminalContext = { print, clear, getHistory };

    if (cmdName in builtInCommands) {
      const handler = builtInCommands[cmdName]?.handler;
      if (handler) {
        await handler(args, context, trimmed);
      }
      return;
    }

    if (cmdName in commands) {
      const handler = commands[cmdName]?.handler;
      if (handler) {
        await handler(args, context, trimmed);
      }
      return;
    }

    if (onCommand) {
      await onCommand(trimmed, print, clear);
      return;
    }

    print(`command not found: ${cmdName}. Type "help" for a list of commands.`, 'error');
  };

  return (
    <TerminalContainer
      className={className}
      onClick={() => inputRef.current?.focus()}
      data-testid="terminal-container"
    >
      <TerminalHeader>
        <TerminalControls>
          <WindowDot $color="red" aria-hidden="true" />
          <WindowDot $color="yellow" aria-hidden="true" />
          <WindowDot $color="green" aria-hidden="true" />
        </TerminalControls>
        <TerminalTitle>{title}</TerminalTitle>
        <div style={{ width: 44 }} />
      </TerminalHeader>

      <TerminalBody ref={bodyRef} $height={height} $maxHeight={maxHeight} tabIndex={0}>
        {lines.map((line) => (
          <LineWrapper
            key={line.id}
            $type={line.type}
            role={line.type === 'error' ? 'alert' : undefined}
          >
            {line.text}
          </LineWrapper>
        ))}

        <InputForm onSubmit={handleSubmit}>
          <PromptText>{prompt}</PromptText>
          <CommandInput
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Terminal input"
            autoComplete="off"
            spellCheck="false"
          />
        </InputForm>
      </TerminalBody>
    </TerminalContainer>
  );
}

export * from './Terminal.types';
