<template>
  <section class="auth-page account-page">
    <div class="section-head blog-page-head account-head">
      <div>
        <p class="eyebrow">Settings</p>
        <h2>账户设置</h2>
      </div>
      <div class="inline-actions">
        <a v-if="user?.id" class="secondary-link compact-action" :href="publicProfileHref(user)">公开主页</a>
        <a class="secondary-link compact-action" href="/account">返回后台</a>
        <a class="secondary-link compact-action" href="/help">帮助中心</a>
      </div>
    </div>

    <div v-if="isLoading" class="blog-state">正在读取账号资料...</div>

    <div v-else-if="!user" class="auth-panel account-card">
      <p class="auth-lead">登录后可以编辑头像、用户名和简介。</p>
      <div class="auth-actions">
        <a class="primary-link" href="/login?next=/account/settings">登录</a>
        <a class="secondary-link" href="/register?next=/account/settings">注册</a>
      </div>
    </div>

    <div v-else class="account-layout">
      <aside class="auth-panel account-summary">
        <div class="profile-avatar" :class="{ empty: !user.avatarUrl }">
          <img v-if="user.avatarUrl" :src="user.avatarUrl" :alt="`${user.username} 的头像`" />
          <span v-else>{{ userInitial }}</span>
        </div>
        <div>
          <h3>{{ user.username }}</h3>
          <p>{{ user.bio || "还没有填写个人简介。" }}</p>
        </div>
        <div class="account-badges">
          <span class="verified">账号已开放</span>
          <span>{{ statusLabel(user.status) }}</span>
        </div>
      </aside>

      <div class="account-main">
        <form class="auth-panel account-card" @submit.prevent="handleProfileSubmit">
          <div class="panel-title-row">
            <div>
              <p class="eyebrow">Profile</p>
              <h3>基础资料</h3>
            </div>
            <button class="primary-link compact-action" type="submit" :disabled="isSaving">
              {{ isSaving ? "保存中..." : "保存资料" }}
            </button>
          </div>

          <label class="field-label">
            用户名
            <input v-model.trim="profileForm.username" autocomplete="username" required minlength="3" maxlength="32" />
          </label>

          <label class="field-label">
            联系邮箱
            <input :value="user.email" autocomplete="email" disabled />
          </label>
          <p class="field-help">当前版本通过注册邮箱登录；如需换绑邮箱，请联系支持。</p>

          <label class="field-label">
            个人简介
            <textarea v-model.trim="profileForm.bio" maxlength="280" rows="4" placeholder="用一句话介绍你正在做什么。" />
          </label>
          <p class="field-help">{{ profileForm.bio.length }}/280</p>

          <label class="field-label">
            头像
            <input type="file" accept="image/png,image/jpeg,image/gif,image/webp" :disabled="isUploadingAvatar" @change="handleAvatarChange" />
          </label>
          <p class="field-help">支持 JPG、PNG、GIF、WebP，最大 2MB。</p>

          <p v-if="profileMessage" class="form-message">{{ profileMessage }}</p>
          <p v-if="error" class="form-message error-state">{{ error }}</p>
        </form>

        <div class="auth-panel account-card">
          <div class="panel-title-row">
            <div>
              <p class="eyebrow">Security</p>
              <h3>登录与安全</h3>
            </div>
            <button class="secondary-link compact-action" type="button" @click="handleLogout">退出登录</button>
          </div>

          <div class="user-info-grid">
            <span>用户 ID</span><strong>{{ user.id }}</strong>
            <span>邮箱</span><strong>{{ user.email }}</strong>
            <span>注册方式</span><strong>账号密码注册</strong>
            <span>用户名可改时间</span><strong>{{ formatTime(user.canChangeUsernameAt) }}</strong>
            <span>来源项目</span><strong>{{ user.sourceProject }}</strong>
            <span>最近登录</span><strong>{{ formatTime(user.lastLoginAt) }}</strong>
          </div>

          <div class="auth-notice neutral">
            <p>密码修改和多因素验证暂未开放独立页面。忘记密码或需要换绑邮箱时，请通过帮助中心联系支持。</p>
            <a class="secondary-link compact-action" href="/help#contact">联系支持</a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { getCurrentUser, logoutUser, updateProfile, uploadAvatar } from "../../services/auth";
import { setPageSeo } from "../../utils/seo";

const isLoading = ref(true);
const isSaving = ref(false);
const isUploadingAvatar = ref(false);
const user = ref(null);
const error = ref("");
const profileMessage = ref("");
const profileForm = reactive({
  username: "",
  bio: "",
});

const userInitial = computed(() => (user.value?.username || "?").slice(0, 1).toUpperCase());

setPageSeo({
  title: "账户设置",
  description: "管理 4399123.com 账号头像、用户名、简介和登录状态。",
  path: "/account/settings",
});

onMounted(loadUser);

async function loadUser() {
  isLoading.value = true;
  try {
    const data = await getCurrentUser();
    setUser(data.user || null);
  } catch (err) {
    error.value = err.message || "读取用户失败。";
  } finally {
    isLoading.value = false;
  }
}

function setUser(nextUser) {
  user.value = nextUser;
  profileForm.username = nextUser?.username || "";
  profileForm.bio = nextUser?.bio || "";
  window.dispatchEvent(new CustomEvent("auth:user-updated", { detail: { user: nextUser } }));
}

async function handleProfileSubmit() {
  error.value = "";
  profileMessage.value = "";
  if (profileForm.bio.length > 280) {
    error.value = "个人简介不能超过 280 个字符。";
    return;
  }
  isSaving.value = true;
  try {
    const data = await updateProfile({
      username: profileForm.username,
      bio: profileForm.bio,
    });
    setUser(data.user);
    profileMessage.value = "资料已保存。";
  } catch (err) {
    error.value = err.message || "资料保存失败。";
  } finally {
    isSaving.value = false;
  }
}

async function handleAvatarChange(event) {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (!file) return;
  error.value = "";
  profileMessage.value = "";
  isUploadingAvatar.value = true;
  try {
    const data = await uploadAvatar(file);
    setUser(data.user);
    profileMessage.value = "头像已更新。";
  } catch (err) {
    error.value = err.message || "头像上传失败。";
  } finally {
    isUploadingAvatar.value = false;
  }
}

async function handleLogout() {
  error.value = "";
  try {
    await logoutUser();
    setUser(null);
  } catch (err) {
    error.value = err.message || "退出失败。";
  }
}

function statusLabel(value) {
  return value === "disabled" ? "已禁用" : "正常";
}

function publicProfileHref(nextUser) {
  return nextUser?.id ? `/users/${encodeURIComponent(nextUser.id)}` : "/community";
}

function formatTime(value) {
  if (!value) return "暂无";
  return new Date(value).toLocaleString("zh-CN", { hour12: false });
}
</script>
