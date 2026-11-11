import { describe, expect, it } from 'vitest';
import { InodeSimulation, SimulationError } from './simulation';

describe('InodeSimulation', () => {
  it('correctly resolves direct pointer (pos 10 -> N 9)', () => {
    const sim = new InodeSimulation({ seed: 1234 });
    const result = sim.resolvePosition(10);
    expect(result.logical_position).toBe(10);
    expect(result.logical_block_index).toBe(9);
    expect(result.route_type).toBe('DIRECT');
    expect(result.physical_block).toBe(sim.directBlocks[9]);
    expect(result.pointer_label).toBe('Directo [9]');
    expect(result.steps.length).toBe(3);
  });

  it('correctly resolves direct pointer for position 1', () => {
    const sim = new InodeSimulation({ seed: 1234 });
    const result = sim.resolvePosition(1);
    expect(result.route_type).toBe('DIRECT');
    expect(result.physical_block).toBe(sim.directBlocks[0]);
  });

  it('correctly resolves indirect simple pointer (pos 14 -> entry 1)', () => {
    const sim = new InodeSimulation({ seed: 1234 });
    const result = sim.resolvePosition(14);
    expect(result.route_type).toBe('INDIRECT_SIMPLE');
    expect(result.physical_block).toBe(sim.indirectSimpleEntries[1]);
    expect(result.index_block).toBe(sim.indirectSimpleBlockId);
    expect(result.table_index).toBe(1);
    expect(result.steps.length).toBe(4);
  });

  it('correctly resolves indirect double pointer (pos 18)', () => {
    const sim = new InodeSimulation({ seed: 1234 });
    const result = sim.resolvePosition(18);
    expect(result.route_type).toBe('INDIRECT_DOUBLE');
    expect(result.physical_block).toBeDefined();
    expect(typeof result.physical_block).toBe('number');
    expect(result.steps.length).toBe(4);
  });

  it('correctly resolves indirect triple pointer (pos 26)', () => {
    const sim = new InodeSimulation({ seed: 1234 });
    const result = sim.resolvePosition(26);
    expect(result.route_type).toBe('INDIRECT_TRIPLE');
    expect(result.physical_block).toBeDefined();
    expect(typeof result.physical_block).toBe('number');
    expect(result.steps.length).toBe(4);
  });

  it('throws SimulationError for out-of-range positions', () => {
    const sim = new InodeSimulation({ seed: 1234 });
    expect(() => sim.resolvePosition(0)).toThrow(SimulationError);
    expect(() => sim.resolvePosition(sim.totalLogicalPositions + 1)).toThrow(SimulationError);
  });

  it('throws SimulationError for invalid position types', () => {
    const sim = new InodeSimulation({ seed: 1234 });
    // @ts-expect-error testing invalid type
    expect(() => sim.resolvePosition('10')).toThrow(SimulationError);
  });

  it('guarantees unique disk addresses across the entire allocation (35 occupied blocks)', () => {
    const sim = new InodeSimulation({ seed: 1234 });
    const allBlocks = [
      ...sim.directBlocks,
      sim.indirectSimpleBlockId,
      ...sim.indirectSimpleEntries,
      sim.indirectDoubleBlockId,
      ...sim.indirectDoubleL1Entries,
      ...Object.values(sim.indirectDoubleL2Map).flat(),
      sim.indirectTripleBlockId,
      ...sim.indirectTripleL1Entries,
      ...sim.indirectTripleL2Entries,
      ...sim.indirectTripleDataBlocks,
    ];

    expect(allBlocks.length).toBe(35);
    expect(new Set(allBlocks).size).toBe(35);
  });

  it('is deterministic when initialized with the same seed', () => {
    const simA = new InodeSimulation({ seed: 42 });
    const simB = new InodeSimulation({ seed: 42 });
    expect(simA.directBlocks).toEqual(simB.directBlocks);
    expect(simA.getState()).toEqual(simB.getState());
  });

  it('produces valid state shape with 100 disk blocks', () => {
    const sim = new InodeSimulation({ seed: 1234 });
    const state = sim.getState();
    expect(state.meta.slug).toBe('inodes');
    expect(state.meta.seed).toBe(1234);
    expect(state.total_blocks).toBe(100);
    expect(state.disk_blocks.length).toBe(100);

    const occupied = state.disk_blocks.filter((b) => b.role !== 'free');
    const free = state.disk_blocks.filter((b) => b.role === 'free');
    expect(occupied.length).toBe(35);
    expect(free.length).toBe(65);

    occupied.forEach((blk) => {
      expect(blk.position).toBeDefined();
      expect(blk.position).toBeGreaterThanOrEqual(1);
      expect(blk.position).toBeLessThanOrEqual(sim.totalLogicalPositions);
    });
  });
});
