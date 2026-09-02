<template>
  <section class="auth-page auth-form-page">
    <div class="section-head blog-page-head">
      <div>
        <p class="eyebrow">Security</p>
        <h2>设置新密码</h2>
      </div>
      <a class="secondary-link compact-action" href="/login">返回登录</a>
    </div>

    <form class="auth-panel" @submit.prevent="submit">
      <p class="auth-lead">新密码至少 10 位，设置成功后旧登录会话将失效。</p>
      <label class="field-label">
        新密码
        <input v-model="password" type="password" autocomplete="new-password" required minlength="10" />
      </label>
      <label class="field-label">
        确认新密码
        <input v-model="confirmPassword" type="password" autocomplete="new-password" required minlength="10" />
      </label>
      <p v-if="message" class="form-message">{{ message }}</p>
      <p v-if="error" class="form-message error-state">{{ error }}</p>
      <button v-if="!isComplete" class="primary-link auth-submit" type="submit" :disabled="isSubmitting || !hasCredentials">
        {{ isSubmitting ? "提交中..." : "重置密码" }}
      </button>
      <div v-else class="auth-actions">
        <a class="primary-link" href="/login">使用新密码登录</a>
      </div>
      <div v-if="!hasCredentials" class="auth-secondary-actions">
        <a href="/forgot-password">重新申请重置邮件</a>
      </div>
    </form>
  </section>
</template>

<script setup>
import { computed, ref } from "vue";
import { confirmPasswordReset } from "../../services/auth";
import { setPageSeo } from "../../utils/seo";

const query = new URLSearchParams(window.location.search);
const uid = query.get("uid") || "";
const token = query.get("token") || "";
const password = ref("");
const confirmPassword = ref("");
const error = ref("");
const message = ref("");
const isSubmitting = ref(false);
const isComplete = ref(false);
const hasCredentials = computed(() => Boolean(uid && token));

if (!hasCredentials.value) {
  error.value = "当前链接缺少重置凭据，请重新申请密码重置邮件。";
}

setPageSeo({
  title: "设置新密码",
  description: "设置新的 4399123.com 账号密码。",
  path: "/reset-password",
});

async function submit() {
  error.value = "";
  message.value = "";
  if (password.value.length < 10) {
    error.value = "密码至少需要 10 位。";
    return;
  }
  if (password.value !== confirmPassword.value) {
    error.value = "两次输入的密码不一致。";
    return;
  }

  isSubmitting.value = true;
  try {
    const data = await confirmPasswordReset({ uid, token, password: password.value });
    message.value = data.message || "密码已重置，请使用新密码登录。";
    isComplete.value = true;
    password.value = "";
    confirmPassword.value = "";
  } catch (err) {
    error.value = err.message || "密码重置失败，请重新申请。";
  } finally {
    isSubmitting.value = false;
  }
}
</script>
