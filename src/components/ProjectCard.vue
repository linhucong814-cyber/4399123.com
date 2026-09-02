<template>
  <a class="project-card" :href="project.href">
    <div class="project-preview">
      <span class="project-status-badge">Playable</span>
      <img :src="project.image" :alt="project.imageAlt" loading="lazy" decoding="async" />
    </div>
    <div class="project-info">
      <span class="project-eyebrow">{{ project.eyebrow }}</span>
      <h3>{{ project.title }}</h3>
      <p>{{ project.description }}</p>
      <div class="project-signal-row" aria-hidden="true">
        <span>Live preview</span>
        <i></i>
      </div>
      <div v-if="project.tags?.length" class="tag-row">
        <span v-for="tag in project.tags" :key="tag">{{ tag }}</span>
      </div>
      <strong class="project-action">{{ project.actionLabel }} <span aria-hidden="true">→</span></strong>
    </div>
  </a>
</template>

<script setup>
defineProps({
  project: {
    type: Object,
    required: true,
  },
});
</script>
