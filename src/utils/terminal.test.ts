import { describe, expect, it } from 'vitest';
import { parseCommand } from './terminal';

describe('parseCommand', () => {
  it('should parse simple commands without arguments', () => {
    expect(parseCommand('pwd')).toEqual({ name: 'pwd' });
    expect(parseCommand('ls')).toEqual({ name: 'ls' });
    expect(parseCommand('df')).toEqual({ name: 'df' });
    expect(parseCommand('clear')).toEqual({ name: 'clear' });
    expect(parseCommand('help')).toEqual({ name: 'help' });
  });

  it('should ignore extra whitespace', () => {
    expect(parseCommand('   cd    /etc   ')).toEqual({ name: 'cd', path: '/etc' });
  });

  it('should default cd to the root directory', () => {
    expect(parseCommand('cd')).toEqual({ name: 'cd', path: '/' });
  });

  it('should parse a hard link with the target first', () => {
    expect(parseCommand('ln run.sh alias.sh')).toEqual({
      name: 'ln',
      source: 'run.sh',
      linkPath: 'alias.sh',
      symbolic: false,
    });
  });

  it('should parse a symbolic link with the -s switch', () => {
    expect(parseCommand('ln -s /etc link-to-etc')).toEqual({
      name: 'ln',
      source: '/etc',
      linkPath: 'link-to-etc',
      symbolic: true,
    });
  });

  it('should parse chmod with an octal mode first (POSIX order) and fallback to 0 on invalid input', () => {
    expect(parseCommand('chmod 600 notes.md')).toEqual({
      name: 'chmod',
      path: 'notes.md',
      permissions: 0o600,
    });
    expect(parseCommand('chmod invalid notes.md')).toEqual({
      name: 'chmod',
      path: 'notes.md',
      permissions: 0,
    });
  });

  it('should parse chown with uid and gid first (POSIX order) and fallback to 0 on invalid input', () => {
    expect(parseCommand('chown 1000 1000 notes.md')).toEqual({
      name: 'chown',
      path: 'notes.md',
      uid: 1000,
      gid: 1000,
    });
    expect(parseCommand('chown root wheel notes.md')).toEqual({
      name: 'chown',
      path: 'notes.md',
      uid: 0,
      gid: 0,
    });
  });

  it('should report unknown commands', () => {
    expect(parseCommand('sudo rm -rf /')).toEqual({ name: 'unknown', command: 'sudo' });
  });

  it('should report an empty input as unknown', () => {
    expect(parseCommand('   ')).toEqual({ name: 'unknown', command: '' });
  });
});
