<template>
  <section class="auth-page">
    <div class="section-head blog-page-head">
      <div>
        <p class="eyebrow">Admin</p>
        <h2>操作日志</h2>
      </div>
      <a class="secondary-link compact-action" href="/admin">返回后台</a>
    </div>

    <div v-if="isChecking" class="blog-state">正在检查管理员权限...</div>
    <div v-else-if="isForbidden" class="auth-panel account-card">
      <p class="auth-lead">当前账号没有后台权限。</p>
      <div class="auth-actions"><a class="secondary-link" href="/account">返回用户后台</a></div>
    </div>

    <template v-else-if="isAdmin">
      <form class="admin-filter-row" @submit.prevent>
        <label>
          <span>动作</span>
          <select v-model="action" @change="reload(1)">
            <option value="">全部</option>
            <option value="user_ban">封禁用户</option>
            <option value="user_unban">解封用户</option>
            <option value="content_delete">删除内容</option>
            <option value="content_restore">恢复内容</option>
          </select>
        </label>
      </form>

      <div v-if="isLoading" class="blog-state">正在加载操作日志...</div>
      <div v-else-if="error" class="blog-state error-state">{{ error }}</div>
      <div v-else class="admin-table-wrap">
        <table class="admin-user-table">
          <thead>
            <tr><th>时间</th><th>操作者</th><th>动作</th><th>目标</th><th>原因</th><th>IP</th></tr>
          </thead>
          <tbody>
            <tr v-for="entry in entries" :key="entry.id">
              <td>{{ formatTime(entry.createdAt) }}</td>
              <td>{{ entry.actor || "(已删除)" }}</td>
              <td>{{ entry.actionLabel }}</td>
              <td>{{ entry.targetLabel }} <span class="admin-muted">#{{ entry.targetId }}</span></td>
              <td>{{ entry.reason || "—" }}</td>
              <td>{{ entry.ip || "—" }}</td>
            </tr>
          </tbody>
        </table>
        <p v-if="!entries.length" class="blog-state">暂无操作记录。</p>
        <AdminPager :pagination="pagination" @change="reload" />
      </div>
    </template>
  </section>
</template>

<script setup>
import { ref, watch } from "vue";
import { getAdminAuditLog } from "../../services/auth";
import { useAdminGuard } from "../../utils/useAdminGuard";
import { setPageSeo } from "../../utils/seo";
import AdminPager from "./AdminPager.vue";

const { isAdmin, isForbidden, isChecking } = useAdminGuard();

const entries = ref([]);
const pagination = ref(null);
const isLoading = ref(false);
const error = ref("");
const action = ref("");

setPageSeo({
  title: "操作日志",
  description: "查看 4399123.com 管理员的封禁、解封与内容操作记录。",
  path: "/admin/audit-log",
});

async function reload(page = 1) {
  if (!isAdmin.value) return;
  isLoading.value = true;
  error.value = "";
  try {
    const data = await getAdminAuditLog({ page, pageSize: 20, action: action.value });
    entries.value = Array.isArray(data.entries) ? data.entries : [];
    pagination.value = data.pagination || null;
  } catch (err) {
    error.value = err.message || "加载失败。";
  } finally {
    isLoading.value = false;
  }
}

function formatTime(value) {
  if (!value) return "暂无";
  return new Date(value).toLocaleString("zh-CN", { hour12: false });
}

watch(
  isAdmin,
  (value) => {
    if (value && !pagination.value && !entries.value.length) reload(1);
  },
  { immediate: true },
);
</script>

<style scoped>
.admin-muted {
  color: var(--muted, #5d6b63);
  font-size: 0.8rem;
}
</style>
