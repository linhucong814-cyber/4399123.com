// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import AccountSettingsPage from "./AccountSettingsPage.vue";
import { USERNAME_RE, characterCount, normalizeUsername } from "../../utils/accountProfile";
import * as auth from "../../services/auth";

vi.mock("../../services/auth", () => ({
  getCurrentUser: vi.fn(), getSessions: vi.fn(), updateProfile: vi.fn(), uploadAvatar: vi.fn(),
  changePassword: vi.fn(), requestEmailChange: vi.fn(), confirmEmailChange: vi.fn(),
  logoutUser: vi.fn(), revokeSession: vi.fn(), revokeOtherSessions: vi.fn(),
}));
vi.mock("../../services/authState", () => ({ setAuthUser: vi.fn() }));
vi.mock("../../utils/seo", () => ({ setPageSeo: vi.fn() }));

const baseUser = { id: 7, username: "maker", bio: "原简介", email: "maker@example.com", emailVerified: true, avatarUrl: "", canChangeUsernameAt: "", isAdmin: false, status: "active" };
let wrapper;
async function open(user = {}) {
  auth.getCurrentUser.mockResolvedValue({ user: { ...baseUser, ...user } });
  wrapper = mount(AccountSettingsPage, { attachTo: document.body });
  await flushPromises();
  return wrapper;
}
const deferred = () => {
  let resolve;
  const promise = new Promise(r => { resolve = r; });
  return { promise, resolve };
};
async function upload(file) {
  const input = wrapper.find('input[type="file"]');
  Object.defineProperty(input.element, "files", { value: [file], configurable: true });
  await input.trigger("change");
  await flushPromises();
}

beforeEach(() => {
  vi.resetAllMocks();
  auth.getSessions.mockResolvedValue({ sessions: [{ id: 1, current: true, deviceLabel: "当前浏览器" }, { id: 2, current: false, deviceLabel: "另一台设备" }] });
});
afterEach(() => { wrapper?.unmount(); wrapper = null; document.body.innerHTML = ""; });

describe("用户名字符规则", () => {
  it.each(["中", "a", "1", "_", ".", "-", "中文A1_.-", "𠀀".repeat(32)])("接受 %s", name => {
    expect(USERNAME_RE.test(normalizeUsername(name))).toBe(true);
  });
  it.each(["", "a".repeat(33), "𠀀".repeat(33), "a b", "a/b", "a@b", "😀", "a\nb"])("拒绝非法或超长用户名 %s", name => {
    expect(USERNAME_RE.test(normalizeUsername(name))).toBe(false);
  });
  it("中文扩展字符按一个字符计数，并统一全角输入", () => {
    expect(characterCount("𠀀".repeat(32))).toBe(32);
    expect(normalizeUsername("  小明１２３  ")).toBe("小明123");
  });
});

