import { S_IFDIR, S_IFLNK, S_IFREG, getFileType } from '../../utils/fileMode';
import {
  allocateInode,
  chmodInode,
  chownInode,
  lookupInode,
  releaseInode,
  type DirEntry,
  type Inode,
  type InodeTable,
} from './inode';

export const ROOT_PATH = '/';

/**
 * Filesystem virtual en memoria.
 *
 * Separación de responsabilidades, igual que en un sistema real:
 * - `inodes`     -> tabla de metadatos (modo, uid, timestamps, nlink).
 * - `blobs`      -> contenido de los archivos regulares, por número de inodo.
 * - `links`      -> destino de los enlaces simbólicos, por número de inodo.
 * - `directories`-> tabla de entradas por directorio (nombre -> número de inodo).
 */
export interface Filesystem {
  inodes: InodeTable;
  blobs: Record<number, string>;
  links: Record<number, string>;
  directories: Record<string, DirEntry[]>;
  now: () => number;
}

/** Crea un filesystem vacío con solo el directorio raíz "/". */
export function createFilesystem(now: () => number = Date.now): Filesystem {
  const fs: Filesystem = {
    inodes: { entries: {} },
    blobs: {},
    links: {},
    directories: {},
    now,
  };

  const root = allocateInode(fs.inodes, S_IFDIR | 0o755, now());
  fs.directories[ROOT_PATH] = [{ name: '.', inodeNumber: root.number }];

  return fs;
}

/** Normaliza un path: sin barras duplicadas, sin "." y sin ".." redundantes. */
export function normalizePath(path: string): string {
  const isAbsolute = path.startsWith('/');
  const segments: string[] = [];

  for (const segment of path.split('/')) {
    if (!segment || segment === '.') {
      continue;
    }

    if (segment === '..') {
      if (segments.length > 0 && segments[segments.length - 1] !== '..') {
        segments.pop();
        continue;
      }

      if (isAbsolute) {
        continue;
      }
    }

    segments.push(segment);
  }

  const joined = segments.join('/');

  return isAbsolute ? `/${joined}` : joined;
}

/** Une un directorio y un nombre de entrada en un path absoluto. */
export function joinPath(directory: string, name: string): string {
  const base = normalizePath(directory);

  if (base === ROOT_PATH) {
    return normalizePath(`/${name}`);
  }

  return normalizePath(`${base}/${name}`);
}

/** Nombre de la última sección de un path. */
export function basename(path: string): string {
  const normalized = normalizePath(path);
  const segments = normalized.split('/').filter(Boolean);

  return segments.length === 0 ? ROOT_PATH : segments[segments.length - 1];
}

/** Directorio padre de un path. */
export function dirname(path: string): string {
  const normalized = normalizePath(path);

  if (normalized === ROOT_PATH) {
    return ROOT_PATH;
  }

  const parent = normalized.slice(0, normalized.lastIndexOf('/'));

  return parent === '' ? ROOT_PATH : parent;
}

/**
 * Entrada de directorio que corresponde a un path, si existe.
 * Busca el nombre dentro de la tabla de entradas de su directorio padre.
 */
export function findEntry(fs: Filesystem, path: string): DirEntry | undefined {
  const normalized = normalizePath(path);
  const parent = dirname(normalized);
  const entries = fs.directories[parent];

  if (!entries) {
    return undefined;
  }

  const name = normalized === ROOT_PATH ? '.' : basename(normalized);

  return entries.find((entry) => entry.name === name);
}

/** Número de inodo de un path, si existe. */
export function resolvePath(fs: Filesystem, path: string): number | undefined {
  return findEntry(fs, path)?.inodeNumber;
}

/** Metadatos (inodo) de un path, si existe. */
export function stat(fs: Filesystem, path: string): Inode | undefined {
  const number = resolvePath(fs, path);

  return number === undefined ? undefined : lookupInode(fs.inodes, number);
}

