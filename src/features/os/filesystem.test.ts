import { describe, it, expect } from 'vitest';
import {
  chmod,
  chown,
  createFile,
  findEntry,
  joinPath,
  link,
  mkdir,
  normalizePath,
  readFile,
  readlink,
  stat,
  symlink,
  unlink,
} from './filesystem';
import { createSeedFilesystem } from './seed';

describe('normalizePath', () => {
  it('should collapse redundant separators and dot segments', () => {
    expect(normalizePath('/home//dev/./notes.md')).toBe('/home/dev/notes.md');
  });

  it('should resolve parent segments', () => {
    expect(normalizePath('/home/dev/../etc/hosts')).toBe('/home/etc/hosts');
  });

  it('should never escape the root', () => {
    expect(normalizePath('/../../etc')).toBe('/etc');
  });

  it('should keep relative paths relative', () => {
    expect(normalizePath('dev/notes.md')).toBe('dev/notes.md');
  });
});

describe('joinPath', () => {
  it('should join a directory with a name', () => {
    expect(joinPath('/home/dev', 'notes.md')).toBe('/home/dev/notes.md');
  });

  it('should join against the root directory', () => {
    expect(joinPath('/', 'etc')).toBe('/etc');
  });
});

describe('filesystem operations', () => {
  it('should create a directory and expose it in the parent', () => {
    const fs = createSeedFilesystem();

    const inode = mkdir(fs, '/home/dev/sandbox');

    expect(inode).toBeDefined();
    expect(findEntry(fs, '/home/dev/sandbox')?.inodeNumber).toBe(inode?.number);
  });

  it('should create a regular file with the given content and mode', () => {
    const fs = createSeedFilesystem();

    const inode = createFile(fs, '/home/dev/readme.md', 0o600, 'hola');

    expect((inode?.mode ?? 0) & 0o777).toBe(0o600);
    expect(readFile(fs, '/home/dev/readme.md')).toBe('hola');
  });

  it('should keep the inode when a hard link is created and increment nlink', () => {
    const fs = createSeedFilesystem();
    createFile(fs, '/home/dev/solo.sh', 0o755, '#!/bin/sh\n');
    const before = stat(fs, '/home/dev/solo.sh');

    const linked = link(fs, '/home/dev/solo-copy.sh', '/home/dev/solo.sh');

    expect(linked?.number).toBe(before?.number);
    expect(stat(fs, '/home/dev/solo-copy.sh')?.nlink).toBe(2);
  });

  it('should release the inode only after the last hard link is removed', () => {
    const fs = createSeedFilesystem();
    const original = stat(fs, '/home/dev/run.sh');

    unlink(fs, '/home/dev/run.sh');

    expect(stat(fs, '/home/dev/run-alias.sh')?.number).toBe(original?.number);
    expect(stat(fs, '/home/dev/run-alias.sh')?.nlink).toBe(1);

    unlink(fs, '/home/dev/run-alias.sh');

    expect(stat(fs, '/home/dev/run-alias.sh')).toBeUndefined();
  });

  it('should store the symlink target without following it', () => {
    const fs = createSeedFilesystem();

    const inode = symlink(fs, '/home/dev/latest', '/home/dev/projects');

    expect(inode).toBeDefined();
    expect(readlink(fs, '/home/dev/latest')).toBe('/home/dev/projects');
  });

  it('should update permissions keeping the file type', () => {
    const fs = createSeedFilesystem();

    chmod(fs, '/home/dev/notes.md', 0o600);

    const inode = stat(fs, '/home/dev/notes.md');

    expect((inode?.mode ?? 0) & 0o777).toBe(0o600);
    expect((inode?.mode ?? 0) & 0o170000).toBe(0o100000);
  });

  it('should update the owner', () => {
    const fs = createSeedFilesystem();

    chown(fs, '/home/dev/notes.md', 1000, 1000);

    const inode = stat(fs, '/home/dev/notes.md');

    expect(inode?.uid).toBe(1000);
    expect(inode?.gid).toBe(1000);
  });

  it('should not resolve symlinks when statting', () => {
    const fs = createSeedFilesystem();

    const inode = stat(fs, '/home/dev/current');

    expect((inode?.mode ?? 0) & 0o170000).toBe(0o120000);
  });
});
