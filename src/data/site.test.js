import { describe, expect, it } from "vitest";
import { navigationItems } from "./site";

describe("works nav entry", () => {
  it("has exactly one works entry pointing to the canonical /works", () => {
    const works = navigationItems.filter((item) => ["作品", "作品广场"].includes(item.label));
    expect(works).toHaveLength(1);
    expect(works[0].href).toBe("/works");
    expect(navigationItems.some((item) => item.href === "/vibe-coding")).toBe(false);
  });
});
