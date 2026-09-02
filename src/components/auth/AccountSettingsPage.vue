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
          <span :class="{ verified: user.emailVerified }">{{ user.emailVerified ? "邮箱已验证" : "邮箱待验证" }}</span>
          <span>{{ statusLabel(user.status) }}</span>
        </div>
      </aside>

      <div class="account-main">
        <div v-if="!user.emailVerified" class="auth-notice">
          <p>当前账号只能浏览公开内容。请先验证邮箱，再修改资料、参与社区或提交作品。</p>
          <a class="primary-link compact-action" href="/verify-email">验证邮箱</a>
        </div>

        <form class="auth-panel account-card" @submit.prevent="handleProfileSubmit">
          <div class="panel-title-row">
            <div>
              <p class="eyebrow">Profile</p>
              <h3>基础资料</h3>
            </div>
            <button class="primary-link compact-action" type="submit" :disabled="isSaving || !user.emailVerified">
              {{ isSaving ? "保存中..." : "保存资料" }}
            </button>
          </div>

          <label class="field-label">
            用户名
            <input v-model.trim="profileForm.username" autocomplete="username" required minlength="3" maxlength="32" :disabled="!user.emailVerified" />
          </label>
          <p class="field-help">3-32 位字母、数字（支持中文）、下划线、点或短横线。</p>

          <label class="field-label">
            联系邮箱
            <input :value="user.email" autocomplete="email" disabled />
          </label>
          <p class="field-help">登录邮箱可以在下方「修改绑定邮箱」中更换。</p>

          <label class="field-label">
            个人简介
            <textarea v-model.trim="profileForm.bio" maxlength="280" rows="4" placeholder="用一句话介绍你正在做什么。" :disabled="!user.emailVerified" />
          </label>
          <p class="field-help">{{ profileForm.bio.length }}/280</p>

          <label class="field-label">
            头像
            <input type="file" accept="image/png,image/jpeg,image/gif,image/webp" :disabled="isUploadingAvatar || !user.emailVerified" @change="handleAvatarChange" />
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
            <p>可以在下方修改密码或换绑邮箱；忘记密码时也可以通过已验证邮箱重置。</p>
            <div class="inline-actions">
              <a class="secondary-link compact-action" href="/forgot-password">通过邮箱重置密码</a>
              <a class="secondary-link compact-action" href="/help#contact">联系支持</a>
            </div>
          </div>
        </div>

        <form class="auth-panel account-card" @submit.prevent="handleChangePassword">
          <div class="panel-title-row">
            <div>
              <p class="eyebrow">Password</p>
              <h3>修改密码</h3>
            </div>
            <button class="primary-link compact-action" type="submit" :disabled="isChangingPassword">
              {{ isChangingPassword ? "提交中..." : "更新密码" }}
            </button>
          </div>

          <label class="field-label">
            当前密码
            <input v-model="passwordForm.current" type="password" autocomplete="current-password" required />
          </label>
          <p v-if="passwordErrors.current" class="form-message error-state">{{ passwordErrors.current }}</p>

          <label class="field-label">
            新密码
            <input v-model="passwordForm.next" type="password" autocomplete="new-password" required minlength="10" />
          </label>
          <label class="field-label">
            确认新密码
            <input v-model="passwordForm.confirm" type="password" autocomplete="new-password" required minlength="10" />
          </label>
          <p v-if="passwordErrors.next" class="form-message error-state">{{ passwordErrors.next }}</p>
          <p class="field-help">至少 10 位，避免使用常见密码或纯数字密码。修改成功后，其他设备上的登录会话将失效。</p>

          <p v-if="passwordMessage" class="form-message">{{ passwordMessage }}</p>
          <p v-if="passwordError" class="form-message error-state">{{ passwordError }}</p>
        </form>

        <form class="auth-panel account-card" @submit.prevent="handleEmailSubmit">
          <div class="panel-title-row">
            <div>
              <p class="eyebrow">Email</p>
              <h3>修改绑定邮箱</h3>
            </div>
            <button class="primary-link compact-action" type="submit" :disabled="isRequestingEmailCode || isConfirmingEmail">
              {{ emailSubmitLabel }}
            </button>
          </div>

          <template v-if="emailStep === 1">
            <label class="field-label">
              当前密码
              <input v-model="emailForm.currentPassword" type="password" autocomplete="current-password" required />
            </label>
            <p v-if="emailErrors.password" class="form-message error-state">{{ emailErrors.password }}</p>

            <label class="field-label">
              新邮箱
              <input v-model.trim="emailForm.newEmail" type="email" autocomplete="email" required />
            </label>
            <p v-if="emailErrors.email" class="form-message error-state">{{ emailErrors.email }}</p>
            <p class="field-help">我们会向新邮箱发送 6 位验证码，验证通过后完成换绑；旧邮箱会收到安全通知。</p>
          </template>
          <template v-else>
            <div class="auth-notice neutral">
              <p>验证码已发送至 {{ emailForm.newEmail }}。</p>
              <button type="button" class="secondary-link compact-action" @click="backToEmailForm">返回修改</button>
            </div>
            <label class="field-label">
              邮箱验证码
              <input
                v-model.trim="emailForm.code"
                inputmode="numeric"
                autocomplete="one-time-code"
                maxlength="6"
                placeholder="6 位数字验证码"
                required
              />
            </label>
            <p v-if="emailErrors.code" class="form-message error-state">{{ emailErrors.code }}</p>
            <button
              type="button"
              class="secondary-link compact-action"
              :disabled="isRequestingEmailCode || cooldownSeconds > 0"
              @click="handleRequestEmailCode"
            >
              {{ emailResendLabel }}
            </button>
          </template>

          <p v-if="emailMessage" class="form-message">{{ emailMessage }}</p>
          <p v-if="emailError" class="form-message error-state">{{ emailError }}</p>
        </form>

        <div class="auth-panel account-card">
          <div class="panel-title-row">
            <div>
              <p class="eyebrow">Devices</p>
              <h3>登录设备</h3>
            </div>
            <button
              class="secondary-link compact-action"
              type="button"
              :disabled="isRevokingOthers || sessions.length <= 1"
              @click="openRevokeOthers"
            >
              退出其他所有设备
            </button>
          </div>

          <div v-if="sessionsLoading" class="inline-state">正在读取登录设备...</div>
          <div v-else-if="sessionsError" class="inline-state error-state">{{ sessionsError }}</div>
          <div v-else class="device-list">
            <div v-for="item in sessions" :key="item.id" class="device-row" :class="{ current: item.current }">
              <div>
                <strong>
                  {{ item.deviceLabel }}
                  <span v-if="item.current" class="device-tag">当前设备</span>
                  <span v-if="item.rememberMe" class="device-tag muted">记住我</span>
                </strong>
                <p>IP {{ item.ip || "未知" }} · 最后活跃 {{ formatTime(item.lastActiveAt) }}</p>
              </div>
              <button
                v-if="!item.current"
                class="secondary-link compact-action"
                type="button"
                :disabled="revokingSessionId === item.id"
                @click="handleRevokeSession(item)"
              >
                {{ revokingSessionId === item.id ? "退出中..." : "退出" }}
              </button>
            </div>
            <p v-if="!sessions.length" class="inline-state">暂无登录设备记录。</p>
          </div>
          <p v-if="sessionsMessage" class="form-message">{{ sessionsMessage }}</p>
        </div>
      </div>
    </div>

    <AdminConfirmDialog
      :open="revokeOthersDialog.open"
      title="退出其他所有设备"
      message="其他设备上的登录会话将立即失效，仅保留当前设备。"
      :with-reason="false"
      confirm-label="确认退出"
      :busy="isRevokingOthers"
      :error="revokeOthersDialog.error"
      @cancel="revokeOthersDialog.open = false"
      @confirm="confirmRevokeOthers"
    />
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import {
  changePassword,
  confirmEmailChange,
  getSessions,
  logoutUser,
  requestEmailChange,
  revokeOtherSessions,
  revokeSession,
  updateProfile,
  uploadAvatar,
} from "../../services/auth";
import AdminConfirmDialog from "./AdminConfirmDialog.vue";
import { refreshAuth, setAuthUser } from "../../services/authState";
import { useCooldown } from "../../utils/useCooldown";
import { setPageSeo } from "../../utils/seo";

