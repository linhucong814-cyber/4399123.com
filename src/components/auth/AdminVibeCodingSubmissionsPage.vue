<template>
  <section class="auth-page">
    <div class="section-head blog-page-head">
      <div>
        <p class="eyebrow">Admin</p>
        <h2>作品审核</h2>
      </div>
      <a class="secondary-link compact-action" href="/account">返回账号</a>
    </div>

    <div class="admin-filter-row">
      <button
        v-for="option in statusOptions"
        :key="option.value"
        class="secondary-link small-action"
        :class="{ active: selectedStatus === option.value }"
        type="button"
        @click="selectStatus(option.value)"
      >
        {{ option.label }}
      </button>
    </div>

    <div v-if="isLoading" class="blog-state">正在加载作品...</div>
    <div v-else-if="error" class="blog-state error-state">{{ error }}</div>
    <div v-else-if="!submissions.length" class="blog-state">当前状态下暂无作品。</div>

    <div v-else class="review-list">
      <article v-for="item in submissions" :key="item.id" class="review-card">
        <div class="review-cover">
          <img v-if="item.coverUrl" :src="item.coverUrl" :alt="item.projectName" loading="lazy" />
        </div>
        <div class="review-body">
          <div class="topic-meta">
            <div class="topic-badges">
              <span>{{ statusLabel(item.status) }}</span>
              <span>#{{ item.id }}</span>
            </div>
            <time :datetime="item.createdAt">{{ formatTime(item.createdAt) }}</time>
          </div>
          <h2>{{ item.projectName }}</h2>
          <p>{{ item.summary }}</p>
          <div class="review-meta-grid">
            <span>作者</span><strong>{{ item.authorName }}</strong>
            <span>提交用户</span><strong>@{{ item.submitter?.username || "未知" }}</strong>
            <span>项目链接</span><a :href="item.projectUrl" target="_blank" rel="noopener noreferrer">{{ item.projectUrl }}</a>
            <span>源码地址</span><a v-if="item.sourceUrl" :href="item.sourceUrl" target="_blank" rel="noopener noreferrer">{{ item.sourceUrl }}</a><strong v-else>未填写</strong>
            <span>源码文件</span><a v-if="item.sourceFileUrl" :href="item.sourceFileUrl" target="_blank" rel="noopener noreferrer">{{ item.sourceOriginalName }} · {{ formatFileSize(item.sourceFileSize) }}</a><strong v-else>未上传</strong>
            <span>封面</span><strong>{{ item.coverOriginalName }} · {{ formatFileSize(item.coverFileSize) }}</strong>
          </div>
          <div v-if="item.tags?.length" class="tag-row">
            <span v-for="tag in item.tags" :key="`${item.id}-${tag}`">{{ tag }}</span>
          </div>
          <p v-if="item.notes" class="review-note">{{ item.notes }}</p>
          <button class="secondary-link small-action detail-toggle" type="button" @click="toggleDetail(item.id)">
            {{ detailOpen[item.id] ? "收起详情" : "查看详情" }}
          </button>
          <div v-if="detailOpen[item.id]" class="review-detail-panel">
            <div>
              <span>审核状态</span>
              <strong>{{ statusLabel(item.status) }}</strong>
            </div>
            <div>
              <span>提交时间</span>
              <strong>{{ formatTime(item.createdAt) }}</strong>
            </div>
            <div>
              <span>最近更新</span>
              <strong>{{ formatTime(item.updatedAt) }}</strong>
            </div>
            <div>
              <span>审核人</span>
              <strong>{{ item.reviewedBy?.username || "暂无" }}</strong>
            </div>
            <div>
              <span>审核时间</span>
              <strong>{{ formatTime(item.reviewedAt) }}</strong>
            </div>
            <div>
              <span>审核备注</span>
              <strong>{{ item.reviewNote || "暂无" }}</strong>
            </div>
          </div>
          <label class="field-label">
            审核备注
            <textarea v-model.trim="reviewNotes[item.id]" rows="3" maxlength="1000" placeholder="拒绝或标记问题时必须填写。"></textarea>
          </label>
          <div class="composer-actions">
            <p v-if="actionError[item.id]" class="form-message error-state">{{ actionError[item.id] }}</p>
            <span v-else></span>
            <div class="inline-actions">
              <button class="secondary-link small-action" type="button" :disabled="busyId === item.id" @click="review(item, 'needs_changes')">标记问题</button>
              <button class="secondary-link small-action" type="button" :disabled="busyId === item.id" @click="review(item, 'rejected')">拒绝</button>
              <button class="secondary-link small-action danger" type="button" :disabled="busyId === item.id" @click="remove(item)">删除</button>
              <button class="primary-link compact-action" type="button" :disabled="busyId === item.id" @click="review(item, 'approved')">通过</button>
            </div>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import {
  deleteVibeCodingSubmission,
  getAdminVibeCodingSubmissions,
  reviewVibeCodingSubmission,
} from "../../services/vibeCoding";
import { setPageSeo } from "../../utils/seo";

