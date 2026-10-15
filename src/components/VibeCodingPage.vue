<template>
  <section class="vibe-page">
    <div class="section-head vibe-page-head">
      <div>
        <p class="eyebrow">Project Branch</p>
        <component :is="embedded ? 'h2' : 'h1'">Vibe Coding</component>
      </div>
      <p class="vibe-page-summary">
        从想法到可点击的作品：这里汇集 4399123 的官方项目、社区投稿和构建日志。
      </p>
    </div>

    <section class="share-vibecoding-section">
      <div class="section-head vibe-journal-head">
        <div>
          <p class="eyebrow">Community Showcase</p>
          <h2>分享 Vibe Coding</h2>
        </div>
        <div class="share-section-actions">
          <p class="vibe-page-summary">
            首栏专门收集用户提交并通过审核的 Vibe Coding 作品，让访客先看到社区里正在发布的新项目。
          </p>
          <a class="secondary-link compact-action" href="/works#works-list">查看全部</a>
          <a class="primary-link compact-action" href="/vibe-coding/share">提交作品</a>
        </div>
      </div>

      <div v-if="submissionsLoading" class="blog-state">正在读取分享作品...</div>
      <div v-else-if="submissionsError" class="blog-state error-state">{{ submissionsError }}</div>
      <div v-else-if="!submissions.length" class="blog-state">还没有审核通过的用户作品，欢迎提交第一个。</div>
      <div v-else class="share-card-grid">
        <article v-for="(item, index) in submissions" :key="item.id" v-reveal="index" class="share-card">
          <a class="share-card-cover" :href="item.projectUrl" target="_blank" rel="noopener noreferrer">
            <img v-if="workCoverUrl(item)" :src="workCoverUrl(item)" :alt="item.projectName" loading="lazy" decoding="async" />
          </a>
          <div class="share-card-body">
            <span>by {{ item.authorName }}</span>
            <h3>{{ item.projectName }}</h3>
            <p>{{ item.summary }}</p>
            <div v-if="item.tags?.length" class="tag-row">
              <span v-for="tag in item.tags" :key="`${item.id}-${tag}`">{{ tag }}</span>
            </div>
            <div class="share-card-actions">
              <a :href="item.projectUrl" target="_blank" rel="noopener noreferrer">打开项目</a>
              <a v-if="item.sourceUrl" :href="item.sourceUrl" target="_blank" rel="noopener noreferrer">源码</a>
            </div>
          </div>
        </article>
      </div>
    </section>

    <div class="section-head vibe-journal-head project-library-head">
      <div>
        <p class="eyebrow">Project Library</p>
        <h2>已发布项目</h2>
      </div>
      <p class="vibe-page-summary">
        这里收纳 4399123 已发布的 Vibe Coding 项目。每个项目卡片都可以直接打开对应网页。
      </p>
    </div>

    <section class="project-library-showcase" aria-label="Vibe Coding 项目展示">
      <article v-if="activeProject" class="project-stage">
        <a class="project-stage-media" :href="activeProject.href" :aria-label="activeProject.title">
          <img :src="activeProject.image" :alt="activeProject.imageAlt" loading="eager" decoding="async" />
          <span>{{ activeProject.eyebrow }}</span>
        </a>
        <div class="project-stage-copy">
          <div>
            <span class="project-stage-count">{{ String(activeProjectIndex + 1).padStart(2, "0") }}</span>
            <h3>{{ activeProject.title }}</h3>
            <p>{{ activeProject.description }}</p>
            <div v-if="activeProject.tags?.length" class="tag-row project-stage-tags">
              <span v-for="tag in activeProject.tags" :key="`${activeProject.id}-${tag}`">{{ tag }}</span>
            </div>
          </div>
          <div class="project-stage-actions">
            <a class="primary-link" :href="activeProject.href">{{ activeProject.actionLabel }}</a>
            <a class="secondary-link" href="/vibe-coding/share">提交作品</a>
          </div>
        </div>
      </article>

      <div class="project-rail-shell">
        <div class="project-rail-toolbar">
          <div class="project-rail-meter" aria-hidden="true">
            <span>{{ activeProjectIndex + 1 }} / {{ projects.length }}</span>
            <div>
              <i :style="{ width: `${scrollProgress}%` }"></i>
            </div>
          </div>
          <div class="project-rail-buttons">
            <button type="button" :disabled="!canScrollPrev" aria-label="向左浏览项目" @click="scrollProjects(-1)">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </button>
            <button type="button" :disabled="!canScrollNext" aria-label="向右浏览项目" @click="scrollProjects(1)">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div
          ref="projectRail"
          class="project-rail"
          :class="{ 'is-dragging': isDragging }"
          role="region"
          aria-label="Vibe Coding 项目列表"
          tabindex="0"
          @scroll.passive="syncRailState"
          @keydown="handleRailKeydown"
          @mousedown="startRailDrag"
          @dragstart.prevent
        >
          <div
            v-for="(project, index) in projects"
            :key="project.href"
            v-reveal="index"
            class="project-rail-item"
            :class="{ 'is-active': index === activeProjectIndex }"
          >
            <ProjectCard :project="project" @click.capture="handleProjectClick" />
          </div>
        </div>
      </div>
    </section>

    <section v-if="posts.length" class="vibe-journal">
      <div class="section-head vibe-journal-head">
        <div>
          <p class="eyebrow">Project Journal</p>
          <h2>Vibe Coding 日志</h2>
        </div>
        <p class="vibe-page-summary">
          记录每个小项目从想法、实现到上线的关键过程。
        </p>
      </div>

      <div class="blog-grid">
        <a
          v-for="(post, index) in posts"
          :key="post.id"
          v-reveal="index"
          class="blog-card"
          :href="`/blog/${encodeURIComponent(post.slug || post.id)}`"
        >
          <p class="blog-date">{{ post.date }}</p>
          <h3>{{ post.title }}</h3>
          <p>{{ post.summary }}</p>
          <div class="tag-row">
            <span v-for="tag in post.tags" :key="tag">{{ tag }}</span>
          </div>
          <span>阅读全文</span>
        </a>
      </div>
    </section>
  </section>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import ProjectCard from "./ProjectCard.vue";
