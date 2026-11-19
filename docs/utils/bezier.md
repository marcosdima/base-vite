# Bezier & SVG Arrow Geometry (`@/utils/bezier`)

- **Source**: `src/utils/bezier.ts`
- **Test**: `src/utils/bezier.test.ts`

## Purpose

Pure geometry utilities for evaluating arbitrary-degree Bernstein polynomial Bezier curves, computing bounding-box edge anchors, and generating SVG cubic Bezier connector paths (`d`), centered arrowhead triangles (`headPath`), and perpendicular label positions (`labelPos`) between DOM rectangles.

## Exported Types

```ts
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
  labelOffset?: number;
  label: string;
}

export interface ArrowData {
  from: string;
  to: string;
  d: string;
  headPath: string;
  ctrl: readonly [Point2D, Point2D, Point2D, Point2D];
  label: string;
  labelPos: Point2D;
}
```

## Exported Functions & Constants

- `EDGE_NORMAL`: Outward normal vector `readonly [number, number]` for each `EdgeSide`.
- `bezierPoint(ctrl: readonly Point2D[], t: number): Point2D` — Evaluates a Bezier curve at parameter `t` in `[0, 1]`.
- `bezierTangent(ctrl: readonly Point2D[], t: number): Point2D` — Numerical tangent vector at `t` in `[0, 1]`.
- `getRectEdgeAnchor(rect: RectLike, containerRect: RectLike, side: EdgeSide): Point2D` — Computes the midpoint of the given `side` of `rect` in `containerRect`-relative coordinates.
- `computeBezierArrow(fromRect: RectLike, toRect: RectLike, containerRect: RectLike, spec: ArrowSpec, labelOffset?: number): ArrowData` — Returns the SVG cubic path `d` (stopping cleanly at the arrowhead base), triangle `headPath` (stopping 2px outside the target box border), 4 control points `ctrl`, and mid-curve offset `labelPos`.
