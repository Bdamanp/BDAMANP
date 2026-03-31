// Standard 10-pin bowling lane constants
// Lane: 60 ft long, 41.5 inches wide = 39 boards (each ~1.0625 inches)
// We display ~60ft of the lane (full length)

export const LANE = {
  BOARDS: 39,
  // Canvas dimensions
  WIDTH: 320,
  HEIGHT: 720,
  // Lane markings in feet from foul line
  DOTS_FT: 7,
  ARROWS_FT: 15,
  TOTAL_FT: 60,
  // Board positions for dots and arrows (from right, 1-indexed)
  DOT_BOARDS: [3, 5, 8, 11, 14, 17, 20],
  ARROW_BOARDS: [5, 10, 15, 20, 25, 30, 35],
  // Pin positions (board numbers)
  PIN_LAYOUT: [
    // row 1 (front): pin 1
    { pin: 1, board: 20 },
    // row 2: pins 2, 3
    { pin: 2, board: 17 },
    { pin: 3, board: 23 },
    // row 3: pins 4, 5, 6
    { pin: 4, board: 14 },
    { pin: 5, board: 20 },
    { pin: 6, board: 26 },
    // row 4: pins 7, 8, 9, 10
    { pin: 7, board: 11 },
    { pin: 8, board: 17 },
    { pin: 9, board: 23 },
    { pin: 10, board: 29 },
  ],
} as const;

// Convert board number (1-39, right to left) to pixel X on canvas
// Board 1 = right gutter, Board 39 = left gutter
export function boardToX(board: number): number {
  // Board 1 on right, 39 on left
  const boardWidth = LANE.WIDTH / LANE.BOARDS;
  return LANE.WIDTH - (board - 0.5) * boardWidth;
}

// Convert pixel X to board number (rounded)
export function xToBoard(x: number): number {
  const boardWidth = LANE.WIDTH / LANE.BOARDS;
  const board = Math.round(LANE.BOARDS - x / boardWidth + 0.5);
  return Math.max(1, Math.min(LANE.BOARDS, board));
}

// Convert feet from foul line to pixel Y
// Foul line = bottom (y = HEIGHT), pins = top (y = 0)
export function feetToY(feet: number): number {
  return LANE.HEIGHT - (feet / LANE.TOTAL_FT) * LANE.HEIGHT;
}

// Convert pixel Y to feet from foul line
export function yToFeet(y: number): number {
  return ((LANE.HEIGHT - y) / LANE.HEIGHT) * LANE.TOTAL_FT;
}

export function boardWidth(): number {
  return LANE.WIDTH / LANE.BOARDS;
}

// Snap x coordinate to nearest board center
export function snapToBoard(x: number): number {
  const board = xToBoard(x);
  return boardToX(board);
}
