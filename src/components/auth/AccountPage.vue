<template>
  <section class="auth-page account-page">
    <div class="section-head blog-page-head account-head">
      <div>
        <p class="eyebrow">Account</p>
        <h2>用户后台</h2>
      </div>
      <div class="inline-actions">
        <a v-if="user?.isAdmin" class="secondary-link compact-action" href="/admin">管理后台</a>
        <a class="secondary-link compact-action" href="/help">帮助中心</a>
        <a class="primary-link compact-action" href="/vibe-coding/share">提交作品</a>
      </div>
    </div>

    <div v-if="isLoading" class="blog-state">正在读取用户后台...</div>
    <div v-else-if="dashboardError" class="blog-state error-state">{{ dashboardError }}</div>

    <div v-else-if="!user" class="auth-panel account-card">
      <p class="auth-lead">登录后可以查看账号状态、作品审核进度、社区消息和后台入口。</p>
      <div class="auth-actions">
        <a class="primary-link" href="/login?next=/account">登录</a>
        <a class="secondary-link" href="/register?next=/account">注册</a>
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
          <span v-if="user.isAdmin" class="verified">管理员</span>
        </div>
        <div class="account-side-actions">
          <a class="secondary-link compact-action" :href="publicProfileHref(user)">公开主页</a>
          <a class="secondary-link compact-action" href="/account/settings">账户设置</a>
          <a class="secondary-link compact-action" href="/community?inbox=1">消息</a>
        </div>
      </aside>

      <div class="account-main">
        <div class="account-stat-grid">
          <article class="account-stat-card">
            <span>作品提交</span>
            <strong>{{ submissions.length }}</strong>
            <p>{{ pendingCount }} 个待处理，{{ approvedCount }} 个已通过</p>
          </article>
          <article class="account-stat-card">
            <span>消息通知</span>
            <strong>{{ unreadCount }}</strong>
            <p>{{ unreadCount ? "有未读消息等待处理" : "当前没有未读消息" }}</p>
          </article>
          <article class="account-stat-card">
            <span>账号状态</span>
            <strong>可发布</strong>
            <p>社区互动和作品提交权限正常</p>
          </article>
        </div>

        <section class="auth-panel account-card">
          <div class="panel-title-row">
            <div>
              <p class="eyebrow">Submissions</p>
              <h3>作品审核进度</h3>
            </div>
            <a class="secondary-link compact-action" href="/vibe-coding/share">提交新作品</a>
          </div>

          <div v-if="submissionsLoading" class="inline-state">正在读取作品...</div>
          <div v-else-if="submissionsError" class="inline-state error-state">{{ submissionsError }}</div>
          <div v-else-if="!submissions.length" class="empty-panel">
            <h4>还没有提交作品</h4>
            <p>提交 Vibe Coding 作品后，待审核、通过、拒绝或需要修改的进度会显示在这里。</p>
            <a class="primary-link compact-action" href="/vibe-coding/share">提交第一个作品</a>
          </div>
          <div v-else class="submission-timeline">
            <article v-for="item in submissions" :key="item.id" class="submission-row">
              <div>
                <span class="status-pill" :class="`status-${item.status}`">{{ statusLabel(item.status) }}</span>
                <h4>{{ item.projectName }}</h4>
                <p>{{ item.summary }}</p>
                <p v-if="item.reviewNote" class="review-note">审核备注：{{ item.reviewNote }}</p>
              </div>
              <div class="submission-meta">
                <time :datetime="item.createdAt">{{ formatDate(item.createdAt) }}</time>
                <a :href="item.projectUrl" target="_blank" rel="noopener noreferrer">打开项目</a>
              </div>
            </article>
          </div>
        </section>

        <section class="auth-panel account-card">
          <div class="panel-title-row">
            <div>
              <p class="eyebrow">Inbox</p>
              <h3>消息通知</h3>
            </div>
            <a class="secondary-link compact-action" href="/community?inbox=1">查看全部</a>
          </div>

          <div v-if="notificationsLoading" class="inline-state">正在读取消息...</div>
          <div v-else-if="notificationsError" class="inline-state error-state">{{ notificationsError }}</div>
          <div v-else-if="!notifications.length" class="empty-panel compact">
            <h4>暂无消息</h4>
            <p>帖子回复、点赞和社区互动提醒会出现在这里。</p>
          </div>
          <div v-else class="notification-list">
            <a v-for="item in notifications.slice(0, 5)" :key="item.id" class="notification-row" :href="item.post?.url || '/community'">
              <span :class="{ unread: !item.isRead }"></span>
              <div>
                <strong>{{ item.title }}</strong>
                <p>{{ item.body || item.post?.title || "社区通知" }}</p>
              </div>
              <time :datetime="item.createdAt">{{ formatDate(item.createdAt) }}</time>
            </a>
          </div>
        </section>

        <section v-if="user.isAdmin" class="auth-panel account-card">
          <div class="panel-title-row">
            <div>
              <p class="eyebrow">Admin</p>
              <h3>管理员入口</h3>
            </div>
            <a class="primary-link compact-action" href="/admin">进入后台</a>
          </div>
          <div class="quick-link-grid">
            <a href="/admin/vibe-coding-submissions">
              <strong>作品审核</strong>
              <span>查看待审核内容，通过、拒绝或标记问题。</span>
            </a>
            <a href="/admin/users">
              <strong>用户管理</strong>
              <span>查看注册用户、账号状态和来源项目。</span>
            </a>
            <a href="/admin/game-records">
              <strong>游戏记录</strong>
              <span>查看星球信使得分、时长、设备和完成状态。</span>
            </a>
          </div>
        </section>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { getCurrentUser } from "../../services/auth";
