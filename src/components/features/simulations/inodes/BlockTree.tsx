import type { ReactNode } from 'react';
import {
  LuChevronDown,
  LuChevronRight,
  LuDatabase,
  LuFileCode,
  LuFolderTree,
} from 'react-icons/lu';
import {
  BLOCK_SIZE,
  BRANCHES,
  BRANCH_SLOT,
  type BlockMap,
  type Branch,
  DIRECT_COUNT,
  type NodeInfo,
  type NodeRef,
  PTRS_PER_BLOCK,
  fmt,
  formatBytes,
  nodeId,
} from '../../../../features/simulations/inodes/blockMap';

const BRANCH_LABEL: Record<Branch, string> = {
  simple: 'Indirecto simple',
  double: 'Indirecto doble',
  triple: 'Indirecto triple',
};

/** Children shown at each end of a large index block before summarizing the middle. */
const EDGE = 3;

interface BlockTreeProps {
  map: BlockMap;
  inodeId: number;
  dataBlocks: number;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  /** Node ids on the path of the selected logical block (index nodes + data block). */
  activeIds: Set<string>;
  selectedLogical: number | null;
  onSelectLogical: (logical: number) => void;
}

/** Entries of an index block to render: edges + entries on the active path, with gaps summarized. */
function visibleEntries(
  count: number,
  forced: number[],
): (number | { from: number; to: number })[] {
  const keep = new Set<number>();
  for (let i = 0; i < Math.min(EDGE, count); i++) keep.add(i);
  for (let i = Math.max(0, count - EDGE); i < count; i++) keep.add(i);
  for (const f of forced) if (f >= 0 && f < count) keep.add(f);

  const sorted = [...keep].sort((a, b) => a - b);
  const out: (number | { from: number; to: number })[] = [];
  let prev = -1;
  for (const i of sorted) {
    if (i - prev > 1) out.push({ from: prev + 1, to: i - 1 });
    out.push(i);
    prev = i;
  }
  return out;
}

function levelName(info: NodeInfo, branch: Branch): string {
  const depth = info.ref.path.length + 1;
  return branch === 'simple' ? 'Índice' : `Índice N${depth}`;
}

