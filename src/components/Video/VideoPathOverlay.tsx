import { useEffect, useRef, useCallback } from 'react';
import type { Point } from '../../utils/bezier';
import { SAMPLE_W, SAMPLE_H } from '../../hooks/useVideoTracking';

interface VideoPathOverlayProps {
  videoUrl: string;
  rawPoints: Point[]; // video-space coords in SAMPLE_W x SAMPLE_H space
}

export function VideoPathOverlay({ videoUrl, rawPoints }: VideoPathOverlayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawPath = useCallback(
    (currentTimeMs: number | null) => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) return;

      const displayW = canvas.offsetWidth;
      const displayH = canvas.offsetHeight;
      canvas.width = displayW;
      canvas.height = displayH;

      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, displayW, displayH);

      if (rawPoints.length < 2) return;

      // Scale factor from sample space to display space
      const scaleX = displayW / SAMPLE_W;
      const scaleY = displayH / SAMPLE_H;

      // Which points to show — all if paused/ended, up to currentTime while playing
      const visiblePoints =
        currentTimeMs === null
          ? rawPoints
          : rawPoints.filter((p) => p.t !== undefined && p.t <= currentTimeMs);

      if (visiblePoints.length < 2) return;

      // Draw trail — fades from transparent at start to solid at end
      for (let i = 1; i < visiblePoints.length; i++) {
        const progress = i / (visiblePoints.length - 1);
        const prev = visiblePoints[i - 1];
        const curr = visiblePoints[i];

        ctx.beginPath();
        ctx.moveTo(prev.x * scaleX, prev.y * scaleY);
        ctx.lineTo(curr.x * scaleX, curr.y * scaleY);
        ctx.strokeStyle = `rgba(99, 202, 255, ${0.2 + progress * 0.8})`;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      // Draw ball position dot at latest visible point
      const last = visiblePoints[visiblePoints.length - 1];
      const dotX = last.x * scaleX;
      const dotY = last.y * scaleY;

      // Glow
      const glow = ctx.createRadialGradient(dotX, dotY, 0, dotX, dotY, 14);
      glow.addColorStop(0, 'rgba(99, 202, 255, 0.6)');
      glow.addColorStop(1, 'rgba(99, 202, 255, 0)');
      ctx.beginPath();
      ctx.arc(dotX, dotY, 14, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      // Solid dot
      ctx.beginPath();
      ctx.arc(dotX, dotY, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#63caff';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    },
    [rawPoints]
  );

  // Draw full path on mount and when rawPoints change
  useEffect(() => {
    drawPath(null);
  }, [drawPath]);

  // Animate trail as video plays
  function handleTimeUpdate() {
    const video = videoRef.current;
    if (!video) return;
    drawPath(video.currentTime * 1000);
  }

  // Redraw full path when video pauses or ends
  function handlePauseOrEnd() {
    drawPath(null);
  }

  return (
    <div className="relative rounded-lg overflow-hidden bg-black">
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        className="w-full max-h-64 block"
        onTimeUpdate={handleTimeUpdate}
        onPause={handlePauseOrEnd}
        onEnded={handlePauseOrEnd}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ mixBlendMode: 'screen' }}
      />
    </div>
  );
}
