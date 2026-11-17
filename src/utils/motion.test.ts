import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  animateAlongCurve,
  animateFlip,
  buildCurveKeyframes,
  prefersReducedMotion,
} from './motion';

describe('motion utilities', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('detects prefers-reduced-motion media query safely', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }));
    expect(prefersReducedMotion()).toBe(true);

    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }));
    expect(prefersReducedMotion()).toBe(false);
  });

  it('builds curve keyframes starting at previous rect and ending at resting position', () => {
    const container = { left: 0, top: 0, width: 600, height: 400 };
    const prev = { left: 20, top: 20, width: 40, height: 20 }; // center (40, 30)
    const next = { left: 220, top: 120, width: 40, height: 20 }; // center (240, 130)
    const ctrl = [
      { x: 60, y: 30 },
      { x: 140, y: 30 },
      { x: 140, y: 130 },
      { x: 220, y: 130 },
    ];

    const frames = buildCurveKeyframes(prev, next, ctrl, container, 4);

    // 1 start + 5 curve samples + 1 end = 7 keyframes
    expect(frames).toHaveLength(7);
    expect(frames[0]).toEqual({ transform: 'translate(-200.0px, -100.0px) scale(1)', offset: 0 });
    expect(frames[frames.length - 1]).toEqual({
      transform: 'translate(0px, 0px) scale(1)',
      offset: 1,
    });
  });

  it('skips animations when reduced motion is enabled', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }));
    const el = document.createElement('div');
    el.animate = vi.fn();

    expect(animateFlip(el, 50, 50)).toBeNull();
    expect(
      animateAlongCurve(
        el,
        { left: 0, top: 0, width: 20, height: 20 },
        { left: 100, top: 0, width: 20, height: 20 },
        [
          { x: 20, y: 10 },
          { x: 50, y: 10 },
          { x: 50, y: 10 },
          { x: 100, y: 10 },
        ],
        { left: 0, top: 0, width: 200, height: 200 },
      ),
    ).toBeNull();
    expect(el.animate).not.toHaveBeenCalled();
  });
});
