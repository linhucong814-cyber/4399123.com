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
    throw error;
  }
  return data;
}

export function getBlogPosts() {
  return request("/api/blog/posts");
}

export function getBlogComments(post) {
  return request(`/api/blog/comments?post=${encodeURIComponent(post)}`);
}

export function createBlogComment(post, body) {
  return request("/api/blog/comments", {
    method: "POST",
    body: JSON.stringify({ post, body }),
  });
}
