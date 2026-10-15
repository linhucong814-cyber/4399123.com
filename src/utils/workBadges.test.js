import { describe, expect, it } from "vitest";
import { isHotWork, isNewWork, workBadge } from "./workBadges";

const now = Date.parse("2026-10-15T12:00:00Z");
describe("work badges from real data", () => {
  it("NEW only within 7 days", () => {
    expect(isNewWork({ publishedAt: "2026-10-10T12:00:00Z" }, now)).toBe(true);
    expect(isNewWork({ publishedAt: "2026-10-01T12:00:00Z" }, now)).toBe(false);
    expect(isNewWork({}, now)).toBe(false);
  });
  it("HOT only past a real threshold, and wins over NEW", () => {
    expect(isHotWork({ stats: { views: 299 } })).toBe(false);
    expect(isHotWork({ stats: { favorites: 10 } })).toBe(true);
    expect(workBadge({ stats: { likes: 20 }, publishedAt: "2026-10-14T00:00:00Z" }, now)).toBe("HOT");
    expect(workBadge({ stats: {} , publishedAt: "2026-10-14T00:00:00Z" }, now)).toBe("NEW");
  });
});
