// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import CommunityPage from "./CommunityPage.vue";
import * as community from "../services/community";
import { getCurrentUser } from "../services/auth";

vi.mock("../services/community");
vi.mock("../services/auth", () => ({ getCurrentUser: vi.fn() }));
vi.mock("../utils/seo", () => ({ setPageSeo: vi.fn() }));
const user = { id: 7, username: "测试账号", avatarUrl: "", status: "active" };
const post = { id: 99, author: user, channel: "vibe-coding", title: "测试标题", body: "这是本地测试内容", replies: [], attachments: [], badges: [], createdAt: "2026-10-14T00:00:00Z" };
let wrapper;
async function open(path = "/community/") {
  window.history.replaceState({}, "", path);
  wrapper = mount(CommunityPage, { attachTo: document.body, global: { directives: { reveal: {} } } });
  await flushPromises();
}
async function expand() {
  await wrapper.get('.community-compose-entry button').trigger('click');
  await flushPromises();
}
async function fill() {
  await wrapper.get('.quick-composer-title').setValue("测试标题");
  await wrapper.get('.quick-composer-input').setValue("这是本地测试内容");
}
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubGlobal("requestAnimationFrame", callback => { callback(); return 1; });
  window.scrollTo = vi.fn();
  getCurrentUser.mockResolvedValue({ user });
  community.getCommunityPosts.mockResolvedValue({ posts: [], pageInfo: { hasNext: false, pageSize: 20 } });
  community.getCommunitySocialSummary.mockResolvedValue({});
  community.getCommunityNotifications.mockResolvedValue({ notifications: [], unread: 0 });
  community.getCommunityPost.mockResolvedValue({ post });
});
afterEach(() => { wrapper?.unmount(); document.body.innerHTML = ""; vi.unstubAllGlobals(); });

describe("社区主页发帖折叠与消息入口", () => {
  it("默认隐藏消息卡片和整个表单，显示发布入口", async () => {
    await open();
    expect(wrapper.find('.inbox-panel').exists()).toBe(false);
    expect(wrapper.get('#community-post-composer').isVisible()).toBe(false);
    expect(wrapper.get('.community-compose-entry button').attributes('aria-expanded')).toBe('false');
    expect(wrapper.get('.community-compose-entry button').text()).toBe('发布帖子');
    expect(wrapper.get('.community-rail a[href="/community?inbox=1"]').exists()).toBe(true);
  });
  it("展开后聚焦标题，收起再展开保留内容和附件并恢复焦点", async () => {
    await open(); await expand();
    expect(document.activeElement).toBe(wrapper.get('.quick-composer-title').element);
    await fill();
    const input = wrapper.get('input[type="file"]');
    Object.defineProperty(input.element, 'files', { value: [new File(['text'], 'note.txt', { type: 'text/plain' })], configurable: true });
    await input.trigger('change');
    await wrapper.get('#community-post-composer .composer-actions button[type="button"]').trigger('click');
    expect(wrapper.get('#community-post-composer').isVisible()).toBe(false);
    expect(document.activeElement).toBe(wrapper.get('.community-compose-entry button').element);
    await expand();
    expect(wrapper.get('.quick-composer-title').element.value).toBe('测试标题');
    expect(wrapper.get('.quick-composer-input').element.value).toBe('这是本地测试内容');
    expect(wrapper.get('.attachment-chip').text()).toContain('note.txt');
  });
  it("侧栏发帖可以展开表单", async () => {
    await open(); await wrapper.get('.community-rail button').trigger('click');
    expect(wrapper.get('#community-post-composer').isVisible()).toBe(true);
    expect(document.activeElement).toBe(wrapper.get('.quick-composer-title').element);
  });
  it("验证失败保留展开状态并阻止提交", async () => {
    await open(); await expand();
    await wrapper.get('.quick-composer-title').setValue('短');
    await wrapper.get('#community-post-composer').trigger('submit');
    expect(wrapper.get('#community-post-composer').isVisible()).toBe(true);
    expect(wrapper.get('.error-state').text()).toContain('标题至少需要');
    expect(community.createCommunityPost).not.toHaveBeenCalled();
  });
  it("网络提交失败保留内容并显示错误", async () => {
    community.createCommunityPost.mockRejectedValue(new Error('网络暂不可用'));
    await open(); await expand(); await fill();
    await wrapper.get('#community-post-composer').trigger('submit'); await flushPromises();
    expect(wrapper.get('#community-post-composer').isVisible()).toBe(true);
    expect(wrapper.get('.quick-composer-input').element.value).toBe('这是本地测试内容');
    expect(wrapper.get('.error-state').text()).toContain('网络暂不可用');
  });
  it("提交期间禁止收起和重复提交，成功后折叠并清空已发布内容", async () => {
    let resolve;
    community.createCommunityPost.mockReturnValue(new Promise(r => { resolve = r; }));
    await open(); await expand(); await fill();
    await wrapper.get('#community-post-composer').trigger('submit');
    await wrapper.get('#community-post-composer').trigger('submit');
    expect(community.createCommunityPost).toHaveBeenCalledTimes(1);
    expect(wrapper.get('.community-compose-entry button').element.disabled).toBe(true);
    resolve({ post }); await flushPromises();
    expect(wrapper.get('#community-post-composer').isVisible()).toBe(false);
    expect(wrapper.get('.quick-composer-input').element.value).toBe('');
    expect(wrapper.get('.community-compose-entry').text()).toContain('发布成功');
  });
  it("显式消息入口仍可用，关闭时移除inbox参数并保留排序", async () => {
    await open('/community/?inbox=1&sort=hot');
    expect(wrapper.get('.inbox-panel').isVisible()).toBe(true);
    await wrapper.get('.inbox-toggle').trigger('click');
    expect(wrapper.find('.inbox-panel').exists()).toBe(false);
    expect(window.location.search).toBe('?sort=hot');
  });
  it("未登录用户保留登录提示", async () => {
    getCurrentUser.mockResolvedValue({ user: null }); await open();
    expect(wrapper.find('#community-post-composer').exists()).toBe(false);
    expect(wrapper.get('.community-login-panel').text()).toContain('登录后参与讨论');
  });
});
