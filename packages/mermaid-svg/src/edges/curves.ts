/**
 * Curve generation for edges
 */

export type CurveType = 'linear' | 'basis' | 'step';

export interface Point {
  x: number;
  y: number;
}

/**
 * Generate SVG path data for a series of points
 */
export function generatePath(points: Point[], curveType: CurveType = 'linear'): string {
  if (points.length < 2) {
    return '';
  }

  switch (curveType) {
    case 'linear':
      return linearPath(points);
    case 'basis':
      return basisPath(points);
    case 'step':
      return stepPath(points);
    default:
      return linearPath(points);
  }
}

/**
 * Linear path - straight lines between points
 */
function linearPath(points: Point[]): string {
  const [first, ...rest] = points;
  let path = `M ${first.x} ${first.y}`;
  for (const point of rest) {
    path += ` L ${point.x} ${point.y}`;
  }
  return path;
}

/**
 * Basis spline - smooth curve through points
 * Simplified implementation using quadratic bezier curves
 */
function basisPath(points: Point[]): string {
  if (points.length < 2) return '';
  if (points.length === 2) return linearPath(points);

  const [first, ...rest] = points;
  let path = `M ${first.x} ${first.y}`;

  // For each pair of points, create a quadratic bezier
  for (let i = 0; i < rest.length; i++) {
    const next = rest[i];
    const nextNext = rest[i + 1];

    if (nextNext) {
      // Midpoint for smooth curve
      const midX = (next.x + nextNext.x) / 2;
      const midY = (next.y + nextNext.y) / 2;
      path += ` Q ${next.x} ${next.y} ${midX} ${midY}`;
    } else {
      // Last segment - straight line to end
      path += ` L ${next.x} ${next.y}`;
    }
  }

  return path;
}

/**
 * Step path - orthogonal steps between points
 */
function stepPath(points: Point[]): string {
  if (points.length < 2) return '';

  const [first, ...rest] = points;
  let path = `M ${first.x} ${first.y}`;

  let prev = first;
  for (const point of rest) {
    // Horizontal then vertical
    const midX = (prev.x + point.x) / 2;
    path += ` L ${midX} ${prev.y}`;
    path += ` L ${midX} ${point.y}`;
    path += ` L ${point.x} ${point.y}`;
    prev = point;
  }

  return path;
}
