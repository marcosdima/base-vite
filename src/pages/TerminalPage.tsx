import { useMemo } from 'react';
import { LuInfo } from 'react-icons/lu';
import { Terminal } from '../components/ui/Terminal';
import type { TerminalCommandDefinition } from '../components/ui/Terminal';
import { InodeSimulation } from '../features/simulations/inodes/simulation';
import { ProcessLifecycleSimulation } from '../features/simulations/processes/simulation';

export function TerminalPage() {
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

  const commands = useMemo<Record<string, TerminalCommandDefinition>>(() => {
    return {
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
        description: 'Muestra los metadatos e inodo de un archivo lógico',
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
      echo: {
        description: 'Imprime un mensaje en la terminal',
        usage: 'echo <texto>',
        handler: (args, { print }) => {
          print(args.join(' '));
        },
      },
    };
  }, [inodeSim, procSim]);

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
            disponibles como <code style={{ color: 'var(--active-blue)' }}>stat</code>,{' '}
            <code style={{ color: 'var(--active-blue)' }}>inodes</code>,{' '}
            <code style={{ color: 'var(--active-blue)' }}>ps</code> y{' '}
            <code style={{ color: 'var(--active-blue)' }}>kill</code>.
          </p>
        </div>
      </div>

      <div className="terminal-page-terminal-box" style={{ flex: 1, minHeight: 480 }}>
        <Terminal
          title="guest@so-simulator: ~"
          welcomeMessage="Simulador de Sistemas Operativos · Consola interactiva v1.0.0&#10;Escribe 'help' para descubrir los comandos del sistema de archivos y procesos."
          prompt="so-user@kernel:~$ "
          height="calc(100vh - 160px)"
          commands={commands}
        />
      </div>
    </div>
  );
}
