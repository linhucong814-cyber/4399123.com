<template>
  <section class="vibe-page">
    <div class="section-head vibe-page-head">
      <div>
        <p class="eyebrow">Project Branch</p>
        <h1>Vibe Coding</h1>
      </div>
      <p class="vibe-page-summary">
        这里收纳 Vibe Coding 已发布的所有项目。每个项目卡片都可以直接打开对应网页。
      </p>
    </div>

    <section class="share-vibecoding-section">
      <div class="section-head vibe-journal-head">
        <div>
          <p class="eyebrow">Community Showcase</p>
          <h2>分享 Vibe Coding</h2>
        </div>
        <div class="share-section-actions">
          <p class="vibe-page-summary">
            首栏专门收集用户提交并通过审核的 Vibe Coding 作品，让访客先看到社区里正在发布的新项目。
          </p>
          <a class="secondary-link compact-action" href="/vibe-coding/showcase">查看全部</a>
          <a class="primary-link compact-action" href="/vibe-coding/share">提交作品</a>
        </div>
      </div>

      <div v-if="submissionsLoading" class="blog-state">正在读取分享作品...</div>
      <div v-else-if="submissionsError" class="blog-state error-state">{{ submissionsError }}</div>
      <div v-else-if="!submissions.length" class="blog-state">还没有审核通过的用户作品，欢迎提交第一个。</div>
      <div v-else class="share-card-grid">
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

    <div class="section-head vibe-journal-head project-library-head">
      <div>
        <p class="eyebrow">Project Library</p>
        <h2>已发布项目</h2>
      </div>
      <p class="vibe-page-summary">
        这里收纳 4399123 已发布的 Vibe Coding 项目。每个项目卡片都可以直接打开对应网页。
      </p>
    </div>

    <div class="project-grid">
      <ProjectCard
        v-for="(project, index) in projects"
        :key="project.href"
        v-reveal="index"
        :project="project"
      />
    </div>

    <section v-if="posts.length" class="vibe-journal">
      <div class="section-head vibe-journal-head">
        <div>
          <p class="eyebrow">Project Journal</p>
          <h2>Vibe Coding 日志</h2>
        </div>
        <p class="vibe-page-summary">
          记录每个小项目从想法、实现到上线的关键过程。
        </p>
      </div>

      <div class="blog-grid">
        <a
          v-for="(post, index) in posts"
          :key="post.id"
          v-reveal="index"
          class="blog-card"
          :href="`/blog/${encodeURIComponent(post.slug || post.id)}`"
        >
          <p class="blog-date">{{ post.date }}</p>
          <h3>{{ post.title }}</h3>
          <p>{{ post.summary }}</p>
          <div class="tag-row">
            <span v-for="tag in post.tags" :key="tag">{{ tag }}</span>
          </div>
          <span>阅读全文</span>
        </a>
      </div>
    </section>
  </section>
</template>

<script setup>
import ProjectCard from "./ProjectCard.vue";

defineProps({
  projects: {
    type: Array,
    required: true,
  },
  posts: {
    type: Array,
    default: () => [],
  },
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
</script>
