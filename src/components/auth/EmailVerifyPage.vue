<template>
  <section class="auth-page">
    <div class="section-head blog-page-head">
      <div>
        <p class="eyebrow">Email</p>
        <h2>邮箱验证</h2>
      </div>
      <a class="secondary-link compact-action" href="/login">返回登录</a>
    </div>

    <div class="auth-panel">
      <p class="auth-lead">{{ statusMessage }}</p>
      <p v-if="detailMessage" class="form-message" :class="{ 'error-state': isErrorState }">{{ detailMessage }}</p>

      <div v-if="showResend" class="auth-notice">
        <label class="field-label">
          注册邮箱
          <input v-model.trim="email" type="email" autocomplete="email" placeholder="you@example.com" />
        </label>
        <button class="secondary-link compact-action" type="button" :disabled="isResending || cooldownSeconds > 0" @click="handleResend">
          {{ resendButtonLabel }}
        </button>
        <p v-if="resendMessage" class="form-message">{{ resendMessage }}</p>
      </div>

      <div class="auth-actions">
        <a v-if="status === 'success' || status === 'already'" class="primary-link" href="/account">进入账号页</a>
        <a class="secondary-link" href="/register">重新注册</a>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { resendVerificationEmail, verifyEmail } from "../../services/auth";
import { refreshAuth } from "../../services/authState";
import { useCooldown } from "../../utils/useCooldown";
import { setPageSeo } from "../../utils/seo";

const token = new URLSearchParams(window.location.search).get("token") || "";
const sent = new URLSearchParams(window.location.search).get("sent") === "1";
const status = ref("verifying");
const detailMessage = ref("");
const email = ref("");
const resendMessage = ref("");
const isResending = ref(false);
const { cooldownSeconds, startCooldown } = useCooldown();

const statusMessage = computed(() => {
  if (status.value === "verifying") return "正在验证邮箱，请稍候...";
  if (status.value === "success") return "邮箱验证成功。";
  if (status.value === "already") return "邮箱已经验证。";
  if (status.value === "sent") return "验证邮件已发送。";
  if (status.value === "unverified") return "请先完成邮箱验证。";
  if (status.value === "expired") return "验证链接已过期。";
  if (status.value === "invalid") return "验证链接无效。";
  return "邮箱验证暂时失败。";
});
const isErrorState = computed(() => ["expired", "invalid", "failed"].includes(status.value));
const showResend = computed(() => ["sent", "unverified", "expired", "invalid", "failed"].includes(status.value));
const resendButtonLabel = computed(() => {
  if (isResending.value) return "发送中...";
  if (cooldownSeconds.value > 0) return `${cooldownSeconds.value} 秒后可重发`;
  return "重新发送验证邮件";
});

setPageSeo({
  title: "邮箱验证",
  description: "完成 4399123.com 账号邮箱验证。",
  path: "/verify-email",
});

onMounted(initialize);

async function handleVerify() {
  try {
    const data = await verifyEmail(token);
    status.value = data.code === "already_verified" ? "already" : "success";
    detailMessage.value = data.message || "验证完成，可以登录。";
  } catch (err) {
    if (err.code === "token_expired") {
      status.value = "expired";
      detailMessage.value = "链接已超过有效期。请输入注册邮箱，重新发送验证邮件。";
      return;
    }
    if (err.code === "invalid_token" || err.code === "missing_token") {
      status.value = "invalid";
      detailMessage.value = "链接无效或已经被替换。请输入注册邮箱，重新发送验证邮件。";
      return;
    }
    status.value = "failed";
    detailMessage.value = err.message || "验证失败，请稍后重试。";
  }
}

async function initialize() {
  if (token) {
    await handleVerify();
    return;
  }

  try {
    const authUser = await refreshAuth();
    if (authUser?.email) email.value = authUser.email;
    if (authUser?.emailVerified) {
      status.value = "already";
      detailMessage.value = "当前账号的邮箱已经验证。";
      return;
    }
    if (authUser) {
      status.value = sent ? "sent" : "unverified";
      detailMessage.value = sent
        ? "请检查注册邮箱并打开验证链接。完成验证前只能浏览公开内容。"
        : "完成验证后才能发帖、评论、上传头像或提交作品。";
      return;
    }
  } catch {
    // Anonymous visitors can still request another verification email.
  }

  status.value = sent ? "sent" : "invalid";
  detailMessage.value = sent
    ? "请检查注册邮箱并打开验证链接。"
    : "当前链接缺少验证 token。请重新发送验证邮件。";
}

async function handleResend() {
  detailMessage.value = "";
  resendMessage.value = "";
  if (!email.value || !email.value.includes("@")) {
    detailMessage.value = "请输入正确的注册邮箱。";
    return;
  }
  isResending.value = true;
  try {
    await resendVerificationEmail({ email: email.value });
    resendMessage.value = "新的验证邮件已发送，请检查邮箱。";
    startCooldown(60);
  } catch (err) {
    if (err.code === "resend_cooldown") {
      startCooldown(Number(err.details?.retryAfterSeconds || 60));
    }
    detailMessage.value = err.message || "验证邮件发送失败，请稍后再试。";
  } finally {
    isResending.value = false;
  }
}
</script>
