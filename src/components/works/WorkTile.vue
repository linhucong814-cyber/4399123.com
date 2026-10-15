<template>
  <a class="work-tile" :class="`work-tile--${variant}`" :href="href" :title="`${work.title}：${work.summary || ''}`">
    <WorkIcon :work="work" :size="size">
      <span v-if="badge" class="work-tile-badge" :class="`is-${badge.toLowerCase()}`">{{ badge }}</span>
    </WorkIcon>
    <span class="work-tile-name">{{ displayTitle }}</span>
  </a>
</template>

<script setup>
import { computed } from "vue";
import WorkIcon from "./WorkIcon.vue";
import { workUrl } from "../../services/works";

const props = defineProps({
  work: { type: Object, required: true },
  size: { type: Number, default: 72 },
  badge: { type: String, default: "" },
  variant: { type: String, default: "grid" },
});

const href = computed(() => workUrl(props.work));
const displayTitle = computed(() => String(props.work.title || ""));
</script>
