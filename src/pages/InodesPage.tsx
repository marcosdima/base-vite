import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  LuArrowDown,
  LuArrowRight,
  LuFileCode,
  LuFileText,
  LuHash,
  LuInfo,
  LuLayers,
  LuPlus,
  LuRoute,
  LuSlidersHorizontal,
  LuTerminal,
  LuTrash2,
  LuX,
} from 'react-icons/lu';
import { BlockDiagram } from '../components/features/simulations/inodes/BlockDiagram';
import {
  BLOCK_SIZE,
  BRANCHES,
  BRANCH_FIRST_LOGICAL,
  BRANCH_SLOT,
  BlockMap,
  type Branch,
  DIRECT_COUNT,
  MAX_DATA_BLOCKS,
  PTRS_PER_BLOCK,
  blocksForBytes,
} from '../features/simulations/inodes/blockMap';
import { fmt, fmtHex, formatBytes } from '../utils/format';
import { logSliderToValue, valueToLogSlider } from '../utils/range';

const BASE_INODE_METADATA = {
  filename: 'documento.dat',
  mode_octal: '0644',
  mode_str: '-rw-r--r--',
  user: 'ubuntu (1000)',
  links_count: 1,
  ext4_flags: '0x00000000 (Sin EXT4_EXTENTS_FL · Mapa Indirecto)',
  atime: '2026-11-10 12:45:02 UTC',
  mtime: '2026-11-10 12:48:30 UTC',
  ctime: '2026-11-10 12:48:30 UTC',
  generation: '0x3fa1c94b',
} as const;

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

const BRANCH_NAME: Record<Branch, string> = {
  simple: 'Ind. Simple [12]',
  double: 'Ind. Doble [13]',
  triple: 'Ind. Triple [14]',
};

const UNITS = { KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3, TB: 1024 ** 4 } as const;
type Unit = keyof typeof UNITS;

const SLIDER_STEPS = 1000;
const sliderToBlocks = (s: number) => logSliderToValue(s, MAX_DATA_BLOCKS, SLIDER_STEPS);
const blocksToSlider = (b: number) => valueToLogSlider(b, MAX_DATA_BLOCKS, SLIDER_STEPS);

const PRESETS: { label: string; hint: string; blocks: number }[] = [
  { label: '48 KB', hint: 'Llena los 12 directos', blocks: DIRECT_COUNT },
  { label: '52 KB', hint: 'Primer bloque indirecto simple', blocks: DIRECT_COUNT + 1 },
  {
    label: '4 MB + 48 KB',
    hint: 'Llena el indirecto simple',
    blocks: BRANCH_FIRST_LOGICAL.double,
  },
  { label: '100 MB', hint: 'Dentro del indirecto doble', blocks: blocksForBytes(100 * UNITS.MB) },
  { label: '≈ 4 GB', hint: 'Llena el indirecto doble', blocks: BRANCH_FIRST_LOGICAL.triple },
  { label: '10 GB', hint: 'Entra al indirecto triple', blocks: blocksForBytes(10 * UNITS.GB) },
  { label: 'Máximo ≈ 4 TB', hint: 'Los tres niveles llenos', blocks: MAX_DATA_BLOCKS },
];

