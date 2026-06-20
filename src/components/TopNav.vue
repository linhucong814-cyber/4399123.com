<template>
  <nav class="top-nav" :class="{ 'community-route': isCommunityRoute }" aria-label="主导航">
    <div class="brand-lockup">
      <BrandLogo />
      <button class="domain-name" type="button" @click="handleDomainClick">
        {{ domainLabel }}
      </button>
    </div>
    <div class="nav-links">
      <template v-for="item in primaryItems" :key="item.href">
        <div
          v-if="menuItemsByLabel[item.label]"
          class="nav-menu"
          :class="{ 'is-open': openMenuLabel === item.label }"
          @mouseenter="openNavMenu(item.label)"
          @mouseleave="scheduleCloseNavMenu(item.label)"
          @focusin="openNavMenu(item.label)"
          @focusout="handleNavMenuFocusOut($event, item.label)"
        >
          <button v-if="item.label === transitLabel" class="nav-menu-trigger" type="button" aria-haspopup="true">
            {{ item.label }}
          </button>
          <a v-else class="nav-menu-trigger" :href="item.href" :target="item.external ? '_blank' : undefined" :rel="item.external ? 'noopener noreferrer' : undefined" aria-haspopup="true">
            {{ item.label }}
          </a>
          <div class="nav-menu-panel" role="menu" :aria-label="`${item.label} 子菜单`">
            <a v-for="child in menuItemsByLabel[item.label]" :key="child.href" :href="child.href" :target="child.external ? '_blank' : undefined" :rel="child.external ? 'noopener noreferrer' : undefined" role="menuitem">
              {{ child.label }}
            </a>
          </div>
        </div>
        <a v-else :href="item.href" :target="item.external ? '_blank' : undefined" :rel="item.external ? 'noopener noreferrer' : undefined">
          {{ item.label }}
        </a>
      </template>
    </div>
    <div class="nav-actions">
      <button class="theme-toggle" type="button" :aria-label="themeLabel" :title="themeLabel" @click="toggleTheme">
        <span aria-hidden="true">{{ isNightTheme ? "☀" : "☾" }}</span>
      </button>
      <a v-if="!user" class="nav-login" :href="loginHref">登入</a>
      <div
        v-else
        class="nav-user-menu"
        :class="{ 'is-open': isUserMenuOpen }"
        @mouseenter="openUserMenu"
        @mouseleave="scheduleCloseUserMenu"
        @focusin="openUserMenu"
        @focusout="handleUserMenuFocusOut"
      >
        <a class="nav-login nav-user-trigger" href="/account" aria-haspopup="true">
          {{ user.username }}
          <span v-if="unreadCount" class="nav-badge">{{ unreadCount }}</span>
        </a>
        <div class="nav-user-panel" role="menu" aria-label="用户菜单">
          <a href="/account" role="menuitem">用户后台</a>
          <a href="/community?inbox=1" role="menuitem">
            消息
            <span v-if="unreadCount" class="nav-badge inline">{{ unreadCount }}</span>
          </a>
          <a href="/account/settings" role="menuitem">账户设置</a>
          <a href="/help" role="menuitem">帮助中心</a>
          <template v-if="user.isAdmin">
            <a href="/admin" role="menuitem">管理后台</a>
            <a href="/admin/vibe-coding-submissions" role="menuitem">作品审核</a>
          </template>
        </div>
      </div>
      <a v-if="!isCommunityRoute" class="nav-action" href="/community">
        <span class="nav-online-dot" aria-hidden="true"></span>
        进入社区
      </a>
    </div>
  </nav>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import BrandLogo from "./BrandLogo.vue";
import { getCurrentUser } from "../services/auth";
import { getCommunityNotifications } from "../services/community";

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

