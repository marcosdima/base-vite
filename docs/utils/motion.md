# Motion & FLIP Utilities (`@/utils/motion`)

- **Source**: `src/utils/motion.ts`
- **Test**: `src/utils/motion.test.ts`

## Purpose

Web Animations API helpers for straight-line FLIP layout transitions and curved Bezier path traversal between DOM rectangles, automatically respecting `prefers-reduced-motion`.

## Constants & Types

- `MOTION_DURATIONS`: `{ fast: 160, normal: 300, flip: 420, flow: 640 }` (ms).
- `MOTION_EASINGS`: `{ easeOutExpo, easeInOut, springOvershoot }` CSS cubic-bezier strings.
- `FlipAnimateOptions`: `{ duration?: number; easing?: string; zIndex?: string }`.

## Exported Functions

- `prefersReducedMotion(): boolean` — Checks `window.matchMedia('(prefers-reduced-motion: reduce)')`.
- `resetElementMotion(element: HTMLElement): void` — Cancels running Web Animations on `element` and clears inline `transition` and `transform` before taking layout measurements.
- `animateFlip(element: HTMLElement, dx: number, dy: number, options?: FlipAnimateOptions): Animation | null` — Plays a FLIP translation from `(dx, dy)` to `(0, 0)`. Skips animation if `prefersReducedMotion()` is true or distance `< 2px`.
- `buildCurveKeyframes(prevRect: RectLike, nextRect: RectLike, curveCtrl: readonly Point2D[], containerRect: RectLike, samples?: number): Keyframe[]` — Samples points along `curveCtrl` (from [`computeBezierArrow`](./bezier.md)) to construct Web Animation keyframes between `prevRect` and `nextRect`.
- `animateAlongCurve(element: HTMLElement, prevRect: RectLike, nextRect: RectLike, curveCtrl: readonly Point2D[], containerRect: RectLike, options?: FlipAnimateOptions): Animation | null` — Animates `element` along a Bezier connector curve from `prevRect` to `nextRect`.
