/** Parser de la línea de comandos del terminal.
 * Se separa del componente para poder testearlo sin montar la UI.
 */

export type TerminalCommand =
  | { name: 'pwd' }
  | { name: 'ls' }
  | { name: 'cd'; path: string }
  | { name: 'mkdir'; path: string }
  | { name: 'touch'; path: string }
  | { name: 'ln'; linkPath: string; source: string; symbolic: boolean }
  | { name: 'rm'; path: string }
  | { name: 'chmod'; path: string; permissions: number }
  | { name: 'chown'; path: string; uid: number; gid: number }
  | { name: 'df' }
  | { name: 'clear' }
  | { name: 'help' }
  | { name: 'unknown'; command: string };

/** Convierte una línea escrita por la persona usuaria en un comando tipado.
 * `ln -s destino enlace` produce un enlace simbólico; `ln origen enlace` uno duro.
 */
export function parseCommand(input: string): TerminalCommand {
  const trimmed = input.trim();

  if (!trimmed) {
    return { name: 'unknown', command: '' };
  }

  const [name, ...args] = trimmed.split(/\s+/);

  switch (name) {
    case 'pwd':
      return { name: 'pwd' };

    case 'ls':
      return { name: 'ls' };

    case 'cd':
      return { name: 'cd', path: args[0] ?? '/' };

    case 'mkdir':
      return { name: 'mkdir', path: args[0] ?? '' };

    case 'touch':
      return { name: 'touch', path: args[0] ?? '' };

    case 'ln': {
      const symbolic = args[0] === '-s';
      const operands = symbolic ? args.slice(1) : args;

      // En POSIX el destino va primero: `ln -s TARGET LINK_NAME` y `ln TARGET LINK_NAME`.
      return {
        name: 'ln',
        source: operands[0] ?? '',
        linkPath: operands[1] ?? '',
        symbolic,
      };
    }

    case 'rm':
      return { name: 'rm', path: args[0] ?? '' };

    case 'chmod':
      return {
        name: 'chmod',
        path: args[0] ?? '',
        permissions: parseInt(args[1] ?? '0', 8),
      };

    case 'chown':
      return {
        name: 'chown',
        path: args[0] ?? '',
        uid: parseInt(args[1] ?? '0', 10),
        gid: parseInt(args[2] ?? '0', 10),
      };

    case 'df':
      return { name: 'df' };

    case 'clear':
      return { name: 'clear' };

    case 'help':
      return { name: 'help' };

    default:
      return { name: 'unknown', command: name };
  }
}
