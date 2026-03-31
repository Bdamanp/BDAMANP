export interface Point {
  x: number;
  y: number;
  t?: number;
}

// Catmull-Rom spline to smooth raw drawn points
// Returns a flat array of [x, y, x, y, ...] suitable for Konva Line
export function smoothPath(points: Point[], tension = 0.5): number[] {
  if (points.length < 2) return points.flatMap((p) => [p.x, p.y]);

  const result: number[] = [];

  for (let i = 0; i < points.length; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[Math.min(points.length - 1, i + 1)];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    if (i === 0) {
      result.push(p1.x, p1.y);
      continue;
    }

    // Generate curve segments between p1 and p2
    const steps = 8;
    for (let t = 0; t <= steps; t++) {
      const tt = t / steps;
      const tt2 = tt * tt;
      const tt3 = tt2 * tt;

      const x =
        0.5 *
        (2 * p1.x +
          (-p0.x + p2.x) * tension * tt +
          (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * tension * tt2 +
          (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * tension * tt3);

      const y =
        0.5 *
        (2 * p1.y +
          (-p0.y + p2.y) * tension * tt +
          (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * tension * tt2 +
          (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * tension * tt3);

      result.push(x, y);
    }
  }

  return result;
}

// Downsample points to reduce noise
export function downsample(points: Point[], minDist = 8): Point[] {
  if (points.length === 0) return [];
  const result: Point[] = [points[0]];
  for (let i = 1; i < points.length; i++) {
    const last = result[result.length - 1];
    const dx = points[i].x - last.x;
    const dy = points[i].y - last.y;
    if (Math.sqrt(dx * dx + dy * dy) >= minDist) {
      result.push(points[i]);
    }
  }
  return result;
}
