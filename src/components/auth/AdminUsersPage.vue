<template>
  <section class="auth-page">
    <div class="section-head blog-page-head">
      <div>
        <p class="eyebrow">Admin</p>
        <h2>用户管理</h2>
      </div>
      <a class="secondary-link compact-action" href="/admin">返回后台</a>
    </div>

    <div v-if="isChecking" class="blog-state">正在检查管理员权限...</div>
    <div v-else-if="isForbidden" class="auth-panel account-card">
      <p class="auth-lead">当前账号没有后台权限。</p>
      <div class="auth-actions"><a class="secondary-link" href="/account">返回用户后台</a></div>
    </div>

    <template v-else-if="isAdmin">
      <form class="admin-filter-row" @submit.prevent="applySearch">
        <label>
          <span>搜索</span>
          <input v-model.trim="searchInput" type="search" placeholder="用户名或邮箱" />
        </label>
        <label>
          <span>筛选</span>
          <select v-model="filter" @change="reload(1)">
            <option value="">全部</option>
            <option value="verified">已验证</option>
            <option value="unverified">未验证</option>
            <option value="staff">管理员</option>
            <option value="banned">已封禁</option>
          </select>
        </label>
        <button class="secondary-link compact-action" type="submit">搜索</button>
      </form>

      <div v-if="isLoading" class="blog-state">正在加载用户列表...</div>
      <div v-else-if="error" class="blog-state error-state">{{ error }}</div>
      <div v-else class="admin-table-wrap">
        <table class="admin-user-table">
          <thead>
            <tr>
              <th>ID</th><th>用户名</th><th>邮箱</th><th>注册</th><th>最近登录</th><th>状态</th><th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in users" :key="item.id" :class="{ 'admin-row-banned': item.banned }">
              <td>{{ item.id }}</td>
              <td>
                {{ item.username }}
                <span v-if="item.isSuperuser" class="admin-tag">超管</span>
                <span v-else-if="item.isStaff" class="admin-tag">管理员</span>
              </td>
              <td>
                {{ item.email }}
                <span v-if="!item.emailVerified" class="admin-tag warn">未验证</span>
              </td>
              <td>{{ formatTime(item.registeredAt) }}</td>
              <td>{{ formatTime(item.lastLoginAt) }}</td>
              <td>
                <span v-if="item.banned" class="admin-tag danger">已封禁</span>
                <span v-else class="admin-tag ok">正常</span>
              </td>
              <td>
                <button
                  v-if="!item.banned"
                  class="secondary-link compact-action"
                  type="button"
                  :disabled="!canModerate(item)"
                  @click="openBan(item)"
                >
                  封禁
                </button>
                <button v-else class="secondary-link compact-action" type="button" @click="openUnban(item)">解封</button>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-if="!users.length" class="blog-state">没有符合条件的用户。</p>
        <AdminPager :pagination="pagination" @change="reload" />
      </div>
    </template>

    <AdminConfirmDialog
      :open="dialog.open"
      :title="dialog.title"
      :message="dialog.message"
      :reason="dialog.reason"
      :busy="dialog.busy"
      :error="dialog.error"
      :confirm-label="dialog.confirmLabel"
      @update:reason="dialog.reason = $event"
      @cancel="closeDialog"
      @confirm="confirmDialog"
    />
  </section>
</template>

<script setup>
import { reactive, ref, watch } from "vue";
import { banUser, getAdminUsers, unbanUser } from "../../services/auth";
import { useAdminGuard } from "../../utils/useAdminGuard";
import { setPageSeo } from "../../utils/seo";
import AdminPager from "./AdminPager.vue";
import AdminConfirmDialog from "./AdminConfirmDialog.vue";

const { isAdmin, isForbidden, isChecking } = useAdminGuard();

const users = ref([]);
const pagination = ref(null);
const isLoading = ref(false);
const error = ref("");
const searchInput = ref("");
const query = ref("");
const filter = ref("");

const dialog = reactive({
  open: false,
  mode: "",
  target: null,
  title: "",
  message: "",
  confirmLabel: "确认",
  reason: "",
  busy: false,
  error: "",
});

setPageSeo({
  title: "用户管理",
  description: "管理 4399123.com 注册用户：搜索、筛选、封禁与解封。",
  path: "/admin/users",
});

async function reload(page = 1) {
  if (!isAdmin.value) return;
  isLoading.value = true;
  error.value = "";
  try {
    const data = await getAdminUsers({ page, pageSize: 20, q: query.value, filter: filter.value });
    users.value = Array.isArray(data.users) ? data.users : [];
    pagination.value = data.pagination || null;
  } catch (err) {
    error.value = err.message || "加载失败。";
  } finally {
    isLoading.value = false;
  }
}

function applySearch() {
  query.value = searchInput.value;
  reload(1);
}

function canModerate(item) {
  return !item.isSuperuser;
}

function openBan(item) {
  Object.assign(dialog, {
    open: true,
    mode: "ban",
    target: item,
    title: `封禁用户 ${item.username}`,
    message: "封禁后该用户会立即被踢下线且无法登录，直到解封。",
    confirmLabel: "确认封禁",
    reason: "",
    busy: false,
    error: "",
  });
}

function openUnban(item) {
  Object.assign(dialog, {
    open: true,
    mode: "unban",
    target: item,
    title: `解封用户 ${item.username}`,
    message: "解封后该用户可以重新登录。",
    confirmLabel: "确认解封",
    reason: "",
    busy: false,
    error: "",
  });
}

function closeDialog() {
  dialog.open = false;
  dialog.target = null;
}

async function confirmDialog() {
  if (!dialog.target) return;
  dialog.busy = true;
  dialog.error = "";
  try {
    if (dialog.mode === "ban") {
      await banUser(dialog.target.id, dialog.reason);
    } else {
      await unbanUser(dialog.target.id, dialog.reason);
    }
    closeDialog();
    await reload(pagination.value?.page || 1);
  } catch (err) {
    dialog.error = err.message || "操作失败。";
  } finally {
    dialog.busy = false;
  }
}

function formatTime(value) {
  if (!value) return "暂无";
  return new Date(value).toLocaleString("zh-CN", { hour12: false });
}

// Load once the guard confirms the viewer is an admin.
watch(
  isAdmin,
  (value) => {
    if (value && !pagination.value && !users.value.length) reload(1);
  },
  { immediate: true },
);
</script>

<style scoped>
.admin-row-banned {
  background: rgba(200, 60, 40, 0.08);
}
.admin-tag {
  display: inline-block;
  margin-left: 6px;
  padding: 1px 7px;
  border-radius: 999px;
  font-size: 0.72rem;
  background: rgba(31, 95, 70, 0.12);
  color: #1f5f46;
  vertical-align: middle;
}
.admin-tag.warn {
  background: rgba(180, 120, 20, 0.14);
  color: #8a5a10;
}
.admin-tag.danger {
  background: rgba(200, 60, 40, 0.14);
  color: #b0342a;
}
.admin-tag.ok {
  background: rgba(31, 95, 70, 0.12);
  color: #1f5f46;
}
</style>
