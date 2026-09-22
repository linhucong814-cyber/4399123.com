<template>
  <section class="auth-page prompt-library-page">
    <div class="section-head blog-page-head">
      <div>
        <p class="eyebrow">教程 / 提示词</p>
        <h1>{{ itemId ? "编辑提示词" : "上传提示词" }}</h1>
        <p>{{ itemId ? "改完保存后，作品页会显示新内容。" : "写好后会立刻出现在提示词库里。" }}</p>
      </div>
      <div class="share-section-actions">
        <a class="secondary-link compact-action" href="/vibe-coding/prompt-library/">返回作品</a>
        <a v-if="itemId" class="secondary-link compact-action" :href="`/vibe-coding/prompt-library/${itemId}/`">取消编辑</a>
      </div>
    </div>

    <p v-if="pageLoading" class="blog-state">正在准备编辑器...</p>
    <div v-else-if="!user" class="auth-panel">
      <p class="auth-lead">登录后就可以上传提示词，并马上分享给大家。</p>
      <div class="auth-actions">
        <a class="primary-link" :href="loginHref">登录</a>
        <a class="secondary-link" :href="registerHref">注册</a>
      </div>
    </div>
    <div v-else-if="!user.emailVerified" class="auth-panel">
      <p class="auth-lead">请先验证邮箱，然后再上传提示词。</p>
      <a class="primary-link compact-action" href="/account/settings">去验证邮箱</a>
    </div>
    <div v-else-if="loadError" class="auth-panel">
      <p class="form-message error-state">{{ loadError }}</p>
      <a class="secondary-link compact-action" href="/vibe-coding/prompt-library/">返回作品</a>
    </div>
    <form v-else class="auth-panel share-form" @paste="addPastedImages" @submit.prevent="submit">
      <div class="composer-grid">
        <label class="field-label">
          标题
          <input v-model.trim="form.title" maxlength="120" required placeholder="例如：先检查再修改的任务提示词" />
        </label>
        <label class="field-label">
          展示作者名
          <input v-model.trim="form.authorName" maxlength="80" required placeholder="公开展示的名字" />
        </label>
      </div>
      <label class="field-label">
        用途说明
        <textarea v-model.trim="form.summary" rows="3" maxlength="500" required placeholder="这条提示词适合什么时候用。"></textarea>
      </label>
      <label class="field-label">
        提示词正文
        <textarea v-model="form.promptText" rows="8" maxlength="20000" required placeholder="写成可以直接复制给 Agent 的完整提示词。"></textarea>
      </label>
      <div class="composer-grid">
        <label class="field-label">
          分类
          <select v-model="form.category">
            <option v-for="item in categories" :key="item.value" :value="item.value">{{ item.label }}</option>
          </select>
        </label>
        <label class="field-label">
          标签
          <input v-model.trim="form.tags" maxlength="180" placeholder="Agent, 写作, 教程" />
        </label>
      </div>
      <label class="field-label">
        示例输入
        <textarea v-model="form.exampleInput" rows="3" maxlength="6000" placeholder="可选。"></textarea>
      </label>
      <label class="field-label">
        示例输出
        <textarea v-model="form.exampleOutput" rows="3" maxlength="6000" placeholder="可选。"></textarea>
      </label>
      <div class="prompt-upload">
        <label class="field-label">
          示例图片
          <input type="file" accept="image/png,image/jpeg,image/webp,image/avif" multiple @change="addSelectedImages" />
        </label>
        <p class="field-help">最多 6 张，单张不超过 5MB。也可以把图片直接粘贴到这个表单。</p>
        <div v-if="existingImages.length || imageFiles.length" class="prompt-image-grid">
          <figure v-for="image in existingImages" :key="`saved-${image.id}`">
            <img :src="image.url" :alt="image.caption || '已上传的示例图片'" />
            <button class="secondary-link compact-action" type="button" @click="removeExistingImage(image)">移除</button>
          </figure>
          <figure v-for="image in imageFiles" :key="image.key">
            <img :src="image.preview" alt="待上传的示例图片" />
            <button class="secondary-link compact-action" type="button" @click="removeNewImage(image)">移除</button>
          </figure>
        </div>
      </div>
      <div class="composer-actions">
        <p v-if="formError" class="form-message error-state">{{ formError }}</p>
        <div class="prompt-library-actions">
          <button class="primary-link compact-action" type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? "保存中..." : itemId ? "保存修改" : "分享" }}
          </button>
          <a class="secondary-link compact-action" :href="itemId ? `/vibe-coding/prompt-library/${itemId}/` : '/vibe-coding/prompt-library/'">取消</a>
        </div>
      </div>
    </form>

    <section v-if="!pageLoading && user && pendingItems.length" id="review" class="auth-panel" aria-labelledby="prompt-review-title">
      <div class="composer-head">
        <div>
          <p class="eyebrow">Review</p>
          <h2 id="prompt-review-title">待审核</h2>
        </div>
      </div>
      <p v-if="adminError" class="form-message error-state">{{ adminError }}</p>
      <div class="prompt-review-list">
        <article v-for="item in pendingItems" :key="item.id" class="prompt-review-card">
          <h3>{{ item.title }}</h3>
          <p>{{ item.summary }}</p>
          <pre class="prompt-text">{{ item.promptText }}</pre>
          <label class="field-label">
            审核备注
            <textarea v-model.trim="reviewNotes[item.id]" rows="2" maxlength="1000" placeholder="拒绝或要求修改时必填"></textarea>
          </label>
          <div class="prompt-library-actions">
            <button class="primary-link compact-action" type="button" :disabled="reviewingId === item.id" @click="reviewItem(item, 'published')">发布</button>
            <button class="secondary-link compact-action" type="button" :disabled="reviewingId === item.id" @click="reviewItem(item, 'needs_changes')">需要修改</button>
            <button class="secondary-link compact-action" type="button" :disabled="reviewingId === item.id" @click="reviewItem(item, 'rejected')">拒绝</button>
          </div>
        </article>
      </div>
    </section>

    <section v-if="!pageLoading && user && !itemId" id="mine" class="auth-panel" aria-labelledby="my-prompts-title">
      <div class="composer-head">
        <div>
          <p class="eyebrow">Mine</p>
          <h2 id="my-prompts-title">我的提示词</h2>
        </div>
      </div>
      <p v-if="mineError" class="form-message error-state">{{ mineError }}</p>
      <p v-else-if="!myItems.length" class="blog-state">你还没有上传过提示词。</p>
      <div v-else class="prompt-review-list">
        <article v-for="item in myItems" :key="item.id" class="prompt-review-card">
          <h3>{{ item.title }}</h3>
          <p>{{ item.summary }}</p>
          <p class="prompt-meta">
            <span class="status-pill" :class="statusClass(item.status)">{{ item.statusLabel }}</span>
            <a v-if="item.status === 'published'" :href="`/vibe-coding/prompt-library/${item.id}/`">查看</a>
            <a :href="`/vibe-coding/prompt-library/${item.id}/edit/`">编辑</a>
          </p>
          <p v-if="item.reviewNote">审核备注：{{ item.reviewNote }}</p>
        </article>
      </div>
    </section>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { refreshAuth } from "../services/authState";
