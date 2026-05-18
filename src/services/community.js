const apiBase = (import.meta.env.VITE_AUTH_API_BASE || "").replace(/\/$/, "");

async function request(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const response = await fetch(`${apiBase}${path}`, {
    credentials: "include",
    headers: isFormData
      ? { ...(options.headers || {}) }
      : {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
    ...options,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "请求失败");
  }
  return data;
}

export function getCommunityPosts(channel = "all") {
  const params = new URLSearchParams();
  if (channel && channel !== "all") params.set("channel", channel);
  const suffix = params.toString() ? `?${params.toString()}` : "";
  return request(`/api/community/posts${suffix}`);
}

export function getCommunityPost(id) {
  return request(`/api/community/posts/${encodeURIComponent(id)}`);
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
  return request(`/api/community/posts/${encodeURIComponent(postId)}/replies`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function toggleCommunityPostLike(postId) {
  return request(`/api/community/posts/${encodeURIComponent(postId)}/like`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function toggleCommunityPostReaction(postId, emoji) {
  return request(`/api/community/posts/${encodeURIComponent(postId)}/reaction`, {
    method: "POST",
    body: JSON.stringify({ emoji }),
  });
}

export function toggleCommunityReplyLike(replyId) {
  return request(`/api/community/replies/${encodeURIComponent(replyId)}/like`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function toggleCommunityReplyReaction(replyId, emoji) {
  return request(`/api/community/replies/${encodeURIComponent(replyId)}/reaction`, {
    method: "POST",
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
