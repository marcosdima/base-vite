import { useMemo, useState } from 'react';
import {
  LuArrowRight,
  LuDatabase,
  LuFileCode,
  LuHardDrive,
  LuLayers,
  LuNetwork,
  LuRoute,
} from 'react-icons/lu';
import {
  BLOCK_SIZE,
  BRANCH_FIRST_LOGICAL,
  type BlockMap,
  DIRECT_COUNT,
  PTRS_PER_BLOCK,
  fmt,
  fmtHex,
  formatBytes,
} from '../../../../features/simulations/inodes/blockMap';

export type DiagramTab = 'all' | 'direct' | 'simple' | 'double' | 'triple' | 'path';

interface BlockDiagramProps {
  map: BlockMap;
  inodeId: number;
  dataBlocks: number;
  selectedLogical: number | null;
  onSelectLogical: (logical: number) => void;
}

interface RepresentativeEntry {
  entryIdx: number;
  logical: number;
  physical: number;
  isActive: boolean;
}

/**
 * Returns representative entries to display in an index block:
 * first 2, the active path entry (if present), and the last entry.
 */
function getRepresentativeEntries(
  count: number,
  firstLogical: number,
  activeEntry: number | null,
  getPhysical: (entry: number) => number,
): (RepresentativeEntry | { isGap: true; count: number; from: number; to: number })[] {
  if (count <= 0) return [];

  const indices = new Set<number>();
  indices.add(0);
  if (count > 1) indices.add(1);
  if (activeEntry !== null && activeEntry >= 0 && activeEntry < count) {
    indices.add(activeEntry);
  }
  if (count > 2) indices.add(count - 1);

  const sorted = [...indices].sort((a, b) => a - b);
  const result: (RepresentativeEntry | { isGap: true; count: number; from: number; to: number })[] =
    [];

  let prev = -1;
  for (const idx of sorted) {
    if (idx - prev > 1) {
      result.push({
        isGap: true,
        count: idx - prev - 1,
        from: prev + 1,
        to: idx - 1,
      });
    }
    result.push({
      entryIdx: idx,
      logical: firstLogical + idx,
      physical: getPhysical(idx),
      isActive: activeEntry === idx,
    });
    prev = idx;
  }

  return result;
}