/** Crea un directorio. Devuelve el inodo creado o undefined si ya existía. */
export function mkdir(fs: Filesystem, path: string, permissions = 0o755): Inode | undefined {
  const normalized = normalizePath(path);

  if (normalized === ROOT_PATH || resolvePath(fs, normalized) !== undefined) {
    return undefined;
  }

  const parent = dirname(normalized);

  if (!fs.directories[parent]) {
    return undefined;
  }

  const inode = allocateInode(fs.inodes, S_IFDIR | permissions, fs.now());
  fs.directories[normalized] = [];
  fs.directories[parent].push({ name: basename(normalized), inodeNumber: inode.number });

  return inode;
}

/** Crea un archivo regular vacío. Devuelve el inodo o undefined si el path ya existe. */
export function createFile(
  fs: Filesystem,
  path: string,
  permissions = 0o644,
  content = '',
): Inode | undefined {
  const normalized = normalizePath(path);

  if (resolvePath(fs, normalized) !== undefined) {
    return undefined;
  }

  const parent = dirname(normalized);

  if (!fs.directories[parent]) {
    return undefined;
  }

  const inode = allocateInode(fs.inodes, S_IFREG | permissions, fs.now());
  fs.blobs[inode.number] = content;
  inode.size = content.length;
  inode.blocks = Math.ceil(content.length / 512);
  fs.directories[parent].push({ name: basename(normalized), inodeNumber: inode.number });

  return inode;
}

/** Escribe contenido en un archivo regular. Devuelve false si el path no existe o no es regular. */
export function writeFile(fs: Filesystem, path: string, content: string): boolean {
  const inode = stat(fs, path);

  if (!inode || getFileType(inode.mode) !== 'regular') {
    return false;
  }

  fs.blobs[inode.number] = content;
  inode.size = content.length;
  inode.blocks = Math.ceil(content.length / 512);
  inode.mtime = fs.now();

  return true;
}

/** Lee el contenido de un archivo regular. */
export function readFile(fs: Filesystem, path: string): string | undefined {
  const inode = stat(fs, path);

  if (!inode || getFileType(inode.mode) !== 'regular') {
    return undefined;
  }

  return fs.blobs[inode.number] ?? '';
}

/** Entradas de un directorio, sin la entrada "." . */
export function listDirectory(fs: Filesystem, path: string): DirEntry[] {
  const normalized = normalizePath(path);
  const entries = fs.directories[normalized];

  if (!entries) {
    return [];
  }

  return entries.filter((entry) => entry.name !== '.');
}

/** Crea un enlace simbólico. El destino se guarda aparte del contenido. */
export function symlink(fs: Filesystem, path: string, target: string): Inode | undefined {
  const normalized = normalizePath(path);

  if (resolvePath(fs, normalized) !== undefined) {
    return undefined;
  }

  const parent = dirname(normalized);

  if (!fs.directories[parent]) {
    return undefined;
  }

  const inode = allocateInode(fs.inodes, S_IFLNK | 0o777, fs.now());
  fs.links[inode.number] = target;
  inode.size = target.length;
  fs.directories[parent].push({ name: basename(normalized), inodeNumber: inode.number });

  return inode;
}

/** Destino de un enlace simbólico, si el path es un symlink. */
export function readlink(fs: Filesystem, path: string): string | undefined {
  const inode = stat(fs, path);

  if (!inode || getFileType(inode.mode) !== 'symlink') {
    return undefined;
  }

  return fs.links[inode.number];
}

/**
 * Crea un enlace duro: otra entrada de directorio que apunta al MISMO inodo.
 * Incrementa nlink, así que el inodo sobrevive al borrado de cualquiera de sus nombres.
 */
export function link(fs: Filesystem, path: string, existingPath: string): Inode | undefined {
  const normalized = normalizePath(path);
  const source = stat(fs, existingPath);

  if (!source || resolvePath(fs, normalized) !== undefined) {
    return undefined;
  }

  const parent = dirname(normalized);

  if (!fs.directories[parent]) {
    return undefined;
  }

  source.nlink += 1;
  fs.directories[parent].push({ name: basename(normalized), inodeNumber: source.number });

  return source;
}

/**
 * Borra una entrada de directorio (como unlink). El inodo se libera de verdad
 * solo cuando su último enlace desaparece.
 */
