<template>
  <section :id="embedded ? 'about' : undefined" class="docs-page" :class="{ 'docs-page--embedded': embedded }" aria-labelledby="docs-title">
    <header class="docs-hero">
      <div class="docs-hero-copy">
        <p class="docs-kicker">
          <span>{{ embedded ? "About" : "Docs" }}</span>
          <span>01 / About 4399123</span>
        </p>
        <component :is="embedded ? 'h2' : 'h1'" id="docs-title" class="docs-hero-title">为了<span>创造想法</span>而生</component>
        <p class="docs-hero-lede">{{ aboutContent.lede }}</p>
        <div class="docs-hero-actions" aria-label="关于 4399123 快捷入口">
          <a class="docs-primary-action" href="/works">浏览作品</a>
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
      <aside class="docs-toc" aria-label="关于 4399123 的目录">
        <p>内容目录</p>
        <nav>
          <a v-for="section in aboutContent.sections" :key="section.id" :href="`#${section.id}`">
            <span>{{ section.index.slice(0, 2) }}</span>{{ section.label }}
          </a>
        </nav>
      </aside>

      <article class="docs-article">
        <section
          v-for="(section, index) in aboutContent.sections"
          :id="section.id"
          :key="section.id"
          v-reveal="index"
          :class="section.id === 'belief' ? 'docs-belief' : ['docs-section', { 'docs-section--split': section.id === 'mission' }]"
        >
          <p class="docs-section-index">{{ section.index }}</p>
          <component :is="embedded ? 'h3' : 'h2'" class="docs-section-title">
            <template v-for="(line, lineIndex) in section.titleLines" :key="line">
              <br v-if="lineIndex" />{{ line }}
            </template>
          </component>
          <p>{{ section.body }}</p>
          <div v-if="section.id === 'creative-space'" class="docs-process" aria-label="从想法到分享">
            <span>idea</span><i aria-hidden="true"></i><span>build</span><i aria-hidden="true"></i><span>share</span>
          </div>
          <ul v-if="section.id === 'creators'" class="docs-roles" aria-label="适合的人群">
            <li v-for="role in aboutContent.roles" :key="role">{{ role }}</li>
          </ul>
          <a v-if="section.id === 'belief'" href="/vibe-coding/share">分享你的作品 <span aria-hidden="true">→</span></a>
        </section>
      </article>
    </div>
  </section>
</template>

<script setup>
import { aboutContent } from "../data/about.mjs";

defineProps({ embedded: { type: Boolean, default: false } });
</script>