import {
  createPromptLibraryItem,
  deletePromptLibraryImage,
  getAdminPromptLibraryItems,
  getMyPromptLibraryItems,
  getPromptLibraryItem,
  getPromptLibraryItems,
  reviewPromptLibraryItem,
  updatePromptLibraryItem,
  uploadPromptLibraryImage,
} from "../services/vibeCoding";
import { setPageSeo } from "../utils/seo";

const props = defineProps({
  itemId: { type: String, default: "" },
});

const fallbackCategories = [
  { value: "general", label: "通用" },
  { value: "coding", label: "编程与 Agent" },
  { value: "writing", label: "写作与内容" },
  { value: "image", label: "图像与设计" },
  { value: "research", label: "研究与分析" },
  { value: "productivity", label: "效率与工作流" },
  { value: "other", label: "其他" },
];

const user = ref(null);
const pageLoading = ref(true);
const loadError = ref("");
const categories = ref(fallbackCategories);
const isSubmitting = ref(false);
const formError = ref("");
const imageFiles = ref([]);
const existingImages = ref([]);
const myItems = ref([]);
const mineError = ref("");
const pendingItems = ref([]);
const adminError = ref("");
const reviewingId = ref(0);
const reviewNotes = reactive({});
const maxImages = 6;
const form = reactive({
  title: "",
  summary: "",
  promptText: "",
  category: "general",
  tags: "",
  exampleInput: "",
  exampleOutput: "",
  authorName: "",
});

