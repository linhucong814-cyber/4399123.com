<template>
  <section class="works-portal">
    <header class="portal-topbar">
      <div class="portal-brand">
        <h1>作品</h1>
        <span>4399123 社区的 Vibe Coding 小游戏、工具与 AI 实验，点开即玩</span>
      </div>
      <form class="portal-search" role="search" @submit.prevent="searchAndJump">
        <label class="sr-only" for="portal-search-input">搜索作品</label>
        <input id="portal-search-input" v-model.trim="filters.q" type="search" maxlength="80" placeholder="搜作品名、简介、标签或作者" @input="scheduleReload" />
        <button type="submit">搜索</button>
      </form>
      <a class="portal-submit" href="/vibe-coding/share">＋ 提交作品</a>
    </header>

    <nav class="portal-nav" aria-label="作品分类导航">
      <div v-for="row in categoryRows" :key="row.value" class="portal-nav-row">
        <button class="portal-pill" :class="`cat-${row.value}`" type="button" @click="jumpToCategory(row.value)">{{ row.label }}</button>
        <div class="portal-nav-links">
          <a
            v-for="work in row.works"
            :key="work.id"
            :href="workUrl(work)"
            :class="{ 'is-hot': hotIds.has(work.id), 'is-featured': work.isFeatured && !hotIds.has(work.id) }"
          >{{ shortTitle(work) }}</a>
          <span v-if="!row.works.length" class="portal-nav-empty">暂无作品，敬请期待</span>
        </div>
        <button class="portal-more" type="button" @click="jumpToCategory(row.value)">更多&gt;&gt;</button>
      </div>
      <div class="portal-hot-row">
        <span class="portal-hot-label">热门推荐</span>
        <div class="portal-nav-links">
          <a v-for="work in hotWorks" :key="work.id" :href="workUrl(work)" :class="{ 'is-hot': hotIds.has(work.id) }">{{ shortTitle(work) }}</a>
          <span v-if="!hotWorks.length" class="portal-nav-empty">还没有热门作品，去玩一玩吧</span>
        </div>
      </div>
    </nav>

    <section class="portal-recent" aria-label="我玩过的">
      <h2 class="portal-recent-label">我玩过的</h2>
      <div class="portal-recent-list">
        <a v-for="item in recent" :key="item.slug" class="portal-recent-item" :href="workUrl(item)">
          <WorkIcon :work="item" :size="30" />
          <span>{{ shortTitle(item) }}</span>
        </a>
        <span v-if="!recent.length" class="portal-recent-empty">还没有玩过的作品，点开任意作品后会记录在这里（仅保存在本机）。</span>
      </div>
      <button class="portal-recent-clear" type="button" :disabled="!recent.length" @click="clearRecent">清空</button>
    </section>

    <section class="portal-carousel" aria-label="热门作品图标墙" aria-roledescription="carousel">
      <button class="portal-arrow is-prev" type="button" aria-label="上一页" :disabled="carouselPage === 0" @click="carouselPage -= 1">‹</button>
      <div class="portal-icon-wall" aria-live="polite">
        <WorkTile v-for="work in carouselItems" :key="work.id" :work="work" :size="72" variant="wall" />
        <a v-for="n in emptySlots" :key="`slot-${n}`" class="portal-slot" href="/vibe-coding/share" :tabindex="n === 1 ? 0 : -1" :aria-hidden="n === 1 ? undefined : 'true'">
          <span class="portal-slot-box" aria-hidden="true">＋</span>
          <span class="portal-slot-name">{{ n === 1 ? "提交你的作品" : "虚位以待" }}</span>
        </a>
      </div>
      <button class="portal-arrow is-next" type="button" aria-label="下一页" :disabled="carouselPage >= carouselPages - 1" @click="carouselPage += 1">›</button>
    </section>

    <div class="portal-columns">
      <section id="works-list" ref="listSection" class="portal-panel portal-list" aria-labelledby="works-list-title">
        <header class="portal-panel-head">
          <h2 id="works-list-title">最新好玩作品列表</h2>
          <p class="portal-today"><span class="work-tile-badge is-new is-inline">NEW</span> 今日已更新作品 <strong>{{ todayCount }}</strong> 款</p>
        </header>

        <div class="portal-filters">
          <div class="prompt-library-filters" aria-label="按分类筛选">
            <button class="portal-chip" :class="{ active: !filters.category }" type="button" :aria-pressed="!filters.category" @click="setFilter('category', '')">全部</button>
            <button
              v-for="item in workCategories"
              :key="item.value"
              class="portal-chip"
              :class="{ active: filters.category === item.value }"
              type="button"
              :aria-pressed="filters.category === item.value"
              @click="setFilter('category', item.value)"
            >{{ item.label }}</button>
          </div>
          <label class="portal-sort">
            排序
            <select v-model="filters.sort" @change="reload()">
              <option v-for="item in workSorts" :key="item.value" :value="item.value">{{ item.label }}</option>
            </select>
          </label>
        </div>
        <div v-if="tags.length" class="works-tag-filter" aria-label="按标签筛选">
          <button
            v-for="tag in tags"
            :key="tag.name"
            type="button"
            :class="{ active: filters.tag === tag.name }"
            :aria-pressed="filters.tag === tag.name"
            @click="setFilter('tag', filters.tag === tag.name ? '' : tag.name)"
          >#{{ tag.name }} <small>{{ tag.count }}</small></button>
        </div>

        <p v-if="error" class="form-message error-state">{{ error }}</p>
        <p v-else-if="loading && !works.length" class="blog-state">正在读取作品...</p>
        <div v-else-if="!works.length" class="portal-empty">
          <p v-if="hasFilters">没有找到匹配的作品。换个关键词，或 <button class="text-button" type="button" @click="clearFilters">清除筛选</button>。</p>
          <p v-else>还没有公开作品。</p>
        </div>
        <template v-else>
          <p class="works-count">共 {{ total }} 个作品</p>
          <div class="portal-latest-grid">
            <WorkTile v-for="work in works" :key="work.id" :work="work" :size="90" :badge="badgeFor(work)" variant="latest" />
          </div>
          <div v-if="hasNext" class="works-more">
            <button class="portal-chip" type="button" :disabled="loading" @click="loadMore">{{ loading ? "加载中..." : "加载更多" }}</button>
          </div>
        </template>
      </section>

      <aside class="portal-side">
        <section class="portal-side-block" aria-labelledby="works-today-title">
          <header class="portal-panel-head">
            <h2 id="works-today-title">今日推荐</h2>
            <button class="portal-more" type="button" @click="jumpToSort('popular')">更多</button>
          </header>
          <a v-for="work in recommended" :key="work.id" class="portal-pick" :href="workUrl(work)">
            <WorkIcon :work="work" :size="64" />
            <span class="portal-pick-text">
              <strong>{{ shortTitle(work) }}</strong>
              <span>{{ work.summary }}</span>
            </span>
          </a>
          <p v-if="!recommended.length" class="portal-empty">暂无推荐</p>
        </section>
        <section v-if="ranking.length" class="portal-side-block" aria-labelledby="works-rank-title">
          <header class="portal-panel-head">
            <h2 id="works-rank-title">热门排行</h2>
          </header>
          <ol class="portal-rank">
            <li v-for="(work, index) in ranking" :key="work.id">
              <span class="portal-rank-no">{{ index + 1 }}</span>
              <a :href="workUrl(work)">{{ shortTitle(work) }}</a>
              <span class="portal-rank-views">{{ work.stats?.views ?? 0 }} 次</span>
            </li>
          </ol>
        </section>
      </aside>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from "vue";
