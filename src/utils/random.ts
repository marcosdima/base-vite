/**
 * Deterministic 32-bit integer hash (Avalanche / Murmur-style).
 * Useful for O(1) procedural generation and repeatable pseudo-random indexing.
 */
export function hash32(x: number, seed: number = 0): number {
  let h = (x ^ seed) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x7feb352d);
  h = Math.imul(h ^ (h >>> 15), 0x846ca68b);
  h ^= h >>> 16;
  return h >>> 0;
}

/**
 * Deterministic pseudo-random number generator (Mulberry32).
 * Guarantees that the same seed produces an identical sequence of values across runs.
 */
export class SeededRandom {
  private s: number;

  constructor(seed: number = 1234) {
    this.s = seed >>> 0;
    if (this.s === 0) this.s = 1;
  }

  /** Returns a float in [0, 1) */
  next(): number {
    let t = (this.s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Returns an integer in [min, max] inclusive */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Samples k distinct elements without replacement from a population array.
   */
  sample<T>(population: readonly T[], k: number): T[] {
    const pool = [...population];
    const n = pool.length;
    if (k > n) {
      throw new Error(`Sample size (${k}) cannot exceed population (${n})`);
    }

    // Fisher-Yates partial shuffle
    for (let i = 0; i < k; i++) {
      const j = i + Math.floor(this.next() * (n - i));
      const temp = pool[i]!;
      pool[i] = pool[j]!;
      pool[j] = temp;
    }

    return pool.slice(0, k);
  }
}
