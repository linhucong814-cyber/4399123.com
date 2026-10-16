<template>
  <div class="work-preview" :class="{ 'is-fullscreen': fullscreen }">
    <div class="work-preview-bar">
      <span class="work-preview-dot" aria-hidden="true"></span>
      <span class="work-preview-url">{{ displayUrl }}</span>
      <button v-if="canEmbed" class="secondary-link compact-action" type="button" @click="fullscreen = !fullscreen">
        {{ fullscreen ? "退出全屏" : "全屏" }}
      </button>
      <a class="primary-link compact-action" :href="url" target="_blank" rel="noopener noreferrer">新窗口打开</a>
    </div>
    <iframe
      v-if="canEmbed && started"
      class="work-preview-frame"
      :src="url"
      :title="`${title} 在线预览`"
      :sandbox="sandbox"
      referrerpolicy="no-referrer"
      loading="lazy"
      allow="fullscreen"
    ></iframe>
    <button v-else-if="canEmbed" class="work-preview-start" type="button" @click="started = true">
      <img v-if="cover" :src="cover" :alt="title" />
      <span class="primary-link compact-action">▶ 在线体验</span>
    </button>
    <div v-else class="work-preview-fallback">
      <img v-if="cover" :src="cover" :alt="title" />
      <p>这个作品不支持嵌入预览，请在新窗口中打开。</p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  url: { type: String, default: "" },
  title: { type: String, default: "" },
  cover: { type: String, default: "" },
  embeddable: { type: Boolean, default: true },
  // Curated third-party works (site-reviewed, cross-origin demo). Their own origin is kept so
  // module scripts and localStorage work; being cross-origin they still cannot reach this site.
  ownOrigin: { type: Boolean, default: false },
});

// Click-to-load keeps third-party pages from running until the visitor opts in.
const started = ref(false);
const fullscreen = ref(false);
const canEmbed = computed(() => props.embeddable && Boolean(props.url));
// External works never get allow-same-origin, so they cannot read this site's cookies or DOM.
// Same-site official projects (relative URLs) need storage access to work, and are trusted.
const sandbox = computed(() => {
  const base = "allow-scripts allow-forms allow-popups allow-pointer-lock allow-modals";
  // Self-hosted copies of third-party games (/play/<slug>/) live on this origin, so they must
  // never get allow-same-origin: they run as an opaque origin (the server also sends a CSP
  // sandbox for /play/*, which covers 新窗口打开 as well).
  if (isPlayCopy(props.url)) return base;
  const sameSite = props.url.startsWith("/") && !props.url.startsWith("//");
  const crossOriginTrusted = props.ownOrigin && /^https:\/\//.test(props.url);
  return sameSite || crossOriginTrusted ? `${base} allow-same-origin` : base;
});
const displayUrl = computed(() => (isPlayCopy(props.url) ? `4399123.com${props.url}` : props.url.replace(/^https?:\/\//, "")));

function isPlayCopy(url) {
  return /^\/play\//.test(url);
}
</script>
