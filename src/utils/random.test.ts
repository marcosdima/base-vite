import { describe, expect, it } from 'vitest';
import { SeededRandom, hash32 } from './random';

describe('random utilities', () => {
  it('produces deterministic 32-bit hashes', () => {
    expect(hash32(42, 1234)).toBe(hash32(42, 1234));
    expect(hash32(42, 1234)).not.toBe(hash32(43, 1234));
    expect(hash32(42, 1234)).toBeGreaterThanOrEqual(0);
    expect(hash32(42, 1234)).toBeLessThan(2 ** 32);
  });

  it('produces repeatable sequences from SeededRandom', () => {
    const rngA = new SeededRandom(999);
    const rngB = new SeededRandom(999);

    const seqA = Array.from({ length: 10 }, () => rngA.nextInt(1, 100));
    const seqB = Array.from({ length: 10 }, () => rngB.nextInt(1, 100));

    expect(seqA).toEqual(seqB);
  });

  it('samples distinct elements without mutating input array', () => {
    const rng = new SeededRandom(1234);
    const source = [10, 20, 30, 40, 50];
    const picked = rng.sample(source, 3);

    expect(picked).toHaveLength(3);
    expect(new Set(picked).size).toBe(3);
    expect(source).toEqual([10, 20, 30, 40, 50]);
    expect(() => rng.sample(source, 6)).toThrow(/cannot exceed population/);
  });
});
