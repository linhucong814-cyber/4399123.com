const apiBase = (import.meta.env.VITE_AUTH_API_BASE || "").replace(/\/$/, "");
const LOCAL_RECORD_KEY = "star-messenger-local-records";
let fallbackAnonymousId = "";
let memoryRecords = [];

async function request(path, options = {}) {
  const response = await fetch(`${apiBase}${path}`, {
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

function readLocalRecords() {
  try {
    const records = JSON.parse(window.localStorage.getItem(LOCAL_RECORD_KEY) || "[]");
    if (Array.isArray(records) && records.length) return records;
    return memoryRecords;
  } catch {
    return memoryRecords;
  }
}

function writeLocalRecord(record) {
  const records = readLocalRecords();
  const nextRecords = [
    {
      ...record,
      id: `local-${Date.now()}`,
      source: "local",
      createdAt: new Date().toISOString(),
    },
    ...records,
  ].slice(0, 80);
  memoryRecords = nextRecords;
  try {
    window.localStorage.setItem(LOCAL_RECORD_KEY, JSON.stringify(nextRecords));
  } catch {
    // Keep a same-session fallback when localStorage is disabled or full.
  }
  return nextRecords[0];
}

export function getAnonymousGameId() {
  const key = "star-messenger-anonymous-id";
  try {
    const current = window.localStorage.getItem(key);
    if (current) return current;
  } catch {
    if (fallbackAnonymousId) return fallbackAnonymousId;
  }

  const next = window.crypto?.randomUUID?.() || `anon-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  fallbackAnonymousId = next;
  try {
    window.localStorage.setItem(key, next);
  } catch {
    // Anonymous play still works for the current session.
  }
  return next;
}

export async function submitStarMessengerResult(payload) {
  try {
    const data = await request("/api/games/star-messenger/results", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return { ...data, storedLocally: false };
  } catch (error) {
    const localRecord = writeLocalRecord(payload);
    return {
      record: localRecord,
      storedLocally: true,
      warning: error.message || "后端暂不可用，已保存到本地。",
    };
  }
}

export async function getStarMessengerRecords(filters = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, value);
    }
  }

  const suffix = params.toString() ? `?${params.toString()}` : "";
  try {
    return await request(`/api/admin/games/star-messenger/results${suffix}`);
  } catch (error) {
    const page = Number(filters.page || 1);
    const pageSize = Number(filters.pageSize || 20);
    const records = readLocalRecords();
    const start = (page - 1) * pageSize;
    return {
      records: records.slice(start, start + pageSize),
      page,
      pageSize,
      total: records.length,
      localFallback: true,
      warning: "后端暂不可用，正在显示本地调试记录。",
    };
  }
}
