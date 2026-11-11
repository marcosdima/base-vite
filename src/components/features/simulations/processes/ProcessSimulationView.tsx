import { useEffect, useMemo, useState } from 'react';
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiCpu,
  FiInbox,
  FiList,
  FiPause,
  FiPlay,
  FiPlus,
  FiRotateCcw,
  FiSettings,
  FiX,
} from 'react-icons/fi';
import {
  SCRIPT_FCFS,
  SCRIPT_PRIORITY,
  SCRIPT_RR,
} from '../../../../features/simulations/processes/demoScripts';
import { ProcessLifecycleSimulation } from '../../../../features/simulations/processes/simulation';
import type {
  DemoStep,
  ProcessEvent,
  ProcessState,
  SchedulingAlgorithm,
} from '../../../../features/simulations/processes/types';
import {
  ActionButton,
  ActionButtonsRow,
  AlgoChip,
  AlgoChipsGroup,
  DiagramCard,
  DiagramLayout,
  ModeTab,
  ModeTabBar,
  NarrationCard,
  NarrationHeader,
  NarrationTag,
  NarrationText,
  PcbFloatingCard,
  PcbRow,
  PcbStepBtn,
  PcbValControl,
  ProcessToken,
  ProcessViewContainer,
  SchedFooter,
  StateNode,
  StateNodeHeader,
  TabButtonGroup,
  TokenList,
  ViewDescription,
  ViewHeader,
  ViewTitle,
} from './ProcessSimulation.styles';

