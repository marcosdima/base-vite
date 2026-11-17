/**
 * Maps a linear slider step [0, steps] onto a logarithmic value [0, maxVal].
 * Ideal for scrubbing across multiple orders of magnitude (e.g. 0 to billions).
 */
export function logSliderToValue(sliderStep: number, maxVal: number, steps = 1000): number {
  if (sliderStep <= 0 || maxVal <= 0) return 0;
  const logMax = Math.log(maxVal + 1);
  return Math.min(maxVal, Math.round(Math.exp((sliderStep / steps) * logMax) - 1));
}

/**
 * Inverse mapping: converts a value [0, maxVal] back to a linear slider step [0, steps].
 */
export function valueToLogSlider(value: number, maxVal: number, steps = 1000): number {
  if (value <= 0 || maxVal <= 0) return 0;
  const clamped = Math.min(maxVal, value);
  const logMax = Math.log(maxVal + 1);
  return Math.round((Math.log(clamped + 1) / logMax) * steps);
}

export interface RepresentativeEntry {
  entryIdx: number;
  logical: number;
  physical: number;
  isActive: boolean;
}

export interface RepresentativeGap {
  isGap: true;
  count: number;
  from: number;
  to: number;
}

export type RepresentativeItem = RepresentativeEntry | RepresentativeGap;

/**
 * Summarizes a potentially huge contiguous range of `count` items into a compact list:
 * first 2 entries, the active entry (if inside range), the last entry, and ellipsis gaps in between.
 */
export function getRepresentativeEntries(
  count: number,
  firstLogical: number,
  activeEntry: number | null,
  getPhysical: (entry: number) => number,
): RepresentativeItem[] {
  if (count <= 0) return [];

  const indices = new Set<number>();
  indices.add(0);
  if (count > 1) indices.add(1);
  if (activeEntry !== null && activeEntry >= 0 && activeEntry < count) {
    indices.add(activeEntry);
  }
  if (count > 2) indices.add(count - 1);

  const sorted = [...indices].sort((a, b) => a - b);
  const result: RepresentativeItem[] = [];

  let prev = -1;
  for (const idx of sorted) {
    if (idx - prev > 1) {
      result.push({
        isGap: true,
        count: idx - prev - 1,
        from: prev + 1,
        to: idx - 1,
      });
    }
    result.push({
      entryIdx: idx,
      logical: firstLogical + idx,
      physical: getPhysical(idx),
      isActive: activeEntry === idx,
    });
    prev = idx;
  }

  return result;
}
