<template>
  <section class="hero entry-hero" aria-labelledby="home-title">
    <div class="hero-copy entry-panel">
      <p class="hero-pill">一个开放的 vibe coding 创作者社区基础设施</p>
      <h1 id="home-title">4399123</h1>
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
