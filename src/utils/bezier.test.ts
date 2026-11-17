import { describe, expect, it } from 'vitest';
import { bezierPoint, bezierTangent, computeBezierArrow, getRectEdgeAnchor } from './bezier';

describe('bezier utilities', () => {
  const container = { left: 10, top: 20, width: 800, height: 600 };
  const boxA = { left: 110, top: 120, width: 100, height: 50 };
  const boxB = { left: 310, top: 120, width: 100, height: 50 };

  it('computes relative anchor points on each side of a rectangle', () => {
    expect(getRectEdgeAnchor(boxA, container, 'top')).toEqual({ x: 150, y: 100 });
    expect(getRectEdgeAnchor(boxA, container, 'bottom')).toEqual({ x: 150, y: 150 });
    expect(getRectEdgeAnchor(boxA, container, 'left')).toEqual({ x: 100, y: 125 });
    expect(getRectEdgeAnchor(boxA, container, 'right')).toEqual({ x: 200, y: 125 });
  });

  it('evaluates cubic Bezier endpoints and midpoint', () => {
    const ctrl = [
      { x: 0, y: 0 },
      { x: 0, y: 100 },
      { x: 100, y: 100 },
      { x: 100, y: 0 },
    ];
    expect(bezierPoint(ctrl, 0)).toEqual({ x: 0, y: 0 });
    expect(bezierPoint(ctrl, 1)).toEqual({ x: 100, y: 0 });
    expect(bezierPoint(ctrl, 0.5)).toEqual({ x: 50, y: 75 });

    const tan = bezierTangent(ctrl, 0.5);
    expect(tan.x).toBeGreaterThan(0);
    expect(tan.y).toBeCloseTo(0, 5);
  });

  it('builds SVG path and offset label coordinates between two boxes', () => {
    const arrow = computeBezierArrow(boxA, boxB, container, {
      from: ['A', 'right'],
      to: ['B', 'left'],
      dist: 40,
      bow: 20,
      label: 'dispatch',
    });

    expect(arrow.label).toBe('dispatch');
    expect(arrow.d).toMatch(/^M 200 125 C /);
    expect(arrow.labelPos.x).toBeCloseTo(250, 1);
  });
});
