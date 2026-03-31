import { useRef, useState } from 'react';
import type Konva from 'konva';
import { LaneDiagram } from './components/Lane/LaneDiagram';
import type { DrawMode } from './components/Lane/LaneDiagram';
import { DrawingTools } from './components/Controls/DrawingTools';
import { MetricsPanel } from './components/Controls/MetricsPanel';
import { ExportButton } from './components/Controls/ExportButton';
import { VideoUploader } from './components/Video/VideoUploader';
import { useBallPath } from './hooks/useBallPath';
import { useVideoTracking } from './hooks/useVideoTracking';

export default function App() {
  const [mode, setMode] = useState<DrawMode>('draw');
  const stageRef = useRef<Konva.Stage>(null);

  const {
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
  } = useBallPath();

  const {
    status: videoStatus,
    progress: videoProgress,
    error: videoError,
    extractPathFromVideo,
    videoUrl,
    rawVideoPoints,
    clearVideo,
  } = useVideoTracking();

  function handleClear() {
    clearPath();
    clearVideo();
  }

  function handleVideoFile(file: File) {
    clearPath();
    extractPathFromVideo(file, (pts) => {
      setVideoPath(pts);
      setMode('pointer');
    });
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <span className="text-2xl">🎳</span>
          <div>
            <h1 className="text-xl font-bold text-white">Ten Pin Toolkit</h1>
            <p className="text-slate-400 text-xs">Ball path editor & shot analyzer</p>
          </div>
        </div>
      </header>

      {/* Main layout */}
      <main className="max-w-6xl mx-auto px-4 py-6 flex gap-6 items-start flex-col lg:flex-row">
        {/* Left: Lane */}
        <div className="flex flex-col items-center gap-4 flex-shrink-0">
          <DrawingTools
            mode={mode}
            onModeChange={setMode}
            onClear={handleClear}
            hasPath={!!path}
          />

          <div className="rounded-xl overflow-hidden shadow-2xl shadow-black/60 border border-slate-700">
            <LaneDiagram
              mode={mode}
              pathPoints={path?.points ?? null}
              isDrawing={isDrawing}
              onDrawStart={startDrawing}
              onDrawMove={addPoint}
              onDrawEnd={endDrawing}
              stageRef={stageRef}
            />
          </div>

          <div className="text-slate-500 text-xs text-center">
            {mode === 'draw'
              ? 'Click and drag on the lane to draw ball path'
              : 'Hover over the lane to inspect board numbers'}
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex-1 space-y-4 w-full lg:max-w-sm">
          <MetricsPanel
            metrics={metrics}
            manualSpeed={manualSpeed}
            manualRevs={manualRevs}
            onSpeedChange={setManualSpeed}
            onRevsChange={setManualRevs}
            pathSource={path?.source ?? null}
          />

          <VideoUploader
            onFile={handleVideoFile}
            videoUrl={videoUrl}
            rawVideoPoints={rawVideoPoints}
            status={videoStatus}
            progress={videoProgress}
            error={videoError}
            onClear={handleClear}
          />

          <ExportButton stageRef={stageRef} disabled={!path} />

          {/* Legend */}
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Lane Guide</h3>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-red-500 rounded" />
                <span>Foul line</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-700" />
                <span>Dots (7 ft from foul line)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-amber-700 rounded" style={{ clipPath: 'polygon(0 50%, 80% 0, 80% 100%)' }} />
                <span>Arrows (15 ft from foul line)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-white border border-gray-400" />
                <span>Pins</span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-700 text-slate-500">
                Boards numbered 1–39, right to left
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
