import { getCsrfToken, isUnsafeMethod } from "./csrf";

const apiBase = (import.meta.env.VITE_AUTH_API_BASE || "").replace(/\/$/, "");

async function request(path, options = {}) {
  const csrfToken = isUnsafeMethod(options.method) ? await getCsrfToken() : "";
  const response = await fetch(`${apiBase}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(csrfToken ? { "X-CSRFToken": csrfToken } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || "请求失败");
    error.status = response.status;
    error.code = data.code || "";
    throw error;
  }
  return data;
}

export function buildWorksQuery({ category = "", tag = "", q = "", sort = "", page = 1, pageSize = 0, featured = false } = {}) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (tag) params.set("tag", tag);
  if (q) params.set("q", q);
  if (sort && sort !== "newest") params.set("sort", sort);
  if (page > 1) params.set("page", String(page));
  if (pageSize) params.set("pageSize", String(pageSize));
  if (featured) params.set("featured", "1");
  return params.toString();
}

export function getWorks(filters = {}, { signal } = {}) {
  const query = buildWorksQuery(filters);
  return request(`/api/works${query ? `?${query}` : ""}`, { signal });
}

/** Categories, sorts and tag facets; tag counts follow category/search filters. */
export function getWorksMeta({ category = "", q = "" } = {}, { signal } = {}) {
  const query = buildWorksQuery({ category, q });
  return request(`/api/works/meta${query ? `?${query}` : ""}`, { signal });
}

/** Portal chrome in one round-trip: meta + popular + featured. 「我玩过的」 stays local. */
export function getWorksPortal({ signal } = {}) {
  return request("/api/works/portal", { signal });
}

/** Refresh titles/covers for localStorage 「我玩过的」 entries; drops hidden works. */
export function getWorksBatch(slugs = [], { signal } = {}) {
  const cleaned = [...new Set(slugs.filter(Boolean))].slice(0, 24);
  if (!cleaned.length) return Promise.resolve({ ok: true, works: [] });
  const params = new URLSearchParams();
  params.set("slugs", cleaned.join(","));
  return request(`/api/works/batch?${params}`, { signal });
}

export function getWork(slug) {
  return request(`/api/works/${encodeURIComponent(slug)}`);
}

export function updateWork(slug, payload) {
  return request(`/api/works/${encodeURIComponent(slug)}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export function recordWorkView(slug) {
  return request(`/api/works/${encodeURIComponent(slug)}/view`, { method: "POST" });
}

export function setWorkLike(slug, liked) {
  return request(`/api/works/${encodeURIComponent(slug)}/like`, { method: liked ? "PUT" : "DELETE" });
}

export function setWorkFavorite(slug, favorited) {
  return request(`/api/works/${encodeURIComponent(slug)}/favorite`, { method: favorited ? "PUT" : "DELETE" });
}

export function getMyWorks() {
  return request("/api/works/mine");
}

export function getMyFavoriteWorks() {
  return request("/api/works/favorites");
}

export function workUrl(work) {
  return `/works/${encodeURIComponent(work.slug)}`;
}

/** Same-origin relative links (official projects) are safe to embed; external ones are sandboxed. */
export function previewUrl(work) {
  const url = String(work?.projectUrl || "");
  if (url.startsWith("/") && !url.startsWith("//")) return url;
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol) ? parsed.toString() : "";
  } catch {
    return "";
  }
}

// ---- Phase 2 ----
const slugPath = (slug) => `/api/works/${encodeURIComponent(slug)}`;

export function getWorkComments(slug) {
  return request(`${slugPath(slug)}/comments`);
}

export function postWorkComment(slug, body, parentId = null) {
  return request(`${slugPath(slug)}/comments`, { method: "POST", body: JSON.stringify(parentId ? { body, parentId } : { body }) });
}

export function deleteWorkComment(commentId) {
  return request(`/api/works/comments/${encodeURIComponent(commentId)}`, { method: "DELETE" });
}

export function getWorkPosts(slug) {
  return request(`${slugPath(slug)}/posts`);
}

export function getWeeklyHotWorks({ days = 7, limit = 8 } = {}) {
  return request(`/api/works/hot?days=${days}&limit=${limit}`);
}

export function adminUpdateWork(slug, payload) {
  return request(`${slugPath(slug)}/admin`, { method: "PATCH", body: JSON.stringify(payload) });
}

export function getUserWorks(userId) {
  return request(`/api/works/users/${encodeURIComponent(userId)}`);
}

export function getUserFavoriteWorks(userId) {
  return request(`/api/works/users/${encodeURIComponent(userId)}/favorites`);
}
