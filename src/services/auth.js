const authApiBase = (import.meta.env.VITE_AUTH_API_BASE || "").replace(/\/$/, "");

async function request(path, options = {}) {
  const response = await fetch(`${authApiBase}${path}`, {
    credentials: "include",
    headers: {
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

export function getCurrentUser() {
  return request("/api/auth/me");
}

export function getAdminUsers() {
  return request("/api/admin/users");
}
