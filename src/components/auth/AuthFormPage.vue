<template>
  <section class="auth-page">
    <div class="section-head blog-page-head">
      <div>
        <p class="eyebrow">Account</p>
        <h2>{{ isRegister ? "注册" : "登录" }}</h2>
      </div>
      <a class="secondary-link compact-action" :href="isRegister ? '/login' : '/register'">
        {{ isRegister ? "已有账号" : "创建账号" }}
      </a>
    </div>

    <form class="auth-panel" @submit.prevent="submit">
      <p class="auth-lead">
        这套账号会用于 4399123.com 下的 Vibe Coding 项目，登录态通过同域 Cookie 共享。
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

      <label v-if="isRegister" class="field-label">
        注册来源
        <input v-model.trim="form.sourceProject" maxlength="80" />
      </label>

      <p v-if="error" class="form-message error-state">{{ error }}</p>
      <p v-if="success" class="form-message">{{ success }}</p>

      <button class="primary-link auth-submit" type="submit" :disabled="isSubmitting">
        {{ isSubmitting ? "提交中..." : isRegister ? "注册并登录" : "登录" }}
      </button>
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
        sourceProject: form.sourceProject || "4399123.com",
      });
      success.value = "注册成功，正在进入账号页。";
    } else {
      await loginUser({
        identifier: form.identifier,
        password: form.password,
      });
      success.value = "登录成功，正在进入账号页。";
    }
    window.location.href = "/account";
  } catch (err) {
    error.value = err.message || "操作失败。";
  } finally {
    isSubmitting.value = false;
  }
}
</script>
