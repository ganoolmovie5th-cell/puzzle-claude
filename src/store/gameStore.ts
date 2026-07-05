import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Difficulty, GRID_SIZES, HistoryEntry, PuzzleState } from '../core/types';
import { shufflePuzzle, moveTile } from '../core/puzzle';
import { checkUnlocked } from '../core/achievements';

type ThemeMode = 'dark' | 'light';

interface GameStore {
  // Current game
  puzzle: PuzzleState | null;
  difficulty: Difficulty;
  imageUri: string | null;
  tileUris: string[];

  // Settings
  themeMode: ThemeMode;
  showNumbers: boolean;

  // History
  history: HistoryEntry[];
  bestTimes: Record<Difficulty, number | null>;

  // Achievements
  unlockedAchievements: string[];
  newAchievement: string | null;

  // Actions
  setDifficulty: (d: Difficulty) => void;
  startGame: (imageUri: string, tileUris: string[]) => void;
  tap: (row: number, col: number) => boolean;
  reset: () => void;
  addHistory: (entry: HistoryEntry) => void;
  toggleTheme: () => void;
  toggleNumbers: () => void;
  dismissAchievement: () => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      puzzle: null,
      difficulty: '3x3',
      imageUri: null,
      tileUris: [],
      themeMode: 'dark',
      showNumbers: false,
      history: [],
      bestTimes: { '3x3': null, '4x4': null, '5x5': null, '6x6': null, '7x7': null },
      unlockedAchievements: [],
      newAchievement: null,

      setDifficulty: (d) => set({ difficulty: d }),

      startGame: (imageUri, tileUris) => {
        const gridSize = GRID_SIZES[get().difficulty];
        const puzzle = shufflePuzzle(gridSize);
        set({ puzzle, imageUri, tileUris });
      },

      tap: (row, col) => {
        const { puzzle } = get();
        if (!puzzle || puzzle.solved) return false;
        const next = moveTile(puzzle, row, col);
        if (!next) return false;

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
        return true;
      },

      reset: () => {
        const gridSize = GRID_SIZES[get().difficulty];
        const puzzle = shufflePuzzle(gridSize);
        set({ puzzle });
      },

      addHistory: (entry) => {
        const { history, bestTimes, unlockedAchievements } = get();
        const newHistory = [entry, ...history].slice(0, 50);
        const current = bestTimes[entry.difficulty];
        const newBest =
          current === null || entry.timeMs < current ? entry.timeMs : current;
        const updatedBest = { ...bestTimes, [entry.difficulty]: newBest };
        // Check new achievements
        const newAchs = checkUnlocked(newHistory, updatedBest, unlockedAchievements);
        const unlocked = [...unlockedAchievements, ...newAchs.map((a) => a.id)];
        set({
          history: newHistory,
          bestTimes: updatedBest,
          unlockedAchievements: unlocked,
          newAchievement: newAchs.length > 0 ? newAchs[0].id : null,
        });
      },

      toggleTheme: () => {
        set((s) => ({ themeMode: s.themeMode === 'dark' ? 'light' : 'dark' }));
      },

      toggleNumbers: () => {
        set((s) => ({ showNumbers: !s.showNumbers }));
      },

      dismissAchievement: () => set({ newAchievement: null }),
    }),
    {
      name: 'puzzle-game-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        history: state.history,
        bestTimes: state.bestTimes,
        difficulty: state.difficulty,
        themeMode: state.themeMode,
        showNumbers: state.showNumbers,
        unlockedAchievements: state.unlockedAchievements,
      }),
    }
  )
);
