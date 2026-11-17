/**
 * Formats a byte count into a human-readable string (B, KB, MB, GB, TB).
 */
export function formatBytes(bytes: number, locale = 'es-AR'): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  const digits = unit === 0 || Number.isInteger(value) ? 0 : value < 10 ? 2 : 1;
  return `${value.toLocaleString(locale, { maximumFractionDigits: digits })} ${units[unit]}`;
}

/**
 * Formats an integer or float with localized thousand separators.
 */
export function fmt(n: number, locale = 'es-AR'): string {
  return n.toLocaleString(locale);
}

/**
 * Formats an unsigned 32-bit integer into a zero-padded hexadecimal string (e.g. 0x00108000).
 */
export function fmtHex(n: number, width = 8): string {
  return '0x' + (n >>> 0).toString(16).padStart(width, '0');
}
