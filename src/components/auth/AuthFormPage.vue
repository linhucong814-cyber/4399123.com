<template>
  <section class="auth-page auth-form-page">
    <div class="section-head blog-page-head">
      <div>
        <p class="eyebrow">Account</p>
        <h2>{{ isRegister ? "注册" : "登录" }}</h2>
      </div>
      <a class="secondary-link compact-action" :href="switchAuthHref">
        {{ isRegister ? "已有账号" : "创建账号" }}
      </a>
    </div>

    <form class="auth-panel" @submit.prevent="submit">
      <p class="auth-lead">
        使用 4399123.com 统一账号进入社区、作品分享和个人后台。
      </p>

      <!-- 登录 -->
      <template v-if="!isRegister">
        <label class="field-label">
          邮箱或用户名
          <input v-model.trim="form.identifier" type="text" autocomplete="username" required />
        </label>
        <label class="field-label">
          密码
          <input v-model="form.password" type="password" autocomplete="current-password" required minlength="10" />
        </label>
        <label class="auth-remember">
          <input v-model="form.rememberMe" type="checkbox" />
          <span>记住我（30 天内免登录）</span>
        </label>
      </template>

      <!-- 注册第一步：邮箱 -->
      <template v-else-if="registerStep === 1">
        <label class="field-label">
          邮箱
          <input v-model.trim="form.identifier" type="email" autocomplete="email" required />
        </label>
        <p v-if="fieldErrors.email" class="form-message error-state">{{ fieldErrors.email }}</p>
        <p class="field-help">我们会向这个邮箱发送 6 位验证码，验证通过后完成注册。</p>
      </template>

      <!-- 注册第二步：验证码 + 账号信息 -->
      <template v-else>
        <div class="auth-notice">
          <p class="field-help">验证码已发送至 {{ form.identifier }}。</p>
          <button type="button" class="secondary-link compact-action" @click="backToEmailStep">修改邮箱</button>
        </div>
        <label class="field-label">
          邮箱验证码
          <input
            v-model.trim="form.code"
            inputmode="numeric"
            autocomplete="one-time-code"
            maxlength="6"
            placeholder="6 位数字验证码"
            required
          />
        </label>
        <p v-if="fieldErrors.code" class="form-message error-state">{{ fieldErrors.code }}</p>
        <button
          type="button"
          class="secondary-link compact-action"
          :disabled="isSendingCode || cooldownSeconds > 0"
          @click="sendCode"
        >
          {{ resendButtonLabel }}
        </button>

        <label class="field-label">
          用户名
          <input v-model="form.username" autocomplete="username" autocapitalize="none" spellcheck="false" required minlength="1" aria-describedby="register-username-help" />
        </label>
        <p id="register-username-help" class="field-help">{{ USERNAME_HELP }}</p>
        <p v-if="fieldErrors.username" class="form-message error-state">{{ fieldErrors.username }}</p>

        <label class="field-label">
          密码
          <input v-model="form.password" type="password" autocomplete="new-password" required minlength="10" />
        </label>
        <label class="field-label">
          确认密码
          <input v-model="form.confirmPassword" type="password" autocomplete="new-password" required minlength="10" />
        </label>
        <p v-if="fieldErrors.password" class="form-message error-state">{{ fieldErrors.password }}</p>
        <p class="field-help">至少 10 位，避免使用常见密码或纯数字密码。</p>
      </template>

      <p v-if="error" class="form-message error-state">{{ error }}</p>
      <p v-if="success" class="form-message">{{ success }}</p>

      <button class="primary-link auth-submit" type="submit" :disabled="isSubmitting || isSendingCode">
        {{ submitLabel }}
      </button>
      <div class="auth-secondary-actions">
        <a :href="switchAuthHref">{{ isRegister ? "使用已有账号登录" : "没有账号？创建一个" }}</a>
        <a v-if="!isRegister" href="/forgot-password">忘记密码？</a>
      </div>
    </form>
  </section>
</template>

<script setup>
import { computed, reactive, ref, watchEffect } from "vue";
import { loginUser, registerUser, sendRegisterCode } from "../../services/auth";
import { useCooldown } from "../../utils/useCooldown";
import { setPageSeo } from "../../utils/seo";
import { USERNAME_HELP, USERNAME_RE, normalizeUsername } from "../../utils/accountProfile";

const CODE_RE = /^\d{6}$/;

const props = defineProps({
  mode: {
    type: String,
    default: "login",
  },
});

const isRegister = computed(() => props.mode === "register");
const isSubmitting = ref(false);
const isSendingCode = ref(false);
const registerStep = ref(1);
const error = ref("");
const success = ref("");
const { cooldownSeconds, startCooldown } = useCooldown();
const fieldErrors = reactive({ email: "", code: "", username: "", password: "" });
const form = reactive({
  username: "",
  identifier: "",
  password: "",
  confirmPassword: "",
  code: "",
  rememberMe: false,
  sourceProject: "4399123.com",
});
const redirectTarget = computed(() => {
  const next = new URLSearchParams(window.location.search).get("next") || "";
  if (!next.startsWith("/") || next.startsWith("//")) return "/account";
  return next;
});
const switchAuthHref = computed(() => {
  const base = isRegister.value ? "/login" : "/register";
  const next = new URLSearchParams(window.location.search).get("next");
  return next ? `${base}?next=${encodeURIComponent(next)}` : base;
});
const submitLabel = computed(() => {
  if (isRegister.value && registerStep.value === 1) {
    return isSendingCode.value ? "发送中..." : "发送验证码";
  }
  if (isSubmitting.value) return "提交中...";
  return isRegister.value ? "注册" : "登录";
});
const resendButtonLabel = computed(() => {
  if (isSendingCode.value) return "发送中...";
  if (cooldownSeconds.value > 0) return `${cooldownSeconds.value} 秒后可重发`;
  return "重新发送验证码";
});

