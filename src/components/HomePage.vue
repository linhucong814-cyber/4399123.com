<template>
  <HeroSection />

  <section id="latest-content" class="content-section home-latest-section" aria-labelledby="latest-heading">
    <div class="section-head">
      <div>
        <p class="eyebrow">Latest</p>
        <h2 id="latest-heading">最新内容</h2>
      </div>
      <a class="secondary-link compact-action" href="/blog">查看全部</a>
    </div>
    <div class="content-grid">
      <a
        v-for="post in latestPosts"
        :key="post.slug"
        class="content-card"
        :href="postHref(post)"
      >
        <p class="blog-date">{{ post.date }}</p>
        <h3>{{ post.title }}</h3>
        <p>{{ post.summary }}</p>
        <div class="tag-row">
          <span v-for="tag in post.tags" :key="tag">{{ tag }}</span>
        </div>
        <strong>阅读全文</strong>
      </a>
    </div>
  </section>

  <section class="content-section" aria-labelledby="thoughts-heading">
    <div class="section-head">
      <div>
        <p class="eyebrow">Ideas</p>
        <h2 id="thoughts-heading">Vibe Coding 想法</h2>
      </div>
      <p class="section-summary">
        快速记录那些还没长成项目、但值得被留下来的 AI/编程灵感。
      </p>
    </div>
    <div class="note-list">
      <a
        v-for="post in thoughts"
        :key="post.slug"
        class="note-row"
        :href="postHref(post)"
      >
        <span>{{ post.date }}</span>
        <strong>{{ post.title }}</strong>
        <small>{{ post.summary }}</small>
      </a>
    </div>
  </section>

  <BranchSection :projects="projects" />

  <section class="content-section two-column-section">
    <article class="about-panel">
      <p class="eyebrow">Interesting</p>
      <h2>有趣分享</h2>
      <a
        v-for="item in interesting"
        :key="item.slug"
        class="share-link"
        :href="postHref(item)"
      >
        <strong>{{ item.title }}</strong>
        <span>{{ item.summary }}</span>
      </a>
    </article>

    <article class="about-panel">
      <p class="eyebrow">About</p>
      <h2>关于 4399123</h2>
      <p>
        这里是一个个人实验场：发布 vibe coding 小想法、AI/编程实验、项目记录和偶然发现的有趣东西。
        它不追求企业官网式的完整包装，更像一张持续生长的工作台。
      </p>
      <a class="text-button" href="/rss.xml">订阅 RSS</a>
    </article>
  </section>
</template>

<script setup>
import { computed } from "vue";
import BranchSection from "./BranchSection.vue";
import HeroSection from "./HeroSection.vue";
import { interestingItems, thoughtPosts } from "../data/content";

const props = defineProps({
  projects: {
    type: Array,
    required: true,
  },
});

const latestPosts = computed(() => [...thoughtPosts, ...interestingItems].slice(0, 4));
const thoughts = computed(() => thoughtPosts.slice(0, 4));
const interesting = computed(() => interestingItems.slice(0, 2));

function postHref(post) {
  return `/blog/${encodeURIComponent(post.slug)}`;
}
</script>
