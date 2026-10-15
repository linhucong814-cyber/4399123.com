<template>
  <div class="site-shell">
    <a class="skip-link" href="#main-content" @click="focusMainContent">跳到主要内容</a>
    <TopNav :items="navigationItems" :current-path="currentPath" />
    <main id="main-content" ref="mainContent" class="page-content" tabindex="-1">
      <AuthFormPage v-if="isLoginRoute" mode="login" />
      <AuthFormPage v-else-if="isRegisterRoute" mode="register" />
      <PasswordResetRequestPage v-else-if="isPasswordResetRequestRoute" />
      <PasswordResetConfirmPage v-else-if="isPasswordResetConfirmRoute" />
      <EmailVerifyPage v-else-if="isVerifyEmailRoute" />
      <AccountPage v-else-if="isAccountRoute" />
      <AccountSettingsPage v-else-if="isAccountSettingsRoute" />
      <AdminDashboardPage v-else-if="isAdminRoute" />
      <AdminUsersPage v-else-if="isAdminUsersRoute" />
      <AdminContentPage v-else-if="isAdminContentRoute" />
      <AdminAuditLogPage v-else-if="isAdminAuditLogRoute" />
      <AdminVibeCodingSubmissionsPage v-else-if="isAdminVibeCodingSubmissionsRoute" />
      <DocsPage v-else-if="isDocsRoute" />
      <HelpCenterPage v-else-if="isHelpRoute" />
      <UserProfilePage v-else-if="isUserProfileRoute" :user-id="userProfileId" />
      <CommunityPage v-else-if="isCommunityRoute" :post-id="communityPostId" />
      <BlogPage v-else-if="isBlogRoute" :slug="blogSlug" />
      <WorkDetailPage v-else-if="isWorkDetailRoute" :slug="workSlug" />
      <template v-else-if="isWorksRoute || isVibeCodingShowcaseRoute">
        <WorksGalleryPage :key="currentPath" />
        <section class="works-branch-section" aria-labelledby="works-branch-heading">
          <div class="works-branch-heading">
            <h2 id="works-branch-heading">官方项目与构建日志</h2>
            <p>原 Vibe Coding 页面内容：社区投稿、官方项目和构建记录。</p>
          </div>
          <VibeCodingPage
            embedded
            :projects="vibeCodingProjects"
            :posts="vibeCodingPosts"
            :submissions="vibeCodingSubmissions"
            :submissions-loading="vibeCodingSubmissionsLoading"
            :submissions-error="vibeCodingSubmissionsError"
          />
        </section>
      </template>
      <VibeCodingSharePage v-else-if="isVibeCodingShareRoute" />
      <PromptLibraryEditorPage v-else-if="isPromptLibraryEditorRoute" :item-id="promptLibraryEditId" />
      <PromptLibraryDetailPage v-else-if="isPromptLibraryDetailRoute" :item-id="promptLibraryItemId" />
      <PromptLibraryPage v-else-if="isPromptLibraryListRoute" />
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
    <footer v-if="isHomeRoute" class="home-footer">
      <small>Copyright © 2026 4399123.com</small>
    </footer>
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent, nextTick, onMounted, onUnmounted, ref, watchEffect } from "vue";
import HomePage from "./components/HomePage.vue";
import TopNav from "./components/TopNav.vue";
import {
  navigationItems,
  vibeCodingProjects as fallbackVibeCodingProjects,
} from "./data/site";
import { localBlogPosts } from "./data/content";
import { workCoverUrl } from "./data/workArtwork";
import { getApprovedVibeCodingSubmissions, getVibeCodingProjects } from "./services/vibeCoding";
import { defaultSeo, setPageSeo } from "./utils/seo";

