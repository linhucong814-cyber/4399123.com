<template>
  <section class="auth-page share-submit-page">
    <div class="section-head blog-page-head">
      <div>
        <p class="eyebrow">Share</p>
        <h2>提交 Vibe Coding 作品</h2>
      </div>
      <div class="share-section-actions">
        <a class="secondary-link compact-action" href="/vibe-coding/showcase">查看作品集</a>
        <a class="secondary-link compact-action" href="/vibe-coding">返回列表</a>
      </div>
    </div>

    <div v-if="isLoadingUser" class="blog-state">正在读取登录状态...</div>
    <div v-else-if="!user" class="auth-panel">
      <p class="auth-lead">提交作品需要登录，审核通过后才会公开展示。</p>
      <div class="auth-actions">
        <a class="primary-link" href="/login">登录</a>
        <a class="secondary-link" href="/register">注册</a>
      </div>
    </div>

    <form v-else class="auth-panel share-form" @submit.prevent="submit">
      <div class="composer-head">
        <div>
          <p class="eyebrow">Submission</p>
          <h2>提交作品</h2>
        </div>
        <span>以 {{ user.username }} 身份提交</span>
      </div>

      <div class="composer-grid">
        <label class="field-label">
          项目名称
          <input v-model.trim="form.projectName" maxlength="120" placeholder="例如：AI 任务看板" />
        </label>
        <label class="field-label">
          作者名称
          <input v-model.trim="form.authorName" maxlength="80" placeholder="公开展示的作者名" />
        </label>
      </div>

      <label class="field-label">
        项目简介
        <textarea v-model.trim="form.summary" rows="5" maxlength="800" placeholder="说明项目用途、亮点和完成度。"></textarea>
      </label>

      <div class="composer-grid">
        <label class="field-label">
          项目链接/演示地址
          <input v-model.trim="form.projectUrl" maxlength="500" placeholder="https://example.com/demo" />
        </label>
        <label class="field-label">
          源码地址
          <input v-model.trim="form.sourceUrl" maxlength="500" placeholder="https://github.com/..." />
        </label>
      </div>

      <label class="field-label">
        标签
        <input v-model.trim="form.tags" maxlength="180" placeholder="AI, Vue, 小游戏" />
      </label>

      <label class="field-label">
        补充说明
        <textarea v-model.trim="form.notes" rows="4" maxlength="2000" placeholder="可补充审核备注、使用方式或想获得的反馈。"></textarea>
      </label>

      <div class="attachment-uploader">
        <label class="attachment-trigger">
          <span>{{ coverFile ? coverFile.name : "上传封面图" }}</span>
          <small>JPG、PNG、WebP 或 AVIF，最大 5MB</small>
          <input type="file" accept="image/png,image/jpeg,image/webp,image/avif" @change="handleCoverChange" />
        </label>
        <div v-if="coverPreview" class="share-cover-preview">
          <img :src="coverPreview" alt="作品封面预览" />
        </div>
      </div>

      <div class="attachment-uploader">
        <label class="attachment-trigger">
          <span>{{ sourceFile ? sourceFile.name : "上传源码 ZIP" }}</span>
          <small>可选，仅支持 .zip，最大 20MB，后端只保存不解压</small>
          <input type="file" accept=".zip,application/zip" @change="handleSourceChange" />
        </label>
        <div v-if="sourceFile" class="attachment-list draft">
          <div class="attachment-chip">
            <span>ZIP</span>
            <strong>{{ sourceFile.name }}</strong>
            <small>{{ formatFileSize(sourceFile.size) }}</small>
            <button type="button" @click="clearSourceFile">移除</button>
          </div>
        </div>
      </div>

      <div class="composer-actions">
        <p v-if="error" class="form-message error-state">{{ error }}</p>
        <p v-else-if="success" class="form-message">{{ success }}</p>
        <button class="primary-link compact-action" type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? "提交中..." : "提交审核" }}
        </button>
      </div>
    </form>
  </section>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { getCurrentUser } from "../services/auth";
import { createVibeCodingSubmission } from "../services/vibeCoding";
import { setPageSeo } from "../utils/seo";

