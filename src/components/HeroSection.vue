<template>
  <section class="hero entry-hero" aria-labelledby="home-title">
    <div class="hero-copy entry-panel">
      <p class="hero-pill">一个开放的 vibe coding 创作者社区基础设施</p>
      <h1 id="home-title" class="brand-number" aria-label="4399123">
        <span class="brand-number-inner" aria-hidden="true">
          <span
            v-for="digit in brandDigits"
            :key="digit.index"
            class="brand-digit"
            :style="{ '--digit-index': digit.index }"
          >
            {{ digit.value }}
          </span>
        </span>
      </h1>
      <form class="hero-search" action="/blog" method="get" role="search">
        <label class="sr-only" for="home-search">搜索文章、项目、灵感碎片</label>
        <input
          id="home-search"
          name="q"
          type="search"
          placeholder="搜索文章、项目、灵感碎片..."
          autocomplete="off"
        />
        <button type="submit" aria-label="搜索">
          <span aria-hidden="true">→</span>
        </button>
      </form>
      <p>连接创作者、项目、想法和社区反馈。</p>
      <a class="hero-scroll-link" href="#latest-content">最新内容</a>
    </div>
  </section>
</template>

<script setup>
import { brandDigits } from "../data/site";
</script>
