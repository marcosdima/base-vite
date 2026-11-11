import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
  buildTree,
  chmod,
  chown,
  createFile as createRegularFile,
  filesystemStats,
  joinPath,
  link,
  listWithStats,
  mkdir,
  readFile,
  readlink,
  resolveDirectory,
  stat,
  symlink,
  unlink,
  writeFile as writeFileContent,
  type Filesystem,
  type PathStat,
} from '../os/filesystem';
import { formatModeOctal, formatModeSymbolic, getFileType } from '../os/fileMode';
import type { Inode } from '../os/inode';
import { createSeedFilesystem } from '../os/seed';

/** Una entrada de la vista `ls`, ya formateada para la UI. */
export interface OsEntry {
  name: string;
  path: string;
  inodeNumber: number;
  type: 'regular' | 'directory' | 'symlink' | 'other';
  /** Permisos en octal, p. ej. "0644". */
  permissions: string;
  /** Modo completo en notación simbólica, p. ej. "-rw-r--r--". */
  symbolicMode: string;
  uid: number;
  gid: number;
  nlink: number;
  size: number;
  mtime: number;
}

/** Estado de la feature: el filesystem y la posición actual. */
export interface OsState {
  fs: Filesystem;
  currentPath: string;
  history: string[];
  selectedInode: number | null;
  status: { type: 'info' | 'error'; message: string } | null;
}

function toEntry(item: PathStat): OsEntry {
  return {
    name: item.path.split('/').pop() ?? item.path,
    path: item.path,
    inodeNumber: item.inode.number,
    type: getFileType(item.inode.mode),
    permissions: formatModeOctal(item.inode.mode),
    symbolicMode: formatModeSymbolic(item.inode.mode),
    uid: item.inode.uid,
    gid: item.inode.gid,
    nlink: item.inode.nlink,
    size: item.inode.size,
    mtime: item.inode.mtime,
  };
}

const initialState: OsState = {
  fs: createSeedFilesystem(),
  currentPath: '/home/dev',
  history: ['/home/dev'],
  selectedInode: null,
  status: null,
};

/**
 * Resuelve un path escrito por la UI contra el directorio actual.
 * Un path absoluto se usa tal cual; uno relativo se ancla al cwd, como en POSIX.
 */
function resolveFromCwd(currentPath: string, path: string): string {
  return path.startsWith('/') ? path : joinPath(currentPath, path);
}

