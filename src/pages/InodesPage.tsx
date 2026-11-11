import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  LuArrowRight,
  LuBoxes,
  LuCircleCheck,
  LuDisc,
  LuFileCode,
  LuFileText,
  LuFolderTree,
  LuHash,
  LuInfo,
  LuLayers,
  LuMaximize2,
  LuPause,
  LuPlay,
  LuPlus,
  LuSearch,
  LuTerminal,
  LuTrash2,
  LuX,
} from 'react-icons/lu';
import { InodeSimulation } from '../features/simulations/inodes/simulation';
import type { ResolutionResult } from '../features/simulations/inodes/types';

type InspectorType = 'simple' | 'double' | 'triple' | null;

interface MiniClusterBlock {
  id: number;
  label: string;
  role: string;
  desc: string;
  position?: number;
  isAllocated: boolean;
  isTarget: boolean;
  isIndex: boolean;
}

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
  const [viewMode, setViewMode] = useState<'pointers' | 'metadata'>('pointers');
  const [selectedMeta, setSelectedMeta] = useState<InodeMetaItem | null>(null);
  const [activeInspector, setActiveInspector] = useState<InspectorType>(null);
  const [simpleSearchIdx, setSimpleSearchIdx] = useState<number>(0);
  const [doubleSubtableSelect, setDoubleSubtableSelect] = useState<number>(0);
  const [doubleN1SearchIdx, setDoubleN1SearchIdx] = useState<number>(0);
  const [doubleN2SearchIdx, setDoubleN2SearchIdx] = useState<number>(0);
  const [tripleSearchIdx, setTripleSearchIdx] = useState<number>(0);
  const [isAutoLoading, setIsAutoLoading] = useState<boolean>(false);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Simulation instance memoized with fixed seed
  const sim = useMemo(() => new InodeSimulation({ seed: 1234 }), []);

  // Keyboard shortcut: close modals on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedMeta(null);
        setActiveInspector(null);
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

  // Mini-cluster ("parte reducida del disco") according to the active inspector
  const miniClusterBlocks: MiniClusterBlock[] = useMemo(() => {
    if (!activeInspector) return [];

    let focusedIds: number[] = [];
    if (activeInspector === 'simple') {
      focusedIds = [0, 7, 8, 9, 17, 18, 19, 27, 28, 29, 37, 38, 39, 90, 98, 99];
    } else if (activeInspector === 'double') {
      focusedIds = [23, 24, 25, 28, 29, 30, 38, 39, 40, 41, 42, 43, 50, 51, 52, 53];
    } else if (activeInspector === 'triple') {
      focusedIds = [68, 69, 70, 78, 79, 80, 88, 89, 90, 91, 95, 96, 97, 98, 99];
    }

    const blockMap = new Map(structure.disk_blocks.map((b) => [b.id, b]));

    return focusedIds.map((id) => {
      const b = blockMap.get(id);
      const isAllocated = b ? b.role !== 'free' : false;
      const isTarget = isAllocated && b?.id === resolution.physical_block;
      const isIndex =
        id === structure.indirect_simple.block_id ||
        id === structure.indirect_double.block_id ||
        structure.indirect_double.l1_entries.includes(id) ||
        id === structure.indirect_triple.block_id ||
        structure.indirect_triple.l1_entries.includes(id) ||
        structure.indirect_triple.l2_entries.includes(id);

      return {
        id,
        label: `#${String(id).padStart(2, '0')}`,
        role: b?.role ?? 'free',
        desc: b?.desc ?? `Bloque físico #${id}`,
        position: b?.position,
        isAllocated,
        isTarget,
        isIndex,
      };
    });
  }, [activeInspector, structure, resolution.physical_block]);

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
      return next;
    });
  }, []);

  const handleTruncate = useCallback((targetCount: number) => {
    setIsAutoLoading(false);
    const clamped = Math.max(0, Math.min(28, targetCount));
    setAllocatedBlocks(clamped);
    setLogicalPos(Math.max(1, clamped));
  }, []);

  const handleSelectPos = (pos: number) => {
    if (pos > allocatedBlocks && allocatedBlocks > 0) return;
    setLogicalPos(pos);
  };

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
                          ? `Bloque de Índice Simple #${String(structure.indirect_simple.block_id).padStart(2, '0')} (${structure.indirect_simple.entries.length}/4 datos). Clic para abrir inspector.`
                          : 'Índice Simple: Clic para abrir inspector de 1,024 referencias Ext4'
                      }
                      onClick={() => {
                        if (isAllocated) handleSelectPos(13);
                        setActiveInspector('simple');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          if (isAllocated) handleSelectPos(13);
                          setActiveInspector('simple');
                        }
                      }}
                      role="button"
                      tabIndex={0}
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
                          ? `Índice Doble N1 #${String(structure.indirect_double.block_id).padStart(2, '0')}. Clic para abrir inspector.`
                          : 'Índice Doble: Clic para abrir inspector de 1.04M referencias Ext4'
                      }
                      onClick={() => {
                        if (isAllocated) handleSelectPos(17);
                        setActiveInspector('double');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          if (isAllocated) handleSelectPos(17);
                          setActiveInspector('double');
                        }
                      }}
                      role="button"
                      tabIndex={0}
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
                          ? `Índice Triple N1 #${String(structure.indirect_triple.block_id).padStart(2, '0')}. Clic para abrir inspector.`
                          : 'Índice Triple: Clic para abrir inspector de 1.07B referencias Ext4'
                      }
                      onClick={() => {
                        if (isAllocated) handleSelectPos(25);
                        setActiveInspector('triple');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          if (isAllocated) handleSelectPos(25);
                          setActiveInspector('triple');
                        }
                      }}
                      role="button"
                      tabIndex={0}
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
                const isIndexRoute = isAllocated && block.id === resolution.index_block;

                return (
                  <div
                    key={`disk-block-${block.id}`}
                    className={`matrix-cell cell-role-${block.role} ${
                      isTarget ? 'cell-active-target' : ''
                    } ${isIndexRoute ? 'cell-path-member' : ''}`}
                    id={`disk-cell-${block.id}`}
                    data-block-id={block.id}
                    data-block-role={block.role}
                    data-block-desc={block.desc}
                    title={block.desc}
                    onClick={() => {
                      if (block.role === 'index_simple') {
                        setActiveInspector('simple');
                      } else if (
                        block.role === 'index_double_1' ||
                        block.role === 'index_double_2'
                      ) {
                        setActiveInspector('double');
                      } else if (
                        block.role === 'index_triple_1' ||
                        block.role === 'index_triple_sub'
                      ) {
                        setActiveInspector('triple');
                      }
                      if (block.position && block.position <= allocatedBlocks) {
                        handleSelectPos(block.position);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        if (block.role === 'index_simple') {
                          setActiveInspector('simple');
                        } else if (
                          block.role === 'index_double_1' ||
                          block.role === 'index_double_2'
                        ) {
                          setActiveInspector('double');
                        } else if (
                          block.role === 'index_triple_1' ||
                          block.role === 'index_triple_sub'
                        ) {
                          setActiveInspector('triple');
                        }
                        if (block.position && block.position <= allocatedBlocks) {
                          handleSelectPos(block.position);
                        }
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
          {/* Resumen del estado de asignación y arquitectura Ext4 */}
          <div className="controller-column">
            <section className="allocation-overview-card">
              <div className="overview-header-row">
                <span className="step-badge-tag">{allocationInfo.badge}</span>
                <span className="overview-progress-tag">
                  {allocatedBlocks} / 28 Bloques ({progressPercent.toFixed(0)}%)
                </span>
              </div>
              <h3 className="overview-card-title">{allocationInfo.phaseTitle}</h3>
              <p className="overview-body-text">{allocationInfo.summary}</p>
              <p className="overview-detail-text">{allocationInfo.details}</p>

              <div className="step-progress-track" aria-hidden="true">
                <div
                  className="step-progress-fill"
                  id="step-progress-fill"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>

              {allocatedBlocks > 0 && (
                <div className="active-resolution-pill">
                  <span className="res-pill-label">Lectura activa:</span>
                  <span className="res-pill-val">
                    Posición {resolution.logical_position} ➜ Bloque #
                    {String(resolution.physical_block).padStart(2, '0')} ({resolution.pointer_label}
                    )
                  </span>
                </div>
              )}
            </section>

            {/* Selector de Inspectores de Bloques de Índices Ext4 */}
            <div className="inspector-launcher-bar">
              <span className="launcher-bar-title">Inspectores Flotantes Ext4 (1,024 refs):</span>
              <div className="launcher-btn-group">
                <button
                  type="button"
                  className={`btn-launcher ${activeInspector === 'simple' ? 'active' : ''}`}
                  onClick={() => setActiveInspector('simple')}
                  title="Abrir inspector flotante de Índice Simple"
                >
                  <LuFolderTree /> Simple
                </button>
                <button
                  type="button"
                  className={`btn-launcher ${activeInspector === 'double' ? 'active' : ''}`}
                  onClick={() => setActiveInspector('double')}
                  title="Abrir inspector flotante de Índice Doble"
                >
                  <LuLayers /> Doble
                </button>
                <button
                  type="button"
                  className={`btn-launcher ${activeInspector === 'triple' ? 'active' : ''}`}
                  onClick={() => setActiveInspector('triple')}
                  title="Abrir inspector flotante de Índice Triple"
                >
                  <LuBoxes /> Triple
                </button>
              </div>
            </div>
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
              <button
                type="button"
                className="btn-open-inspector-action"
                onClick={() => setActiveInspector('simple')}
              >
                <LuMaximize2 /> Vista Previa del Inspector (1,024 Entradas)
              </button>
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
                <button
                  type="button"
                  className="btn-open-inspector-icon"
                  onClick={() => setActiveInspector('simple')}
                  title="Desplegar inspector de disco reducido y 1,024 entradas"
                >
                  <LuMaximize2 />
                </button>
              </div>
              <div className="index-panel-subtitle">
                {structure.indirect_simple.entries.length} de 4 bloques indexados en simulación
                (1,024 reales Ext4)
              </div>
              <div className="index-panel-body">
                <button
                  type="button"
                  className="btn-open-inspector-action"
                  onClick={() => setActiveInspector('simple')}
                >
                  <LuMaximize2 /> Desplegar Inspector de Disco y 1,024 Entradas
                </button>
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
                <button
                  type="button"
                  className="btn-open-inspector-icon"
                  onClick={() => setActiveInspector('double')}
                  title="Desplegar inspector de disco reducido y 1.04M entradas"
                >
                  <LuMaximize2 />
                </button>
              </div>
              <div className="index-panel-subtitle">
                Subtablas N2 y bloques de datos (1.04M referencias Ext4)
              </div>
              <div className="index-panel-body" id="double-panel-body">
                <button
                  type="button"
                  className="btn-open-inspector-action"
                  onClick={() => setActiveInspector('double')}
                >
                  <LuMaximize2 /> Desplegar Inspector de Disco y Subtablas N2
                </button>
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
                <button
                  type="button"
                  className="btn-open-inspector-icon"
                  onClick={() => setActiveInspector('triple')}
                  title="Desplegar inspector de disco reducido y 1.07B entradas"
                >
                  <LuMaximize2 />
                </button>
              </div>
              <div className="index-panel-subtitle">
                Cadena N1 ➜ N2 ➜ N3 ➜ Datos (1.07B referencias Ext4)
              </div>
              <div className="index-panel-body" id="triple-panel-body">
                <button
                  type="button"
                  className="btn-open-inspector-action"
                  onClick={() => setActiveInspector('triple')}
                >
                  <LuMaximize2 /> Desplegar Inspector de Cadena Triple
                </button>
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

      {/* Ventana Flotante / Modal: Inspector de Bloque de Índices Ext4 */}
      {activeInspector && (
        <div className="inode-inspector-modal-backdrop" id="index-inspector-modal">
          <button
            type="button"
            className="modal-backdrop-dismiss"
            onClick={() => setActiveInspector(null)}
            aria-label="Cerrar modal"
          />
          <div
            className="inode-inspector-modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="inspector-modal-title"
          >
            {/* Modal Header */}
            <div className="inode-inspector-modal-header">
              <div className="inspector-title-group">
                {activeInspector === 'simple' && (
                  <LuFolderTree className="modal-title-icon icon-simple" />
                )}
                {activeInspector === 'double' && (
                  <LuLayers className="modal-title-icon icon-double" />
                )}
                {activeInspector === 'triple' && (
                  <LuBoxes className="modal-title-icon icon-triple" />
                )}
                <div>
                  <h3 id="inspector-modal-title">
                    {activeInspector === 'simple' &&
                      `Inspector de Bloque: Índice Simple (Bloque #${structure.indirect_simple.block_id})`}
                    {activeInspector === 'double' &&
                      `Inspector de Bloque: Índice Doble (N1 Bloque #${structure.indirect_double.block_id})`}
                    {activeInspector === 'triple' &&
                      `Inspector de Bloque: Índice Triple (N1 Bloque #${structure.indirect_triple.block_id})`}
                  </h3>
                  <div className="inspector-spec-pill">
                    <span className="spec-badge">Ext4 Estándar (Linux Kernel)</span>
                    <span className="spec-formula">
                      {activeInspector === 'simple' &&
                        'Bloque 4 KB (4,096 B) ÷ Puntero 4 B (__u32) = 1,024 Entradas Reales (4 MB)'}
                      {activeInspector === 'double' &&
                        '1,024 Punteros N1 × 1,024 Subtablas N2 = 1,048,576 Bloques (4 GB)'}
                      {activeInspector === 'triple' &&
                        '1,024 × 1,024 × 1,024 = 1,073,741,824 Bloques Direccionables (4 TB)'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setActiveInspector(null)}
                aria-label="Cerrar inspector"
              >
                <LuX />
              </button>
            </div>

            {/* Modal Body */}
            <div className="inode-inspector-modal-body">
              {/* Sección 1: Parte reducida del disco */}
              <section className="inspector-disk-section">
                <div className="section-header-row">
                  <div className="section-title-wrap">
                    <LuDisc className="section-icon" />
                    <h4>Parte Reducida del Disco (Cluster Local)</h4>
                  </div>
                  <span className="section-hint">
                    Enfocando el sector del índice y las posiciones buscadas sin mover el disco
                    completo
                  </span>
                </div>

                <div className="mini-cluster-grid" id="mini-cluster-grid">
                  {miniClusterBlocks.map((b) => (
                    <div
                      key={`mini-cell-${b.id}`}
                      className={`mini-cell cell-role-${b.role} ${b.isTarget ? 'mini-target' : ''} ${
                        b.isIndex ? 'mini-index' : ''
                      }`}
                      title={b.desc}
                      onClick={() => {
                        if (b.position && b.position <= allocatedBlocks) {
                          handleSelectPos(b.position);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (
                          b.position &&
                          b.position <= allocatedBlocks &&
                          (e.key === 'Enter' || e.key === ' ')
                        ) {
                          handleSelectPos(b.position);
                        }
                      }}
                      role={b.position && b.position <= allocatedBlocks ? 'button' : undefined}
                      tabIndex={b.position && b.position <= allocatedBlocks ? 0 : undefined}
                    >
                      <span className="mini-id">{b.label}</span>
                      <span className="mini-role-tag">
                        {b.id === structure.indirect_simple.block_id && 'Índice 1'}
                        {b.id === structure.indirect_double.block_id && 'Índice N1'}
                        {structure.indirect_double.l1_entries.includes(b.id) && 'Sub N2'}
                        {b.id === structure.indirect_triple.block_id && 'Índice N1'}
                        {structure.indirect_triple.l1_entries.includes(b.id) && 'Sub N2'}
                        {structure.indirect_triple.l2_entries.includes(b.id) && 'Sub N3'}
                        {!b.isIndex && b.isAllocated && 'Dato'}
                        {!b.isIndex && !b.isAllocated && 'Sector'}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Sección 2: Tabla realista de 1,024 entradas con Opción 2 (Rangos y Elipsis) */}
              <section className="inspector-table-section">
                <div className="section-header-row">
                  <div className="section-title-wrap">
                    <LuFolderTree className="section-icon" />
                    <h4>Tabla de Direccionamiento Ext4 (1,024 Entradas · Opción 2)</h4>
                  </div>
                  <span className="section-badge-realistic">1,024 Entradas Reales</span>
                </div>

                {activeInspector === 'simple' && (
                  <div className="realistic-table-box">
                    <div className="table-header-row">
                      <span>Entrada de 4 Bytes</span>
                      <span>Puntero Ext4</span>
                      <span>Bloque Físico</span>
                      <span>Posición Lógica y Offset</span>
                      <span>Estado</span>
                    </div>

                    {/* Entradas asignadas activas */}
                    {structure.indirect_simple.entries.map((entry) => {
                      const isActive = entry.position === resolution.logical_position;
                      return (
                        <div
                          key={`real-simple-${entry.index}`}
                          className={`table-entry-row allocated ${isActive ? 'active-target-entry' : ''}`}
                          onClick={() => handleSelectPos(entry.position)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              handleSelectPos(entry.position);
                            }
                          }}
                          role="button"
                          tabIndex={0}
                        >
                          <span className="col-entry">Entrada [{entry.index}]</span>
                          <span className="col-ptr">
                            <code>0x{entry.block.toString(16).padStart(8, '0')}</code>
                          </span>
                          <span className="col-block">
                            Bloque #{String(entry.block).padStart(2, '0')}
                          </span>
                          <span className="col-offset">
                            Posición {entry.position} (Offset {(entry.position - 1) * 4} KB)
                          </span>
                          <span className="col-status status-allocated">Asignado</span>
                        </div>
                      );
                    })}

                    {/* Si no hay entradas asignadas en la simulación */}
                    {structure.indirect_simple.entries.length === 0 && (
                      <div className="table-entry-row empty">
                        <span className="col-entry">Entrada [0]</span>
                        <span className="col-ptr">
                          <code>0x00000000</code>
                        </span>
                        <span className="col-block">(NULL / No asignado)</span>
                        <span className="col-offset">Posición 13 (Offset 48 KB)</span>
                        <span className="col-status status-free">Libre</span>
                      </div>
                    )}

                    {/* Elipsis realista que resume las entradas libres */}
                    <div className="table-ellipsis-row">
                      <span className="ellipsis-dots">···</span>
                      <span className="ellipsis-text">
                        {1024 - Math.max(1, structure.indirect_simple.entries.length)} entradas NULL
                        (0x00000000) libres restantes en este bloque de 4 KB (Rango [
                        {Math.max(1, structure.indirect_simple.entries.length)}] al [1022])
                      </span>
                      <span className="ellipsis-dots">···</span>
                    </div>

                    {/* Límite superior de entrada 1023 */}
                    <div className="table-entry-row boundary">
                      <span className="col-entry">Entrada [1023]</span>
                      <span className="col-ptr">
                        <code>0x00000000</code>
                      </span>
                      <span className="col-block">(NULL / Límite Ext4)</span>
                      <span className="col-offset">
                        Posición 1036 (Offset 4,144 KB · Fin del bloque de 4 MB)
                      </span>
                      <span className="col-status status-boundary">Límite Superior</span>
                    </div>
                  </div>
                )}

                {activeInspector === 'double' && (
                  <div className="realistic-table-box">
                    <div className="double-subtable-switcher">
                      <span className="switcher-label">Subtabla N2 activa:</span>
                      <button
                        type="button"
                        className={`btn-subtable-tab ${doubleSubtableSelect === 0 ? 'active' : ''}`}
                        onClick={() => setDoubleSubtableSelect(0)}
                      >
                        Subtabla N2 [0] (Bloque #{structure.indirect_double.l1_entries[0] ?? 29})
                      </button>
                      <button
                        type="button"
                        className={`btn-subtable-tab ${doubleSubtableSelect === 1 ? 'active' : ''}`}
                        onClick={() => setDoubleSubtableSelect(1)}
                      >
                        Subtabla N2 [1] (Bloque #{structure.indirect_double.l1_entries[1] ?? 39})
                      </button>
                    </div>

                    <div className="table-header-row">
                      <span>Nivel y Entrada</span>
                      <span>Puntero Ext4</span>
                      <span>Destino en Disco</span>
                      <span>Posición Lógica</span>
                      <span>Estado</span>
                    </div>

                    {/* N1 entries preview */}
                    <div className="table-entry-row n1-row">
                      <span className="col-entry">N1 Entrada [{doubleSubtableSelect}]</span>
                      <span className="col-ptr">
                        <code>
                          0x
                          {(structure.indirect_double.l1_entries[doubleSubtableSelect] ?? 0)
                            .toString(16)
                            .padStart(8, '0')}
                        </code>
                      </span>
                      <span className="col-block">
                        Subtabla N2 #
                        {String(
                          structure.indirect_double.l1_entries[doubleSubtableSelect] ?? 0,
                        ).padStart(2, '0')}
                      </span>
                      <span className="col-offset">
                        Cubre entradas {doubleSubtableSelect * 1024} a{' '}
                        {(doubleSubtableSelect + 1) * 1024 - 1}
                      </span>
                      <span className="col-status status-allocated">Subtabla N2</span>
                    </div>

                    {/* Data entries for the selected subtable */}
                    {(() => {
                      const subId = structure.indirect_double.l1_entries[doubleSubtableSelect];
                      const dataList = subId ? structure.indirect_double.l2_map[subId] || [] : [];
                      const basePos = 17 + doubleSubtableSelect * 4;

                      return dataList.map((blk, idx) => {
                        const pos = basePos + idx;
                        const isActive = pos === resolution.logical_position;
                        return (
                          <div
                            key={`double-entry-${doubleSubtableSelect}-${idx}`}
                            className={`table-entry-row allocated ${isActive ? 'active-target-entry' : ''}`}
                            onClick={() => handleSelectPos(pos)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                handleSelectPos(pos);
                              }
                            }}
                            role="button"
                            tabIndex={0}
                          >
                            <span className="col-entry">
                              N2[{doubleSubtableSelect}] Entrada [{idx}]
                            </span>
                            <span className="col-ptr">
                              <code>0x{blk.toString(16).padStart(8, '0')}</code>
                            </span>
                            <span className="col-block">
                              Bloque #{String(blk).padStart(2, '0')}
                            </span>
                            <span className="col-offset">Posición {pos}</span>
                            <span className="col-status status-allocated">Asignado</span>
                          </div>
                        );
                      });
                    })()}

                    <div className="table-ellipsis-row">
                      <span className="ellipsis-dots">···</span>
                      <span className="ellipsis-text">
                        1,020 entradas libres en esta Subtabla N2 (Rango [4] al [1022]) y 1,022
                        subtablas N2 libres en N1
                      </span>
                      <span className="ellipsis-dots">···</span>
                    </div>

                    <div className="table-entry-row boundary">
                      <span className="col-entry">N2[{doubleSubtableSelect}] Entrada [1023]</span>
                      <span className="col-ptr">
                        <code>0x00000000</code>
                      </span>
                      <span className="col-block">(NULL)</span>
                      <span className="col-offset">
                        Fin de Subtabla N2 [{doubleSubtableSelect}]
                      </span>
                      <span className="col-status status-boundary">Límite N2</span>
                    </div>
                  </div>
                )}

                {activeInspector === 'triple' && (
                  <div className="realistic-table-box">
                    <div className="table-header-row">
                      <span>Jerarquía de 3 Niveles</span>
                      <span>Puntero Ext4</span>
                      <span>Bloque Físico</span>
                      <span>Capacidad Cubierta</span>
                      <span>Estado</span>
                    </div>

                    <div className="table-entry-row n1-row">
                      <span className="col-entry">Nivel 1 (Entrada [0])</span>
                      <span className="col-ptr">
                        <code>
                          0x
                          {(structure.indirect_triple.l1_entries?.[0] ?? 96)
                            .toString(16)
                            .padStart(8, '0')}
                        </code>
                      </span>
                      <span className="col-block">
                        Subtabla N2 #{structure.indirect_triple.l1_entries?.[0] ?? 96}
                      </span>
                      <span className="col-offset">1,024 Subtablas N2 (4 GB)</span>
                      <span className="col-status status-allocated">Árbol N1</span>
                    </div>

                    <div className="table-entry-row n2-row">
                      <span className="col-entry">Nivel 2 (Entrada [0])</span>
                      <span className="col-ptr">
                        <code>
                          0x
                          {(structure.indirect_triple.l2_entries?.[0] ?? 97)
                            .toString(16)
                            .padStart(8, '0')}
                        </code>
                      </span>
                      <span className="col-block">
                        Subtabla N3 #{structure.indirect_triple.l2_entries?.[0] ?? 97}
                      </span>
                      <span className="col-offset">1,024 Subtablas N3 (4 MB)</span>
                      <span className="col-status status-allocated">Árbol N2</span>
                    </div>

                    {structure.indirect_triple.data_blocks?.map((blk, idx) => {
                      const pos = 25 + idx;
                      const isActive = pos === resolution.logical_position;
                      return (
                        <div
                          key={`triple-data-entry-${idx}`}
                          className={`table-entry-row allocated ${isActive ? 'active-target-entry' : ''}`}
                          onClick={() => handleSelectPos(pos)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              handleSelectPos(pos);
                            }
                          }}
                          role="button"
                          tabIndex={0}
                        >
                          <span className="col-entry">Nivel 3 (Entrada [{idx}])</span>
                          <span className="col-ptr">
                            <code>0x{blk.toString(16).padStart(8, '0')}</code>
                          </span>
                          <span className="col-block">Bloque #{String(blk).padStart(2, '0')}</span>
                          <span className="col-offset">Posición {pos}</span>
                          <span className="col-status status-allocated">Dato N3</span>
                        </div>
                      );
                    })}

                    <div className="table-ellipsis-row">
                      <span className="ellipsis-dots">···</span>
                      <span className="ellipsis-text">
                        1,020 entradas libres en N3 · 1,023 tablas en N2 · 1,023 ramas en N1
                        (Capacidad Total: 1,073,741,824 bloques = 4 TB)
                      </span>
                      <span className="ellipsis-dots">···</span>
                    </div>

                    <div className="table-entry-row boundary">
                      <span className="col-entry">N1[1023] ➜ N2[1023] ➜ N3[1023]</span>
                      <span className="col-ptr">
                        <code>0x00000000</code>
                      </span>
                      <span className="col-block">(NULL)</span>
                      <span className="col-offset">Posición 1,074,791,436 (Límite 4 TB)</span>
                      <span className="col-status status-boundary">Límite Triple</span>
                    </div>
                  </div>
                )}
              </section>

              {/* Sección 3: Explorador interactivo de entradas [0 - 1023] */}
              <section className="inspector-lookup-box">
                <div className="section-header-row">
                  <div className="section-title-wrap">
                    <LuSearch className="section-icon" />
                    <h4>Explorador Interactivo de Entradas [0 a 1023]</h4>
                  </div>
                  <span className="section-hint">
                    Prueba cualquier índice para ver su cálculo formal en el kernel
                  </span>
                </div>

                {activeInspector === 'simple' && (
                  <div className="lookup-content">
                    <div className="lookup-input-bar">
                      <label htmlFor="simple-entry-search">Índice en el bloque (0 - 1023):</label>
                      <input
                        type="number"
                        id="simple-entry-search"
                        min={0}
                        max={1023}
                        value={simpleSearchIdx}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val)) {
                            setSimpleSearchIdx(Math.max(0, Math.min(1023, val)));
                          }
                        }}
                      />
                      <div className="lookup-presets">
                        <button type="button" onClick={() => setSimpleSearchIdx(0)}>
                          Entrada 0
                        </button>
                        <button type="button" onClick={() => setSimpleSearchIdx(1)}>
                          Entrada 1
                        </button>
                        <button type="button" onClick={() => setSimpleSearchIdx(3)}>
                          Entrada 3
                        </button>
                        <button type="button" onClick={() => setSimpleSearchIdx(4)}>
                          Entrada 4 (Libre)
                        </button>
                        <button type="button" onClick={() => setSimpleSearchIdx(512)}>
                          Entrada 512
                        </button>
                        <button type="button" onClick={() => setSimpleSearchIdx(1023)}>
                          Entrada 1023
                        </button>
                      </div>
                    </div>

                    {(() => {
                      const entryAllocated =
                        simpleSearchIdx < structure.indirect_simple.entries.length;
                      const matchedEntry = structure.indirect_simple.entries[simpleSearchIdx];
                      const calcPos = 13 + simpleSearchIdx;
                      const fileOffsetBytes = (12 + simpleSearchIdx) * 4096;
                      const fileOffsetKb = (12 + simpleSearchIdx) * 4;

                      return (
                        <div className="lookup-result-card">
                          <div className="lookup-metric">
                            <span className="metric-lbl">Posición Lógica:</span>
                            <span className="metric-val">{calcPos}</span>
                          </div>
                          <div className="lookup-metric">
                            <span className="metric-lbl">Offset en archivo:</span>
                            <span className="metric-val">
                              {fileOffsetBytes.toLocaleString()} B ({fileOffsetKb} KB)
                            </span>
                          </div>
                          <div className="lookup-metric">
                            <span className="metric-lbl">Puntero Ext4:</span>
                            <span className="metric-val font-mono">
                              {entryAllocated && matchedEntry
                                ? `0x${matchedEntry.block.toString(16).padStart(8, '0')} ➜ Bloque #${String(matchedEntry.block).padStart(2, '0')}`
                                : '0x00000000 (NULL / Libre)'}
                            </span>
                          </div>
                          <div className="lookup-metric">
                            <span className="metric-lbl">Estado en disco:</span>
                            <span
                              className={`metric-badge ${entryAllocated ? 'badge-ok' : 'badge-idle'}`}
                            >
                              {entryAllocated
                                ? 'Asignado físicamente'
                                : 'Libre (No asignado / Sparse)'}
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {activeInspector === 'double' && (
                  <div className="lookup-content">
                    <div className="lookup-input-bar">
                      <div className="input-field-duo">
                        <div>
                          <label htmlFor="double-n1-search">Índice N1 (0 - 1023):</label>
                          <input
                            type="number"
                            id="double-n1-search"
                            min={0}
                            max={1023}
                            value={doubleN1SearchIdx}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              if (!isNaN(val))
                                setDoubleN1SearchIdx(Math.max(0, Math.min(1023, val)));
                            }}
                          />
                        </div>
                        <div>
                          <label htmlFor="double-n2-search">Índice N2 (0 - 1023):</label>
                          <input
                            type="number"
                            id="double-n2-search"
                            min={0}
                            max={1023}
                            value={doubleN2SearchIdx}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              if (!isNaN(val))
                                setDoubleN2SearchIdx(Math.max(0, Math.min(1023, val)));
                            }}
                          />
                        </div>
                      </div>
                      <div className="lookup-presets">
                        <button
                          type="button"
                          onClick={() => {
                            setDoubleN1SearchIdx(0);
                            setDoubleN2SearchIdx(0);
                          }}
                        >
                          [0][0]
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDoubleN1SearchIdx(0);
                            setDoubleN2SearchIdx(1);
                          }}
                        >
                          [0][1]
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDoubleN1SearchIdx(1);
                            setDoubleN2SearchIdx(0);
                          }}
                        >
                          [1][0]
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDoubleN1SearchIdx(1023);
                            setDoubleN2SearchIdx(1023);
                          }}
                        >
                          [1023][1023] (4 GB)
                        </button>
                      </div>
                    </div>

                    {(() => {
                      const totalOffsetBlocks =
                        12 + 1024 + doubleN1SearchIdx * 1024 + doubleN2SearchIdx;
                      const fileOffsetKb = totalOffsetBlocks * 4;
                      const fileOffsetMb = (fileOffsetKb / 1024).toFixed(2);

                      return (
                        <div className="lookup-result-card">
                          <div className="lookup-metric">
                            <span className="metric-lbl">Bloque Lógico Global:</span>
                            <span className="metric-val">#{totalOffsetBlocks + 1}</span>
                          </div>
                          <div className="lookup-metric">
                            <span className="metric-lbl">Offset en archivo:</span>
                            <span className="metric-val">
                              {fileOffsetKb.toLocaleString()} KB (~{fileOffsetMb} MB)
                            </span>
                          </div>
                          <div className="lookup-metric">
                            <span className="metric-lbl">Fórmula Ext4:</span>
                            <span className="metric-val font-mono">
                              12 (directos) + 1,024 (simple) + ({doubleN1SearchIdx} × 1024) +{' '}
                              {doubleN2SearchIdx}
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {activeInspector === 'triple' && (
                  <div className="lookup-content">
                    <div className="lookup-input-bar">
                      <label htmlFor="triple-entry-search">Índice N3 en la hoja (0 - 1023):</label>
                      <input
                        type="number"
                        id="triple-entry-search"
                        min={0}
                        max={1023}
                        value={tripleSearchIdx}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val)) setTripleSearchIdx(Math.max(0, Math.min(1023, val)));
                        }}
                      />
                      <div className="lookup-presets">
                        <button type="button" onClick={() => setTripleSearchIdx(0)}>
                          Hoja [0]
                        </button>
                        <button type="button" onClick={() => setTripleSearchIdx(1)}>
                          Hoja [1]
                        </button>
                        <button type="button" onClick={() => setTripleSearchIdx(512)}>
                          Hoja [512]
                        </button>
                        <button type="button" onClick={() => setTripleSearchIdx(1023)}>
                          Hoja [1023]
                        </button>
                      </div>
                    </div>

                    <div className="lookup-result-card">
                      <div className="lookup-metric">
                        <span className="metric-lbl">Capacidad de N3:</span>
                        <span className="metric-val">1,024 bloques (4 MB de datos por hoja)</span>
                      </div>
                      <div className="lookup-metric">
                        <span className="metric-lbl">Capacidad de N2:</span>
                        <span className="metric-val">1,024 hojas N3 (4 GB por nodo N2)</span>
                      </div>
                      <div className="lookup-metric">
                        <span className="metric-lbl">Capacidad Total N1:</span>
                        <span className="metric-val font-mono">
                          1024³ = 1,073,741,824 bloques = 4 TB de archivo
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>

            {/* Modal Footer */}
            <div className="inode-inspector-modal-footer">
              <button
                type="button"
                className="btn-modal-done"
                onClick={() => setActiveInspector(null)}
              >
                Cerrar Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
