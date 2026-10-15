// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import WorksGalleryPage from "./WorksGalleryPage.vue";
import * as works from "../../services/works";
import { RECENT_WORKS_KEY } from "../../utils/recentWorks";

vi.mock("../../services/works", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, getWorks: vi.fn(), getWorksMeta: vi.fn(), getWorksPortal: vi.fn(), getWorksBatch: vi.fn() };
});
vi.mock("../../utils/seo", () => ({ setPageSeo: vi.fn() }));

const work = (id, extra = {}) => ({
  id,
  slug: `work-${id}`,
  title: `作品 ${id}`,
  summary: "简介",
  category: "game",
  tags: ["Vue"],
  coverUrl: `/assets/works/icons/work-${id}.png`,
  author: { id: 1, name: "maker" },
  stats: { views: 3, likes: 2, favorites: 1 },
  publishedAt: "2020-01-01T00:00:00Z",
  ...extra,
});
const many = (n, extra = {}) => Array.from({ length: n }, (_, i) => work(i + 1, extra));

let wrapper;
let portal;
let list;
async function open(path = "/works") {
  window.history.replaceState({}, "", path);
  wrapper = mount(WorksGalleryPage);
  await flushPromises();
}

beforeEach(() => {
  vi.clearAllMocks();
  window.localStorage.clear();
  portal = many(30);
  list = { works: [work(1), work(2)], pagination: { total: 2, hasNext: false } };
  works.getWorksMeta.mockResolvedValue({ tags: [{ name: "Vue", count: 2 }], todayCount: 3 });
  // Read `portal` lazily so tests can reassign it before open().
  works.getWorksPortal.mockImplementation(async () => ({
    popular: portal,
    featured: portal.filter((w) => w.isFeatured),
    todayCount: 3,
  }));
  // Batch refresh echoes the stored entries (all still public).
  works.getWorksBatch.mockImplementation(async (slugs) => ({
    works: JSON.parse(window.localStorage.getItem(RECENT_WORKS_KEY) || "[]").filter((item) => slugs.includes(item.slug)),
  }));
  // The list section requests the filtered page.
  works.getWorks.mockImplementation(async () => list);
});
afterEach(() => wrapper?.unmount());

