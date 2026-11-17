import { describe, expect, it } from 'vitest';
import {
  S_IFDIR,
  S_IFLNK,
  S_IFREG,
  S_ISGID,
  S_ISUID,
  S_ISVTX,
  formatFullModeOctal,
  formatModeOctal,
  formatModeSymbolic,
  getFileType,
  parseOctalMode,
} from './fileMode';

describe('fileMode utilities', () => {
  it('detects POSIX file types from mode bits', () => {
    expect(getFileType(S_IFREG | 0o644)).toBe('regular');
    expect(getFileType(S_IFDIR | 0o755)).toBe('directory');
    expect(getFileType(S_IFLNK | 0o777)).toBe('symlink');
    expect(getFileType(0o644)).toBe('other');
  });

  it('formats and parses octal modes', () => {
    expect(formatModeOctal(S_IFREG | 0o644)).toBe('0644');
    expect(formatFullModeOctal(S_IFREG | 0o644)).toBe('100644');
    expect(parseOctalMode(' 0755 ')).toBe(0o755);
  });

  it('formats symbolic permissions including setuid, setgid, and sticky bits', () => {
    expect(formatModeSymbolic(S_IFREG | 0o644)).toBe('-rw-r--r--');
    expect(formatModeSymbolic(S_IFDIR | 0o755)).toBe('drwxr-xr-x');
    expect(formatModeSymbolic(S_IFLNK | 0o777)).toBe('lrwxrwxrwx');
    expect(formatModeSymbolic(S_IFREG | S_ISUID | 0o755)).toBe('-rwsr-xr-x');
    expect(formatModeSymbolic(S_IFREG | S_ISGID | 0o644)).toBe('-rw-r-Sr--');
    expect(formatModeSymbolic(S_IFDIR | S_ISVTX | 0o777)).toBe('drwxrwxrwt');
  });
});