const user = ref(null);
const isLoadingUser = ref(true);
const isSubmitting = ref(false);
const error = ref("");
const success = ref("");
const coverFile = ref(null);
const sourceFile = ref(null);
const coverPreview = ref("");
const maxCoverSize = 5 * 1024 * 1024;
const maxSourceSize = 20 * 1024 * 1024;
const form = reactive({
  projectName: "",
  summary: "",
  authorName: "",
  projectUrl: "",
  sourceUrl: "",
  tags: "",
  notes: "",
});

setPageSeo({
  title: "提交 Vibe Coding 作品",
  description: "上传你的 Vibe Coding 项目，审核通过后展示在分享 Vibe Coding 作品集。",
  path: "/vibe-coding/share",
});

onMounted(loadUser);

async function loadUser() {
  try {
    const data = await getCurrentUser();
    user.value = data.user || null;
    if (user.value) {
      form.authorName = user.value.username;
    }
  } catch {
    user.value = null;
  } finally {
    isLoadingUser.value = false;
  }
}

function handleCoverChange(event) {
  error.value = "";
  const file = event.target.files?.[0] || null;
  event.target.value = "";
  if (!file) return;
  if (!["image/png", "image/jpeg", "image/webp", "image/avif"].includes(file.type)) {
    error.value = "封面只支持 JPG、PNG、WebP 或 AVIF 图片。";
    return;
  }
  if (file.size > maxCoverSize) {
    error.value = "封面图不能超过 5MB。";
    return;
  }
  if (coverPreview.value) URL.revokeObjectURL(coverPreview.value);
  coverFile.value = file;
  coverPreview.value = URL.createObjectURL(file);
}

function handleSourceChange(event) {
  error.value = "";
  const file = event.target.files?.[0] || null;
  event.target.value = "";
  if (!file) return;
  const name = file.name.toLowerCase();
  if (!name.endsWith(".zip")) {
    error.value = "源码文件只支持 ZIP 压缩包。";
    return;
  }
  if (file.size > maxSourceSize) {
    error.value = "源码文件不能超过 20MB。";
    return;
  }
  sourceFile.value = file;
}

function clearSourceFile() {
  sourceFile.value = null;
}

async function submit() {
  error.value = "";
  success.value = "";
  if (form.projectName.length < 2) {
    error.value = "项目名称至少需要 2 个字符。";
    return;
  }
  if (form.summary.length < 10) {
    error.value = "项目简介至少需要 10 个字符。";
    return;
  }
  if (!form.authorName) {
    error.value = "请填写作者名称。";
    return;
  }
  if (!form.projectUrl.startsWith("http://") && !form.projectUrl.startsWith("https://")) {
    error.value = "项目链接需要以 http:// 或 https:// 开头。";
    return;
  }
  if (form.sourceUrl && !form.sourceUrl.startsWith("http://") && !form.sourceUrl.startsWith("https://")) {
    error.value = "源码地址需要以 http:// 或 https:// 开头。";
    return;
  }
  if (!coverFile.value) {
    error.value = "请上传项目封面图。";
    return;
  }

  const payload = new FormData();
  for (const [key, value] of Object.entries(form)) {
    payload.set(key, value);
  }
  payload.set("cover", coverFile.value);
  if (sourceFile.value) {
    payload.set("sourceFile", sourceFile.value);
  }

  isSubmitting.value = true;
  try {
    await createVibeCodingSubmission(payload);
    success.value = "已提交审核，工作人员正在核实。";
    form.projectName = "";
    form.summary = "";
    form.projectUrl = "";
    form.sourceUrl = "";
    form.tags = "";
    form.notes = "";
    coverFile.value = null;
    sourceFile.value = null;
    if (coverPreview.value) URL.revokeObjectURL(coverPreview.value);
    coverPreview.value = "";
  } catch (err) {
    error.value = err.message || "提交失败。";
  } finally {
    isSubmitting.value = false;
  }
}

function formatFileSize(size = 0) {
  if (!size) return "0 B";
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / 1024 / 1024).toFixed(size >= 10 * 1024 * 1024 ? 0 : 1)} MB`;
}
</script>
