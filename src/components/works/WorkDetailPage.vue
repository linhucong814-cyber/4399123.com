<template>
  <section class="vibe-page work-detail-page works-portal-detail">
    <a class="secondary-link compact-action work-back" href="/works">← 返回作品</a>

    <p v-if="loading" class="blog-state">正在读取作品...</p>
    <div v-else-if="error" class="auth-panel">
      <p class="form-message error-state">{{ error }}</p>
      <a class="primary-link compact-action" href="/works">去看看其他作品</a>
    </div>

    <template v-else-if="work">
      <p v-if="work.status && work.status !== 'approved'" class="form-message work-preview-notice">
        仅你和管理员可见：当前状态「{{ work.statusLabel }}」<template v-if="work.rejectReason">，审核意见：{{ work.rejectReason }}</template>
      </p>

      <header class="work-detail-head">
        <div>
          <h1>{{ work.title }}</h1>
          <p class="work-detail-summary">{{ work.summary }}</p>
          <p class="work-detail-meta">
            <a :href="`/works?category=${work.category}`">{{ work.categoryLabel }}</a><span v-if="work.isOfficial"> · 官方作品</span><span v-if="work.isThirdParty"> · 第三方开源作品</span><span v-if="work.isFeatured"> · 精选</span>
          </p>
        </div>
        <div class="work-actions">
          <button class="secondary-link compact-action" :class="{ active: liked }" type="button" :aria-pressed="liked" :disabled="busy" @click="toggleLike">
            {{ liked ? "已点赞" : "点赞" }} {{ stats.likes }}
          </button>
          <button class="secondary-link compact-action" :class="{ active: favorited }" type="button" :aria-pressed="favorited" :disabled="busy" @click="toggleFavorite">
            {{ favorited ? "已收藏" : "收藏" }} {{ stats.favorites }}
          </button>
          <span class="work-views">浏览 {{ stats.views }}</span>
        </div>
        <p v-if="actionMessage" class="form-message" role="status">{{ actionMessage }}</p>
      </header>

      <WorkAdminBar v-if="work.viewer?.isStaff" :work="work" @updated="onAdminUpdated" />

      <p v-if="credit" class="work-credit" data-testid="work-credit">
        <span class="work-credit-label">原作者</span>
        <a :href="credit.authorUrl" target="_blank" rel="noopener noreferrer">{{ authorName }}</a>
        <span class="work-credit-sep" aria-hidden="true">/</span>
        <span class="work-credit-label">开源协议</span>
        <a v-if="work.sourceUrl" :href="work.sourceUrl" target="_blank" rel="noopener noreferrer">{{ credit.license }}</a>
        <strong v-else>{{ credit.license }}</strong>
        <span v-if="playUrl" class="work-credit-note">
          本站提供汉化的中文版（按 MIT 协议修改再分发，保留原作者署名），在隔离沙箱中运行。
          <a :href="work.projectUrl" target="_blank" rel="noopener noreferrer" data-testid="work-original-link">英文原版</a>
        </span>
        <span v-else class="work-credit-note">本站仅收录展示，作品运行在原作者的站点上。</span>
      </p>

      <WorkPreviewFrame :url="frameUrl" :title="work.title" :cover="workCoverUrl(work)" :embeddable="work.embeddable" :own-origin="Boolean(work.isThirdParty) && !playUrl" />

      <div class="work-detail-grid">
        <article class="auth-panel work-description">
          <h2>作品介绍</h2>
          <p v-for="(block, index) in descriptionBlocks" :key="index">{{ block }}</p>
        </article>
        <aside class="auth-panel work-meta-panel">
          <div class="work-author">
            <span class="work-author-avatar" :class="{ 'is-official': work.isOfficial }" :style="avatarStyle" aria-hidden="true">
              <img v-if="work.isOfficial" :src="OFFICIAL_AVATAR" alt="" />
              <template v-else>{{ authorInitial }}</template>
            </span>
            <div>
              <small>{{ credit ? "原作者" : "作者" }}</small>
              <a v-if="credit?.authorUrl" :href="credit.authorUrl" target="_blank" rel="noopener noreferrer">{{ authorName }}</a>
              <a v-else-if="work.author?.id && !work.isOfficial" :href="`/users/${work.author.id}`">{{ authorName }}</a>
              <strong v-else>{{ authorName }}</strong>
            </div>
          </div>
          <dl>
            <template v-if="work.publishedAt">
              <dt>发布时间</dt>
              <dd><time :datetime="work.publishedAt">{{ formatDate(work.publishedAt) }}</time></dd>
            </template>
            <template v-if="credit">
              <dt>开源协议</dt>
              <dd>{{ credit.license }}</dd>
              <template v-if="work.sourceUrl">
                <dt>GitHub</dt>
                <dd><a :href="work.sourceUrl" target="_blank" rel="noopener noreferrer">{{ repoLabel }}</a></dd>
              </template>
              <template v-if="credit.originPostUrl">
                <dt>来源帖子</dt>
                <dd><a :href="credit.originPostUrl" target="_blank" rel="noopener noreferrer">在 X 上查看</a></dd>
              </template>
            </template>
            <template v-if="work.aiTools?.length">
              <dt>AI 工具</dt>
              <dd>{{ work.aiTools.join("、") }}</dd>
            </template>
          </dl>
          <div v-if="work.tags?.length" class="tag-row">
            <a v-for="tag in work.tags" :key="tag" :href="`/works?tag=${encodeURIComponent(tag)}`"><span>{{ tag }}</span></a>
          </div>
          <div class="share-card-actions">
            <template v-if="playUrl">
              <a :href="playUrl" target="_blank" rel="noopener noreferrer">打开中文版</a>
              <a :href="work.projectUrl" target="_blank" rel="noopener noreferrer">英文原版</a>
            </template>
            <a v-else :href="work.projectUrl" target="_blank" rel="noopener noreferrer">打开项目</a>
            <a v-if="work.sourceUrl" :href="work.sourceUrl" target="_blank" rel="noopener noreferrer">查看源码</a>
          </div>
        </aside>
      </div>

      <div class="work-discuss-grid">
        <WorkComments
          :slug="work.slug"
          :can-comment="Boolean(work.viewer?.isAuthenticated)"
          :initial-count="stats.comments || 0"
          @count="stats.comments = $event"
        />
        <section class="work-posts" aria-labelledby="work-posts-title">
          <h2 id="work-posts-title">社区讨论</h2>
          <a v-for="post in posts" :key="post.id" class="work-post-row" :href="post.url">
            <strong>{{ post.title }}</strong>
            <span>@{{ post.author.username }} · {{ post.channelLabel }} · {{ post.replyCount }} 回复</span>
          </a>
          <p v-if="!posts.length" class="work-comment-empty">还没有帖子关联这个作品。</p>
          <a class="work-post-new" :href="`/community?compose=1&work=${encodeURIComponent(work.slug)}`">发帖讨论这个作品</a>
        </section>
      </div>

      <section v-if="related.length" class="work-related">
        <h2>相关作品</h2>
        <div class="portal-latest-grid work-related-grid">
          <WorkTile v-for="item in related" :key="item.id" :work="item" :size="90" />
        </div>
      </section>
    </template>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import WorkTile from "./WorkTile.vue";
