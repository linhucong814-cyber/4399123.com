// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { addRecentWork, clearRecentWorks, getRecentWorks, RECENT_WORKS_KEY } from "./recentWorks";

beforeEach(() => window.localStorage.clear());

describe("我玩过的 storage", () => {
  it("adds most-recent first, de-duplicates and caps at 12", () => {
    for (let i = 0; i < 14; i += 1) addRecentWork({ slug: `s${i}`, title: `t${i}` });
    addRecentWork({ slug: "s5", title: "t5" });
    const items = getRecentWorks();
    expect(items).toHaveLength(12);
    expect(items[0].slug).toBe("s5");
    expect(items.filter((item) => item.slug === "s5")).toHaveLength(1);
  });

  it("survives corrupt storage and clears", () => {
    window.localStorage.setItem(RECENT_WORKS_KEY, "{not json");
    expect(getRecentWorks()).toEqual([]);
    addRecentWork({ slug: "a", title: "A" });
    expect(clearRecentWorks()).toEqual([]);
    expect(getRecentWorks()).toEqual([]);
  });
});
