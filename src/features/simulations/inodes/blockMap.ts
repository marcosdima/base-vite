/**
 * Real-scale block map for an inode using classic indirect addressing
 * (ext2/ext3, or ext4 without the `extents` feature).
 *
 * - Block size: 4 KiB. Block pointers: 32-bit (4 B) -> 1,024 pointers per index block.
 * - i_block[0..11]: direct pointers.
 * - i_block[12]: single indirect (1,024 data blocks).
 * - i_block[13]: double indirect (1,024^2 data blocks).
 * - i_block[14]: triple indirect (1,024^3 data blocks).
 *
 * Nothing is enumerated: every physical block number is computed on demand, so a
 * multi-terabyte file costs the same as a 4 KiB one.
 *
 * Allocation order mimics ext2/ext3: blocks are allocated in file order and every
 * index block is allocated right before the first data block it maps. That order
 * (the "allocation ordinal") is then mapped onto a fragmented free-space layout.
 */

import { fmt, fmtHex, formatBytes } from '../../../utils/format';
import { hash32 } from '../../../utils/random';

export { fmt, fmtHex, formatBytes };
export const BLOCK_SIZE = 4096;
export const POINTER_SIZE = 4;
export const PTRS_PER_BLOCK = BLOCK_SIZE / POINTER_SIZE; // 1024
export const DIRECT_COUNT = 12;
/** 32-bit block numbers with 4 KiB blocks -> 16 TiB partition. */
export const FS_TOTAL_BLOCKS = 2 ** 32;

export type Branch = 'simple' | 'double' | 'triple';
export const BRANCHES: Branch[] = ['simple', 'double', 'triple'];

/** Number of index levels below the inode pointer for each branch. */
export const BRANCH_LEVELS: Record<Branch, number> = { simple: 1, double: 2, triple: 3 };
/** Slot inside i_block[] holding the branch root. */
export const BRANCH_SLOT: Record<Branch, number> = { simple: 12, double: 13, triple: 14 };

export const BRANCH_CAPACITY: Record<Branch, number> = {
  simple: PTRS_PER_BLOCK,
  double: PTRS_PER_BLOCK ** 2,
  triple: PTRS_PER_BLOCK ** 3,
};

export const BRANCH_FIRST_LOGICAL: Record<Branch, number> = {
  simple: DIRECT_COUNT,
  double: DIRECT_COUNT + BRANCH_CAPACITY.simple,
  triple: DIRECT_COUNT + BRANCH_CAPACITY.simple + BRANCH_CAPACITY.double,
};

export const MAX_DATA_BLOCKS = BRANCH_FIRST_LOGICAL.triple + BRANCH_CAPACITY.triple;
export const MAX_FILE_BYTES = MAX_DATA_BLOCKS * BLOCK_SIZE;

/** Blocks (index + data) occupied by a full subtree with `levels` index levels. */
export function subtreeSize(levels: number): number {
  let size = 1;
  for (let i = 0; i < levels; i++) size = 1 + PTRS_PER_BLOCK * size;
  return size;
}

export const BRANCH_FIRST_ORDINAL: Record<Branch, number> = {
  simple: DIRECT_COUNT,
  double: DIRECT_COUNT + subtreeSize(1),
  triple: DIRECT_COUNT + subtreeSize(1) + subtreeSize(2),
};

/** Reference to a node inside an indirect branch. `path` = entry index taken at each level. */
export interface NodeRef {
  branch: Branch;
  path: number[];
}

export interface NodeInfo {
  ref: NodeRef;
  id: string;
  /** Index levels at and below this node (0 = data block). */
  levels: number;
  ordinal: number;
  physical: number;
  firstLogical: number;
  /** Logical blocks this node can address when full. */
  span: number;
}

export interface IndexHop {
  /** 'N1' | 'N2' | 'N3' */
  level: string;
  physical: number;
  /** Entry read inside this index block. */
  entry: number;
  id: string;
}

export interface BlockResolution {
  logical: number;
  route: 'direct' | Branch;
  /** i_block[] slot used by the inode. */
  slot: number;
  /** Entry index at each index level (empty for direct). */
  path: number[];
  hops: IndexHop[];
  dataPhysical: number;
  /** Disk reads after the inode is in memory: index blocks + the data block. */
  diskReads: number;
  formula: string;
}

export function nodeId(ref: NodeRef): string {
  return ref.path.length ? `${ref.branch}:${ref.path.join('.')}` : ref.branch;
}

const CHUNK = 2048; // allocation ordinals per chunk
const SLOT = 3072; // physical blocks reserved per chunk slot (leaves room for gaps)
const FS_DATA_START = 1_081_344; // skip superblock, group descriptors, bitmaps, inode tables

export class BlockMap {
  readonly seed: number;

  constructor(seed = 1234) {
    this.seed = seed;
  }

