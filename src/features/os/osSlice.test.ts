import { describe, it, expect } from 'vitest';
import {
  changeOwner,
  changePermissions,
  createDirectory,
  createFile,
  createHardLink,
  createSymlink,
  goToPath,
  osReducer,
  removePath,
  selectCurrentEntries,
  selectFilesystemStats,
  selectInodeAt,
  selectSymlinkTarget,
  type OsState,
} from './osSlice';

const buildState = (): OsState => osReducer(undefined, { type: '@@INIT' });

describe('osSlice', () => {
  it('should start in the seeded home directory', () => {
    const state = buildState();

    expect(state.currentPath).toBe('/home/dev');
  });

  it('should navigate to an absolute directory', () => {
    const state = osReducer(buildState(), goToPath('/etc'));

    expect(state.currentPath).toBe('/etc');
    expect(state.status?.type).toBe('info');
  });

  it('should navigate relative to the current directory', () => {
    const state = osReducer(buildState(), goToPath('projects'));

    expect(state.currentPath).toBe('/home/dev/projects');
  });

  it('should report an error when the directory does not exist', () => {
    const state = osReducer(buildState(), goToPath('/nope'));

    expect(state.currentPath).toBe('/home/dev');
    expect(state.status?.type).toBe('error');
  });

  it('should create a directory and list it', () => {
    const state = osReducer(buildState(), createDirectory({ path: 'sandbox' }));
    const entries = selectCurrentEntries({ os: state });

    expect(entries.map((entry) => entry.name)).toContain('sandbox');
  });

  it('should create a file with content', () => {
    const state = osReducer(buildState(), createFile({ path: 'hello.txt', content: 'hola' }));

    expect(state.status?.type).toBe('info');
    expect(selectInodeAt({ os: state }, '/home/dev/hello.txt')).toBeDefined();
  });

  it('should share the inode between hard links', () => {
    const before = buildState();
    const originalBefore = selectInodeAt({ os: before }, '/home/dev/run.sh');
    const nlinkBefore = originalBefore?.nlink ?? 0;

    const state = osReducer(before, createHardLink({ path: 'alias.sh', existingPath: 'run.sh' }));

    const original = selectInodeAt({ os: state }, '/home/dev/run.sh');
    const alias = selectInodeAt({ os: state }, '/home/dev/alias.sh');

    expect(alias?.number).toBe(original?.number);
    expect(alias?.nlink).toBe(nlinkBefore + 1);
  });

  it('should store the symlink target', () => {
    const state = osReducer(buildState(), createSymlink({ path: 'link-to-etc', target: '/etc' }));

    expect(selectSymlinkTarget({ os: state }, '/home/dev/link-to-etc')).toBe('/etc');
  });

  it('should change permissions', () => {
    const state = osReducer(
      buildState(),
      changePermissions({ path: '/home/dev/notes.md', permissions: 0o600 }),
    );

    expect((selectInodeAt({ os: state }, '/home/dev/notes.md')?.mode ?? 0) & 0o777).toBe(0o600);
  });

  it('should change the owner', () => {
    const state = osReducer(
      buildState(),
      changeOwner({ path: '/home/dev/notes.md', uid: 1000, gid: 1000 }),
    );

    const inode = selectInodeAt({ os: state }, '/home/dev/notes.md');

    expect(inode?.uid).toBe(1000);
    expect(inode?.gid).toBe(1000);
  });

  it('should remove a path', () => {
    const state = osReducer(buildState(), removePath('/home/dev/notes.md'));

    expect(state.status?.type).toBe('info');
    expect(selectInodeAt({ os: state }, '/home/dev/notes.md')).toBeUndefined();
  });

  it('should keep the inode alive while another hard link exists', () => {
    const state = osReducer(buildState(), removePath('/home/dev/run.sh'));

    expect(selectInodeAt({ os: state }, '/home/dev/run-alias.sh')).toBeDefined();
  });

  it('should report usage statistics', () => {
    const stats = selectFilesystemStats({ os: buildState() });

    expect(stats.usedInodes).toBeGreaterThan(0);
    expect(stats.freeInodes).toBe(stats.inodes - stats.usedInodes);
    expect(stats.totalSize).toBeGreaterThan(0);
  });
});