const CODE_RE = /^\d{6}$/;

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

const isChangingPassword = ref(false);
const passwordMessage = ref("");
const passwordError = ref("");
const passwordForm = reactive({ current: "", next: "", confirm: "" });
const passwordErrors = reactive({ current: "", next: "" });

const emailStep = ref(1);
const isRequestingEmailCode = ref(false);
const isConfirmingEmail = ref(false);
const emailMessage = ref("");
const emailError = ref("");
const emailForm = reactive({ currentPassword: "", newEmail: "", code: "" });
const emailErrors = reactive({ password: "", email: "", code: "" });
const { cooldownSeconds, startCooldown } = useCooldown();

const sessions = ref([]);
const sessionsLoading = ref(false);
const sessionsError = ref("");
const sessionsMessage = ref("");
const revokingSessionId = ref(0);
const isRevokingOthers = ref(false);
const revokeOthersDialog = reactive({ open: false, error: "" });

const emailSubmitLabel = computed(() => {
  if (emailStep.value === 1) return isRequestingEmailCode.value ? "发送中..." : "发送验证码";
  return isConfirmingEmail.value ? "提交中..." : "确认换绑";
});
const emailResendLabel = computed(() => {
  if (isRequestingEmailCode.value) return "发送中...";
  if (cooldownSeconds.value > 0) return `${cooldownSeconds.value} 秒后可重发`;
  return "重新发送验证码";
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
    setUser(await refreshAuth());
    if (user.value) loadSessions();
  } catch (err) {
    error.value = err.message || "读取用户失败。";
  } finally {
    isLoading.value = false;
  }
}

