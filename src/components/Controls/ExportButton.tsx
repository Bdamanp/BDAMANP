import { toPng } from 'html-to-image';
import type Konva from 'konva';

interface ExportButtonProps {
  stageRef: React.RefObject<Konva.Stage | null>;
  disabled?: boolean;
}

export function ExportButton({ stageRef, disabled }: ExportButtonProps) {
  async function handleExport() {
    const stage = stageRef.current;
    if (!stage) return;

    try {
      const dataUrl = stage.toDataURL({ pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `bowling-shot-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      // Fallback: try html-to-image on the container
      const container = stage.container();
      if (!container) return;
      const dataUrl = await toPng(container, { pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `bowling-shot-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={disabled}
      className="w-full px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium text-sm transition-all"
    >
      💾 Export as PNG
    </button>
  );
}
