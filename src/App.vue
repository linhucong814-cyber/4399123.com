<template>
  <main class="site-shell">
    <TopNav :items="navigationItems" :current-path="currentPath" />
    <AuthFormPage v-if="isLoginRoute" mode="login" />
    <AuthFormPage v-else-if="isRegisterRoute" mode="register" />
    <EmailVerifyPage v-else-if="isVerifyEmailRoute" />
    <AccountPage v-else-if="isAccountRoute" />
    <AccountSettingsPage v-else-if="isAccountSettingsRoute" />
    <AdminDashboardPage v-else-if="isAdminRoute" />
    <AdminUsersPage v-else-if="isAdminUsersRoute" />
    <AdminGameRecordsPage v-else-if="isAdminGameRecordsRoute" />
    <AdminVibeCodingSubmissionsPage v-else-if="isAdminVibeCodingSubmissionsRoute" />
    <HelpCenterPage v-else-if="isHelpRoute" />
    <UserProfilePage v-else-if="isUserProfileRoute" :user-id="userProfileId" />
    <CommunityPage v-else-if="isCommunityRoute" :post-id="communityPostId" />
    <BlogPage v-else-if="isBlogRoute" :slug="blogSlug" />
    <VibeCodingShowcasePage
      v-else-if="isVibeCodingShowcaseRoute"
      :submissions="vibeCodingSubmissions"
      :submissions-loading="vibeCodingSubmissionsLoading"
      :submissions-error="vibeCodingSubmissionsError"
    />
    <VibeCodingSharePage v-else-if="isVibeCodingShareRoute" />
    <VibeCodingPage
      v-else-if="isVibeCodingRoute"
      :projects="vibeCodingProjects"
      :posts="vibeCodingPosts"
      :submissions="vibeCodingSubmissions"
      :submissions-loading="vibeCodingSubmissionsLoading"
      :submissions-error="vibeCodingSubmissionsError"
    />
    <HomePage v-else-if="isHomeRoute" />
    <section v-else class="not-found-page">
      <p class="eyebrow">404</p>
      <h1>没有找到这个入口</h1>
      <p>这个地址暂时没有对应内容，可以回到首页或打开离线小游戏。</p>
      <div class="hero-actions">
        <a class="primary-link" href="/">返回首页</a>
        <a class="secondary-link" href="/404notfound/">打开 404 游戏</a>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watchEffect } from "vue";
import BlogPage from "./components/BlogPage.vue";
import CommunityPage from "./components/CommunityPage.vue";
import AccountPage from "./components/auth/AccountPage.vue";
import AccountSettingsPage from "./components/auth/AccountSettingsPage.vue";
import AdminDashboardPage from "./components/auth/AdminDashboardPage.vue";
import AdminGameRecordsPage from "./components/auth/AdminGameRecordsPage.vue";
import AdminVibeCodingSubmissionsPage from "./components/auth/AdminVibeCodingSubmissionsPage.vue";
import AdminUsersPage from "./components/auth/AdminUsersPage.vue";
import AuthFormPage from "./components/auth/AuthFormPage.vue";
import EmailVerifyPage from "./components/auth/EmailVerifyPage.vue";
import HelpCenterPage from "./components/HelpCenterPage.vue";
import HomePage from "./components/HomePage.vue";
import TopNav from "./components/TopNav.vue";
import UserProfilePage from "./components/UserProfilePage.vue";
import VibeCodingPage from "./components/VibeCodingPage.vue";
import VibeCodingSharePage from "./components/VibeCodingSharePage.vue";
import VibeCodingShowcasePage from "./components/VibeCodingShowcasePage.vue";
import {
  navigationItems,
  vibeCodingProjects as fallbackVibeCodingProjects,
} from "./data/site";
import { localBlogPosts } from "./data/content";
import { getApprovedVibeCodingSubmissions } from "./services/vibeCoding";
import { defaultSeo, setPageSeo } from "./utils/seo";

const currentPath = ref(window.location.pathname);
const vibeCodingProjects = ref([...fallbackVibeCodingProjects]);
const vibeCodingSubmissions = ref([]);
const vibeCodingSubmissionsLoading = ref(false);
const vibeCodingSubmissionsError = ref("");
const vibeCodingPosts = localBlogPosts.filter((post) =>
  post.tags?.some((tag) => tag.toLowerCase() === "vibe coding"),
);

