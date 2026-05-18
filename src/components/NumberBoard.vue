<template>
  <div class="number-board" aria-label="4399123 数字标识">
    <img :src="logo.src" :alt="logo.alt" />
  </div>
</template>

<script setup>
import { brandLogo } from "../data/site";

const logo = brandLogo;
</script>
