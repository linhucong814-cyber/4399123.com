<template>
  <section class="auth-page">
    <div class="section-head blog-page-head">
      <div>
        <p class="eyebrow">Admin</p>
        <h2>内容管理</h2>
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
          <input v-model.trim="searchInput" type="search" placeholder="标题、正文或作者" />
        </label>
        <label class="admin-checkbox">
          <input v-model="includeDeleted" type="checkbox" @change="reload(1)" />
          <span>包含已删除</span>
        </label>
        <button class="secondary-link compact-action" type="submit">搜索</button>
      </form>

      <div v-if="isLoading" class="blog-state">正在加载社区帖子...</div>
      <div v-else-if="error" class="blog-state error-state">{{ error }}</div>
      <div v-else class="admin-table-wrap">
        <table class="admin-user-table">
          <thead>
            <tr><th>ID</th><th>标题</th><th>作者</th><th>栏目</th><th>发布时间</th><th>状态</th><th>操作</th></tr>
          </thead>
          <tbody>
            <tr v-for="item in posts" :key="item.id" :class="{ 'admin-row-banned': item.isDeleted }">
              <td>{{ item.id }}</td>
              <td>
                <a v-if="!item.isDeleted" :href="`/community/posts/${item.id}`" target="_blank" rel="noopener noreferrer">{{ item.title || "(无标题)" }}</a>
                <span v-else>{{ item.title || "(无标题)" }}</span>
                <p class="admin-excerpt">{{ item.excerpt }}</p>
              </td>
              <td>{{ item.author }}</td>
              <td>{{ item.channel }}</td>
              <td>{{ formatTime(item.createdAt) }}</td>
              <td>
                <span v-if="item.isDeleted" class="admin-tag danger">已删除</span>
                <span v-else class="admin-tag ok">正常</span>
              </td>
              <td>
                <button v-if="!item.isDeleted" class="secondary-link compact-action" type="button" @click="openDelete(item)">删除</button>
                <button v-else class="secondary-link compact-action" type="button" @click="openRestore(item)">恢复</button>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-if="!posts.length" class="blog-state">没有符合条件的帖子。</p>
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
import { getAdminCommunityPosts, moderateCommunityPost } from "../../services/auth";
import { useAdminGuard } from "../../utils/useAdminGuard";
import { setPageSeo } from "../../utils/seo";
import AdminPager from "./AdminPager.vue";
import AdminConfirmDialog from "./AdminConfirmDialog.vue";

const { isAdmin, isForbidden, isChecking } = useAdminGuard();

const posts = ref([]);
const pagination = ref(null);
const isLoading = ref(false);
const error = ref("");
const searchInput = ref("");
const query = ref("");
const includeDeleted = ref(false);

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
  title: "内容管理",
  description: "管理 4399123.com 社区内容：浏览、删除或恢复帖子。",
  path: "/admin/content",
});

async function reload(page = 1) {
  if (!isAdmin.value) return;
  isLoading.value = true;
  error.value = "";
  try {
    const data = await getAdminCommunityPosts({
      page,
      pageSize: 20,
      q: query.value,
      include: includeDeleted.value ? "deleted" : "",
    });
    posts.value = Array.isArray(data.posts) ? data.posts : [];
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

function openDelete(item) {
  Object.assign(dialog, {
    open: true,
    mode: "delete",
    target: item,
    title: `删除帖子 #${item.id}`,
    message: "删除后该帖子对用户不可见，可随时在此恢复。",
    confirmLabel: "确认删除",
    reason: "",
    busy: false,
    error: "",
  });
}

function openRestore(item) {
  Object.assign(dialog, {
    open: true,
    mode: "restore",
    target: item,
    title: `恢复帖子 #${item.id}`,
    message: "恢复后该帖子重新对用户可见。",
    confirmLabel: "确认恢复",
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
    await moderateCommunityPost(dialog.target.id, dialog.mode, dialog.reason);
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

watch(
  isAdmin,
  (value) => {
    if (value && !pagination.value && !posts.value.length) reload(1);
  },
  { immediate: true },
);
</script>

<style scoped>
.admin-row-banned {
  background: rgba(200, 60, 40, 0.08);
}
.admin-excerpt {
  margin: 4px 0 0;
  font-size: 0.82rem;
  color: var(--muted, #5d6b63);
  max-width: 340px;
}
.admin-checkbox {
  flex-direction: row;
  align-items: center;
  gap: 6px;
}
.admin-tag {
  display: inline-block;
  padding: 1px 7px;
  border-radius: 999px;
  font-size: 0.72rem;
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
