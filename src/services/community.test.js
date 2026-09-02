import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./csrf", () => ({
  getCsrfToken: vi.fn(async () => "csrf-test-token"),
  isUnsafeMethod: (method) => !["GET", "HEAD", "OPTIONS", undefined].includes(method),
}));

import {
  getCommunityPosts,
  toggleCommunityPostLike,
  toggleCommunityPostReaction,
} from "./community";

function jsonResponse(payload, init = {}) {
  return new Response(JSON.stringify(payload), {
    status: init.status || 200,
    headers: { "Content-Type": "application/json" },
  });
}

describe("community API client", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("passes filters, cursor, page size and abort signal to the feed request", async () => {
    const controller = new AbortController();
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({ ok: true, posts: [] }));

    await getCommunityPosts("ai-tools", "active", "following", {
      cursor: "cursor-token",
      limit: 20,
      signal: controller.signal,
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain("/api/community/posts?");
    expect(url).toContain("channel=ai-tools");
    expect(url).toContain("sort=active");
    expect(url).toContain("feed=following");
    expect(url).toContain("cursor=cursor-token");
    expect(url).toContain("limit=20");
    expect(options.signal).toBe(controller.signal);
  });

  it("uses idempotent PUT and DELETE methods for post likes", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({ ok: true, liked: true }));

    await toggleCommunityPostLike(42, true);
    await toggleCommunityPostLike(42, false);

    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      method: "PUT",
      credentials: "include",
    });
    expect(fetchMock.mock.calls[1][1]).toMatchObject({
      method: "DELETE",
      credentials: "include",
    });
    expect(fetchMock.mock.calls[0][1].headers["X-CSRFToken"]).toBe("csrf-test-token");
  });

  it("sends the emoji for idempotent reaction removal", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({ ok: true, active: false }));

    await toggleCommunityPostReaction(7, "🎉", false);

    expect(fetchMock.mock.calls[0][1].method).toBe("DELETE");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ emoji: "🎉" });
  });

  it("preserves structured API error status and code", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({ ok: false, code: "invalid_cursor", error: "游标无效" }, { status: 400 }),
    );

    await expect(getCommunityPosts("all", "latest", "recommended", { cursor: "bad" })).rejects.toMatchObject({
      message: "游标无效",
      status: 400,
      code: "invalid_cursor",
    });
  });
});
