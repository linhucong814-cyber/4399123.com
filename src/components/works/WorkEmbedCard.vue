<template>
  <a class="work-embed" :href="work.url" @click.stop>
    <WorkIcon :work="work" :size="56" />
    <span class="work-embed-text">
      <small>{{ work.categoryLabel }} · {{ work.authorName }}</small>
      <strong>{{ work.title }}</strong>
      <span>{{ work.summary }}</span>
    </span>
    <span class="work-embed-go">去玩</span>
  </a>
</template>

<script setup>
import WorkIcon from "./WorkIcon.vue";

defineProps({ work: { type: Object, required: true } });
</script>
