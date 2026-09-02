import { getCsrfToken, isUnsafeMethod } from "./csrf";

const authApiBase = (import.meta.env.VITE_AUTH_API_BASE || "").replace(/\/$/, "");

function buildError(response, data) {
  const error = new Error(data.error || "请求失败");
  error.status = response.status;
  error.code = data.code || "request_failed";
  error.details = data;
  error.retryAfterSeconds =
    Number(data.retryAfterSeconds || response.headers.get("Retry-After") || 0) || 0;
  return error;
}

function handleAuthRedirect(error) {
  if (error.status === 401 && error.code === "unauthenticated") {
    const next = window.location.pathname + window.location.search;
    window.location.href = `/login?next=${encodeURIComponent(next)}`;
    return;
  }
  if (error.status === 403 && error.code === "email_verification_required") {
    window.location.href = "/verify-email";
  }
}

async function request(path, options = {}) {
  const csrfToken = isUnsafeMethod(options.method) ? await getCsrfToken() : "";
  const response = await fetch(`${authApiBase}${path}`, {
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
    const error = buildError(response, data);
    handleAuthRedirect(error);
    throw error;
  }
  return data;
}

export function sendRegisterCode(email) {
  return request("/api/auth/register/send-code", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function registerUser(payload) {
  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function loginUser(payload) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function logoutUser() {
  return request("/api/auth/logout", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function verifyEmail(token) {
  return request("/api/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

export function resendVerificationEmail(payload) {
  return request("/api/auth/resend-verification", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function requestPasswordReset(email) {
  return request("/api/auth/password-reset/request", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function confirmPasswordReset(payload) {
  return request("/api/auth/password-reset/confirm", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function changePassword(payload) {
  return request("/api/auth/change-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function requestEmailChange(payload) {
  return request("/api/auth/change-email/request", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function confirmEmailChange(payload) {
  return request("/api/auth/change-email/confirm", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getCurrentUser() {
  return request("/api/auth/me");
}

export function getSessions() {
  return request("/api/auth/sessions");
}

export function revokeSession(sessionId) {
  return request("/api/auth/sessions/revoke", {
    method: "POST",
    body: JSON.stringify({ sessionId }),
  });
}

export function revokeOtherSessions() {
  return request("/api/auth/sessions/revoke-others", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function updateProfile(payload) {
  return request("/api/auth/profile", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function uploadAvatar(file) {
  const csrfToken = await getCsrfToken();
  const formData = new FormData();
  formData.append("avatar", file);
  const response = await fetch(`${authApiBase}/api/auth/avatar`, {
    method: "POST",
    credentials: "include",
    headers: {
      ...(csrfToken ? { "X-CSRFToken": csrfToken } : {}),
    },
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = buildError(response, data);
    handleAuthRedirect(error);
    throw error;
  }
  return data;
}

function toQuery(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") search.append(key, value);
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export function getAdminUsers(params = {}) {
  return request(`/api/admin/users${toQuery(params)}`);
}

export function banUser(userId, reason = "") {
  return request(`/api/admin/users/${encodeURIComponent(userId)}/ban`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

export function unbanUser(userId, reason = "") {
  return request(`/api/admin/users/${encodeURIComponent(userId)}/unban`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

export function getAdminStats() {
  return request("/api/admin/stats");
}

export function getAdminAuditLog(params = {}) {
  return request(`/api/admin/audit-log${toQuery(params)}`);
}

export function getAdminCommunityPosts(params = {}) {
  return request(`/api/admin/content/community-posts${toQuery(params)}`);
}

export function moderateCommunityPost(postId, action, reason = "") {
  return request(`/api/admin/content/community-posts/${encodeURIComponent(postId)}/moderate`, {
    method: "POST",
    body: JSON.stringify({ action, reason }),
  });
}
