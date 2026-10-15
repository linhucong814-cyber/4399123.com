// Badges come from real data only: NEW = published within NEW_WITHIN_DAYS,
// HOT = real interaction counts crossing at least one popularity threshold.
export const NEW_WITHIN_DAYS = 7;
export const HOT_THRESHOLDS = { views: 300, likes: 20, favorites: 10 };

export function isNewWork(work, now = Date.now()) {
  const published = Date.parse(work?.publishedAt || "");
  return Number.isFinite(published) && now - published >= 0 && now - published < NEW_WITHIN_DAYS * 86400000;
}

export function isHotWork(work) {
  const stats = work?.stats || {};
  return Object.entries(HOT_THRESHOLDS).some(([key, min]) => Number(stats[key] || 0) >= min);
}

export function hasInteractions(work) {
  const stats = work?.stats || {};
  return Number(stats.views || 0) + Number(stats.likes || 0) + Number(stats.favorites || 0) > 0;
}

export function workBadge(work, now = Date.now()) {
  if (isHotWork(work)) return "HOT";
  if (isNewWork(work, now)) return "NEW";
  return "";
}
