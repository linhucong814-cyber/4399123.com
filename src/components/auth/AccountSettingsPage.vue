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
    <div v-else-if="loadError" class="auth-panel account-card" role="alert">
      <p>{{ loadError }}</p>
      <button class="secondary-link compact-action" type="button" @click="loadUser">重新加载</button>
    </div>

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
          <img v-if="user.avatarUrl && !avatarFailed" :src="user.avatarUrl" :alt="`${user.username} 的头像`" @error="avatarFailed = true" />
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
        <nav class="settings-navigation" aria-label="账户设置分区">
          <a href="#settings-profile">基础资料</a>
          <a href="#settings-security">登录与安全</a>
          <a href="#settings-password">修改密码</a>
          <a href="#settings-email">绑定邮箱</a>
          <a href="#settings-devices">登录设备</a>
        </nav>
      </aside>

      <div class="account-main">
        <div v-if="!user.emailVerified" class="auth-notice">
          <p>当前账号只能浏览公开内容。请先验证邮箱，再修改资料、参与社区或提交作品。</p>
          <a class="primary-link compact-action" href="/verify-email">验证邮箱</a>
        </div>

        <form id="settings-profile" class="auth-panel account-card" :aria-busy="isSaving" @submit.prevent="handleProfileSubmit">
          <div class="panel-title-row">
            <div>
              <p class="eyebrow">Profile</p>
              <h3>基础资料</h3>
            </div>
            <span class="field-help">头像上传后立即生效，用户名和简介需保存。</span>
          </div>

          <label class="field-label">
            用户名
            <input ref="usernameInput" v-model="profileForm.username" autocomplete="username" autocapitalize="none" spellcheck="false" required minlength="1" aria-describedby="username-help username-change-help username-error" :aria-invalid="!!profileErrors.username" :disabled="profileBusy || !user.emailVerified || usernameLocked" @input="clearProfileMessages" />
          </label>
          <p id="username-help" class="field-help">{{ USERNAME_HELP }} {{ characterCount(normalizeUsername(profileForm.username)) }}/32</p>
          <p id="username-change-help" class="field-help">{{ usernameChangeHelp }}</p>
          <p id="username-error" v-show="profileErrors.username" class="form-message error-state" role="alert">{{ profileErrors.username }}</p>

          <label class="field-label">
            登录邮箱
            <input :value="user.email" type="email" readonly aria-describedby="profile-email-help" />
          </label>
          <p id="profile-email-help" class="field-help">用于登录和找回密码。<a href="#settings-email">修改绑定邮箱</a></p>

          <label class="field-label">
            个人简介
            <textarea ref="bioInput" v-model="profileForm.bio" rows="4" aria-describedby="bio-help bio-error" :aria-invalid="!!profileErrors.bio" placeholder="用一句话介绍你正在做什么。" :disabled="profileBusy || !user.emailVerified" @input="clearProfileMessages" />
          </label>
          <p id="bio-help" class="field-help">{{ characterCount(normalizeBio(profileForm.bio)) }}/280 个字符，将显示在公开主页。</p>
          <p id="bio-error" v-show="profileErrors.bio" class="form-message error-state" role="alert">{{ profileErrors.bio }}</p>

          <label class="field-label">
            头像
            <input type="file" accept="image/png,image/jpeg,image/gif,image/webp" aria-describedby="avatar-help" :disabled="profileBusy || !user.emailVerified" @change="handleAvatarChange" />
          </label>
          <p id="avatar-help" class="field-help">{{ isUploadingAvatar ? "头像上传中，请稍候..." : "支持 JPG、PNG、GIF、WebP，最大 2MB。上传后立即生效。" }}</p>

          <p v-if="profileMessage" class="form-message" role="status">{{ profileMessage }}</p>
          <p v-if="error" class="form-message error-state" role="alert">{{ error }}</p>
          <div class="profile-save-actions">
            <span class="field-help" role="status">{{ profileDirty ? "有尚未保存的修改" : "资料已同步" }}</span>
            <div class="inline-actions">
              <button class="secondary-link compact-action" type="button" :disabled="profileBusy || !profileDirty" @click="resetProfile">撤销修改</button>
              <button class="primary-link compact-action" type="submit" :disabled="profileBusy || !profileDirty || !user.emailVerified">
                {{ isSaving ? "保存中..." : "保存资料" }}
              </button>
            </div>
          </div>
        </form>

        <div id="settings-security" class="auth-panel account-card">
          <div class="panel-title-row">
            <div>
              <p class="eyebrow">Security</p>
              <h3>登录与安全</h3>
            </div>
            <button class="secondary-link compact-action" type="button" :disabled="anyMutationBusy" @click="handleLogout">{{ isLoggingOut ? "退出中..." : "退出登录" }}</button>
          </div>

          <div class="user-info-grid">
            <span>用户 ID</span><strong>{{ user.id }}</strong>
            <span>邮箱</span><strong>{{ user.email }}</strong>
            <span>注册方式</span><strong>账号密码注册</strong>
            <span>用户名可改时间</span><strong>{{ usernameLocked ? formatTime(user.canChangeUsernameAt) : "现在可以修改" }}</strong>
            <span>注册时间</span><strong>{{ formatTime(user.registeredAt) }}</strong>
            <span>最近登录</span><strong>{{ formatTime(user.lastLoginAt) }}</strong>
          </div>
          <p v-if="logoutError" class="form-message error-state" role="alert">{{ logoutError }}</p>

          <div class="auth-notice neutral">
            <p>可以在下方修改密码或换绑邮箱；忘记密码时也可以通过已验证邮箱重置。</p>
            <div class="inline-actions">
              <a class="secondary-link compact-action" href="/forgot-password">通过邮箱重置密码</a>
              <a class="secondary-link compact-action" href="/help#contact">联系支持</a>
            </div>
          </div>
        </div>

        <form id="settings-password" class="auth-panel account-card" :aria-busy="isChangingPassword" @submit.prevent="handleChangePassword">
          <div class="panel-title-row">
            <div>
              <p class="eyebrow">Password</p>
              <h3>修改密码</h3>
            </div>
            <button class="primary-link compact-action" type="submit" :disabled="securityBusy">
              {{ isChangingPassword ? "提交中..." : "更新密码" }}
            </button>
          </div>

          <label class="field-label">
            当前密码
            <input v-model="passwordForm.current" type="password" autocomplete="current-password" required :disabled="securityBusy" />
          </label>
          <p v-if="passwordErrors.current" class="form-message error-state">{{ passwordErrors.current }}</p>

          <label class="field-label">
            新密码
            <input v-model="passwordForm.next" type="password" autocomplete="new-password" required minlength="10" :disabled="securityBusy" />
          </label>
          <label class="field-label">
            确认新密码
            <input v-model="passwordForm.confirm" type="password" autocomplete="new-password" required minlength="10" :disabled="securityBusy" />
          </label>
          <p v-if="passwordErrors.next" class="form-message error-state">{{ passwordErrors.next }}</p>
          <p class="field-help">至少 10 位，避免使用常见密码或纯数字密码。修改成功后，其他设备上的登录会话将失效。</p>

          <p v-if="passwordMessage" class="form-message" role="status">{{ passwordMessage }}</p>
          <p v-if="passwordError" class="form-message error-state" role="alert">{{ passwordError }}</p>
        </form>

        <form id="settings-email" class="auth-panel account-card" :aria-busy="emailBusy" @submit.prevent="handleEmailSubmit">
          <div class="panel-title-row">
            <div>
              <p class="eyebrow">Email</p>
              <h3>修改绑定邮箱</h3>
            </div>
            <button class="primary-link compact-action" type="submit" :disabled="securityBusy || (emailStep === 1 && emailCooldownActive)">
              {{ emailSubmitLabel }}
            </button>
          </div>
          <p class="field-help">{{ emailStep === 1 ? "第 1 步：验证当前密码，发送验证码" : "第 2 步：验证新邮箱，确认换绑" }}</p>

          <template v-if="emailStep === 1">
            <label class="field-label">
              当前密码
              <input v-model="emailForm.currentPassword" type="password" autocomplete="current-password" required :disabled="securityBusy" />
            </label>
            <p v-if="emailErrors.password" class="form-message error-state">{{ emailErrors.password }}</p>

            <label class="field-label">
              新邮箱
              <input v-model.trim="emailForm.newEmail" type="email" autocomplete="email" required :disabled="securityBusy" />
            </label>
            <p v-if="emailErrors.email" class="form-message error-state">{{ emailErrors.email }}</p>
            <p class="field-help">我们会向新邮箱发送 6 位验证码，验证通过后完成换绑；旧邮箱会收到安全通知。</p>
          </template>
          <template v-else>
            <div class="auth-notice neutral">
              <p>请查收 {{ emailForm.newEmail }} 的验证码。{{ emailCodeMinutes ? `验证码 ${emailCodeMinutes} 分钟内有效。` : "" }}</p>
              <button type="button" class="secondary-link compact-action" :disabled="securityBusy" @click="backToEmailForm">返回修改</button>
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
                :disabled="securityBusy"
              />
            </label>
            <p v-if="emailErrors.code" class="form-message error-state">{{ emailErrors.code }}</p>
            <button
              type="button"
              class="secondary-link compact-action"
              :disabled="securityBusy || emailCooldownActive"
              @click="handleRequestEmailCode"
            >
              {{ emailResendLabel }}
            </button>
          </template>

          <p v-if="emailStep === 1 && emailCooldownActive" class="field-help" role="status">{{ cooldownSeconds }} 秒后可向此邮箱重新发送验证码。</p>
          <p v-if="emailMessage" class="form-message" role="status">{{ emailMessage }}</p>
          <p v-if="emailError" class="form-message error-state" role="alert">{{ emailError }}</p>
        </form>

        <div id="settings-devices" class="auth-panel account-card">
          <div class="panel-title-row">
            <div>
              <p class="eyebrow">Devices</p>
              <h3>登录设备</h3>
            </div>
            <button
              class="secondary-link compact-action"
              type="button"
              :disabled="sessionBusy || sessionsLoading || !sessions.some(item => !item.current)"
              @click="openRevokeOthers"
            >
              退出其他所有设备
            </button>
          </div>

          <div v-if="sessionsLoading" class="inline-state">正在读取登录设备...</div>
          <div v-else-if="sessionsError" class="inline-state error-state" role="alert">
            {{ sessionsError }}
            <button type="button" class="secondary-link compact-action" @click="loadSessions">重新加载设备</button>
          </div>
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
                :disabled="sessionBusy || sessionsLoading"
                @click="handleRevokeSession(item)"
              >
                {{ revokingSessionId === item.id ? "退出中..." : "退出" }}
              </button>
            </div>
            <p v-if="!sessions.length" class="inline-state">暂无登录设备记录。</p>
          </div>
          <p v-if="sessionsMessage" class="form-message" role="status">{{ sessionsMessage }}</p>
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
      @cancel="!isRevokingOthers && (revokeOthersDialog.open = false)"
      @confirm="confirmRevokeOthers"
    />
    <AdminConfirmDialog
      :open="renameDialogOpen"
      title="确认修改用户名"
      :message="`用户名将改为「${normalizeUsername(profileForm.username)}」。${user?.isAdmin ? '' : '修改后 30 天内无法再次更改。'}账号 ID、已有内容和公开主页链接保持不变。`"
      :with-reason="false"
      confirm-label="确认并保存"
      :busy="isSaving"
      @cancel="!isSaving && (renameDialogOpen = false)"
      @confirm="saveProfile"
    />
  </section>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from "vue";