  /**
   * Physical block for the n-th block allocated to this file.
   * Chunks are placed in increasing slots (sometimes skipping one, i.e. a jump to
   * another region) and each chunk is split in up to three runs separated by gaps
   * (blocks already used by other files). The mapping is injective and monotonic.
   */
  physicalOf(ordinal: number): number {
    const chunk = Math.floor(ordinal / CHUNK);
    const off = ordinal % CHUNK;
    const h1 = hash32(chunk * 4 + 1, this.seed);
    const h2 = hash32(chunk * 4 + 2, this.seed);
    const h3 = hash32(chunk * 4 + 3, this.seed);

    const slot = 2 * chunk + (h1 & 1);
    const split1 = 64 + ((h1 >>> 1) % 900);
    const split2 = split1 + 64 + (h2 % 900);
    const gap0 = (h2 >>> 10) % 200;
    const gap1 = 1 + (h3 % 400);
    const gap2 = 1 + ((h3 >>> 9) % 400);

    return (
      FS_DATA_START +
      slot * SLOT +
      gap0 +
      off +
      (off >= split1 ? gap1 : 0) +
      (off >= split2 ? gap2 : 0)
    );
  }

  node(ref: NodeRef): NodeInfo {
    let levels = BRANCH_LEVELS[ref.branch];
    let ordinal = BRANCH_FIRST_ORDINAL[ref.branch];
    let firstLogical = BRANCH_FIRST_LOGICAL[ref.branch];
    for (const entry of ref.path) {
      ordinal += 1 + entry * subtreeSize(levels - 1);
      firstLogical += entry * PTRS_PER_BLOCK ** (levels - 1);
      levels--;
    }
    return {
      ref,
      id: nodeId(ref),
      levels,
      ordinal,
      physical: this.physicalOf(ordinal),
      firstLogical,
      span: PTRS_PER_BLOCK ** levels,
    };
  }

  /** Number of allocated entries inside an index node for a file of `dataBlocks` blocks. */
  allocatedChildren(info: NodeInfo, dataBlocks: number): number {
    if (info.levels === 0) return 0;
    const childSpan = PTRS_PER_BLOCK ** (info.levels - 1);
    const count = Math.ceil((dataBlocks - info.firstLogical) / childSpan);
    return Math.max(0, Math.min(PTRS_PER_BLOCK, count));
  }

  isBranchAllocated(branch: Branch, dataBlocks: number): boolean {
    return dataBlocks > BRANCH_FIRST_LOGICAL[branch];
  }

  directPhysical(index: number): number {
    return this.physicalOf(index);
  }

  /** Route a logical block number (0-based) through the inode. */
  resolve(logical: number): BlockResolution {
    if (!Number.isInteger(logical) || logical < 0 || logical >= MAX_DATA_BLOCKS) {
      throw new RangeError(`Bloque lógico fuera de rango: ${logical}`);
    }

    if (logical < DIRECT_COUNT) {
      return {
        logical,
        route: 'direct',
        slot: logical,
        path: [],
        hops: [],
        dataPhysical: this.physicalOf(logical),
        diskReads: 1,
        formula: `L = ${logical} < 12 → i_block[${logical}]`,
      };
    }

    const branch = BRANCHES.find(
      (b) => logical - BRANCH_FIRST_LOGICAL[b] < BRANCH_CAPACITY[b],
    ) as Branch;
    const levels = BRANCH_LEVELS[branch];
    const rel = logical - BRANCH_FIRST_LOGICAL[branch];

    const path: number[] = [];
    for (let level = levels - 1; level >= 0; level--) {
      path.push(Math.floor(rel / PTRS_PER_BLOCK ** level) % PTRS_PER_BLOCK);
    }

    const hops: IndexHop[] = path.map((entry, k) => {
      const info = this.node({ branch, path: path.slice(0, k) });
      return { level: `N${k + 1}`, physical: info.physical, entry, id: info.id };
    });
    const data = this.node({ branch, path });

    const terms = path
      .map((entry, k) => {
        const weight = PTRS_PER_BLOCK ** (levels - 1 - k);
        return weight === 1 ? `${entry}` : `${entry}×${weight.toLocaleString('es-AR')}`;
      })
      .join(' + ');

    return {
      logical,
      route: branch,
      slot: BRANCH_SLOT[branch],
      path,
      hops,
      dataPhysical: data.physical,
      diskReads: hops.length + 1,
      formula: `L = ${BRANCH_FIRST_LOGICAL[branch].toLocaleString('es-AR')} + ${terms}`,
    };
  }

  /** Allocation ordinal of a logical data block. */
  dataOrdinal(logical: number): number {
    if (logical < DIRECT_COUNT) return logical;
    const res = this.resolve(logical);
    return this.node({ branch: res.route as Branch, path: res.path }).ordinal;
  }

  /** Physical block address allocated to a logical data block. */
  dataPhysical(logical: number): number {
    return this.resolve(logical).dataPhysical;
  }

  /** Total blocks (data + index) owned by a file of `dataBlocks` data blocks. */
  totalBlocks(dataBlocks: number): number {
    return dataBlocks <= 0 ? 0 : this.dataOrdinal(dataBlocks - 1) + 1;
  }

  indexBlocks(dataBlocks: number): number {
    return this.totalBlocks(dataBlocks) - Math.max(0, dataBlocks);
  }
}

export function blocksForBytes(bytes: number): number {
  return Math.min(MAX_DATA_BLOCKS, Math.max(0, Math.ceil(bytes / BLOCK_SIZE)));
}
