// Modo de archivo (POSIX). El inodo guarda el modo completo: tipo + permisos + flags especiales.
// Estas utilidades son genéricas y pueden ser usadas en cualquier proyecto que maneje permisos de archivo.

/** Máscaras de bits POSIX para tipo y permisos de archivo */
export const S_IFMT = 0o170000;
export const S_IFREG = 0o100000;
export const S_IFDIR = 0o040000;
export const S_IFLNK = 0o120000;
export const S_ISUID = 0o4000;
export const S_ISGID = 0o2000;
export const S_ISVTX = 0o1000;

/** Tipo de archivo derivado del modo del inodo */
export type FileType = 'regular' | 'directory' | 'symlink' | 'other';

/** Detecta el tipo de archivo a partir del modo (máscara S_IFMT). */
export function getFileType(mode: number): FileType {
  switch (mode & S_IFMT) {
    case S_IFREG:
      return 'regular';
    case S_IFDIR:
      return 'directory';
    case S_IFLNK:
      return 'symlink';
    default:
      return 'other';
  }
}

/** Permisos en octal con prefijo cero: 0o100644 -> "0644". */
export function formatModeOctal(mode: number): string {
  return (mode & 0o7777).toString(8).padStart(4, '0');
}

/** Modo completo en octal, tipo incluido: 0o100644 -> "100644". */
export function formatFullModeOctal(mode: number): string {
  return mode.toString(8).padStart(6, '0');
}

/** Interpreta un modo octal escrito como texto: "0644" -> 0o644. */
export function parseOctalMode(value: string): number {
  return parseInt(value.trim(), 8);
}

/** Representación simbólica al estilo `ls -l`: 0o100644 -> "-rw-r--r--". */
export function formatModeSymbolic(mode: number): string {
  const type = getFileType(mode);
  const typeChar =
    type === 'directory' ? 'd' : type === 'symlink' ? 'l' : type === 'other' ? '?' : '-';

  const permissionTriplet = (bits: number, special: number, specialChar: string): string => {
    const read = bits & 0o4 ? 'r' : '-';
    const write = bits & 0o2 ? 'w' : '-';
    const execute = bits & 0o1 ? 'x' : '-';

    if (!special) {
      return `${read}${write}${execute}`;
    }

    if (specialChar === 't') {
      return `${read}${write}${bits & 0o1 ? 't' : 'T'}`;
    }

    return `${read}${write}${bits & 0o1 ? specialChar : specialChar.toUpperCase()}`;
  };

  const owner = permissionTriplet((mode >> 6) & 0o7, mode & S_ISUID, 's');
  const group = permissionTriplet((mode >> 3) & 0o7, mode & S_ISGID, 's');
  const other = permissionTriplet(mode & 0o7, mode & S_ISVTX, 't');

  return `${typeChar}${owner}${group}${other}`;
}
