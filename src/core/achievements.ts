// Puzzle achievements. Pure logic, no React.
import { Difficulty, HistoryEntry } from './types';

export interface Achievement {
  id: string;
  name: string;
  icon: string;
  description: string;
  check: (history: HistoryEntry[], bestTimes: Record<Difficulty, number | null>) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_solve', name: 'First Solve', icon: '🧩', description: 'Selesaikan puzzle pertama', check: (h) => h.length >= 1 },
  { id: 'solve_5', name: 'Puzzle Lover', icon: '❤️', description: 'Selesaikan 5 puzzle', check: (h) => h.length >= 5 },
  { id: 'solve_20', name: 'Puzzle Master', icon: '🏆', description: 'Selesaikan 20 puzzle', check: (h) => h.length >= 20 },
  { id: 'solve_50', name: 'Puzzle Legend', icon: '👑', description: 'Selesaikan 50 puzzle', check: (h) => h.length >= 50 },
  { id: 'speed_3x3', name: 'Speed Demon 3×3', icon: '⚡', description: 'Selesaikan 3×3 dalam < 30 detik', check: (_, b) => (b['3x3'] ?? Infinity) < 30000 },
  { id: 'speed_4x4', name: 'Speed Demon 4×4', icon: '💨', description: 'Selesaikan 4×4 dalam < 1 menit', check: (_, b) => (b['4x4'] ?? Infinity) < 60000 },
  { id: 'speed_5x5', name: 'Speed Demon 5×5', icon: '🔥', description: 'Selesaikan 5×5 dalam < 2 menit', check: (_, b) => (b['5x5'] ?? Infinity) < 120000 },
  { id: 'try_6x6', name: 'Expert Mode', icon: '🎯', description: 'Selesaikan puzzle 6×6', check: (h) => h.some((e) => e.difficulty === '6x6') },
  { id: 'try_7x7', name: 'Insane Mode', icon: '🤯', description: 'Selesaikan puzzle 7×7', check: (h) => h.some((e) => e.difficulty === '7x7') },
  { id: 'all_3star', name: 'Perfect Run', icon: '⭐', description: 'Dapatkan 3 bintang di semua difficulty', check: (_, b) => {
    return (b['3x3'] ?? Infinity) < 30000 && (b['4x4'] ?? Infinity) < 60000 && (b['5x5'] ?? Infinity) < 120000;
  }},
  { id: 'min_moves_3x3', name: 'Efficient 3×3', icon: '🧠', description: 'Selesaikan 3×3 dalam < 15 langkah', check: (h) => h.some((e) => e.difficulty === '3x3' && e.moves < 15) },
  { id: 'min_moves_4x4', name: 'Efficient 4×4', icon: '🎓', description: 'Selesaikan 4×4 dalam < 60 langkah', check: (h) => h.some((e) => e.difficulty === '4x4' && e.moves < 60) },
];

export function checkUnlocked(
  history: HistoryEntry[],
  bestTimes: Record<Difficulty, number | null>,
  alreadyUnlocked: string[]
): Achievement[] {
  return ACHIEVEMENTS.filter(
    (a) => !alreadyUnlocked.includes(a.id) && a.check(history, bestTimes)
  );
}
