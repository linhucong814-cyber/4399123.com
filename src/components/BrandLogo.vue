<template>
  <a class="logo-mark" :href="href" :aria-label="ariaLabel">
    <img :src="logo.src" :alt="logo.alt" />
  </a>
</template>

<script setup>
import { brandLogo } from "../data/site";

defineProps({
  href: {
    type: String,
    default: "/",
  },
  ariaLabel: {
    type: String,
    default: "4399123 首页",
  },
});

const logo = brandLogo;
</script>