async function loadSessions() {
  sessionsLoading.value = true;
  sessionsError.value = "";
  try {
    const data = await getSessions();
    sessions.value = Array.isArray(data.sessions) ? data.sessions : [];
  } catch (err) {
    sessionsError.value = err.message || "登录设备读取失败。";
  } finally {
    sessionsLoading.value = false;
  }
}

async function handleRevokeSession(item) {
  sessionsMessage.value = "";
  sessionsError.value = "";
  revokingSessionId.value = item.id;
  try {
    await revokeSession(item.id);
    sessionsMessage.value = "该设备已退出登录。";
    await loadSessions();
  } catch (err) {
    sessionsError.value = err.message || "退出失败，请稍后再试。";
  } finally {
    revokingSessionId.value = 0;
  }
}

function openRevokeOthers() {
  revokeOthersDialog.error = "";
  revokeOthersDialog.open = true;
}

async function confirmRevokeOthers() {
  isRevokingOthers.value = true;
  revokeOthersDialog.error = "";
  try {
    const data = await revokeOtherSessions();
    revokeOthersDialog.open = false;
    sessionsMessage.value = data.message || "已退出其他所有设备。";
    await loadSessions();
  } catch (err) {
    revokeOthersDialog.error = err.message || "操作失败，请稍后再试。";
  } finally {
    isRevokingOthers.value = false;
  }
}

function setUser(nextUser) {
  user.value = nextUser;
  profileForm.username = nextUser?.username || "";
  profileForm.bio = nextUser?.bio || "";
  setAuthUser(nextUser);
}

