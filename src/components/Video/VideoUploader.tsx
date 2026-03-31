import { useRef } from 'react';
import type { TrackingStatus } from '../../hooks/useVideoTracking';

interface VideoUploaderProps {
  onFile: (file: File) => void;
  videoUrl: string | null;
  status: TrackingStatus;
  progress: number;
  error: string | null;
  onClear: () => void;
}

export function VideoUploader({ onFile, videoUrl, status, progress, error, onClear }: VideoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onFile(file);
  }

  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 space-y-3">
      <h2 className="text-white font-semibold flex items-center gap-2">
        <span>🎥</span> Video Analysis
      </h2>

      {!videoUrl ? (
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-500 hover:bg-slate-700/50 transition-all"
        >
          <div className="text-3xl mb-2">📹</div>
          <p className="text-slate-300 text-sm font-medium">Upload bowling video</p>
          <p className="text-slate-500 text-xs mt-1">MP4, MOV, WebM</p>
        </div>
      ) : (
        <div className="space-y-2">
          <video
            src={videoUrl}
            controls
            className="w-full rounded-lg max-h-48 bg-black"
          />
          <button
            onClick={onClear}
            className="text-xs text-slate-400 hover:text-red-400 transition-colors"
          >
            Remove video
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleChange}
      />

      {status === 'processing' && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Tracking ball...</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {status === 'done' && (
        <p className="text-green-400 text-xs flex items-center gap-1">
          <span>✓</span> Ball path detected and applied
        </p>
      )}

      {error && (
        <p className="text-red-400 text-xs">{error}</p>
      )}

      {videoUrl && status === 'idle' && (
        <p className="text-slate-500 text-xs text-center">
          Video loaded. Click "Analyze Video" to track the ball.
        </p>
      )}
    </div>
  );
}
