<template>
  <nav class="top-nav" aria-label="主导航">
    <div class="brand-lockup">
      <BrandLogo />
      <button class="domain-name" type="button" @click="handleDomainClick">
        {{ domainLabel }}
      </button>
    </div>
    <div class="nav-links">
      <template v-for="item in primaryItems" :key="item.href">
        <div v-if="item.label === vibeCodingLabel" class="nav-menu">
          <a class="nav-menu-trigger" :href="item.href" aria-haspopup="true">
            {{ item.label }}
          </a>
          <div class="nav-menu-panel" role="menu" aria-label="Vibe Coding 工具">
            <a v-for="child in vibeCodingItems" :key="child.href" :href="child.href" role="menuitem">
              {{ child.label }}
            </a>
          </div>
        </div>
        <a v-else :href="item.href">
          {{ item.label }}
        </a>
      </template>
    </div>
    <div class="nav-actions">
      <button class="theme-toggle" type="button" :aria-label="themeLabel" :title="themeLabel" @click="toggleTheme">
        <span aria-hidden="true">{{ isNightTheme ? "☀" : "☾" }}</span>
      </button>
      <a class="nav-login" :href="user ? '/account' : '/login'">{{ user ? user.username : "登入" }}</a>
      <a v-if="user" class="nav-inbox" href="/community?inbox=1" aria-label="社区消息信箱">
        消息
        <span v-if="unreadCount" class="nav-badge">{{ unreadCount }}</span>
      </a>
      <a class="nav-action" href="/community">进入社区</a>
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
});

const dropdownLabels = new Set(["Image 提示词", "番茄钟", "VibeCPU", "AI 人格测试", "Agent AI"]);
const vibeCodingLabel = "Vibe Coding";
const defaultDomainLabel = "4399123.com";
const easterEggLabel = "致童年与4399的时光";
const domainClickCount = ref(0);
const domainLabel = ref(defaultDomainLabel);
const user = ref(null);
const unreadCount = ref(0);
const isNightTheme = ref(false);
const themeLabel = computed(() => (isNightTheme.value ? "切换到白天主题" : "切换到夜晚主题"));
const primaryItems = computed(() => props.items.filter((item) => !dropdownLabels.has(item.label)));
const vibeCodingItems = computed(() => props.items.filter((item) => dropdownLabels.has(item.label)));
let notificationTimer = 0;

onMounted(() => {
  loadUser();
  loadTheme();
});

onUnmounted(() => {
  if (notificationTimer) window.clearInterval(notificationTimer);
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
</script>