const vibeCodingLabel = "Vibe Coding";
const transitLabel = "中转站";
const vibeCodingDropdownLabels = new Set(["Image 提示词", "Agent 提示词模板生成器", "番茄钟", "VibeCPU", "AI 人格测试", "Agent AI"]);
const transitDropdownLabels = new Set(["OpenClaw 第三方 API 配置生成器"]);
const hiddenMenuItemLabels = new Set([...vibeCodingDropdownLabels, ...transitDropdownLabels]);
const defaultDomainLabel = "4399123.com";
const easterEggLabel = "致童年与4399的时光";
const domainClickCount = ref(0);
const domainLabel = ref(defaultDomainLabel);
const user = ref(null);
const unreadCount = ref(0);
const isNightTheme = ref(false);
const openMenuLabel = ref("");
const isUserMenuOpen = ref(false);
const themeLabel = computed(() => (isNightTheme.value ? "切换到白天主题" : "切换到夜晚主题"));
const primaryItems = computed(() => props.items.filter((item) => !hiddenMenuItemLabels.has(item.label)));
const menuItemsByLabel = computed(() => ({
  [vibeCodingLabel]: props.items.filter((item) => vibeCodingDropdownLabels.has(item.label)),
  [transitLabel]: [
    {
      label: "Shinemoon 中转站",
      href: "https://shinemoon.com/",
      external: true,
    },
    ...props.items.filter((item) => transitDropdownLabels.has(item.label)),
  ],
}));
const isCommunityRoute = computed(() => props.currentPath === "/community" || props.currentPath === "/community/" || props.currentPath.startsWith("/community/posts/"));
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
let navMenuCloseTimer = 0;
let userMenuCloseTimer = 0;
const menuCloseDelay = 260;

onMounted(() => {
  loadUser();
  loadTheme();
});

onUnmounted(() => {
  if (notificationTimer) window.clearInterval(notificationTimer);
  clearNavMenuCloseTimer();
  clearUserMenuCloseTimer();
});

function loadTheme() {
  const savedTheme = window.localStorage.getItem("site-theme");
  isNightTheme.value =
    savedTheme === "night" ||
    (!savedTheme && window.matchMedia?.("(prefers-color-scheme: dark)").matches);
  applyTheme();
}

function applyTheme() {
  document.documentElement.dataset.theme = isNightTheme.value ? "night" : "light";
  document.documentElement.style.colorScheme = isNightTheme.value ? "dark" : "light";
  window.localStorage.setItem("site-theme", isNightTheme.value ? "night" : "light");
}

function toggleTheme() {
  isNightTheme.value = !isNightTheme.value;
  applyTheme();
}

async function loadUser() {
  try {
    const data = await getCurrentUser();
    user.value = data.user || null;
    if (user.value) {
      await loadUnreadCount();
      notificationTimer = window.setInterval(loadUnreadCount, 45000);
    }
  } catch {
    user.value = null;
    unreadCount.value = 0;
  }
}

async function loadUnreadCount() {
  try {
    const data = await getCommunityNotifications();
    unreadCount.value = Number(data.unread || 0);
  } catch {
    unreadCount.value = 0;
  }
}

function handleDomainClick() {
  if (domainLabel.value === easterEggLabel) {
    return;
  }

  domainClickCount.value += 1;

  if (domainClickCount.value >= 4) {
    domainLabel.value = easterEggLabel;
  }
}

function clearNavMenuCloseTimer() {
  if (navMenuCloseTimer) {
    window.clearTimeout(navMenuCloseTimer);
    navMenuCloseTimer = 0;
  }
}

function clearUserMenuCloseTimer() {
  if (userMenuCloseTimer) {
    window.clearTimeout(userMenuCloseTimer);
    userMenuCloseTimer = 0;
  }
}

function openNavMenu(label) {
  clearNavMenuCloseTimer();
  openMenuLabel.value = label;
}

function scheduleCloseNavMenu(label) {
  clearNavMenuCloseTimer();
  navMenuCloseTimer = window.setTimeout(() => {
    if (openMenuLabel.value === label) {
      openMenuLabel.value = "";
    }
  }, menuCloseDelay);
}

function handleNavMenuFocusOut(event, label) {
  if (!event.currentTarget.contains(event.relatedTarget)) {
    scheduleCloseNavMenu(label);
  }
}

function openUserMenu() {
  clearUserMenuCloseTimer();
  isUserMenuOpen.value = true;
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
</script>