const osSlice = createSlice({
  name: 'os',
  initialState,
  reducers: {
    navigate: (state, action: PayloadAction<string>) => {
      const target = resolveDirectory(state.fs, state.currentPath, action.payload);

      if (!target) {
        state.status = { type: 'error', message: `No such directory: ${action.payload}` };
        return;
      }

      state.currentPath = target;
      state.history = [...state.history, target];
      state.status = { type: 'info', message: target };
    },
    goToPath: (state, action: PayloadAction<string>) => {
      const target = resolveDirectory(state.fs, state.currentPath, action.payload);

      if (!target) {
        state.status = { type: 'error', message: `No such directory: ${action.payload}` };
        return;
      }

      state.currentPath = target;
      state.history = [...state.history, target];
      state.status = { type: 'info', message: target };
    },
    selectEntry: (state, action: PayloadAction<number | null>) => {
      state.selectedInode = action.payload;
    },
    createDirectory: (state, action: PayloadAction<{ path: string; permissions?: number }>) => {
      const path = resolveFromCwd(state.currentPath, action.payload.path);
      const inode = mkdir(state.fs, path, action.payload.permissions ?? 0o755);

      if (!inode) {
        state.status = {
          type: 'error',
          message: `Cannot create directory: ${action.payload.path}`,
        };
        return;
      }

      state.status = { type: 'info', message: `Directory created: ${path}` };
    },
    createFile: (
      state,
      action: PayloadAction<{ path: string; permissions?: number; content?: string }>,
    ) => {
      const path = resolveFromCwd(state.currentPath, action.payload.path);
      const inode = createRegularFile(
        state.fs,
        path,
        action.payload.permissions ?? 0o644,
        action.payload.content ?? '',
      );

      if (!inode) {
        state.status = { type: 'error', message: `Cannot create file: ${action.payload.path}` };
        return;
      }

      state.status = { type: 'info', message: `File created: ${path}` };
    },
    writeFile: (state, action: PayloadAction<{ path: string; content: string }>) => {
      const path = resolveFromCwd(state.currentPath, action.payload.path);
      const ok = writeFileContent(state.fs, path, action.payload.content);

      state.status = ok
        ? { type: 'info', message: `File written: ${path}` }
        : { type: 'error', message: `Cannot write file: ${action.payload.path}` };
    },
    removePath: (state, action: PayloadAction<string>) => {
      const path = resolveFromCwd(state.currentPath, action.payload);
      const ok = unlink(state.fs, path);

      state.status = ok
        ? { type: 'info', message: `Removed: ${path}` }
        : { type: 'error', message: `Cannot remove: ${action.payload}` };
    },
    changePermissions: (state, action: PayloadAction<{ path: string; permissions: number }>) => {
      const path = resolveFromCwd(state.currentPath, action.payload.path);
      const ok = chmod(state.fs, path, action.payload.permissions);

      state.status = ok
        ? { type: 'info', message: `Mode changed: ${path}` }
        : { type: 'error', message: `Cannot chmod: ${action.payload.path}` };
    },
    changeOwner: (state, action: PayloadAction<{ path: string; uid: number; gid: number }>) => {
      const path = resolveFromCwd(state.currentPath, action.payload.path);
      const ok = chown(state.fs, path, action.payload.uid, action.payload.gid);

      state.status = ok
        ? { type: 'info', message: `Owner changed: ${path}` }
        : { type: 'error', message: `Cannot chown: ${action.payload.path}` };
    },
    createSymlink: (state, action: PayloadAction<{ path: string; target: string }>) => {
      const path = resolveFromCwd(state.currentPath, action.payload.path);
      const inode = symlink(state.fs, path, action.payload.target);

      state.status = inode
        ? { type: 'info', message: `Symlink created: ${path}` }
        : { type: 'error', message: `Cannot create symlink: ${action.payload.path}` };
    },
    createHardLink: (state, action: PayloadAction<{ path: string; existingPath: string }>) => {
      const path = resolveFromCwd(state.currentPath, action.payload.path);
      const existingPath = resolveFromCwd(state.currentPath, action.payload.existingPath);
      const inode = link(state.fs, path, existingPath);

      state.status = inode
        ? { type: 'info', message: `Hard link created: ${path}` }
        : { type: 'error', message: `Cannot create hard link: ${action.payload.path}` };
    },
    clearStatus: (state) => {
      state.status = null;
    },
  },
});

export const {
  changeOwner,
  changePermissions,
  clearStatus,
  createDirectory,
  createFile,
  createHardLink,
  createSymlink,
  goToPath,
  navigate,
  removePath,
  selectEntry,
  writeFile,
} = osSlice.actions;

export const osReducer = osSlice.reducer;

export const selectOsState = (state: { os: OsState }) => state.os;
export const selectCurrentPath = (state: { os: OsState }) => state.os.currentPath;
export const selectOsStatus = (state: { os: OsState }) => state.os.status;
export const selectSelectedInode = (state: { os: OsState }) => state.os.selectedInode;

/**
 * Entradas del directorio actual, ya formateadas.
 * Va memoizada porque devuelve un array nuevo en cada llamada y eso dispara re-renders.
 */
export const selectCurrentEntries = createSelector(
  [(state: { os: OsState }) => state.os.fs, (state: { os: OsState }) => state.os.currentPath],
  (fs, currentPath) => listWithStats(fs, currentPath).map(toEntry),
);

/** Árbol de directorios completo desde la raíz. */
export const selectDirectoryTree = createSelector([(state: { os: OsState }) => state.os.fs], (fs) =>
  buildTree(fs, '/'),
);

/** Estadísticas de uso del filesystem. */
export const selectFilesystemStats = createSelector(
  [(state: { os: OsState }) => state.os.fs],
  (fs) => filesystemStats(fs),
);

/** Contenido de un path, si es un archivo regular. */
export const selectFileContent = (state: { os: OsState }, path: string): string | undefined =>
  readFile(state.os.fs, path);

/** Destino de un enlace simbólico. */
export const selectSymlinkTarget = (state: { os: OsState }, path: string): string | undefined =>
  readlink(state.os.fs, path);

/** Metadatos crudos del inodo de un path. */
export const selectInodeAt = (state: { os: OsState }, path: string): Inode | undefined =>
  stat(state.os.fs, path);
