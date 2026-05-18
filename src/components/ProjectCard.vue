<template>
  <a class="project-card" :href="project.href">
    <div class="project-preview">
      <img :src="project.image" :alt="project.imageAlt" loading="lazy" decoding="async" />
    </div>
    <div class="project-info">
      <span>{{ project.eyebrow }}</span>
      <h3>{{ project.title }}</h3>
      <p>{{ project.description }}</p>
      <div v-if="project.tags?.length" class="tag-row">
        <span v-for="tag in project.tags" :key="tag">{{ tag }}</span>
      </div>
      <strong>{{ project.actionLabel }}</strong>
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