const OFFICIAL_AVATAR = "/assets/brand/4399123-domain-logo-transparent.png";
import WorkAdminBar from "./WorkAdminBar.vue";
import WorkComments from "./WorkComments.vue";
import WorkPreviewFrame from "./WorkPreviewFrame.vue";
import { getWork, getWorkPosts, previewUrl, recordWorkView, setWorkFavorite, setWorkLike } from "../../services/works";
import { addRecentWork } from "../../utils/recentWorks";
import { setPageSeo } from "../../utils/seo";
import { workCoverUrl } from "../../data/workArtwork";

const props = defineProps({
  slug: { type: String, required: true },
});

const work = ref(null);
const related = ref([]);
const loading = ref(true);
const error = ref("");
const busy = ref(false);
const liked = ref(false);
const favorited = ref(false);
const actionMessage = ref("");
const stats = reactive({ views: 0, likes: 0, favorites: 0, comments: 0 });
const posts = ref([]);

const authorName = computed(() => work.value?.author?.name || work.value?.author?.username || "匿名");
const AVATAR_COLORS = ["#2f6f10", "#1864ab", "#b8420a", "#5a37c9", "#b02556", "#0b7285"];
const authorInitial = computed(() => Array.from(authorName.value.trim())[0]?.toUpperCase() || "作");
const avatarStyle = computed(() => {
  let hash = 0;
  for (const char of authorName.value) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return { "--avatar-bg": AVATAR_COLORS[hash % AVATAR_COLORS.length] };
});
// Third-party games with a self-hosted Chinese copy (/play/<slug>/) preview that copy; the
// original English demo stays in projectUrl and is linked as 英文原版.
const playUrl = computed(() => {
  const url = String(work.value?.isThirdParty ? work.value.credit?.playUrl || "" : "");
  return /^\/play\/[a-z0-9-]+\/$/.test(url) ? url : "";
});
const frameUrl = computed(() => playUrl.value || previewUrl(work.value));
// Third-party open-source works carry the original author's credit from the API.
const credit = computed(() => (work.value?.isThirdParty && work.value.credit?.license ? work.value.credit : null));
const repoLabel = computed(() => String(work.value?.sourceUrl || "").replace(/^https:\/\/github\.com\//, ""));
const descriptionBlocks = computed(() =>
  String(work.value?.description || work.value?.summary || "")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean),
);

onMounted(load);
watch(() => props.slug, load);

function onAdminUpdated(updated) {
  work.value = { ...work.value, ...updated, viewer: work.value.viewer };
}

async function load() {
  loading.value = true;
  error.value = "";
  try {
    const data = await getWork(props.slug);
    work.value = data.work;
    related.value = Array.isArray(data.related) ? data.related : [];
    Object.assign(stats, data.work.stats || {});
    liked.value = Boolean(data.work.viewer?.liked);
    favorited.value = Boolean(data.work.viewer?.favorited);
    applySeo(data.work);
    posts.value = [];
    getWorkPosts(props.slug)
      .then((result) => {
        posts.value = Array.isArray(result.posts) ? result.posts : [];
      })
      .catch(() => {});
    if (!data.work.status || data.work.status === "approved") {
      addRecentWork(data.work);
      recordWorkView(props.slug)
        .then((result) => {
          if (typeof result.views === "number") stats.views = result.views;
        })
        .catch(() => {});
    }
  } catch (err) {
    work.value = null;
    error.value = err.status === 404 ? "作品不存在或尚未公开。" : err.message || "读取作品失败。";
    setPageSeo({ title: "作品不存在", path: `/works/${props.slug}` });
  } finally {
    loading.value = false;
  }
}

function applySeo(item) {
  setPageSeo({
    title: item.title,
    description: item.summary,
    path: `/works/${item.slug}`,
    image: workCoverUrl(item) || undefined,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: item.title,
      description: item.summary,
      url: `https://4399123.com/works/${item.slug}`,
      image: workCoverUrl(item) ? new URL(workCoverUrl(item), "https://4399123.com").toString() : undefined,
      author: { "@type": item.isOfficial ? "Organization" : "Person", name: item.author?.name || "4399123" },
      datePublished: item.publishedAt || undefined,
      keywords: (item.tags || []).join(", "),
      inLanguage: "zh-CN",
    },
  });
}

async function runAction(fn) {
  if (busy.value) return;
  busy.value = true;
  actionMessage.value = "";
  try {
    await fn();
  } catch (err) {
    actionMessage.value = err.status === 401 ? "请先登录后再操作。" : err.message || "操作失败，请稍后再试。";
  } finally {
    busy.value = false;
  }
}

function toggleLike() {
  return runAction(async () => {
    const data = await setWorkLike(props.slug, !liked.value);
    liked.value = data.liked;
    stats.likes = data.count;
  });
}

function toggleFavorite() {
  return runAction(async () => {
    const data = await setWorkFavorite(props.slug, !favorited.value);
    favorited.value = data.favorited;
    stats.favorites = data.count;
  });
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("zh-CN");
}
</script>
