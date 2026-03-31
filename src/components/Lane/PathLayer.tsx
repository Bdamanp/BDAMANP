import { Layer, Line, Circle, Arrow } from 'react-konva';
import type { Point } from '../../utils/bezier';
import { smoothPath } from '../../utils/bezier';

interface PathLayerProps {
  points: Point[] | null;
  offsetX?: number;
}

export function PathLayer({ points, offsetX = 0 }: PathLayerProps) {
  if (!points || points.length < 2) return <Layer />;

  const flatSmoothed = smoothPath(points);

  // Offset all x coords by lane x offset
  const offsetFlat = flatSmoothed.map((v, i) => (i % 2 === 0 ? v + offsetX : v));

  // Arrow at the end of path (near pins)
  const last = points[points.length - 1];
  const prev = points[Math.max(0, points.length - 3)];
  const dx = last.x - prev.x;
  const dy = last.y - prev.y;

  return (
    <Layer>
      {/* Shadow/glow */}
      <Line
        points={offsetFlat}
        stroke="rgba(239,68,68,0.3)"
        strokeWidth={10}
        lineCap="round"
        lineJoin="round"
        tension={0}
      />
      {/* Main path */}
      <Line
        points={offsetFlat}
        stroke="#ef4444"
        strokeWidth={3.5}
        lineCap="round"
        lineJoin="round"
        tension={0}
      />
      {/* Start dot */}
      <Circle
        x={points[0].x + offsetX}
        y={points[0].y}
        radius={6}
        fill="#ef4444"
        stroke="white"
        strokeWidth={1.5}
      />
      {/* Direction arrow at tip */}
      <Arrow
        points={[
          prev.x + offsetX,
          prev.y,
          last.x + offsetX + dx * 0.3,
          last.y + dy * 0.3,
        ]}
        fill="#ef4444"
        stroke="#ef4444"
        strokeWidth={2}
        pointerLength={10}
        pointerWidth={8}
      />
    </Layer>
  );
}
