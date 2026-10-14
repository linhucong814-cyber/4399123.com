<template>
  <div class="cft">
    <h2 class="cft-home">主页</h2>
    <div class="cft-sort" role="group" aria-label="帖子排序">
      <button
        v-for="option in sortOptions"
        :key="option.id"
        type="button"
        :aria-pressed="sort === option.id"
        :class="{ on: sort === option.id }"
        @click="$emit('select-sort', option.id)"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  sortOptions: { type: Array, default: () => [] },
  sort: { type: String, default: "latest" },
});
defineEmits(["select-sort"]);
</script>

<style scoped>
.cft {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  min-width: 0;
}
.cft-home {
  margin: 0;
  color: var(--c-ink);
  font-size: 16px;
  font-weight: 600;
}
.cft-sort {
  margin-left: auto;
  display: inline-flex;
  gap: 2px;
  background: var(--c-surface-2);
  border: 1px solid var(--c-line);
  border-radius: var(--c-pill);
  padding: 3px;
  max-width: 100%;
  flex-wrap: wrap;
}
.cft-sort button {
  border: 0;
  background: transparent;
  color: var(--c-muted);
  font-family: var(--c-mono);
  font-size: 12px;
  padding: 6px 12px;
  border-radius: var(--c-pill);
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.15s, background 0.15s;
}
.cft-sort button.on {
  background: var(--c-surface);
  color: var(--c-ink);
  box-shadow: var(--c-shadow-soft);
}
.cft-sort button:focus-visible {
  outline: 2px solid var(--c-green);
  outline-offset: 2px;
}
@media (prefers-reduced-motion: reduce) {
  .cft-sort button { transition: none; }
}
</style>
