<template>
  <div
    ref="menuRoot"
    class="system-announcement-menu"
    :class="{
      'system-announcement-menu--open': isOpen,
      'system-announcement-menu--pinned': isPinned,
    }"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @focusout="handleFocusOut"
  >
    <button
      ref="menuTrigger"
      class="system-announcement-trigger"
      type="button"
      aria-haspopup="dialog"
      :aria-expanded="isOpen"
      :aria-controls="panelId"
      :aria-label="triggerLabel"
      :title="triggerTitle"
      @click="toggleMenu"
    >
      <span class="system-announcement-trigger__icon" aria-hidden="true">🔔</span>
      <span v-if="badgeCount" class="system-announcement-trigger__badge" aria-hidden="true">
        {{ badgeLabel }}
      </span>
    </button>

    <section
      v-show="isOpen"
      :id="panelId"
      class="system-announcement-panel"
      role="dialog"
      aria-modal="false"
      :aria-labelledby="titleId"
      @pointerdown="handlePanelPointerDown"
    >
      <header class="system-announcement-panel__head">
        <div>
          <p class="system-announcement-panel__kicker">MESSAGE CENTER</p>
          <h2 :id="titleId">消息提醒</h2>
        </div>
        <div class="system-announcement-panel__actions">
          <button
            v-if="communityUnread"
            class="system-announcement-panel__mark-all"
            type="button"
            :disabled="isMarkingRead"
            @click="markAllRead"
          >
            {{ isMarkingRead ? "处理中" : "全部已读" }}
          </button>
          <span class="system-announcement-panel__count">{{ countLabel }}</span>
        </div>
      </header>

      <div v-if="isLoading" class="system-announcement-state" role="status">
        正在读取消息...
      </div>
      <div v-else-if="errorMessage" class="system-announcement-state system-announcement-state--error" role="alert">
        <span>{{ errorMessage }}</span>
        <button type="button" @click="loadNotifications">重试</button>
      </div>
      <div v-else class="system-announcement-list">
        <article class="system-announcement-card" :class="{ 'system-announcement-card--unread': isAnnouncementUnread }">
          <div class="system-announcement-card__meta">
            <span class="system-announcement-card__dot" aria-hidden="true"></span>
            <span>站长通知</span>
            <time :datetime="announcement.updatedAt">刚刚</time>
          </div>
          <p>
            想合作、咨询，了解社区请添加站长微信：<strong>Ccxyy0228</strong>
          </p>
        </article>

        <article
          class="system-announcement-card system-announcement-card--mail"
          :class="{ 'system-announcement-card--unread': isMailboxAnnouncementUnread }"
        >
          <div class="system-announcement-card__meta">
            <span class="system-announcement-card__dot" aria-hidden="true"></span>
            <span>4399123 邮箱</span>
            <span class="system-announcement-card__status">筹备中</span>
            <time :datetime="mailboxAnnouncement.updatedAt">即将上线</time>
          </div>
          <p>
            邮箱入口 <strong>{{ mailboxAnnouncement.publicUrl }}</strong>
            正在完成域名与邮件服务器配置；公网验收通过后将在这里开放。
          </p>
        </article>

        <a
          v-for="notification in displayedNotifications"
          :key="notification.id"
          class="system-notification-item"
          :class="{ 'system-notification-item--unread': !notification.isRead }"
          :href="notification.post?.url || '/community?inbox=1'"
          @click.prevent="openNotification(notification)"
        >
          <span class="system-notification-item__icon" aria-hidden="true">
            {{ notificationIcon(notification.kind) }}
          </span>
          <span class="system-notification-item__content">
            <span class="system-notification-item__meta">
              <strong>{{ notification.title || "社区通知" }}</strong>
              <time :datetime="notification.createdAt">{{ formatTime(notification.createdAt) }}</time>
            </span>
            <span class="system-notification-item__body">{{ notification.body || "有新的社区动态。" }}</span>
          </span>
          <span v-if="!notification.isRead" class="system-notification-item__unread" aria-label="未读"></span>
        </a>

        <p v-if="!displayedNotifications.length && authState.user" class="system-announcement-empty">
          暂时没有新的社区消息。
        </p>
        <p v-else-if="!authState.user" class="system-announcement-empty">
          登录后可在这里查看回复、点赞和关注提醒。
        </p>
      </div>

      <a class="system-announcement-panel__footer" href="/community?inbox=1" @click="closeMenu()">
        查看全部消息 <span aria-hidden="true">→</span>
      </a>
    </section>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import { authState, refreshAuth } from "../services/authState";
import { getCommunityNotifications, markCommunityNotificationsRead } from "../services/community";
import { formatTime } from "./community/helpers.js";
import {
  MENU_CLOSE_DELAY,
  canUseHoverPreview,
  reduceAnnouncementMenu,
  shouldLoadOnOpen,
  shouldMarkRead,
  shouldScheduleCloseOnHoverLeave,
} from "./systemAnnouncementMenuState.js";

