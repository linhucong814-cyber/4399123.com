// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import WorkPicker from "./WorkPicker.vue";
import WeeklyHotWorks from "./WeeklyHotWorks.vue";
import WorkEmbedCard from "./WorkEmbedCard.vue";
import UserProfilePage from "../UserProfilePage.vue";
import * as works from "../../services/works";
import * as community from "../../services/community";

vi.mock("../../services/works", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, getWorks: vi.fn(), getWeeklyHotWorks: vi.fn(), getUserWorks: vi.fn(), getUserFavoriteWorks: vi.fn() };
});
vi.mock("../../services/community");
vi.mock("../../utils/seo", () => ({ setPageSeo: vi.fn() }));

const work = (id, extra = {}) => ({ id, slug: `w${id}`, title: `作品${id}`, category: "game", coverUrl: "", stats: {}, ...extra });
let wrapper;
beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
});
afterEach(() => {
  wrapper?.unmount();
  vi.useRealTimers();
});

describe("WorkPicker", () => {
  it("searches public works, selects one and can remove it", async () => {
    works.getWorks.mockResolvedValue({ works: [work(1)] });
    wrapper = mount(WorkPicker, { props: { modelValue: null, "onUpdate:modelValue": (v) => wrapper.setProps({ modelValue: v }) } });
    await wrapper.get("input").setValue("作品");
    vi.advanceTimersByTime(300);
    await flushPromises();
    expect(works.getWorks).toHaveBeenCalledWith({ q: "作品", pageSize: 6 });
    await wrapper.get(".work-picker-results button").trigger("click");
    expect(wrapper.get(".work-picker-selected").text()).toContain("作品1");
    await wrapper.get(".work-picker-selected button").trigger("click");
    expect(wrapper.find(".work-picker-selected").exists()).toBe(false);
  });

  it("says so when nothing matches", async () => {
    works.getWorks.mockResolvedValue({ works: [] });
    wrapper = mount(WorkPicker, { props: { modelValue: null } });
    await wrapper.get("input").setValue("zzz");
    vi.advanceTimersByTime(300);
    await flushPromises();
    expect(wrapper.text()).toContain("没有找到匹配的公开作品");
  });
});

describe("WeeklyHotWorks", () => {
  it("lists real weekly interactions", async () => {
    works.getWeeklyHotWorks.mockResolvedValue({ works: [work(1, { weekly: { views: 3, likes: 1 } })] });
    wrapper = mount(WeeklyHotWorks);
    await flushPromises();
    expect(wrapper.get("li a").attributes("href")).toBe("/works/w1");
    expect(wrapper.text()).toContain("3 次浏览 · 1 赞");
  });

  it("shows an honest empty state", async () => {
    works.getWeeklyHotWorks.mockResolvedValue({ works: [] });
    wrapper = mount(WeeklyHotWorks);
    await flushPromises();
    expect(wrapper.text()).toContain("这周还没有作品被玩起来");
  });
});

describe("WorkEmbedCard", () => {
  it("links to the work page", () => {
    wrapper = mount(WorkEmbedCard, { props: { work: { url: "/works/w1", title: "作品1", categoryLabel: "小游戏", authorName: "maker", summary: "s" } } });
    expect(wrapper.get("a").attributes("href")).toBe("/works/w1");
    expect(wrapper.text()).toContain("作品1");
  });
});

describe("UserProfilePage works tabs", () => {
  beforeEach(() => {
    vi.useRealTimers();
    community.getCommunityUser.mockResolvedValue({ user: { id: 5, username: "maker" } });
    community.getCommunityUserPosts.mockResolvedValue({ posts: [] });
    community.getCommunityUserActivity.mockResolvedValue({ bookmarks: [], recentInteractions: [], bookmarksPrivate: true });
    works.getUserWorks.mockResolvedValue({ works: [work(1)] });
  });

  it("hides the favorites tab when private", async () => {
    works.getUserFavoriteWorks.mockResolvedValue({ private: true, works: [] });
    wrapper = mount(UserProfilePage, { props: { userId: "5" } });
    await flushPromises();
    expect(wrapper.findAll(".profile-works-tabs button")).toHaveLength(1);
    expect(wrapper.findAll(".profile-works-grid .work-tile")).toHaveLength(1);
  });

  it("shows own favorites in a second tab", async () => {
    works.getUserFavoriteWorks.mockResolvedValue({ private: false, works: [work(2), work(3)] });
    wrapper = mount(UserProfilePage, { props: { userId: "5" } });
    await flushPromises();
    const tabs = wrapper.findAll(".profile-works-tabs button");
    expect(tabs[1].text()).toContain("收藏的作品 2");
    await tabs[1].trigger("click");
    expect(wrapper.findAll(".profile-works-grid .work-tile")).toHaveLength(2);
  });
});