import WorkIcon from "./WorkIcon.vue";
import WorkTile from "./WorkTile.vue";
import { workCategories, workSorts } from "../../data/workCategories";
import { buildWorksQuery, getWorks, getWorksBatch, getWorksMeta, getWorksPortal, workUrl } from "../../services/works";
import { hasInteractions, isHotWork, workBadge } from "../../utils/workBadges";
import { clearRecentWorks, getRecentWorks } from "../../utils/recentWorks";
import { setPageSeo } from "../../utils/seo";

const CAROUSEL_PAGE_SIZE = 24; // 12 per row x 2 rows on desktop
const WALL_ROW = 12;

const params = new URLSearchParams(window.location.search);
const filters = reactive({
  category: params.get("category") || "",
  tag: params.get("tag") || "",
  q: params.get("q") || "",
  sort: workSorts.some((item) => item.value === params.get("sort")) ? params.get("sort") : "newest",
});
const works = ref([]);
const portalWorks = ref([]);
const featuredWorks = ref([]);
const portalLoading = ref(true);
const tags = ref([]);
const todayCount = ref(0);
const page = ref(1);
const total = ref(0);
const hasNext = ref(false);
const loading = ref(false);
const error = ref("");
const recent = ref(getRecentWorks());

async function refreshRecentFromServer() {
  const local = getRecentWorks();
  if (!local.length) {
    recent.value = [];
    return;
  }
  try {
    const data = await getWorksBatch(local.map((item) => item.slug));
    const bySlug = Object.fromEntries((data.works || []).map((work) => [work.slug, work]));
    recent.value = local
      .map((item) => {
        const work = bySlug[item.slug];
        return work
          ? { slug: work.slug, title: work.title, coverUrl: work.coverUrl || "", category: work.category || "other" }
          : null;
      })
      .filter(Boolean);
  } catch {
    recent.value = local;
  }
}

const carouselPage = ref(0);
const listSection = ref(null);
let controller = null;
let metaController = null;
let timer = 0;

