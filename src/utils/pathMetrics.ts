import type { Point } from './bezier';
import { xToBoard, yToFeet, LANE } from './laneGeometry';

export interface PathMetrics {
  foulLineBoard: number | null;
  breakpointBoard: number | null;
  breakpointFt: number | null;
  speedMph: number | null;
  revRate: number | null;
}

export function computeMetrics(points: Point[], manualSpeed?: number | null, manualRevs?: number | null): PathMetrics {
  if (points.length < 2) {
    return {
      foulLineBoard: null,
      breakpointBoard: null,
      breakpointFt: null,
      speedMph: manualSpeed ?? null,
      revRate: manualRevs ?? null,
    };
  }

  // Foul line exit board: use the point closest to foul line (highest Y = bottom of canvas)
  const sortedByY = [...points].sort((a, b) => b.y - a.y);
  const foulPoint = sortedByY[0];
  const foulLineBoard = xToBoard(foulPoint.x);

  // Breakpoint: find where X changes direction most dramatically (hook point)
  // Look at the lateral (X) velocity and find the reversal
  let breakpointBoard: number | null = null;
  let breakpointFt: number | null = null;

  if (points.length >= 5) {
    let maxCurvature = 0;
    let bpIndex = -1;

    for (let i = 2; i < points.length - 2; i++) {
      const dx1 = points[i].x - points[i - 2].x;
      const dx2 = points[i + 2].x - points[i].x;
      // Curvature = change in lateral direction
      const curvature = Math.abs(dx2 - dx1);
      if (curvature > maxCurvature) {
        maxCurvature = curvature;
        bpIndex = i;
      }
    }

    if (bpIndex >= 0 && maxCurvature > 3) {
      breakpointBoard = xToBoard(points[bpIndex].x);
      breakpointFt = yToFeet(points[bpIndex].y);
    }
  }

  // Speed from timestamps if available
  let speedMph: number | null = manualSpeed ?? null;
  if (!speedMph && points.length >= 2) {
    const first = points[0];
    const last = points[points.length - 1];
    if (first.t !== undefined && last.t !== undefined && last.t > first.t) {
      const dy = first.y - last.y; // pixels traveled (foul line to pins)
      const pixelsPerFt = LANE.HEIGHT / LANE.TOTAL_FT;
      const distanceFt = dy / pixelsPerFt;
      const durationSec = (last.t - first.t) / 1000;
      const mph = (distanceFt / durationSec) * (3600 / 5280);
      speedMph = Math.round(mph * 10) / 10;
    }
  }

  return {
    foulLineBoard,
    breakpointBoard,
    breakpointFt: breakpointFt !== null ? Math.round(breakpointFt * 10) / 10 : null,
    speedMph,
    revRate: manualRevs ?? null,
  };
}
