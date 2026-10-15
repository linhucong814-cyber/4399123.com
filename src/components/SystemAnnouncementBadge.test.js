// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";

const state = vi.hoisted(() => ({ authState: { user: null, isLoaded: true } }));
vi.mock("../services/authState", async () => {
  const { reactive } = await import("vue");
  const authState = reactive(state.authState);
  state.reactive = authState;
  return { authState, refreshAuth: vi.fn(async () => authState.user) };
});
vi.mock("../services/community", () => ({
  getCommunityNotifications: vi.fn(async () => ({ notifications: [], unread: 0 })),
  markCommunityNotificationsRead: vi.fn(async () => ({ unread: 0 })),
}));

import SystemAnnouncementMenu from "./SystemAnnouncementMenu.vue";

beforeEach(() => {
  window.localStorage.clear();
  state.reactive.user = null;
});

describe("消息铃铛角标", () => {
  it("shows no badge for signed-out visitors even with unread site announcements", async () => {
    const wrapper = mount(SystemAnnouncementMenu, { props: { unreadCount: 0 } });
    await flushPromises();
    expect(wrapper.find(".system-announcement-trigger__badge").exists()).toBe(false);
  });

  it("matches the community unread count for signed-in users", async () => {
    state.reactive.user = { id: 1, username: "u" };
    const wrapper = mount(SystemAnnouncementMenu, { props: { unreadCount: 3 } });
    await flushPromises();
    expect(wrapper.get(".system-announcement-trigger__badge").text()).toBe("3");
  });
});
