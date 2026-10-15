<template>
  <span class="work-icon" :style="{ '--icon-size': `${size}px` }">
    <img v-if="src && !failed" :src="src" alt="" loading="lazy" decoding="async" @error="failed = true" />
    <span v-else class="work-icon-fallback" :style="fallbackStyle" aria-hidden="true">{{ initial }}</span>
    <slot />
  </span>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { workCategoryColors, workInitial } from "../../data/workCategories";
import { workIconUrl } from "../../data/workArtwork";

const props = defineProps({
  work: { type: Object, required: true },
  size: { type: Number, default: 72 },
});

const failed = ref(false);
const src = computed(() => workIconUrl(props.work));
watch(src, () => {
  failed.value = false;
});
const initial = computed(() => workInitial(props.work.title));
const fallbackStyle = computed(() => {
  const [from] = workCategoryColors[props.work.category] || workCategoryColors.other;
  return { background: from };
});
</script>
