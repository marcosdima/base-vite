import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
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
  SCRIPT_SJF,
} from '../features/simulations/processes/demoScripts';
import { ProcessLifecycleSimulation } from '../features/simulations/processes/simulation';
import type {
  ProcessControlBlock,
  ProcessEvent,
  ProcessState,
  ProcessStateSnapshot,
  SchedulingAlgorithm,
} from '../features/simulations/processes/types';
import { usePlayback } from '../hooks/usePlayback';
import { type ArrowData, type ArrowSpec, type RectLike, computeBezierArrow } from '../utils/bezier';
import { animateAlongCurve, animateFlip, resetElementMotion } from '../utils/motion';

const ARROW_SPECS: readonly ArrowSpec[] = [
  { from: ['NEW', 'bottom'], to: ['READY', 'left'], dist: 70, labelOffset: 0, label: 'Admitir' },
  {
    from: ['READY', 'right'],
    to: ['RUNNING', 'left'],
    dist: 60,
    bow: 26,
    labelOffset: 16,
    label: 'Despachar',
  },
  {
    from: ['RUNNING', 'top'],
    to: ['READY', 'top'],
    dist: 95,
    labelOffset: 16,
    label: 'Interrumpir',
  },
  {
    from: ['RUNNING', 'right'],
    to: ['TERMINATED', 'bottom'],
    dist: 60,
    labelOffset: 0,
    label: 'Salir',
  },
  {
    from: ['RUNNING', 'bottom'],
    to: ['WAITING', 'right'],
    dist: 45,
    labelOffset: 0,
    label: 'E/S o evento espera',
  },
  {
    from: ['WAITING', 'left'],
    to: ['READY', 'bottom'],
    dist: 60,
    labelOffset: 0,
    label: 'E/S o evento fin',
  },
];