const nextPath = computed(() => (props.itemId ? `/vibe-coding/prompt-library/${props.itemId}/edit/` : "/vibe-coding/prompt-library/new/"));
const loginHref = computed(() => `/login?next=${encodeURIComponent(nextPath.value)}`);
const registerHref = computed(() => `/register?next=${encodeURIComponent(nextPath.value)}`);

setPageSeo({
  title: props.itemId ? "编辑提示词" : "上传提示词",
  description: "上传或修改一条提示词，并附上示例文字和图片。",
  path: props.itemId ? `/vibe-coding/prompt-library/${props.itemId}/edit` : "/vibe-coding/prompt-library/new",
});

onMounted(async () => {
  user.value = await refreshAuth();
  if (user.value && !props.itemId) form.authorName = user.value.username;
  try {
    const data = await getPromptLibraryItems();
    if (Array.isArray(data.categories) && data.categories.length) categories.value = data.categories;
  } catch {
    categories.value = fallbackCategories;
  }
  if (props.itemId) await loadExisting();
  if (user.value && !props.itemId) await loadMine();
  if (user.value?.isAdmin && !props.itemId) await loadPending();
  pageLoading.value = false;
});

function statusClass(status) {
  if (status === "published") return "status-approved";
  if (status === "rejected" || status === "deleted") return "status-rejected";
  return "status-pending";
}

function fillForm(item) {
  form.title = item.title || "";
  form.summary = item.summary || "";
  form.promptText = item.promptText || "";
  form.category = item.category || "general";
  form.tags = (item.tags || []).join(", ");
  form.exampleInput = item.exampleInput || "";
  form.exampleOutput = item.exampleOutput || "";
  form.authorName = item.authorName || user.value?.username || "";
  existingImages.value = [...(item.images || [])];
}

async function loadExisting() {
  try {
    const data = await getPromptLibraryItem(props.itemId);
    if (!data.item?.canEdit) {
      loadError.value = "你不能修改这条提示词。";
      return;
    }
    fillForm(data.item);
    return;
  } catch {
    // Unpublished prompts are not on the public detail endpoint.
  }
  try {
    const data = await getMyPromptLibraryItems();
    const item = (data.items || []).find((entry) => String(entry.id) === props.itemId);
    if (!item) {
      loadError.value = "这条提示词不存在，或你不能修改它。";
      return;
    }
    fillForm(item);
  } catch (error) {
    loadError.value = error.message || "这条提示词不存在，或还没有公开。";
  }
}

async function loadMine() {
  mineError.value = "";
  try {
    const data = await getMyPromptLibraryItems();
    myItems.value = Array.isArray(data.items) ? data.items : [];
  } catch (error) {
    myItems.value = [];
    mineError.value = error.message || "读取我的提示词失败。";
  }
}

async function loadPending() {
  adminError.value = "";
  try {
    const data = await getAdminPromptLibraryItems("pending");
    pendingItems.value = Array.isArray(data.items) ? data.items : [];
    for (const item of pendingItems.value) {
      if (reviewNotes[item.id] == null) reviewNotes[item.id] = "";
    }
  } catch (error) {
    pendingItems.value = [];
    adminError.value = error.message || "读取待审核提示词失败。";
  }
}

