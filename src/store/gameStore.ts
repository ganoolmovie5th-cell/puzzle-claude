import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Difficulty, GRID_SIZES, HistoryEntry, PuzzleState } from '../core/types';
import { shufflePuzzle, moveTile } from '../core/puzzle';

interface GameStore {
  // Current game
  puzzle: PuzzleState | null;
  difficulty: Difficulty;
  imageUri: string | null;
  tileUris: string[];

  // History
  history: HistoryEntry[];
  bestTimes: Record<Difficulty, number | null>;

  // Actions
  setDifficulty: (d: Difficulty) => void;
  startGame: (imageUri: string, tileUris: string[]) => void;
  tap: (row: number, col: number) => void;
  reset: () => void;
  addHistory: (entry: HistoryEntry) => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      puzzle: null,
      difficulty: '3x3',
      imageUri: null,
      tileUris: [],
      history: [],
      bestTimes: { '3x3': null, '4x4': null, '5x5': null },

      setDifficulty: (d) => set({ difficulty: d }),

      startGame: (imageUri, tileUris) => {
        const gridSize = GRID_SIZES[get().difficulty];
        const puzzle = shufflePuzzle(gridSize);
        set({ puzzle, imageUri, tileUris });
      },

      tap: (row, col) => {
        const { puzzle } = get();
        if (!puzzle || puzzle.solved) return;
        const next = moveTile(puzzle, row, col);
        if (next) {
          set({ puzzle: next });
          if (next.solved) {
            const timeMs = Date.now() - next.startTime;
            const { difficulty, imageUri } = get();
            get().addHistory({
              imageUri: imageUri ?? '',
              difficulty,
              moves: next.moves,
              timeMs,
              date: Date.now(),
            });
          }
        }
      },

      reset: () => {
        const gridSize = GRID_SIZES[get().difficulty];
        const puzzle = shufflePuzzle(gridSize);
        set({ puzzle });
      },

      addHistory: (entry) => {
        const { history, bestTimes } = get();
        const newHistory = [entry, ...history].slice(0, 50);
        const current = bestTimes[entry.difficulty];
        const newBest =
          current === null || entry.timeMs < current ? entry.timeMs : current;
        set({
          history: newHistory,
          bestTimes: { ...bestTimes, [entry.difficulty]: newBest },
        });
      },
    }),
    {
      name: 'puzzle-game-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        history: state.history,
        bestTimes: state.bestTimes,
        difficulty: state.difficulty,
      }),
    }
  )
);
