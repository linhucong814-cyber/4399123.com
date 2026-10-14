<template>
  <AboutContent />
</template>

<script setup>
import AboutContent from "./AboutContent.vue";
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