watchEffect(() => {
  setPageSeo({
    title: isRegister.value ? "注册账号" : "登录账号",
    description: "4399123.com Vibe Coding 项目的统一账号入口。",
    path: isRegister.value ? "/register" : "/login",
  });
});

function clearMessages() {
  error.value = "";
  success.value = "";
  fieldErrors.email = "";
  fieldErrors.code = "";
  fieldErrors.username = "";
  fieldErrors.password = "";
}

function backToEmailStep() {
  clearMessages();
  registerStep.value = 1;
}

async function sendCode() {
  clearMessages();
  if (!form.identifier || !form.identifier.includes("@")) {
    registerStep.value = 1;
    fieldErrors.email = "请输入正确的邮箱地址。";
    return;
  }
  isSendingCode.value = true;
  try {
    const data = await sendRegisterCode(form.identifier);
    registerStep.value = 2;
    startCooldown(Number(data.cooldownSeconds) || 60);
    success.value = data.message || "验证码已发送，请查收邮箱。";
  } catch (err) {
    if (err.code === "resend_cooldown") {
      registerStep.value = 2;
      startCooldown(Number(err.retryAfterSeconds || err.details?.retryAfterSeconds || 60));
      error.value = "验证码发送过于频繁，请稍后重发；也可以直接输入之前收到的验证码。";
    } else if (err.code === "invalid_email") {
      registerStep.value = 1;
      fieldErrors.email = err.message || "邮箱格式不正确。";
    } else {
      error.value = err.message || "验证码发送失败，请稍后再试。";
    }
  } finally {
    isSendingCode.value = false;
  }
}

function applyRegisterError(err) {
  switch (err.code) {
    case "invalid_code":
    case "expired_code":
      fieldErrors.code = err.message || "验证码不正确或已过期。";
      break;
    case "invalid_email":
      registerStep.value = 1;
      fieldErrors.email = err.message || "邮箱格式不正确。";
      break;
    case "invalid_username":
    case "reserved_username":
      fieldErrors.username = err.message || "用户名不可用。";
      break;
    case "account_unavailable":
      fieldErrors.username = "账号信息不可用，请更换用户名或邮箱后重试。";
      break;
    case "weak_password":
      fieldErrors.password = err.message || "密码强度不足。";
      break;
    default:
      error.value =
        err.status === 429 && err.retryAfterSeconds
          ? `${err.message}（约 ${err.retryAfterSeconds} 秒后可重试）`
          : err.message || "操作失败。";
  }
}

async function submit() {
  if (isRegister.value && registerStep.value === 1) {
    await sendCode();
    return;
  }
  clearMessages();
  if (form.password.length < 10) {
    fieldErrors.password = "密码至少需要 10 位。";
    return;
  }

  if (isRegister.value) {
    form.username = normalizeUsername(form.username);
    if (!CODE_RE.test(form.code)) {
      fieldErrors.code = "请输入 6 位数字验证码。";
      return;
    }
    if (!USERNAME_RE.test(form.username)) {
      fieldErrors.username = `用户名需为 ${USERNAME_HELP}`;
      return;
    }
    if (form.password !== form.confirmPassword) {
      fieldErrors.password = "两次输入的密码不一致。";
      return;
    }
    isSubmitting.value = true;
    try {
      await registerUser({
        username: form.username,
        email: form.identifier,
        password: form.password,
        code: form.code,
        sourceProject: "4399123.com",
      });
      success.value = "注册成功，邮箱已完成验证，正在进入账号页。";
      window.location.href = redirectTarget.value;
    } catch (err) {
      applyRegisterError(err);
    } finally {
      isSubmitting.value = false;
    }
    return;
  }

  isSubmitting.value = true;
  try {
    const data = await loginUser({
      identifier: form.identifier,
      password: form.password,
      rememberMe: form.rememberMe,
    });
    if (!data.user?.emailVerified) {
      success.value = "登录成功，请先完成邮箱验证。";
      window.location.href = "/verify-email";
    } else {
      success.value = "登录成功，正在进入账号页。";
      window.location.href = redirectTarget.value;
    }
  } catch (err) {
    error.value =
      err.status === 429 && err.retryAfterSeconds
        ? `${err.message}（约 ${err.retryAfterSeconds} 秒后可重试）`
        : err.message || "操作失败。";
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
.auth-remember {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.92rem;
  cursor: pointer;
  user-select: none;
}
.auth-remember input {
  width: auto;
  margin: 0;
}
</style>