import { workCoverUrl } from "../data/workArtwork";

const props = defineProps({
  embedded: {
    type: Boolean,
    default: false,
  },
  projects: {
    type: Array,
    required: true,
  },
  posts: {
    type: Array,
    default: () => [],
  },
  submissions: {
    type: Array,
    default: () => [],
  },
  submissionsLoading: {
    type: Boolean,
    default: false,
  },
  submissionsError: {
    type: String,
    default: "",
  },
});

const projectRail = ref(null);
const activeProjectIndex = ref(0);
const scrollProgress = ref(0);
const canScrollPrev = ref(false);
const canScrollNext = ref(false);
const isDragging = ref(false);

let dragStartX = 0;
let dragStartScrollLeft = 0;
let draggedRail = false;

const activeProject = computed(() => props.projects[activeProjectIndex.value] || props.projects[0]);

function syncRailState() {
  const rail = projectRail.value;
  if (!rail) return;

  const maxScroll = Math.max(rail.scrollWidth - rail.clientWidth, 0);
  scrollProgress.value = maxScroll ? Math.min(100, Math.max(0, (rail.scrollLeft / maxScroll) * 100)) : 100;
  canScrollPrev.value = rail.scrollLeft > 2;
  canScrollNext.value = rail.scrollLeft < maxScroll - 2;

  const items = [...rail.querySelectorAll(".project-rail-item")];
  if (!items.length) return;

  const railFocusEdge = rail.scrollLeft + Math.min(rail.clientWidth * 0.12, 96);
  let closestIndex = 0;
  let closestDistance = Number.POSITIVE_INFINITY;

  items.forEach((item, index) => {
    const distance = Math.abs(item.offsetLeft - railFocusEdge);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  activeProjectIndex.value = Math.min(closestIndex, props.projects.length - 1);
}

function scrollProjects(direction) {
  const rail = projectRail.value;
  if (!rail) return;

  rail.scrollBy({
    left: direction * Math.min(rail.clientWidth * 0.82, 620),
    behavior: "smooth",
  });
}

function scrollToRailEdge(edge) {
  const rail = projectRail.value;
  if (!rail) return;

  rail.scrollTo({
    left: edge === "start" ? 0 : rail.scrollWidth,
    behavior: "smooth",
  });
}

function startRailDrag(event) {
  const rail = projectRail.value;
  if (!rail || event.button !== 0) return;

  isDragging.value = true;
  draggedRail = false;
  dragStartX = event.clientX;
  dragStartScrollLeft = rail.scrollLeft;
  window.addEventListener("mousemove", moveRailDrag);
  window.addEventListener("mouseup", endRailDrag, { once: true });
}

function moveRailDrag(event) {
  const rail = projectRail.value;
  if (!rail || !isDragging.value) return;

  const deltaX = event.clientX - dragStartX;
  if (Math.abs(deltaX) > 4) {
    draggedRail = true;
    rail.scrollLeft = dragStartScrollLeft - deltaX;
    event.preventDefault();
  }
}

function endRailDrag() {
  const rail = projectRail.value;
  if (!rail || !isDragging.value) return;

  isDragging.value = false;
  window.removeEventListener("mousemove", moveRailDrag);
  window.removeEventListener("mouseup", endRailDrag);
  requestAnimationFrame(syncRailState);
  window.setTimeout(() => {
    draggedRail = false;
  }, 80);
}

function handleProjectClick(event) {
  if (!draggedRail) return;

  event.preventDefault();
  event.stopPropagation();
}

function handleRailKeydown(event) {
  if (event.key === "ArrowRight") {
    event.preventDefault();
    scrollProjects(1);
  }

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    scrollProjects(-1);
  }

  if (event.key === "Home") {
    event.preventDefault();
    scrollToRailEdge("start");
  }

  if (event.key === "End") {
    event.preventDefault();
    scrollToRailEdge("end");
  }
}

onMounted(() => {
  nextTick(syncRailState);
  window.addEventListener("resize", syncRailState);
});

onUnmounted(() => {
  window.removeEventListener("resize", syncRailState);
  window.removeEventListener("mousemove", moveRailDrag);
  window.removeEventListener("mouseup", endRailDrag);
});

watch(
  () => props.projects.length,
  () => {
    if (activeProjectIndex.value >= props.projects.length) {
      activeProjectIndex.value = Math.max(props.projects.length - 1, 0);
    }
    nextTick(syncRailState);
  },
);
</script>