const submissions = ref([]);
const selectedStatus = ref("pending");
const isLoading = ref(true);
const error = ref("");
const busyId = ref(null);
const reviewNotes = reactive({});
const actionError = reactive({});
const detailOpen = reactive({});
const statusOptions = [
  { value: "pending", label: "待审核" },
  { value: "approved", label: "已通过" },
  { value: "needs_changes", label: "标记问题" },
  { value: "rejected", label: "已拒绝" },
  { value: "all", label: "全部" },
];

setPageSeo({
  title: "作品审核",
  description: "审核用户提交的分享vibecoding作品。",
  path: "/admin/vibe-coding-submissions",
});

onMounted(loadSubmissions);

function selectStatus(status) {
  selectedStatus.value = status;
  loadSubmissions();
}

async function loadSubmissions() {
  isLoading.value = true;
  error.value = "";
  try {
    const data = await getAdminVibeCodingSubmissions(selectedStatus.value);
    submissions.value = Array.isArray(data.submissions) ? data.submissions : [];
    for (const item of submissions.value) {
      reviewNotes[item.id] = item.reviewNote || "";
      actionError[item.id] = "";
      detailOpen[item.id] = false;
    }
  } catch (err) {
    error.value = err.message || "加载失败。";
    submissions.value = [];
  } finally {
    isLoading.value = false;
  }
}

function toggleDetail(id) {
  detailOpen[id] = !detailOpen[id];
}

async function review(item, status) {
  actionError[item.id] = "";
  const reviewNote = reviewNotes[item.id] || "";
  if (["rejected", "needs_changes"].includes(status) && !reviewNote) {
    actionError[item.id] = "请先填写审核备注。";
    return;
  }
  busyId.value = item.id;
  try {
    const data = await reviewVibeCodingSubmission(item.id, { status, reviewNote });
    submissions.value = submissions.value.map((entry) => (entry.id === item.id ? data.submission : entry));
    if (selectedStatus.value !== "all" && status !== selectedStatus.value) {
      submissions.value = submissions.value.filter((entry) => entry.id !== item.id);
    }
  } catch (err) {
    actionError[item.id] = err.message || "审核失败。";
  } finally {
    busyId.value = null;
  }
}

async function remove(item) {
  actionError[item.id] = "";
  if (!window.confirm("确定删除这个作品提交吗？")) return;
  busyId.value = item.id;
  try {
    await deleteVibeCodingSubmission(item.id);
    submissions.value = submissions.value.filter((entry) => entry.id !== item.id);
  } catch (err) {
    actionError[item.id] = err.message || "删除失败。";
  } finally {
    busyId.value = null;
  }
}

function statusLabel(status) {
  return {
    pending: "待审核",
    approved: "已通过",
    rejected: "已拒绝",
    needs_changes: "标记问题",
    deleted: "已删除",
  }[status] || status;
}

function formatTime(value) {
  if (!value) return "暂无";
  return new Date(value).toLocaleString("zh-CN", { hour12: false });
}

function formatFileSize(size = 0) {
  if (!size) return "0 B";
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / 1024 / 1024).toFixed(size >= 10 * 1024 * 1024 ? 0 : 1)} MB`;
}
</script>