import {
  changePassword,
  confirmEmailChange,
  getSessions,
  getCurrentUser,
  logoutUser,
  requestEmailChange,
  revokeOtherSessions,
  revokeSession,
  updateProfile,
  uploadAvatar,
} from "../../services/auth";
import AdminConfirmDialog from "./AdminConfirmDialog.vue";
import { setAuthUser } from "../../services/authState";
import { useCooldown } from "../../utils/useCooldown";
import { setPageSeo } from "../../utils/seo";
import { USERNAME_HELP, USERNAME_RE, avatarValidationError, characterCount, normalizeBio, normalizeUsername, profileIsDirty, usernameIsLocked } from "../../utils/accountProfile";

const CODE_RE = /^\d{6}$/;

const isLoading = ref(true);
const loadError = ref("");
const isSaving = ref(false);
const isUploadingAvatar = ref(false);
const isLoggingOut = ref(false);
const logoutError = ref("");
const avatarFailed = ref(false);
const usernameInput = ref(null);
const bioInput = ref(null);
const profileErrors = reactive({ username: "", bio: "" });
const renameDialogOpen = ref(false);
const now = ref(Date.now());
let clockTimer;
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
const { cooldownSeconds, startCooldown, stopCooldown } = useCooldown();
const cooldownEmail = ref("");
const emailCodeMinutes = ref(0);
const emailCooldownActive = computed(() => cooldownSeconds.value > 0 && cooldownEmail.value === emailForm.newEmail.trim().toLowerCase());
const emailBusy = computed(() => isRequestingEmailCode.value || isConfirmingEmail.value);

