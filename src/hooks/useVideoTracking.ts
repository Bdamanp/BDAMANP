import { useState, useRef, useCallback } from 'react';
import type { Point } from '../utils/bezier';

export type TrackingStatus = 'idle' | 'loading' | 'processing' | 'done' | 'error';

export const SAMPLE_W = 320;
export const SAMPLE_H = 240;

export interface UseVideoTrackingReturn {
  status: TrackingStatus;
  progress: number;
  error: string | null;
  extractPathFromVideo: (file: File, onPath: (points: Point[]) => void) => Promise<void>;
  videoUrl: string | null;
  rawVideoPoints: Point[];   // video-space coords (in SAMPLE_W x SAMPLE_H space) for overlay
  clearVideo: () => void;
}

// Detect ball centroid in a frame using dark-region detection on a light lane
function detectBallCentroid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): { x: number; y: number } | null {
  const data = ctx.getImageData(0, 0, width, height).data;

  const THRESHOLD = 80;
  let sumX = 0;
  let sumY = 0;
  let count = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const brightness = (r + g + b) / 3;
      if (brightness < THRESHOLD) {
        sumX += x;
        sumY += y;
        count++;
      }
    }
  }

  if (count < 50) return null;
  return { x: sumX / count, y: sumY / count };
}

export function useVideoTracking(): UseVideoTrackingReturn {
  const [status, setStatus] = useState<TrackingStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [rawVideoPoints, setRawVideoPoints] = useState<Point[]>([]);
  const urlRef = useRef<string | null>(null);

  const clearVideo = useCallback(() => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    setVideoUrl(null);
    setStatus('idle');
    setProgress(0);
    setError(null);
    setRawVideoPoints([]);
  }, []);

  const extractPathFromVideo = useCallback(
    async (file: File, onPath: (points: Point[]) => void) => {
      setStatus('loading');
      setError(null);
      setProgress(0);
      setRawVideoPoints([]);

      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      const url = URL.createObjectURL(file);
      urlRef.current = url;
      setVideoUrl(url);

      try {
        const video = document.createElement('video');
        video.src = url;
        video.crossOrigin = 'anonymous';
        video.muted = true;

        await new Promise<void>((resolve, reject) => {
          video.onloadedmetadata = () => resolve();
          video.onerror = () => reject(new Error('Failed to load video'));
        });

        setStatus('processing');

        const duration = video.duration;
        const FPS = 15;
        const totalFrames = Math.floor(duration * FPS);
        const offscreen = document.createElement('canvas');
        offscreen.width = SAMPLE_W;
        offscreen.height = SAMPLE_H;
        const ctx = offscreen.getContext('2d')!;

        const rawPoints: Point[] = [];

        for (let frame = 0; frame < totalFrames; frame++) {
          const t = frame / FPS;
          video.currentTime = t;

          await new Promise<void>((resolve) => {
            video.onseeked = () => resolve();
          });

          ctx.drawImage(video, 0, 0, SAMPLE_W, SAMPLE_H);
          const centroid = detectBallCentroid(ctx, SAMPLE_W, SAMPLE_H);

          if (centroid) {
            rawPoints.push({ x: centroid.x, y: centroid.y, t: t * 1000 });
          }

          setProgress(Math.round(((frame + 1) / totalFrames) * 100));
        }

        if (rawPoints.length < 3) {
          throw new Error('Could not detect ball path. Try adjusting video lighting or use manual draw mode.');
        }

        // Store raw video-space points for the overlay
        setRawVideoPoints(rawPoints);

        // Normalize to lane canvas space
        const minY = Math.min(...rawPoints.map((p) => p.y));
        const maxY = Math.max(...rawPoints.map((p) => p.y));
        const minX = Math.min(...rawPoints.map((p) => p.x));
        const maxX = Math.max(...rawPoints.map((p) => p.x));

        const LANE_W = 320;
        const LANE_H = 720;

        const normalized = rawPoints.map((p) => ({
          x: ((p.x - minX) / (maxX - minX || 1)) * LANE_W,
          y: LANE_H - ((p.y - minY) / (maxY - minY || 1)) * LANE_H,
          t: p.t,
        }));

        onPath(normalized);
        setStatus('done');
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        setError(msg);
        setStatus('error');
      }
    },
    []
  );

  return { status, progress, error, extractPathFromVideo, videoUrl, rawVideoPoints, clearVideo };
}
