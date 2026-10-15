<template>
  <article class="work-card" :class="{ 'is-featured': work.isFeatured }">
    <a class="work-card-cover" :href="detailHref" :aria-label="`查看作品：${work.title}`">
      <img v-if="coverUrl" :src="coverUrl" :alt="work.title" loading="lazy" decoding="async" />
      <span v-else class="work-card-cover-fallback" :style="fallbackStyle" aria-hidden="true">
        <span class="work-card-cover-initial">{{ initial }}</span>
        <span class="work-card-cover-label">{{ work.categoryLabel || categoryLabel }}</span>
      </span>
      <span v-if="work.isFeatured" class="work-badge">精选</span>
      <span v-else-if="work.isOfficial" class="work-badge work-badge--official">官方</span>
    </a>
    <div class="work-card-body">
      <p class="eyebrow">{{ work.categoryLabel || categoryLabel }}</p>
      <h3><a :href="detailHref">{{ work.title }}</a></h3>
      <p class="work-card-summary">{{ work.summary }}</p>
      <div v-if="work.tags?.length" class="tag-row">
        <span v-for="tag in work.tags.slice(0, 4)" :key="tag">{{ tag }}</span>
      </div>
      <div class="work-card-foot">
        <span class="work-card-author" :title="`by ${authorName}`">by {{ authorName }}</span>
        <span class="work-stats" aria-label="互动数据">
          <span title="浏览">👁 {{ work.stats?.views || 0 }}</span>
          <span title="点赞">❤ {{ work.stats?.likes || 0 }}</span>
          <span title="收藏">★ {{ work.stats?.favorites || 0 }}</span>
        </span>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from "vue";
import { workCategoryColors, workCategoryLabel, workInitial } from "../../data/workCategories";
import { workUrl } from "../../services/works";
import { workCoverUrl } from "../../data/workArtwork";

const props = defineProps({
  work: { type: Object, required: true },
});

const detailHref = computed(() => workUrl(props.work));
const coverUrl = computed(() => workCoverUrl(props.work));
const authorName = computed(() => props.work.author?.name || props.work.author?.username || "匿名");
const initial = computed(() => workInitial(props.work.title));
const fallbackStyle = computed(() => {
  const [from, to] = workCategoryColors[props.work.category] || workCategoryColors.other;
  return { background: `linear-gradient(135deg, ${from}, ${to})` };
});
const categoryLabel = computed(() => workCategoryLabel(props.work.category));
</script>
