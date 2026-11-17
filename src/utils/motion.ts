import { type Point2D, type RectLike, bezierPoint } from './bezier';

export const MOTION_DURATIONS = {
  fast: 160,
  normal: 300,
  flip: 420,
  flow: 640,
} as const;

export const MOTION_EASINGS = {
  easeOutExpo: 'cubic-bezier(0.22, 1, 0.36, 1)',
  easeInOut: 'cubic-bezier(0.45, 0, 0.55, 1)',
  springOvershoot: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const;

export interface FlipAnimateOptions {
  duration?: number;
  easing?: string;
  zIndex?: string;
}

/**
 * Returns true if the user has requested reduced motion via OS/browser preferences.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Cancels any active Web Animations on `element` and resets inline transform overrides
 * so resting layout measurements are accurate.
 */
export function resetElementMotion(element: HTMLElement): void {
  if (typeof element.getAnimations === 'function') {
    element.getAnimations().forEach((anim) => anim.cancel());
  }
  element.style.transition = 'none';
  element.style.transform = '';
}

/**
 * Plays a standard straight-line FLIP translation from `(dx, dy)` to `(0, 0)`.
 * Respects `prefers-reduced-motion`.
 */
export function animateFlip(
  element: HTMLElement,
  dx: number,
  dy: number,
  options: FlipAnimateOptions = {},
): Animation | null {
  if (prefersReducedMotion() || Math.hypot(dx, dy) < 2) {
    return null;
  }

  const {
    duration = MOTION_DURATIONS.flip,
    easing = MOTION_EASINGS.easeOutExpo,
    zIndex = '60',
  } = options;

  if (typeof element.animate === 'function') {
    element.style.zIndex = zIndex;
    const anim = element.animate(
      [
        { transform: `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)` },
        { transform: 'translate(0px, 0px)' },
      ],
      { duration, easing },
    );
    anim.onfinish = () => {
      element.style.zIndex = '';
    };
    return anim;
  }

  element.style.transform = `translate(${dx}px, ${dy}px)`;
  requestAnimationFrame(() => {
    element.style.transition = `transform ${duration}ms ${easing}`;
    element.style.transform = '';
  });
  return null;
}

/**
 * Builds keyframes that move an element smoothly from its `prevRect` center onto the
 * exact Bezier `curveCtrl` points (in `containerRect` space) and settle at `nextRect` center.
 */
export function buildCurveKeyframes(
  prevRect: RectLike,
  nextRect: RectLike,
  curveCtrl: readonly Point2D[],
  containerRect: RectLike,
  samples = 18,
): Keyframe[] {
  const prevCenter = {
    x: prevRect.left - containerRect.left + prevRect.width / 2,
    y: prevRect.top - containerRect.top + prevRect.height / 2,
  };
  const nextCenter = {
    x: nextRect.left - containerRect.left + nextRect.width / 2,
    y: nextRect.top - containerRect.top + nextRect.height / 2,
  };

  const toTranslate = (pt: Point2D, scale = 1) =>
    `translate(${(pt.x - nextCenter.x).toFixed(1)}px, ${(pt.y - nextCenter.y).toFixed(1)}px) scale(${scale})`;

  const keyframes: Keyframe[] = [{ transform: toTranslate(prevCenter, 1), offset: 0 }];

  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const pt = bezierPoint(curveCtrl, t);
    // Curve traversal spans offsets 0.14 -> 0.86 so entry/exit into slots feels continuous
    const offset = 0.14 + t * 0.72;
    const scale = 1.08;
    keyframes.push({ transform: toTranslate(pt, scale), offset });
  }

  keyframes.push({ transform: 'translate(0px, 0px) scale(1)', offset: 1 });
  return keyframes;
}

/**
 * Animates an element from `prevRect` to `nextRect` riding directly along `curveCtrl`.
 * Respects `prefers-reduced-motion`.
 */
export function animateAlongCurve(
  element: HTMLElement,
  prevRect: RectLike,
  nextRect: RectLike,
  curveCtrl: readonly Point2D[],
  containerRect: RectLike,
  options: FlipAnimateOptions = {},
): Animation | null {
  if (prefersReducedMotion()) {
    return null;
  }

  const dx = prevRect.left - nextRect.left;
  const dy = prevRect.top - nextRect.top;
  if (Math.hypot(dx, dy) < 2) {
    return null;
  }

  const {
    duration = MOTION_DURATIONS.flow,
    easing = MOTION_EASINGS.easeInOut,
    zIndex = '60',
  } = options;

  if (typeof element.animate === 'function') {
    const keyframes = buildCurveKeyframes(prevRect, nextRect, curveCtrl, containerRect);
    element.style.zIndex = zIndex;
    const anim = element.animate(keyframes, { duration, easing });
    anim.onfinish = () => {
      element.style.zIndex = '';
    };
    return anim;
  }

  return animateFlip(element, dx, dy, options);
}
