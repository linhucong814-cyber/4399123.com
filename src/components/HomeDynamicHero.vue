<template>
  <section
    class="home-dynamic-hero content-section"
    aria-labelledby="home-dynamic-title"
    @pointermove="handlePointerMove"
    @pointerleave="resetPointer"
  >
    <h1 id="home-dynamic-title" class="sr-only">4399123 动态首页视觉</h1>
    <div
      class="home-dynamic-scene"
      :style="{
        '--pointer-x': `${pointer.x}px`,
        '--pointer-y': `${pointer.y}px`,
      }"
      aria-hidden="true"
    >
      <img
        class="home-dynamic-bg"
        src="/assets/home-dynamic/home-dynamic-bg.webp"
        alt=""
        draggable="false"
      />

      <div class="home-dynamic-orbit orbit-one" />
      <div class="home-dynamic-orbit orbit-two" />

      <span
        v-for="particle in particles"
        :key="particle.id"
        class="home-dynamic-particle"
        :style="particle.style"
      />

      <div class="home-dynamic-logo-stage">
        <span class="home-dynamic-logo-aura" />
        <img
          class="home-dynamic-logo"
          src="/assets/brand/4399123-domain-logo-transparent.png"
          alt=""
          draggable="false"
        />
      </div>

      <div class="home-dynamic-messenger">
        <img
          src="/assets/home-dynamic/home-messenger-loop.webp"
          alt=""
          draggable="false"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { reactive } from "vue";

const pointer = reactive({ x: 0, y: 0 });

const particles = Array.from({ length: 18 }, (_, index) => ({
  id: index,
  style: {
    "--x": `${8 + ((index * 19) % 84)}%`,
    "--y": `${12 + ((index * 29) % 74)}%`,
    "--delay": `${(index % 7) * -0.48}s`,
    "--size": `${6 + (index % 4) * 3}px`,
    "--hue": `${index % 4}`,
  },
}));

function handlePointerMove(event) {
  const rect = event.currentTarget.getBoundingClientRect();
  pointer.x = clamp(((event.clientX - rect.left) / rect.width - 0.5) * 24, -12, 12);
  pointer.y = clamp(((event.clientY - rect.top) / rect.height - 0.5) * 18, -9, 9);
}

function resetPointer() {
  pointer.x = 0;
  pointer.y = 0;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
</script>
