export interface Point2D {
  x: number;
  y: number;
}

export type EdgeSide = 'top' | 'bottom' | 'left' | 'right';

export interface RectLike {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface ArrowSpec {
  from: readonly [string, EdgeSide];
  to: readonly [string, EdgeSide];
  dist?: number;
  bow?: number;
  label: string;
}

export interface ArrowData {
  d: string;
  label: string;
  labelPos: Point2D;
}

export const EDGE_NORMAL: Record<EdgeSide, readonly [number, number]> = {
  top: [0, -1],
  bottom: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};

/**
 * Evaluates a Bernstein polynomial Bezier curve of arbitrary degree at parameter t in [0, 1].
 */
export function bezierPoint(ctrl: readonly Point2D[], t: number): Point2D {
  const n = ctrl.length - 1;
  const pt = { x: 0, y: 0 };
  for (let i = 0; i <= n; i++) {
    let c = 1;
    for (let j = 1; j <= i; j++) c = (c * (n - i + j)) / j;
    const w = c * Math.pow(1 - t, n - i) * Math.pow(t, i);
    pt.x += ctrl[i]!.x * w;
    pt.y += ctrl[i]!.y * w;
  }
  return pt;
}

/**
 * Numerical tangent vector of a Bezier curve at parameter t in [0, 1].
 */
export function bezierTangent(ctrl: readonly Point2D[], t: number): Point2D {
  const e = 0.01;
  const a = bezierPoint(ctrl, Math.max(0, t - e));
  const b = bezierPoint(ctrl, Math.min(1, t + e));
  return { x: b.x - a.x, y: b.y - a.y };
}

/**
 * Computes the anchor point on the specified side of `rect` relative to `containerRect`.
 */
export function getRectEdgeAnchor(
  rect: RectLike,
  containerRect: RectLike,
  side: EdgeSide,
): Point2D {
  const x = rect.left - containerRect.left;
  const y = rect.top - containerRect.top;
  switch (side) {
    case 'top':
      return { x: x + rect.width / 2, y };
    case 'bottom':
      return { x: x + rect.width / 2, y: y + rect.height };
    case 'left':
      return { x, y: y + rect.height / 2 };
    case 'right':
      return { x: x + rect.width, y: y + rect.height / 2 };
  }
}

/**
 * Builds an SVG cubic Bezier path (`d`) and perpendicular midpoint label position
 * connecting two bounding boxes inside `containerRect`.
 */
export function computeBezierArrow(
  fromRect: RectLike,
  toRect: RectLike,
  containerRect: RectLike,
  spec: ArrowSpec,
  labelOffset = 16,
): ArrowData {
  const fromSide = spec.from[1];
  const toSide = spec.to[1];
  const p1 = getRectEdgeAnchor(fromRect, containerRect, fromSide);
  const p2 = getRectEdgeAnchor(toRect, containerRect, toSide);
  const n1 = EDGE_NORMAL[fromSide];
  const n2 = EDGE_NORMAL[toSide];
  const dist = spec.dist ?? 50;

  const c1 = { x: p1.x + n1[0] * dist, y: p1.y + n1[1] * dist };
  const c2 = { x: p2.x + n2[0] * dist, y: p2.y + n2[1] * dist };

  if (typeof spec.bow === 'number') {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.hypot(dx, dy) || 1;
    const px = -dy / len;
    const py = dx / len;
    c1.x += px * spec.bow;
    c1.y += py * spec.bow;
    c2.x += px * spec.bow;
    c2.y += py * spec.bow;
  }

  const ctrl = [p1, c1, c2, p2];
  const d = `M ${p1.x} ${p1.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y} ${p2.x} ${p2.y}`;

  const mid = bezierPoint(ctrl, 0.5);
  const tan = bezierTangent(ctrl, 0.5);
  const len = Math.hypot(tan.x, tan.y) || 1;
  const nx = -tan.y / len;
  const ny = tan.x / len;

  return {
    d,
    label: spec.label,
    labelPos: {
      x: mid.x + nx * labelOffset,
      y: mid.y + ny * labelOffset,
    },
  };
}
