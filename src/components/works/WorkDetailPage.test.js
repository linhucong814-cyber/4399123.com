// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import WorkDetailPage from "./WorkDetailPage.vue";
import * as works from "../../services/works";

vi.mock("../../services/works", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getWork: vi.fn(), recordWorkView: vi.fn(), setWorkLike: vi.fn(), setWorkFavorite: vi.fn(),
    getWorkComments: vi.fn(), postWorkComment: vi.fn(), deleteWorkComment: vi.fn(), getWorkPosts: vi.fn(), adminUpdateWork: vi.fn(),
  };
});
vi.mock("../../utils/seo", () => ({ setPageSeo: vi.fn() }));

const baseWork = {
  id: 1,
  slug: "demo",
  title: "演示作品",
  summary: "一句话简介",
  description: "第一段\n\n第二段",
  category: "game",
  categoryLabel: "小游戏",
  tags: ["Vue"],
  aiTools: ["Codex"],
  coverUrl: "/cover.png",
  projectUrl: "https://example.com/",
  sourceUrl: "",
  embeddable: true,
  author: { id: 5, name: "maker" },
  stats: { views: 1, likes: 2, favorites: 0 },
  viewer: { liked: false, favorited: false },
  publishedAt: "2026-10-01T00:00:00+08:00",
};

let wrapper;
async function open(work = baseWork) {
  works.getWork.mockResolvedValue({ work, related: [] });
  wrapper = mount(WorkDetailPage, { props: { slug: work.slug }, global: { directives: { reveal: {} } } });
  await flushPromises();
}

beforeEach(() => {
  vi.clearAllMocks();
  works.recordWorkView.mockResolvedValue({ views: 2 });
  works.getWorkComments.mockResolvedValue({ comments: [], commentCount: 0 });
  works.getWorkPosts.mockResolvedValue({ posts: [] });
});
afterEach(() => wrapper?.unmount());