const CommunityPage = defineAsyncComponent(() => import("./components/CommunityPage.vue"));
const UserProfilePage = defineAsyncComponent(() => import("./components/UserProfilePage.vue"));
const BlogPage = defineAsyncComponent(() => import("./components/BlogPage.vue"));
const DocsPage = defineAsyncComponent(() => import("./components/DocsPage.vue"));
const HelpCenterPage = defineAsyncComponent(() => import("./components/HelpCenterPage.vue"));
const VibeCodingPage = defineAsyncComponent(() => import("./components/VibeCodingPage.vue"));
const VibeCodingSharePage = defineAsyncComponent(() => import("./components/VibeCodingSharePage.vue"));
const PromptLibraryPage = defineAsyncComponent(() => import("./components/PromptLibraryPage.vue"));
const PromptLibraryDetailPage = defineAsyncComponent(() => import("./components/PromptLibraryDetailPage.vue"));
const PromptLibraryEditorPage = defineAsyncComponent(() => import("./components/PromptLibraryEditorPage.vue"));
const WorksGalleryPage = defineAsyncComponent(() => import("./components/works/WorksGalleryPage.vue"));
const WorkDetailPage = defineAsyncComponent(() => import("./components/works/WorkDetailPage.vue"));
const AuthFormPage = defineAsyncComponent(() => import("./components/auth/AuthFormPage.vue"));
const EmailVerifyPage = defineAsyncComponent(() => import("./components/auth/EmailVerifyPage.vue"));
const PasswordResetRequestPage = defineAsyncComponent(() => import("./components/auth/PasswordResetRequestPage.vue"));
const PasswordResetConfirmPage = defineAsyncComponent(() => import("./components/auth/PasswordResetConfirmPage.vue"));
const AccountPage = defineAsyncComponent(() => import("./components/auth/AccountPage.vue"));
const AccountSettingsPage = defineAsyncComponent(() => import("./components/auth/AccountSettingsPage.vue"));
const AdminDashboardPage = defineAsyncComponent(() => import("./components/auth/AdminDashboardPage.vue"));
const AdminUsersPage = defineAsyncComponent(() => import("./components/auth/AdminUsersPage.vue"));
const AdminContentPage = defineAsyncComponent(() => import("./components/auth/AdminContentPage.vue"));
const AdminAuditLogPage = defineAsyncComponent(() => import("./components/auth/AdminAuditLogPage.vue"));
const AdminVibeCodingSubmissionsPage = defineAsyncComponent(() => import("./components/auth/AdminVibeCodingSubmissionsPage.vue"));

// Legacy URLs (/vibe-coding, /vibe-coding/showcase) now live at /works (Caddy also 301s them).
function redirectLegacyRoutes() {
  if (/^\/vibe-coding(\/showcase)?\/?$/.test(window.location.pathname)) {
    window.history.replaceState(window.history.state, "", `/works${window.location.search}`);
  }
}
redirectLegacyRoutes();

const currentPath = ref(window.location.pathname);
const mainContent = ref(null);
const vibeCodingProjects = ref([...fallbackVibeCodingProjects]);
const vibeCodingSubmissions = ref([]);
const vibeCodingSubmissionsLoading = ref(false);
const vibeCodingSubmissionsError = ref("");
const removedProjectJournalSlugs = new Set(["chinese-image-prompt-generator"]);
const vibeCodingPosts = localBlogPosts.filter((post) =>
  post.tags?.some((tag) => tag.toLowerCase() === "vibe coding") &&
  !removedProjectJournalSlugs.has(post.slug),
);
const removedProjectHrefs = new Set([
  "/vibecpu/",
  "/vibe-coding/pulse-pomodoro/",
  "/vibe-coding/ai-personality-test/",
  "/vibe-coding/4399123agent/",
  "/vibe-coding/chinese-image-prompt/",
]);

