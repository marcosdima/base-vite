import {
  formatModeOctal,
  formatModeSymbolic,
  getFileType,
  type FileType,
} from '../../utils/fileMode';

/**
 * Metadatos de un inodo. NO contiene el contenido del archivo ni la tabla
 * del directorio: son responsabilidades separadas a propósito.
 */
export interface Inode {
  /** Número de inodo. Es la identidad real del archivo en el sistema. */
  number: number;
  /** Modo completo (tipo + permisos + flags), tal como lo guarda stat(2). */
  mode: number;
  uid: number;
  gid: number;
  /** Número de enlaces duros. > 1 significa que el inodo tiene varios nombres. */
  nlink: number;
  /** Tamaño en bytes. */
  size: number;
  atime: number;
  mtime: number;
  ctime: number;
  /** Bloques asignados (en unidades de 512 bytes, como los bloques de stat). */
  blocks: number;
}

/** Tipo de archivo derivado del modo del inodo. */
export type InodeType = FileType;

/** Una entrada de directorio: nombre + número de inodo. No es el inodo. */
export interface DirEntry {
  name: string;
  inodeNumber: number;
}

/**
 * Tabla de inodos del "filesystem": mapa número de inodo -> metadatos.
 * El contenido de los archivos vive aparte, en el almacén de blobs.
 */
export interface InodeTable {
  entries: Record<number, Inode>;
}

export function createInodeTable(): InodeTable {
  return { entries: {} };
}

/** Reserva el siguiente número de inodo libre. */
export function nextInodeNumber(table: InodeTable): number {
  const numbers = Object.keys(table.entries).map(Number);
  return numbers.length === 0 ? 1 : Math.max(...numbers) + 1;
}

/** Crea un inodo nuevo con metadatos por defecto (como un archivo 0644 vacío). */
export function allocateInode(table: InodeTable, mode: number, now: number): Inode {
  const number = nextInodeNumber(table);
  const inode: Inode = {
    number,
    mode,
    uid: 0,
    gid: 0,
    nlink: 1,
    size: 0,
    atime: now,
    mtime: now,
    ctime: now,
    blocks: 0,
  };

  table.entries[number] = inode;

  return inode;
}

/** Busca un inodo por número. Devuelve undefined si no existe. */
export function lookupInode(table: InodeTable, number: number): Inode | undefined {
  return table.entries[number];
}

/** Tipo de archivo de un inodo, o undefined si el inodo no existe. */
export function inodeType(inode: Inode | undefined): InodeType | undefined {
  return inode ? getFileType(inode.mode) : undefined;
}

/**
 * Libera un inodo: lo elimina de la tabla si su contador de enlaces llega a 0.
 * Devuelve true si el inodo fue realmente eliminado.
 */
export function releaseInode(table: InodeTable, number: number): boolean {
  const inode = table.entries[number];

  if (!inode) {
    return false;
  }

  inode.nlink -= 1;

  if (inode.nlink > 0) {
    return false;
  }

  delete table.entries[number];

  return true;
}

/**
 * Cambia los permisos (y opcionalmente los flags especiales) de un inodo,
 * conservando intacto el tipo de archivo.
 */
export function chmodInode(
  table: InodeTable,
  number: number,
  permissions: number,
): Inode | undefined {
  const inode = table.entries[number];

  if (!inode) {
    return undefined;
  }

  inode.mode = (inode.mode & 0o170000) | (permissions & 0o7777);

  return inode;
}

/** Cambia el propietario (uid/gid) de un inodo. */
export function chownInode(
  table: InodeTable,
  number: number,
  uid: number,
  gid: number,
): Inode | undefined {
  const inode = table.entries[number];

  if (!inode) {
    return undefined;
  }

  inode.uid = uid;
  inode.gid = gid;

  return inode;
}

/** Permisos del inodo en octal: 0o100644 -> "0644". */
export function inodePermissions(inode: Inode): string {
  return formatModeOctal(inode.mode);
}

/** Modo completo del inodo en notación simbólica: 0o100644 -> "-rw-r--r--". */
export function inodeSymbolicMode(inode: Inode): string {
  return formatModeSymbolic(inode.mode);
}
