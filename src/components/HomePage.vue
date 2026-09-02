<template>
  <section
    class="minimal-home"
    aria-labelledby="home-title"
    :style="homeStyle"
    @pointermove="handlePointerMove"
    @pointerleave="resetPointer"
  >
    <h1 id="home-title" class="minimal-home__wordmark" aria-label="4399123">
      <span
        v-for="(digit, index) in digits"
        :key="`${digit}-${index}`"
        :style="{ '--digit-index': index }"
        aria-hidden="true"
      >{{ digit }}</span>
    </h1>

    <p class="minimal-home__tagline">
      为创造想法而生的 <span class="minimal-home__accent">Vibe Coding</span> 社区
    </p>
    <p class="minimal-home__lede">
      把 AI 与 Vibe Coding 的想法做成可直接点击的作品，在作品、博客与社区讨论之间持续迭代。
    </p>

    <div class="minimal-home__actions">
      <a class="minimal-home__cta minimal-home__cta--primary" href="/vibe-coding">浏览作品</a>
      <a class="minimal-home__cta" href="/community">进入社区</a>
      <a class="minimal-home__cta" href="/docs">了解 4399123</a>
    </div>

  </section>

  <section class="home-latest" aria-label="最新内容">
    <div class="home-latest__col">
      <div class="home-latest__head">
        <h2>最新作品</h2>
        <a class="home-latest__more" href="/vibe-coding">全部作品 →</a>
      </div>
      <ul class="home-latest__list">
        <li v-for="project in latestProjects" :key="project.slug">
          <a class="home-latest__item" :href="projectHref(project)">
            <span class="home-latest__date">{{ project.date }}</span>
            <span class="home-latest__title">{{ project.title }}</span>
            <span class="home-latest__summary">{{ project.summary }}</span>
          </a>
        </li>
      </ul>
    </div>

    <div class="home-latest__col">
      <div class="home-latest__head">
        <h2>最新博客</h2>
        <a class="home-latest__more" href="/blog">全部博客 →</a>
      </div>
      <ul class="home-latest__list">
        <li v-for="post in latestPosts" :key="post.slug">
          <a class="home-latest__item" :href="`/blog/${encodeURIComponent(post.slug)}`">
            <span class="home-latest__date">{{ post.date }}</span>
            <span class="home-latest__title">{{ post.title }}</span>
            <span class="home-latest__summary">{{ post.summary }}</span>
          </a>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { projectItems, thoughtPosts } from "../data/content";
import {
  activeTheme,
  cycleTheme,
} from "./homeThemeState";

const digits = "4399123".split("");
const pointerStyle = ref({ "--home-x": "0px", "--home-y": "0px" });
const homeStyle = computed(() => ({
  ...pointerStyle.value,
  "--home-bg-image": `url("${activeTheme.value.image}")`,
  "--home-bg-overlay": activeTheme.value.overlay,
  "--home-ink": activeTheme.value.ink,
  "--home-muted": activeTheme.value.muted,
  "--home-accent": activeTheme.value.accent,
  "--home-cta-bg": activeTheme.value.ctaBg,
  "--home-cta-fg": activeTheme.value.ctaFg,
}));

const latestProjects = projectItems.slice(0, 3);
const latestPosts = thoughtPosts.slice(0, 3);

onMounted(() => window.addEventListener("keydown", handleThemeKeydown));
onUnmounted(() => window.removeEventListener("keydown", handleThemeKeydown));

function handleThemeKeydown(event) {
  if (event.key === "ArrowRight") cycleTheme(1);
  if (event.key === "ArrowLeft") cycleTheme(-1);
}

function projectHref(project) {
  return project.href || `/blog/${encodeURIComponent(project.slug)}`;
}

function handlePointerMove(event) {
  if (window.matchMedia?.("(prefers-reduced-motion: reduce), (pointer: coarse)").matches) return;

  const rect = event.currentTarget.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width - 0.5) * 12;
  const y = ((event.clientY - rect.top) / rect.height - 0.5) * 10;
  pointerStyle.value = {
    "--home-x": `${x.toFixed(2)}px`,
    "--home-y": `${y.toFixed(2)}px`,
  };
}

function resetPointer() {
  pointerStyle.value = { "--home-x": "0px", "--home-y": "0px" };
}
</script>