const isHomeRoute = computed(() => currentPath.value === "/");
const isLoginRoute = computed(() => currentPath.value === "/login" || currentPath.value === "/login/");
const isRegisterRoute = computed(() => currentPath.value === "/register" || currentPath.value === "/register/");
const isPasswordResetRequestRoute = computed(
  () => currentPath.value === "/forgot-password" || currentPath.value === "/forgot-password/",
);
const isPasswordResetConfirmRoute = computed(
  () => currentPath.value === "/reset-password" || currentPath.value === "/reset-password/",
);
const isVerifyEmailRoute = computed(() => currentPath.value === "/verify-email" || currentPath.value === "/verify-email/");
const isAccountRoute = computed(() => currentPath.value === "/account" || currentPath.value === "/account/");
const isAccountSettingsRoute = computed(() => currentPath.value === "/account/settings" || currentPath.value === "/account/settings/");
const isAdminRoute = computed(() => currentPath.value === "/admin" || currentPath.value === "/admin/");
const isAdminUsersRoute = computed(() => currentPath.value === "/admin/users" || currentPath.value === "/admin/users/");
const isAdminContentRoute = computed(() => currentPath.value === "/admin/content" || currentPath.value === "/admin/content/");
const isAdminAuditLogRoute = computed(() => currentPath.value === "/admin/audit-log" || currentPath.value === "/admin/audit-log/");
const isAdminVibeCodingSubmissionsRoute = computed(
  () => currentPath.value === "/admin/vibe-coding-submissions" || currentPath.value === "/admin/vibe-coding-submissions/",
);
const isDocsRoute = computed(() => currentPath.value === "/docs" || currentPath.value === "/docs/");
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
const isVibeCodingShowcaseRoute = computed(
  () =>
    currentPath.value === "/vibe-coding/showcase" ||
    currentPath.value === "/vibe-coding/showcase/",
);
const isWorksRoute = computed(() => currentPath.value === "/works" || currentPath.value === "/works/");
const isWorkDetailRoute = computed(() => /^\/works\/[^/]+\/?$/.test(currentPath.value));
const workSlug = computed(() => {
  const match = currentPath.value.match(/^\/works\/([^/]+)\/?$/);
  return match ? decodeURIComponent(match[1]) : "";
});
const isVibeCodingShareRoute = computed(() => currentPath.value === "/vibe-coding/share" || currentPath.value === "/vibe-coding/share/");
const isPromptLibraryListRoute = computed(
  () => currentPath.value === "/vibe-coding/prompt-library" || currentPath.value === "/vibe-coding/prompt-library/",
);
const isPromptLibraryEditorRoute = computed(
  () =>
    currentPath.value === "/vibe-coding/prompt-library/new" ||
    currentPath.value === "/vibe-coding/prompt-library/new/" ||
    /^\/vibe-coding\/prompt-library\/\d+\/edit\/?$/.test(currentPath.value),
);
const isPromptLibraryDetailRoute = computed(() => /^\/vibe-coding\/prompt-library\/\d+\/?$/.test(currentPath.value));
const promptLibraryItemId = computed(() => {
  const match = currentPath.value.match(/^\/vibe-coding\/prompt-library\/(\d+)\/?$/);
  return match ? match[1] : "";
});
const promptLibraryEditId = computed(() => {
  const match = currentPath.value.match(/^\/vibe-coding\/prompt-library\/(\d+)\/edit\/?$/);
  return match ? match[1] : "";
});
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
  redirectLegacyRoutes();
  currentPath.value = window.location.pathname;
}

function notifyRouteChange() {
  window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
}

function focusMainContent() {
  nextTick(() => mainContent.value?.focus());
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
    const data = await getVibeCodingProjects();
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
  } catch (err) {
    vibeCodingSubmissions.value = [];
    vibeCodingSubmissionsError.value = err.message || "读取分享作品失败。";
  } finally {
    vibeCodingSubmissionsLoading.value = false;
  }
}

function mergeProjects(remoteProjects, fallbackProjects) {
  const map = new Map();
  for (const project of remoteProjects) {
    if (isRemovedProject(project)) continue;
    map.set(projectKey(project), normalizeProject(project));
  }
  for (const project of fallbackProjects) {
    if (isRemovedProject(project)) continue;
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

function isRemovedProject(project) {
  const href = String(project?.href || "").split(/[?#]/, 1)[0];
  const normalizedHref = href.endsWith("/") ? href : `${href}/`;
  return removedProjectHrefs.has(normalizedHref);
}

function normalizeProject(project) {
  const image = workCoverUrl(project);
  if (image !== project.image) project = { ...project, image, imageAlt: project.title };
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

  if (isPromptLibraryListRoute.value || isPromptLibraryDetailRoute.value || isPromptLibraryEditorRoute.value) {
    return;
  }

  if (!isBlogRoute.value && !isLoginRoute.value && !isRegisterRoute.value && !isPasswordResetRequestRoute.value && !isPasswordResetConfirmRoute.value && !isVerifyEmailRoute.value && !isAccountRoute.value && !isAccountSettingsRoute.value && !isAdminRoute.value && !isAdminUsersRoute.value && !isAdminContentRoute.value && !isAdminAuditLogRoute.value && !isAdminVibeCodingSubmissionsRoute.value && !isDocsRoute.value && !isHelpRoute.value && !isUserProfileRoute.value && !isCommunityRoute.value && !isVibeCodingShowcaseRoute.value && !isWorksRoute.value && !isWorkDetailRoute.value && !isVibeCodingShareRoute.value) {
    setPageSeo({
      title: "404",
      description: "4399123 暂时没有找到这个入口。",
      path: currentPath.value,
    });
  }
});
</script>
