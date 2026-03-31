import { useState, useCallback } from 'react';
import type { Point } from '../utils/bezier';
import { downsample } from '../utils/bezier';
import type { PathMetrics } from '../utils/pathMetrics';
import { computeMetrics } from '../utils/pathMetrics';

export type PathSource = 'drawn' | 'video';

export interface BallPath {
  points: Point[];
  source: PathSource;
}

export interface UseBallPathReturn {
  path: BallPath | null;
  metrics: PathMetrics;
  manualSpeed: number | null;
  manualRevs: number | null;
  setManualSpeed: (v: number | null) => void;
  setManualRevs: (v: number | null) => void;
  startDrawing: (p: Point) => void;
  addPoint: (p: Point) => void;
  endDrawing: () => void;
  setVideoPath: (points: Point[]) => void;
  clearPath: () => void;
  isDrawing: boolean;
}

export function useBallPath(): UseBallPathReturn {
  const [path, setPath] = useState<BallPath | null>(null);
  const [_rawPoints, setRawPoints] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [manualSpeed, setManualSpeed] = useState<number | null>(null);
  const [manualRevs, setManualRevs] = useState<number | null>(null);

  const metrics = computeMetrics(path?.points ?? [], manualSpeed, manualRevs);

  const startDrawing = useCallback((p: Point) => {
    setIsDrawing(true);
    setRawPoints([p]);
    setPath({ points: [p], source: 'drawn' });
  }, []);

  const addPoint = useCallback((p: Point) => {
    setRawPoints((prev) => {
      const next = [...prev, p];
      setPath({ points: downsample(next, 6), source: 'drawn' });
      return next;
    });
  }, []);

  const endDrawing = useCallback(() => {
    setIsDrawing(false);
    setRawPoints((prev) => {
      const sampled = downsample(prev, 6);
      setPath({ points: sampled, source: 'drawn' });
      return prev;
    });
  }, []);

  const setVideoPath = useCallback((points: Point[]) => {
    setPath({ points, source: 'video' });
    setIsDrawing(false);
  }, []);

  const clearPath = useCallback(() => {
    setPath(null);
    setRawPoints([]);
    setIsDrawing(false);
  }, []);

  return {
    path,
    metrics,
    manualSpeed,
    manualRevs,
    setManualSpeed,
    setManualRevs,
    startDrawing,
    addPoint,
    endDrawing,
    setVideoPath,
    clearPath,
    isDrawing,
  };
}
