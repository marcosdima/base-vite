# `Terminal` Widget

- **Source**: `src/components/widgets/Terminal/Terminal.tsx`, `Terminal.styles.ts`, `Terminal.types.ts`
- **Test**: `src/components/widgets/Terminal/Terminal.test.tsx`
- **Import**: `import { Terminal, type TerminalProps, type TerminalCommandDefinition } from '@/components/widgets';`

## Purpose

Drop-in interactive CLI terminal emulator featuring a window header, auto-scrolling output log, typed line tones (`input`, `output`, `info`, `success`, `warning`, `error`, `muted`), built-in commands (`help`, `clear`, `echo`, `history`, `date`), `ArrowUp` / `ArrowDown` command history navigation, and extensible custom command handlers.

## Props (`TerminalProps`)

| Prop             | Type                                                                                                                    | Default                                                                         | Description                                                                                                                                          |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`          | `string`                                                                                                                | `'Terminal'`                                                                    | Title displayed in the terminal window header.                                                                                                       |
| `welcomeMessage` | `string`                                                                                                                | `'Welcome to the interactive terminal. Type "help" to see available commands.'` | Initial muted line rendered on mount (pass `''` to omit).                                                                                            |
| `prompt`         | `string`                                                                                                                | `'user@system:~$ '`                                                             | Prompt prefix shown before the input cursor and echoed commands.                                                                                     |
| `height`         | `string`                                                                                                                | `'380px'`                                                                       | CSS height of the scrollable terminal body.                                                                                                          |
| `maxHeight`      | `string`                                                                                                                | `'600px'`                                                                       | CSS max-height of the terminal body.                                                                                                                 |
| `commands`       | `Record<string, TerminalCommandDefinition>`                                                                             | `{}`                                                                            | Custom commands merged into the built-in command registry (automatically listed by `help`).                                                          |
| `onCommand`      | `(command: string, print: (text: string, type?: TerminalLineType) => void, clear: () => void) => void \| Promise<void>` | `undefined`                                                                     | Optional fallback handler invoked when an input command is not found in built-in or custom `commands`.                                               |
| `focusOnMount`   | `boolean`                                                                                                               | `false`                                                                         | When `true`, focuses the command input on mount. Defaults to `false` so embedding the widget inside multi-section pages does not hijack page scroll. |
| `className`      | `string`                                                                                                                | `undefined`                                                                     | Optional CSS class for the outer container.                                                                                                          |

## Custom Command Handler Signature

```ts
interface TerminalContext {
  print: (text: string, type?: TerminalLineType) => void;
  clear: () => void;
  getHistory: () => string[];
}

interface TerminalCommandDefinition {
  description: string;
  usage?: string;
  handler: (args: string[], context: TerminalContext, rawInput: string) => void | Promise<void>;
}
```

## Usage

```tsx
import { Terminal } from '@/components/widgets';

export function DevConsole() {
  return (
    <Terminal
      title="App Console"
      prompt="app$ "
      height="300px"
      commands={{
        status: {
          description: 'Show service health status',
          handler: (_args, { print }) => {
            print('All systems operational.', 'success');
          },
        },
        deploy: {
          description: 'Trigger deployment to an environment',
          usage: '<env>',
          handler: (args, { print }) => {
            const env = args[0] ?? 'staging';
            print(`Deploying to ${env}...`, 'info');
          },
        },
      }}
    />
  );
}
```
