import { describe, expect, it } from 'vitest';
import { fmt, fmtHex, formatBytes } from './format';

describe('format utilities', () => {
  it('formats byte sizes across units', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(4096)).toBe('4 KB');
    expect(formatBytes(1024 * 1024)).toBe('1 MB');
    expect(formatBytes(1.5 * 1024 * 1024, 'en-US')).toBe('1.5 MB');
  });

  it('formats 32-bit hexadecimal addresses with 0x prefix', () => {
    expect(fmtHex(0)).toBe('0x00000000');
    expect(fmtHex(1081344)).toBe('0x00108000');
    expect(fmtHex(1081355)).toBe('0x0010800b');
  });

  it('formats numbers with locale thousand separators', () => {
    expect(fmt(1024, 'en-US')).toBe('1,024');
  });
});
