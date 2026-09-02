<template>
  <section class="auth-page auth-form-page">
    <div class="section-head blog-page-head">
      <div>
        <p class="eyebrow">Security</p>
        <h2>找回密码</h2>
      </div>
      <a class="secondary-link compact-action" href="/login">返回登录</a>
    </div>

    <form class="auth-panel" @submit.prevent="submit">
      <p class="auth-lead">输入已验证的注册邮箱。无论账号是否存在，页面都会显示相同结果。</p>
      <label class="field-label">
        注册邮箱
        <input v-model.trim="email" type="email" autocomplete="email" required />
      </label>
      <p v-if="message" class="form-message">{{ message }}</p>
      <p v-if="error" class="form-message error-state">{{ error }}</p>
      <button class="primary-link auth-submit" type="submit" :disabled="isSubmitting">
        {{ isSubmitting ? "发送中..." : "发送重置邮件" }}
      </button>
      <div class="auth-secondary-actions">
        <span class="field-help">
          没收到邮件？重置邮件只会发送给已完成验证的邮箱。如果你的邮箱还未完成验证，可以先
          <a href="/verify-email">重新发送验证邮件</a>，完成验证后再来重置密码。
        </span>
      </div>
    </form>
  </section>
</template>

<script setup>
import { ref } from "vue";
import { requestPasswordReset } from "../../services/auth";
import { setPageSeo } from "../../utils/seo";

const email = ref("");
const error = ref("");
const message = ref("");
const isSubmitting = ref(false);

setPageSeo({
  title: "找回密码",
  description: "通过已验证邮箱重置 4399123.com 账号密码。",
  path: "/forgot-password",
});

async function submit() {
  error.value = "";
  message.value = "";
  isSubmitting.value = true;
  try {
    const data = await requestPasswordReset(email.value);
    message.value = data.message || "如果邮箱对应可用账号，我们会发送密码重置邮件。";
  } catch (err) {
    error.value = err.message || "重置邮件暂时无法发送，请稍后再试。";
  } finally {
    isSubmitting.value = false;
  }
}
</script>
