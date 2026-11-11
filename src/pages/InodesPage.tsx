import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  LuArrowRight,
  LuBoxes,
  LuChevronLeft,
  LuChevronRight,
  LuCircleCheck,
  LuDisc,
  LuFileCode,
  LuFileText,
  LuFolderTree,
  LuHash,
  LuInfo,
  LuLayers,
  LuPause,
  LuPlay,
  LuPlus,
  LuRotateCcw,
  LuTerminal,
  LuTrash2,
  LuX,
} from 'react-icons/lu';
import { InodeSimulation } from '../features/simulations/inodes/simulation';
import type { ResolutionResult } from '../features/simulations/inodes/types';

interface InodeMetaItem {
  id: string;
  name: string;
  techField: string;
  value: string;
  summary: string;
  explanation: string;
  kernelRole: string;
  command: string;
}

export function InodesPage() {
  // Starts completely empty (0 blocks / 0 KB) as requested
  const [allocatedBlocks, setAllocatedBlocks] = useState<number>(0);
  const [logicalPos, setLogicalPos] = useState<number>(1);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'pointers' | 'metadata'>('pointers');
  const [selectedMeta, setSelectedMeta] = useState<InodeMetaItem | null>(null);
  const [isAutoLoading, setIsAutoLoading] = useState<boolean>(false);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Simulation instance memoized with fixed seed
  const sim = useMemo(() => new InodeSimulation({ seed: 1234 }), []);

  // Keyboard shortcut: close explanation modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedMeta(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Dynamic structure reflecting allocated blocks
  const structure = useMemo(() => sim.getDynamicStructure(allocatedBlocks), [sim, allocatedBlocks]);

  // Full Ext4 Inode Metadata
  const metadata = useMemo(() => sim.getInodeMetadata(allocatedBlocks), [sim, allocatedBlocks]);

  // Friendly metadata items with simple explanations
  const metaItems: InodeMetaItem[] = useMemo(() => {
    return [
      {
        id: 'mode',
        name: 'Permisos de acceso',
        techField: 'st_mode (i_mode)',
        value: `${metadata.mode_str} (${metadata.mode_octal})`,
        summary: 'Permisos de lectura y escritura para el dueño, lectura para otros',
        explanation:
          'Indica los permisos de lectura (r), escritura (w) y ejecución (x) asignados al dueño, al grupo y al resto de usuarios. También clasifica el tipo de archivo (en este caso archivo regular).',
        kernelRole:
          'Cada vez que un proceso intenta abrir o modificar el archivo mediante open(), el kernel de Linux consulta estos permisos para autorizar o bloquear el acceso.',
        command: 'chmod 644 documento.dat',
      },
      {
        id: 'size',
        name: 'Tamaño del archivo',
        techField: 'st_size (i_size)',
        value: `${metadata.size_bytes.toLocaleString()} bytes (${metadata.size_formatted})`,
        summary: 'Longitud real de los datos del archivo',
        explanation:
          'Es la cantidad exacta de bytes que contiene el archivo. Un archivo recién creado empieza con 0 B y su tamaño crece conforme se escriben datos.',
        kernelRole:
          'El kernel utiliza este valor para determinar el final del archivo (EOF) y saber cuántos bytes debe devolver en operaciones de lectura.',
        command: 'ls -lh documento.dat',
      },
      {
        id: 'owner',
        name: 'Propietario y grupo',
        techField: 'st_uid / st_gid (i_uid / i_gid)',
        value: `${metadata.user}`,
        summary: 'Usuario y grupo del sistema dueños del archivo',
        explanation:
          'Identificadores numéricos (UID y GID) que asocian el archivo con una cuenta de usuario y un grupo en Linux. El usuario estándar de Ubuntu suele ser UID 1000.',
        kernelRole:
          'El sistema operativo compara el UID del proceso que intenta acceder al archivo contra este UID del inodo para determinar qué permisos le corresponden.',
        command: 'chown ubuntu:ubuntu documento.dat',
      },
      {
        id: 'links',
        name: 'Enlaces duros',
        techField: 'st_nlink (i_links_count)',
        value: `${metadata.links_count} enlace${metadata.links_count === 1 ? '' : 's'}`,
        summary: 'Cantidad de nombres que apuntan a este inodo',
        explanation:
          'Un inodo puede tener múltiples nombres en diferentes carpetas sin duplicar los datos en disco (enlaces duros). Este contador indica cuántos nombres apuntan a este mismo inodo.',
        kernelRole:
          'El sistema de archivos solo libera físicamente los bloques de disco cuando este contador llega a 0 (es decir, cuando se borra el último enlace con el comando "rm").',
        command: 'ln documento.dat respaldo.dat',
      },
      {
        id: 'mtime',
        name: 'Última modificación (mtime)',
        techField: 'st_mtime (i_mtime)',
        value: metadata.mtime,
        summary: 'Instante en que se modificó el contenido',
        explanation:
          'Fecha y hora exacta de la última vez que se escribieron o modificaron datos dentro del archivo.',
        kernelRole:
          'Es la fecha principal mostrada por comandos como "ls -l". Herramientas de desarrollo como compiladores y administradores de paquetes la usan para saber si un archivo cambió.',
        command: 'ls -l documento.dat',
      },
      {
        id: 'atime',
        name: 'Último acceso (atime)',
        techField: 'st_atime (i_atime)',
        value: metadata.atime,
        summary: 'Instante en que se leyó el archivo por última vez',
        explanation:
          'Fecha y hora en que un programa o usuario leyó el contenido del archivo sin alterarlo.',
        kernelRole:
          'Permite a herramientas de administración y limpieza identificar qué archivos no han sido consultados recientemente.',
        command: 'stat -c %x documento.dat',
      },
      {
        id: 'ctime',
        name: 'Cambio de inodo (ctime)',
        techField: 'st_ctime (i_ctime)',
        value: metadata.ctime,
        summary: 'Instante en que cambiaron los metadatos',
        explanation:
          'Fecha y hora del último cambio en las propiedades del propio inodo (como permisos con chmod, dueño con chown o renombrado).',
        kernelRole:
          'A diferencia de mtime, el usuario no puede cambiar ctime manualmente; el kernel de Linux siempre lo actualiza automáticamente ante cualquier cambio de estado.',
        command: 'stat -c %z documento.dat',
      },
      {
        id: 'blocks',
        name: 'Sectores ocupados en disco',
        techField: 'st_blocks (i_blocks_lo)',
        value: `${metadata.blocks_sectors} sectores (${allocatedBlocks} bloques de 4KB)`,
        summary: 'Espacio físico asignado en el almacenamiento',
        explanation:
          'Cantidad real de espacio físico que el archivo ocupa en el disco, medida en sectores estándar de 512 bytes (estándar POSIX).',
        kernelRole:
          'El sistema operativo utiliza este contador para calcular el espacio libre y ocupado en la partición (comando "df").',
        command: 'du -h documento.dat',
      },
      {
        id: 'flags',
        name: 'Banderas de Ext4',
        techField: 'i_flags',
        value: metadata.ext4_flags,
        summary: 'Opciones internas del sistema de archivos Ext4',
        explanation:
          'Banderas especiales que definen cómo almacena Ext4 este inodo (por ejemplo, el soporte de árboles de extensiones o extents para manejar archivos eficientemente).',
        kernelRole:
          'Le indica al controlador del sistema de archivos en el kernel cómo debe estructurar e indexar los bloques físicos del archivo.',
        command: 'lsattr documento.dat',
      },
      {
        id: 'generation',
        name: 'Generación del inodo',
        techField: 'i_generation',
        value: metadata.generation,
        summary: 'Versión única de la ranura del inodo',
        explanation:
          'Un identificador de versión que cambia cada vez que el inodo es reutilizado tras ser eliminado un archivo anterior.',
        kernelRole:
          'Evita confusiones en sistemas de archivos en red como NFS, asegurando que ningún cliente use identificadores obsoletos de archivos eliminados.',
        command: 'debugfs -R "stat <42>" /dev/sda1',
      },
    ];
  }, [metadata, allocatedBlocks]);

  // Allocation phase explanation
  const allocationInfo = useMemo(
    () => sim.getAllocationStepExplanation(allocatedBlocks),
    [sim, allocatedBlocks],
  );

  // Current resolution based on valid logical position
  const resolution: ResolutionResult = useMemo(() => {
    const maxPos = Math.max(1, allocatedBlocks);
    const validPos = Math.min(Math.max(1, Number.isFinite(logicalPos) ? logicalPos : 1), maxPos);
    return sim.resolvePosition(validPos);
  }, [sim, logicalPos, allocatedBlocks]);

  const steps = useMemo(() => resolution.steps || [], [resolution.steps]);
  const currentStep = steps[currentStepIdx] || steps[0];

  // Auto-loading step timer
  useEffect(() => {
    if (!isAutoLoading) {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
        autoPlayTimerRef.current = null;
      }
      return;
    }

    autoPlayTimerRef.current = setInterval(() => {
      setAllocatedBlocks((prev) => {
        if (prev >= 28) {
          setIsAutoLoading(false);
          return 28;
        }
        const next = prev + 1;
        setLogicalPos(next);
        return next;
      });
    }, 1400);

    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
        autoPlayTimerRef.current = null;
      }
    };
  }, [isAutoLoading]);

  // Methods to manipulate file allocation
  const handleAddBlocks = useCallback((count: number) => {
    setIsAutoLoading(false);
    setAllocatedBlocks((prev) => {
      const next = Math.min(28, prev + count);
      setLogicalPos(next);
      setCurrentStepIdx(0);
      return next;
    });
  }, []);

  const handleTruncate = useCallback((targetCount: number) => {
    setIsAutoLoading(false);
    const clamped = Math.max(0, Math.min(28, targetCount));
    setAllocatedBlocks(clamped);
    setLogicalPos(Math.max(1, clamped));
    setCurrentStepIdx(0);
  }, []);

  const handleSelectPos = (pos: number) => {
    if (pos > allocatedBlocks && allocatedBlocks > 0) return;
    setLogicalPos(pos);
    setCurrentStepIdx(0);
  };

  const handlePrevStep = () => {
    setCurrentStepIdx((prev) => Math.max(0, prev - 1));
  };

  const handleNextStep = () => {
    setCurrentStepIdx((prev) => Math.min(steps.length - 1, prev + 1));
  };

  // Check if a block is part of the current access path
  const pathBlocks = useMemo(() => {
    return new Set(steps.map((s) => s.disk_block));
  }, [steps]);

  const progressPercent = (allocatedBlocks / 28) * 100;

  return (
    <div className="inode-simulation-fullscreen">
      {/* Barra superior de control de carga dinámica (Ext4 / Ubuntu 24.04) */}
      <section className="inode-loading-toolbar">
        <div className="loading-toolbar-left">
          <span className="distro-pill">
            <LuTerminal /> Ubuntu 24.04 LTS · Kernel 6.8 (Ext4)
          </span>
          <span className="badge info">
            <LuFileCode /> {metadata.filename} (Inodo #{metadata.inode_id})
          </span>
          <span className="badge mode-tag">
            <strong>{metadata.size_formatted}</strong> ({allocatedBlocks} de 28 Bloques)
          </span>
        </div>

        <div className="loading-toolbar-actions">
          <button
            type="button"
            className="btn-load btn-load-primary"
            onClick={() => handleAddBlocks(1)}
            disabled={allocatedBlocks >= 28}
            title="Escribir 1 bloque de 4 KB"
          >
            <LuPlus /> +1 Bloque (4 KB)
          </button>
          <button
            type="button"
            className="btn-load"
            onClick={() => handleAddBlocks(4)}
            disabled={allocatedBlocks >= 28}
            title="Escribir 4 bloques (16 KB)"
          >
            <LuPlus /> +4 Bloques (16 KB)
          </button>
          <button
            type="button"
            className="btn-load"
            onClick={() => handleTruncate(28)}
            disabled={allocatedBlocks >= 28}
            title="Llenar todo el archivo con 28 bloques"
          >
            <LuLayers /> Llenar (112 KB)
          </button>
          <button
            type="button"
            className="btn-load"
            onClick={() => handleTruncate(0)}
            disabled={allocatedBlocks === 0}
            title="Vaciar archivo (truncate -s 0)"
          >
            <LuTrash2 /> Vaciar (0 KB)
          </button>
          <button
            type="button"
            className="btn-load"
            onClick={() => setIsAutoLoading((prev) => !prev)}
            title="Simular escritura continua paso a paso"
          >
            {isAutoLoading ? <LuPause /> : <LuPlay />} {isAutoLoading ? 'Pausar' : 'Carga Continua'}
          </button>
        </div>
      </section>

      {/* Grid de simulación */}
      <div className="simulation-grid">
        {/* Inodo: primera columna (Cuadrados Apilados / Stacked Blocks) */}
        <div className="inode-column">
          <div className="inode-card" id="inode-card">
            <div className="inode-header inode-header-compact">
              <div className="inode-header-title">
                <LuFileCode className="inode-icon" />
                <span className="inode-id">Inodo #{structure.inode_id}</span>
              </div>
            </div>

            {/* Switch de modo de vista del inodo: Punteros vs Metadatos */}
            <div className="inode-view-switch" role="group" aria-label="Modo de vista del inodo">
              <button
                type="button"
                className={`btn-inode-switch ${viewMode === 'pointers' ? 'active' : ''}`}
                onClick={() => setViewMode('pointers')}
              >
                <LuLayers /> Punteros a Bloques
              </button>
              <button
                type="button"
                className={`btn-inode-switch ${viewMode === 'metadata' ? 'active' : ''}`}
                onClick={() => setViewMode('metadata')}
              >
                <LuFileText /> Metadatos Ext4
              </button>
            </div>

            {/* Vista 1: Punteros de direccionamiento como CUADRADOS APILADOS */}
            {viewMode === 'pointers' && (
              <div className="inode-pointers-list inode-stack-wrapper">
                {structure.direct_pointers.map((ptr) => {
                  const isAllocated = ptr.is_allocated ?? allocatedBlocks >= ptr.position;
                  const isActive =
                    isAllocated && resolution.pointer_dom_id === `ptr-direct-${ptr.index}`;

                  return (
                    <div
                      key={`direct-${ptr.index}`}
                      className={`inode-stack-block pointer-item direct ${
                        isAllocated ? 'stack-direct' : 'stack-empty pointer-empty'
                      } ${isActive ? 'active-pointer' : ''}`}
                      id={`ptr-direct-${ptr.index}`}
                      title={
                        isAllocated
                          ? `Posición ${ptr.position} ➜ Bloque Físico #${String(ptr.block).padStart(2, '0')}`
                          : `Directo [${ptr.index}]: No asignado aún (NULL)`
                      }
                      onClick={() => {
                        if (isAllocated) handleSelectPos(ptr.position);
                      }}
                      onKeyDown={(e) => {
                        if (isAllocated && (e.key === 'Enter' || e.key === ' ')) {
                          handleSelectPos(ptr.position);
                        }
                      }}
                      role={isAllocated ? 'button' : undefined}
                      tabIndex={isAllocated ? 0 : undefined}
                    >
                      <span className="stack-title ptr-title">Directo [{ptr.index}]</span>
                      <span className="ptr-arrow">
                        <LuArrowRight className="icon-arrow" />
                      </span>
                      <span className="stack-target ptr-target">
                        {isAllocated
                          ? `Bloque #${String(ptr.block).padStart(2, '0')}`
                          : '(Vacío / NULL)'}
                      </span>
                    </div>
                  );
                })}

                {/* Indirect Simple */}
                {(() => {
                  const isAllocated =
                    structure.indirect_simple.is_allocated ?? allocatedBlocks > 12;
                  const isActive = isAllocated && resolution.route_type === 'INDIRECT_SIMPLE';
                  return (
                    <div
                      className={`inode-stack-block pointer-item indirect-1 ${
                        isAllocated ? 'stack-indirect-1' : 'stack-empty pointer-empty'
                      } ${isActive ? 'active-pointer' : ''}`}
                      id="ptr-indirect-1"
                      title={
                        isAllocated
                          ? `Bloque de Índice Simple #${String(structure.indirect_simple.block_id).padStart(2, '0')} (${structure.indirect_simple.entries.length}/4 datos)`
                          : 'Índice Simple: No reservado en disco aún'
                      }
                      onClick={() => {
                        if (isAllocated) handleSelectPos(13);
                      }}
                      onKeyDown={(e) => {
                        if (isAllocated && (e.key === 'Enter' || e.key === ' ')) {
                          handleSelectPos(13);
                        }
                      }}
                      role={isAllocated ? 'button' : undefined}
                      tabIndex={isAllocated ? 0 : undefined}
                    >
                      <span className="stack-title ptr-title">Ind. Simple [12]</span>
                      <span className="ptr-arrow">
                        <LuArrowRight className="icon-arrow" />
                      </span>
                      <span className="stack-target ptr-target">
                        {isAllocated
                          ? `Bloque #${String(structure.indirect_simple.block_id).padStart(2, '0')}`
                          : '(No reservado)'}
                      </span>
                    </div>
                  );
                })()}

                {/* Indirect Double */}
                {(() => {
                  const isAllocated =
                    structure.indirect_double.is_allocated ?? allocatedBlocks > 16;
                  const isActive = isAllocated && resolution.route_type === 'INDIRECT_DOUBLE';
                  return (
                    <div
                      className={`inode-stack-block pointer-item indirect-2 ${
                        isAllocated ? 'stack-indirect-2' : 'stack-empty pointer-empty'
                      } ${isActive ? 'active-pointer' : ''}`}
                      id="ptr-indirect-2"
                      title={
                        isAllocated
                          ? `Índice Doble N1 #${String(structure.indirect_double.block_id).padStart(2, '0')}`
                          : 'Índice Doble: No reservado en disco aún'
                      }
                      onClick={() => {
                        if (isAllocated) handleSelectPos(17);
                      }}
                      onKeyDown={(e) => {
                        if (isAllocated && (e.key === 'Enter' || e.key === ' ')) {
                          handleSelectPos(17);
                        }
                      }}
                      role={isAllocated ? 'button' : undefined}
                      tabIndex={isAllocated ? 0 : undefined}
                    >
                      <span className="stack-title ptr-title">Ind. Doble [13]</span>
                      <span className="ptr-arrow">
                        <LuArrowRight className="icon-arrow" />
                      </span>
                      <span className="stack-target ptr-target">
                        {isAllocated
                          ? `Bloque #${String(structure.indirect_double.block_id).padStart(2, '0')}`
                          : '(No reservado)'}
                      </span>
                    </div>
                  );
                })()}

                {/* Indirect Triple */}
                {(() => {
                  const isAllocated =
                    structure.indirect_triple.is_allocated ?? allocatedBlocks > 24;
                  const isActive = isAllocated && resolution.route_type === 'INDIRECT_TRIPLE';
                  return (
                    <div
                      className={`inode-stack-block pointer-item indirect-3 ${
                        isAllocated ? 'stack-indirect-3' : 'stack-empty pointer-empty'
                      } ${isActive ? 'active-pointer' : ''}`}
                      id="ptr-indirect-3"
                      title={
                        isAllocated
                          ? `Índice Triple N1 #${String(structure.indirect_triple.block_id).padStart(2, '0')}`
                          : 'Índice Triple: No reservado en disco aún'
                      }
                      onClick={() => {
                        if (isAllocated) handleSelectPos(25);
                      }}
                      onKeyDown={(e) => {
                        if (isAllocated && (e.key === 'Enter' || e.key === ' ')) {
                          handleSelectPos(25);
                        }
                      }}
                      role={isAllocated ? 'button' : undefined}
                      tabIndex={isAllocated ? 0 : undefined}
                    >
                      <span className="stack-title ptr-title">Ind. Triple [14]</span>
                      <span className="ptr-arrow">
                        <LuArrowRight className="icon-arrow" />
                      </span>
                      <span className="stack-target ptr-target">
                        {isAllocated
                          ? `Bloque #${String(structure.indirect_triple.block_id).padStart(2, '0')}`
                          : '(No reservado)'}
                      </span>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Vista 2: Metadatos Ext4 amigables e interactivos */}
            {viewMode === 'metadata' && (
              <div className="inode-meta-list inode-stack-wrapper">
                <div className="meta-list-hint">
                  <LuInfo />
                  <span>Haz clic en cualquier metadato para ver su explicación</span>
                </div>
                {metaItems.map((item) => (
                  <div
                    key={item.id}
                    className="inode-stack-block stack-meta meta-friendly-item"
                    onClick={() => setSelectedMeta(item)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedMeta(item);
                      }
                    }}
                    title={`Haz clic para ver qué es ${item.name}`}
                  >
                    <span className="stack-title meta-title-friendly">{item.name}</span>
                    <span className="stack-target meta-target-friendly">
                      <span className="meta-badge-value">{item.value}</span>
                      <LuInfo className="meta-click-icon" />
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Disco físico: bloque central */}
        <div className="disk-column">
          <div className="disk-panel">
            <div className="disk-header-bar">
              <div className="disk-header-info">
                <LuDisc className="icon-disk" />
                <div>
                  <h3>Disco Físico Ext4 (100 Bloques: #00 al #99)</h3>
                  <p>
                    Observa en tiempo real cómo los bloques pasan de Libres a Ocupados a medida que
                    cargas datos.
                  </p>
                </div>
              </div>
              <div className="disk-header-controls">
                <div className="input-group">
                  <label htmlFor="logical-pos-input">Posición a inspeccionar</label>
                  <div className="input-wrapper input-wrapper--compact">
                    <LuHash className="input-icon-prefix" />
                    <input
                      type="number"
                      id="logical-pos-input"
                      name="pos"
                      value={allocatedBlocks > 0 ? logicalPos : 0}
                      min={allocatedBlocks > 0 ? 1 : 0}
                      max={Math.max(1, allocatedBlocks)}
                      step={1}
                      placeholder={allocatedBlocks > 0 ? `1–${allocatedBlocks}` : 'Vacío'}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val) && val >= 1) {
                          handleSelectPos(val);
                        }
                      }}
                      disabled={allocatedBlocks === 0}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="disk-legend-bar">
              <span className="legend-chip legend-direct">Directo</span>
              <span className="legend-chip legend-simple">Índice Simple</span>
              <span className="legend-chip legend-simple-data">Dato Ind. Simple</span>
              <span className="legend-chip legend-double">Índice Doble</span>
              <span className="legend-chip legend-triple">Índice Triple</span>
              <span className="legend-chip legend-free">Libre</span>
            </div>

            <div className="disk-matrix-100" id="disk-matrix-100">
              {structure.disk_blocks.map((block) => {
                const isAllocated = block.role !== 'free';
                const isTarget = isAllocated && block.id === resolution.physical_block;
                const isFocused = isAllocated && block.id === currentStep?.disk_block;
                const isPath = isAllocated && pathBlocks.has(block.id);

                return (
                  <div
                    key={`disk-block-${block.id}`}
                    className={`matrix-cell cell-role-${block.role} ${
                      isTarget ? 'cell-active-target' : ''
                    } ${isFocused ? 'cell-focus-highlight' : ''} ${
                      isPath ? 'cell-path-member' : ''
                    }`}
                    id={`disk-cell-${block.id}`}
                    data-block-id={block.id}
                    data-block-role={block.role}
                    data-block-desc={block.desc}
                    title={block.desc}
                    onClick={() => {
                      if (block.position && block.position <= allocatedBlocks) {
                        handleSelectPos(block.position);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (
                        block.position &&
                        block.position <= allocatedBlocks &&
                        (e.key === 'Enter' || e.key === ' ')
                      ) {
                        handleSelectPos(block.position);
                      }
                    }}
                    role={
                      block.position && block.position <= allocatedBlocks ? 'button' : undefined
                    }
                    tabIndex={block.position && block.position <= allocatedBlocks ? 0 : undefined}
                  >
                    <span className="cell-id">#{String(block.id).padStart(2, '0')}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Columna derecha: simulación de carga (arriba) + tablas de índices (abajo) */}
        <div className="side-column">
          {/* Simulación de fase de carga y resolución */}
          <div className="controller-column">
            <section className="flow-controller-card">
              <div className="step-controller-wrapper">
                <div className="step-toolbar">
                  <div className="step-indicator">
                    <span className="pulse-indicator"></span>
                    <div className="step-indicator-text">
                      <strong id="step-counter-text">
                        {allocatedBlocks > 0
                          ? `Paso ${currentStepIdx + 1} de ${steps.length}`
                          : 'Archivo Vacío'}
                      </strong>
                      <span className="step-progress-label" id="step-progress-label">
                        {allocationInfo.phaseTitle}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                    <button
                      type="button"
                      id="btn-step-reset"
                      className="btn btn-ctrl btn-icon"
                      title="Reiniciar a paso 1"
                      onClick={() => setCurrentStepIdx(0)}
                    >
                      <LuRotateCcw />
                    </button>
                  </div>
                </div>

                <div className="step-progress-track" aria-hidden="true">
                  <div
                    className="step-progress-fill"
                    id="step-progress-fill"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>

                <div className="carousel" id="step-carousel">
                  <div className="carousel-stage">
                    <div className="carousel-viewport">
                      <div className="carousel-track" id="carousel-track">
                        <article className="carousel-card active">
                          <div className="step-header-row">
                            <span className="step-badge-tag">{allocationInfo.badge}</span>
                            <h3 className="step-card-title">{allocationInfo.phaseTitle}</h3>
                          </div>
                          <p className="step-body-text">{allocationInfo.summary}</p>
                          <p
                            style={{
                              fontSize: '0.82rem',
                              color: 'var(--text-muted)',
                              marginTop: '6px',
                              lineHeight: '1.4',
                            }}
                          >
                            {allocationInfo.details}
                          </p>
                        </article>
                      </div>
                    </div>
                  </div>
                  <div className="carousel-controls">
                    <button
                      type="button"
                      className="carousel-nav prev"
                      id="carousel-prev"
                      aria-label="Paso anterior"
                      disabled={currentStepIdx === 0}
                      onClick={handlePrevStep}
                    >
                      <LuChevronLeft />
                    </button>
                    <div
                      className="carousel-dots"
                      id="carousel-dots"
                      role="tablist"
                      aria-label="Pasos de la resolución"
                    >
                      {steps.map((_, idx) => (
                        <button
                          key={`step-dot-${idx}`}
                          type="button"
                          className={`dot ${idx === currentStepIdx ? 'active' : ''}`}
                          role="tab"
                          aria-label={`Ir al paso ${idx + 1}`}
                          onClick={() => setCurrentStepIdx(idx)}
                        ></button>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="carousel-nav next"
                      id="carousel-next"
                      aria-label="Paso siguiente"
                      disabled={currentStepIdx === steps.length - 1}
                      onClick={handleNextStep}
                    >
                      <LuChevronRight />
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Tablas de índices: fila inferior de la columna derecha */}
          <div className="index-panel-host" id="index-panel-host">
            {/* Vacío / Punteros directos */}
            <div
              className={`index-panel-empty ${allocatedBlocks <= 12 ? 'active' : ''}`}
              id="index-panel-empty"
            >
              <LuCircleCheck />
              <p>
                {allocatedBlocks === 0
                  ? 'Archivo sin datos. Inodo vacío (0 KB).'
                  : 'Punteros directos activos. No se necesita tabla de índices.'}
              </p>
            </div>

            {/* Índice Simple */}
            <section
              className={`index-panel index-panel-simple ${
                allocatedBlocks >= 13 && allocatedBlocks <= 16 ? 'active' : ''
              }`}
              id="indirect-simple-panel"
            >
              <div className="index-panel-header">
                <LuFolderTree />
                <h4>Índice Simple (Bloque #{structure.indirect_simple.block_id})</h4>
              </div>
              <div className="index-panel-subtitle">
                {structure.indirect_simple.entries.length} de 4 bloques de datos indexados
              </div>
              <div className="index-panel-body">
                <div
                  className="simple-node-row index-node-row"
                  id="simple-node-parent"
                  data-target-block={structure.indirect_simple.block_id}
                >
                  <span>Índice Simple en Disco</span>
                  <strong>➜ Datos</strong>
                </div>
                {structure.indirect_simple.entries.map((entry) => {
                  const isActive = entry.position === resolution.logical_position;
                  return (
                    <div
                      key={`simple-entry-${entry.index}`}
                      className={`simple-entry-item ${isActive ? 'active-entry' : ''}`}
                      id={`simple-entry-${entry.index}`}
                      data-index={entry.index}
                      data-position={entry.position}
                      data-target-block={entry.block}
                      onClick={() => handleSelectPos(entry.position)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') handleSelectPos(entry.position);
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <span>Entrada [{entry.index}]</span>
                      <strong>➜ Bloque #{String(entry.block).padStart(2, '0')}</strong>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Índice Doble */}
            <section
              className={`index-panel index-panel-double ${
                allocatedBlocks >= 17 && allocatedBlocks <= 24 ? 'active' : ''
              }`}
              id="indirect-double-panel"
            >
              <div className="index-panel-header">
                <LuLayers />
                <h4>Índice Doble (N1 Bloque #{structure.indirect_double.block_id})</h4>
              </div>
              <div className="index-panel-subtitle">Subtablas N2 y bloques de datos</div>
              <div className="index-panel-body" id="double-panel-body">
                <div
                  className="double-item-row index-node-row"
                  id="double-node-n1"
                  data-target-block={structure.indirect_double.block_id}
                  onClick={() => handleSelectPos(17)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') handleSelectPos(17);
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <span>Índice Doble N1</span>
                  <strong>➜ Nodos N2</strong>
                </div>

                {structure.indirect_double.l1_entries.map((l1, l1Idx) => {
                  const subBase = 17 + l1Idx * 4;
                  const l2List = structure.indirect_double.l2_map[l1] || [];

                  return (
                    <div key={`double-subtable-${l1}`} className="double-subtable-box">
                      <div className="subtable-title">
                        Subtabla N2 (Bloque #{String(l1).padStart(2, '0')}):
                      </div>
                      <div
                        className="double-item-row index-node-row"
                        id={`double-node-n2-${l1Idx}`}
                        data-target-block={l1}
                        onClick={() => handleSelectPos(subBase)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') handleSelectPos(subBase);
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        <span>Índice Doble N2 Subtabla [{l1Idx}]</span>
                        <strong>➜ Datos</strong>
                      </div>
                      {l2List.map((dataBlk, l2Idx) => {
                        const position = subBase + l2Idx;
                        const isActive = position === resolution.logical_position;
                        return (
                          <div
                            key={`double-entry-${position}`}
                            className={`double-item-row ${isActive ? 'active-entry' : ''}`}
                            id={`double-entry-${position}`}
                            data-pos={position}
                            data-target-block={dataBlk}
                            onClick={() => handleSelectPos(position)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') handleSelectPos(position);
                            }}
                            role="button"
                            tabIndex={0}
                          >
                            <span>
                              Entrada [{l1Idx}][{l2Idx}]
                            </span>
                            <strong>➜ Bloque #{String(dataBlk).padStart(2, '0')}</strong>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Índice Triple */}
            <section
              className={`index-panel index-panel-triple ${allocatedBlocks >= 25 ? 'active' : ''}`}
              id="indirect-triple-panel"
            >
              <div className="index-panel-header">
                <LuBoxes />
                <h4>Índice Triple (N1 Bloque #{structure.indirect_triple.block_id})</h4>
              </div>
              <div className="index-panel-subtitle">Cadena N1 ➜ N2 ➜ N3 ➜ Datos</div>
              <div className="index-panel-body" id="triple-panel-body">
                <div
                  className="triple-item-row index-node-row"
                  id="triple-node-n1"
                  data-target-block={structure.indirect_triple.block_id}
                  onClick={() => handleSelectPos(25)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') handleSelectPos(25);
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <span>Índice Triple N1</span>
                  <strong>➜ Nodo N2</strong>
                </div>

                {structure.indirect_triple.l1_entries?.[0] !== undefined && (
                  <div
                    className="triple-item-row index-node-row"
                    id="triple-node-n2"
                    data-target-block={structure.indirect_triple.l1_entries[0]}
                    onClick={() => handleSelectPos(25)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') handleSelectPos(25);
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <span>Índice Triple N2</span>
                    <strong>➜ Nodo N3</strong>
                  </div>
                )}

                {structure.indirect_triple.l2_entries?.[0] !== undefined && (
                  <div
                    className="triple-item-row index-node-row"
                    id="triple-node-n3"
                    data-target-block={structure.indirect_triple.l2_entries[0]}
                    onClick={() => handleSelectPos(25)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') handleSelectPos(25);
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <span>Índice Triple N3</span>
                    <strong>➜ Datos</strong>
                  </div>
                )}

                {structure.indirect_triple.data_blocks?.map((dataBlk, idx) => {
                  const position = 25 + idx;
                  const isActive = position === resolution.logical_position;
                  return (
                    <div
                      key={`triple-entry-${position}`}
                      className={`triple-item-row ${isActive ? 'active-entry' : ''}`}
                      id={`triple-entry-${position}`}
                      data-pos={position}
                      data-target-block={dataBlk}
                      onClick={() => handleSelectPos(position)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') handleSelectPos(position);
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <span>N3 Entrada [{idx}]</span>
                      <strong>➜ Bloque #{String(dataBlk).padStart(2, '0')}</strong>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Modal amigable de explicación de metadatos */}
      {selectedMeta && (
        <div className="inode-meta-modal-backdrop" id="meta-explanation-modal">
          <button
            type="button"
            className="modal-backdrop-dismiss"
            onClick={() => setSelectedMeta(null)}
            aria-label="Cerrar modal"
          />
          <div
            className="inode-meta-modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="meta-modal-title"
          >
            <div className="inode-meta-modal-header">
              <div className="modal-title-group">
                <LuInfo className="modal-title-icon" />
                <div>
                  <h3 id="meta-modal-title">{selectedMeta.name}</h3>
                  <span className="modal-tech-tag">{selectedMeta.techField}</span>
                </div>
              </div>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setSelectedMeta(null)}
                aria-label="Cerrar ventana"
              >
                <LuX />
              </button>
            </div>

            <div className="inode-meta-modal-body">
              <div className="meta-modal-value-box">
                <span className="meta-modal-label">Valor en este inodo:</span>
                <code className="meta-modal-val">{selectedMeta.value}</code>
              </div>

              <div className="meta-modal-section">
                <h4>¿Qué es este campo en un inodo?</h4>
                <p>{selectedMeta.explanation}</p>
              </div>

              <div className="meta-modal-section">
                <h4>¿Para qué lo usa el sistema operativo (Linux)?</h4>
                <p>{selectedMeta.kernelRole}</p>
              </div>

              <div className="meta-modal-section meta-cmd-box">
                <span className="meta-cmd-label">Comando de terminal relacionado:</span>
                <code>{selectedMeta.command}</code>
              </div>
            </div>

            <div className="inode-meta-modal-footer">
              <button
                type="button"
                className="btn-modal-done"
                onClick={() => setSelectedMeta(null)}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
