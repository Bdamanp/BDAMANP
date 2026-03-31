import { useRef, useState } from 'react';
import { Stage, Layer, Rect, Line, Circle, Text, Arrow } from 'react-konva';
import type Konva from 'konva';
import {
  LANE,
  boardToX,
  feetToY,
  boardWidth,
  xToBoard,
} from '../../utils/laneGeometry';
import { PathLayer } from './PathLayer';
import type { Point } from '../../utils/bezier';

export type DrawMode = 'draw' | 'pointer';

interface LaneDiagramProps {
  mode: DrawMode;
  pathPoints: Point[] | null;
  isDrawing: boolean;
  onDrawStart: (p: Point) => void;
  onDrawMove: (p: Point) => void;
  onDrawEnd: () => void;
  stageRef?: React.RefObject<Konva.Stage | null>;
}

const LANE_COLOR = '#f5e6c8';
const GUTTER_COLOR = '#c8a96e';
const FOUL_LINE_COLOR = '#e53e3e';
const BOARD_LINE_COLOR = 'rgba(180,160,120,0.25)';
const DOT_COLOR = '#8b6914';
const ARROW_COLOR = '#8b6914';
const PIN_COLOR = '#ffffff';

export function LaneDiagram({
  mode,
  pathPoints,
  isDrawing,
  onDrawStart,
  onDrawMove,
  onDrawEnd,
  stageRef,
}: LaneDiagramProps) {
  const [hoverBoard, setHoverBoard] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState(0);
  const [hoverY, setHoverY] = useState(0);
  const internalRef = useRef<Konva.Stage>(null);
  const ref = stageRef ?? internalRef;

  const bw = boardWidth();
  const gutterW = bw * 1.5;
  const laneX = gutterW;
  const laneW = LANE.WIDTH;

  const totalW = laneW + gutterW * 2;
  const H = LANE.HEIGHT;

  function getRelativePos(_e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) {
    const stage = ref.current;
    if (!stage) return null;
    const pos = stage.getPointerPosition();
    if (!pos) return null;
    // Adjust for gutter offset
    return { x: pos.x - gutterX(), y: pos.y };
  }

  function gutterX() {
    return gutterW;
  }

  function handleMouseMove(e: Konva.KonvaEventObject<MouseEvent>) {
    const pos = getRelativePos(e);
    if (!pos) return;
    const board = xToBoard(pos.x);
    setHoverBoard(board);
    setHoverX(pos.x + gutterX());
    setHoverY(pos.y);
    if (isDrawing && mode === 'draw') {
      onDrawMove({ x: pos.x, y: pos.y });
    }
  }

  function handleMouseDown(e: Konva.KonvaEventObject<MouseEvent>) {
    if (mode !== 'draw') return;
    const pos = getRelativePos(e);
    if (!pos) return;
    onDrawStart({ x: pos.x, y: pos.y, t: Date.now() });
  }

  function handleMouseUp() {
    if (mode === 'draw') onDrawEnd();
  }

  function handleMouseLeave() {
    setHoverBoard(null);
    if (isDrawing) onDrawEnd();
  }

  // Touch events
  function handleTouchStart(e: Konva.KonvaEventObject<TouchEvent>) {
    if (mode !== 'draw') return;
    const pos = getRelativePos(e);
    if (!pos) return;
    onDrawStart({ x: pos.x, y: pos.y, t: Date.now() });
  }

  function handleTouchMove(e: Konva.KonvaEventObject<TouchEvent>) {
    const pos = getRelativePos(e);
    if (!pos) return;
    const board = xToBoard(pos.x);
    setHoverBoard(board);
    setHoverX(pos.x + gutterX());
    setHoverY(pos.y);
    if (isDrawing && mode === 'draw') {
      onDrawMove({ x: pos.x, y: pos.y, t: Date.now() });
    }
  }

  function handleTouchEnd() {
    if (mode === 'draw') onDrawEnd();
  }

  const foulLineY = feetToY(0);
  const dotsY = feetToY(LANE.DOTS_FT);
  const arrowsY = feetToY(LANE.ARROWS_FT);
  const pinDeckY = feetToY(56);

  return (
    <Stage
      ref={ref as React.RefObject<Konva.Stage>}
      width={totalW}
      height={H}
      style={{ cursor: mode === 'draw' ? 'crosshair' : 'default', borderRadius: 8, overflow: 'hidden' }}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background */}
      <Layer>
        {/* Left gutter */}
        <Rect x={0} y={0} width={gutterW} height={H} fill={GUTTER_COLOR} />
        {/* Right gutter */}
        <Rect x={laneX + laneW} y={0} width={gutterW} height={H} fill={GUTTER_COLOR} />
        {/* Lane surface */}
        <Rect x={laneX} y={0} width={laneW} height={H} fill={LANE_COLOR} />

        {/* Board lines */}
        {Array.from({ length: LANE.BOARDS + 1 }, (_, i) => (
          <Line
            key={`board-${i}`}
            points={[laneX + i * bw, 0, laneX + i * bw, H]}
            stroke={BOARD_LINE_COLOR}
            strokeWidth={i % 5 === 0 ? 1.5 : 0.5}
          />
        ))}

        {/* Foul line */}
        <Line
          points={[laneX, foulLineY, laneX + laneW, foulLineY]}
          stroke={FOUL_LINE_COLOR}
          strokeWidth={3}
        />
        <Text
          x={laneX + laneW + 4}
          y={foulLineY - 8}
          text="FOUL"
          fontSize={9}
          fill={FOUL_LINE_COLOR}
        />

        {/* Approach dots at 7ft */}
        {LANE.DOT_BOARDS.map((board) => (
          <Circle
            key={`dot-${board}`}
            x={laneX + boardToX(board)}
            y={dotsY}
            radius={3}
            fill={DOT_COLOR}
          />
        ))}

        {/* Arrows at 15ft */}
        {LANE.ARROW_BOARDS.map((board, idx) => {
          const cx = laneX + boardToX(board);
          const arrowSize = 10;
          // Alternate pointing direction based on side of lane
          const pointingLeft = idx < 3;
          return (
            <Arrow
              key={`arrow-${board}`}
              points={
                pointingLeft
                  ? [cx + arrowSize, arrowsY, cx, arrowsY - arrowSize]
                  : [cx - arrowSize, arrowsY, cx, arrowsY - arrowSize]
              }
              fill={ARROW_COLOR}
              stroke={ARROW_COLOR}
              strokeWidth={1.5}
              pointerLength={6}
              pointerWidth={5}
            />
          );
        })}

        {/* "Arrows" label */}
        <Text
          x={laneX + laneW + 4}
          y={arrowsY - 8}
          text="15ft"
          fontSize={9}
          fill="#8b6914"
        />
        <Text
          x={laneX + laneW + 4}
          y={dotsY - 8}
          text="7ft"
          fontSize={9}
          fill="#8b6914"
        />

        {/* Pin deck area */}
        <Rect
          x={laneX}
          y={0}
          width={laneW}
          height={pinDeckY}
          fill="rgba(240,225,190,0.6)"
        />
        <Line
          points={[laneX, pinDeckY, laneX + laneW, pinDeckY]}
          stroke="#c8a96e"
          strokeWidth={2}
          dash={[4, 4]}
        />

        {/* Pins */}
        {LANE.PIN_LAYOUT.map(({ pin, board }) => (
          <Circle
            key={`pin-${pin}`}
            x={laneX + boardToX(board)}
            y={feetToY(58 + (pin <= 1 ? 0 : pin <= 3 ? 1 : pin <= 6 ? 2 : 3))}
            radius={5}
            fill={PIN_COLOR}
            stroke="#888"
            strokeWidth={1}
          />
        ))}

        {/* Board numbers at foul line */}
        {[5, 10, 15, 20, 25, 30, 35].map((board) => (
          <Text
            key={`label-${board}`}
            x={laneX + boardToX(board) - 6}
            y={foulLineY + 4}
            text={String(board)}
            fontSize={8}
            fill="#555"
          />
        ))}

        {/* Hover board highlight */}
        {hoverBoard !== null && (
          <>
            <Rect
              x={laneX + boardToX(hoverBoard) - bw / 2}
              y={0}
              width={bw}
              height={H}
              fill="rgba(255,200,0,0.15)"
            />
            <Text
              x={hoverX - 10}
              y={Math.max(hoverY - 18, 2)}
              text={`B${hoverBoard}`}
              fontSize={11}
              fill="#d97706"
              fontStyle="bold"
            />
          </>
        )}
      </Layer>

      {/* Ball path layer */}
      <PathLayer points={pathPoints} offsetX={laneX} />
    </Stage>
  );
}