const sessions = ref([]);
const sessionsLoading = ref(false);
const sessionsError = ref("");
const sessionsMessage = ref("");
const revokingSessionId = ref(0);
const isRevokingOthers = ref(false);
const revokeOthersDialog = reactive({ open: false, error: "" });
const anyMutationBusy = computed(() => isSaving.value || isUploadingAvatar.value || isLoggingOut.value || isChangingPassword.value || emailBusy.value || isRevokingOthers.value || !!revokingSessionId.value);
const profileBusy = anyMutationBusy;
const securityBusy = anyMutationBusy;
const sessionBusy = anyMutationBusy;
const profileDirty = computed(() => profileIsDirty(profileForm, user.value));
const usernameLocked = computed(() => usernameIsLocked(user.value, now.value));
const usernameChangeHelp = computed(() => {
  if (user.value?.isAdmin) return "管理员可修改用户名。公开主页链接不受影响。";
  return usernameLocked.value
    ? `每 30 天可修改一次，下次可改时间：${formatTime(user.value.canChangeUsernameAt)}（北京时间）。期间仍可修改简介和头像。`
    : "每 30 天可修改一次。修改用户名不影响账号 ID、已有内容和公开主页链接。";
});

const emailSubmitLabel = computed(() => {
  if (emailStep.value === 1) return isRequestingEmailCode.value ? "发送中..." : "发送验证码";
  return isConfirmingEmail.value ? "提交中..." : "确认换绑";
});
const emailResendLabel = computed(() => {
  if (isRequestingEmailCode.value) return "发送中...";
  if (emailCooldownActive.value) return `${cooldownSeconds.value} 秒后可重发`;
  return "重新发送验证码";
});

