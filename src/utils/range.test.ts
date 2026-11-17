import { describe, expect, it } from 'vitest';
import { getRepresentativeEntries, logSliderToValue, valueToLogSlider } from './range';

describe('range utilities', () => {
  it('maps between linear slider steps and logarithmic values at boundaries', () => {
    const max = 1_000_000;
    expect(logSliderToValue(0, max, 1000)).toBe(0);
    expect(logSliderToValue(1000, max, 1000)).toBe(max);
    expect(valueToLogSlider(0, max, 1000)).toBe(0);
    expect(valueToLogSlider(max, max, 1000)).toBe(1000);

    const midStep = valueToLogSlider(1000, max, 1000);
    expect(midStep).toBeGreaterThan(0);
    expect(midStep).toBeLessThan(1000);
  });

  it('builds representative entries with gaps for large ranges', () => {
    const items = getRepresentativeEntries(1024, 12, 500, (i) => 10000 + i);

    expect(items).toEqual([
      { entryIdx: 0, logical: 12, physical: 10000, isActive: false },
      { entryIdx: 1, logical: 13, physical: 10001, isActive: false },
      { isGap: true, count: 498, from: 2, to: 499 },
      { entryIdx: 500, logical: 512, physical: 10500, isActive: true },
      { isGap: true, count: 522, from: 501, to: 1022 },
      { entryIdx: 1023, logical: 1035, physical: 11023, isActive: false },
    ]);
  });

  it('returns empty array when count is 0', () => {
    expect(getRepresentativeEntries(0, 0, null, (i) => i)).toEqual([]);
  });
});