const isHomeRoute = computed(() => currentPath.value === "/");
const isLoginRoute = computed(() => currentPath.value === "/login" || currentPath.value === "/login/");
const isRegisterRoute = computed(() => currentPath.value === "/register" || currentPath.value === "/register/");
const isVerifyEmailRoute = computed(() => currentPath.value === "/verify-email" || currentPath.value === "/verify-email/");
const isAccountRoute = computed(() => currentPath.value === "/account" || currentPath.value === "/account/");
const isAccountSettingsRoute = computed(() => currentPath.value === "/account/settings" || currentPath.value === "/account/settings/");
const isAdminRoute = computed(() => currentPath.value === "/admin" || currentPath.value === "/admin/");
const isAdminUsersRoute = computed(() => currentPath.value === "/admin/users" || currentPath.value === "/admin/users/");
const isAdminGameRecordsRoute = computed(() => currentPath.value === "/admin/game-records" || currentPath.value === "/admin/game-records/");
const isAdminVibeCodingSubmissionsRoute = computed(
  () => currentPath.value === "/admin/vibe-coding-submissions" || currentPath.value === "/admin/vibe-coding-submissions/",
);
const isHelpRoute = computed(() => currentPath.value === "/help" || currentPath.value === "/help/");
const isUserProfileRoute = computed(() => /^\/users\/[^/]+\/?$/.test(currentPath.value));
const isCommunityRoute = computed(
  () =>
    currentPath.value === "/community" ||
    currentPath.value === "/community/" ||
    currentPath.value.startsWith("/community/posts/"),
);
const isBlogRoute = computed(
  () => currentPath.value === "/blog" || currentPath.value.startsWith("/blog/"),
);
const isVibeCodingRoute = computed(
  () =>
    currentPath.value === "/vibe-coding" ||
    currentPath.value === "/vibe-coding/",
);
const isVibeCodingShowcaseRoute = computed(
  () =>
    currentPath.value === "/vibe-coding/showcase" ||
    currentPath.value === "/vibe-coding/showcase/",
);
const isVibeCodingShareRoute = computed(() => currentPath.value === "/vibe-coding/share" || currentPath.value === "/vibe-coding/share/");
const blogSlug = computed(() => {
  if (!currentPath.value.startsWith("/blog/")) {
    return "";
  }

  return decodeURIComponent(currentPath.value.replace(/^\/blog\/?/, "").replace(/\/$/, ""));
});
const communityPostId = computed(() => {
  if (!currentPath.value.startsWith("/community/posts/")) {
    return "";
  }

  return decodeURIComponent(currentPath.value.replace(/^\/community\/posts\/?/, "").replace(/\/$/, ""));
});
const userProfileId = computed(() => {
  if (!currentPath.value.startsWith("/users/")) {
    return "";
  }

  return decodeURIComponent(currentPath.value.replace(/^\/users\/?/, "").replace(/\/$/, ""));
});

function syncPath() {
  currentPath.value = window.location.pathname;
}

function notifyRouteChange() {
  window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
}

onMounted(() => {
  window.addEventListener("popstate", syncPath);
  window.addEventListener("community:navigate", notifyRouteChange);
  if (!isHomeRoute.value) {
    loadVibeCodingProjects();
    loadVibeCodingSubmissions();
  }
});

onUnmounted(() => {
  window.removeEventListener("popstate", syncPath);
  window.removeEventListener("community:navigate", notifyRouteChange);
});

async function loadVibeCodingProjects() {
  try {
    const response = await fetch("/api/vibe-coding/projects", {
      credentials: "same-origin",
    });
    if (!response.ok) {
      throw new Error("projects_request_failed");
    }

    const data = await response.json();
    const remoteProjects = Array.isArray(data.projects) ? data.projects : [];
    vibeCodingProjects.value = mergeProjects(remoteProjects, fallbackVibeCodingProjects);
  } catch {
    vibeCodingProjects.value = [...fallbackVibeCodingProjects];
  }
}

async function loadVibeCodingSubmissions() {
  vibeCodingSubmissionsLoading.value = true;
  vibeCodingSubmissionsError.value = "";
  try {
    const data = await getApprovedVibeCodingSubmissions();
    vibeCodingSubmissions.value = Array.isArray(data.submissions) ? data.submissions : [];
  } catch {
    vibeCodingSubmissions.value = [];
    vibeCodingSubmissionsError.value = "";
  } finally {
    vibeCodingSubmissionsLoading.value = false;
  }
}

function mergeProjects(remoteProjects, fallbackProjects) {
  const map = new Map();
  for (const project of remoteProjects) {
    map.set(projectKey(project), normalizeProject(project));
  }
  for (const project of fallbackProjects) {
    const key = projectKey(project);
    map.set(key, {
      ...project,
      ...map.get(key),
      tags: map.get(key)?.tags || project.tags || [],
      image: map.get(key)?.image || project.image,
      imageAlt: map.get(key)?.imageAlt || project.imageAlt,
      actionLabel: map.get(key)?.actionLabel || project.actionLabel,
    });
  }
  return Array.from(map.values());
}

function normalizeProject(project) {
  if ((project.href || "").replace(/\/?$/, "/") !== "/vibe-coding/404notfound/") {
    return project;
  }

  return {
    ...project,
    href: "/404notfound/",
  };
}

function projectKey(project) {
  return normalizeProject(project).href || project.id;
}

watchEffect(() => {
  if (isHomeRoute.value) {
    defaultSeo();
    return;
  }

  if (isVibeCodingRoute.value) {
    setPageSeo({
      title: "Vibe Coding",
      description: "4399123 的 AI 小实验、互动工具和快速成型项目入口。",
      path: "/vibe-coding",
    });
    return;
  }

  if (!isBlogRoute.value && !isLoginRoute.value && !isRegisterRoute.value && !isVerifyEmailRoute.value && !isAccountRoute.value && !isAccountSettingsRoute.value && !isAdminRoute.value && !isAdminUsersRoute.value && !isAdminGameRecordsRoute.value && !isAdminVibeCodingSubmissionsRoute.value && !isHelpRoute.value && !isUserProfileRoute.value && !isCommunityRoute.value && !isVibeCodingShowcaseRoute.value && !isVibeCodingShareRoute.value) {
    setPageSeo({
      title: "404",
      description: "4399123 暂时没有找到这个入口。",
      path: currentPath.value,
    });
  }
});
</script>
