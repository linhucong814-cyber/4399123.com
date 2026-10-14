<template>
  <nav
    class="site-nav"
    :class="{
      'site-nav--community': isCommunityRoute,
      'site-nav--home': isHomeRoute,
      'site-nav--scrolled': isPageScrolled,
    }"
    aria-label="主导航"
  >
    <div class="site-nav-shell">
      <a class="site-nav-brand site-nav-wordmark" href="/" aria-label="4399123 首页">
        <img class="site-nav-brand-logo" src="/assets/brand/4399123-domain-logo-transparent.png" alt="" width="40" height="40" />
        <span>4399123.com</span>
      </a>

      <div class="site-nav-desktop">
        <div class="site-nav-primary" aria-label="主要入口">
          <a class="site-nav-link" :class="{ 'site-nav-link--active': isHomeRoute }" href="/" :aria-current="isHomeRoute ? 'page' : undefined">首页</a>
          <a
            v-for="item in primaryItems"
            :key="item.href"
            class="site-nav-link"
            :class="{ 'site-nav-link--active': isPrimaryItemActive(item) }"
            :href="item.href"
            :aria-current="isPrimaryItemActive(item) ? 'page' : undefined"
          >
            {{ item.label }}
          </a>

          <div
            ref="tutorialsMenuRoot"
            class="site-nav-menu"
            :class="{
              'site-nav-menu--open': isTutorialsMenuOpen,
              'site-nav-menu--active': isTutorialsRoute,
            }"
            @mouseenter="openTutorialsMenu"
            @mouseleave="scheduleCloseTutorialsMenu"
            @focusout="handleTutorialsMenuFocusOut"
          >
            <button
              ref="tutorialsMenuTrigger"
              id="site-nav-tutorials-trigger"
              class="site-nav-menu-trigger"
              type="button"
              aria-haspopup="menu"
              :aria-expanded="isTutorialsMenuOpen"
              aria-controls="site-nav-tutorials-menu"
              @click="toggleTutorialsMenu"
            >
              教程
              <span class="site-nav-menu-caret" aria-hidden="true">⌄</span>
            </button>
            <div
              v-show="isTutorialsMenuOpen"
              id="site-nav-tutorials-menu"
              class="site-nav-menu-panel site-nav-tutorials-panel"
              role="menu"
              aria-labelledby="site-nav-tutorials-trigger"
            >
              <a
                v-for="item in tutorialItems"
                :key="item.href"
                class="site-nav-menu-item"
                :class="{ 'site-nav-menu-item--active': isItemActive(item) }"
                :href="item.href"
                :target="item.external ? '_blank' : undefined"
                :rel="item.external ? 'noopener noreferrer' : undefined"
                :aria-current="isItemActive(item) ? 'page' : undefined"
                role="menuitem"
              >
                {{ item.label }}
                <span v-if="item.external" class="site-nav-external" aria-hidden="true">↗</span>
              </a>
            </div>
          </div>

          <div
            ref="toolsMenuRoot"
            class="site-nav-menu"
            :class="{
              'site-nav-menu--open': isToolsMenuOpen,
              'site-nav-menu--active': isToolsRoute,
            }"
            @mouseenter="openToolsMenu"
            @mouseleave="scheduleCloseToolsMenu"
            @focusout="handleToolsMenuFocusOut"
          >
            <button
              ref="toolsMenuTrigger"
              id="site-nav-tools-trigger"
              class="site-nav-menu-trigger"
              type="button"
              aria-haspopup="menu"
              :aria-expanded="isToolsMenuOpen"
              aria-controls="site-nav-tools-menu"
              @click="toggleToolsMenu"
            >
              Tools
              <span class="site-nav-menu-caret" aria-hidden="true">⌄</span>
            </button>
            <div
              v-show="isToolsMenuOpen"
              id="site-nav-tools-menu"
              class="site-nav-menu-panel site-nav-tools-panel"
              role="menu"
              aria-labelledby="site-nav-tools-trigger"
            >
              <a
                v-for="item in toolsItems"
                :key="item.href"
                class="site-nav-menu-item"
                :class="{ 'site-nav-menu-item--active': isItemActive(item) }"
                :href="item.href"
                :target="item.external ? '_blank' : undefined"
                :rel="item.external ? 'noopener noreferrer' : undefined"
                :aria-current="isItemActive(item) ? 'page' : undefined"
                role="menuitem"
              >
                {{ item.label }}
                <span v-if="item.external" class="site-nav-external" aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </div>

        <div class="site-nav-actions">
          <SystemAnnouncementMenu
            class="system-announcement-menu--desktop"
            :unread-count="unreadCount"
            @count-change="handleNotificationCountChange"
          />
          <a v-if="!user" class="site-nav-login" :href="loginHref">登入</a>
          <div
            v-else
            ref="userMenuRoot"
            class="site-nav-menu site-nav-account-menu"
            :class="{ 'site-nav-menu--open': isUserMenuOpen }"
            @mouseenter="openUserMenu"
            @mouseleave="scheduleCloseUserMenu"
            @focusout="handleUserMenuFocusOut"
          >
            <button
              ref="userMenuTrigger"
              id="site-nav-account-trigger"
              class="site-nav-account-trigger"
              type="button"
              aria-haspopup="menu"
              :aria-expanded="isUserMenuOpen"
              aria-controls="site-nav-account-menu"
              @click="toggleUserMenu"
            >
              <span class="site-nav-account-name">{{ user.username }}</span>
              <span v-if="unreadCount" class="site-nav-badge">{{ unreadCount }}</span>
              <span class="site-nav-menu-caret" aria-hidden="true">⌄</span>
            </button>
            <div
              v-show="isUserMenuOpen"
              id="site-nav-account-menu"
              class="site-nav-menu-panel site-nav-account-panel"
              role="menu"
              aria-labelledby="site-nav-account-trigger"
            >
              <a class="site-nav-menu-item" href="/account" role="menuitem">用户后台</a>
              <a class="site-nav-menu-item" href="/community?inbox=1" role="menuitem">
                消息
                <span v-if="unreadCount" class="site-nav-badge site-nav-badge--inline">
                  {{ unreadCount }}
                </span>
              </a>
              <a class="site-nav-menu-item" href="/account/settings" role="menuitem">账户设置</a>
              <a class="site-nav-menu-item" href="/help" role="menuitem">帮助中心</a>
              <template v-if="user.isAdmin">
                <a class="site-nav-menu-item" href="/admin" role="menuitem">管理后台</a>
                <a class="site-nav-menu-item" href="/admin/vibe-coding-submissions" role="menuitem">
                  作品审核
                </a>
              </template>
            </div>
          </div>

          <a
            class="site-nav-submit"
            href="/vibe-coding/share"
            :class="{ 'site-nav-submit--active': isSubmissionRoute }"
            :aria-current="isSubmissionRoute ? 'page' : undefined"
          >
            投稿
          </a>
        </div>
      </div>

      <div class="site-nav-mobile-actions">
        <SystemAnnouncementMenu
          class="system-announcement-menu--mobile"
          :unread-count="unreadCount"
          @count-change="handleNotificationCountChange"
        />
        <button
          ref="mobileMenuTrigger"
          class="site-nav-mobile-trigger"
          type="button"
          aria-haspopup="dialog"
          :aria-expanded="isMobileMenuOpen"
          aria-controls="site-nav-mobile-dialog"
          :aria-label="isMobileMenuOpen ? '关闭导航菜单' : '打开导航菜单'"
          @click="toggleMobileMenu"
        >
          <span class="site-nav-mobile-trigger-icon" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </span>
          <span class="site-nav-mobile-trigger-text">菜单</span>
        </button>
      </div>

    </div>
  </nav>

  <Teleport to="body">
    <div v-if="isMobileMenuOpen" class="site-nav-drawer-layer">
      <button
        class="site-nav-drawer-backdrop"
        type="button"
        tabindex="-1"
        aria-label="关闭导航菜单"
        @click="closeMobileMenu"
      ></button>
      <section
        id="site-nav-mobile-dialog"
        ref="mobileDrawer"
        class="site-nav-drawer"
        role="dialog"
        tabindex="-1"
        aria-modal="true"
        aria-labelledby="site-nav-drawer-title"
      >
        <div class="site-nav-drawer-head">
          <div>
            <p class="site-nav-drawer-kicker">4399123</p>
            <h2 id="site-nav-drawer-title" class="site-nav-drawer-title">导航菜单</h2>
          </div>
          <button
            ref="mobileCloseButton"
            class="site-nav-drawer-close"
            type="button"
            aria-label="关闭导航菜单"
            @click="closeMobileMenu"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <div class="site-nav-drawer-body">
          <div class="site-nav-drawer-section" aria-labelledby="site-nav-mobile-primary-title">
            <h3 id="site-nav-mobile-primary-title" class="site-nav-drawer-label">探索</h3>
            <a
              v-for="item in primaryItems"
              :key="`mobile-${item.href}`"
              class="site-nav-drawer-link site-nav-drawer-link--primary"
              :class="{ 'site-nav-drawer-link--active': isPrimaryItemActive(item) }"
              :href="item.href"
              :aria-current="isPrimaryItemActive(item) ? 'page' : undefined"
              @click="closeMobileMenu"
            >
              {{ item.label }}
            </a>
          </div>

          <div class="site-nav-drawer-section" aria-labelledby="site-nav-mobile-tutorials-title">
            <h3 id="site-nav-mobile-tutorials-title" class="site-nav-drawer-label">教程</h3>
            <a
              v-for="item in tutorialItems"
              :key="`mobile-tutorial-${item.href}`"
              class="site-nav-drawer-link"
              :class="{ 'site-nav-drawer-link--active': isItemActive(item) }"
              :href="item.href"
              :target="item.external ? '_blank' : undefined"
              :rel="item.external ? 'noopener noreferrer' : undefined"
              :aria-current="isItemActive(item) ? 'page' : undefined"
              @click="closeMobileMenu"
            >
              {{ item.label }}
              <span v-if="item.external" class="site-nav-external" aria-hidden="true">↗</span>
            </a>
          </div>

          <div class="site-nav-drawer-section" aria-labelledby="site-nav-mobile-tools-title">
            <h3 id="site-nav-mobile-tools-title" class="site-nav-drawer-label">Tools</h3>
            <a
              v-for="item in toolsItems"
              :key="`mobile-tool-${item.href}`"
              class="site-nav-drawer-link"
              :class="{ 'site-nav-drawer-link--active': isItemActive(item) }"
              :href="item.href"
              :target="item.external ? '_blank' : undefined"
              :rel="item.external ? 'noopener noreferrer' : undefined"
              :aria-current="isItemActive(item) ? 'page' : undefined"
              @click="closeMobileMenu"
            >
              {{ item.label }}
              <span v-if="item.external" class="site-nav-external" aria-hidden="true">↗</span>
            </a>
          </div>

          <div class="site-nav-drawer-section" aria-labelledby="site-nav-mobile-account-title">
            <h3 id="site-nav-mobile-account-title" class="site-nav-drawer-label">账户</h3>
            <a
              v-if="!user"
              class="site-nav-drawer-link"
              :href="loginHref"
              @click="closeMobileMenu"
            >
              登入
            </a>
            <template v-else>
              <a class="site-nav-drawer-link" href="/account" @click="closeMobileMenu">
                {{ user.username }} · 用户后台
              </a>
              <a class="site-nav-drawer-link" href="/community?inbox=1" @click="closeMobileMenu">
                消息
                <span v-if="unreadCount" class="site-nav-badge site-nav-badge--inline">
                  {{ unreadCount }}
                </span>
              </a>
              <a class="site-nav-drawer-link" href="/account/settings" @click="closeMobileMenu">
                账户设置
              </a>
              <a class="site-nav-drawer-link" href="/help" @click="closeMobileMenu">帮助中心</a>
              <template v-if="user.isAdmin">
                <a class="site-nav-drawer-link" href="/admin" @click="closeMobileMenu">管理后台</a>
                <a
                  class="site-nav-drawer-link"
                  href="/admin/vibe-coding-submissions"
                  @click="closeMobileMenu"
                >
                  作品审核
                </a>
              </template>
            </template>
          </div>
        </div>

        <div class="site-nav-drawer-actions site-nav-drawer-actions--single">
          <a
            class="site-nav-drawer-submit"
            href="/vibe-coding/share"
            :aria-current="isSubmissionRoute ? 'page' : undefined"
            @click="closeMobileMenu"
          >
            投稿作品
          </a>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { authState, refreshAuth } from "../services/authState";
