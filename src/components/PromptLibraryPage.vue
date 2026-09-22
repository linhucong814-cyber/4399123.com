<template>
  <section class="auth-page prompt-library-page">
    <div class="section-head blog-page-head">
      <div>
        <p class="eyebrow">教程 / 提示词</p>
        <h1>提示词模板库</h1>
        <p>挑一条能用的提示词，打开后可以复制、点赞和留言。</p>
      </div>
      <div class="share-section-actions">
        <a class="primary-link compact-action" href="/vibe-coding/prompt-library/new/">上传提示词</a>
        <a v-if="user" class="secondary-link compact-action" href="/vibe-coding/prompt-library/new/#mine">我的提示词</a>
        <a v-if="pendingCount" class="secondary-link compact-action" href="/vibe-coding/prompt-library/new/#review">待审核 {{ pendingCount }}</a>
      </div>
    </div>

    <form class="prompt-library-toolbar" @submit.prevent="loadItems">
      <label class="field-label prompt-library-search">
        搜索
        <input v-model.trim="query" type="search" maxlength="100" placeholder="标题、用途或提示词正文" @input="scheduleLoad" />
      </label>
      <button class="secondary-link compact-action" type="submit">搜索</button>
    </form>
    <div class="prompt-library-filters" aria-label="按分类筛选">
      <button class="secondary-link compact-action" :class="{ active: !category }" type="button" :aria-pressed="!category" @click="setCategory('')">全部</button>
      <button
        v-for="item in categories"
        :key="item.value"
        class="secondary-link compact-action"
        :class="{ active: category === item.value }"
        type="button"
        :aria-pressed="category === item.value"
        @click="setCategory(item.value)"
      >
        {{ item.label }}
      </button>
    </div>

    <p v-if="listError" class="form-message error-state">{{ listError }}</p>
    <p v-else-if="listLoading" class="blog-state">正在读取提示词库...</p>
    <div v-else-if="!items.length" class="auth-panel">
      <p v-if="query || category">没有找到匹配的提示词。可以换个关键词，或清除筛选后再看。</p>
      <p v-else>这里还没有公开的提示词。</p>
      <a class="primary-link compact-action" href="/vibe-coding/prompt-library/new/">上传第一条</a>
    </div>
    <div v-else class="prompt-library-grid">
      <a v-for="item in items" :key="item.id" class="prompt-card" :href="`/vibe-coding/prompt-library/${item.id}/`">
        <img v-if="item.images.length" class="prompt-card-image" :src="item.images[0].url" :alt="item.images[0].caption || item.title" />
        <p class="eyebrow">{{ item.categoryLabel }}</p>
        <h2>{{ item.title }}</h2>
        <p>{{ item.summary }}</p>
        <p class="prompt-meta">
          <span>{{ item.authorName }}</span>
          <span>复制 {{ item.copyCount }}</span>
          <span>点赞 {{ item.likeCount }}</span>
          <span>留言 {{ item.commentCount }}</span>
        </p>
      </a>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { refreshAuth } from "../services/authState";
import { getAdminPromptLibraryItems, getPromptLibraryItems } from "../services/vibeCoding";
import { setPageSeo } from "../utils/seo";

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
const items = ref([]);
const categories = ref(fallbackCategories);
const query = ref("");
const category = ref("");
const listLoading = ref(true);
const listError = ref("");
const pendingCount = ref(0);

setPageSeo({
  title: "提示词模板库",
  description: "浏览、复制和分享有趣的提示词。可以查看示例、点赞和留言。",
  path: "/vibe-coding/prompt-library",
});

onMounted(async () => {
  user.value = await refreshAuth();
  await loadItems();
  if (user.value?.isAdmin) {
    try {
      const data = await getAdminPromptLibraryItems("pending");
      pendingCount.value = Array.isArray(data.items) ? data.items.length : 0;
    } catch {
      pendingCount.value = 0;
    }
  }
});

function scheduleLoad() {
  window.clearTimeout(scheduleLoad.timer);
  scheduleLoad.timer = window.setTimeout(loadItems, 250);
}

function setCategory(value) {
  category.value = value;
  loadItems();
}

async function loadItems() {
  listLoading.value = true;
  listError.value = "";
  try {
    const data = await getPromptLibraryItems({ q: query.value, category: category.value });
    items.value = Array.isArray(data.items) ? data.items : [];
    if (Array.isArray(data.categories) && data.categories.length) categories.value = data.categories;
  } catch (error) {
    items.value = [];
    listError.value = error.message || "读取提示词库失败。";
  } finally {
    listLoading.value = false;
  }
}
</script>