export function BlockDiagram({
  map,
  inodeId,
  dataBlocks,
  selectedLogical,
  onSelectLogical,
}: BlockDiagramProps) {
  const [tab, setTab] = useState<DiagramTab>('all');

  const resolution = useMemo(() => {
    if (selectedLogical === null || selectedLogical < 0 || selectedLogical >= dataBlocks) {
      return null;
    }
    return map.resolve(selectedLogical);
  }, [map, selectedLogical, dataBlocks]);

  const hasDirect = dataBlocks > 0;
  const hasSimple = dataBlocks > DIRECT_COUNT;
  const hasDouble = dataBlocks > BRANCH_FIRST_LOGICAL.double;
  const hasTriple = dataBlocks > BRANCH_FIRST_LOGICAL.triple;

  // Direct pointers representative items
  const directEntries = useMemo(() => {
    const count = Math.min(DIRECT_COUNT, dataBlocks);
    const activeSlot = resolution?.route === 'direct' ? resolution.slot : null;
    return getRepresentativeEntries(count, 0, activeSlot, (i) => map.directPhysical(i));
  }, [dataBlocks, resolution, map]);

  // Simple indirect representative items
  const simpleEntries = useMemo(() => {
    if (!hasSimple) return [];
    const count = Math.min(PTRS_PER_BLOCK, dataBlocks - DIRECT_COUNT);
    const activeSlot = resolution?.route === 'simple' ? resolution.path[0]! : null;
    return getRepresentativeEntries(count, DIRECT_COUNT, activeSlot, (i) =>
      map.dataPhysical(DIRECT_COUNT + i),
    );
  }, [hasSimple, dataBlocks, resolution, map]);

  // Double indirect representative items (Level 1 and Level 2)
  const doubleInfo = useMemo(() => {
    if (!hasDouble) return null;
    const l1Node = map.node({ branch: 'double', path: [] });
    const l1Count = Math.min(
      PTRS_PER_BLOCK,
      Math.ceil((dataBlocks - BRANCH_FIRST_LOGICAL.double) / PTRS_PER_BLOCK),
    );
    const activeL1 = resolution?.route === 'double' ? resolution.path[0]! : 0;
    const activeL2 = resolution?.route === 'double' ? resolution.path[1]! : null;

    const l2Node = map.node({ branch: 'double', path: [activeL1] });
    const l2BaseLogical = BRANCH_FIRST_LOGICAL.double + activeL1 * PTRS_PER_BLOCK;
    const l2TotalAvailable = Math.max(0, dataBlocks - l2BaseLogical);
    const l2Count = Math.min(PTRS_PER_BLOCK, l2TotalAvailable);

    const l2Entries = getRepresentativeEntries(l2Count, l2BaseLogical, activeL2, (i) =>
      map.dataPhysical(l2BaseLogical + i),
    );

    return { l1Node, l1Count, activeL1, l2Node, l2Entries, l2BaseLogical };
  }, [hasDouble, dataBlocks, resolution, map]);

  // Triple indirect representative items
  const tripleInfo = useMemo(() => {
    if (!hasTriple) return null;
    const l1Node = map.node({ branch: 'triple', path: [] });
    const activeL1 = resolution?.route === 'triple' ? resolution.path[0]! : 0;
    const activeL2 = resolution?.route === 'triple' ? resolution.path[1]! : 0;
    const activeL3 = resolution?.route === 'triple' ? resolution.path[2]! : null;

    const l2Node = map.node({ branch: 'triple', path: [activeL1] });
    const l3Node = map.node({ branch: 'triple', path: [activeL1, activeL2] });
    const l3BaseLogical =
      BRANCH_FIRST_LOGICAL.triple + activeL1 * PTRS_PER_BLOCK ** 2 + activeL2 * PTRS_PER_BLOCK;
    const l3TotalAvailable = Math.max(0, dataBlocks - l3BaseLogical);
    const l3Count = Math.min(PTRS_PER_BLOCK, l3TotalAvailable);

    const l3Entries = getRepresentativeEntries(l3Count, l3BaseLogical, activeL3, (i) =>
      map.dataPhysical(l3BaseLogical + i),
    );

    return { l1Node, l2Node, l3Node, l3Entries, activeL1, activeL2, l3BaseLogical };
  }, [hasTriple, dataBlocks, resolution, map]);

  return (
    <div className="block-diagram-container" id="ext4-block-diagram">
      {/* Barra de navegación de vistas del diagrama */}
      <div className="diagram-nav-bar">
        <div className="diagram-nav-left">
          <span className="diagram-nav-title">
            <LuNetwork /> Diagrama de Bloques y Punteros
          </span>
          <span className="diagram-format-chip">Direcciones Físicas en Hexadecimal (32 bits)</span>
        </div>

        <div className="diagram-tabs" role="tablist" aria-label="Filtros del diagrama">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'all'}
            className={`diagram-tab-btn ${tab === 'all' ? 'active' : ''}`}
            onClick={() => setTab('all')}
          >
            Todas las ramas
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'direct'}
            className={`diagram-tab-btn ${tab === 'direct' ? 'active' : ''} ${
              !hasDirect ? 'disabled' : ''
            }`}
            onClick={() => setTab('direct')}
            disabled={!hasDirect}
          >
            Directos [0..11]
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'simple'}
            className={`diagram-tab-btn ${tab === 'simple' ? 'active' : ''} ${
              !hasSimple ? 'disabled' : ''
            }`}
            onClick={() => setTab('simple')}
            disabled={!hasSimple}
          >
            Ind. Simple [12]
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'double'}
            className={`diagram-tab-btn ${tab === 'double' ? 'active' : ''} ${
              !hasDouble ? 'disabled' : ''
            }`}
            onClick={() => setTab('double')}
            disabled={!hasDouble}
          >
            Ind. Doble [13]
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'triple'}
            className={`diagram-tab-btn ${tab === 'triple' ? 'active' : ''} ${
              !hasTriple ? 'disabled' : ''
            }`}
            onClick={() => setTab('triple')}
            disabled={!hasTriple}
          >
            Ind. Triple [14]
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'path'}
            className={`diagram-tab-btn diagram-tab-focus ${tab === 'path' ? 'active' : ''} ${
              resolution === null ? 'disabled' : ''
            }`}
            onClick={() => setTab('path')}
            disabled={resolution === null}
            title={
              resolution === null
                ? 'Selecciona un bloque lógico para ver su ruta'
                : `Ruta del bloque lógico L: ${resolution.logical}`
            }
          >
            <LuRoute /> Ruta Bloque L
          </button>
        </div>
      </div>

      {/* Contenido principal del diagrama */}
      <div className="diagram-canvas">
        {dataBlocks === 0 ? (
          <div className="diagram-empty-state">
            <LuHardDrive className="empty-icon" />
            <h3>Archivo vacío (0 bytes asignados)</h3>
            <p>
              El inodo #<strong>{inodeId}</strong> no tiene ningún bloque asignado en disco. Los 15
              punteros de <code>i_block[]</code> apuntan a <code>0x00000000 (NULL)</code>.
            </p>
            <span className="empty-hint">
              Utiliza el panel de control lateral para cargar bloques o seleccionar un tamaño
              predefinido (ej: 48 KB, 52 KB o 100 MB).
            </span>
          </div>
        ) : (
          <div className="diagram-branches-flow">
            {/* VISTA 1: RUTA FOCALIZADA DEL BLOQUE LÓGICO SELECCIONADO */}
            {tab === 'path' && resolution && (
              <section className="diagram-branch-section branch-highlighted">
                <div className="branch-section-header">
                  <div className="section-title-wrap">
                    <LuRoute className="branch-icon highlight-cyan" />
                    <h4>
                      Ruta Completa de Resolución: Bloque Lógico L = {fmt(resolution.logical)}
                    </h4>
                  </div>
                  <span className="badge-hops-count">
                    {resolution.diskReads} lectura{resolution.diskReads === 1 ? '' : 's'} a disco
                  </span>
                </div>

                <div className="flow-chain-container">
                  {/* Nodo Inodo */}
                  <div className="diagram-card block-card-inode">
                    <div className="card-badge-header">INODO #{inodeId}</div>
                    <div className="card-body-mono">
                      <span className="mono-label">Puntero:</span>
                      <strong className="mono-val text-cyan">i_block[{resolution.slot}]</strong>
                    </div>
                    <div className="card-footer-mono">
                      {resolution.route === 'direct'
                        ? 'Direccionamiento Directo'
                        : `Rama ${resolution.route}`}
                    </div>
                  </div>

                  {/* Flecha hacia el siguiente paso */}
                  <div className="flow-arrow-step">
                    <LuArrowRight className="svg-flow-arrow" />
                  </div>

                  {/* Pasos de bloques de índices intermedios */}
                  {resolution.hops.map((hop, hopIdx) => (
                    <div key={`path-hop-${hopIdx}`} className="flow-step-wrapper">
                      <div className="diagram-card block-card-index">
                        <div className="card-badge-header badge-index">
                          {hop.level === 'N1'
                            ? 'ÍNDICE NIVEL 1'
                            : hop.level === 'N2'
                              ? 'ÍNDICE NIVEL 2'
                              : 'ÍNDICE NIVEL 3'}
                        </div>
                        <div className="card-phys-address font-mono">{fmtHex(hop.physical)}</div>
                        <div className="card-entry-target">
                          <span>Entrada [{fmt(hop.entry)}]</span>
                          <span className="entry-tag-role">puntero ➜</span>
                        </div>
                      </div>

                      <div className="flow-arrow-step">
                        <LuArrowRight className="svg-flow-arrow" />
                      </div>
                    </div>
                  ))}

                  {/* Nodo Bloque de Datos Final */}
                  <div
                    className="diagram-card block-card-data is-target-active"
                    onClick={() => onSelectLogical(resolution.logical)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectLogical(resolution.logical);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    title="Bloque de datos final que almacena el contenido"
                  >
                    <div className="card-badge-header badge-data">BLOQUE DE DATOS</div>
                    <div className="card-phys-address font-mono text-cyan">
                      {fmtHex(resolution.dataPhysical)}
                    </div>
                    <div className="card-data-info">
                      <div>
                        Bloque lógico: <strong>L = {fmt(resolution.logical)}</strong>
                      </div>
                      <div>
                        Bytes: {fmt(resolution.logical * BLOCK_SIZE)} –{' '}
                        {fmt((resolution.logical + 1) * BLOCK_SIZE - 1)} B
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* RAMA 1: PUNTEROS DIRECTOS (i_block[0..11]) */}
            {(tab === 'all' || tab === 'direct') && hasDirect && (
              <section className="diagram-branch-section">
                <div className="branch-section-header">
                  <div className="section-title-wrap">
                    <LuDatabase className="branch-icon icon-direct" />
                    <h4>
                      Punteros Directos: <code>i_block[0..11]</code>
                    </h4>
                  </div>
                  <span className="branch-stats-tag">
                    {Math.min(dataBlocks, DIRECT_COUNT)} / 12 bloques ocupados (
                    {formatBytes(Math.min(dataBlocks, DIRECT_COUNT) * BLOCK_SIZE)})
                  </span>
                </div>

                <div className="branch-flow-row">
                  {/* Bloque Origen: Inodo Directos */}
                  <div className="diagram-source-block block-inode-pointers">
                    <div className="source-block-title">
                      <LuFileCode /> Ranuras en Inodo
                    </div>
                    <div className="source-slots-list">
                      {directEntries.map((item, idx) => {
                        if ('isGap' in item) {
                          return (
                            <div key={`direct-gap-${idx}`} className="source-slot-gap font-mono">
                              ··· {item.count} punteros intermedios ···
                            </div>
                          );
                        }
                        return (
                          <div
                            key={`direct-slot-${item.entryIdx}`}
                            className={`source-slot-row ${item.isActive ? 'active-slot' : ''}`}
                            onClick={() => onSelectLogical(item.logical)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                onSelectLogical(item.logical);
                              }
                            }}
                            role="button"
                            tabIndex={0}
                          >
                            <span className="slot-name font-mono">i_block[{item.entryIdx}]</span>
                            <span className="slot-arrow">➜</span>
                            <span className="slot-target font-mono">{fmtHex(item.physical)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Flechas de conexión SVG / Flex */}
                  <div className="diagram-connectors-bundle">
                    <div className="connector-label">Puntero directo sin índices intermedios</div>
                    <LuArrowRight className="connector-bundle-icon" />
                  </div>

                  {/* Bloques de Datos Físicos Directos */}
                  <div className="diagram-target-blocks-grid">
                    {directEntries.map((item, idx) => {
                      if ('isGap' in item) {
                        return (
                          <div key={`direct-block-gap-${idx}`} className="diagram-card-gap">
                            <span>
                              ··· [{item.from}..{item.to}]: {item.count} bloques de datos físicos
                              más ···
                            </span>
                          </div>
                        );
                      }
                      return (
                        <div
                          key={`direct-data-${item.entryIdx}`}
                          className={`diagram-card block-card-data ${
                            item.isActive ? 'is-target-active' : ''
                          }`}
                          onClick={() => onSelectLogical(item.logical)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              onSelectLogical(item.logical);
                            }
                          }}
                          role="button"
                          tabIndex={0}
                          title={`Clic para inspeccionar bloque lógico L: ${item.logical}`}
                        >
                          <div className="card-badge-header badge-data">
                            <span>DATOS L: {item.logical}</span>
                            <span className="badge-offset font-mono">
                              {formatBytes(item.logical * BLOCK_SIZE)}
                            </span>
                          </div>
                          <div className="card-phys-address font-mono">{fmtHex(item.physical)}</div>
                          <div className="card-data-info">1 lectura a disco · 4 KiB asignados</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}

            {/* RAMA 2: INDIRECTO SIMPLE (i_block[12]) */}
            {(tab === 'all' || tab === 'simple') && hasSimple && (
              <section className="diagram-branch-section">
                <div className="branch-section-header">
                  <div className="section-title-wrap">
                    <LuLayers className="branch-icon icon-simple" />
                    <h4>
                      Indirecto Simple: <code>i_block[12]</code> (1.024 punteros · 4 MiB)
                    </h4>
                  </div>
                  <span className="branch-stats-tag">
                    {Math.min(dataBlocks - DIRECT_COUNT, PTRS_PER_BLOCK)} / 1.024 bloques en uso
                  </span>
                </div>

                <div className="branch-flow-row">
                  {/* Origen: Puntero i_block[12] */}
                  <div className="diagram-source-block">
                    <div className="source-block-title">
                      <LuFileCode /> Puntero en Inodo
                    </div>
                    <div className="source-slots-list">
                      <div className="source-slot-row active-slot">
                        <span className="slot-name font-mono">i_block[12]</span>
                        <span className="slot-arrow">➜</span>
                        <span className="slot-target font-mono">
                          {fmtHex(map.node({ branch: 'simple', path: [] }).physical)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="diagram-connectors-bundle">
                    <LuArrowRight className="connector-bundle-icon" />
                  </div>

                  {/* Bloque de Índices Simple */}
                  <div className="diagram-index-block-card">
                    <div className="index-card-header badge-simple">
                      <div className="index-type-tag">BLOQUE DE ÍNDICES (4 KiB)</div>
                      <div className="index-phys font-mono">
                        {fmtHex(map.node({ branch: 'simple', path: [] }).physical)}
                      </div>
                    </div>
                    <div className="index-slots-container">
                      {simpleEntries.map((entry, idx) => {
                        if ('isGap' in entry) {
                          return (
                            <div key={`simple-gap-${idx}`} className="index-gap-row font-mono">
                              ··· [{entry.from}..{entry.to}]: {entry.count} punteros más ···
                            </div>
                          );
                        }
                        return (
                          <div
                            key={`simple-slot-${entry.entryIdx}`}
                            className={`index-slot-item ${entry.isActive ? 'active-slot' : ''}`}
                            onClick={() => onSelectLogical(entry.logical)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                onSelectLogical(entry.logical);
                              }
                            }}
                            role="button"
                            tabIndex={0}
                          >
                            <span className="idx-num font-mono">[{entry.entryIdx}]</span>
                            <span className="idx-arrow">➜</span>
                            <span className="idx-target font-mono">{fmtHex(entry.physical)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="diagram-connectors-bundle">
                    <LuArrowRight className="connector-bundle-icon" />
                  </div>

                  {/* Bloques de Datos del Indirecto Simple */}
                  <div className="diagram-target-blocks-grid">
                    {simpleEntries.map((entry, idx) => {
                      if ('isGap' in entry) {
                        return (
                          <div key={`simple-block-gap-${idx}`} className="diagram-card-gap">
                            <span>··· {entry.count} bloques de datos físicos adicionales ···</span>
                          </div>
                        );
                      }
                      return (
                        <div
                          key={`simple-data-${entry.entryIdx}`}
                          className={`diagram-card block-card-data ${
                            entry.isActive ? 'is-target-active' : ''
                          }`}
                          onClick={() => onSelectLogical(entry.logical)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              onSelectLogical(entry.logical);
                            }
                          }}
                          role="button"
                          tabIndex={0}
                        >
                          <div className="card-badge-header badge-data">
                            <span>DATOS L: {entry.logical}</span>
                            <span className="badge-offset font-mono">
                              {formatBytes(entry.logical * BLOCK_SIZE)}
                            </span>
                          </div>
                          <div className="card-phys-address font-mono">
                            {fmtHex(entry.physical)}
                          </div>
                          <div className="card-data-info">2 lecturas (Índice + Datos)</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}

            {/* RAMA 3: INDIRECTO DOBLE (i_block[13]) */}
            {(tab === 'all' || tab === 'double') && hasDouble && doubleInfo && (
              <section className="diagram-branch-section">
                <div className="branch-section-header">
                  <div className="section-title-wrap">
                    <LuLayers className="branch-icon icon-double" />
                    <h4>
                      Indirecto Doble: <code>i_block[13]</code> (1.048.576 punteros · 4 GiB)
                    </h4>
                  </div>
                  <span className="branch-stats-tag">
                    {fmt(Math.min(dataBlocks - BRANCH_FIRST_LOGICAL.double, PTRS_PER_BLOCK ** 2))}{' '}
                    bloques en uso
                  </span>
                </div>

                <div className="branch-flow-row flow-multi-tier">
                  {/* Origen: Puntero i_block[13] */}
                  <div className="diagram-source-block">
                    <div className="source-block-title">i_block[13]</div>
                    <div className="source-slots-list">
                      <div className="source-slot-row active-slot">
                        <span className="slot-name font-mono">[13]</span>
                        <span className="slot-arrow">➜</span>
                        <span className="slot-target font-mono">
                          {fmtHex(doubleInfo.l1Node.physical)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="diagram-connectors-bundle">
                    <LuArrowRight className="connector-bundle-icon" />
                  </div>

                  {/* Nivel 1: Bloque de Índices L1 */}
                  <div className="diagram-index-block-card">
                    <div className="index-card-header badge-double">
                      <div className="index-type-tag">ÍNDICE L1 (Doble)</div>
                      <div className="index-phys font-mono">
                        {fmtHex(doubleInfo.l1Node.physical)}
                      </div>
                    </div>
                    <div className="index-slots-container">
                      <div className="index-slot-item active-slot">
                        <span className="idx-num font-mono">[{doubleInfo.activeL1}]</span>
                        <span className="idx-arrow">➜ N2:</span>
                        <span className="idx-target font-mono">
                          {fmtHex(doubleInfo.l2Node.physical)}
                        </span>
                      </div>
                      {doubleInfo.l1Count > 1 && (
                        <div className="index-gap-row font-mono">
                          ··· {doubleInfo.l1Count - 1} subtablas N2 más asignadas ···
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="diagram-connectors-bundle">
                    <LuArrowRight className="connector-bundle-icon" />
                  </div>

                  {/* Nivel 2: Bloque de Índices L2 */}
                  <div className="diagram-index-block-card">
                    <div className="index-card-header badge-double">
                      <div className="index-type-tag">
                        ÍNDICE L2 (Subtabla [{doubleInfo.activeL1}])
                      </div>
                      <div className="index-phys font-mono">
                        {fmtHex(doubleInfo.l2Node.physical)}
                      </div>
                    </div>
                    <div className="index-slots-container">
                      {doubleInfo.l2Entries.map((entry, idx) => {
                        if ('isGap' in entry) {
                          return (
                            <div key={`double-gap-${idx}`} className="index-gap-row font-mono">
                              ··· {entry.count} punteros intermedios ···
                            </div>
                          );
                        }
                        return (
                          <div
                            key={`double-slot-${entry.entryIdx}`}
                            className={`index-slot-item ${entry.isActive ? 'active-slot' : ''}`}
                            onClick={() => onSelectLogical(entry.logical)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                onSelectLogical(entry.logical);
                              }
                            }}
                            role="button"
                            tabIndex={0}
                          >
                            <span className="idx-num font-mono">[{entry.entryIdx}]</span>
                            <span className="idx-arrow">➜</span>
                            <span className="idx-target font-mono">{fmtHex(entry.physical)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="diagram-connectors-bundle">
                    <LuArrowRight className="connector-bundle-icon" />
                  </div>

                  {/* Bloques de Datos */}
                  <div className="diagram-target-blocks-grid">
                    {doubleInfo.l2Entries.map((entry, idx) => {
                      if ('isGap' in entry) {
                        return (
                          <div key={`double-data-gap-${idx}`} className="diagram-card-gap">
                            <span>··· {entry.count} bloques de datos físicos ···</span>
                          </div>
                        );
                      }
                      return (
                        <div
                          key={`double-data-${entry.entryIdx}`}
                          className={`diagram-card block-card-data ${
                            entry.isActive ? 'is-target-active' : ''
                          }`}
                          onClick={() => onSelectLogical(entry.logical)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              onSelectLogical(entry.logical);
                            }
                          }}
                          role="button"
                          tabIndex={0}
                        >
                          <div className="card-badge-header badge-data">
                            <span>DATOS L: {entry.logical}</span>
                            <span className="badge-offset font-mono">
                              {formatBytes(entry.logical * BLOCK_SIZE)}
                            </span>
                          </div>
                          <div className="card-phys-address font-mono">
                            {fmtHex(entry.physical)}
                          </div>
                          <div className="card-data-info">3 lecturas (L1 + L2 + Datos)</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}

            {/* RAMA 4: INDIRECTO TRIPLE (i_block[14]) */}
            {(tab === 'all' || tab === 'triple') && hasTriple && tripleInfo && (
              <section className="diagram-branch-section">
                <div className="branch-section-header">
                  <div className="section-title-wrap">
                    <LuLayers className="branch-icon icon-triple" />
                    <h4>
                      Indirecto Triple: <code>i_block[14]</code> (~1.073 Millones de Bloques · 4
                      TiB)
                    </h4>
                  </div>
                  <span className="branch-stats-tag">
                    {fmt(Math.max(0, dataBlocks - BRANCH_FIRST_LOGICAL.triple))} bloques en uso
                  </span>
                </div>

                <div className="branch-flow-row flow-multi-tier">
                  {/* Origen: Inodo [14] */}
                  <div className="diagram-source-block">
                    <div className="source-block-title">i_block[14]</div>
                    <div className="source-slots-list">
                      <div className="source-slot-row active-slot">
                        <span className="slot-name font-mono">[14]</span>
                        <span className="slot-arrow">➜</span>
                        <span className="slot-target font-mono">
                          {fmtHex(tripleInfo.l1Node.physical)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="diagram-connectors-bundle">
                    <LuArrowRight className="connector-bundle-icon" />
                  </div>

                  {/* Nivel 1 */}
                  <div className="diagram-index-block-card">
                    <div className="index-card-header badge-triple">
                      <div className="index-type-tag">ÍNDICE L1 (Triple)</div>
                      <div className="index-phys font-mono">
                        {fmtHex(tripleInfo.l1Node.physical)}
                      </div>
                    </div>
                    <div className="index-slots-container">
                      <div className="index-slot-item active-slot">
                        <span className="idx-num font-mono">[{tripleInfo.activeL1}]</span>
                        <span className="idx-arrow">➜ N2</span>
                        <span className="idx-target font-mono">
                          {fmtHex(tripleInfo.l2Node.physical)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="diagram-connectors-bundle">
                    <LuArrowRight className="connector-bundle-icon" />
                  </div>

                  {/* Nivel 2 */}
                  <div className="diagram-index-block-card">
                    <div className="index-card-header badge-triple">
                      <div className="index-type-tag">ÍNDICE L2</div>
                      <div className="index-phys font-mono">
                        {fmtHex(tripleInfo.l2Node.physical)}
                      </div>
                    </div>
                    <div className="index-slots-container">
                      <div className="index-slot-item active-slot">
                        <span className="idx-num font-mono">[{tripleInfo.activeL2}]</span>
                        <span className="idx-arrow">➜ N3</span>
                        <span className="idx-target font-mono">
                          {fmtHex(tripleInfo.l3Node.physical)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="diagram-connectors-bundle">
                    <LuArrowRight className="connector-bundle-icon" />
                  </div>

                  {/* Nivel 3 */}
                  <div className="diagram-index-block-card">
                    <div className="index-card-header badge-triple">
                      <div className="index-type-tag">ÍNDICE L3</div>
                      <div className="index-phys font-mono">
                        {fmtHex(tripleInfo.l3Node.physical)}
                      </div>
                    </div>
                    <div className="index-slots-container">
                      {tripleInfo.l3Entries.map((entry, idx) => {
                        if ('isGap' in entry) {
                          return (
                            <div key={`triple-gap-${idx}`} className="index-gap-row font-mono">
                              ··· {entry.count} punteros más ···
                            </div>
                          );
                        }
                        return (
                          <div
                            key={`triple-slot-${entry.entryIdx}`}
                            className={`index-slot-item ${entry.isActive ? 'active-slot' : ''}`}
                            onClick={() => onSelectLogical(entry.logical)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                onSelectLogical(entry.logical);
                              }
                            }}
                            role="button"
                            tabIndex={0}
                          >
                            <span className="idx-num font-mono">[{entry.entryIdx}]</span>
                            <span className="idx-arrow">➜</span>
                            <span className="idx-target font-mono">{fmtHex(entry.physical)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="diagram-connectors-bundle">
                    <LuArrowRight className="connector-bundle-icon" />
                  </div>

                  {/* Bloques de Datos */}
                  <div className="diagram-target-blocks-grid">
                    {tripleInfo.l3Entries.map((entry, idx) => {
                      if ('isGap' in entry) {
                        return (
                          <div key={`triple-data-gap-${idx}`} className="diagram-card-gap">
                            <span>··· {entry.count} bloques de datos físicos ···</span>
                          </div>
                        );
                      }
                      return (
                        <div
                          key={`triple-data-${entry.entryIdx}`}
                          className={`diagram-card block-card-data ${
                            entry.isActive ? 'is-target-active' : ''
                          }`}
                          onClick={() => onSelectLogical(entry.logical)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              onSelectLogical(entry.logical);
                            }
                          }}
                          role="button"
                          tabIndex={0}
                        >
                          <div className="card-badge-header badge-data">
                            <span>DATOS L: {entry.logical}</span>
                            <span className="badge-offset font-mono">
                              {formatBytes(entry.logical * BLOCK_SIZE)}
                            </span>
                          </div>
                          <div className="card-phys-address font-mono">
                            {fmtHex(entry.physical)}
                          </div>
                          <div className="card-data-info">4 lecturas (L1 + L2 + L3 + Datos)</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
