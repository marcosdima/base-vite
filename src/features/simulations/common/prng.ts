/**
 * Deterministic pseudo-random number generator (Mulberry32).
 * Guarantees that the same seed produces identical sequence of values across runs.
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
  sample<T>(population: T[], k: number): T[] {
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