import { getCommunityNotifications } from "../services/community";
import SystemAnnouncementMenu from "./SystemAnnouncementMenu.vue";

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  currentPath: {
    type: String,
    default: "/",
  },
});

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

const user = computed(() => authState.user);
const unreadCount = ref(0);
const isPageScrolled = ref(false);
const isTutorialsMenuOpen = ref(false);
const isToolsMenuOpen = ref(false);
const isUserMenuOpen = ref(false);
const isMobileMenuOpen = ref(false);
const tutorialsMenuRoot = ref(null);
const tutorialsMenuTrigger = ref(null);
const toolsMenuRoot = ref(null);
const toolsMenuTrigger = ref(null);
const userMenuRoot = ref(null);
const userMenuTrigger = ref(null);
const mobileMenuTrigger = ref(null);
const mobileDrawer = ref(null);
const mobileCloseButton = ref(null);

const primaryItems = computed(() => props.items.filter((item) => item.primary));
const tutorialItems = computed(() => props.items.filter((item) => item.group === "tutorials"));
const toolsItems = computed(
  () => props.items.filter((item) => !item.primary && item.group !== "tutorials"),
);
const currentComparablePath = computed(() => normalizePath(props.currentPath));
const isTutorialsRoute = computed(() => tutorialItems.value.some((item) => isItemActive(item)));
const isToolsRoute = computed(() => toolsItems.value.some((item) => isItemActive(item)));
const isCommunityRoute = computed(
  () =>
    currentComparablePath.value === "/community" ||
    currentComparablePath.value.startsWith("/community/"),
);
const isHomeRoute = computed(() => currentComparablePath.value === "/");
const isSubmissionRoute = computed(
  () => currentComparablePath.value === "/vibe-coding/share",
);
const loginHref = computed(() => {
  const current = `${window.location.pathname}${window.location.search}`;
  if (current.startsWith("/login")) return "/login";
  if (current.startsWith("/register")) {
    const next = new URLSearchParams(window.location.search).get("next");
    return next ? `/login?next=${encodeURIComponent(next)}` : "/login";
  }
  return `/login?next=${encodeURIComponent(current)}`;
});

