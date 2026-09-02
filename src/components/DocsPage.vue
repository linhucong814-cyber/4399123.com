<template>
  <section class="docs-page" aria-labelledby="docs-title">
    <header class="docs-hero">
      <div class="docs-hero-copy">
        <p class="docs-kicker">
          <span>Docs</span>
          <span>01 / About 4399123</span>
        </p>
        <h1 id="docs-title">为了<span>创造想法</span>而生</h1>
        <p class="docs-hero-lede">
          4399123 是一个为「创造想法」而生的 Vibecoding 社区与 AI 创作工作台。
        </p>
        <div class="docs-hero-actions" aria-label="文档快捷入口">
          <a class="docs-primary-action" href="/vibe-coding">浏览作品</a>
          <a class="docs-text-action" href="/community">进入社区 <span aria-hidden="true">↗</span></a>
        </div>
      </div>

      <aside class="docs-creation-loop" aria-label="4399123 创作路径">
        <div class="docs-loop-head">
          <span>Creation loop</span>
          <span>Idea → Share</span>
        </div>
        <ol>
          <li>
            <span>01</span>
            <strong>Idea</strong>
            <small>提出想法</small>
          </li>
          <li>
            <span>02</span>
            <strong>Build</strong>
            <small>做成作品</small>
          </li>
          <li>
            <span>03</span>
            <strong>Share</strong>
            <small>分享迭代</small>
          </li>
        </ol>
        <p>Natural language in. An experience out.</p>
      </aside>
    </header>

    <div class="docs-layout">
      <aside class="docs-toc" aria-label="此页目录">
        <p>此页内容</p>
        <nav>
          <a href="#creative-space"><span>01</span>创造空间</a>
          <a href="#mission"><span>02</span>我们的初衷</a>
          <a href="#creators"><span>03</span>每一位创造者</a>
          <a href="#belief"><span>04</span>我们相信</a>
        </nav>
      </aside>

      <article class="docs-article">
        <section id="creative-space" v-reveal="0" class="docs-section">
          <p class="docs-section-index">01 / Creative space</p>
          <h2>不止是 prompt-to-output</h2>
          <p>
            它不只是一个简单的 prompt-to-output 工具，而是一个从 idea-to-build-to-share 的创造空间：你可以用自然语言描述一个想法，借助 AI Agent、Vibe Coding、产品策略、原型设计、代码生成与运行，把脑海里模糊的灵感一步步变成可以体验、可以迭代、可以交付的作品。
          </p>
          <div class="docs-process" aria-label="从想法到分享">
            <span>idea</span>
            <i aria-hidden="true"></i>
            <span>build</span>
            <i aria-hidden="true"></i>
            <span>share</span>
          </div>
        </section>

        <section id="mission" v-reveal="1" class="docs-section docs-section--split">
          <p class="docs-section-index">02 / Mission</p>
          <h2>让人人都可以实现自己的想法</h2>
          <p>
            4399123.com 的初衷很简单：为了创造想法而做，让人人都可以实现自己的想法。
          </p>
        </section>

        <section id="creators" v-reveal="2" class="docs-section">
          <p class="docs-section-index">03 / For everyone</p>
          <h2>创造者，可以是任何人</h2>
          <p>
            无论你是产品经理、设计师、创业者、开发者，还是只是一个有灵感、有表达欲、有创造冲动的普通人，都可以在这里跳过复杂的工具链和技术门槛，专注于真正重要的事：把想法创造出来。
          </p>
          <ul class="docs-roles" aria-label="适合的人群">
            <li>产品经理</li>
            <li>设计师</li>
            <li>创业者</li>
            <li>开发者</li>
            <li>每一个有想法的人</li>
          </ul>
        </section>

        <section id="belief" v-reveal="3" class="docs-belief">
          <p class="docs-section-index">04 / What we believe</p>
          <h2>从「我有一个想法」<br />到「我把它实现了」</h2>
          <p>
            我们相信，未来的创造不只属于少数会写代码、会设计、会运营的人，而属于每一个愿意提出想法、验证想法、推动想法的人。4399123 希望成为这样的起点：让「我有一个想法」最终变成「我把它实现了」。
          </p>
          <a href="/vibe-coding/share">分享你的作品 <span aria-hidden="true">→</span></a>
        </section>
      </article>
    </div>
  </section>
</template>

<script setup>
import { setPageSeo } from "../utils/seo";

const description =
  "4399123 是一个为创造想法而生的 Vibecoding 社区与 AI 创作工作台，让想法从 idea 走向 build 与 share。";

setPageSeo({
  title: "文档",
  description,
  path: "/docs",
  jsonLd: {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "关于 4399123",
    description,
    url: "https://4399123.com/docs",
    inLanguage: "zh-CN",
    isPartOf: {
      "@type": "WebSite",
      name: "4399123",
      url: "https://4399123.com",
    },
  },
});
</script>
