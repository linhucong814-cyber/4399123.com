<template>
  <section class="sidecard-panel weekly-hot" aria-labelledby="weekly-hot-title">
    <h2 id="weekly-hot-title">本周热门作品</h2>
    <ol v-if="works.length" class="weekly-hot-list">
      <li v-for="work in works" :key="work.id">
        <a :href="workUrl(work)">
          <WorkIcon :work="work" :size="36" />
          <span>
            <strong>{{ work.title }}</strong>
            <small>{{ describe(work.weekly) }}</small>
          </span>
        </a>
      </li>
    </ol>
    <p v-else-if="!loading" class="weekly-hot-empty">这周还没有作品被玩起来。<a href="/works">去作品页看看</a></p>
  </section>
</template>

<script setup>
import { onMounted, ref } from "vue";
import WorkIcon from "./WorkIcon.vue";
import { getWeeklyHotWorks, workUrl } from "../../services/works";

const works = ref([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const data = await getWeeklyHotWorks({ limit: 5 });
    works.value = Array.isArray(data.works) ? data.works : [];
  } catch {
    works.value = [];
  } finally {
    loading.value = false;
  }
});

function describe(weekly = {}) {
  const parts = [];
  if (weekly.views) parts.push(`${weekly.views} 次浏览`);
  if (weekly.likes) parts.push(`${weekly.likes} 赞`);
  if (weekly.favorites) parts.push(`${weekly.favorites} 收藏`);
  if (weekly.comments) parts.push(`${weekly.comments} 评论`);
  return parts.join(" · ") || "本周有新互动";
}
</script>