export function ProcessesPage() {
  const [mode, setMode] = useState<'demo' | 'manual'>('demo');
  const [algorithm, setAlgorithm] = useState<SchedulingAlgorithm>('FCFS');
  const [selectedPid, setSelectedPid] = useState<number | null>(null);
  const [manualActiveTransition, setManualActiveTransition] = useState<string | null>(null);

  // Theory modal & Alert dialog
  const [isTheoryOpen, setIsTheoryOpen] = useState<boolean>(false);
  const [theoryTab, setTheoryTab] = useState<'fcfs' | 'rr' | 'sjf' | 'priority' | 'mlfq'>('fcfs');
  const [alertInfo, setAlertInfo] = useState<{ title: string; message: string } | null>(null);

  const openTheoryModal = () => {
    setTheoryTab(algorithm.toLowerCase() as 'fcfs' | 'rr' | 'sjf' | 'priority');
    setIsTheoryOpen(true);
  };

  // Draggable PCB inspector position relative to diagramWrapRef
  const pcbPanelRef = useRef<HTMLDivElement | null>(null);
  const [pcbPos, setPcbPos] = useState<{ x: number; y: number } | null>(null);
  const [isDraggingPcb, setIsDraggingPcb] = useState<boolean>(false);

  // Manual simulation state managed via useState
  const [manualSim, setManualSim] = useState(() => new ProcessLifecycleSimulation({ seed: 42 }));
  const [manualSnapshot, setManualSnapshot] = useState<ProcessStateSnapshot>(() =>
    manualSim.getStateSnapshot(),
  );
  const [nextPid, setNextPid] = useState<number>(1);
  const [manualNarration, setManualNarration] = useState<{ tag: string; text: string }>({
    tag: 'Modo Manual',
    text: 'Crea procesos o ejecuta transiciones manuales para experimentar.',
  });

  // SVG arrows & FLIP/Bezier token animation tracking
  const svgRef = useRef<SVGSVGElement | null>(null);
  const diagramWrapRef = useRef<HTMLDivElement | null>(null);
  const [arrows, setArrows] = useState<ArrowData[]>([]);
  const prevTokenRectsRef = useRef<Record<number, { rect: RectLike; state: ProcessState }>>({});

  // Demo script resolution
  const currentScript = useMemo(() => {
    switch (algorithm) {
      case 'RR':
        return SCRIPT_RR;
      case 'SJF':
        return SCRIPT_SJF;
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
  const activeTransition =
    mode === 'demo' ? (currentStepData?.transition ?? null) : manualActiveTransition;

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

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => updateArrows());
      if (diagramWrapRef.current) observer.observe(diagramWrapRef.current);
      for (const state of ['NEW', 'READY', 'RUNNING', 'WAITING', 'TERMINATED']) {
        const el = document.getElementById(`node-${state}`);
        if (el) observer.observe(el);
      }
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(t);
      observer?.disconnect();
    };
  }, [updateArrows]);

  // Keyboard shortcuts: Escape closes modals; ArrowLeft/ArrowRight step through demo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (alertInfo) {
          setAlertInfo(null);
          return;
        }
        if (isTheoryOpen) {
          setIsTheoryOpen(false);
          return;
        }
      }

      if (mode !== 'demo' || isTheoryOpen || alertInfo) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'SELECT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleDemoPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleDemoNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, isTheoryOpen, alertInfo, handleDemoPrev, handleDemoNext]);

  // Drag handler for floating PCB inspector
  const handlePcbDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    if (!pcbPanelRef.current || !diagramWrapRef.current) return;

    e.preventDefault();
    const wrapRect = diagramWrapRef.current.getBoundingClientRect();
    const panelRect = pcbPanelRef.current.getBoundingClientRect();

    const startX = pcbPos ? pcbPos.x : panelRect.left - wrapRect.left;
    const startY = pcbPos ? pcbPos.y : panelRect.top - wrapRect.top;
    const startClientX = e.clientX;
    const startClientY = e.clientY;

    setIsDraggingPcb(true);

    const handleMouseMove = (moveEvt: MouseEvent) => {
      const dx = moveEvt.clientX - startClientX;
      const dy = moveEvt.clientY - startClientY;
      const maxX = Math.max(8, wrapRect.width - panelRect.width - 8);
      const maxY = Math.max(8, wrapRect.height - panelRect.height - 8);
      setPcbPos({
        x: Math.max(8, Math.min(maxX, startX + dx)),
        y: Math.max(8, Math.min(maxY, startY + dy)),
      });
    };

    const handleMouseUp = () => {
      setIsDraggingPcb(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Smooth Bezier/FLIP animations: tokens ride the exact SVG transition curve between state boxes
  useLayoutEffect(() => {
    const nextRects: Record<number, { rect: RectLike; state: ProcessState }> = {};
    const pcbs = Object.values(activeSnapshot.pcbs);
    const svgRect = svgRef.current?.getBoundingClientRect() ?? null;

    // 1. Cancel any running animations first so we measure true resting layout positions
    for (const pcb of pcbs) {
      const el = document.getElementById(`proc-token-${pcb.pid}`);
      if (el) resetElementMotion(el);
    }

    // 2. Measure resting rects and animate each moved token
    for (const pcb of pcbs) {
      const el = document.getElementById(`proc-token-${pcb.pid}`);
      if (!el) continue;
      const domRect = el.getBoundingClientRect();
      const rect: RectLike = {
        left: domRect.left,
        top: domRect.top,
        width: domRect.width,
        height: domRect.height,
      };
      nextRects[pcb.pid] = { rect, state: pcb.state };

      const prev = prevTokenRectsRef.current[pcb.pid];
      if (!prev) continue;

      const spec =
        prev.state !== pcb.state
          ? ARROW_SPECS.find((s) => s.from[0] === prev.state && s.to[0] === pcb.state)
          : undefined;

      if (spec && svgRect && svgRect.width > 0 && svgRect.height > 0) {
        const fromNode = document.getElementById(`node-${spec.from[0]}`);
        const toNode = document.getElementById(`node-${spec.to[0]}`);
        if (fromNode && toNode) {
          const arrow = computeBezierArrow(
            fromNode.getBoundingClientRect(),
            toNode.getBoundingClientRect(),
            svgRect,
            spec,
          );
          animateAlongCurve(el, prev.rect, rect, arrow.ctrl, svgRect);
          continue;
        }
      }

      animateFlip(el, prev.rect.left - rect.left, prev.rect.top - rect.top);
    }

    prevTokenRectsRef.current = nextRects;
  }, [activeSnapshot]);

  // Handle Mode Change
  const handleModeChange = (newMode: 'demo' | 'manual') => {
    setIsPlaying(false);
    setMode(newMode);
    setSelectedPid(null);
    setManualActiveTransition(null);
  };

  // Handle Algorithm Change
  const handleAlgoChange = (newAlgo: SchedulingAlgorithm) => {
    resetDemoPlayback(0);
    setAlgorithm(newAlgo);
    setSelectedPid(null);
    setManualActiveTransition(null);
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
    transitionLabel: string | null = null,
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
      setManualActiveTransition(transitionLabel);
    }
  };

  const handleCreateProcess = () => {
    const pid = nextPid;
    setNextPid((prev) => prev + 1);
    const burst_time = Math.floor(Math.random() * 5) + 2;
    const priority = Math.floor(Math.random() * 5) + 1;

    let detailText = `ráfaga=${burst_time}`;
    if (algorithm === 'PRIORITY') {
      detailText = `prioridad=${priority}, ráfaga=${burst_time}`;
    } else if (algorithm === 'SJF') {
      detailText = `ráfaga estimada=${burst_time}`;
    } else if (algorithm === 'RR') {
      detailText = `ráfaga=${burst_time}, quantum=${manualSnapshot.quantum}`;
    }

    applyManualEvent(
      { type: 'create', pid, priority, burst_time },
      {
        tag: 'Creación Manual',
        text: `Proceso P${pid} creado en estado NEW (${detailText}).`,
      },
      null,
    );
  };

  const handleUpdatePcbField = (field: 'priority' | 'burst_time', delta: number) => {
    if (selectedPid === null || mode !== 'manual') return;
    const pcb = manualSnapshot.pcbs[selectedPid];
    if (!pcb || pcb.state === 'TERMINATED') return;

    if (field === 'priority') {
      const nextPrio = Math.min(5, Math.max(1, pcb.priority + delta));
      if (nextPrio === pcb.priority) return;
      applyManualEvent(
        { type: 'update_pcb', pid: selectedPid, priority: nextPrio },
        {
          tag: 'Actualización de PCB',
          text: `Prioridad de P${selectedPid} actualizada a ${nextPrio}.`,
        },
      );
    } else {
      const nextBurst = Math.min(20, Math.max(1, pcb.burst_time + delta));
      if (nextBurst === pcb.burst_time) return;
      applyManualEvent(
        { type: 'update_pcb', pid: selectedPid, burst_time: nextBurst },
        {
          tag: 'Actualización de PCB',
          text: `Ráfaga de CPU de P${selectedPid} ajustada a ${nextBurst}.`,
        },
      );
    }
  };

  const handleManualTick = () => {
    const prevRunning = manualSnapshot.running;
    const res = manualSim.applyEvent({ type: 'tick' });
    if (!res.applied) {
      setAlertInfo({
        title: 'Acción Rechazada por el SO',
        message: res.reason || 'La CPU está inactiva.',
      });
      return;
    }
    const nextSnap = manualSim.getStateSnapshot();
    setManualSnapshot(nextSnap);

    if (prevRunning !== null && nextSnap.pcbs[prevRunning]?.state === 'TERMINATED') {
      setManualActiveTransition('Salir');
      setManualNarration({
        tag: 'Tick CPU · Fin de Ráfaga',
        text: `P${prevRunning} agotó su tiempo restante en el ciclo ${nextSnap.current_time} y pasó a TERMINATED.`,
      });
    } else if (prevRunning !== null && nextSnap.pcbs[prevRunning]?.state === 'READY') {
      setManualActiveTransition('Interrumpir');
      setManualNarration({
        tag: 'Tick CPU · Quantum Expirado',
        text: `P${prevRunning} agotó su quantum (${nextSnap.quantum} ticks) y fue desalojado hacia READY.`,
      });
    } else {
      setManualActiveTransition(null);
      setManualNarration({
        tag: 'Tick CPU',
        text: `Avanzó 1 ciclo de reloj (CPU Clock: ${nextSnap.current_time}).`,
      });
    }
  };

  const handleManualReset = () => {
    const newSim = new ProcessLifecycleSimulation({ seed: Date.now() });
    newSim.applyEvent({ type: 'set_algorithm', payload: { algorithm } });
    setManualSim(newSim);
    setNextPid(1);
    setSelectedPid(null);
    setManualActiveTransition(null);
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
          'Admitir',
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
            text: `Planificador (${algorithm}) despacha a P${next} al estado RUNNING.`,
          },
          'Despachar',
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
          'Interrumpir',
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
          'E/S o evento espera',
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
          'E/S o evento fin',
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
          'Salir',
        );
        break;
      }
    }
  };

  // Group processes by state respecting actual queue order in READY, WAITING, and TERMINATED
  const processesByState = useMemo(() => {
    const newList = Object.values(activeSnapshot.pcbs).filter((p) => p.state === 'NEW');
    const readyList = activeSnapshot.ready_queue
      .map((pid) => activeSnapshot.pcbs[pid])
      .filter((p): p is ProcessControlBlock => Boolean(p));
    const runningList =
      activeSnapshot.running !== null && activeSnapshot.pcbs[activeSnapshot.running]
        ? [activeSnapshot.pcbs[activeSnapshot.running]!]
        : [];
    const waitingList = activeSnapshot.waiting_queue
      .map((pid) => activeSnapshot.pcbs[pid])
      .filter((p): p is ProcessControlBlock => Boolean(p));
    const terminatedList = activeSnapshot.terminated
      .map((pid) => activeSnapshot.pcbs[pid])
      .filter((p): p is ProcessControlBlock => Boolean(p));

    return {
      NEW: newList,
      READY: readyList,
      RUNNING: runningList,
      WAITING: waitingList,
      TERMINATED: terminatedList,
    };
  }, [activeSnapshot]);

  const selectedPcb = selectedPid !== null ? activeSnapshot.pcbs[selectedPid] : null;

  const renderProcessToken = (p: ProcessControlBlock) => {
    const isSelected = selectedPid === p.pid;
    const isNext = p.state === 'READY' && activeSnapshot.next_scheduled === p.pid;
    const stateClass =
      p.state === 'RUNNING'
        ? 'proc-running'
        : p.state === 'WAITING'
          ? 'proc-waiting'
          : p.state === 'TERMINATED'
            ? 'proc-terminated'
            : '';

    return (
      <div
        key={`proc-${p.pid}`}
        className={`proc-token ${stateClass} ${isSelected ? 'selected proc-selected' : ''} ${
          isNext ? 'proc-next' : ''
        }`.trim()}
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
    );
  };

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
            onClick={openTheoryModal}
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
          <svg
            className={`proc-arrows ${activeTransition ? 'has-highlight' : ''}`}
            ref={svgRef}
            aria-hidden="true"
          >
            {/* First layer: Bezier curves + centered arrowhead triangles */}
            {arrows.map((arr, i) => {
              const isActive =
                activeTransition !== null &&
                arr.label.toLowerCase() === activeTransition.toLowerCase();
              return (
                <g key={`arrow-geo-${i}`}>
                  <path
                    className={`arrow-line ${isActive ? 'arrow-active' : ''}`}
                    d={arr.d}
                    data-label={arr.label}
                  />
                  <path
                    className={`arrow-head ${isActive ? 'arrow-active' : ''}`}
                    d={arr.headPath}
                  />
                </g>
              );
            })}
            {/* Second layer: Translucent pill backgrounds + centered labels */}
            {arrows.map((arr, i) => {
              const isActive =
                activeTransition !== null &&
                arr.label.toLowerCase() === activeTransition.toLowerCase();
              const pillW = Math.max(58, arr.label.length * 7.1 + 18);
              const pillH = 22;
              return (
                <g key={`arrow-label-${i}`} className="arrow-label-group">
                  <rect
                    className={`arrow-label-bg ${isActive ? 'arrow-active' : ''}`}
                    x={arr.labelPos.x - pillW / 2}
                    y={arr.labelPos.y - pillH / 2}
                    width={pillW}
                    height={pillH}
                    rx={6}
                    ry={6}
                  />
                  <text
                    className={`arrow-label ${isActive ? 'arrow-active' : ''}`}
                    x={arr.labelPos.x}
                    y={arr.labelPos.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                  >
                    {arr.label}
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="proc-diagram" id="proc-diagram">
            {/* NEW */}
            <div className="proc-node" id="node-NEW">
              <div className="proc-node-header">
                <LuInbox /> New
              </div>
              <div className="proc-list" id="list-NEW">
                {processesByState.NEW.map(renderProcessToken)}
              </div>
            </div>

            {/* READY */}
            <div className="proc-node" id="node-READY">
              <div className="proc-node-header">
                <LuList /> Ready
              </div>
              <div className="proc-list" id="list-READY">
                {processesByState.READY.map(renderProcessToken)}
              </div>
            </div>

            {/* RUNNING */}
            <div className="proc-node" id="node-RUNNING">
              <div className="proc-node-header">
                <LuCpu /> Running
              </div>
              <div className="proc-list" id="list-RUNNING">
                {processesByState.RUNNING.map(renderProcessToken)}
              </div>
            </div>

            {/* TERMINATED */}
            <div className="proc-node" id="node-TERMINATED">
              <div className="proc-node-header">
                <LuCircleCheck /> Terminated
              </div>
              <div className="proc-list" id="list-TERMINATED">
                {processesByState.TERMINATED.map(renderProcessToken)}
              </div>
            </div>

            {/* WAITING */}
            <div className="proc-node proc-node-waiting" id="node-WAITING">
              <div className="proc-node-header">
                <LuClock /> Waiting
              </div>
              <div className="proc-list" id="list-WAITING">
                {processesByState.WAITING.map(renderProcessToken)}
              </div>
            </div>
          </div>

          {/* Inspector Flotante Arrastable de PCB (Solo datos de la simulación para el algoritmo activo) */}
          <div
            ref={pcbPanelRef}
            className={`pcb-inspector-panel ${selectedPcb ? '' : 'is-hidden'} ${
              isDraggingPcb ? 'is-dragging' : ''
            }`}
            id="pcb-inspector"
            style={pcbPos ? { left: pcbPos.x, top: pcbPos.y, right: 'auto' } : undefined}
          >
            {selectedPcb && (
              <>
                <div
                  className="inspector-header"
                  role="presentation"
                  onMouseDown={handlePcbDragStart}
                  title="Arrastrar tarjeta PCB"
                >
                  <div className="inspector-title">
                    <LuFileText />
                    <span>
                      PCB · <strong id="pcb-pid-title">P{selectedPcb.pid}</strong>
                    </span>
                    <span className="pcb-algo-pill">{algorithm}</span>
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

                  {algorithm === 'PRIORITY' && (
                    <div className="pcb-field">
                      <span className="pcb-key">Prioridad (1-5):</span>
                      <span className="pcb-val-group">
                        {mode === 'manual' && selectedPcb.state !== 'TERMINATED' && (
                          <button
                            type="button"
                            className="btn-pcb-step"
                            title="Mayor prioridad"
                            onClick={() => handleUpdatePcbField('priority', -1)}
                          >
                            -
                          </button>
                        )}
                        <span className="pcb-val" id="pcb-priority-val">
                          {selectedPcb.priority}
                        </span>
                        {mode === 'manual' && selectedPcb.state !== 'TERMINATED' && (
                          <button
                            type="button"
                            className="btn-pcb-step"
                            title="Menor prioridad"
                            onClick={() => handleUpdatePcbField('priority', 1)}
                          >
                            +
                          </button>
                        )}
                      </span>
                    </div>
                  )}

                  <div className="pcb-field">
                    <span className="pcb-key">
                      {algorithm === 'SJF' ? 'Ráfaga estimada:' : 'Ráfaga total:'}
                    </span>
                    <span className="pcb-val-group">
                      {mode === 'manual' && selectedPcb.state === 'NEW' && (
                        <button
                          type="button"
                          className="btn-pcb-step"
                          title="Reducir ráfaga"
                          onClick={() => handleUpdatePcbField('burst_time', -1)}
                        >
                          -
                        </button>
                      )}
                      <span className="pcb-val" id="pcb-burst-val">
                        {selectedPcb.burst_time}
                      </span>
                      {mode === 'manual' && selectedPcb.state === 'NEW' && (
                        <button
                          type="button"
                          className="btn-pcb-step"
                          title="Aumentar ráfaga"
                          onClick={() => handleUpdatePcbField('burst_time', 1)}
                        >
                          +
                        </button>
                      )}
                    </span>
                  </div>

                  <div className="pcb-field">
                    <span className="pcb-key">Tiempo restante:</span>{' '}
                    <span className="pcb-val" id="pcb-remaining-val">
                      {selectedPcb.remaining_time}
                    </span>
                  </div>

                  {algorithm === 'RR' && (
                    <div className="pcb-field">
                      <span className="pcb-key">Quantum consumido:</span>{' '}
                      <span className="pcb-val" id="pcb-quantum-val">
                        {selectedPcb.quantum_used} / {activeSnapshot.quantum}
                      </span>
                    </div>
                  )}
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
                  className={`btn-algo-chip ${algorithm === 'SJF' ? 'active' : ''}`}
                  onClick={() => handleAlgoChange('SJF')}
                  title="Planificador Shortest Job First (Trabajo más corto primero)"
                >
                  SJF
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

      {/* Modal: Guía Teórica de Políticas del Planificador */}
      {isTheoryOpen && (
        <div className="theory-modal-backdrop" id="theory-modal">
          <button
            type="button"
            className="modal-backdrop-dismiss"
            onClick={() => setIsTheoryOpen(false)}
            aria-label="Cerrar modal"
          />
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
                className={`btn-modal-tab ${theoryTab === 'sjf' ? 'active' : ''}`}
                onClick={() => setTheoryTab('sjf')}
              >
                SJF / SRTF
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

              {theoryTab === 'sjf' && (
                <div className="theory-tab-content active" id="tab-content-sjf">
                  <h4>Shortest Job First (SJF) / SRTF</h4>
                  <span className="algo-badge">No Preemptivo (SJF) · Óptimo en espera</span>
                  <p>
                    Selecciona el proceso con la ráfaga de CPU estimada más corta (este simulador
                    implementa la variante no preemptiva SJF). En su versión preemptiva (SRTF), si
                    llega un proceso nuevo con menor tiempo restante que el que está corriendo, lo
                    desaloja.
                  </p>
                  <div className="theory-pros-cons">
                    <div className="pro">
                      <strong>Ventaja:</strong> Es demostrablemente óptimo para minimizar el tiempo
                      de espera promedio.
                    </div>
                    <div className="con">
                      <strong>Desventaja:</strong> En la práctica es imposible conocer con exactitud
                      la duración de la próxima ráfaga de CPU; se debe estimar mediante promedios
                      exponenciales. Además, los procesos largos pueden sufrir inanición.
                    </div>
                  </div>
                </div>
              )}

              {theoryTab === 'priority' && (
                <div className="theory-tab-content active" id="tab-content-priority">
                  <h4>Planificación por Prioridades</h4>
                  <span className="algo-badge">No Preemptivo en este simulador</span>
                  <p>
                    A cada proceso se le asigna un valor numérico de prioridad. La CPU se asigna al
                    proceso de mayor prioridad disponible en <code>READY</code> (en este simulador,
                    1 es la máxima prioridad y 5 la mínima). En modo manual puedes ajustar la
                    prioridad en vivo para observar el reordenamiento de la cola.
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
