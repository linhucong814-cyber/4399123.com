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

    <div class="project-grid">
      <ProjectCard
        v-for="project in projects"
        :key="project.href"
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
          v-for="post in posts"
          :key="post.id"
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
});
</script>