export function InodesPage() {
  const [dataBlocks, setDataBlocks] = useState<number>(0);
  const [selectedLogical, setSelectedLogical] = useState<number | null>(null);
  const [logicalInput, setLogicalInput] = useState<string>('0');
  const [viewMode, setViewMode] = useState<'pointers' | 'metadata'>('pointers');
  const [selectedMeta, setSelectedMeta] = useState<InodeMetaItem | null>(null);
  const [sizeInput, setSizeInput] = useState<string>('');
  const [sizeUnit, setSizeUnit] = useState<Unit>('MB');

  const map = useMemo(() => new BlockMap(1234), []);

  // Close explanation modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedMeta(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const sizeBytes = dataBlocks * BLOCK_SIZE;
  const totalBlocks = useMemo(() => map.totalBlocks(dataBlocks), [map, dataBlocks]);

  const metadata = useMemo(() => {
    return {
      ...BASE_INODE_METADATA,
      size_bytes: sizeBytes,
      size_formatted: formatBytes(sizeBytes),
      blocks_sectors: totalBlocks * (BLOCK_SIZE / 512),
    };
  }, [sizeBytes, totalBlocks]);

  const resolution = useMemo(
    () =>
      selectedLogical !== null && selectedLogical < dataBlocks
        ? map.resolve(selectedLogical)
        : null,
    [map, selectedLogical, dataBlocks],
  );

  const calcDetails = useMemo(() => {
    if (!resolution) return null;
    const L = resolution.logical;
    if (resolution.route === 'direct') {
      return {
        title: 'Direccionamiento Directo',
        desc: `0 ≤ L < 12 ➜ i_block[${L}]`,
        offsetMath: `L = ${L}`,
      };
    }
    if (resolution.route === 'simple') {
      const N = L - 12;
      return {
        title: 'Indirecto Simple (1 nivel)',
        desc: `N = L − 12 = ${fmt(N)}`,
        offsetMath: `Entrada [${fmt(N)}] en tabla raíz de i_block[12]`,
      };
    }
    if (resolution.route === 'double') {
      const N = L - 1036;
      const n1 = Math.floor(N / 1024);
      const n2 = N % 1024;
      return {
        title: 'Indirecto Doble (2 niveles)',
        desc: `N = L − 1.036 = ${fmt(N)}`,
        offsetMath: `Subtabla N1: [${n1}]  │  Entrada N2: [${n2}]`,
      };
    }
    const N = L - 1049612;
    const n1 = Math.floor(N / (1024 * 1024));
    const rem = N % (1024 * 1024);
    const n2 = Math.floor(rem / 1024);
    const n3 = rem % 1024;
    return {
      title: 'Indirecto Triple (3 niveles)',
      desc: `N = L − 1.049.612 = ${fmt(N)}`,
      offsetMath: `N1: [${n1}] ➜ N2: [${n2}] ➜ N3: [${n3}]`,
    };
  }, [resolution]);

  /** Select a logical block */
  const selectLogical = useCallback((logical: number | null, blocks: number) => {
    if (logical === null || blocks === 0) {
      setSelectedLogical(null);
      setLogicalInput('0');
      return;
    }
    const clamped = Math.max(0, Math.min(blocks - 1, logical));
    setSelectedLogical(clamped);
    setLogicalInput(String(clamped));
  }, []);

  /** Resize the file; the selection follows the last written block. */
  const resize = useCallback(
    (blocks: number) => {
      const next = Math.max(0, Math.min(MAX_DATA_BLOCKS, Math.round(blocks)));
      setDataBlocks(next);
      selectLogical(next > 0 ? next - 1 : null, next);
    },
    [selectLogical],
  );

  const applyTypedSize = () => {
    const value = parseFloat(sizeInput.replace(',', '.'));
    if (Number.isFinite(value) && value >= 0) {
      resize(blocksForBytes(value * UNITS[sizeUnit]));
      setSizeInput('');
    }
  };

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
        value: `${metadata.size_bytes.toLocaleString('es-AR')} bytes (${metadata.size_formatted})`,
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
        value: `${fmt(metadata.blocks_sectors)} sectores (${fmt(totalBlocks)} bloques de 4 KB: datos + índices)`,
        summary: 'Espacio físico asignado en el almacenamiento',
        explanation:
          'Cantidad real de espacio físico que el archivo ocupa en el disco, medida en sectores de 512 bytes. Incluye los bloques de índices, por eso crece un poco más que el tamaño del archivo.',
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
          'Banderas especiales que definen cómo almacena Ext4 este inodo. Este inodo no tiene EXT4_EXTENTS_FL, por lo que sus bloques se mapean con punteros directos e indirectos (el esquema clásico de ext2/ext3).',
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
        command: 'debugfs -R "stat documento.dat" /dev/sda1',
      },
    ];
  }, [metadata, totalBlocks]);

  return (
    <div className="inode-simulation-fullscreen">
      {/* Barra superior de información del inodo y sistema */}
      <section className="inode-loading-toolbar" aria-label="Información del sistema y archivo">
        <div className="loading-toolbar-left">
          <span className="distro-pill">
            <LuTerminal /> Ubuntu 24.04 LTS · Kernel 6.8 (Ext4 sin extents · Mapeo Indirecto Real)
          </span>
          <span className="badge info">
            <LuFileCode /> {metadata.filename} · Inodo
          </span>
          <span className="badge mode-tag">
            <strong>{metadata.size_formatted}</strong> ({fmt(dataBlocks)} Bloques de datos)
          </span>
        </div>
      </section>

      {/* Grid principal de la simulación: 3 columnas */}
      <div className="simulation-grid">
        {/* Columna 1: Inodo físico (Punteros de direccionamiento vs Metadatos) */}
        <div className="inode-column">
          <div className="inode-card" id="inode-card">
            <div className="inode-header inode-header-compact">
              <div className="inode-header-title">
                <LuFileCode className="inode-icon" />
                <span className="inode-id">Inodo</span>
              </div>
            </div>

            {/* Switch de modo de vista del inodo */}
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

            {/* Vista 1: Punteros de direccionamiento apilados */}
            {viewMode === 'pointers' && (
              <div className="inode-pointers-list inode-stack-wrapper">
                {Array.from({ length: DIRECT_COUNT }, (_, i) => {
                  const isAllocated = i < dataBlocks;
                  const isActive = resolution?.route === 'direct' && resolution.slot === i;
                  const phys = isAllocated ? map.directPhysical(i) : null;

                  return (
                    <div
                      key={`direct-${i}`}
                      className={`inode-stack-block pointer-item direct ${
                        isAllocated ? 'stack-direct' : 'stack-empty pointer-empty'
                      } ${isActive ? 'active-pointer' : ''}`}
                      id={`ptr-direct-${i}`}
                      title={
                        isAllocated
                          ? `Directo [${i}]: Bloque lógico ${i} ➜ Físico ${fmtHex(phys!)} (#${fmt(phys!)})`
                          : `Directo [${i}]: No asignado aún (NULL)`
                      }
                      onClick={() => {
                        if (isAllocated) {
                          selectLogical(i, dataBlocks);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (isAllocated && (e.key === 'Enter' || e.key === ' ')) {
                          selectLogical(i, dataBlocks);
                        }
                      }}
                      role={isAllocated ? 'button' : undefined}
                      tabIndex={isAllocated ? 0 : undefined}
                    >
                      <span className="stack-title ptr-title">Directo [{i}]</span>
                      <span className="ptr-arrow">
                        <LuArrowRight className="icon-arrow" />
                      </span>
                      <span className="stack-target ptr-target font-mono">
                        {isAllocated ? fmtHex(phys!) : '(Vacío / NULL)'}
                      </span>
                    </div>
                  );
                })}

                {/* Indirect Branches (Simple, Double, Triple) */}
                {BRANCHES.map((b) => {
                  const isAllocated = map.isBranchAllocated(b, dataBlocks);
                  const isActive = resolution?.route === b;
                  const slot = BRANCH_SLOT[b];
                  const node = map.node({ branch: b, path: [] });

                  return (
                    <div
                      key={`branch-ptr-${b}`}
                      className={`inode-stack-block pointer-item indirect-${slot - 11} ${
                        isAllocated ? `stack-indirect-${slot - 11}` : 'stack-empty pointer-empty'
                      } ${isActive ? 'active-pointer' : ''}`}
                      id={`ptr-indirect-${slot - 11}`}
                      title={
                        isAllocated
                          ? `${BRANCH_NAME[b]}: Raíz en ${fmtHex(node.physical)} (#${fmt(node.physical)}). Clic para abrir en el diagrama.`
                          : `${BRANCH_NAME[b]}: No reservado aún en disco.`
                      }
                      onClick={() => {
                        if (isAllocated) {
                          selectLogical(node.firstLogical, dataBlocks);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (isAllocated && (e.key === 'Enter' || e.key === ' ')) {
                          selectLogical(node.firstLogical, dataBlocks);
                        }
                      }}
                      role={isAllocated ? 'button' : undefined}
                      tabIndex={isAllocated ? 0 : undefined}
                    >
                      <span className="stack-title ptr-title">{BRANCH_NAME[b]}</span>
                      <span className="ptr-arrow">
                        <LuArrowRight className="icon-arrow" />
                      </span>
                      <span className="stack-target ptr-target font-mono">
                        {isAllocated ? fmtHex(node.physical) : '(No reservado)'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Vista 2: Metadatos amigables Ext4 */}
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

        {/* Columna 2: Diagrama de Bloques y Punteros con Flechas (Ext4) */}
        <div className="disk-column">
          <BlockDiagram
            map={map}
            dataBlocks={dataBlocks}
            selectedLogical={selectedLogical}
            onSelectLogical={(l) => selectLogical(l, dataBlocks)}
          />
        </div>

        {/* Columna 3: Todo el control de la simulación e inspección lógica */}
        <div className="side-column">
          {/* Card 1: Control de Tamaño del Archivo (Botones + Tamaño tipeado + Slider logarítmico + Presets) */}
          <section className="side-card control-card">
            <div className="card-header-row">
              <div className="card-title-wrap">
                <LuSlidersHorizontal className="card-icon" />
                <h4>Control de Tamaño y Bloques</h4>
              </div>
              <span className="badge-filesize-chip">{metadata.size_formatted}</span>
            </div>

            {/* Botones de incremento rápido */}
            <div className="quick-actions-bar">
              <button
                type="button"
                className="btn-quick-load btn-quick-primary"
                onClick={() => resize(dataBlocks + 1)}
                disabled={dataBlocks >= MAX_DATA_BLOCKS}
                title="Escribir 1 bloque de datos de 4 KB"
              >
                <LuPlus /> +1 Bloque (4 KB)
              </button>
              <button
                type="button"
                className="btn-quick-load"
                onClick={() => resize(dataBlocks + PTRS_PER_BLOCK)}
                disabled={dataBlocks >= MAX_DATA_BLOCKS}
                title="Escribir 1,024 bloques de datos (4 MB)"
              >
                <LuPlus /> +1,024 Bloques (4 MB)
              </button>
              <button
                type="button"
                className="btn-quick-load btn-quick-danger"
                onClick={() => resize(0)}
                disabled={dataBlocks === 0}
                title="Vaciar archivo (truncate -s 0)"
              >
                <LuTrash2 /> Vaciar (0 B)
              </button>
            </div>

            {/* Tamaño tipeado con selector de unidad */}
            <form
              className="typed-size-row"
              onSubmit={(e) => {
                e.preventDefault();
                applyTypedSize();
              }}
            >
              <label htmlFor="typed-size-input" className="typed-size-label">
                Fijar tamaño:
              </label>
              <input
                type="text"
                id="typed-size-input"
                className="typed-size-input"
                placeholder="ej: 100"
                value={sizeInput}
                onChange={(e) => setSizeInput(e.target.value)}
              />
              <select
                className="typed-size-unit"
                value={sizeUnit}
                onChange={(e) => setSizeUnit(e.target.value as Unit)}
                aria-label="Unidad de tamaño"
              >
                <option value="KB">KB</option>
                <option value="MB">MB</option>
                <option value="GB">GB</option>
                <option value="TB">TB</option>
              </select>
              <button type="submit" className="btn-typed-size-apply">
                Aplicar
              </button>
            </form>

            {/* Slider logarítmico (0 B hasta ~4 TB) */}
            <div className="slider-control-box">
              <div className="slider-label-row">
                <span className="slider-label">Escala continua logarítmica:</span>
                <span className="slider-value">{metadata.size_formatted}</span>
              </div>
              <input
                type="range"
                className="log-size-slider"
                min={0}
                max={SLIDER_STEPS}
                value={blocksToSlider(dataBlocks)}
                onChange={(e) => resize(sliderToBlocks(Number(e.target.value)))}
                aria-label="Control deslizante logarítmico de tamaño de archivo"
              />
              <div className="slider-ticks">
                <span>0 B</span>
                <span>48 KB</span>
                <span>4 MB</span>
                <span>4 GB</span>
                <span>≈ 4 TB</span>
              </div>
            </div>

            {/* Presets de límites de direccionamiento Ext4 */}
            <div className="presets-container-box">
              <span className="presets-heading">Puntos clave de la arquitectura:</span>
              <div className="presets-grid">
                {PRESETS.map((p) => {
                  const isActive = dataBlocks === p.blocks;
                  return (
                    <button
                      key={p.label}
                      type="button"
                      className={`btn-preset-chip ${isActive ? 'is-active' : ''}`}
                      onClick={() => resize(p.blocks)}
                      title={p.hint}
                      aria-label={`${p.label} - ${p.hint}`}
                    >
                      <span className="preset-name">{p.label}</span>
                      <span className="preset-desc">{p.hint}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Card 2: Inspector de Posición Lógica y Traducción de Dirección */}
          <section className="side-card inspect-card">
            <div className="card-header-row">
              <div className="card-title-wrap">
                <LuRoute className="card-icon" />
                <h4>Inspección de Bloque Lógico</h4>
              </div>
              {resolution && (
                <span className={`badge-route-tag route-${resolution.route}`}>
                  {resolution.route === 'direct'
                    ? 'Directo'
                    : resolution.route === 'simple'
                      ? 'Ind. Simple'
                      : resolution.route === 'double'
                        ? 'Ind. Doble'
                        : 'Ind. Triple'}
                </span>
              )}
            </div>

            {/* Selector de posición lógica (posicionado limpiamente con encabezado y steppers) */}
            <div className="logical-search-panel">
              <div className="search-panel-top">
                <label htmlFor="logical-block-search" className="search-label">
                  <LuHash className="label-icon" />
                  <span>Bloque Lógico a Consultar (L)</span>
                </label>
                <span className="search-range-pill">
                  0 .. {dataBlocks > 0 ? fmt(dataBlocks - 1) : 0}
                </span>
              </div>

              <div className="search-input-group">
                <button
                  type="button"
                  className="btn-stepper btn-stepper-dec"
                  onClick={() => selectLogical(Math.max(0, (selectedLogical ?? 0) - 1), dataBlocks)}
                  disabled={dataBlocks === 0 || (selectedLogical ?? 0) <= 0}
                  aria-label="Bloque anterior"
                  title="Bloque lógico anterior (L - 1)"
                >
                  ◀
                </button>
                <div className="search-input-field">
                  <span className="input-prefix font-mono">L =</span>
                  <input
                    type="number"
                    id="logical-block-search"
                    min={0}
                    max={Math.max(0, dataBlocks - 1)}
                    value={dataBlocks === 0 ? '0' : logicalInput}
                    disabled={dataBlocks === 0}
                    onChange={(e) => {
                      const raw = e.target.value;
                      setLogicalInput(raw);
                      if (raw.trim() !== '') {
                        const val = parseInt(raw, 10);
                        if (!Number.isNaN(val)) {
                          const clamped = Math.max(0, Math.min(dataBlocks - 1, val));
                          setSelectedLogical(clamped);
                        }
                      }
                    }}
                    onBlur={() => {
                      setLogicalInput(String(selectedLogical ?? 0));
                    }}
                    placeholder="0"
                  />
                </div>
                <button
                  type="button"
                  className="btn-stepper btn-stepper-inc"
                  onClick={() =>
                    selectLogical(Math.min(dataBlocks - 1, (selectedLogical ?? 0) + 1), dataBlocks)
                  }
                  disabled={dataBlocks === 0 || (selectedLogical ?? 0) >= dataBlocks - 1}
                  aria-label="Bloque siguiente"
                  title="Bloque lógico siguiente (L + 1)"
                >
                  ▶
                </button>
              </div>
            </div>

            {/* Desglose de cálculo y traducción */}
            {resolution ? (
              <div className="resolution-details-box">
                {/* Métricas y resumen de lecturas */}
                <div className="resolution-metric-row">
                  <span className="res-lbl">{calcDetails?.title}</span>
                  <span className="res-badge-reads">
                    {resolution.diskReads} lectura{resolution.diskReads === 1 ? '' : 's'} a disco
                  </span>
                </div>

                {/* Tarjeta de cálculo matemático del desplazamiento */}
                <div className="resolution-formula-box">
                  <div className="formula-header">
                    <span className="formula-lbl">Fórmula de direccionamiento:</span>
                    <span className="formula-offset-tag">{calcDetails?.desc}</span>
                  </div>
                  {calcDetails?.offsetMath && (
                    <div className="formula-math-line font-mono">{calcDetails.offsetMath}</div>
                  )}
                  <code className="formula-code">{resolution.formula}</code>
                </div>

                {/* Cards verticales de resolución y pasos a disco */}
                <div className="resolution-steps-container">
                  {/* Paso 1: Ranura en Inodo */}
                  <div className="res-step-card step-card-inode">
                    <div className="step-card-header">
                      <span className="step-badge">Paso 1 · Inodo</span>
                      <span className="step-phys font-mono">Ranura i_block[{resolution.slot}]</span>
                    </div>
                    <div className="step-card-desc">
                      {resolution.route === 'direct'
                        ? 'Direccionamiento directo: apunta directamente al bloque físico'
                        : `Apunta a la tabla de índices raíz (${BRANCH_NAME[resolution.route]})`}
                    </div>
                  </div>

                  {/* Pasos intermedios: Tablas de índices N1, N2, N3 */}
                  {resolution.hops.map((h, i) => (
                    <div key={`res-hop-step-${i}`} className="res-step-wrapper">
                      <div className="res-step-connector">
                        <LuArrowDown className="connector-arrow" />
                      </div>
                      <div className="res-step-card step-card-index">
                        <div className="step-card-header">
                          <span className="step-badge">
                            Paso {i + 2} · Índice {h.level}
                          </span>
                          <span className="step-phys font-mono">{fmtHex(h.physical)}</span>
                        </div>
                        <div className="step-card-body">
                          <span className="step-entry font-mono">Entrada [{fmt(h.entry)}]</span>
                          <span className="step-target-role">
                            {i === resolution.hops.length - 1
                              ? '➜ Puntero a bloque de datos'
                              : '➜ Puntero a subtabla siguiente'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Paso final: Bloque físico de datos */}
                  <div className="res-step-wrapper">
                    <div className="res-step-connector">
                      <LuArrowDown className="connector-arrow" />
                    </div>
                    <div className="res-step-card step-card-data">
                      <div className="step-card-header">
                        <span className="step-badge">Paso Final · Bloque de Datos</span>
                        <span className="step-phys font-mono">
                          {fmtHex(resolution.dataPhysical)}
                        </span>
                      </div>
                      <div className="step-card-body">
                        <span className="step-entry font-mono">
                          Bloque lógico L = {fmt(resolution.logical)}
                        </span>
                        <span className="step-bytes font-mono">
                          {fmt(resolution.logical * BLOCK_SIZE)} –{' '}
                          {fmt((resolution.logical + 1) * BLOCK_SIZE - 1)} B
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="resolution-empty-text">
                {dataBlocks === 0
                  ? 'El archivo está vacío (0 KB). Agrega bloques para ver la resolución de direcciones.'
                  : 'Selecciona cualquier bloque en el diagrama o ingresa un número de bloque lógico arriba.'}
              </p>
            )}
          </section>
        </div>
      </div>

      {/* Modal amigable de explicación de metadatos Ext4 */}
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