describe("账号设置操作", () => {
  it("只有修改资料后才能保存，并可撤销", async () => {
    await open();
    const save = wrapper.get('#settings-profile button[type="submit"]');
    expect(save.element.disabled).toBe(true);
    await wrapper.get("textarea").setValue("新简介");
    expect(save.element.disabled).toBe(false);
    await wrapper.get(".profile-save-actions button[type=button]").trigger("click");
    expect(wrapper.get("textarea").element.value).toBe("原简介");
    expect(save.element.disabled).toBe(true);
  });
  it("改名需确认，支持单个中文字符并保存服务端结果", async () => {
    await open();
    await wrapper.get('input[autocomplete="username"]').setValue("中");
    await wrapper.get("#settings-profile").trigger("submit");
    expect(auth.updateProfile).not.toHaveBeenCalled();
    expect(wrapper.get('[role="dialog"]').text()).toContain("30 天");
    auth.updateProfile.mockResolvedValue({ user: { ...baseUser, username: "中" } });
    await wrapper.get('[role="dialog"] .primary-link').trigger("click");
    await flushPromises();
    expect(auth.updateProfile).toHaveBeenCalledWith({ username: "中", bio: "原简介" });
    expect(wrapper.text()).toContain("资料已保存");
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
  });
  it("取消改名保留输入且不提交", async () => {
    await open();
    await wrapper.get('input[autocomplete="username"]').setValue("新名字");
    await wrapper.get("#settings-profile").trigger("submit");
    await wrapper.get('[role="dialog"] .secondary-link').trigger("click");
    expect(auth.updateProfile).not.toHaveBeenCalled();
    expect(wrapper.get('input[autocomplete="username"]').element.value).toBe("新名字");
  });
  it("非法用户名在字段旁提示且不请求后端", async () => {
    await open();
    await wrapper.get('input[autocomplete="username"]').setValue("a/b");
    await wrapper.get("#settings-profile").trigger("submit");
    expect(wrapper.get("#username-error").text()).toContain("1-32");
    expect(auth.updateProfile).not.toHaveBeenCalled();
  });
  it("保存失败保留草稿，重复提交只发一次请求", async () => {
    await open();
    const pending = deferred();
    auth.updateProfile.mockReturnValue(pending.promise);
    await wrapper.get("textarea").setValue("草稿");
    await wrapper.get("#settings-profile").trigger("submit");
    await wrapper.get("#settings-profile").trigger("submit");
    expect(auth.updateProfile).toHaveBeenCalledTimes(1);
    pending.resolve(Promise.reject(new Error("网络暂不可用")));
    await flushPromises();
    expect(wrapper.get("textarea").element.value).toBe("草稿");
    expect(wrapper.text()).toContain("网络暂不可用");
  });
  it("头像上传不会覆盖用户名和简介草稿", async () => {
    await open();
    await wrapper.get('input[autocomplete="username"]').setValue("草稿名字");
    await wrapper.get("textarea").setValue("草稿简介");
    auth.uploadAvatar.mockResolvedValue({ user: { ...baseUser, avatarUrl: "/new.png" } });
    await upload(new File(["image"], "avatar.png", { type: "image/png" }));
    expect(wrapper.get('input[autocomplete="username"]').element.value).toBe("草稿名字");
    expect(wrapper.get("textarea").element.value).toBe("草稿简介");
    expect(wrapper.get(".profile-avatar img").attributes("src")).toBe("/new.png");
  });
  it("超大头像在上传前拦截", async () => {
    await open();
    await upload(new File([new Uint8Array(2 * 1024 * 1024 + 1)], "avatar.png", { type: "image/png" }));
    expect(auth.uploadAvatar).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain("不能超过 2MB");
  });
  it("冷却期禁用改名但允许保存简介", async () => {
    await open({ canChangeUsernameAt: new Date(Date.now() + 86400000).toISOString() });
    expect(wrapper.get('input[autocomplete="username"]').element.disabled).toBe(true);
    await wrapper.get("textarea").setValue("简介修改");
    auth.updateProfile.mockResolvedValue({ user: { ...baseUser, bio: "简介修改" } });
    await wrapper.get("#settings-profile").trigger("submit");
    await flushPromises();
    expect(auth.updateProfile).toHaveBeenCalledWith({ bio: "简介修改" });
  });
  it("管理员不受普通用户冷却期限制", async () => {
    await open({ isAdmin: true, canChangeUsernameAt: new Date(Date.now() + 86400000).toISOString() });
    expect(wrapper.get('input[autocomplete="username"]').element.disabled).toBe(false);
  });
  it("未保存内容阻止直接离开，撤销后不再提示", async () => {
    await open();
    await wrapper.get("textarea").setValue("草稿");
    const event = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    await wrapper.get(".profile-save-actions button[type=button]").trigger("click");
    const clean = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(clean);
    expect(clean.defaultPrevented).toBe(false);
  });
  it("设备读取失败可重试", async () => {
    auth.getSessions.mockRejectedValueOnce(new Error("设备读取失败"));
    await open();
    expect(wrapper.get("#settings-devices").text()).toContain("设备读取失败");
    await wrapper.get("#settings-devices .inline-state button").trigger("click");
    await flushPromises();
    expect(wrapper.get("#settings-devices").text()).toContain("另一台设备");
  });
  it("设备退出中的重复点击只发一次请求", async () => {
    await open();
    const pending = deferred();
    auth.revokeSession.mockReturnValue(pending.promise);
    await wrapper.get(".device-row button").trigger("click");
    await wrapper.get(".device-row button").trigger("click");
    expect(auth.revokeSession).toHaveBeenCalledTimes(1);
    pending.resolve({});
    await flushPromises();
  });
  it("邮箱验证码发送中与冷却期均禁止重复发送，返回修改仍有效", async () => {
    await open();
    const pending = deferred();
    auth.requestEmailChange.mockReturnValue(pending.promise);
    await wrapper.get('#settings-email input[type="password"]').setValue("CurrentSecret");
    await wrapper.get('#settings-email input[type="email"]').setValue("new@example.com");
    await wrapper.get("#settings-email").trigger("submit");
    await wrapper.get("#settings-email").trigger("submit");
    expect(auth.requestEmailChange).toHaveBeenCalledTimes(1);
    pending.resolve({ cooldownSeconds: 60, expiresMinutes: 10 });
    await flushPromises();
    expect(wrapper.get('#settings-email button[type="button"]').element.disabled).toBe(false);
    await wrapper.get('#settings-email .auth-notice button').trigger("click");
    expect(wrapper.get('#settings-email button[type="submit"]').element.disabled).toBe(true);
    await wrapper.get("#settings-email").trigger("submit");
    expect(auth.requestEmailChange).toHaveBeenCalledTimes(1);
  });
  it("换绑邮箱成功保留简介草稿并清除密码与验证码", async () => {
    await open();
    await wrapper.get("textarea").setValue("尚未保存的简介");
    auth.requestEmailChange.mockResolvedValue({ cooldownSeconds: 60 });
    await wrapper.get('#settings-email input[type="password"]').setValue("CurrentSecret");
    await wrapper.get('#settings-email input[type="email"]').setValue("new@example.com");
    await wrapper.get("#settings-email").trigger("submit");
    await flushPromises();
    auth.confirmEmailChange.mockResolvedValue({ user: { ...baseUser, email: "new@example.com" } });
    await wrapper.get('#settings-email input[autocomplete="one-time-code"]').setValue("123456");
    await wrapper.get("#settings-email").trigger("submit");
    await flushPromises();
    expect(wrapper.get("textarea").element.value).toBe("尚未保存的简介");
    expect(wrapper.get('#settings-email input[type="password"]').element.value).toBe("");
    expect(wrapper.get('#settings-email button[type="submit"]').element.disabled).toBe(false);
  });
  it("账号读取失败显示错误和重试入口", async () => {
    auth.getCurrentUser.mockRejectedValue(new Error("账号暂不可读取"));
    wrapper = mount(AccountSettingsPage);
    await flushPromises();
    expect(wrapper.text()).toContain("账号暂不可读取");
    expect(wrapper.text()).toContain("重新加载");
    expect(wrapper.text()).not.toContain("登录后可以");
  });
});
