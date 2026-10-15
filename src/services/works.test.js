import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./csrf", () => ({
  getCsrfToken: vi.fn(async () => "csrf-test-token"),
  isUnsafeMethod: (method) => !["GET", "HEAD", "OPTIONS", undefined].includes(method),
}));

import { buildWorksQuery, getWorksBatch, getWorksPortal, getWorks, previewUrl, setWorkFavorite, setWorkLike } from "./works";

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: { "Content-Type": "application/json" } });
}

describe("works API client", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("builds compact query strings and omits defaults", () => {
    expect(buildWorksQuery({ sort: "newest", page: 1 })).toBe("");
    expect(buildWorksQuery({ category: "game", tag: "Vue", q: "蛇", sort: "popular", page: 2 })).toBe(
      "category=game&tag=Vue&q=%E8%9B%87&sort=popular&page=2",
    );
  });

  it("requests the list with filters and forwards abort signals", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({ ok: true, works: [] }));
    const controller = new AbortController();
    await getWorks({ category: "ai-app", sort: "likes" }, { signal: controller.signal });
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/works?category=ai-app&sort=likes");
    expect(options.signal).toBe(controller.signal);
    expect(options.credentials).toBe("include");
  });

  it("uses idempotent PUT/DELETE with CSRF for like and favorite", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({ ok: true, liked: true, count: 1 }));
    await setWorkLike("demo-a", true);
    await setWorkFavorite("demo-a", false);
    expect(fetchMock.mock.calls[0][0]).toBe("/api/works/demo-a/like");
    expect(fetchMock.mock.calls[0][1].method).toBe("PUT");
    expect(fetchMock.mock.calls[0][1].headers["X-CSRFToken"]).toBe("csrf-test-token");
    expect(fetchMock.mock.calls[1][1].method).toBe("DELETE");
  });

  it("exposes status codes on errors", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({ error: "请先登录。", code: "unauthenticated" }, 401));
    await expect(setWorkLike("x", true)).rejects.toMatchObject({ status: 401, code: "unauthenticated", message: "请先登录。" });
  });

  it("only previews http(s) or same-site relative URLs", () => {
    expect(previewUrl({ projectUrl: "/vibecpu/" })).toBe("/vibecpu/");
    expect(previewUrl({ projectUrl: "https://example.com/a" })).toBe("https://example.com/a");
    expect(previewUrl({ projectUrl: "javascript:alert(1)" })).toBe("");
    expect(previewUrl({ projectUrl: "//evil.example" })).toBe("");
  });
});

describe("portal and batch helpers", () => {
  it("getWorksPortal hits /api/works/portal", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true, popular: [], featured: [] }) });
    await getWorksPortal();
    expect(String(global.fetch.mock.calls[0][0])).toContain("/api/works/portal");
  });

  it("getWorksBatch joins slugs and returns empty for no input", async () => {
    expect(await getWorksBatch([])).toEqual({ ok: true, works: [] });
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true, works: [] }) });
    await getWorksBatch(["a", "b", "a"]);
    expect(String(global.fetch.mock.calls[0][0])).toContain("slugs=a%2Cb");
  });
});
