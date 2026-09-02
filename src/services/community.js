import { getCsrfToken, isUnsafeMethod } from "./csrf";

const apiBase = (import.meta.env.VITE_AUTH_API_BASE || "").replace(/\/$/, "");

async function request(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const csrfToken = isUnsafeMethod(options.method) ? await getCsrfToken() : "";
  const response = await fetch(`${apiBase}${path}`, {
    credentials: "include",
    headers: isFormData
      ? { ...(csrfToken ? { "X-CSRFToken": csrfToken } : {}), ...(options.headers || {}) }
      : {
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
    error.code = data.code || "request_failed";
    error.details = data;
    throw error;
  }
  return data;
}

export function getCommunityPosts(channel = "all", sort = "latest", feed = "recommended", options = {}) {
  const params = new URLSearchParams();
  if (channel && channel !== "all") params.set("channel", channel);
  if (sort && sort !== "latest") params.set("sort", sort);
  if (feed && feed !== "recommended") params.set("feed", feed);
  if (options.cursor) params.set("cursor", options.cursor);
  if (options.limit) params.set("limit", String(options.limit));
  const suffix = params.toString() ? `?${params.toString()}` : "";
  return request(`/api/community/posts${suffix}`, { signal: options.signal });
}

export function getCommunityPost(id, options = {}) {
  return request(`/api/community/posts/${encodeURIComponent(id)}`, { signal: options.signal });
}

export function getCommunityUser(id) {
  return request(`/api/community/users/${encodeURIComponent(id)}`);
}

export function getCommunityUserPosts(id) {
  return request(`/api/community/users/${encodeURIComponent(id)}/posts`);
}

export function getCommunityUserActivity(id) {
  return request(`/api/community/users/${encodeURIComponent(id)}/activity`);
}

export function toggleCommunityUserFollow(id, active) {
  return request(`/api/community/users/${encodeURIComponent(id)}/follow`, {
    method: active ? "PUT" : "DELETE",
    body: JSON.stringify({}),
  });
}

export function getCommunitySocialSummary() {
  return request("/api/community/social-summary");
}

export function getCommunityTopics() {
  return request("/api/community/topics");
}

export function searchCommunityMentionUsers(query = "", options = {}) {
  const params = new URLSearchParams();
  const normalized = String(query || "").trim().replace(/^@+/, "");
  if (normalized) params.set("q", normalized);
  const suffix = params.toString() ? `?${params.toString()}` : "";
  return request(`/api/community/mention-users${suffix}`, { signal: options.signal });
}

export function createCommunityPost(payload) {
  const isFormData = payload instanceof FormData;
  return request("/api/community/posts", {
    method: "POST",
    body: isFormData ? payload : JSON.stringify(payload),
  });
}

export function updateCommunityPost(id, payload) {
  const isFormData = payload instanceof FormData;
  return request(`/api/community/posts/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: isFormData ? payload : JSON.stringify(payload),
  });
}

export function deleteCommunityPost(id) {
  return request(`/api/community/posts/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export function createCommunityReply(postId, payload) {
  const isFormData = payload instanceof FormData;
  return request(`/api/community/posts/${encodeURIComponent(postId)}/replies`, {
    method: "POST",
    body: isFormData ? payload : JSON.stringify(payload),
  });
}

export function updateCommunityReply(replyId, payload) {
  return request(`/api/community/replies/${encodeURIComponent(replyId)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteCommunityReply(replyId) {
  return request(`/api/community/replies/${encodeURIComponent(replyId)}`, {
    method: "DELETE",
  });
}

export function toggleCommunityPostLike(postId, active) {
  return request(`/api/community/posts/${encodeURIComponent(postId)}/like`, {
    method: active ? "PUT" : "DELETE",
    body: JSON.stringify({}),
  });
}

export function toggleCommunityPostBookmark(postId, active) {
  return request(`/api/community/posts/${encodeURIComponent(postId)}/bookmark`, {
    method: active ? "PUT" : "DELETE",
    body: JSON.stringify({}),
  });
}

export function recordCommunityPostShare(postId) {
  return request(`/api/community/posts/${encodeURIComponent(postId)}/share`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function toggleCommunityPostReaction(postId, emoji, active) {
  return request(`/api/community/posts/${encodeURIComponent(postId)}/reaction`, {
    method: active ? "PUT" : "DELETE",
    body: JSON.stringify({ emoji }),
  });
}

export function toggleCommunityReplyLike(replyId, active) {
  return request(`/api/community/replies/${encodeURIComponent(replyId)}/like`, {
    method: active ? "PUT" : "DELETE",
    body: JSON.stringify({}),
  });
}

export function toggleCommunityReplyReaction(replyId, emoji, active) {
  return request(`/api/community/replies/${encodeURIComponent(replyId)}/reaction`, {
    method: active ? "PUT" : "DELETE",
    body: JSON.stringify({ emoji }),
  });
}

export function getCommunityNotifications() {
  return request("/api/community/notifications");
}

export function markCommunityNotificationsRead(id) {
  return request("/api/community/notifications", {
    method: "PATCH",
    body: JSON.stringify(id ? { id } : {}),
  });
}