const props = defineProps({
  unreadCount: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(["count-change"]);

const announcement = reactive({
  id: "station-wechat-2026-08",
  updatedAt: "2026-08-01T00:00:00+08:00",
});
const mailboxAnnouncement = reactive({
  id: "mailbox-launch-preparation-2026-08",
  publicUrl: "webmail.4399123.com",
  updatedAt: "2026-08-10T00:00:00+08:00",
});
const readStorageKey = "4399123.system-announcement.read";
const mailboxReadStorageKey = "4399123.system-announcement.mailbox.read";
const readEventName = "site-announcement:read";
const instanceId = Math.random().toString(36).slice(2, 9);
const panelId = `system-announcement-panel-${instanceId}`;
const titleId = `system-announcement-title-${instanceId}`;
const isOpen = ref(false);
const isPinned = ref(false);
const isAnnouncementUnread = ref(getStoredReadId(readStorageKey) !== announcement.id);
const isMailboxAnnouncementUnread = ref(
  getStoredReadId(mailboxReadStorageKey) !== mailboxAnnouncement.id,
);
const notifications = ref([]);
const communityUnread = ref(Number(props.unreadCount) || 0);
const isLoading = ref(false);
const isMarkingRead = ref(false);
const errorMessage = ref("");
const lastLoadedAt = ref(0);
const menuRoot = ref(null);
const menuTrigger = ref(null);
let closeTimer = 0;

// The numeric badge mirrors the account inbox (community notifications only) and is
// hidden for signed-out visitors. Unread site announcements were previously added to
// this number from localStorage, which showed a "2" to every new or logged-out visitor
// and disagreed with the account page's "0 messages".
const badgeCount = computed(() => (authState.user ? communityUnread.value : 0));
const badgeLabel = computed(() => (badgeCount.value > 99 ? "99+" : String(badgeCount.value)));
const triggerLabel = computed(() => {
  const unread = badgeCount.value ? `，${badgeLabel.value} 条未读` : "";
  if (isPinned.value) return `关闭消息提醒${unread}`;
  if (isOpen.value) return `点击固定消息提醒${unread}`;
  return `打开消息提醒${unread}`;
});
const triggerTitle = computed(() => {
  if (isPinned.value) return "再次点击关闭消息提醒";
  return canUseHoverPreview() ? "悬停预览，点击后保持打开" : "点击后保持打开，再次点击关闭";
});
const countLabel = computed(() => (badgeCount.value ? `${badgeLabel.value} 条未读` : "暂无未读"));
const displayedNotifications = computed(() => notifications.value.slice(0, 6));

watch(
  () => props.unreadCount,
  (value) => {
    communityUnread.value = Math.max(0, Number(value) || 0);
  },
);

onMounted(() => {
  syncReadState();
  document.addEventListener("pointerdown", handleDocumentPointerDown);
  document.addEventListener("keydown", handleDocumentKeydown);
  window.addEventListener("storage", handleStorage);
  window.addEventListener(readEventName, handleReadEvent);
  if (!authState.isLoaded) refreshAuth();
});

onUnmounted(() => {
  clearCloseTimer();
  document.removeEventListener("pointerdown", handleDocumentPointerDown);
  document.removeEventListener("keydown", handleDocumentKeydown);
  window.removeEventListener("storage", handleStorage);
  window.removeEventListener(readEventName, handleReadEvent);
});

function menuState() {
  return { open: isOpen.value, pinned: isPinned.value };
}

function applyMenuState(next, previous = menuState()) {
  const previousOpen = previous.open;
  isOpen.value = next.open;
  isPinned.value = next.pinned;
  if (!next.open) return;
  if (shouldLoadOnOpen(previousOpen, next.open)) {
    if (!authState.isLoaded) refreshAuth().then(loadNotifications);
    else loadNotifications();
  }
  if (shouldMarkRead(previous, next)) markSystemAnnouncementsAsRead();
}

function dispatchMenuEvent(event) {
  const previous = menuState();
  const next = reduceAnnouncementMenu(previous, event);
  if (next.open) clearCloseTimer();
  applyMenuState(next, previous);
  return next;
}

function clearCloseTimer() {
  if (!closeTimer) return;
  window.clearTimeout(closeTimer);
  closeTimer = 0;
}

function scheduleClose() {
  clearCloseTimer();
  closeTimer = window.setTimeout(() => {
    closeTimer = 0;
    if (isPinned.value) return;
    applyMenuState({ open: false, pinned: false });
  }, MENU_CLOSE_DELAY);
}

function isSelectingInsideMenu() {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed) return false;
  return Boolean(menuRoot.value?.contains(selection.anchorNode));
}

function toggleMenu() {
  dispatchMenuEvent({ type: "trigger-click" });
}

function handleMouseEnter() {
  dispatchMenuEvent({ type: "hover-enter", canHover: canUseHoverPreview() });
}

function handleMouseLeave() {
  const selecting = isSelectingInsideMenu();
  dispatchMenuEvent({ type: "hover-leave", isSelecting: selecting });
  if (shouldScheduleCloseOnHoverLeave(menuState(), selecting)) scheduleClose();
}

function handlePanelPointerDown() {
  dispatchMenuEvent({ type: "panel-press" });
}

async function loadNotifications() {
  if (!authState.user) return;
  const now = Date.now();
  if (isLoading.value || now - lastLoadedAt.value < 15000) return;
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const data = await getCommunityNotifications();
    notifications.value = Array.isArray(data.notifications) ? data.notifications : [];
    communityUnread.value = Number(data.unread || 0);
    lastLoadedAt.value = Date.now();
    emit("count-change", communityUnread.value);
  } catch (error) {
    if (error?.status !== 401) errorMessage.value = error?.message || "消息读取失败。";
  } finally {
    isLoading.value = false;
  }
}

