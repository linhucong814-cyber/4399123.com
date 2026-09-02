const apiBase = (import.meta.env.VITE_AUTH_API_BASE || "").replace(/\/$/, "");

function readCookie(name) {
  return document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`))
    ?.slice(name.length + 1) || "";
}

export async function getCsrfToken() {
  const existing = readCookie("csrftoken");
  if (existing) return decodeURIComponent(existing);

  const response = await fetch(`${apiBase}/api/auth/csrf`, {
    credentials: "include",
    cache: "no-store",
  });
  if (!response.ok) return "";
  const data = await response.json().catch(() => ({}));
  return data.csrfToken || decodeURIComponent(readCookie("csrftoken") || "");
}

export function isUnsafeMethod(method = "GET") {
  return !["GET", "HEAD", "OPTIONS", "TRACE"].includes(String(method).toUpperCase());
}