function validateForm() {
  if (form.title.length < 2 || form.title.length > 120) return "标题需要 2-120 个字符。";
  if (form.summary.length < 10 || form.summary.length > 500) return "用途说明需要 10-500 个字符。";
  if (form.promptText.trim().length < 20 || form.promptText.trim().length > 20000) return "提示词正文需要 20-20000 个字符。";
  if (!categories.value.some((item) => item.value === form.category)) return "请选择有效的提示词分类。";
  if (!form.authorName || form.authorName.length > 80) return "展示作者名需要 1-80 个字符。";
  if (form.exampleInput.length > 6000 || form.exampleOutput.length > 6000) return "示例内容不能超过 6000 个字符。";
  return "";
}

function addImageFile(file) {
  formError.value = "";
  if (!file) return;
  if (!["image/png", "image/jpeg", "image/webp", "image/avif"].includes(file.type)) {
    formError.value = "示例图片只支持 JPG、PNG、WebP 或 AVIF。";
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    formError.value = "单张示例图片不能超过 5MB。";
    return;
  }
  if (existingImages.value.length + imageFiles.value.length >= maxImages) {
    formError.value = "每条提示词最多 6 张示例图片。";
    return;
  }
  const named = file.name ? file : new File([file], `paste-${Date.now()}.png`, { type: file.type });
  imageFiles.value.push({ key: `${named.name}-${named.size}-${Date.now()}`, file: named, preview: URL.createObjectURL(named) });
}

function addSelectedImages(event) {
  for (const file of event.target.files || []) addImageFile(file);
  event.target.value = "";
}

function addPastedImages(event) {
  const clipboardItems = event.clipboardData?.items || [];
  let pasted = false;
  for (const item of clipboardItems) {
    if (item.type.startsWith("image/")) {
      addImageFile(item.getAsFile());
      pasted = true;
    }
  }
  if (pasted) event.preventDefault();
}

function removeNewImage(image) {
  URL.revokeObjectURL(image.preview);
  imageFiles.value = imageFiles.value.filter((entry) => entry.key !== image.key);
}

async function removeExistingImage(image) {
  formError.value = "";
  try {
    await deletePromptLibraryImage(image.id);
    existingImages.value = existingImages.value.filter((entry) => entry.id !== image.id);
  } catch (error) {
    formError.value = error.message || "删除图片失败。";
  }
}

async function submit() {
  formError.value = "";
  const validationError = validateForm();
  if (validationError) {
    formError.value = validationError;
    return;
  }
  isSubmitting.value = true;
  try {
    const payload = {
      title: form.title,
      summary: form.summary,
      promptText: form.promptText.trim(),
      category: form.category,
      tags: form.tags,
      exampleInput: form.exampleInput.trim(),
      exampleOutput: form.exampleOutput.trim(),
      authorName: form.authorName,
    };
    const data = props.itemId
      ? await updatePromptLibraryItem(props.itemId, payload)
      : await createPromptLibraryItem(payload);
    const savedId = data.item.id;
    for (const image of imageFiles.value) {
      await uploadPromptLibraryImage(savedId, image.file);
    }
    window.location.assign(`/vibe-coding/prompt-library/${savedId}/`);
  } catch (error) {
    formError.value = error.message || "保存失败，请稍后重试。";
    isSubmitting.value = false;
  }
}

async function reviewItem(item, status) {
  adminError.value = "";
  const reviewNote = (reviewNotes[item.id] || "").trim();
  if ((status === "rejected" || status === "needs_changes") && !reviewNote) {
    adminError.value = "拒绝或需要修改时请填写审核备注。";
    return;
  }
  reviewingId.value = item.id;
  try {
    await reviewPromptLibraryItem(item.id, { status, reviewNote });
    delete reviewNotes[item.id];
    await loadPending();
  } catch (error) {
    adminError.value = error.message || "审核失败，请稍后重试。";
  } finally {
    reviewingId.value = 0;
  }
}
</script>
