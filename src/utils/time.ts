export const formatTime = (ms: number | null): string => {
  if (ms === null) return '-';
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
};
