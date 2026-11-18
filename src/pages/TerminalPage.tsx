import { useMemo, useRef, useState } from 'react';
import { LuInfo } from 'react-icons/lu';
import { Terminal } from '../components/ui/Terminal';
import type { TerminalCommandDefinition } from '../components/ui/Terminal';
import {
  basename,
  chmod,
  chown,
  createFile,
  filesystemStats,
  joinPath,
  link,
  listDirectory,
  listWithStats,
  mkdir,
  normalizePath,
  readFile,
  readlink,
  resolveDirectory,
  stat as statPath,
  symlink,
  unlink,
} from '../features/os/filesystem';
import { createSeedFilesystem } from '../features/os/seed';
import {
  BLOCK_SIZE,
  BRANCH_FIRST_LOGICAL,
  BlockMap,
  DIRECT_COUNT,
  MAX_DATA_BLOCKS,
  fmt,
  fmtHex,
  formatBytes,
} from '../features/simulations/inodes/blockMap';
import { ProcessLifecycleSimulation } from '../features/simulations/processes/simulation';
import {
  formatModeOctal,
  formatModeSymbolic,
  getFileType,
  parseOctalMode,
} from '../utils/fileMode';

export function TerminalPage() {
  const [cwd, setCwd] = useState('/home/dev');
  const fsRef = useRef(createSeedFilesystem());
  const blockMap = useMemo(() => new BlockMap(1234), []);
  const procSim = useMemo(() => {
    const sim = new ProcessLifecycleSimulation({ seed: 42 });
    sim.applyEvent({ type: 'create', pid: 1, priority: 3, burst_time: 4 });
    sim.applyEvent({ type: 'create', pid: 2, priority: 1, burst_time: 2 });
    sim.applyEvent({ type: 'create', pid: 3, priority: 2, burst_time: 3 });
    sim.applyEvent({ type: 'admit', pid: 1 });
    sim.applyEvent({ type: 'admit', pid: 2 });
    sim.applyEvent({ type: 'admit', pid: 3 });
    sim.applyEvent({ type: 'dispatch', pid: 2 });
    return sim;
  }, []);

  const resolveTarget = (cwdPath: string, inputPath: string): string =>
    normalizePath(inputPath.startsWith('/') ? inputPath : joinPath(cwdPath, inputPath));

  const commands = useMemo<Record<string, TerminalCommandDefinition>>(() => {
    return {
      pwd: {
        description: 'Muestra el directorio de trabajo actual',
        usage: 'pwd',
        handler: (_args, { print }) => {
          print(cwd, 'info');
        },
      },
      ls: {
        description: 'Lista entradas del directorio con inodo, permisos y enlaces',
        usage: 'ls [ruta]',
        handler: (args, { print }) => {
          const targetDir = args[0] ? resolveDirectory(fsRef.current, cwd, args[0]) : cwd;
          if (!targetDir) {
            print(`ls: no se puede acceder a '${args[0]}': No existe el directorio`, 'error');
            return;
          }
          const entries = listWithStats(fsRef.current, targetDir);
          if (entries.length === 0) {
            print('(directorio vacío)', 'muted');
            return;
          }
          print('  INODO  MODO        NLINK  UID:GID   TAMAÑO  NOMBRE', 'info');
          entries.forEach(({ path, inode }) => {
            const inoStr = `#${String(inode.number).padEnd(4)}`;
            const modeStr = formatModeSymbolic(inode.mode).padEnd(11);
            const nlinkStr = String(inode.nlink).padEnd(6);
            const ownerStr = `${inode.uid}:${inode.gid}`.padEnd(9);
            const sizeStr = `${inode.size}B`.padEnd(7);
            const name = basename(path);
            const target =
              getFileType(inode.mode) === 'symlink' ? ` -> ${readlink(fsRef.current, path)}` : '';
            print(`  ${inoStr} ${modeStr} ${nlinkStr} ${ownerStr} ${sizeStr} ${name}${target}`);
          });
        },
      },
      cd: {
        description: 'Cambia el directorio actual en el sistema de archivos virtual',
        usage: 'cd <ruta>',
        handler: (args, { print }) => {
          const dest = resolveDirectory(fsRef.current, cwd, args[0] ?? '/');
          if (!dest) {
            print(`cd: ${args[0]}: No existe el directorio`, 'error');
            return;
          }
          setCwd(dest);
        },
      },
      mkdir: {
        description: 'Crea un directorio nuevo',
        usage: 'mkdir <nombre>',
        handler: (args, { print }) => {
          if (!args[0]) {
            print('Uso: mkdir <nombre>', 'error');
            return;
          }
          const target = resolveTarget(cwd, args[0]);
          const created = mkdir(fsRef.current, target);
          if (!created) {
            print(`mkdir: no se pudo crear '${args[0]}'`, 'error');
            return;
          }
          print(`Directorio creado: ${target} (inodo #${created.number})`, 'success');
        },
      },
      touch: {
        description: 'Crea un archivo regular vacío',
        usage: 'touch <archivo>',
        handler: (args, { print }) => {
          if (!args[0]) {
            print('Uso: touch <archivo>', 'error');
            return;
          }
          const target = resolveTarget(cwd, args[0]);
          const created = createFile(fsRef.current, target);
          if (!created) {
            print(`touch: no se pudo crear '${args[0]}' (¿ya existe?)`, 'error');
            return;
          }
          print(`Archivo creado: ${target} (inodo #${created.number})`, 'success');
        },
      },
      cat: {
        description: 'Muestra el contenido de un archivo regular',
        usage: 'cat <archivo>',
        handler: (args, { print }) => {
          if (!args[0]) {
            print('Uso: cat <archivo>', 'error');
            return;
          }
          const target = resolveTarget(cwd, args[0]);
          const content = readFile(fsRef.current, target);
          if (content === undefined) {
            print(`cat: ${args[0]}: No existe o no es un archivo regular`, 'error');
            return;
          }
          print(content || '(archivo vacío)');
        },
      },
      ln: {
        description: 'Crea un enlace duro o simbólico (-s)',
        usage: 'ln [-s] <origen> <enlace>',
        handler: (args, { print }) => {
          const isSym = args[0] === '-s';
          const operands = isSym ? args.slice(1) : args;
          if (operands.length < 2) {
            print('Uso: ln [-s] <origen> <enlace>', 'error');
            return;
          }
          const source = operands[0]!;
          const linkPath = resolveTarget(cwd, operands[1]!);
          if (isSym) {
            const created = symlink(fsRef.current, linkPath, source);
            if (!created) {
              print(`ln: no se pudo crear el enlace simbólico '${operands[1]}'`, 'error');
              return;
            }
            print(
              `Enlace simbólico: ${linkPath} -> ${source} (inodo #${created.number})`,
              'success',
            );
          } else {
            const sourcePath = resolveTarget(cwd, source);
            const linked = link(fsRef.current, linkPath, sourcePath);
            if (!linked) {
              print(`ln: no se pudo crear el enlace duro a '${source}'`, 'error');
              return;
            }
            print(
              `Enlace duro creado: ${linkPath} === ${sourcePath} (inodo #${linked.number}, nlink=${linked.nlink})`,
              'success',
            );
          }
        },
      },
      rm: {
        description: 'Elimina un archivo, enlace o directorio vacío (unlink)',
        usage: 'rm <ruta>',
        handler: (args, { print }) => {
          if (!args[0]) {
            print('Uso: rm <ruta>', 'error');
            return;
          }
          const target = resolveTarget(cwd, args[0]);
          if (target === cwd || cwd.startsWith(`${target}/`)) {
            print(
              `rm: no se puede eliminar '${args[0]}': Es el directorio de trabajo actual`,
              'error',
            );
            return;
          }
          const inode = statPath(fsRef.current, target);
          if (
            inode &&
            getFileType(inode.mode) === 'directory' &&
            listDirectory(fsRef.current, target).length > 0
          ) {
            print(`rm: no se puede eliminar '${args[0]}': El directorio no está vacío`, 'error');
            return;
          }
          if (!unlink(fsRef.current, target)) {
            print(`rm: no se pudo eliminar '${args[0]}'`, 'error');
            return;
          }
          print(`Entrada eliminada: ${target}`, 'success');
        },
      },
      chmod: {
        description: 'Cambia permisos octales de un archivo o directorio',
        usage: 'chmod <modo_octal> <ruta>',
        handler: (args, { print }) => {
          if (args.length < 2) {
            print('Uso: chmod <modo_octal> <ruta>', 'error');
            return;
          }
          const modeOctal = parseOctalMode(args[0]!);
          const target = resolveTarget(cwd, args[1]!);
          if (Number.isNaN(modeOctal) || !chmod(fsRef.current, target, modeOctal)) {
            print(`chmod: error al aplicar modo '${args[0]}' sobre '${args[1]}'`, 'error');
            return;
          }
          print(`Permisos actualizados en ${target}: ${formatModeOctal(modeOctal)}`, 'success');
        },
      },
      chown: {
        description: 'Cambia propietario (UID y GID) de una ruta',
        usage: 'chown <uid> <gid> <ruta>',
        handler: (args, { print }) => {
          if (args.length < 3) {
            print('Uso: chown <uid> <gid> <ruta>', 'error');
            return;
          }
          const uid = Number.parseInt(args[0]!, 10);
          const gid = Number.parseInt(args[1]!, 10);
          const target = resolveTarget(cwd, args[2]!);
          if (Number.isNaN(uid) || Number.isNaN(gid) || !chown(fsRef.current, target, uid, gid)) {
            print(`chown: no se pudo cambiar el propietario de '${args[2]}'`, 'error');
            return;
          }
          print(`Propietario actualizado en ${target}: ${uid}:${gid}`, 'success');
        },
      },
      df: {
        description: 'Muestra el uso de inodos y bloques del sistema de archivos',
        usage: 'df',
        handler: (_args, { print }) => {
          const stats = filesystemStats(fsRef.current);
          print(
            `Inodos: ${stats.usedInodes}/${stats.inodes} usados (${stats.freeInodes} libres) | Bloques: ${stats.usedBlocks}/${stats.blocks} usados | Tamaño: ${stats.totalSize} B`,
            'info',
          );
        },
      },
      uname: {
        description: 'Muestra información del núcleo del sistema simulado',
        usage: 'uname [-a]',
        handler: (args, { print }) => {
          if (args[0] === '-a') {
            print(
              'Linux so-simulator 6.8.0-generic #24-Ubuntu SMP PREEMPT_DYNAMIC x86_64 GNU/Linux',
              'info',
            );
          } else {
            print('Linux', 'info');
          }
        },
      },
      stat: {
        description:
          'Inspecciona el inodo de una ruta o traduce un bloque lógico L a dirección física',
        usage: 'stat <ruta | bloque_logico>',
        handler: (args, { print }) => {
          const arg = args[0];
          if (!arg) {
            print('Uso: stat <ruta | bloque_logico>', 'error');
            return;
          }

          const targetPath = resolveTarget(cwd, arg);
          const vfsInode = statPath(fsRef.current, targetPath);

          if (vfsInode) {
            const fType = getFileType(vfsInode.mode);
            print(`  Archivo: ${targetPath}`, 'success');
            print(
              `  Inodo: #${vfsInode.number} | Tipo: ${fType} | Enlaces: ${vfsInode.nlink}`,
              'info',
            );
            print(
              `  Modo: ${formatModeSymbolic(vfsInode.mode)} (${formatModeOctal(vfsInode.mode)}) | UID:GID: ${vfsInode.uid}:${vfsInode.gid}`,
              'info',
            );
            print(
              `  Tamaño: ${vfsInode.size} B | Sectores (512B): ${vfsInode.blocks} | Bloque Físico [0]: ${fmtHex(blockMap.directPhysical(0))}`,
              'muted',
            );
            return;
          }

          if (/^\d+$/.test(arg)) {
            const logical = Number.parseInt(arg, 10);
            if (logical < 0 || logical >= MAX_DATA_BLOCKS) {
              print(`stat: bloque lógico fuera de rango (0..${fmt(MAX_DATA_BLOCKS - 1)})`, 'error');
              return;
            }
            const res = blockMap.resolve(logical);
            const hopsStr =
              res.hops.length > 0
                ? res.hops
                    .map((h) => `${h.level}(${fmtHex(h.physical)})[${fmt(h.entry)}]`)
                    .join(' ➜ ') + ' ➜ '
                : '';
            print(
              `Bloque Lógico L = ${fmt(res.logical)} (${formatBytes(res.logical * BLOCK_SIZE)}) ➜ Físico ${fmtHex(res.dataPhysical)}`,
              'success',
            );
            print(
              `Ruta: i_block[${res.slot}] (${res.route}) ➜ ${hopsStr}Datos ${fmtHex(res.dataPhysical)} (${res.diskReads} lectura${res.diskReads === 1 ? '' : 's'})`,
              'info',
            );
            print(`Fórmula: ${res.formula}`, 'muted');
            return;
          }

          print(`stat: no se puede efectuar stat sobre '${arg}': No existe el archivo`, 'error');
        },
      },
      inodes: {
        description: 'Resumen de la tabla de inodos y arquitectura de punteros Ext4 (BlockMap)',
        usage: 'inodes',
        handler: (_args, { print }) => {
          const stats = filesystemStats(fsRef.current);
          const directSample = Array.from({ length: 4 }, (_, i) =>
            fmtHex(blockMap.directPhysical(i)),
          ).join(', ');
          const simpleRoot = fmtHex(blockMap.node({ branch: 'simple', path: [] }).physical);
          const doubleRoot = fmtHex(blockMap.node({ branch: 'double', path: [] }).physical);
          const tripleRoot = fmtHex(blockMap.node({ branch: 'triple', path: [] }).physical);

          print(
            `Tabla VFS: ${stats.usedInodes}/${stats.inodes} inodos activos | Bloques de 4 KB (${formatBytes(BLOCK_SIZE)})`,
            'info',
          );
          print(
            `i_block[0..${DIRECT_COUNT - 1}] Directos (12 bloques · 48 KB): ${directSample} ...`,
            'info',
          );
          print(
            `i_block[12] Ind. Simple (L=${DIRECT_COUNT}..${fmt(BRANCH_FIRST_LOGICAL.double - 1)} · 4 MB): Raíz ${simpleRoot}`,
            'info',
          );
          print(
            `i_block[13] Ind. Doble  (L=${fmt(BRANCH_FIRST_LOGICAL.double)}..${fmt(BRANCH_FIRST_LOGICAL.triple - 1)} · 4 GB): Raíz N1 ${doubleRoot}`,
            'info',
          );
          print(
            `i_block[14] Ind. Triple (L=${fmt(BRANCH_FIRST_LOGICAL.triple)}..${fmt(MAX_DATA_BLOCKS - 1)} · 4 TB): Raíz N1 ${tripleRoot}`,
            'info',
          );
        },
      },
      ps: {
        description: 'Lista los procesos activos y sus estados en el planificador',
        usage: 'ps',
        handler: (_args, { print }) => {
          const snapshot = procSim.getStateSnapshot();
          print('  PID  ESTADO       PRIO  RÁFAGA  RESTANTE  QUANTUM', 'info');
          print('----------------------------------------------------', 'muted');
          Object.values(snapshot.pcbs).forEach((pcb) => {
            const pidStr = String(pcb.pid).padEnd(5);
            const stateStr = pcb.state.padEnd(13);
            const prioStr = String(pcb.priority).padEnd(6);
            const burstStr = String(pcb.burst_time).padEnd(8);
            const remStr = String(pcb.remaining_time).padEnd(10);
            const qStr = String(pcb.quantum_used);
            print(
              `  ${pidStr}${stateStr}${prioStr}${burstStr}${remStr}${qStr}`,
              pcb.state === 'RUNNING' ? 'success' : pcb.state === 'READY' ? 'info' : 'muted',
            );
          });
          print(
            `\nPlanificador: ${snapshot.algorithm} | Quantum: ${snapshot.quantum} | CPU Clock: ${snapshot.current_time}`,
            'muted',
          );
        },
      },
      kill: {
        description: 'Finaliza un proceso del simulador',
        usage: 'kill <pid>',
        handler: (args, { print }) => {
          const pid = parseInt(args[0] ?? '', 10);
          if (isNaN(pid)) {
            print('Uso: kill <pid>', 'error');
            return;
          }
          const pcb = procSim.pcbs[pid];
          if (!pcb) {
            print(`Error: no existe el proceso PID ${pid}`, 'error');
            return;
          }
          if (pcb.state === 'TERMINATED') {
            print(`Aviso: el proceso PID ${pid} ya está TERMINATED`, 'warning');
            return;
          }
          const res = procSim.applyEvent({ type: 'kill', pid });
          if (!res.applied) {
            print(`Error: ${res.reason}`, 'error');
            return;
          }
          print(`Proceso P${pid} finalizado (TERMINATED).`, 'success');
        },
      },
    };
  }, [cwd, blockMap, procSim]);

  return (
    <div
      className="terminal-page-fullscreen"
      style={{
        width: '100%',
        minHeight: 'calc(100vh - 48px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <div
        className="terminal-page-banner"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 18px',
          background: 'rgba(30, 41, 59, 0.7)',
          border: '1px solid var(--border-main)',
          borderRadius: 12,
        }}
      >
        <LuInfo style={{ color: 'var(--active-blue)', fontSize: '1.4rem' }} />
        <div>
          <strong style={{ color: 'var(--text-title)' }}>Terminal interactivo del SO</strong>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Escribe <code style={{ color: 'var(--active-blue)' }}>help</code> para listar comandos
            POSIX (<code style={{ color: 'var(--active-blue)' }}>ls</code>,{' '}
            <code style={{ color: 'var(--active-blue)' }}>cd</code>,{' '}
            <code style={{ color: 'var(--active-blue)' }}>ln</code>,{' '}
            <code style={{ color: 'var(--active-blue)' }}>chmod</code>,{' '}
            <code style={{ color: 'var(--active-blue)' }}>df</code>) y de kernel (
            <code style={{ color: 'var(--active-blue)' }}>stat</code>,{' '}
            <code style={{ color: 'var(--active-blue)' }}>inodes</code>,{' '}
            <code style={{ color: 'var(--active-blue)' }}>ps</code>,{' '}
            <code style={{ color: 'var(--active-blue)' }}>kill</code>).
          </p>
        </div>
      </div>

      <div className="terminal-page-terminal-box" style={{ flex: 1, minHeight: 480 }}>
        <Terminal
          title={`guest@so-simulator: ${cwd}`}
          welcomeMessage="Simulador de Sistemas Operativos · Consola interactiva v1.0.0&#10;Escribe 'help' para descubrir los comandos del sistema de archivos y procesos."
          prompt="so-user@kernel:~$ "
          height="calc(100vh - 160px)"
          commands={commands}
        />
      </div>
    </div>
  );
}
