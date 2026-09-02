import { describe, expect, it } from "vitest";
import {
  canUseHoverPreview,
  reduceAnnouncementMenu,
  shouldLoadOnOpen,
  shouldMarkRead,
  shouldScheduleCloseOnHoverLeave,
} from "./systemAnnouncementMenuState.js";

describe("system announcement menu stay policy", () => {
  it("opens a hover preview without pinning", () => {
    expect(reduceAnnouncementMenu({ open: false, pinned: false }, { type: "hover-enter", canHover: true })).toEqual({
      open: true,
      pinned: false,
    });
  });

  it("ignores hover preview on coarse pointers", () => {
    expect(reduceAnnouncementMenu({ open: false, pinned: false }, { type: "hover-enter", canHover: false })).toEqual({
      open: false,
      pinned: false,
    });
  });

  it("keeps a pinned panel open after mouse leave", () => {
    expect(reduceAnnouncementMenu({ open: true, pinned: true }, { type: "hover-leave" })).toEqual({
      open: true,
      pinned: true,
    });
  });

  it("keeps an unpinned preview open so the close can be delayed", () => {
    expect(reduceAnnouncementMenu({ open: true, pinned: false }, { type: "hover-leave" })).toEqual({
      open: true,
      pinned: false,
    });
    expect(shouldScheduleCloseOnHoverLeave({ open: true, pinned: false })).toBe(true);
    expect(shouldScheduleCloseOnHoverLeave({ open: true, pinned: true })).toBe(false);
  });

  it("auto-pins when the user is selecting text inside the panel", () => {
    expect(
      reduceAnnouncementMenu({ open: true, pinned: false }, { type: "hover-leave", isSelecting: true }),
    ).toEqual({
      open: true,
      pinned: true,
    });
  });

  it("pins on trigger click and closes the next click", () => {
    const pinned = reduceAnnouncementMenu({ open: false, pinned: false }, { type: "trigger-click" });
    expect(pinned).toEqual({ open: true, pinned: true });
    expect(reduceAnnouncementMenu(pinned, { type: "trigger-click" })).toEqual({ open: false, pinned: false });
  });

  it("upgrades a hover preview to pinned when the trigger is clicked", () => {
    expect(reduceAnnouncementMenu({ open: true, pinned: false }, { type: "trigger-click" })).toEqual({
      open: true,
      pinned: true,
    });
  });

  it("pins when the user presses inside the open panel", () => {
    expect(reduceAnnouncementMenu({ open: true, pinned: false }, { type: "panel-press" })).toEqual({
      open: true,
      pinned: true,
    });
  });

  it("stays open when focus leaves to a non-focusable click target", () => {
    expect(
      reduceAnnouncementMenu({ open: true, pinned: true }, { type: "focus-leave", hasTarget: false, inside: false }),
    ).toEqual({
      open: true,
      pinned: true,
    });
  });

  it("closes when keyboard focus moves outside the menu", () => {
    expect(
      reduceAnnouncementMenu({ open: true, pinned: true }, { type: "focus-leave", hasTarget: true, inside: false }),
    ).toEqual({
      open: false,
      pinned: false,
    });
  });

  it("loads notifications only when the panel first opens", () => {
    expect(shouldLoadOnOpen(false, true)).toBe(true);
    expect(shouldLoadOnOpen(true, true)).toBe(false);
  });

  it("marks system cards read only when the panel first becomes pinned", () => {
    expect(shouldMarkRead({ pinned: false }, { pinned: true })).toBe(true);
    expect(shouldMarkRead({ pinned: true }, { pinned: true })).toBe(false);
    expect(shouldMarkRead({ pinned: false }, { pinned: false })).toBe(false);
  });

  it("detects fine-pointer hover support from matchMedia", () => {
    expect(canUseHoverPreview(() => ({ matches: true }))).toBe(true);
    expect(canUseHoverPreview(() => ({ matches: false }))).toBe(false);
    expect(canUseHoverPreview()).toBe(false);
  });
});
