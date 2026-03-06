// Study days at which new questions unlock, defining level boundaries
export const LEVEL_THRESHOLDS = [1, 3, 5, 7, 9, 11];

export const MAX_LEVEL = LEVEL_THRESHOLDS.length;

export function getLevelForDay(day) {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (day >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
    }
  }
  return level;
}

export function getNextLevelDay(day) {
  for (const threshold of LEVEL_THRESHOLDS) {
    if (threshold > day) return threshold;
  }
  return null; // already at max level
}

export function getDaysInCurrentLevel(day) {
  const level = getLevelForDay(day);
  const levelStart = LEVEL_THRESHOLDS[level - 1];
  const levelEnd = level < MAX_LEVEL ? LEVEL_THRESHOLDS[level] : null;
  if (levelEnd === null) return { current: 1, total: 1, fraction: 1 };
  const total = levelEnd - levelStart;
  const current = day - levelStart;
  return { current, total, fraction: current / total };
}

export function getOverallProgress(day) {
  const maxDay = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  if (day >= maxDay) return 1;
  return (day - 1) / (maxDay - 1);
}
