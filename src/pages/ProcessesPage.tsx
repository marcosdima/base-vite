import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  LuBookOpen,
  LuCircleCheck,
  LuCirclePlay,
  LuClock,
  LuCpu,
  LuFileText,
  LuGauge,
  LuHourglass,
  LuInbox,
  LuList,
  LuLogIn,
  LuLogOut,
  LuMessageSquare,
  LuPause,
  LuPlay,
  LuPlus,
  LuRotateCcw,
  LuSettings2,
  LuSkipBack,
  LuSkipForward,
  LuSlidersHorizontal,
  LuTimer,
  LuTrash2,
  LuTriangleAlert,
  LuX,
  LuZap,
} from 'react-icons/lu';
import {
  SCRIPT_FCFS,
  SCRIPT_PRIORITY,
  SCRIPT_RR,
} from '../features/simulations/processes/demoScripts';
import { ProcessLifecycleSimulation } from '../features/simulations/processes/simulation';
import type {
  ProcessControlBlock,
  ProcessEvent,
  ProcessStateSnapshot,
  SchedulingAlgorithm,
} from '../features/simulations/processes/types';
import { usePlayback } from '../hooks/usePlayback';
import { type ArrowData, type ArrowSpec, computeBezierArrow } from '../utils/bezier';

const ARROW_SPECS: readonly ArrowSpec[] = [
  { from: ['NEW', 'bottom'], to: ['READY', 'left'], dist: 70, label: 'admitir' },
  { from: ['READY', 'right'], to: ['RUNNING', 'left'], dist: 60, bow: 26, label: 'despachar' },
  { from: ['RUNNING', 'top'], to: ['READY', 'top'], dist: 95, label: 'interrumpir' },
  { from: ['RUNNING', 'right'], to: ['TERMINATED', 'bottom'], dist: 60, label: 'salir' },
  {
    from: ['RUNNING', 'bottom'],
    to: ['WAITING', 'right'],
    dist: 45,
    label: 'E/S o evento espera',
  },
  { from: ['WAITING', 'left'], to: ['READY', 'bottom'], dist: 60, label: 'E/S o evento fin' },
];

