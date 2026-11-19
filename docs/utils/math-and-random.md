# Range & Deterministic Random Utilities (`@/utils/range`, `@/utils/random`)

- **Sources**: `src/utils/range.ts`, `src/utils/random.ts`
- **Tests**: `src/utils/range.test.ts`, `src/utils/random.test.ts`

## 1. Range & Logarithmic Slider Helpers (`@/utils/range`)

- `logSliderToValue(sliderStep: number, maxVal: number, steps = 1000): number` — Maps a linear slider step `[0, steps]` onto an exponential/logarithmic scale `[0, maxVal]` for scrubbing across several orders of magnitude.
- `valueToLogSlider(value: number, maxVal: number, steps = 1000): number` — Inverse mapping from a value `[0, maxVal]` back to a linear slider step `[0, steps]`.
- `getRepresentativeEntries(count: number, firstLogical: number, activeEntry: number | null, getPhysical: (entry: number) => number): RepresentativeItem[]` — Compresses a large contiguous range of `count` entries into a compact preview array containing the first 2 entries, the active entry (if in range), the final entry, and `{ isGap: true, count, from, to }` gap descriptors in between.

## 2. Deterministic Hashing & PRNG (`@/utils/random`)

- `hash32(x: number, seed = 0): number` — O(1) deterministic 32-bit avalanche integer hash (`>>> 0`) for repeatable procedural lookups.
- `SeededRandom` — Mulberry32 deterministic pseudo-random number generator initialized with `new SeededRandom(seed = 1234)`:
  - `next(): number` — Deterministic float in `[0, 1)`.
  - `nextInt(min: number, max: number): number` — Deterministic integer in `[min, max]` inclusive.
  - `sample<T>(population: readonly T[], k: number): T[]` — Partial Fisher-Yates shuffle returning `k` distinct elements without replacement (throws if `k > population.length`).
