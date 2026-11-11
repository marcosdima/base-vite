import { describe, expect, it } from 'vitest';
import {
  BLOCK_SIZE,
  BRANCH_FIRST_LOGICAL,
  BlockMap,
  MAX_DATA_BLOCKS,
  PTRS_PER_BLOCK,
  blocksForBytes,
  subtreeSize,
} from './blockMap';

describe('BlockMap (real-scale indirect addressing)', () => {
  const map = new BlockMap(1234);

  it('uses real ext2/ext3 geometry: 4 KiB blocks and 1,024 pointers per index block', () => {
    expect(PTRS_PER_BLOCK).toBe(1024);
    expect(BRANCH_FIRST_LOGICAL.simple).toBe(12);
    expect(BRANCH_FIRST_LOGICAL.double).toBe(12 + 1024);
    expect(BRANCH_FIRST_LOGICAL.triple).toBe(12 + 1024 + 1024 ** 2);
    expect(MAX_DATA_BLOCKS).toBe(12 + 1024 + 1024 ** 2 + 1024 ** 3);
    expect(subtreeSize(1)).toBe(1025);
    expect(subtreeSize(2)).toBe(1 + 1024 * 1025);
  });

  it('resolves logical blocks to the correct branch and entry path', () => {
    expect(map.resolve(11)).toMatchObject({ route: 'direct', slot: 11, path: [], diskReads: 1 });
    expect(map.resolve(12)).toMatchObject({ route: 'simple', slot: 12, path: [0], diskReads: 2 });
    expect(map.resolve(1035)).toMatchObject({ route: 'simple', path: [1023] });
    expect(map.resolve(1036)).toMatchObject({ route: 'double', slot: 13, path: [0, 0] });
    expect(map.resolve(1036 + 1024 * 3 + 7)).toMatchObject({ route: 'double', path: [3, 7] });
    expect(map.resolve(BRANCH_FIRST_LOGICAL.triple)).toMatchObject({
      route: 'triple',
      slot: 14,
      path: [0, 0, 0],
      diskReads: 4,
    });
    expect(map.resolve(MAX_DATA_BLOCKS - 1).path).toEqual([1023, 1023, 1023]);
    expect(() => map.resolve(MAX_DATA_BLOCKS)).toThrow(RangeError);
  });

  it('counts index blocks as real allocations', () => {
    expect(map.totalBlocks(0)).toBe(0);
    expect(map.totalBlocks(12)).toBe(12);
    expect(map.indexBlocks(13)).toBe(1); // single indirect block
    expect(map.indexBlocks(1036)).toBe(1);
    expect(map.indexBlocks(1037)).toBe(3); // + double N1 + first N2
    expect(map.indexBlocks(1036 + 1025)).toBe(4); // second N2 table
  });

  it('assigns unique, increasing, 32-bit physical blocks with fragmentation gaps', () => {
    const sample = [0, 1, 11, 12, 13, 500, 1035, 1036, 1037, 5000, 20000, 1_000_000];
    const physical = sample.map((o) => map.physicalOf(o));
    for (let i = 1; i < physical.length; i++) {
      expect(physical[i]).toBeGreaterThan(physical[i - 1]!);
    }
    const last = map.physicalOf(map.totalBlocks(MAX_DATA_BLOCKS) - 1);
    expect(last).toBeLessThan(2 ** 32);

    let gaps = 0;
    for (let o = 0; o < 4096; o++) {
      if (map.physicalOf(o + 1) - map.physicalOf(o) > 1) gaps++;
    }
    expect(gaps).toBeGreaterThan(0);
  });

  it('reports how many entries of an index node are in use', () => {
    const n1 = map.node({ branch: 'double', path: [] });
    expect(map.allocatedChildren(n1, 1036)).toBe(0);
    expect(map.allocatedChildren(n1, 1037)).toBe(1);
    expect(map.allocatedChildren(n1, 1036 + 1024 * 5 + 1)).toBe(6);
    const simple = map.node({ branch: 'simple', path: [] });
    expect(map.allocatedChildren(simple, 20)).toBe(8);
    expect(map.allocatedChildren(simple, 5000)).toBe(1024);
  });

  it('converts bytes to blocks', () => {
    expect(blocksForBytes(0)).toBe(0);
    expect(blocksForBytes(1)).toBe(1);
    expect(blocksForBytes(BLOCK_SIZE * 12)).toBe(12);
    expect(blocksForBytes(BLOCK_SIZE * 12 + 1)).toBe(13);
  });
});