let notificationTimer = 0;
let tutorialsMenuCloseTimer = 0;
let toolsMenuCloseTimer = 0;
let userMenuCloseTimer = 0;
let previousBodyOverflow = "";
let isBodyScrollLockedByNav = false;
const menuCloseDelay = 260;

watch(user, syncNotificationPolling, { immediate: true });

onMounted(() => {
  loadUser();
  syncPageScroll();
  window.addEventListener("scroll", syncPageScroll, { passive: true });
  document.addEventListener("pointerdown", handleDocumentPointerDown);
  document.addEventListener("keydown", handleDocumentKeydown);
});

onUnmounted(() => {
  if (notificationTimer) window.clearInterval(notificationTimer);
  clearTutorialsMenuCloseTimer();
  clearToolsMenuCloseTimer();
  clearUserMenuCloseTimer();
  window.removeEventListener("scroll", syncPageScroll);
  document.removeEventListener("pointerdown", handleDocumentPointerDown);
  document.removeEventListener("keydown", handleDocumentKeydown);
  unlockBodyScroll();
});

function syncPageScroll() {
  isPageScrolled.value = window.scrollY > 32;
}

function normalizePath(path) {
  if (!path || typeof path !== "string") return "/";
  const pathname = path.split(/[?#]/, 1)[0] || "/";
  return pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
}

function itemPath(item) {
  if (!item?.href || item.external || !item.href.startsWith("/")) return "";
  return normalizePath(item.href);
}

function isItemActive(item) {
  const path = itemPath(item);
  return Boolean(
    path &&
      (currentComparablePath.value === path || currentComparablePath.value.startsWith(`${path}/`)),
  );
}

function isPrimaryItemActive(item) {
  if (
    itemPath(item) === "/vibe-coding" &&
    (isTutorialsRoute.value || isToolsRoute.value || isSubmissionRoute.value)
  ) {
    return false;
  }
  return isItemActive(item);
}

async function loadUser() {
  try {
    await refreshAuth();
  } catch {
    unreadCount.value = 0;
  }
}

function syncNotificationPolling(nextUser) {
  if (notificationTimer) {
    window.clearInterval(notificationTimer);
    notificationTimer = 0;
  }
  if (!nextUser) {
    unreadCount.value = 0;
    return;
  }
  loadUnreadCount();
  notificationTimer = window.setInterval(loadUnreadCount, 45000);
}

async function loadUnreadCount() {
  try {
    const data = await getCommunityNotifications();
    unreadCount.value = Number(data.unread || 0);
  } catch {
    unreadCount.value = 0;
  }
}

function handleNotificationCountChange(count) {
  unreadCount.value = Math.max(0, Number(count) || 0);
}

function clearTutorialsMenuCloseTimer() {
  if (!tutorialsMenuCloseTimer) return;
  window.clearTimeout(tutorialsMenuCloseTimer);
  tutorialsMenuCloseTimer = 0;
}

function clearToolsMenuCloseTimer() {
  if (!toolsMenuCloseTimer) return;
  window.clearTimeout(toolsMenuCloseTimer);
  toolsMenuCloseTimer = 0;
}

function clearUserMenuCloseTimer() {
  if (!userMenuCloseTimer) return;
  window.clearTimeout(userMenuCloseTimer);
  userMenuCloseTimer = 0;
}

function openTutorialsMenu() {
  clearTutorialsMenuCloseTimer();
  clearToolsMenuCloseTimer();
  clearUserMenuCloseTimer();
  isToolsMenuOpen.value = false;
  isUserMenuOpen.value = false;
  isTutorialsMenuOpen.value = true;
}

function toggleTutorialsMenu() {
  clearTutorialsMenuCloseTimer();
  const nextState = !isTutorialsMenuOpen.value;
  isToolsMenuOpen.value = false;
  isUserMenuOpen.value = false;
  isTutorialsMenuOpen.value = nextState;
}

function scheduleCloseTutorialsMenu() {
  clearTutorialsMenuCloseTimer();
  tutorialsMenuCloseTimer = window.setTimeout(() => {
    isTutorialsMenuOpen.value = false;
  }, menuCloseDelay);
}

function handleTutorialsMenuFocusOut(event) {
  if (!event.currentTarget.contains(event.relatedTarget)) {
    scheduleCloseTutorialsMenu();
  }
}

function openToolsMenu() {
  clearTutorialsMenuCloseTimer();
  clearToolsMenuCloseTimer();
  clearUserMenuCloseTimer();
  isTutorialsMenuOpen.value = false;
  isUserMenuOpen.value = false;
  isToolsMenuOpen.value = true;
}

function toggleToolsMenu() {
  clearToolsMenuCloseTimer();
  const nextState = !isToolsMenuOpen.value;
  isTutorialsMenuOpen.value = false;
  isUserMenuOpen.value = false;
  isToolsMenuOpen.value = nextState;
}

function scheduleCloseToolsMenu() {
  clearToolsMenuCloseTimer();
  toolsMenuCloseTimer = window.setTimeout(() => {
    isToolsMenuOpen.value = false;
  }, menuCloseDelay);
}

function handleToolsMenuFocusOut(event) {
  if (!event.currentTarget.contains(event.relatedTarget)) {
    scheduleCloseToolsMenu();
  }
}

function openUserMenu() {
  clearTutorialsMenuCloseTimer();
  clearUserMenuCloseTimer();
  clearToolsMenuCloseTimer();
  isTutorialsMenuOpen.value = false;
  isToolsMenuOpen.value = false;
  isUserMenuOpen.value = true;
}

function toggleUserMenu() {
  clearUserMenuCloseTimer();
  const nextState = !isUserMenuOpen.value;
  isTutorialsMenuOpen.value = false;
  isToolsMenuOpen.value = false;
  isUserMenuOpen.value = nextState;
}

function scheduleCloseUserMenu() {
  clearUserMenuCloseTimer();
  userMenuCloseTimer = window.setTimeout(() => {
    isUserMenuOpen.value = false;
  }, menuCloseDelay);
}

function handleUserMenuFocusOut(event) {
  if (!event.currentTarget.contains(event.relatedTarget)) {
    scheduleCloseUserMenu();
  }
}

function handleDocumentPointerDown(event) {
  if (isTutorialsMenuOpen.value && !tutorialsMenuRoot.value?.contains(event.target)) {
    isTutorialsMenuOpen.value = false;
  }
  if (isToolsMenuOpen.value && !toolsMenuRoot.value?.contains(event.target)) {
    isToolsMenuOpen.value = false;
  }
  if (isUserMenuOpen.value && !userMenuRoot.value?.contains(event.target)) {
    isUserMenuOpen.value = false;
  }
}

function handleDocumentKeydown(event) {
  if (isMobileMenuOpen.value) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeMobileMenu();
      return;
    }
    if (event.key === "Tab") {
      trapMobileFocus(event);
    }
    return;
  }

  if (event.key !== "Escape") return;
  if (isTutorialsMenuOpen.value) {
    event.preventDefault();
    isTutorialsMenuOpen.value = false;
    nextTick(() => tutorialsMenuTrigger.value?.focus());
  } else if (isToolsMenuOpen.value) {
    event.preventDefault();
    isToolsMenuOpen.value = false;
    nextTick(() => toolsMenuTrigger.value?.focus());
  } else if (isUserMenuOpen.value) {
    event.preventDefault();
    isUserMenuOpen.value = false;
    nextTick(() => userMenuTrigger.value?.focus());
  }
}