export function unlink(fs: Filesystem, path: string): boolean {
  const normalized = normalizePath(path);

  if (normalized === ROOT_PATH) {
    return false;
  }

  const parent = dirname(normalized);
  const entries = fs.directories[parent];

  if (!entries) {
    return false;
  }

  const index = entries.findIndex((entry) => entry.name === basename(normalized));

  if (index === -1) {
    return false;
  }

  const targetEntry = entries[index]!;
  const inode = lookupInode(fs.inodes, targetEntry.inodeNumber);

  if (inode && getFileType(inode.mode) === 'directory') {
    if (listDirectory(fs, normalized).length > 0) {
      return false;
    }
    delete fs.directories[normalized];
  }

  const [removed] = entries.splice(index, 1);

  const released = releaseInode(fs.inodes, removed.inodeNumber);

  if (released) {
    delete fs.blobs[removed.inodeNumber];
    delete fs.links[removed.inodeNumber];
  }

  return true;
}

/** Cambia los permisos de un path. */
export function chmod(fs: Filesystem, path: string, permissions: number): boolean {
  const inode = stat(fs, path);

  if (!inode) {
    return false;
  }

  chmodInode(fs.inodes, inode.number, permissions);
  inode.ctime = fs.now();

  return true;
}

/** Cambia el propietario de un path. */
export function chown(fs: Filesystem, path: string, uid: number, gid: number): boolean {
  const inode = stat(fs, path);

  if (!inode) {
    return false;
  }

  chownInode(fs.inodes, inode.number, uid, gid);
  inode.ctime = fs.now();

  return true;
}

/** Un path junto con los metadatos de su inodo. */
export interface PathStat {
  path: string;
  inode: Inode;
}

/** Lista el contenido de un directorio con los metadatos de cada entrada. */
export function listWithStats(fs: Filesystem, path: string): PathStat[] {
  return listDirectory(fs, path).flatMap((entry) => {
    const inode = lookupInode(fs.inodes, entry.inodeNumber);

    if (!inode) {
      return [];
    }

    return [{ path: joinPath(path, entry.name), inode }];
  });
}

/**
 * Resuelve una ruta de navegación desde un directorio actual, como un `cd`.
 * Devuelve undefined si el destino no existe o no es un directorio.
 */
export function resolveDirectory(
  fs: Filesystem,
  currentPath: string,
  input: string,
): string | undefined {
  const target = input.startsWith('/') ? input : joinPath(currentPath, input);
  const normalized = normalizePath(target);
  const inode = stat(fs, normalized);

  if (!inode || getFileType(inode.mode) !== 'directory') {
    return undefined;
  }

  return normalized;
}

/** Un nodo del árbol de directorios. */
export interface DirNode {
  path: string;
  name: string;
  inode: Inode;
  children: DirNode[];
}

/** Construye el árbol de directorios a partir de una raíz. */
export function buildTree(fs: Filesystem, path: string, depth = 0): DirNode[] {
  if (depth > 8) {
    return [];
  }

  return listWithStats(fs, path).flatMap((entry) => {
    if (getFileType(entry.inode.mode) !== 'directory') {
      return [];
    }

    return [
      {
        path: entry.path,
        name: basename(entry.path),
        inode: entry.inode,
        children: buildTree(fs, entry.path, depth + 1),
      },
    ];
  });
}

/** Resumen del filesystem, similar a `df`. */
export interface FilesystemStats {
  inodes: number;
  usedInodes: number;
  freeInodes: number;
  blocks: number;
  usedBlocks: number;
  freeBlocks: number;
  totalSize: number;
}

/** Calcula el uso del filesystem. */
export function filesystemStats(
  fs: Filesystem,
  capacityInodes = 64,
  capacityBlocks = 1024,
): FilesystemStats {
  const inodes = Object.values(fs.inodes.entries);
  const usedInodes = inodes.length;
  const totalSize = inodes.reduce((total, inode) => total + inode.size, 0);
  const usedBlocks = inodes.reduce((total, inode) => total + inode.blocks, 0);

  return {
    inodes: capacityInodes,
    usedInodes,
    freeInodes: Math.max(capacityInodes - usedInodes, 0),
    blocks: capacityBlocks,
    usedBlocks,
    freeBlocks: Math.max(capacityBlocks - usedBlocks, 0),
    totalSize,
  };
}
