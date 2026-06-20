<template>
  <section class="branch-section" id="vibe-coding">
    <div class="section-head">
      <p class="eyebrow">Project Branch</p>
      <h2>Vibe Coding</h2>
    </div>
    <div class="branch-layout">
      <article v-reveal class="branch-panel">
        <div class="branch-copy">
          <div class="branch-kicker">当前分支</div>
          <h3>把灵感做成可体验的作品</h3>
          <p>
            Vibe Coding 收纳那些不止停留在概念里的实验：快速成型、真实交互、可以被测试，也可以继续长成完整产品。
          </p>
          <div class="branch-signals" aria-label="Vibe Coding 分支状态">
            <span><i aria-hidden="true"></i>快速成型</span>
            <span><i aria-hidden="true"></i>真实交互</span>
            <span><i aria-hidden="true"></i>持续迭代</span>
          </div>
        </div>
        <div class="branch-stat" aria-label="Vibe Coding 已发布项目数量">
          <span>Base Level</span>
          <strong>{{ projects.length }}</strong>
          <small>个可体验任务已解锁</small>
        </div>
      </article>

      <nav class="branch-quickbar" aria-label="Vibe Coding 项目快捷入口">
        <a
          v-for="(project, index) in projects"
          :key="project.href"
          v-reveal="index"
          :href="project.href"
        >
          <span><i aria-hidden="true"></i>{{ project.eyebrow }}</span>
          <strong>{{ project.title }}</strong>
        </a>
      </nav>

      <div class="project-grid">
        <ProjectCard
          v-for="(project, index) in projects"
          :key="project.href"
          v-reveal="index"
          :project="project"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import ProjectCard from "./ProjectCard.vue";

const props = defineProps({
  projects: {
    type: Array,
    required: true,
  },
});
</script>