export function ProcessSimulationView() {
  const [mode, setMode] = useState<'demo' | 'manual'>('demo');
  const [algorithm, setAlgorithm] = useState<SchedulingAlgorithm>('FCFS');
  const [quantum, setQuantum] = useState(2);

  // Demo mode state
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Manual mode state: log of events
  const [eventLog, setEventLog] = useState<ProcessEvent[]>([]);
  const [selectedPid, setSelectedPid] = useState<number | null>(null);

  // Error alert state
  const [alertError, setAlertError] = useState<{ title: string; message: string } | null>(null);

  // Manual mode narration state
  const [manualNarrationTag, setManualNarrationTag] = useState('Inicio');
  const [manualNarrationText, setManualNarrationText] = useState(
    'Simulación lista. Selecciona un proceso o pulsa las acciones para experimentar.',
  );
  const [isManualError, setIsManualError] = useState(false);

  // Get active demo script
  const activeScript: DemoStep[] = useMemo(() => {
    switch (algorithm) {
      case 'RR':
        return SCRIPT_RR;
      case 'PRIORITY':
        return SCRIPT_PRIORITY;
      default:
        return SCRIPT_FCFS;
    }
  }, [algorithm]);

  // Active demo step (computed during render without effect)
  const activeDemoStep = mode === 'demo' ? activeScript[stepIndex] : null;
  const currentNarrationTag = activeDemoStep ? activeDemoStep.tag : manualNarrationTag;
  const currentNarrationText = activeDemoStep ? activeDemoStep.text : manualNarrationText;
  const isNarrationError = mode === 'manual' && isManualError;

  // Derived simulation instance
  const sim = useMemo(() => {
    if (mode === 'demo') {
      const demoEvents: ProcessEvent[] = [];
      for (let i = 0; i <= stepIndex && i < activeScript.length; i++) {
        demoEvents.push(...(activeScript[i]?.events ?? []));
      }
      const instance = new ProcessLifecycleSimulation();
      instance.rebuild(demoEvents);
      return instance;
    } else {
      const instance = new ProcessLifecycleSimulation();
      instance.rebuild(eventLog);
      return instance;
    }
  }, [mode, stepIndex, activeScript, eventLog]);

  const simState = sim.getState();

  // Demo auto-play timer
  useEffect(() => {
    if (mode !== 'demo' || !isPlaying) return;
    const timer = setInterval(() => {
      setStepIndex((prev) => {
        if (prev + 1 >= activeScript.length) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 2800);
    return () => clearInterval(timer);
  }, [mode, isPlaying, activeScript.length]);

  // Change algorithm
  const handleSelectAlgorithm = (algo: SchedulingAlgorithm) => {
    setAlgorithm(algo);
    setStepIndex(0);
    setIsPlaying(false);
    if (mode === 'manual') {
      setEventLog((prev) => [
        ...prev,
        { type: 'set_algorithm', payload: { algorithm: algo, quantum } },
      ]);
    }
  };

  // Manual actions
  const applyManualEvent = (event: ProcessEvent) => {
    const { applied, reason } = sim.applySingle(event);
    if (!applied) {
      setAlertError({ title: 'Aviso del Sistema Operativo', message: reason });
      setManualNarrationTag('Transición Inválida');
      setManualNarrationText(reason);
      setIsManualError(true);
      return;
    }
    setEventLog((prev) => [...prev, event]);
    setIsManualError(false);
    setManualNarrationTag('Evento Ejecutado');
    setManualNarrationText(`Evento "${event.type}" aplicado exitosamente.`);
  };

  const handleCreateProcess = () => {
    const existingPids = simState.pids;
    const nextPid = existingPids.length > 0 ? Math.max(...existingPids) + 1 : 1;
    applyManualEvent({
      type: 'create',
      pid: nextPid,
      priority: Math.floor(Math.random() * 3) + 1,
      burst_time: Math.floor(Math.random() * 4) + 3,
    });
    setSelectedPid(nextPid);
  };

  const handleTickClock = () => {
    applyManualEvent({ type: 'tick' });
  };

  const handleUpdatePcbField = (field: 'priority' | 'burst_time', delta: number) => {
    if (selectedPid === null) return;
    const pcb = simState.pcbs[selectedPid];
    if (!pcb || pcb.state === 'TERMINATED') return;

    if (field === 'priority') {
      const nextPrio = Math.min(5, Math.max(1, pcb.priority + delta));
      applyManualEvent({ type: 'update_pcb', pid: selectedPid, priority: nextPrio });
    } else {
      const nextBurst = Math.min(20, Math.max(1, pcb.burst_time + delta));
      applyManualEvent({ type: 'update_pcb', pid: selectedPid, burst_time: nextBurst });
    }
  };

  const selectedPcb = selectedPid ? simState.pcbs[selectedPid] : null;

  const nodeIcons: Record<ProcessState, React.ReactNode> = {
    NEW: <FiInbox />,
    READY: <FiList />,
    RUNNING: <FiCpu />,
    WAITING: <FiClock />,
    TERMINATED: <FiCheckCircle />,
  };

  return (
    <ProcessViewContainer>
      <ViewHeader>
        <ViewTitle>Simulador del Ciclo de Vida de Procesos</ViewTitle>
        <ViewDescription>
          Anima la máquina de estados de un proceso (NEW ➜ READY ➜ RUNNING ➜ WAITING / TERMINATED)
          con Bloque de Control de Proceso (PCB) y planificador de corto plazo (FCFS, Round Robin,
          Prioridades).
        </ViewDescription>
      </ViewHeader>

      {/* Narration Card */}
      <NarrationCard>
        <NarrationHeader>
          <NarrationTag $isError={isNarrationError}>{currentNarrationTag}</NarrationTag>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Tiempo de reloj (ticks): <strong>{simState.current_time}</strong>
          </span>
        </NarrationHeader>
        <NarrationText>{currentNarrationText}</NarrationText>
      </NarrationCard>

      {/* Mode Switcher */}
      <ModeTabBar>
        <TabButtonGroup>
          <ModeTab
            type="button"
            $active={mode === 'demo'}
            onClick={() => {
              setMode('demo');
              setStepIndex(0);
              setIsPlaying(false);
            }}
          >
            Modo Demostración
          </ModeTab>
          <ModeTab
            type="button"
            $active={mode === 'manual'}
            onClick={() => {
              setMode('manual');
              setIsPlaying(false);
            }}
          >
            Modo Manual (Laboratorio)
          </ModeTab>
        </TabButtonGroup>

        {mode === 'demo' ? (
          <ActionButtonsRow>
            <ActionButton
              type="button"
              disabled={stepIndex === 0}
              onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
            >
              <FiArrowLeft /> Anterior
            </ActionButton>
            <ActionButton
              type="button"
              disabled={stepIndex >= activeScript.length - 1}
              onClick={() => setStepIndex((i) => Math.min(activeScript.length - 1, i + 1))}
            >
              Paso a paso <FiArrowRight />
            </ActionButton>
            <ActionButton type="button" $variant="primary" onClick={() => setIsPlaying((p) => !p)}>
              {isPlaying ? (
                <>
                  <FiPause /> Pausa
                </>
              ) : (
                <>
                  <FiPlay /> Auto
                </>
              )}
            </ActionButton>
            <ActionButton
              type="button"
              onClick={() => {
                setStepIndex(0);
                setIsPlaying(false);
              }}
            >
              <FiRotateCcw /> Reiniciar
            </ActionButton>
          </ActionButtonsRow>
        ) : (
          <ActionButtonsRow>
            <ActionButton type="button" $variant="primary" onClick={handleCreateProcess}>
              <FiPlus /> Crear Proceso
            </ActionButton>
            <ActionButton
              type="button"
              $variant="warning"
              disabled={simState.running === null}
              onClick={handleTickClock}
            >
              <FiClock /> Avanzar Reloj (Tick)
            </ActionButton>
            <ActionButton
              type="button"
              onClick={() => {
                setEventLog([]);
                setSelectedPid(null);
                setManualNarrationTag('Reiniciado');
                setManualNarrationText('Laboratorio manual reiniciado.');
              }}
            >
              <FiRotateCcw /> Limpiar
            </ActionButton>
          </ActionButtonsRow>
        )}
      </ModeTabBar>

      {/* Manual Transition Buttons when process selected */}
      {mode === 'manual' && (
        <ActionButtonsRow style={{ padding: '0 8px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Transición:</span>
          <ActionButton
            type="button"
            disabled={!selectedPcb || selectedPcb.state !== 'NEW'}
            onClick={() => selectedPid && applyManualEvent({ type: 'admit', pid: selectedPid })}
          >
            Admitir (NEW ➜ READY)
          </ActionButton>
          <ActionButton
            type="button"
            disabled={simState.running !== null || simState.ready_queue.length === 0}
            onClick={() => applyManualEvent({ type: 'dispatch', pid: selectedPid ?? undefined })}
          >
            Despachar (READY ➜ RUNNING)
          </ActionButton>
          <ActionButton
            type="button"
            disabled={!selectedPcb || selectedPcb.state !== 'RUNNING'}
            onClick={() => selectedPid && applyManualEvent({ type: 'interrupt', pid: selectedPid })}
          >
            Interrumpir (RUNNING ➜ READY)
          </ActionButton>
          <ActionButton
            type="button"
            disabled={!selectedPcb || selectedPcb.state !== 'RUNNING'}
            onClick={() => selectedPid && applyManualEvent({ type: 'io_wait', pid: selectedPid })}
          >
            E/S Espera (RUNNING ➜ WAITING)
          </ActionButton>
          <ActionButton
            type="button"
            disabled={!selectedPcb || selectedPcb.state !== 'WAITING'}
            onClick={() =>
              selectedPid && applyManualEvent({ type: 'io_complete', pid: selectedPid })
            }
          >
            E/S Fin (WAITING ➜ READY)
          </ActionButton>
          <ActionButton
            type="button"
            $variant="danger"
            disabled={!selectedPcb || selectedPcb.state !== 'RUNNING'}
            onClick={() => selectedPid && applyManualEvent({ type: 'exit', pid: selectedPid })}
          >
            Finalizar (RUNNING ➜ TERMINATED)
          </ActionButton>
        </ActionButtonsRow>
      )}

      {/* Process States Diagram Card */}
      <DiagramCard>
        <DiagramLayout>
          {(['NEW', 'READY', 'RUNNING', 'TERMINATED', 'WAITING'] as ProcessState[]).map(
            (stateKey) => {
              const pidsInState = simState.pids.filter((p) => simState.states[p] === stateKey);
              const isCpuActiveNode = stateKey === 'RUNNING' && simState.running !== null;

              return (
                <StateNode key={stateKey} $state={stateKey} $active={isCpuActiveNode}>
                  <StateNodeHeader $state={stateKey}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {nodeIcons[stateKey]}
                      <span>{stateKey}</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                      ({pidsInState.length})
                    </span>
                  </StateNodeHeader>

                  <TokenList>
                    {pidsInState.map((pid) => (
                      <ProcessToken
                        key={pid}
                        $selected={selectedPid === pid}
                        $running={simState.running === pid}
                        onClick={() => setSelectedPid((current) => (current === pid ? null : pid))}
                        title={`Proceso P${pid} (Clic para ver PCB)`}
                      >
                        P{pid}
                      </ProcessToken>
                    ))}
                  </TokenList>
                </StateNode>
              );
            },
          )}
        </DiagramLayout>

        {/* Floating/Docked PCB Inspector */}
        {selectedPcb && (
          <PcbFloatingCard>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <strong>PCB · Proceso P{selectedPcb.pid}</strong>
              <button
                type="button"
                onClick={() => setSelectedPid(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                aria-label="Cerrar PCB"
              >
                <FiX />
              </button>
            </div>

            <PcbRow>
              <span style={{ color: '#94a3b8' }}>Estado:</span>
              <strong style={{ color: '#38bdf8' }}>{selectedPcb.state}</strong>
            </PcbRow>

            <PcbRow>
              <span style={{ color: '#94a3b8' }}>Prioridad (1-5):</span>
              <PcbValControl>
                {mode === 'manual' && selectedPcb.state !== 'TERMINATED' && (
                  <PcbStepBtn type="button" onClick={() => handleUpdatePcbField('priority', -1)}>
                    −
                  </PcbStepBtn>
                )}
                <span>{selectedPcb.priority}</span>
                {mode === 'manual' && selectedPcb.state !== 'TERMINATED' && (
                  <PcbStepBtn type="button" onClick={() => handleUpdatePcbField('priority', 1)}>
                    +
                  </PcbStepBtn>
                )}
              </PcbValControl>
            </PcbRow>

            <PcbRow>
              <span style={{ color: '#94a3b8' }}>Ráfaga total:</span>
              <PcbValControl>
                {mode === 'manual' && selectedPcb.state !== 'TERMINATED' && (
                  <PcbStepBtn type="button" onClick={() => handleUpdatePcbField('burst_time', -1)}>
                    −
                  </PcbStepBtn>
                )}
                <span>{selectedPcb.burst_time} ticks</span>
                {mode === 'manual' && selectedPcb.state !== 'TERMINATED' && (
                  <PcbStepBtn type="button" onClick={() => handleUpdatePcbField('burst_time', 1)}>
                    +
                  </PcbStepBtn>
                )}
              </PcbValControl>
            </PcbRow>

            <PcbRow>
              <span style={{ color: '#94a3b8' }}>Tiempo restante:</span>
              <span>{selectedPcb.remaining_time} ticks</span>
            </PcbRow>

            <PcbRow>
              <span style={{ color: '#94a3b8' }}>Quantum consumido:</span>
              <span>
                {simState.algorithm === 'RR'
                  ? `${selectedPcb.quantum_used} / ${simState.quantum}`
                  : 'N/A'}
              </span>
            </PcbRow>
          </PcbFloatingCard>
        )}

        {/* Scheduler policy selector footer */}
        <SchedFooter>
          <AlgoChipsGroup>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              <FiSettings /> Planificador:
            </span>
            <AlgoChip
              type="button"
              $active={algorithm === 'FCFS'}
              onClick={() => handleSelectAlgorithm('FCFS')}
            >
              FCFS (FIFO)
            </AlgoChip>
            <AlgoChip
              type="button"
              $active={algorithm === 'RR'}
              onClick={() => handleSelectAlgorithm('RR')}
            >
              Round Robin (q = {quantum})
            </AlgoChip>
            <AlgoChip
              type="button"
              $active={algorithm === 'PRIORITY'}
              onClick={() => handleSelectAlgorithm('PRIORITY')}
            >
              Prioridades
            </AlgoChip>
          </AlgoChipsGroup>

          {algorithm === 'RR' && mode === 'manual' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}>
              <span>Quantum:</span>
              <input
                type="number"
                min={1}
                max={10}
                value={quantum}
                onChange={(e) => {
                  const q = parseInt(e.target.value, 10);
                  if (!isNaN(q) && q >= 1) {
                    setQuantum(q);
                    setEventLog((prev) => [
                      ...prev,
                      { type: 'set_algorithm', payload: { algorithm: 'RR', quantum: q } },
                    ]);
                  }
                }}
                style={{
                  width: 50,
                  padding: '2px 6px',
                  borderRadius: 4,
                  border: '1px solid #cbd5e1',
                }}
              />
            </div>
          )}

          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Próximo en CPU:{' '}
            <strong>{simState.next_scheduled ? `P${simState.next_scheduled}` : 'Ninguno'}</strong>
          </span>
        </SchedFooter>
      </DiagramCard>

      {/* Alert Dialog for Precondition Errors */}
      {alertError && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 16,
              padding: 24,
              maxWidth: 400,
              width: '90%',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
          >
            <h3 style={{ margin: 0, color: '#ef4444' }}>{alertError.title}</h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#334155', lineHeight: 1.5 }}>
              {alertError.message}
            </p>
            <ActionButton
              type="button"
              $variant="primary"
              style={{ alignSelf: 'flex-end' }}
              onClick={() => setAlertError(null)}
            >
              Entendido
            </ActionButton>
          </div>
        </div>
      )}
    </ProcessViewContainer>
  );
}
