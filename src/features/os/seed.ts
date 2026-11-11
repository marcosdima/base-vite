import { createFilesystem, mkdir, createFile, symlink, link, type Filesystem } from './filesystem';

/**
 * Crea un filesystem de ejemplo con la misma forma que un árbol POSIX típico.
 * Se usa como estado inicial para que la UI tenga contenido que inspeccionar.
 */
export function createSeedFilesystem(): Filesystem {
  const fs = createFilesystem(() => 1735689600000); // 2025-01-01T00:00:00Z, fijo para tests

  mkdir(fs, '/home');
  mkdir(fs, '/home/dev', 0o750);
  mkdir(fs, '/home/dev/projects');
  mkdir(fs, '/etc');
  mkdir(fs, '/var');
  mkdir(fs, '/var/log');

  createFile(fs, '/home/dev/notes.md', 0o644, '# Notas\n\nApuntes del proyecto.\n');
  createFile(fs, '/home/dev/.bashrc', 0o644, 'export PS1="dev@host:~$"\n');
  createFile(fs, '/home/dev/projects/app.log', 0o600, 'boot ok\n');
  createFile(fs, '/etc/hosts', 0o644, '127.0.0.1 localhost\n');
  createFile(fs, '/etc/passwd', 0o644, 'root:x:0:0:root:/root:/bin/bash\n');
  createFile(fs, '/var/log/syslog', 0o640, 'system boot\n');

  const executable = createFile(fs, '/home/dev/run.sh', 0o755, '#!/bin/sh\necho ok\n');

  if (!executable) {
    throw new Error('No se pudo crear el archivo de ejemplo run.sh');
  }

  symlink(fs, '/home/dev/current', '/home/dev/projects');
  // El enlace duro comparte inodo con run.sh, así que nlink pasa a 2.
  link(fs, '/home/dev/run-alias.sh', '/home/dev/run.sh');

  return fs;
}
