import { describe, expect, it } from "vitest";
import { communityHomeUrl, normalizeCommunityHomeUrl } from "./communityHomeRoute";

describe("community homepage routes", () => {
  it.each(["vibe-coding", "share-discovery", "lounge", "unknown"])("unifies old %s links without losing inbox, sort, or anchor", (channel) => {
    expect(normalizeCommunityHomeUrl(`https://4399123.com/community/?channel=${channel}&feed=following&sort=hot&inbox=1#main-content`))
      .toBe("/community/?sort=hot&inbox=1#main-content");
  });

  it("keeps post detail routes and unrelated parameters", () => {
    expect(normalizeCommunityHomeUrl("https://4399123.com/community/posts/17?channel=lounge&reply=3"))
      .toBe("/community/posts/17?reply=3");
  });

  it.each(["latest", "invalid"])("falls back from %s to the default sort", (sort) => {
    expect(normalizeCommunityHomeUrl(`https://4399123.com/community?sort=${sort}`)).toBe("/community");
    expect(communityHomeUrl(sort)).toBe("/community");
  });

  it.each(["active", "hot"])("preserves %s sorting in homepage links", (sort) => {
    expect(communityHomeUrl(sort)).toBe(`/community?sort=${sort}`);
  });
});
