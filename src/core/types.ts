export type Difficulty = '3x3' | '4x4' | '5x5';

export const GRID_SIZES: Record<Difficulty, number> = {
  '3x3': 3,
  '4x4': 4,
  '5x5': 5,
};

export interface Tile {
  /** Index in solved order (0-based). Last tile = empty */
  id: number;
  /** Current row position */
  row: number;
  /** Current col position */
  col: number;
}

export interface PuzzleState {
  tiles: Tile[];
  gridSize: number;
  emptyIndex: number; // index in tiles array of the empty slot
  moves: number;
  startTime: number;
  solved: boolean;
}

export interface HistoryEntry {
  imageUri: string;
  difficulty: Difficulty;
  moves: number;
  timeMs: number;
  date: number;
}
