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

      <label v-if="isRegister" class="field-label">
        用户名
        <input v-model.trim="form.username" autocomplete="username" required minlength="3" maxlength="32" />
      </label>

      <label class="field-label">
        {{ isRegister ? "邮箱" : "邮箱或用户名" }}
        <input
          v-model.trim="form.identifier"
          :type="isRegister ? 'email' : 'text'"
          :autocomplete="isRegister ? 'email' : 'username'"
          required
        />
      </label>

      <label class="field-label">
        密码
        <input v-model="form.password" type="password" autocomplete="current-password" required minlength="8" />
      </label>

      <p v-if="error" class="form-message error-state">{{ error }}</p>
      <p v-if="success" class="form-message">{{ success }}</p>

      <button class="primary-link auth-submit" type="submit" :disabled="isSubmitting">
        {{ isSubmitting ? "提交中..." : isRegister ? "注册" : "登录" }}
      </button>
      <div class="auth-secondary-actions">
        <a :href="switchAuthHref">{{ isRegister ? "使用已有账号登录" : "没有账号？创建一个" }}</a>
      </div>
    </form>
  </section>
</template>

<script setup>
import { computed, reactive, ref, watchEffect } from "vue";
import { loginUser, registerUser } from "../../services/auth";
import { setPageSeo } from "../../utils/seo";

const props = defineProps({
  mode: {
    type: String,
    default: "login",
  },
});

const isRegister = computed(() => props.mode === "register");
const isSubmitting = ref(false);
const error = ref("");
const success = ref("");
const form = reactive({
  username: "",
  identifier: "",
  password: "",
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

watchEffect(() => {
  setPageSeo({
    title: isRegister.value ? "注册账号" : "登录账号",
    description: "4399123.com Vibe Coding 项目的统一账号入口。",
    path: isRegister.value ? "/register" : "/login",
  });
});

async function submit() {
  error.value = "";
  success.value = "";
  if (form.password.length < 8) {
    error.value = "密码至少需要 8 位。";
    return;
  }

  isSubmitting.value = true;
  try {
    if (isRegister.value) {
      await registerUser({
        username: form.username,
        email: form.identifier,
        password: form.password,
        sourceProject: "4399123.com",
      });
      success.value = "注册成功，正在进入账号页。";
      window.location.href = redirectTarget.value;
    } else {
      await loginUser({
        identifier: form.identifier,
        password: form.password,
      });
      success.value = "登录成功，正在进入账号页。";
      window.location.href = redirectTarget.value;
    }
  } catch (err) {
    error.value = err.message || "操作失败。";
  } finally {
    isSubmitting.value = false;
  }
}
</script>
