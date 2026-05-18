<template>
  <section class="auth-page">
    <div class="section-head blog-page-head">
      <div>
        <p class="eyebrow">Account</p>
        <h2>当前用户</h2>
      </div>
      <a v-if="user?.isAdmin" class="secondary-link compact-action" href="/admin/users">用户后台</a>
    </div>

    <div v-if="isLoading" class="blog-state">正在读取登录状态...</div>

    <div v-else-if="!user" class="auth-panel">
      <p class="auth-lead">当前未登录。登录后，其他同属 4399123.com 的 Vibe Coding 项目也能识别账号状态。</p>
      <div class="auth-actions">
        <a class="primary-link" href="/login">登录</a>
        <a class="secondary-link" href="/register">注册</a>
      </div>
    </div>

    <div v-else class="auth-panel">
      <div class="user-info-grid">
        <span>用户 ID</span><strong>{{ user.id }}</strong>
        <span>用户名</span><strong>{{ user.username }}</strong>
        <span>邮箱</span><strong>{{ user.email }}</strong>
        <span>来源项目</span><strong>{{ user.sourceProject }}</strong>
        <span>状态</span><strong>{{ statusLabel(user.status) }}</strong>
        <span>最近登录</span><strong>{{ formatTime(user.lastLoginAt) }}</strong>
      </div>
      <button class="secondary-link auth-submit" type="button" @click="handleLogout">退出登录</button>
      <p v-if="error" class="form-message error-state">{{ error }}</p>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { getCurrentUser, logoutUser } from "../../services/auth";
import { setPageSeo } from "../../utils/seo";

const isLoading = ref(true);
const user = ref(null);
const error = ref("");

setPageSeo({
  title: "当前用户",
  description: "查看 4399123.com Vibe Coding 统一登录状态。",
  path: "/account",
});

onMounted(loadUser);

async function loadUser() {
  isLoading.value = true;
  try {
    const data = await getCurrentUser();
    user.value = data.user || null;
  } catch (err) {
    error.value = err.message || "读取用户失败。";
  } finally {
    isLoading.value = false;
  }
}

async function handleLogout() {
  error.value = "";
  try {
    await logoutUser();
    user.value = null;
  } catch (err) {
    error.value = err.message || "退出失败。";
  }
}

function statusLabel(value) {
  return value === "disabled" ? "已禁用" : "正常";
}

function formatTime(value) {
  if (!value) return "暂无";
  return new Date(value).toLocaleString("zh-CN", { hour12: false });
}
</script>
