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
  listWithStats,
  mkdir,
  normalizePath,
  readFile,
  readlink,
  resolveDirectory,
  symlink,
  unlink,
} from '../features/os/filesystem';
import { createSeedFilesystem } from '../features/os/seed';
import { InodeSimulation } from '../features/simulations/inodes/simulation';
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
  const inodeSim = useMemo(() => new InodeSimulation({ seed: 1234 }), []);
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
        description: 'Elimina una entrada de directorio (unlink)',
        usage: 'rm <ruta>',
        handler: (args, { print }) => {
          if (!args[0]) {
            print('Uso: rm <ruta>', 'error');
            return;
          }
          const target = resolveTarget(cwd, args[0]);
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
        description: 'Muestra la resolución de bloque físico de una posición lógica (1-28)',
        usage: 'stat <posicion_logica (1-28)>',
        handler: (args, { print }) => {
          const pos = parseInt(args[0] ?? '1', 10);
          if (isNaN(pos) || pos < 1 || pos > 28) {
            print('Uso: stat <posicion_logica entre 1 y 28>', 'error');
            return;
          }
          const res = inodeSim.resolvePosition(pos);
          print(
            `Inodo #12 | Posición Lógica: ${pos} ➜ Bloque Físico #${String(res.physical_block).padStart(2, '0')}`,
            'success',
          );
          print(`Ruta: ${res.route_type} [${res.pointer_label}]`, 'info');
          print(`Cálculo: ${res.formal_calc}`, 'muted');
        },
      },
      inodes: {
        description: 'Resumen de inodos y distribución del disco de 100 bloques',
        usage: 'inodes',
        handler: (_args, { print }) => {
          const struct = inodeSim.getStructure();
          print(`Inodo ID: #${struct.inode_id}`, 'info');
          print(`Modo: ${struct.mode} | UID: ${struct.uid} | GID: ${struct.gid}`, 'muted');
          print(`Total Posiciones Lógicas: ${struct.total_logical_positions}`, 'muted');
          print(
            `Punteros Directos: 12 (Bloques: ${struct.direct_pointers.map((d) => `#${d.block}`).join(', ')})`,
            'info',
          );
          print(`Índice Simple: Bloque #${struct.indirect_simple.block_id}`, 'info');
          print(`Índice Doble: Bloque N1 #${struct.indirect_double.block_id}`, 'info');
          print(`Índice Triple: Bloque N1 #${struct.indirect_triple.block_id}`, 'info');
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
          procSim.applyEvent({ type: 'exit', pid });
          print(`Proceso P${pid} finalizado (TERMINATED).`, 'success');
        },
      },
    };
  }, [cwd, inodeSim, procSim]);

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