async function handleProfileSubmit() {
  error.value = "";
  profileMessage.value = "";
  profileForm.username = profileForm.username.normalize("NFKC").trim();
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

function clearPasswordMessages() {
  passwordMessage.value = "";
  passwordError.value = "";
  passwordErrors.current = "";
  passwordErrors.next = "";
}

async function handleChangePassword() {
  clearPasswordMessages();
  if (passwordForm.next.length < 10) {
    passwordErrors.next = "新密码至少需要 10 位。";
    return;
  }
  if (passwordForm.next !== passwordForm.confirm) {
    passwordErrors.next = "两次输入的新密码不一致。";
    return;
  }
  isChangingPassword.value = true;
  try {
    const data = await changePassword({
      currentPassword: passwordForm.current,
      newPassword: passwordForm.next,
    });
    passwordMessage.value = data.message || "密码已修改。其他设备上的登录会话已失效。";
    passwordForm.current = "";
    passwordForm.next = "";
    passwordForm.confirm = "";
  } catch (err) {
    if (err.code === "invalid_current_password") {
      passwordErrors.current = err.message || "当前密码不正确。";
    } else if (err.code === "weak_password") {
      passwordErrors.next = err.message || "密码强度不足。";
    } else if (err.status === 429) {
      passwordError.value = err.message || "尝试过于频繁，请稍后再试。";
    } else {
      passwordError.value = err.message || "密码修改失败，请稍后再试。";
    }
  } finally {
    isChangingPassword.value = false;
  }
}

function clearEmailMessages() {
  emailMessage.value = "";
  emailError.value = "";
  emailErrors.password = "";
  emailErrors.email = "";
  emailErrors.code = "";
}

function backToEmailForm() {
  clearEmailMessages();
  emailStep.value = 1;
}

function handleEmailSubmit() {
  if (emailStep.value === 1) {
    handleRequestEmailCode();
  } else {
    handleConfirmEmail();
  }
}

async function handleRequestEmailCode() {
  clearEmailMessages();
  if (!emailForm.currentPassword) {
    emailStep.value = 1;
    emailErrors.password = "请输入当前密码。";
    return;
  }
  if (!emailForm.newEmail || !emailForm.newEmail.includes("@")) {
    emailStep.value = 1;
    emailErrors.email = "请输入正确的新邮箱地址。";
    return;
  }
  isRequestingEmailCode.value = true;
  try {
    const data = await requestEmailChange({
      currentPassword: emailForm.currentPassword,
      newEmail: emailForm.newEmail,
    });
    emailStep.value = 2;
    startCooldown(Number(data.cooldownSeconds) || 60);
    emailMessage.value = data.message || "验证码已发送，请查收新邮箱。";
  } catch (err) {
    if (err.code === "invalid_current_password") {
      emailStep.value = 1;
      emailErrors.password = err.message || "当前密码不正确。";
    } else if (err.code === "invalid_email" || err.code === "same_email") {
      emailStep.value = 1;
      emailErrors.email = err.message || "邮箱不可用。";
    } else if (err.code === "resend_cooldown") {
      emailStep.value = 2;
      startCooldown(Number(err.details?.retryAfterSeconds || 60));
      emailError.value = "验证码发送过于频繁，请稍后重发；也可以直接输入之前收到的验证码。";
    } else {
      emailError.value = err.message || "验证码发送失败，请稍后再试。";
    }
  } finally {
    isRequestingEmailCode.value = false;
  }
}

async function handleConfirmEmail() {
  clearEmailMessages();
  if (!CODE_RE.test(emailForm.code)) {
    emailErrors.code = "请输入 6 位数字验证码。";
    return;
  }
  isConfirmingEmail.value = true;
  try {
    const data = await confirmEmailChange({
      newEmail: emailForm.newEmail,
      code: emailForm.code,
    });
    setUser(data.user);
    emailMessage.value = data.message || "绑定邮箱已更新并完成验证。";
    emailForm.currentPassword = "";
    emailForm.newEmail = "";
    emailForm.code = "";
    emailStep.value = 1;
  } catch (err) {
    if (err.code === "invalid_code" || err.code === "expired_code") {
      emailErrors.code = err.message || "验证码不正确或已过期。";
    } else if (err.code === "account_unavailable") {
      emailStep.value = 1;
      emailErrors.email = err.message || "该邮箱暂不可用，请更换后重试。";
    } else {
      emailError.value = err.message || "换绑失败，请稍后再试。";
    }
  } finally {
    isConfirmingEmail.value = false;
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

<style scoped>
.device-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.device-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  border: 1px solid rgba(23, 33, 29, 0.12);
  border-radius: 10px;
}
.device-row.current {
  border-color: rgba(31, 95, 70, 0.45);
}
.device-row p {
  margin: 4px 0 0;
  font-size: 0.85rem;
  color: var(--muted, #5d6b63);
}
.device-tag {
  display: inline-block;
  margin-left: 6px;
  padding: 1px 7px;
  border-radius: 999px;
  font-size: 0.72rem;
  background: rgba(31, 95, 70, 0.12);
  color: #1f5f46;
  vertical-align: middle;
}
.device-tag.muted {
  background: rgba(23, 33, 29, 0.08);
  color: #5d6b63;
}
</style>
