// "我玩过的" — recently viewed works, stored only in this browser.
export const RECENT_WORKS_KEY = "4399123.works.recent";
const MAX_RECENT = 12;

export function getRecentWorks() {
  try {
    const items = JSON.parse(window.localStorage.getItem(RECENT_WORKS_KEY) || "[]");
    return Array.isArray(items) ? items.filter((item) => item && item.slug && item.title).slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

export function addRecentWork(work) {
  if (!work?.slug) return getRecentWorks();
  const entry = { slug: work.slug, title: work.title, coverUrl: work.coverUrl || "", category: work.category || "other" };
  const next = [entry, ...getRecentWorks().filter((item) => item.slug !== work.slug)].slice(0, MAX_RECENT);
  try {
    window.localStorage.setItem(RECENT_WORKS_KEY, JSON.stringify(next));
  } catch {
    // Storage may be unavailable (private mode); the strip just stays empty.
  }
  return next;
}

export function clearRecentWorks() {
  try {
    window.localStorage.removeItem(RECENT_WORKS_KEY);
  } catch {
    // ignore
  }
  return [];
}