export function BlockTree({
  map,
  inodeId,
  dataBlocks,
  expanded,
  onToggle,
  activeIds,
  selectedLogical,
  onSelectLogical,
}: BlockTreeProps) {
  const directCount = Math.min(DIRECT_COUNT, dataBlocks);

  const renderLeaf = (logical: number, physical: number, label: string, prevPhysical?: number) => {
    const isSelected = logical === selectedLogical;
    const jump = prevPhysical !== undefined ? physical - prevPhysical - 1 : 0;
    return (
      <li key={`leaf-${logical}`} className="tree-item">
        <button
          type="button"
          className={`tree-row tree-row--data ${isSelected ? 'is-selected' : ''}`}
          onClick={() => onSelectLogical(logical)}
          data-logical={logical}
          title={`Bloque lógico ${fmt(logical)} · bytes ${fmt(logical * BLOCK_SIZE)}–${fmt((logical + 1) * BLOCK_SIZE - 1)}`}
        >
          <span className="tree-chevron-spacer" />
          <span className="tree-entry">{label}</span>
          <span className="tree-kind kind-data">Dato</span>
          <span className="tree-phys">#{fmt(physical)}</span>
          <span className="tree-meta">L {fmt(logical)}</span>
          {jump > 0 && (
            <span className="tree-frag" title="Bloques ocupados por otros archivos entre medio">
              salto +{fmt(jump)}
            </span>
          )}
        </button>
      </li>
    );
  };

  const renderGap = (key: string, from: number, to: number, childOf: NodeInfo) => {
    const childLevels = childOf.levels - 1;
    const first = map.node({ branch: childOf.ref.branch, path: [...childOf.ref.path, from] });
    const last = map.node({ branch: childOf.ref.branch, path: [...childOf.ref.path, to] });
    const n = to - from + 1;
    const what = childLevels === 0 ? 'bloques de datos' : `tablas N${childOf.ref.path.length + 2}`;
    return (
      <li key={key} className="tree-item">
        <div className="tree-row tree-row--gap">
          <span className="tree-chevron-spacer" />
          <span className="tree-gap-text">
            ··· [{fmt(from)}]–[{fmt(to)}]: {fmt(n)} {what} más (#{fmt(first.physical)} … #
            {fmt(last.physical)}) ···
          </span>
        </div>
      </li>
    );
  };

  const renderIndex = (ref: NodeRef, entryLabel: string): ReactNode => {
    const info = map.node(ref);
    const id = nodeId(ref);
    const used = map.allocatedChildren(info, dataBlocks);
    const isOpen = expanded.has(id);
    const isActive = activeIds.has(id);
    const lastLogical = Math.min(info.firstLogical + info.span, dataBlocks) - 1;

    const forced: number[] = [];
    if (selectedLogical !== null && selectedLogical >= info.firstLogical) {
      const childSpan = PTRS_PER_BLOCK ** (info.levels - 1);
      forced.push(Math.floor((selectedLogical - info.firstLogical) / childSpan));
    }

    return (
      <li key={id} className="tree-item">
        <button
          type="button"
          className={`tree-row tree-row--index branch-${ref.branch} ${isActive ? 'is-active' : ''}`}
          onClick={() => onToggle(id)}
          aria-expanded={isOpen}
          data-node={id}
        >
          {isOpen ? (
            <LuChevronDown className="tree-chevron" />
          ) : (
            <LuChevronRight className="tree-chevron" />
          )}
          <span className="tree-entry">{entryLabel}</span>
          <span className={`tree-kind kind-${ref.branch}`}>{levelName(info, ref.branch)}</span>
          <span className="tree-phys">#{fmt(info.physical)}</span>
          <span className="tree-meta">
            {fmt(used)}/{fmt(PTRS_PER_BLOCK)} entradas · L {fmt(info.firstLogical)}–
            {fmt(lastLogical)}
          </span>
        </button>

        {isOpen && (
          <ul className="tree-children">
            {visibleEntries(used, forced).map((e) => {
              if (typeof e !== 'number')
                return renderGap(`${id}-gap-${e.from}`, e.from, e.to, info);
              const childRef = { branch: ref.branch, path: [...ref.path, e] };
              if (info.levels === 1) {
                const child = map.node(childRef);
                const prev =
                  e > 0
                    ? map.node({ branch: ref.branch, path: [...ref.path, e - 1] }).physical
                    : undefined;
                return renderLeaf(child.firstLogical, child.physical, `[${fmt(e)}]`, prev);
              }
              return renderIndex(childRef, `[${fmt(e)}]`);
            })}
            {used < PTRS_PER_BLOCK && (
              <li className="tree-item">
                <div className="tree-row tree-row--null">
                  <span className="tree-chevron-spacer" />
                  <span className="tree-gap-text">
                    [{fmt(used)}]–[{fmt(PTRS_PER_BLOCK - 1)}]: {fmt(PTRS_PER_BLOCK - used)} entradas
                    en 0 (NULL, sin asignar)
                  </span>
                </div>
              </li>
            )}
          </ul>
        )}
      </li>
    );
  };

  const directOpen = expanded.has('direct');

  return (
    <div className="block-tree" aria-label="Árbol de bloques del inodo">
      <div className="tree-root">
        <LuFileCode className="tree-root-icon" />
        <span>Inodo #{inodeId}</span>
        <span className="tree-meta">i_block[15] · {formatBytes(dataBlocks * BLOCK_SIZE)}</span>
      </div>

      {dataBlocks === 0 ? (
        <p className="tree-empty">
          Archivo vacío: los 15 punteros de i_block[] están en 0 y no hay bloques asignados.
        </p>
      ) : (
        <ul className="tree-children tree-children--root">
          <li className="tree-item">
            <button
              type="button"
              className="tree-row tree-row--index branch-direct"
              onClick={() => onToggle('direct')}
              aria-expanded={directOpen}
              data-node="direct"
            >
              {directOpen ? (
                <LuChevronDown className="tree-chevron" />
              ) : (
                <LuChevronRight className="tree-chevron" />
              )}
              <span className="tree-entry">i_block[0–11]</span>
              <span className="tree-kind kind-direct">Directos</span>
              <span className="tree-meta">
                {directCount}/{DIRECT_COUNT} punteros · L 0–{directCount - 1}
              </span>
            </button>
            {directOpen && (
              <ul className="tree-children">
                {Array.from({ length: directCount }, (_, i) =>
                  renderLeaf(
                    i,
                    map.directPhysical(i),
                    `i_block[${i}]`,
                    i > 0 ? map.directPhysical(i - 1) : undefined,
                  ),
                )}
              </ul>
            )}
          </li>

          {BRANCHES.filter((b) => map.isBranchAllocated(b, dataBlocks)).map((b) => (
            <li key={`branch-${b}`} className="tree-item tree-item--branch">
              <div className="tree-branch-label">
                {b === 'simple' ? <LuFolderTree /> : <LuDatabase />} {BRANCH_LABEL[b]}
              </div>
              <ul className="tree-children tree-children--flat">
                {renderIndex({ branch: b, path: [] }, `i_block[${BRANCH_SLOT[b]}]`)}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