const userInitial = computed(() => Array.from(user.value?.username || "?")[0].toUpperCase());

setPageSeo({
  title: "账户设置",
  description: "管理 4399123.com 账号头像、用户名、简介和登录状态。",
  path: "/account/settings",
});

function warnBeforeUnload(event) {
  if (!profileDirty.value) return;
  event.preventDefault();
  event.returnValue = "";
}

onMounted(() => {
  loadUser();
  window.addEventListener("beforeunload", warnBeforeUnload);
  clockTimer = window.setInterval(() => { now.value = Date.now(); }, 1000);
});
onUnmounted(() => {
  window.removeEventListener("beforeunload", warnBeforeUnload);
  window.clearInterval(clockTimer);
});

async function loadUser() {
  isLoading.value = true;
  loadError.value = "";
  try {
    const data = await getCurrentUser();
    setUser(data.user || null);
    if (user.value) loadSessions();
  } catch (err) {
    loadError.value = err.message || "账号资料读取失败，请重新加载。";
  } finally {
    isLoading.value = false;
  }
}

async function loadSessions() {
  if (sessionsLoading.value) return;
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
  if (sessionBusy.value || sessionsLoading.value || item.current) return;
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
  if (sessionBusy.value || sessionsLoading.value || !sessions.value.some(item => !item.current)) return;
  revokeOthersDialog.error = "";
  revokeOthersDialog.open = true;
}

