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

    <div v-if="isChecking" class="blog-state">正在检查管理员权限...</div>
    <div v-else-if="isAnonymous" class="auth-panel account-card">
      <p class="auth-lead">请先登录管理员账号。</p>
      <div class="auth-actions"><a class="primary-link" href="/login?next=/admin">登录</a></div>
    </div>
    <div v-else-if="isForbidden" class="auth-panel account-card">
      <p class="auth-lead">当前账号没有后台权限。</p>
      <div class="auth-actions"><a class="secondary-link" href="/account">返回用户后台</a></div>
    </div>

    <div v-else-if="isAdmin" class="admin-dashboard">
      <div v-if="statsError" class="blog-state error-state">{{ statsError }}</div>
      <div class="account-stat-grid">
        <article class="account-stat-card">
          <span>总用户数</span>
          <strong>{{ stats.totalUsers }}</strong>
          <p>已验证 {{ stats.verifiedUsers }} · 未验证 {{ stats.unverifiedUsers }}</p>
        </article>
        <article class="account-stat-card">
          <span>近 7 天新增</span>
          <strong>{{ stats.newUsers7d }}</strong>
          <p>近 30 天新增 {{ stats.newUsers30d }}</p>
        </article>
        <article class="account-stat-card">
          <span>近 7 天活跃</span>
          <strong>{{ stats.activeUsers7d }}</strong>
          <p>按最近登录时间统计</p>
        </article>
        <article class="account-stat-card">
          <span>已封禁</span>
          <strong>{{ stats.bannedUsers }}</strong>
          <p>管理员 {{ stats.staffUsers }} 名</p>
        </article>
      </div>

      <section class="auth-panel account-card">
        <div class="panel-title-row">
          <div>
            <p class="eyebrow">Tools</p>
            <h3>后台工具</h3>
          </div>
        </div>
        <div class="quick-link-grid">
          <a href="/admin/users">
            <strong>用户管理</strong>
            <span>搜索、筛选、封禁或解封注册用户。</span>
          </a>
          <a href="/admin/content">
            <strong>内容管理</strong>
            <span>浏览社区帖子，删除或恢复违规内容。</span>
          </a>
          <a href="/admin/vibe-coding-submissions">
            <strong>作品审核</strong>
            <span>筛选状态、查看详情、通过、拒绝或删除提交。</span>
          </a>
          <a href="/admin/audit-log">
            <strong>操作日志</strong>
            <span>查看封禁、解封、内容删除等管理操作记录。</span>
          </a>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup>
import { reactive, ref, watch } from "vue";
import { getAdminStats } from "../../services/auth";
import { useAdminGuard } from "../../utils/useAdminGuard";
import { setPageSeo } from "../../utils/seo";

const { isAdmin, isAnonymous, isForbidden, isChecking } = useAdminGuard();

const statsError = ref("");
const stats = reactive({
  totalUsers: 0,
  verifiedUsers: 0,
  unverifiedUsers: 0,
  bannedUsers: 0,
  staffUsers: 0,
  newUsers7d: 0,
  newUsers30d: 0,
  activeUsers7d: 0,
});

setPageSeo({
  title: "管理后台",
  description: "4399123.com 管理员后台入口，集中查看用户与内容管理。",
  path: "/admin",
});

async function loadStats() {
  statsError.value = "";
  try {
    const data = await getAdminStats();
    Object.assign(stats, data.stats || {});
  } catch (err) {
    statsError.value = err.message || "统计数据加载失败。";
  }
}

watch(
  isAdmin,
  (value) => {
    if (value) loadStats();
  },
  { immediate: true },
);
</script>
