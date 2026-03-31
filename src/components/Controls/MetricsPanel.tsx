import type { PathMetrics } from '../../utils/pathMetrics';

interface MetricsPanelProps {
  metrics: PathMetrics;
  manualSpeed: number | null;
  manualRevs: number | null;
  onSpeedChange: (v: number | null) => void;
  onRevsChange: (v: number | null) => void;
  pathSource: 'drawn' | 'video' | null;
}

interface MetricRowProps {
  label: string;
  value: string | null;
  fromVideo?: boolean;
  editable?: boolean;
  onEdit?: (v: number | null) => void;
  unit?: string;
  placeholder?: string;
}

function MetricRow({ label, value, fromVideo, editable, onEdit, unit, placeholder }: MetricRowProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
      <span className="text-slate-400 text-sm">{label}</span>
      <div className="flex items-center gap-2">
        {editable && onEdit ? (
          <div className="flex items-center gap-1">
            <input
              type="number"
              className="w-20 bg-slate-700 text-white text-sm rounded px-2 py-0.5 text-right border border-slate-600 focus:border-yellow-500 focus:outline-none"
              value={value ?? ''}
              placeholder={placeholder ?? '—'}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                onEdit(isNaN(v) ? null : v);
              }}
            />
            {unit && <span className="text-slate-400 text-xs">{unit}</span>}
          </div>
        ) : (
          <span className={`font-mono font-bold text-base ${fromVideo ? 'text-green-400' : value ? 'text-white' : 'text-slate-600'}`}>
            {value ? `${value}${unit ? ` ${unit}` : ''}` : '—'}
          </span>
        )}
        {fromVideo && (
          <span className="text-xs bg-green-900 text-green-400 px-1.5 py-0.5 rounded">auto</span>
        )}
      </div>
    </div>
  );
}

export function MetricsPanel({
  metrics,
  manualSpeed,
  manualRevs,
  onSpeedChange,
  onRevsChange,
  pathSource,
}: MetricsPanelProps) {
  const isVideo = pathSource === 'video';

  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
      <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
        <span>📊</span> Shot Metrics
        {pathSource && (
          <span className="ml-auto text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded">
            {pathSource === 'video' ? '🎥 from video' : '✏️ drawn'}
          </span>
        )}
      </h2>

      <div>
        <MetricRow
          label="Foul Line Exit"
          value={metrics.foulLineBoard !== null ? `Board ${metrics.foulLineBoard}` : null}
          fromVideo={isVideo}
        />
        <MetricRow
          label="Breakpoint"
          value={
            metrics.breakpointBoard !== null
              ? `Board ${metrics.breakpointBoard}${metrics.breakpointFt !== null ? ` @ ${metrics.breakpointFt}ft` : ''}`
              : null
          }
          fromVideo={isVideo}
        />
        <MetricRow
          label="Ball Speed"
          value={metrics.speedMph !== null ? String(metrics.speedMph) : manualSpeed !== null ? String(manualSpeed) : null}
          fromVideo={isVideo && metrics.speedMph !== null}
          editable={!isVideo || metrics.speedMph === null}
          onEdit={onSpeedChange}
          unit="mph"
          placeholder="enter mph"
        />
        <MetricRow
          label="Rev Rate"
          value={metrics.revRate !== null ? String(metrics.revRate) : manualRevs !== null ? String(manualRevs) : null}
          fromVideo={false}
          editable
          onEdit={onRevsChange}
          unit="rpm"
          placeholder="enter rpm"
        />
      </div>

      {!pathSource && (
        <p className="text-slate-500 text-xs mt-3 text-center">
          Draw a path or upload a video to see metrics
        </p>
      )}
    </div>
  );
}