const hasFilters = computed(() => Boolean(filters.category || filters.tag || filters.q));
// Only real popularity counts: red links/HOT badges need a real threshold, and the
// 热门推荐 row lists only works somebody actually interacted with.
const hotIds = computed(() => new Set(portalWorks.value.filter(isHotWork).map((work) => work.id)));
const hotWorks = computed(() => portalWorks.value.filter(hasInteractions).slice(0, 14));
const categoryRows = computed(() =>
  workCategories
    .map((category) => ({ ...category, works: portalWorks.value.filter((work) => work.category === category.value).slice(0, 12) }))
    .filter((row) => row.works.length || row.value !== "other"),
);
// Pad the icon wall to whole rows with empty slots; never with fake works.
const emptySlots = computed(() => {
  if (portalLoading.value) return 0;
  const shown = carouselItems.value.length;
  const target = Math.max(WALL_ROW, Math.ceil(shown / WALL_ROW) * WALL_ROW);
  return target - shown;
});
const carouselPages = computed(() => Math.max(1, Math.ceil(portalWorks.value.length / CAROUSEL_PAGE_SIZE)));
const carouselItems = computed(() =>
  portalWorks.value.slice(carouselPage.value * CAROUSEL_PAGE_SIZE, (carouselPage.value + 1) * CAROUSEL_PAGE_SIZE),
);
const recommended = computed(() => {
  const featured = featuredWorks.value.length
    ? featuredWorks.value
    : portalWorks.value.filter((work) => work.isFeatured);
  const rest = portalWorks.value.filter((work) => !work.isFeatured && !featured.some((item) => item.id === work.id));
  return [...featured, ...rest].slice(0, 8);
});

// portalWorks is already sorted by popularity, so the first ten are the ranking.
const ranking = computed(() => portalWorks.value.slice(0, 10));

setPageSeo({
  title: "作品",
  description: "浏览 4399123 社区的 Vibe Coding 作品：小游戏、网页工具、AI 应用和可视化实验，按分类、标签筛选，点开即玩。",
  path: "/works",
});

onMounted(() => {
  loadPortal();
  refreshRecentFromServer();
  reload();
});

onUnmounted(() => {
  controller?.abort();
  metaController?.abort();
  window.clearTimeout(timer);
});

function shortTitle(work) {
  return String(work?.title || "");
}

function badgeFor(work) {
  return workBadge(work);
}

async function loadPortal() {
  portalLoading.value = true;
  try {
    const data = await getWorksPortal();
    portalWorks.value = Array.isArray(data.popular) ? data.popular : [];
    featuredWorks.value = Array.isArray(data.featured) ? data.featured : [];
    if (typeof data.todayCount === "number") todayCount.value = data.todayCount;
  } catch {
    // Fall back to the older two-call path if the portal endpoint is unavailable.
    try {
      const data = await getWorks({ sort: "popular", pageSize: 48 });
      portalWorks.value = Array.isArray(data.works) ? data.works : [];
    } catch {
      portalWorks.value = [];
    }
  } finally {
    portalLoading.value = false;
  }
}

function clearRecent() {
  recent.value = clearRecentWorks();
}

function syncUrl() {
  const query = buildWorksQuery(filters);
  const next = `/works${query ? `?${query}` : ""}`;
  if (`${window.location.pathname}${window.location.search}` !== next) {
    window.history.replaceState(window.history.state, "", next);
  }
}

function scrollToList() {
  listSection.value?.scrollIntoView?.({ behavior: "smooth", block: "start" });
}

function jumpToCategory(value) {
  filters.category = value;
  filters.tag = "";
  reload();
  scrollToList();
}

function jumpToSort(value) {
  filters.sort = value;
  reload();
  scrollToList();
}

function searchAndJump() {
  reload();
  scrollToList();
}

function scheduleReload() {
  window.clearTimeout(timer);
  timer = window.setTimeout(() => reload(), 280);
}

function setFilter(key, value) {
  filters[key] = value;
  reload();
}

function clearFilters() {
  Object.assign(filters, { category: "", tag: "", q: "" });
  reload();
}

function reload() {
  page.value = 1;
  syncUrl();
  loadTagFacets();
  return fetchPage(false);
}

function loadMore() {
  page.value += 1;
  return fetchPage(true);
}

async function loadTagFacets() {
  metaController?.abort();
  metaController = new AbortController();
  try {
    const data = await getWorksMeta({ category: filters.category, q: filters.q }, { signal: metaController.signal });
    const next = Array.isArray(data.tags) ? data.tags.slice(0, 14) : [];
    if (filters.tag && !next.some((tag) => tag.name === filters.tag)) next.unshift({ name: filters.tag, count: 0 });
    tags.value = next;
    if (typeof data.todayCount === "number") todayCount.value = data.todayCount;
  } catch (err) {
    if (err.name !== "AbortError") tags.value = [];
  }
}

async function fetchPage(append) {
  controller?.abort();
  controller = new AbortController();
  loading.value = true;
  error.value = "";
  try {
    const data = await getWorks({ ...filters, page: page.value, pageSize: 24 }, { signal: controller.signal });
    const items = Array.isArray(data.works) ? data.works : [];
    works.value = append ? [...works.value, ...items] : items;
    total.value = data.pagination?.total ?? works.value.length;
    hasNext.value = Boolean(data.pagination?.hasNext);
  } catch (err) {
    if (err.name === "AbortError") return;
    if (!append) works.value = [];
    error.value = err.message || "读取作品失败。";
  } finally {
    loading.value = false;
  }
}

defineExpose({ filters, reload });
</script>
