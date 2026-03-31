import type { DrawMode } from '../Lane/LaneDiagram';

interface DrawingToolsProps {
  mode: DrawMode;
  onModeChange: (m: DrawMode) => void;
  onClear: () => void;
  hasPath: boolean;
}

export function DrawingTools({ mode, onModeChange, onClear, hasPath }: DrawingToolsProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Mode:</span>

      <button
        onClick={() => onModeChange('draw')}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
          mode === 'draw'
            ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
        }`}
      >
        ✏️ Draw Path
      </button>

      <button
        onClick={() => onModeChange('pointer')}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
          mode === 'pointer'
            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
        }`}
      >
        👆 Inspect
      </button>

      {hasPath && (
        <button
          onClick={onClear}
          className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-700 text-slate-300 hover:bg-red-900 hover:text-red-300 transition-all ml-auto"
        >
          🗑️ Clear
        </button>
      )}
    </div>
  );
}