describe("作品广场（门户风格）", () => {
  it("renders dense category link rows and a hot row, highlighting the hottest works", async () => {
    portal = many(30).map((w, i) => (i === 0 ? { ...w, stats: { views: 999, likes: 0, favorites: 0 } } : w));
    await open();
    const gameRow = wrapper.findAll(".portal-nav-row").find((row) => row.find(".portal-pill").text() === "小游戏");
    expect(gameRow.findAll(".portal-nav-links a")).toHaveLength(12);
    expect(gameRow.find("a.is-hot").exists()).toBe(true);
    expect(wrapper.findAll(".portal-hot-row a")).toHaveLength(14);
  });

  it("pages the icon wall 24 at a time with arrows", async () => {
    await open();
    expect(wrapper.findAll(".portal-icon-wall .work-tile")).toHaveLength(24);
    expect(wrapper.get(".portal-arrow.is-prev").attributes("disabled")).toBeDefined();
    await wrapper.get(".portal-arrow.is-next").trigger("click");
    expect(wrapper.findAll(".portal-icon-wall .work-tile")).toHaveLength(6);
    expect(wrapper.get(".portal-arrow.is-next").attributes("disabled")).toBeDefined();
  });

  it("shows the latest grid with HOT/NEW badges, today counter and detail links", async () => {
    const hot = { stats: { views: 10, likes: 25, favorites: 0 } };
    list = { works: [work(1, hot), work(99, { publishedAt: new Date().toISOString() }), work(98)], pagination: { total: 3 } };
    await open();
    const tiles = wrapper.findAll(".portal-latest-grid .work-tile");
    expect(tiles[0].attributes("href")).toBe("/works/work-1");
    expect(tiles[0].find(".work-tile-badge").text()).toBe("HOT");
    expect(tiles[1].find(".work-tile-badge").text()).toBe("NEW");
    expect(tiles[2].find(".work-tile-badge").exists()).toBe(false);
    expect(wrapper.get(".portal-today").text()).toContain("3");
  });

  it("never invents HOT/NEW from low real stats, and pads empty spots without fake works", async () => {
    portal = [work(1, { stats: { views: 0, likes: 0, favorites: 0 } })];
    list = { works: portal, pagination: { total: 1 } };
    works.getWorksMeta.mockResolvedValue({ tags: [], todayCount: 0 });
    await open();
    expect(wrapper.find(".work-tile-badge:not(.is-inline)").exists()).toBe(false);
    expect(wrapper.find(".portal-nav a.is-hot").exists()).toBe(false);
    expect(wrapper.findAll(".portal-hot-row a")).toHaveLength(0);
    expect(wrapper.get(".portal-hot-row").text()).toContain("还没有热门作品");
    expect(wrapper.findAll(".portal-icon-wall .work-tile")).toHaveLength(1);
    expect(wrapper.findAll(".portal-icon-wall .portal-slot")).toHaveLength(11);
    const aiRow = wrapper.findAll(".portal-nav-row").find((row) => row.find(".portal-pill").text() === "AI 应用");
    expect(aiRow.text()).toContain("暂无作品，敬请期待");
    expect(wrapper.get(".portal-today").text()).toContain("0");
    expect(wrapper.findAll(".portal-rank li")).toHaveLength(1);
  });

  it("lists 今日推荐 with featured works first", async () => {
    portal = [work(1), work(2, { isFeatured: true, title: "精选作品" })];
    await open();
    const first = wrapper.get(".portal-pick");
    expect(first.text()).toContain("精选作品");
  });

  it("shows a numbered top-10 热门排行 in the sidebar", async () => {
    await open();
    const rows = wrapper.findAll(".portal-rank li");
    expect(rows).toHaveLength(10);
    expect(rows[0].find(".portal-rank-no").text()).toBe("1");
    expect(rows[0].find("a").attributes("href")).toBe("/works/work-1");
    expect(wrapper.findAll(".portal-pick")).toHaveLength(8);
  });

  it("reads and clears the 我玩过的 strip from localStorage", async () => {
    window.localStorage.setItem(RECENT_WORKS_KEY, JSON.stringify([{ slug: "a", title: "玩过的", category: "game" }]));
    await open();
    expect(wrapper.get(".portal-recent-item").text()).toContain("玩过的");
    await wrapper.get(".portal-recent-clear").trigger("click");
    expect(wrapper.find(".portal-recent-item").exists()).toBe(false);
    expect(window.localStorage.getItem(RECENT_WORKS_KEY)).toBeNull();
  });

  it("reads initial filters from the URL", async () => {
    await open("/works?category=ai-app&sort=popular&tag=Vue");
    expect(works.getWorks).toHaveBeenCalledWith(
      expect.objectContaining({ category: "ai-app", sort: "popular", tag: "Vue", page: 1 }),
      expect.anything(),
    );
  });

  it("filters by category, syncs the URL and refreshes tag facets", async () => {
    await open();
    const gameButton = wrapper.findAll(".prompt-library-filters button").find((b) => b.text() === "小游戏");
    await gameButton.trigger("click");
    await flushPromises();
    expect(works.getWorks).toHaveBeenLastCalledWith(expect.objectContaining({ category: "game" }), expect.anything());
    expect(window.location.search).toBe("?category=game");
    expect(works.getWorksMeta).toHaveBeenLastCalledWith({ category: "game", q: "" }, expect.anything());
  });

  it("category pill jumps the list to that category", async () => {
    await open();
    const pill = wrapper.findAll(".portal-pill").find((p) => p.text() === "AI 应用");
    await pill.trigger("click");
    await flushPromises();
    expect(works.getWorks).toHaveBeenLastCalledWith(expect.objectContaining({ category: "ai-app" }), expect.anything());
  });

  it("appends the next page on load more", async () => {
    let call = 0;
    works.getWorks.mockImplementation(async (filters) => {
      if (filters.pageSize === 48) return { works: portal };
      call += 1;
      return call === 1
        ? { works: [work(1)], pagination: { total: 2, hasNext: true } }
        : { works: [work(2)], pagination: { total: 2, hasNext: false } };
    });
    await open();
    await wrapper.get(".works-more button").trigger("click");
    await flushPromises();
    expect(wrapper.findAll(".portal-latest-grid .work-tile")).toHaveLength(2);
  });

  it("shows an empty state with a clear-filters action", async () => {
    list = { works: [], pagination: { total: 0, hasNext: false } };
    await open("/works?q=nothing");
    expect(wrapper.text()).toContain("没有找到匹配的作品");
  });
});

describe("我玩过的 server refresh", () => {
  it("drops works that are no longer public and refreshes titles", async () => {
    window.localStorage.setItem(
      RECENT_WORKS_KEY,
      JSON.stringify([
        { slug: "work-1", title: "旧标题", coverUrl: "", category: "game" },
        { slug: "gone", title: "已下架", coverUrl: "", category: "game" },
      ]),
    );
    works.getWorksBatch.mockResolvedValue({ works: [work(1, { title: "新标题" })] });
    await open();
    const items = wrapper.findAll(".portal-recent-item");
    expect(items).toHaveLength(1);
    expect(items[0].text()).toContain("新标题");
  });
});