function toggleMobileMenu() {
  if (isMobileMenuOpen.value) {
    closeMobileMenu();
  } else {
    openMobileMenu();
  }
}

function openMobileMenu() {
  if (isMobileMenuOpen.value) return;
  isTutorialsMenuOpen.value = false;
  isToolsMenuOpen.value = false;
  isUserMenuOpen.value = false;
  isMobileMenuOpen.value = true;
  lockBodyScroll();
  nextTick(() => mobileCloseButton.value?.focus());
}

function closeMobileMenu() {
  if (!isMobileMenuOpen.value) return;
  isMobileMenuOpen.value = false;
  unlockBodyScroll();
  nextTick(() => mobileMenuTrigger.value?.focus());
}

function lockBodyScroll() {
  if (isBodyScrollLockedByNav) return;
  previousBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  isBodyScrollLockedByNav = true;
}

function unlockBodyScroll() {
  if (!isBodyScrollLockedByNav) return;
  document.body.style.overflow = previousBodyOverflow;
  previousBodyOverflow = "";
  isBodyScrollLockedByNav = false;
}

function trapMobileFocus(event) {
  const drawer = mobileDrawer.value;
  if (!drawer) return;

  const focusableElements = Array.from(drawer.querySelectorAll(focusableSelector)).filter(
    (element) => element.getClientRects().length > 0 && element.getAttribute("aria-hidden") !== "true",
  );
  if (!focusableElements.length) {
    event.preventDefault();
    drawer.focus();
    return;
  }

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  const activeElement = document.activeElement;

  if (event.shiftKey && (activeElement === firstElement || !drawer.contains(activeElement))) {
    event.preventDefault();
    lastElement.focus();
  } else if (!event.shiftKey && (activeElement === lastElement || !drawer.contains(activeElement))) {
    event.preventDefault();
    firstElement.focus();
  }
}
</script>