async function confirmRevokeOthers() {
  if (sessionBusy.value) return;
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

function setUser(nextUser, preserveDraft = false) {
  const oldUser = user.value;
  const draft = { ...profileForm };
  user.value = nextUser;
  profileForm.username = preserveDraft && oldUser && normalizeUsername(draft.username) !== oldUser.username
    ? draft.username : nextUser?.username || "";
  profileForm.bio = preserveDraft && oldUser && normalizeBio(draft.bio) !== (oldUser.bio || "")
    ? draft.bio : nextUser?.bio || "";
  if (oldUser?.avatarUrl !== nextUser?.avatarUrl) avatarFailed.value = false;
  setAuthUser(nextUser);
}

function clearProfileMessages() {
  error.value = "";
  profileMessage.value = "";
  profileErrors.username = "";
  profileErrors.bio = "";
}

function resetProfile() {
  if (profileBusy.value) return;
  profileForm.username = user.value?.username || "";
  profileForm.bio = user.value?.bio || "";
  clearProfileMessages();
}

function validateProfile() {
  const username = normalizeUsername(profileForm.username);
  if (username !== user.value?.username && !USERNAME_RE.test(username)) {
    profileErrors.username = `用户名需为 ${USERNAME_HELP}`;
    usernameInput.value?.focus();
    return false;
  }
  if (characterCount(normalizeBio(profileForm.bio)) > 280) {
    profileErrors.bio = "个人简介不能超过 280 个字符。";
    bioInput.value?.focus();
    return false;
  }
  return true;
}

function handleProfileSubmit() {
  if (profileBusy.value || !user.value?.emailVerified || !profileDirty.value) return;
  clearProfileMessages();
  if (!validateProfile()) return;
  if (normalizeUsername(profileForm.username) !== user.value.username) {
    if (usernameLocked.value) {
      profileErrors.username = usernameChangeHelp.value;
      return;
    }
    renameDialogOpen.value = true;
  } else {
    saveProfile();
  }
}

async function saveProfile() {
  if (profileBusy.value || !user.value?.emailVerified) return;
  if (!validateProfile()) { renameDialogOpen.value = false; return; }
  const payload = { bio: normalizeBio(profileForm.bio) };
  const username = normalizeUsername(profileForm.username);
  if (username !== user.value.username) payload.username = username;
  renameDialogOpen.value = false;
  isSaving.value = true;
  try {
    const data = await updateProfile(payload);
    setUser(data.user);
    profileMessage.value = "资料已保存。";
  } catch (err) {
    if (["invalid_username", "reserved_username", "username_exists", "username_change_cooldown"].includes(err.code)) {
      profileErrors.username = err.message || "用户名暂不可用，请更换后重试。";
      usernameInput.value?.focus();
    } else if (err.code === "bio_too_long") {
      profileErrors.bio = err.message;
      bioInput.value?.focus();
    } else {
      error.value = err.message || "资料保存失败，请重试。输入内容已保留。";
    }
  } finally {
    isSaving.value = false;
  }
}

async function handleAvatarChange(event) {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (!file) return;
  if (profileBusy.value || !user.value?.emailVerified) return;
  clearProfileMessages();
  const validationError = avatarValidationError(file);
  if (validationError) { error.value = validationError; return; }
  isUploadingAvatar.value = true;
  try {
    const data = await uploadAvatar(file);
    setUser(data.user, true);
    profileMessage.value = "头像已更新。";
  } catch (err) {
    error.value = err.message || "头像上传失败。";
  } finally {
    isUploadingAvatar.value = false;
  }
}

async function handleLogout() {
  if (anyMutationBusy.value) return;
  if (profileDirty.value && !window.confirm("资料修改尚未保存，确定放弃修改并退出登录吗？")) return;
  logoutError.value = "";
  isLoggingOut.value = true;
  try {
    await logoutUser();
    setUser(null);
    passwordForm.current = passwordForm.next = passwordForm.confirm = "";
    emailForm.currentPassword = emailForm.newEmail = emailForm.code = "";
    sessions.value = [];
    stopCooldown();
  } catch (err) {
    logoutError.value = err.message || "退出失败，请重试。";
  } finally {
    isLoggingOut.value = false;
  }
}

function clearPasswordMessages() {
  passwordMessage.value = "";
  passwordError.value = "";
  passwordErrors.current = "";
  passwordErrors.next = "";
}

async function handleChangePassword() {
  if (securityBusy.value) return;
  clearPasswordMessages();
  if (!passwordForm.current) {
    passwordErrors.current = "请输入当前密码。";
    return;
  }
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
    await loadSessions();
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
  if (securityBusy.value) return;
  clearEmailMessages();
  emailForm.code = "";
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
  if (securityBusy.value || emailCooldownActive.value) return;
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
  if (emailForm.newEmail.toLowerCase() === user.value?.email.toLowerCase()) {
    emailErrors.email = "新邮箱与当前绑定邮箱相同。";
    return;
  }
  const targetEmail = emailForm.newEmail.trim().toLowerCase();
  isRequestingEmailCode.value = true;
  try {
    const data = await requestEmailChange({
      currentPassword: emailForm.currentPassword,
      newEmail: targetEmail,
    });
    emailForm.newEmail = targetEmail;
    emailForm.code = "";
    cooldownEmail.value = targetEmail;
    emailCodeMinutes.value = Number(data.expiresMinutes) || 0;
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
      cooldownEmail.value = targetEmail;
      emailForm.newEmail = targetEmail;
      emailStep.value = 2;
      startCooldown(Number(err.retryAfterSeconds || err.details?.retryAfterSeconds || 60));
      emailError.value = "验证码发送过于频繁，请稍后重发；也可以直接输入之前收到的验证码。";
    } else {
      emailError.value = err.message || "验证码发送失败，请稍后再试。";
    }
  } finally {
    isRequestingEmailCode.value = false;
  }
}

