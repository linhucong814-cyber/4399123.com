// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";

const community = vi.hoisted(() => ({ getCommunityNotifications: vi.fn() }));
vi.mock("../services/community", () => community);
vi.mock("../services/authState", () => ({
  authState: { user: { username: "tester", isAdmin: false } },
  refreshAuth: vi.fn(async () => {}),
}));

import TopNav from "./TopNav.vue";

describe("TopNav without message center", () => {
  it("renders no bell, popover or unread badge and never polls notifications", async () => {
    vi.useFakeTimers();
    const wrapper = mount(TopNav, {
      props: { items: [{ label: "作品", href: "/works", primary: true }], currentPath: "/works" },
      global: { stubs: { Teleport: true } },
    });
    await vi.advanceTimersByTimeAsync(60000);
    const html = wrapper.html();
    expect(html).not.toContain("system-announcement");
    expect(html).not.toContain("site-nav-badge");
    expect(html).not.toContain("inbox=1");
    expect(community.getCommunityNotifications).not.toHaveBeenCalled();
    vi.useRealTimers();
    wrapper.unmount();
  });
});
