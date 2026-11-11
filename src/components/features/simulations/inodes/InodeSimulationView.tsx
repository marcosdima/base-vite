import { useEffect, useMemo, useState } from 'react';
import {
  FiArrowLeft,
  FiArrowRight,
  FiCpu,
  FiHardDrive,
  FiPause,
  FiPlay,
  FiRefreshCw,
  FiRotateCcw,
} from 'react-icons/fi';
import { InodeSimulation } from '../../../../features/simulations/inodes/simulation';
import type { ResolutionResult } from '../../../../features/simulations/inodes/types';
import {
  ActionBtn,
  ButtonGroup,
  CarouselCard,
  ChipGroup,
  DiskCell,
  DiskGridContainer,
  DiskPanel,
  FormalCalcBox,
  InodeCard,
  InodeCardHeader,
  InodeGrid,
  InodeViewContainer,
  Legend,
  LegendColor,
  LegendItem,
  PointerList,
  PointerRow,
  PositionSelector,
  PresetChip,
  SeedButton,
  StepControls,
  StepProgressBar,
  StepProgressFill,
  TopControls,
  ViewDescription,
  ViewHeader,
  ViewTitle,
} from './InodeSimulation.styles';

const PRESET_POSITIONS = [1, 12, 14, 18, 26];

export function InodeSimulationView() {
  const [seed, setSeed] = useState(1234);
  const [logicalPos, setLogicalPos] = useState(14);
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);

  // Simulation instance memoized on seed
  const sim = useMemo(() => new InodeSimulation({ seed }), [seed]);
  const diskBlocks = useMemo(() => sim.getDiskBlocks(), [sim]);

  // Current resolution result
  const resolution: ResolutionResult = useMemo(
    () => sim.resolvePosition(logicalPos),
    [sim, logicalPos],
  );

  const currentStep = resolution.steps[stepIndex] ?? resolution.steps[0]!;
  const totalSteps = resolution.steps.length;
  const progressPercent = Math.round(((stepIndex + 1) / totalSteps) * 100);

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setStepIndex((prev) => {
        if (prev + 1 >= totalSteps) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 2200);
    return () => clearInterval(interval);
  }, [isPlaying, totalSteps]);

  // Handle position change
  const handleChangePos = (pos: number) => {
    setLogicalPos(pos);
    setStepIndex(0);
    setIsPlaying(false);
  };

  const handleRandomize = () => {
    const newSeed = Math.floor(Math.random() * 2147483647);
    setSeed(newSeed);
    setStepIndex(0);
    setIsPlaying(false);
  };

  const highlightedBlock = currentStep?.disk_block ?? null;

  return (
    <InodeViewContainer>
      <ViewHeader>
        <ViewTitle>Simulador de Inodos y Disco Físico</ViewTitle>
        <ViewDescription>
          Traduce una posición lógica de archivo (base 1) al bloque físico de disco que la contiene.
          Modela punteros directos, indirecto simple, doble y triple sobre un disco de 100 bloques.
        </ViewDescription>
      </ViewHeader>

      <TopControls>
        <PositionSelector>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Posición lógica:</span>
          <ChipGroup>
            {PRESET_POSITIONS.map((pos) => (
              <PresetChip
                key={pos}
                type="button"
                $active={logicalPos === pos}
                onClick={() => handleChangePos(pos)}
              >
                Pos {pos}
              </PresetChip>
            ))}
          </ChipGroup>
          <input
            type="number"
            min={1}
            max={sim.totalLogicalPositions}
            value={logicalPos}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val) && val >= 1 && val <= sim.totalLogicalPositions) {
                handleChangePos(val);
              }
            }}
            style={{
              width: 60,
              padding: '4px 8px',
              borderRadius: 6,
              border: '1px solid #cbd5e1',
              fontSize: '0.85rem',
            }}
            aria-label="Posición lógica personalizada"
          />
        </PositionSelector>

        <SeedButton type="button" onClick={handleRandomize}>
          <FiRefreshCw />
          <span>Nuevo Disco (Semilla: {seed})</span>
        </SeedButton>
      </TopControls>

      {/* Step by Step Explanation Carousel */}
      <CarouselCard>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiCpu color="#38bdf8" />
            <strong style={{ color: '#38bdf8' }}>
              Paso {stepIndex + 1} de {totalSteps}:
            </strong>
            <span>{currentStep.title}</span>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Ruta: <strong>{resolution.route_type}</strong>
          </span>
        </div>

        <StepProgressBar>
          <StepProgressFill $percent={progressPercent} />
        </StepProgressBar>

        <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.6 }}>{currentStep.explanation}</p>

        <FormalCalcBox>{resolution.formal_calc}</FormalCalcBox>

        <StepControls>
          <ButtonGroup>
            <ActionBtn
              type="button"
              disabled={stepIndex === 0}
              onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
            >
              <FiArrowLeft /> Anterior
            </ActionBtn>
            <ActionBtn
              type="button"
              disabled={stepIndex >= totalSteps - 1}
              onClick={() => setStepIndex((i) => Math.min(totalSteps - 1, i + 1))}
            >
              Siguiente <FiArrowRight />
            </ActionBtn>
            <ActionBtn type="button" $primary onClick={() => setIsPlaying((p) => !p)}>
              {isPlaying ? (
                <>
                  <FiPause /> Pausa
                </>
              ) : (
                <>
                  <FiPlay /> Auto
                </>
              )}
            </ActionBtn>
            <ActionBtn
              type="button"
              onClick={() => {
                setStepIndex(0);
                setIsPlaying(false);
              }}
            >
              <FiRotateCcw /> Reiniciar
            </ActionBtn>
          </ButtonGroup>

          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Bloque Físico Destino:{' '}
            <strong style={{ color: '#4ade80' }}>
              #{resolution.physical_block.toString().padStart(2, '0')}
            </strong>
          </span>
        </StepControls>
      </CarouselCard>

      <InodeGrid>
        {/* Inode Pointers Card */}
        <InodeCard>
          <InodeCardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiHardDrive />
              <strong>INODO #{sim.inodeId}</strong>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{sim.mode}</span>
          </InodeCardHeader>

          <PointerList>
            {sim.directBlocks.map((blk, idx) => {
              const isTarget =
                resolution.route_type === 'DIRECT' && resolution.physical_block === blk;
              return (
                <PointerRow
                  key={`direct-${idx}`}
                  $highlighted={isTarget}
                  onClick={() => handleChangePos(idx + 1)}
                >
                  <span>
                    Directo [{idx}] (Pos {idx + 1})
                  </span>
                  <span>➜ Blk #{blk.toString().padStart(2, '0')}</span>
                </PointerRow>
              );
            })}

            <PointerRow
              $highlighted={resolution.route_type === 'INDIRECT_SIMPLE'}
              onClick={() => handleChangePos(14)}
            >
              <span>Ind. Simple (Pos 13..16)</span>
              <span>➜ Blk #{sim.indirectSimpleBlockId.toString().padStart(2, '0')}</span>
            </PointerRow>

            <PointerRow
              $highlighted={resolution.route_type === 'INDIRECT_DOUBLE'}
              onClick={() => handleChangePos(18)}
            >
              <span>Ind. Doble (Pos 17..24)</span>
              <span>➜ Blk #{sim.indirectDoubleBlockId.toString().padStart(2, '0')}</span>
            </PointerRow>

            <PointerRow
              $highlighted={resolution.route_type === 'INDIRECT_TRIPLE'}
              onClick={() => handleChangePos(26)}
            >
              <span>Ind. Triple (Pos 25..28)</span>
              <span>➜ Blk #{sim.indirectTripleBlockId.toString().padStart(2, '0')}</span>
            </PointerRow>
          </PointerList>
        </InodeCard>

        {/* Physical Disk Panel */}
        <DiskPanel>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <strong>Disco Físico (100 Bloques: #00 al #99)</strong>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>35 asignados · 65 libres</span>
          </div>

          <DiskGridContainer>
            {diskBlocks.map((blk) => (
              <DiskCell
                key={blk.id}
                $role={blk.role}
                $highlighted={highlightedBlock === blk.id}
                $selected={selectedBlockId === blk.id}
                title={blk.desc}
                onClick={() => {
                  setSelectedBlockId(blk.id);
                  if (blk.position) {
                    handleChangePos(blk.position);
                  }
                }}
              >
                {blk.label}
              </DiskCell>
            ))}
          </DiskGridContainer>

          <Legend>
            <LegendItem>
              <LegendColor $bg="#0284c7" /> Directo
            </LegendItem>
            <LegendItem>
              <LegendColor $bg="#8b5cf6" /> Índice Simple
            </LegendItem>
            <LegendItem>
              <LegendColor $bg="#a78bfa" /> Dato Simple
            </LegendItem>
            <LegendItem>
              <LegendColor $bg="#d97706" /> Índice Doble N1
            </LegendItem>
            <LegendItem>
              <LegendColor $bg="#f59e0b" /> Índice Doble N2
            </LegendItem>
            <LegendItem>
              <LegendColor $bg="#fbbf24" /> Dato Doble
            </LegendItem>
            <LegendItem>
              <LegendColor $bg="#dc2626" /> Índice Triple
            </LegendItem>
            <LegendItem>
              <LegendColor $bg="#f87171" /> Dato Triple
            </LegendItem>
            <LegendItem>
              <LegendColor $bg="#334155" /> Libre
            </LegendItem>
          </Legend>
        </DiskPanel>
      </InodeGrid>
    </InodeViewContainer>
  );
}
