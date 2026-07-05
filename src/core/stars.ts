import { Difficulty } from './types';

/** Target times in seconds for 1/2/3 stars */
const TARGETS: Record<Difficulty, [number, number, number]> = {
  '3x3': [120, 60, 30],   // 3 stars < 30s, 2 stars < 60s, 1 star < 120s
  '4x4': [300, 150, 60],  // 3 stars < 60s, 2 stars < 150s, 1 star < 300s
  '5x5': [600, 300, 120], // 3 stars < 120s, 2 stars < 300s, 1 star < 600s
  '6x6': [900, 450, 180], // 3 stars < 3min, 2 stars < 7.5min, 1 star < 15min
  '7x7': [1200, 600, 240], // 3 stars < 4min, 2 stars < 10min, 1 star < 20min
};

export function getStars(difficulty: Difficulty, timeMs: number): number {
  const s = timeMs / 1000;
  const [one, two, three] = TARGETS[difficulty];
  if (s <= three) return 3;
  if (s <= two) return 2;
  if (s <= one) return 1;
  return 0;
}

export function getTargetTime(difficulty: Difficulty, stars: number): number {
  const targets = TARGETS[difficulty];
  if (stars >= 3) return targets[2];
  if (stars >= 2) return targets[1];
  return targets[0];
}