async function handleConfirmEmail() {
  if (securityBusy.value) return;
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
    setUser(data.user, true);
    emailMessage.value = data.message || "绑定邮箱已更新并完成验证。";
    emailForm.currentPassword = "";
    emailForm.newEmail = "";
    emailForm.code = "";
    emailStep.value = 1;
    stopCooldown();
    cooldownSeconds.value = 0;
    cooldownEmail.value = "";
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
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "暂无" : date.toLocaleString("zh-CN", { hour12: false, timeZone: "Asia/Shanghai" });
}
</script>

<style scoped>
.account-summary,
.account-main,
.account-card {
  min-width: 0;
}
.account-summary h3,
.account-summary p,
.auth-notice p {
  overflow-wrap: anywhere;
}
.account-card {
  scroll-margin-top: 100px;
}
.settings-navigation {
  display: grid;
  gap: 6px;
  border-top: 1px solid rgba(23, 33, 29, 0.12);
  padding-top: 14px;
}
.settings-navigation a {
  display: block;
  padding: 10px 12px;
  border-radius: 8px;
  color: var(--green);
  font-weight: 750;
  text-decoration: none;
}
.settings-navigation a:hover,
.settings-navigation a:focus-visible {
  background: rgba(31, 95, 70, 0.08);
}
.profile-save-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  padding-top: 16px;
  border-top: 1px solid rgba(23, 33, 29, 0.12);
}
.profile-save-actions .field-help,
.panel-title-row .field-help {
  margin: 0;
}
.account-card input,
.account-card textarea {
  min-width: 0;
  width: 100%;
}
.account-card button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.account-card input:disabled,
.account-card textarea:disabled,
.account-card input[readonly] {
  background: rgba(23, 33, 29, 0.04);
}
.account-card [aria-invalid="true"] {
  border-color: var(--red);
}
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
  overflow-wrap: anywhere;
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
@media (max-width: 640px) {
  .settings-navigation {
    display: flex;
    flex-wrap: wrap;
  }
  .settings-navigation a {
    font-size: 0.85rem;
  }
  .profile-save-actions,
  .profile-save-actions .inline-actions {
    width: 100%;
  }
  .profile-save-actions button {
    flex: 1;
    justify-content: center;
  }
  .device-row {
    flex-wrap: wrap;
  }
  .device-row > div {
    min-width: 0;
  }
  .user-info-grid {
    grid-template-columns: 96px minmax(0, 1fr);
    gap: 10px;
  }
}
</style>