async function markAllRead() {
  if (!communityUnread.value || isMarkingRead.value) return;
  isMarkingRead.value = true;
  const previous = notifications.value;
  notifications.value = previous.map((notification) => ({ ...notification, isRead: true }));
  communityUnread.value = 0;
  emit("count-change", 0);
  try {
    const data = await markCommunityNotificationsRead();
    communityUnread.value = Number(data.unread || 0);
    emit("count-change", communityUnread.value);
  } catch (error) {
    notifications.value = previous;
    communityUnread.value = previous.filter((notification) => !notification.isRead).length;
    emit("count-change", communityUnread.value);
    errorMessage.value = error?.message || "消息状态更新失败。";
  } finally {
    isMarkingRead.value = false;
  }
}

async function openNotification(notification) {
  if (!notification?.id) return;
  if (!notification.isRead) {
    notification.isRead = true;
    communityUnread.value = Math.max(0, communityUnread.value - 1);
    emit("count-change", communityUnread.value);
    try {
      await markCommunityNotificationsRead(notification.id);
    } catch {
      // The destination remains useful even when the read-state request fails.
    }
  }
  window.location.assign(notification.post?.url || "/community?inbox=1");
}

function notificationIcon(kind) {
  return {
    reply: "↩",
    mention: "@",
    post_like: "♥",
    reply_like: "♥",
    follow: "+",
    bookmark: "★",
  }[kind] || "•";
}

function getStoredReadId(storageKey) {
  try {
    return window.localStorage.getItem(storageKey) || "";
  } catch {
    return "";
  }
}

function syncReadState() {
  isAnnouncementUnread.value = getStoredReadId(readStorageKey) !== announcement.id;
  isMailboxAnnouncementUnread.value =
    getStoredReadId(mailboxReadStorageKey) !== mailboxAnnouncement.id;
}

function markAnnouncementAsRead(item, storageKey, unreadState) {
  if (!unreadState.value) return;
  unreadState.value = false;
  try {
    window.localStorage.setItem(storageKey, item.id);
  } catch {
    // Keep the in-memory state when storage is unavailable.
  }
  window.dispatchEvent(new CustomEvent(readEventName, { detail: { announcementId: item.id } }));
}

function markSystemAnnouncementsAsRead() {
  markAnnouncementAsRead(announcement, readStorageKey, isAnnouncementUnread);
  markAnnouncementAsRead(
    mailboxAnnouncement,
    mailboxReadStorageKey,
    isMailboxAnnouncementUnread,
  );
}

function handleStorage(event) {
  if (event.key === readStorageKey || event.key === mailboxReadStorageKey) syncReadState();
}

function handleReadEvent(event) {
  if (event.detail?.announcementId === announcement.id) isAnnouncementUnread.value = false;
  if (event.detail?.announcementId === mailboxAnnouncement.id) {
    isMailboxAnnouncementUnread.value = false;
  }
}

function closeMenu({ restoreFocus = false } = {}) {
  if (!isOpen.value && !isPinned.value) return;
  clearCloseTimer();
  applyMenuState({ open: false, pinned: false });
  if (restoreFocus) nextTick(() => menuTrigger.value?.focus());
}

function handleFocusOut(event) {
  const next = reduceAnnouncementMenu(menuState(), {
    type: "focus-leave",
    hasTarget: Boolean(event.relatedTarget),
    inside: event.currentTarget.contains(event.relatedTarget),
  });
  if (next.open) return;
  closeMenu();
}

function handleDocumentPointerDown(event) {
  if (isOpen.value && !menuRoot.value?.contains(event.target)) {
    dispatchMenuEvent({ type: "outside-press" });
  }
}

function handleDocumentKeydown(event) {
  if (event.key !== "Escape" || !isOpen.value) return;
  event.preventDefault();
  dispatchMenuEvent({ type: "escape" });
  nextTick(() => menuTrigger.value?.focus());
}
</script>
