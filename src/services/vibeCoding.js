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
