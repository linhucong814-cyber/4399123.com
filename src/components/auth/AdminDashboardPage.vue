<template>
  <section class="auth-page account-page">
    <div class="section-head blog-page-head account-head">
      <div>
        <p class="eyebrow">Admin</p>
        <h2>管理后台</h2>
      </div>
      <div class="inline-actions">
        <a class="secondary-link compact-action" href="/account">用户后台</a>
        <a class="primary-link compact-action" href="/admin/vibe-coding-submissions">作品审核</a>
      </div>
    </div>

    <div v-if="isLoading" class="blog-state">正在检查管理员权限...</div>
    <div v-else-if="error" class="blog-state error-state">{{ error }}</div>
    <div v-else-if="!user" class="auth-panel account-card">
      <p class="auth-lead">请先登录管理员账号。</p>
      <div class="auth-actions">
        <a class="primary-link" href="/login?next=/admin">登录</a>
      </div>
    </div>
    <div v-else-if="!user.isAdmin" class="auth-panel account-card">
      <p class="auth-lead">当前账号没有后台权限。</p>
      <div class="auth-actions">
        <a class="secondary-link" href="/account">返回用户后台</a>
      </div>
    </div>

    <div v-else class="admin-dashboard">
      <div class="account-stat-grid">
        <article class="account-stat-card">
          <span>待审核作品</span>
          <strong>{{ pendingSubmissions.length }}</strong>
          <p>需要通过、拒绝或标记问题的作品。</p>
        </article>
        <article class="account-stat-card">
          <span>注册用户</span>
          <strong>{{ users.length }}</strong>
          <p>{{ activeUsers.length }} 个正常账号。</p>
        </article>
        <article class="account-stat-card">
          <span>管理入口</span>
          <strong>2</strong>
          <p>作品审核和用户列表已接入权限控制。</p>
        </article>
      </div>

      <section class="auth-panel account-card">
        <div class="panel-title-row">
          <div>
            <p class="eyebrow">Review Queue</p>
            <h3>待审核内容</h3>
          </div>
          <a class="secondary-link compact-action" href="/admin/vibe-coding-submissions">查看全部</a>
        </div>

        <div v-if="!pendingSubmissions.length" class="empty-panel compact">
          <h4>当前没有待审核作品</h4>
          <p>用户提交的新作品会先进入待审核队列，通过后才公开展示。</p>
        </div>
        <div v-else class="submission-timeline">
          <article v-for="item in pendingSubmissions.slice(0, 6)" :key="item.id" class="submission-row">
            <div>
              <span class="status-pill status-pending">待审核</span>
              <h4>{{ item.projectName }}</h4>
              <p>{{ item.summary }}</p>
            </div>
            <div class="submission-meta">
              <time :datetime="item.createdAt">{{ formatDate(item.createdAt) }}</time>
              <a href="/admin/vibe-coding-submissions">处理</a>
            </div>
          </article>
        </div>
      </section>

      <section class="auth-panel account-card">
        <div class="panel-title-row">
          <div>
            <p class="eyebrow">Tools</p>
            <h3>后台工具</h3>
          </div>
        </div>
        <div class="quick-link-grid">
          <a href="/admin/vibe-coding-submissions">
            <strong>作品审核</strong>
            <span>筛选状态、查看详情、通过、拒绝、标记问题或删除提交。</span>
          </a>
          <a href="/admin/users">
            <strong>用户管理</strong>
            <span>查看注册用户、最近登录和账号状态。</span>
          </a>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { getAdminUsers, getCurrentUser } from "../../services/auth";
import { getAdminVibeCodingSubmissions } from "../../services/vibeCoding";
import { setPageSeo } from "../../utils/seo";

const isLoading = ref(true);
const error = ref("");
const user = ref(null);
const users = ref([]);
const pendingSubmissions = ref([]);
const activeUsers = computed(() => users.value.filter((item) => item.status !== "disabled"));

setPageSeo({
  title: "管理后台",
  description: "4399123.com 管理员后台入口，集中查看作品审核和用户管理。",
  path: "/admin",
});

onMounted(loadDashboard);

async function loadDashboard() {
  isLoading.value = true;
  error.value = "";
  try {
    const me = await getCurrentUser();
    user.value = me.user || null;
    if (!user.value || !user.value.isAdmin) return;
    const [userData, pendingData] = await Promise.all([
      getAdminUsers(),
      getAdminVibeCodingSubmissions("pending"),
    ]);
    users.value = Array.isArray(userData.users) ? userData.users : [];
    pendingSubmissions.value = Array.isArray(pendingData.submissions) ? pendingData.submissions : [];
  } catch (err) {
    error.value = err.message || "管理后台加载失败。";
  } finally {
    isLoading.value = false;
  }
}

function formatDate(value) {
  if (!value) return "暂无";
  return new Date(value).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false });
}
</script>