describe("作品详情", () => {
  it("renders info, records a view, and loads a sandboxed iframe on demand", async () => {
    await open();
    expect(wrapper.find("h1").text()).toBe("演示作品");
    expect(wrapper.findAll(".work-description p")).toHaveLength(2);
    expect(works.recordWorkView).toHaveBeenCalledWith("demo");
    expect(JSON.parse(window.localStorage.getItem("4399123.works.recent"))[0].slug).toBe("demo");
    expect(wrapper.text()).toContain("浏览 2");
    expect(wrapper.find("iframe").exists()).toBe(false);
    await wrapper.get(".work-preview-start").trigger("click");
    const sandbox = wrapper.get("iframe").attributes("sandbox");
    expect(sandbox).toContain("allow-scripts");
    expect(sandbox).not.toContain("allow-same-origin");
  });

  it("falls back to a link when embedding is disabled", async () => {
    await open({ ...baseWork, embeddable: false });
    expect(wrapper.find(".work-preview-start").exists()).toBe(false);
    expect(wrapper.text()).toContain("不支持嵌入预览");
  });

  it("toggles like and favorite with server counts", async () => {
    works.setWorkLike.mockResolvedValue({ liked: true, count: 3 });
    works.setWorkFavorite.mockResolvedValue({ favorited: true, count: 1 });
    await open();
    const [likeButton, favoriteButton] = wrapper.findAll(".work-actions button");
    await likeButton.trigger("click");
    await flushPromises();
    expect(works.setWorkLike).toHaveBeenCalledWith("demo", true);
    expect(likeButton.text()).toContain("已点赞 3");
    await favoriteButton.trigger("click");
    await flushPromises();
    expect(favoriteButton.text()).toContain("已收藏 1");
  });

  it("asks anonymous visitors to log in", async () => {
    works.setWorkLike.mockRejectedValue(Object.assign(new Error("x"), { status: 401 }));
    await open();
    await wrapper.findAll(".work-actions button")[0].trigger("click");
    await flushPromises();
    expect(wrapper.text()).toContain("请先登录后再操作");
  });

  it("shows owner-only notice for unpublished works and skips view counting", async () => {
    await open({ ...baseWork, status: "needs_changes", statusLabel: "需要修改", rejectReason: "补封面" });
    expect(wrapper.text()).toContain("审核意见：补封面");
    expect(works.recordWorkView).not.toHaveBeenCalled();
  });

  it("shows a not-found state", async () => {
    works.getWork.mockRejectedValue(Object.assign(new Error("nf"), { status: 404 }));
    wrapper = mount(WorkDetailPage, { props: { slug: "missing" } });
    await flushPromises();
    expect(wrapper.text()).toContain("作品不存在或尚未公开");
  });

  it("shows threaded comments, posts a reply to the root thread and deletes own comments", async () => {
    const thread = {
      id: 10, body: "好玩", isDeleted: false, canDelete: true, author: { id: 2, username: "fan" }, createdAt: "2026-10-01T00:00:00+08:00",
      replies: [{ id: 11, body: "同意", isDeleted: false, canDelete: false, author: { id: 3, username: "b" }, createdAt: "2026-10-01T00:00:00+08:00", replies: [] }],
    };
    works.getWorkComments.mockResolvedValue({ comments: [thread], commentCount: 2 });
    works.postWorkComment.mockResolvedValue({ commentCount: 3 });
    works.deleteWorkComment.mockResolvedValue({ commentCount: 1 });
    vi.spyOn(window, "confirm").mockReturnValue(true);
    await open({ ...baseWork, viewer: { isAuthenticated: true } });
    expect(wrapper.get("#work-comments-title").text()).toBe("评论 2");
    expect(wrapper.findAll(".work-comment-replies .work-comment-item")).toHaveLength(1);
    await wrapper.findAll(".work-comment-replies .work-comment-tools button")[0].trigger("click");
    await wrapper.get(".work-comment-form.is-reply textarea").setValue("楼中楼");
    await wrapper.get(".work-comment-form.is-reply").trigger("submit");
    await flushPromises();
    expect(works.postWorkComment).toHaveBeenCalledWith("demo", "楼中楼", 11);
    const deleteButton = wrapper.findAll(".work-comment-tools button").find((b) => b.text() === "删除");
    await deleteButton.trigger("click");
    await flushPromises();
    expect(works.deleteWorkComment).toHaveBeenCalledWith(10);
  });

  it("asks anonymous visitors to log in before commenting", async () => {
    await open();
    expect(wrapper.find(".work-comment-form").exists()).toBe(false);
    expect(wrapper.get(".work-comment-login a").attributes("href")).toContain("/login?next=");
    expect(wrapper.text()).toContain("还没有评论");
  });

  it("lists related community posts and links the composer to this work", async () => {
    works.getWorkPosts.mockResolvedValue({ posts: [{ id: 7, title: "玩后感", url: "/community/posts/7", author: { username: "fan" }, channelLabel: "作品展示", replyCount: 1 }] });
    await open();
    expect(wrapper.get(".work-post-row").attributes("href")).toBe("/community/posts/7");
    expect(wrapper.get(".work-post-new").attributes("href")).toBe("/community?compose=1&work=demo");
  });

  it("shows admin curation only to staff", async () => {
    await open();
    expect(wrapper.find(".work-admin-bar").exists()).toBe(false);
    wrapper.unmount();
    works.adminUpdateWork.mockResolvedValue({ work: { ...baseWork, isFeatured: true } });
    await open({ ...baseWork, viewer: { isStaff: true } });
    await wrapper.get(".work-admin-bar button").trigger("click");
    await flushPromises();
    expect(works.adminUpdateWork).toHaveBeenCalledWith("demo", { isFeatured: true });
    expect(wrapper.get(".work-admin-bar button").text()).toBe("取消精选");
  });

  it("credits third-party open-source works with author, license, repo and source post", async () => {
    await open({
      ...baseWork,
      slug: "neonplex",
      isThirdParty: true,
      sourceUrl: "https://github.com/VictorZakharov/neonplex",
      author: { id: 1, name: "Victor Zakharov" },
      credit: { authorUrl: "https://github.com/VictorZakharov", license: "MIT", originPostUrl: "https://x.com/victor_vibing/status/1" },
    });
    const strip = wrapper.get('[data-testid="work-credit"]');
    expect(strip.text()).toContain("原作者");
    expect(strip.text()).toContain("开源协议");
    expect(strip.text()).toContain("MIT");
    expect(strip.get("a").attributes("href")).toBe("https://github.com/VictorZakharov");
    expect(wrapper.find('a[href="/users/1"]').exists()).toBe(false);
    expect(wrapper.get('a[href="https://x.com/victor_vibing/status/1"]').attributes("rel")).toContain("noopener");
    expect(wrapper.text()).toContain("VictorZakharov/neonplex");
    expect(wrapper.text()).toContain("第三方开源作品");
    await wrapper.get(".work-preview-start").trigger("click");
    const frame = wrapper.get("iframe");
    expect(frame.attributes("sandbox")).toContain("allow-same-origin");
    expect(frame.attributes("loading")).toBe("lazy");
    expect(frame.attributes("allow")).toContain("fullscreen");
  });

  it("shows no credit strip for ordinary works", async () => {
    await open();
    expect(wrapper.find('[data-testid="work-credit"]').exists()).toBe(false);
  });
});
