<template>
  <section class="auth-page">
    <div class="section-head blog-page-head">
      <div>
        <p class="eyebrow">Admin</p>
        <h2>注册用户</h2>
      </div>
      <a class="secondary-link compact-action" href="/account">返回账号</a>
    </div>

    <div v-if="isLoading" class="blog-state">正在加载用户列表...</div>
    <div v-else-if="error" class="blog-state error-state">{{ error }}</div>
    <div v-else class="admin-table-wrap">
      <table class="admin-user-table">
        <thead>
          <tr>
            <th>用户 ID</th>
            <th>用户名</th>
            <th>邮箱</th>
            <th>注册时间</th>
            <th>最近登录</th>
            <th>来源项目</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in users" :key="item.id">
            <td>{{ item.id }}</td>
            <td>
              <a v-if="item.status !== 'disabled'" class="admin-user-link" :href="publicProfileHref(item)">{{ item.username }}</a>
              <span v-else>{{ item.username }}</span>
            </td>
            <td>{{ item.email }}</td>
            <td>{{ formatTime(item.registeredAt) }}</td>
            <td>{{ formatTime(item.lastLoginAt) }}</td>
            <td>{{ item.sourceProject }}</td>
            <td>{{ item.status === "disabled" ? "已禁用" : "正常" }}</td>
          </tr>
        </tbody>
      </table>
      <p v-if="!users.length" class="blog-state">暂无注册用户。</p>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { getAdminUsers } from "../../services/auth";
import { setPageSeo } from "../../utils/seo";

const users = ref([]);
const isLoading = ref(true);
const error = ref("");

setPageSeo({
  title: "注册用户后台",
  description: "查看 4399123.com Vibe Coding 项目的统一注册用户信息。",
  path: "/admin/users",
});

onMounted(async () => {
  try {
    const data = await getAdminUsers();
    users.value = Array.isArray(data.users) ? data.users : [];
  } catch (err) {
    error.value = err.message || "加载失败。";
  } finally {
    isLoading.value = false;
  }
});

function formatTime(value) {
  if (!value) return "暂无";
  return new Date(value).toLocaleString("zh-CN", { hour12: false });
}

function publicProfileHref(user) {
  return user?.id ? `/users/${encodeURIComponent(user.id)}` : "/admin/users";
}
</script>
