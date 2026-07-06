import { Tile, PuzzleState } from './types';

/**
 * Create a solved puzzle state
 */
function createSolvedPuzzle(gridSize: number): PuzzleState {
  const total = gridSize * gridSize;
  const tiles: Tile[] = [];
  for (let i = 0; i < total; i++) {
    tiles.push({ id: i, row: Math.floor(i / gridSize), col: i % gridSize });
  }
  return {
    tiles,
    gridSize,
    emptyIndex: total - 1, // last tile is empty
    moves: 0,
    startTime: Date.now(),
    solved: false,
  };
}

/**
 * Check if puzzle is solved (all tiles at their correct positions)
 */
function isSolved(tiles: Tile[], gridSize: number): boolean {
  for (let i = 0; i < tiles.length - 1; i++) {
    const t = tiles[i];
    const expectedRow = Math.floor(t.id / gridSize);
    const expectedCol = t.id % gridSize;
    if (t.row !== expectedRow || t.col !== expectedCol) return false;
  }
  return true;
}

/**
 * Get tile at given row/col
 */
function tileAt(tiles: Tile[], row: number, col: number): Tile | undefined {
  return tiles.find((t) => t.row === row && t.col === col);
}

/**
 * Try to move a tile. Returns new state if valid, null if not.
 */
export function moveTile(state: PuzzleState, row: number, col: number): PuzzleState | null {
  const { tiles, gridSize, emptyIndex } = state;
  const emptyTile = tiles[emptyIndex];

  // Check adjacency
  const dr = Math.abs(row - emptyTile.row);
  const dc = Math.abs(col - emptyTile.col);
  if (!((dr === 1 && dc === 0) || (dr === 0 && dc === 1))) return null;

  const target = tileAt(tiles, row, col);
  if (!target) return null;

  const newTiles = tiles.map((t) => {
    if (t === target) return { ...t, row: emptyTile.row, col: emptyTile.col };
    if (t === emptyTile) return { ...t, row, col };
    return t;
  });

  const solved = isSolved(newTiles, gridSize);

  return {
    ...state,
    tiles: newTiles,
    moves: state.moves + 1,
    solved,
  };
}

/**
 * Shuffle puzzle by making random valid moves (ensures solvability)
 */
export function shufflePuzzle(gridSize: number, shuffleMoves?: number): PuzzleState {
  const moves = shuffleMoves ?? gridSize * gridSize * 20;
  let state = createSolvedPuzzle(gridSize);

  const dirs = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
  ];

  for (let i = 0; i < moves; i++) {
    const empty = state.tiles[state.emptyIndex];
    const dir = dirs[Math.floor(Math.random() * 4)];
    const nr = empty.row + dir[0];
    const nc = empty.col + dir[1];
    if (nr >= 0 && nr < gridSize && nc >= 0 && nc < gridSize) {
      const next = moveTile(state, nr, nc);
      if (next) state = next;
    }
  }

  // Reset counters after shuffle
  state.moves = 0;
  state.startTime = Date.now();
  state.solved = false;
  return state;
}
