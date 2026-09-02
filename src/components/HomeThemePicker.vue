<template>
  <div ref="root" class="site-nav-home-theme" :class="{ 'is-open': isThemePickerOpen }">
    <button
      v-if="!isThemePickerOpen"
      class="site-nav-home-theme__trigger"
      type="button"
      aria-haspopup="dialog"
      :aria-expanded="false"
      aria-label="展开背景风格选择"
      @click="openPicker"
    >
      <span class="site-nav-home-theme__dot" :style="{ background: activeTheme.accent }" aria-hidden="true"></span>
      <span class="site-nav-home-theme__trigger-label">背景 · {{ activeTheme.shortName }}</span>
      <span class="site-nav-home-theme__chevron" aria-hidden="true">⌄</span>
    </button>

    <section
      v-else
      class="site-nav-home-theme__panel"
      role="dialog"
      aria-label="背景风格选择"
      aria-modal="false"
    >
      <div class="site-nav-home-theme__heading">
        <div>
          <span class="site-nav-home-theme__kicker">背景风格</span>
          <strong>{{ activeTheme.name }}</strong>
        </div>
        <button
          class="site-nav-home-theme__close"
          type="button"
          aria-label="收起背景风格"
          @click="closePicker"
        >×</button>
      </div>
      <div class="site-nav-home-theme__options" role="radiogroup" aria-label="选择首页背景">
        <button
          v-for="theme in backgroundThemes"
          :key="theme.id"
          type="button"
          class="site-nav-home-theme__option"
          :class="{ 'is-active': activeThemeId === theme.id }"
          role="radio"
          :aria-checked="activeThemeId === theme.id"
          :aria-label="theme.name"
          @click="chooseTheme(theme.id)"
        >
          <img :src="theme.image" :alt="theme.alt" loading="lazy" />
          <span>{{ theme.shortName }}</span>
        </button>
      </div>
      <span class="site-nav-home-theme__hint">使用 ← → 切换 · 选择后自动收起</span>
    </section>
  </div>
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, ref } from "vue";
import {
  activeTheme,
  activeThemeId,
  backgroundThemes,
  isThemePickerOpen,
  selectTheme,
} from "./homeThemeState";

const root = ref(null);

function openPicker() {
  isThemePickerOpen.value = true;
  nextTick(() => root.value?.querySelector(".site-nav-home-theme__option.is-active")?.focus());
}

function closePicker() {
  isThemePickerOpen.value = false;
}

function chooseTheme(themeId) {
  selectTheme(themeId);
  closePicker();
}

function handlePointerDown(event) {
  if (isThemePickerOpen.value && root.value && !root.value.contains(event.target)) {
    closePicker();
  }
}

function handleKeydown(event) {
  if (event.key === "Escape") closePicker();
}

onMounted(() => {
  document.addEventListener("pointerdown", handlePointerDown);
  window.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("pointerdown", handlePointerDown);
  window.removeEventListener("keydown", handleKeydown);
});
</script>