import { getCommunityNotifications } from "../../services/community";
import { getMyVibeCodingSubmissions } from "../../services/vibeCoding";
import { setPageSeo } from "../../utils/seo";

const isLoading = ref(true);
const user = ref(null);
const dashboardError = ref("");
const submissions = ref([]);
const submissionsLoading = ref(false);
const submissionsError = ref("");
const notifications = ref([]);
const notificationsLoading = ref(false);
const notificationsError = ref("");

const userInitial = computed(() => (user.value?.username || "?").slice(0, 1).toUpperCase());
const pendingCount = computed(() => submissions.value.filter((item) => item.status === "pending" || item.status === "needs_changes").length);
const approvedCount = computed(() => submissions.value.filter((item) => item.status === "approved").length);
const unreadCount = computed(() => notifications.value.filter((item) => !item.isRead).length);

setPageSeo({
  title: "用户后台",
  description: "查看 4399123.com 账号状态、作品审核进度、社区消息和管理入口。",
  path: "/account",
});

onMounted(loadDashboard);

async function loadDashboard() {
  isLoading.value = true;
  try {
    const data = await getCurrentUser();
    user.value = data.user || null;
    if (user.value) {
      await Promise.all([loadSubmissions(), loadNotifications()]);
    }
  } catch {
    user.value = null;
    dashboardError.value = "";
  } finally {
    isLoading.value = false;
  }
}

async function loadSubmissions() {
  submissionsLoading.value = true;
  submissionsError.value = "";
  try {
    const data = await getMyVibeCodingSubmissions();
    submissions.value = Array.isArray(data.submissions) ? data.submissions : [];
  } catch (err) {
    submissionsError.value = err.message || "作品审核进度读取失败。";
  } finally {
    submissionsLoading.value = false;
  }
}

async function loadNotifications() {
  notificationsLoading.value = true;
  notificationsError.value = "";
  try {
    const data = await getCommunityNotifications();
    notifications.value = Array.isArray(data.notifications) ? data.notifications : [];
  } catch (err) {
    notificationsError.value = err.message || "消息读取失败。";
  } finally {
    notificationsLoading.value = false;
  }
}

function statusLabel(value) {
  return {
    active: "正常",
    disabled: "已禁用",
    pending: "待审核",
    approved: "已通过",
    rejected: "已拒绝",
    needs_changes: "标记问题",
    deleted: "已删除",
  }[value] || value || "暂无";
}

function publicProfileHref(nextUser) {
  return nextUser?.id ? `/users/${encodeURIComponent(nextUser.id)}` : "/community";
}

function formatDate(value) {
  if (!value) return "暂无";
  return new Date(value).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false });
}
</script>