export function ProcessesPage() {
  const [mode, setMode] = useState<'demo' | 'manual'>('demo');
  const [algorithm, setAlgorithm] = useState<SchedulingAlgorithm>('FCFS');
  const [selectedPid, setSelectedPid] = useState<number | null>(null);

  // Theory modal & Alert dialog
  const [isTheoryOpen, setIsTheoryOpen] = useState<boolean>(false);
  const [theoryTab, setTheoryTab] = useState<'fcfs' | 'rr' | 'priority' | 'sjf' | 'mlfq'>('fcfs');
  const [alertInfo, setAlertInfo] = useState<{ title: string; message: string } | null>(null);

  // Manual simulation state managed via useState (not accessing useRef in render)
  const [manualSim, setManualSim] = useState(() => new ProcessLifecycleSimulation({ seed: 42 }));
  const [manualSnapshot, setManualSnapshot] = useState<ProcessStateSnapshot>(() =>
    manualSim.getStateSnapshot(),
  );
  const [nextPid, setNextPid] = useState<number>(1);
  const [manualNarration, setManualNarration] = useState<{ tag: string; text: string }>({
    tag: 'Modo Manual',
    text: 'Crea procesos o ejecuta transiciones manuales para experimentar.',
  });

  // SVG arrows
  const svgRef = useRef<SVGSVGElement | null>(null);
  const diagramWrapRef = useRef<HTMLDivElement | null>(null);
  const [arrows, setArrows] = useState<ArrowData[]>([]);

  // Demo script resolution
  const currentScript = useMemo(() => {
    switch (algorithm) {
      case 'RR':
        return SCRIPT_RR;
      case 'PRIORITY':
        return SCRIPT_PRIORITY;
      default:
        return SCRIPT_FCFS;
    }
  }, [algorithm]);

  const {
    stepIndex: demoStepIdx,
    isPlaying,
    setIsPlaying,
    speed,
    setSpeed,
    prev: handleDemoPrev,
    next: handleDemoNext,
    togglePlay: handleDemoPlayToggle,
    reset: resetDemoPlayback,
  } = usePlayback({
    totalSteps: currentScript.length,
    initialSpeed: 3000,
    enabled: mode === 'demo',
  });

  // Compute demo simulation up to demoStepIdx
  const demoSimulation = useMemo(() => {
    const sim = new ProcessLifecycleSimulation({ seed: 100 });
    const clampedIdx = Math.min(demoStepIdx, currentScript.length - 1);
    for (let i = 0; i <= clampedIdx; i++) {
      const step = currentScript[i];
      if (step) {
        for (const evt of step.events) {
          sim.applyEvent(evt);
        }
      }
    }
    return sim;
  }, [currentScript, demoStepIdx]);

  const activeSnapshot = mode === 'demo' ? demoSimulation.getStateSnapshot() : manualSnapshot;

  const currentStepData = currentScript[demoStepIdx] || currentScript[0];
  const narration =
    mode === 'demo'
      ? {
          tag: currentStepData?.tag ?? 'Demostración',
          text: currentStepData?.text ?? 'Simulación lista.',
        }
      : manualNarration;

  // Draw arrows connecting diagram nodes
  const updateArrows = useCallback(() => {
    if (!svgRef.current) return;
    const svgRect = svgRef.current.getBoundingClientRect();
    if (svgRect.width === 0 || svgRect.height === 0) return;

    const newArrows: ArrowData[] = [];

    for (const spec of ARROW_SPECS) {
      const fromNode = document.getElementById(`node-${spec.from[0]}`);
      const toNode = document.getElementById(`node-${spec.to[0]}`);
      if (!fromNode || !toNode) continue;

      const r1 = fromNode.getBoundingClientRect();
      const r2 = toNode.getBoundingClientRect();
      newArrows.push(computeBezierArrow(r1, r2, svgRect, spec));
    }

    setArrows(newArrows);
  }, []);

  useEffect(() => {
    const handleResize = () => updateArrows();
    window.addEventListener('resize', handleResize);
    const t = setTimeout(updateArrows, 100);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(t);
    };
  }, [updateArrows]);

  // Handle Mode Change
  const handleModeChange = (newMode: 'demo' | 'manual') => {
    setIsPlaying(false);
    setMode(newMode);
    setSelectedPid(null);
  };

  // Handle Algorithm Change
  const handleAlgoChange = (newAlgo: SchedulingAlgorithm) => {
    resetDemoPlayback(0);
    setAlgorithm(newAlgo);
    setSelectedPid(null);
    if (mode === 'manual') {
      const res = manualSim.applyEvent({
        type: 'set_algorithm',
        payload: { algorithm: newAlgo },
      });
      if (res.applied) {
        setManualSnapshot(manualSim.getStateSnapshot());
        setManualNarration({
          tag: `Planificador · ${newAlgo}`,
          text: `Algoritmo cambiado a ${newAlgo}. Cola de listos reorganizada según la nueva política.`,
        });
      }
    }
  };

  const handleDemoReset = () => {
    resetDemoPlayback(0);
    setSelectedPid(null);
  };

  // Manual actions
  const applyManualEvent = (
    event: ProcessEvent,
    successNarration: { tag: string; text: string },
  ) => {
    const res = manualSim.applyEvent(event);
    if (!res.applied) {
      setAlertInfo({
        title: 'Acción Rechazada por el SO',
        message: res.reason || 'La transición no es válida en el estado actual del proceso.',
      });
    } else {
      setManualSnapshot(manualSim.getStateSnapshot());
      setManualNarration(successNarration);
    }
  };

  const handleCreateProcess = () => {
    const pid = nextPid;
    setNextPid((prev) => prev + 1);
    const burst_time = Math.floor(Math.random() * 4) + 2;
    const priority = Math.floor(Math.random() * 5) + 1;
    applyManualEvent(
      { type: 'create', pid, priority, burst_time },
      {
        tag: 'Creación Manual',
        text: `Proceso P${pid} creado con ráfaga=${burst_time} y prioridad=${priority} en estado NEW.`,
      },
    );
  };

  const handleManualTick = () => {
    applyManualEvent(
      { type: 'tick' },
      {
        tag: 'Tick CPU',
        text: `Avanzó 1 ciclo de reloj (CPU Clock: ${manualSnapshot.current_time + 1}).`,
      },
    );
  };

  const handleManualReset = () => {
    const newSim = new ProcessLifecycleSimulation({ seed: Date.now() });
    setManualSim(newSim);
    setNextPid(1);
    setSelectedPid(null);
    setManualSnapshot(newSim.getStateSnapshot());
    setManualNarration({
      tag: 'Reinicio Manual',
      text: 'Simulación manual vaciada. Crea nuevos procesos para comenzar.',
    });
  };

  const handleManualTransition = (action: string) => {
    switch (action) {
      case 'admit': {
        const newProcs = Object.values(manualSnapshot.pcbs).filter((p) => p.state === 'NEW');
        if (newProcs.length === 0) {
          setAlertInfo({
            title: 'Sin procesos NEW',
            message: 'No hay procesos en la cola de admisión (NEW) para admitir.',
          });
          return;
        }
        const target =
          selectedPid && manualSnapshot.pcbs[selectedPid]?.state === 'NEW'
            ? selectedPid
            : newProcs[0]!.pid;
        applyManualEvent(
          { type: 'admit', pid: target },
          {
            tag: 'Admisión Manual',
            text: `Proceso P${target} admitido en la cola READY.`,
          },
        );
        break;
      }
      case 'dispatch': {
        if (manualSnapshot.ready_queue.length === 0) {
          setAlertInfo({
            title: 'Cola READY Vacía',
            message: 'No hay procesos listos para despachar a la CPU.',
          });
          return;
        }
        const next = manualSim.getNextScheduledPid() || manualSnapshot.ready_queue[0]!;
        applyManualEvent(
          { type: 'dispatch', pid: next },
          {
            tag: 'Despacho Manual',
            text: `Planificador despacha a P${next} al estado RUNNING.`,
          },
        );
        break;
      }
      case 'interrupt': {
        if (manualSnapshot.running === null) {
          setAlertInfo({
            title: 'CPU Inactiva',
            message: 'No hay ningún proceso ejecutándose en la CPU para interrumpir.',
          });
          return;
        }
        applyManualEvent(
          { type: 'interrupt', pid: manualSnapshot.running },
          {
            tag: 'Interrupción Manual',
            text: `Proceso P${manualSnapshot.running} desalojado de la CPU hacia READY.`,
          },
        );
        break;
      }
      case 'io_wait': {
        if (manualSnapshot.running === null) {
          setAlertInfo({
            title: 'CPU Inactiva',
            message: 'No hay ningún proceso en RUNNING para solicitar Entrada/Salida.',
          });
          return;
        }
        applyManualEvent(
          { type: 'io_wait', pid: manualSnapshot.running },
          {
            tag: 'Bloqueo por E/S',
            text: `Proceso P${manualSnapshot.running} bloqueado en espera de E/S (WAITING).`,
          },
        );
        break;
      }
      case 'io_complete': {
        if (manualSnapshot.waiting_queue.length === 0) {
          setAlertInfo({
            title: 'Sin procesos en WAITING',
            message: 'No hay procesos bloqueados esperando finalizar E/S.',
          });
          return;
        }
        const target =
          selectedPid && manualSnapshot.waiting_queue.includes(selectedPid)
            ? selectedPid
            : manualSnapshot.waiting_queue[0]!;
        applyManualEvent(
          { type: 'io_complete', pid: target },
          {
            tag: 'Fin de E/S',
            text: `Operación de E/S completada para P${target}. Reubicado en READY.`,
          },
        );
        break;
      }
      case 'exit': {
        if (manualSnapshot.running === null) {
          setAlertInfo({
            title: 'CPU Inactiva',
            message: 'No hay proceso en RUNNING para finalizar.',
          });
          return;
        }
        applyManualEvent(
          { type: 'exit', pid: manualSnapshot.running },
          {
            tag: 'Salida de Proceso',
            text: `Proceso P${manualSnapshot.running} terminó su ejecución (TERMINATED).`,
          },
        );
        break;
      }
    }
  };

  // Group processes by state
  const processesByState = useMemo(() => {
    const map: Record<string, ProcessControlBlock[]> = {
      NEW: [],
      READY: [],
      RUNNING: [],
      TERMINATED: [],
      WAITING: [],
    };
    Object.values(activeSnapshot.pcbs).forEach((p) => {
      if (map[p.state]) {
        map[p.state]!.push(p);
      }
    });
    return map;
  }, [activeSnapshot]);

  const selectedPcb = selectedPid !== null ? activeSnapshot.pcbs[selectedPid] : null;

  return (
    <section className="process-sim">
      {/* 1. Panel de Narración / Feedback en la parte superior */}
      <div className="proc-narration" id="proc-narration" aria-live="polite">
        <div className="proc-narration-head">
          <div className="narration-title-wrap">
            <LuMessageSquare />
            <span className="proc-narration-tag" id="narration-tag">
              {narration.tag}
            </span>
          </div>
          <button
            type="button"
            className="btn-theory-info"
            id="btn-open-theory"
            title="Ver guía de políticas del planificador"
            onClick={() => setIsTheoryOpen(true)}
          >
            <LuBookOpen /> Guía del Planificador
          </button>
        </div>
        <p className="proc-narration-text" id="narration-text">
          {narration.text}
        </p>
      </div>

      {/* 2. Componente del Gráfico con Diagrama Centrado */}
      <div className="proc-diagram-card">
        <div className="proc-diagram-wrap" ref={diagramWrapRef}>
          <svg className="proc-arrows" ref={svgRef} aria-hidden="true">
            <defs>
              <marker
                id="proc-arrowhead"
                markerWidth="6"
                markerHeight="6"
                refX="5"
                refY="3"
                orient="auto"
              >
                <path d="M0,0 L6,3 L0,6 Z" fill="var(--active-blue)" />
              </marker>
            </defs>
            {arrows.map((arr, i) => (
              <g key={`arrow-${i}`}>
                <path
                  className="arrow-line"
                  d={arr.d}
                  markerEnd="url(#proc-arrowhead)"
                  data-label={arr.label}
                />
                <text
                  className="arrow-label"
                  x={arr.labelPos.x}
                  y={arr.labelPos.y}
                  textAnchor="middle"
                >
                  {arr.label}
                </text>
              </g>
            ))}
          </svg>

          <div className="proc-diagram" id="proc-diagram">
            {/* NEW */}
            <div className="proc-node" id="node-NEW">
              <div className="proc-node-header">
                <LuInbox /> New
              </div>
              <div className="proc-list" id="list-NEW">
                {processesByState.NEW?.map((p) => (
                  <div
                    key={`proc-${p.pid}`}
                    className={`proc-token ${selectedPid === p.pid ? 'selected' : ''}`}
                    id={`proc-token-${p.pid}`}
                    onClick={() => setSelectedPid(p.pid)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') setSelectedPid(p.pid);
                    }}
                    title={`Proceso P${p.pid} (Clic para ver PCB)`}
                    role="button"
                    tabIndex={0}
                  >
                    P{p.pid}
                  </div>
                ))}
              </div>
            </div>

            {/* READY */}
            <div className="proc-node" id="node-READY">
              <div className="proc-node-header">
                <LuList /> Ready
              </div>
              <div className="proc-list" id="list-READY">
                {processesByState.READY?.map((p) => (
                  <div
                    key={`proc-${p.pid}`}
                    className={`proc-token ${selectedPid === p.pid ? 'selected' : ''}`}
                    id={`proc-token-${p.pid}`}
                    onClick={() => setSelectedPid(p.pid)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') setSelectedPid(p.pid);
                    }}
                    title={`Proceso P${p.pid} (Clic para ver PCB)`}
                    role="button"
                    tabIndex={0}
                  >
                    P{p.pid}
                  </div>
                ))}
              </div>
            </div>

            {/* RUNNING */}
            <div className="proc-node" id="node-RUNNING">
              <div className="proc-node-header">
                <LuCpu /> Running
              </div>
              <div className="proc-list" id="list-RUNNING">
                {processesByState.RUNNING?.map((p) => (
                  <div
                    key={`proc-${p.pid}`}
                    className={`proc-token ${selectedPid === p.pid ? 'selected' : ''}`}
                    id={`proc-token-${p.pid}`}
                    onClick={() => setSelectedPid(p.pid)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') setSelectedPid(p.pid);
                    }}
                    title={`Proceso P${p.pid} (Clic para ver PCB)`}
                    role="button"
                    tabIndex={0}
                  >
                    P{p.pid}
                  </div>
                ))}
              </div>
            </div>

            {/* TERMINATED */}
            <div className="proc-node" id="node-TERMINATED">
              <div className="proc-node-header">
                <LuCircleCheck /> Terminated
              </div>
              <div className="proc-list" id="list-TERMINATED">
                {processesByState.TERMINATED?.map((p) => (
                  <div
                    key={`proc-${p.pid}`}
                    className={`proc-token ${selectedPid === p.pid ? 'selected' : ''}`}
                    id={`proc-token-${p.pid}`}
                    onClick={() => setSelectedPid(p.pid)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') setSelectedPid(p.pid);
                    }}
                    title={`Proceso P${p.pid} (Clic para ver PCB)`}
                    role="button"
                    tabIndex={0}
                  >
                    P{p.pid}
                  </div>
                ))}
              </div>
            </div>

            {/* WAITING */}
            <div className="proc-node proc-node-waiting" id="node-WAITING">
              <div className="proc-node-header">
                <LuClock /> Waiting
              </div>
              <div className="proc-list" id="list-WAITING">
                {processesByState.WAITING?.map((p) => (
                  <div
                    key={`proc-${p.pid}`}
                    className={`proc-token ${selectedPid === p.pid ? 'selected' : ''}`}
                    id={`proc-token-${p.pid}`}
                    onClick={() => setSelectedPid(p.pid)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') setSelectedPid(p.pid);
                    }}
                    title={`Proceso P${p.pid} (Clic para ver PCB)`}
                    role="button"
                    tabIndex={0}
                  >
                    P{p.pid}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Inspector Flotante / Tooltip de PCB */}
          <div
            className={`pcb-inspector-panel ${selectedPcb ? '' : 'is-hidden'}`}
            id="pcb-inspector"
          >
            {selectedPcb && (
              <>
                <div className="inspector-header">
                  <div className="inspector-title">
                    <LuFileText />
                    <span>
                      PCB · <strong id="pcb-pid-title">P{selectedPcb.pid}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn-inspector-close"
                    id="btn-close-pcb"
                    title="Cerrar inspector"
                    onClick={() => setSelectedPid(null)}
                  >
                    &times;
                  </button>
                </div>
                <div className="inspector-body">
                  <div className="pcb-field">
                    <span className="pcb-key">Estado:</span>{' '}
                    <span className="pcb-val badge-state" id="pcb-state-val">
                      {selectedPcb.state}
                    </span>
                  </div>
                  <div className="pcb-field">
                    <span className="pcb-key">Prioridad (1-5):</span>
                    <span className="pcb-val-group">
                      <span className="pcb-val" id="pcb-priority-val">
                        {selectedPcb.priority}
                      </span>
                    </span>
                  </div>
                  <div className="pcb-field">
                    <span className="pcb-key">Ráfaga total:</span>
                    <span className="pcb-val-group">
                      <span className="pcb-val" id="pcb-burst-val">
                        {selectedPcb.burst_time}
                      </span>
                    </span>
                  </div>
                  <div className="pcb-field">
                    <span className="pcb-key">Tiempo restante:</span>{' '}
                    <span className="pcb-val" id="pcb-remaining-val">
                      {selectedPcb.remaining_time}
                    </span>
                  </div>
                  <div className="pcb-field">
                    <span className="pcb-key">Quantum consumido:</span>{' '}
                    <span className="pcb-val" id="pcb-quantum-val">
                      {selectedPcb.quantum_used}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 3. Barra de Controles en la Base del Gráfico */}
        <div className="proc-chart-footer">
          {/* Selector de Planificador */}
          <div className="footer-scheduler-bar">
            <div className="sched-algo-group">
              <span className="sched-title">
                <LuSettings2 /> Algoritmo:
              </span>
              <div className="sched-algo-buttons">
                <button
                  type="button"
                  className={`btn-algo-chip ${algorithm === 'FCFS' ? 'active' : ''}`}
                  onClick={() => handleAlgoChange('FCFS')}
                  title="Planificador First-Come, First-Served"
                >
                  FCFS
                </button>
                <button
                  type="button"
                  className={`btn-algo-chip ${algorithm === 'RR' ? 'active' : ''}`}
                  onClick={() => handleAlgoChange('RR')}
                  title="Planificador Round Robin con Quantum"
                >
                  Round Robin
                </button>
                <button
                  type="button"
                  className={`btn-algo-chip ${algorithm === 'PRIORITY' ? 'active' : ''}`}
                  onClick={() => handleAlgoChange('PRIORITY')}
                  title="Planificador por Prioridades"
                >
                  Prioridades
                </button>
              </div>
            </div>

            {/* Conmutador de Modo */}
            <div className="process-mode-switch">
              <button
                type="button"
                id="tab-demo"
                className={`btn btn-tab ${mode === 'demo' ? 'active' : ''}`}
                onClick={() => handleModeChange('demo')}
              >
                <LuCirclePlay /> Demostración
              </button>
              <button
                type="button"
                id="tab-manual"
                className={`btn btn-tab ${mode === 'manual' ? 'active' : ''}`}
                onClick={() => handleModeChange('manual')}
              >
                <LuSlidersHorizontal /> Modo Manual
              </button>
            </div>
          </div>

          {/* Fila de Controles Dinámicos */}
          <div className="footer-ctrl-row">
            {/* Controles de Demostración */}
            {mode === 'demo' && (
              <div className="footer-ctrl-panel" id="controls-demo">
                <div className="ctrl-btn-row">
                  <button
                    type="button"
                    id="btn-prev-step"
                    className="btn btn-ctrl"
                    title="Retroceder un paso en el guion (←)"
                    disabled={demoStepIdx === 0}
                    onClick={handleDemoPrev}
                  >
                    <LuSkipBack /> Anterior
                  </button>
                  <button
                    type="button"
                    id="btn-step"
                    className="btn btn-ctrl btn-highlight"
                    title="Avanzar un paso en el guion (→)"
                    disabled={demoStepIdx === currentScript.length - 1}
                    onClick={handleDemoNext}
                  >
                    <LuSkipForward /> Paso a paso
                  </button>
                  <button
                    type="button"
                    id="btn-play"
                    className={`btn btn-ctrl btn-play ${isPlaying ? '' : 'is-paused'}`}
                    onClick={handleDemoPlayToggle}
                  >
                    {isPlaying ? <LuPause /> : <LuPlay />}
                    <span id="btn-play-label">{isPlaying ? 'Pausar' : 'Reproducir'}</span>
                  </button>
                  <button
                    type="button"
                    id="btn-reset-demo"
                    className="btn btn-ctrl"
                    title="Volver al inicio"
                    onClick={handleDemoReset}
                  >
                    <LuRotateCcw /> Reiniciar
                  </button>
                </div>

                {/* Selector de Velocidad */}
                <div
                  className="speed-segmented-control"
                  role="group"
                  aria-label="Velocidad de reproducción"
                >
                  <span className="speed-label">
                    <LuGauge /> Vel:
                  </span>
                  <button
                    type="button"
                    className={`btn-speed-pill ${speed === 4500 ? 'active' : ''}`}
                    onClick={() => setSpeed(4500)}
                  >
                    0.5x
                  </button>
                  <button
                    type="button"
                    className={`btn-speed-pill ${speed === 3000 ? 'active' : ''}`}
                    onClick={() => setSpeed(3000)}
                  >
                    1x
                  </button>
                  <button
                    type="button"
                    className={`btn-speed-pill ${speed === 1600 ? 'active' : ''}`}
                    onClick={() => setSpeed(1600)}
                  >
                    2x
                  </button>
                </div>
              </div>
            )}

            {/* Controles del Modo Manual */}
            {mode === 'manual' && (
              <div className="footer-ctrl-panel" id="controls-manual">
                <div className="manual-actions-cluster">
                  <div className="ctrl-btn-row">
                    <button
                      type="button"
                      id="btn-add-proc"
                      className="btn btn-primary"
                      title="Crear un nuevo proceso"
                      onClick={handleCreateProcess}
                    >
                      <LuPlus /> Crear Proceso
                    </button>
                    <button
                      type="button"
                      id="btn-tick"
                      className="btn btn-ctrl btn-tick"
                      title="Avanzar 1 ciclo de reloj en la CPU"
                      onClick={handleManualTick}
                    >
                      <LuTimer /> Tick CPU (+1)
                    </button>
                    <span className="clock-badge">
                      CPU: <strong id="clock-display">{manualSnapshot.current_time}</strong>
                    </span>
                    <button
                      type="button"
                      id="btn-reset-manual"
                      className="btn btn-ctrl"
                      title="Vaciar simulación"
                      onClick={handleManualReset}
                    >
                      <LuTrash2 /> Limpiar
                    </button>
                  </div>

                  {/* Botones de Transición */}
                  <div className="manual-transitions-row">
                    <span className="trans-label">Transición:</span>
                    <div className="process-action-buttons">
                      <button
                        type="button"
                        className="btn btn-act"
                        data-action="admit"
                        title="Admitir (NEW → READY)"
                        onClick={() => handleManualTransition('admit')}
                      >
                        <LuLogIn /> Admitir
                      </button>
                      <button
                        type="button"
                        className="btn btn-act"
                        data-action="dispatch"
                        title="Despachar a la CPU según algoritmo activo"
                        onClick={() => handleManualTransition('dispatch')}
                      >
                        <LuCpu /> Despachar
                      </button>
                      <button
                        type="button"
                        className="btn btn-act"
                        data-action="interrupt"
                        title="Interrumpir (RUNNING → READY)"
                        onClick={() => handleManualTransition('interrupt')}
                      >
                        <LuZap /> Interrumpir
                      </button>
                      <button
                        type="button"
                        className="btn btn-act"
                        data-action="io_wait"
                        title="Espera de E/S (RUNNING → WAITING)"
                        onClick={() => handleManualTransition('io_wait')}
                      >
                        <LuHourglass /> E/S espera
                      </button>
                      <button
                        type="button"
                        className="btn btn-act"
                        data-action="io_complete"
                        title="Fin de E/S (WAITING → READY)"
                        onClick={() => handleManualTransition('io_complete')}
                      >
                        <LuCircleCheck /> E/S fin
                      </button>
                      <button
                        type="button"
                        className="btn btn-act"
                        data-action="exit"
                        title="Finalizar proceso (RUNNING → TERMINATED)"
                        onClick={() => handleManualTransition('exit')}
                      >
                        <LuLogOut /> Salir
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Flotante de Teoría (Políticas del planificador) */}
      {isTheoryOpen && (
        <div className="theory-modal-backdrop" id="theory-modal">
          <div
            className="theory-modal-card"
            role="dialog"
            aria-labelledby="modal-title"
            aria-modal="true"
          >
            <div className="theory-modal-header">
              <div className="modal-title-group">
                <LuBookOpen />
                <h3 id="modal-title">Políticas del Planificador de Corto Plazo</h3>
              </div>
              <button
                type="button"
                className="btn-modal-close"
                id="btn-close-modal"
                aria-label="Cerrar ventana"
                onClick={() => setIsTheoryOpen(false)}
              >
                <LuX />
              </button>
            </div>

            <div className="theory-modal-tabs">
              <button
                type="button"
                className={`btn-modal-tab ${theoryTab === 'fcfs' ? 'active' : ''}`}
                onClick={() => setTheoryTab('fcfs')}
              >
                FCFS / FIFO
              </button>
              <button
                type="button"
                className={`btn-modal-tab ${theoryTab === 'rr' ? 'active' : ''}`}
                onClick={() => setTheoryTab('rr')}
              >
                Round Robin
              </button>
              <button
                type="button"
                className={`btn-modal-tab ${theoryTab === 'priority' ? 'active' : ''}`}
                onClick={() => setTheoryTab('priority')}
              >
                Prioridades
              </button>
              <button
                type="button"
                className={`btn-modal-tab ${theoryTab === 'sjf' ? 'active' : ''}`}
                onClick={() => setTheoryTab('sjf')}
              >
                SJF / SRTF
              </button>
              <button
                type="button"
                className={`btn-modal-tab ${theoryTab === 'mlfq' ? 'active' : ''}`}
                onClick={() => setTheoryTab('mlfq')}
              >
                Colas Multinivel
              </button>
            </div>

            <div className="theory-modal-body">
              {theoryTab === 'fcfs' && (
                <div className="theory-tab-content active" id="tab-content-fcfs">
                  <h4>First-Come, First-Served (FCFS / FIFO)</h4>
                  <span className="algo-badge">No Preemptivo</span>
                  <p>
                    Los procesos se atienden estrictamente por orden de llegada a la cola de{' '}
                    <code>READY</code>. Cuando un proceso obtiene la CPU, conserva el procesador
                    hasta finalizar su ráfaga o solicitar una operación de Entrada/Salida.
                  </p>
                  <div className="theory-pros-cons">
                    <div className="pro">
                      <strong>Ventaja:</strong> Implementación sencilla mediante una cola FIFO sin
                      sobrecarga de planificación.
                    </div>
                    <div className="con">
                      <strong>Desventaja:</strong> Efecto Convoy: un proceso intensivo en CPU
                      retrasa la ejecución de los procesos cortos encolados posteriormente,
                      incrementando el tiempo medio de espera.
                    </div>
                  </div>
                </div>
              )}

              {theoryTab === 'rr' && (
                <div className="theory-tab-content active" id="tab-content-rr">
                  <h4>Round Robin (Turno Rotatorio)</h4>
                  <span className="algo-badge">Preemptivo por Temporizador</span>
                  <p>
                    Cada proceso recibe una fracción fija de tiempo de procesador denominada{' '}
                    <strong>Quantum (q)</strong>. Al expirar el quantum, el temporizador del sistema
                    genera una interrupción y el proceso es reubicado al final de la cola de{' '}
                    <code>READY</code>.
                  </p>
                  <div className="theory-pros-cons">
                    <div className="pro">
                      <strong>Ventaja:</strong> Garantiza un tiempo de respuesta acotado para
                      sistemas interactivos y de tiempo compartido, evitando la inanición
                      (starvation).
                    </div>
                    <div className="con">
                      <strong>Desventaja:</strong> Si el quantum es demasiado reducido, la
                      sobrecarga por cambios de contexto (context switch) degrada el rendimiento; si
                      es excesivamente amplio, su comportamiento converge a FCFS.
                    </div>
                  </div>
                </div>
              )}

              {theoryTab === 'priority' && (
                <div className="theory-tab-content active" id="tab-content-priority">
                  <h4>Planificación por Prioridades</h4>
                  <span className="algo-badge">Preemptivo o No Preemptivo</span>
                  <p>
                    A cada proceso se le asigna un valor numérico de prioridad. La CPU se asigna al
                    proceso de mayor prioridad disponible (en este simulador, 1 es la máxima
                    prioridad y 5 la mínima).
                  </p>
                  <div className="theory-pros-cons">
                    <div className="pro">
                      <strong>Ventaja:</strong> Permite priorizar tareas críticas del sistema
                      operativo o procesos de tiempo real sobre tareas en segundo plano.
                    </div>
                    <div className="con">
                      <strong>Desventaja:</strong> Inanición (Starvation): los procesos de baja
                      prioridad pueden esperar indefinidamente si siguen llegando procesos
                      prioritarios. Se soluciona con <em>envejecimiento (aging)</em>.
                    </div>
                  </div>
                </div>
              )}

              {theoryTab === 'sjf' && (
                <div className="theory-tab-content active" id="tab-content-sjf">
                  <h4>Shortest Job First / Shortest Remaining Time First</h4>
                  <span className="algo-badge">Óptimo en tiempo de espera</span>
                  <p>
                    Selecciona el proceso con la ráfaga de CPU más corta. En su versión preemptiva
                    (SRTF), si llega un proceso nuevo con menor tiempo restante que el que está
                    corriendo, lo desaloja.
                  </p>
                  <div className="theory-pros-cons">
                    <div className="pro">
                      <strong>Ventaja:</strong> Es demostrablemente óptimo para minimizar el tiempo
                      de espera promedio.
                    </div>
                    <div className="con">
                      <strong>Desventaja:</strong> En la práctica es imposible conocer con exactitud
                      la duración de la próxima ráfaga de CPU; se debe estimar mediante promedios
                      exponenciales.
                    </div>
                  </div>
                </div>
              )}

              {theoryTab === 'mlfq' && (
                <div className="theory-tab-content active" id="tab-content-mlfq">
                  <h4>Colas Multinivel con Retroalimentación (MLFQ)</h4>
                  <span className="algo-badge">Híbrido Avanzado</span>
                  <p>
                    Divide la cola de listos en múltiples colas con distintas prioridades y
                    cuantums. Un proceso que agota su quantum desciende de nivel de prioridad
                    (penalización a procesos orientados a CPU), mientras que los procesos
                    interactivos se mantienen en niveles altos.
                  </p>
                  <div className="theory-pros-cons">
                    <div className="pro">
                      <strong>Ventaja:</strong> Aprende dinámicamente el comportamiento del proceso
                      sin necesidad de estimaciones a priori. Es la base de los planificadores de
                      Linux y Windows.
                    </div>
                    <div className="con">
                      <strong>Desventaja:</strong> Es el más complejo de configurar y calibrar.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dialog Modal de Advertencias / Motivo de Rechazo del SO */}
      {alertInfo && (
        <dialog id="so-alert-dialog" className="so-alert-dialog" open>
          <div className="so-dialog-card">
            <div className="so-dialog-head">
              <LuTriangleAlert />
              <h4 id="so-dialog-title">{alertInfo.title}</h4>
            </div>
            <p id="so-dialog-msg" className="so-dialog-msg">
              {alertInfo.message}
            </p>
            <div className="so-dialog-footer">
              <button
                type="button"
                id="btn-close-so-dialog"
                className="btn btn-ctrl"
                onClick={() => setAlertInfo(null)}
              >
                Entendido
              </button>
            </div>
          </div>
        </dialog>
      )}
    </section>
  );
}
