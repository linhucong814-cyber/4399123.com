<template>
  <div class="cft">
    <div class="cft-top">
      <div class="cft-seg" role="tablist" aria-label="动态流类型">
        <button
          type="button"
          role="tab"
          :aria-selected="feed === 'recommended'"
          :class="{ on: feed === 'recommended' }"
          @click="$emit('select-feed', 'recommended')"
        >
          推荐
        </button>
        <button
          type="button"
          role="tab"
          :aria-selected="feed === 'following'"
          :class="{ on: feed === 'following' }"
          @click="$emit('select-feed', 'following')"
        >
          关注
        </button>
      </div>
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
    <div class="cft-channels" role="tablist" aria-label="社区栏目">
      <button
        type="button"
        role="tab"
        :aria-selected="channel === 'all'"
        :class="{ on: channel === 'all' }"
        @click="$emit('select-channel', 'all')"
      >
        全部
      </button>
      <button
        v-for="item in channels"
        :key="item.id"
        type="button"
        role="tab"
        :aria-selected="channel === item.id"
        :class="{ on: channel === item.id }"
        @click="$emit('select-channel', item.id)"
      >
        {{ item.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  feed: {
    type: String,
    default: "recommended",
  },
  channels: {
    type: Array,
    default: () => [],
  },
  channel: {
    type: String,
    default: "all",
  },
  sortOptions: {
    type: Array,
    default: () => [],
  },
  sort: {
    type: String,
    default: "latest",
  },
});

defineEmits(["select-feed", "select-channel", "select-sort"]);
</script>

<style scoped>
.cft {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.cft-top {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  min-width: 0;
}

.cft-seg {
  display: inline-flex;
  background: var(--c-surface-2);
  border: 1px solid var(--c-line);
  border-radius: var(--c-pill);
  padding: 3px;
}

.cft-seg button {
  border: 0;
  background: transparent;
  color: var(--c-muted);
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  padding: 6px 18px;
  border-radius: var(--c-pill);
  cursor: pointer;
  transition: color 0.15s, background 0.15s;
}

.cft-seg button.on {
  background: var(--c-surface);
  color: var(--c-green);
  box-shadow: var(--c-shadow-soft);
}

.cft-sort {
  margin-left: auto;
  display: inline-flex;
  gap: 2px;
  background: var(--c-surface-2);
  border: 1px solid var(--c-line);
  border-radius: var(--c-pill);
  padding: 3px;
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

.cft-channels {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 3px;
  scrollbar-width: thin;
  min-width: 0;
  max-width: 100%;
}

.cft-channels button {
  flex: none;
  border: 1px solid var(--c-line);
  background: var(--c-surface);
  color: var(--c-ink);
  border-radius: var(--c-pill);
  padding: 6px 14px;
  font: inherit;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
  transition: border-color 0.15s, background 0.15s, color 0.15s;
}

.cft-channels button:hover {
  border-color: color-mix(in srgb, var(--c-green) 40%, var(--c-line));
}

.cft-channels button.on {
  background: var(--c-green);
  color: #fff;
  border-color: var(--c-green);
}

.cft-channels button:focus-visible,
.cft-seg button:focus-visible,
.cft-sort button:focus-visible {
  outline: 2px solid var(--c-green);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .cft-seg button,
  .cft-sort button,
  .cft-channels button {
    transition: none;
  }
}
</style>
