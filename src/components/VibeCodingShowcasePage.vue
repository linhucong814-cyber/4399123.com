<template>
  <section class="vibe-page showcase-page">
    <div class="section-head showcase-hero">
      <div>
        <p class="eyebrow">Community Showcase</p>
        <h1>分享 Vibe Coding</h1>
      </div>
      <div class="showcase-intro">
        <p>
          这里专门收集用户上传并通过审核的 Vibe Coding 作品。你可以发现新的网页、游戏、AI 工具和实验原型，也可以提交自己的项目让更多人看见。
        </p>
        <div class="showcase-actions">
          <a class="primary-link compact-action" href="/vibe-coding/share">提交作品</a>
          <a class="secondary-link compact-action" href="/vibe-coding">返回 Vibe Coding</a>
        </div>
      </div>
    </div>

    <div class="showcase-stats" aria-label="作品集数据">
      <span>
        <strong>{{ submissions.length }}</strong>
        已展示作品
      </span>
      <span>
        <strong>审核后公开</strong>
        保持作品集质量
      </span>
      <span>
        <strong>截图 / 链接 / 源码</strong>
        完整呈现项目
      </span>
    </div>

    <div v-if="submissionsLoading" class="blog-state">正在读取用户作品...</div>
    <div v-else-if="submissionsError" class="blog-state error-state">{{ submissionsError }}</div>
    <div v-else-if="!submissions.length" class="blog-state showcase-empty">
      <h2>还没有公开作品</h2>
      <p>第一个通过审核的用户作品会展示在这里。登录后提交你的 Vibe Coding 项目，审核通过后会出现在作品集。</p>
      <a class="primary-link compact-action" href="/vibe-coding/share">提交第一个作品</a>
    </div>
    <div v-else class="share-card-grid showcase-grid">
      <article v-for="(item, index) in submissions" :key="item.id" v-reveal="index" class="share-card">
        <a class="share-card-cover" :href="item.projectUrl" target="_blank" rel="noopener noreferrer">
          <img v-if="item.coverUrl" :src="item.coverUrl" :alt="item.projectName" loading="lazy" decoding="async" />
        </a>
        <div class="share-card-body">
          <span>by {{ item.authorName }}</span>
          <h3>{{ item.projectName }}</h3>
          <p>{{ item.summary }}</p>
          <div v-if="item.tags?.length" class="tag-row">
            <span v-for="tag in item.tags" :key="`${item.id}-${tag}`">{{ tag }}</span>
          </div>
          <div class="share-card-actions">
            <a :href="item.projectUrl" target="_blank" rel="noopener noreferrer">打开项目</a>
            <a v-if="item.sourceUrl" :href="item.sourceUrl" target="_blank" rel="noopener noreferrer">源码</a>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { watchEffect } from "vue";
import { setPageSeo } from "../utils/seo";

const props = defineProps({
  submissions: {
    type: Array,
    default: () => [],
  },
  submissionsLoading: {
    type: Boolean,
    default: false,
  },
  submissionsError: {
    type: String,
    default: "",
  },
});

watchEffect(() => {
  setPageSeo({
    title: "分享 Vibe Coding",
    description: `集中展示用户提交并通过审核的 Vibe Coding 作品，目前收录 ${props.submissions.length} 个公开项目。`,
    path: "/vibe-coding/showcase",
  });
});
</script>
