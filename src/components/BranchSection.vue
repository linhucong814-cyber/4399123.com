<template>
  <section class="branch-section" id="vibe-coding">
    <div class="section-head">
      <p class="eyebrow">Project Branch</p>
      <h2>Vibe Coding</h2>
    </div>
    <div class="branch-layout">
      <article class="branch-panel">
        <div class="branch-copy">
          <div class="branch-kicker">当前分支</div>
          <h3>把灵感做成可体验的作品</h3>
          <p>
            Vibe Coding 收纳那些不止停留在概念里的实验：快速成型、真实交互、可以被测试，也可以继续长成完整产品。
          </p>
        </div>
        <div class="branch-stat" aria-label="Vibe Coding 已发布项目数量">
          <span>已发布项目</span>
          <strong>{{ projects.length }}</strong>
          <small>从快捷栏直接进入体验</small>
        </div>
      </article>

      <nav class="branch-quickbar" aria-label="Vibe Coding 项目快捷入口">
        <a
          v-for="project in projects"
          :key="project.href"
          :href="project.href"
        >
          <span>{{ project.eyebrow }}</span>
          <strong>{{ project.title }}</strong>
        </a>
      </nav>

      <div class="project-grid">
        <ProjectCard
          v-for="project in projects"
          :key="project.href"
          :project="project"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import ProjectCard from "./ProjectCard.vue";

defineProps({
  projects: {
    type: Array,
    required: true,
  },
});
</script>
