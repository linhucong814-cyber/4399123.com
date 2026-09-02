export const MENU_CLOSE_DELAY = 260;

export function canUseHoverPreview(media = globalThis.matchMedia) {
  if (typeof media !== "function") return false;
  try {
    return Boolean(media("(hover: hover) and (pointer: fine)")?.matches);
  } catch {
    return false;
  }
}

export function reduceAnnouncementMenu(state, event) {
  const current = {
    open: Boolean(state?.open),
    pinned: Boolean(state?.pinned),
  };

  switch (event?.type) {
    case "hover-enter":
      if (!event.canHover) return current;
      return { open: true, pinned: current.pinned };

    case "hover-leave":
      if (!current.open) return current;
      if (event.isSelecting) return { open: true, pinned: true };
      return current;

    case "trigger-click":
      if (current.open && current.pinned) return { open: false, pinned: false };
      return { open: true, pinned: true };

    case "panel-press":
      if (!current.open) return current;
      return { open: true, pinned: true };

    case "outside-press":
    case "escape":
      return { open: false, pinned: false };

    case "focus-leave":
      if (event.inside) return current;
      if (!event.hasTarget) return current;
      return { open: false, pinned: false };

    default:
      return current;
  }
}

export function shouldLoadOnOpen(previousOpen, nextOpen) {
  return !previousOpen && nextOpen;
}

export function shouldMarkRead(previousState, nextState) {
  return Boolean(nextState?.pinned) && !previousState?.pinned;
}

export function shouldScheduleCloseOnHoverLeave(state, isSelecting = false) {
  return Boolean(state?.open) && !state?.pinned && !isSelecting;
}
