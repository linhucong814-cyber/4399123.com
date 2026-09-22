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
    throw new Error(data.error || "请求失败");
  }
  return data;
}

export function getVibeCodingProjects() {
  return request("/api/vibe-coding/projects");
}

export function getApprovedVibeCodingSubmissions() {
  return request("/api/vibe-coding/submissions");
}

export function getMyVibeCodingSubmissions() {
  return request("/api/vibe-coding/my-submissions");
}

export function createVibeCodingSubmission(payload) {
  return request("/api/vibe-coding/submissions", {
    method: "POST",
    body: payload,
  });
}

export function getAdminVibeCodingSubmissions(status = "pending") {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  return request(`/api/admin/vibe-coding/submissions?${params.toString()}`);
}

export function reviewVibeCodingSubmission(id, payload) {
  return request(`/api/admin/vibe-coding/submissions/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteVibeCodingSubmission(id) {
  return request(`/api/admin/vibe-coding/submissions/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export function getPromptLibraryItems({ q = "", category = "" } = {}) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (category) params.set("category", category);
  const query = params.toString();
  return request(`/api/vibe-coding/prompt-library/items${query ? `?${query}` : ""}`);
}

export function getPromptLibraryItem(id) {
  return request(`/api/vibe-coding/prompt-library/items/${encodeURIComponent(id)}`);
}

export function copyPromptLibraryItem(id) {
  return request(`/api/vibe-coding/prompt-library/items/${encodeURIComponent(id)}/copy`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function createPromptLibraryItem(payload) {
  return request("/api/vibe-coding/prompt-library/items", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updatePromptLibraryItem(id, payload) {
  return request(`/api/vibe-coding/prompt-library/items/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function uploadPromptLibraryImage(id, file, caption = "") {
  const body = new FormData();
  body.append("image", file);
  if (caption) body.append("caption", caption);
  return request(`/api/vibe-coding/prompt-library/items/${encodeURIComponent(id)}/images`, {
    method: "POST",
    body,
  });
}

export function deletePromptLibraryImage(id) {
  return request(`/api/vibe-coding/prompt-library/images/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export function likePromptLibraryItem(id) {
  return request(`/api/vibe-coding/prompt-library/items/${encodeURIComponent(id)}/like`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function getPromptLibraryComments(id) {
  return request(`/api/vibe-coding/prompt-library/items/${encodeURIComponent(id)}/comments`);
}

export function createPromptLibraryComment(id, body) {
  return request(`/api/vibe-coding/prompt-library/items/${encodeURIComponent(id)}/comments`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
}

export function deletePromptLibraryComment(id) {
  return request(`/api/vibe-coding/prompt-library/comments/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export function getMyPromptLibraryItems() {
  return request("/api/vibe-coding/prompt-library/mine");
}

export function getAdminPromptLibraryItems(status = "pending") {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  return request(`/api/admin/vibe-coding/prompt-library?${params.toString()}`);
}

export function reviewPromptLibraryItem(id, payload) {
  return request(`/api/admin/vibe-coding/prompt-library/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
