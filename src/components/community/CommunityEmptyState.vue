<template>
  <section class="community-empty-state">
    <div class="community-empty-head">
      <p class="eyebrow">{{ eyebrow }}</p>
      <h2>{{ title }}</h2>
      <p>{{ body }}</p>
    </div>
    <div class="community-prompt-grid">
      <button
        v-for="prompt in prompts"
        :key="prompt.title"
        class="community-prompt-card"
        type="button"
        @click="$emit('use-prompt', prompt)"
      >
        <span>{{ prompt.kicker }}</span>
        <strong>{{ prompt.title }}</strong>
        <small>{{ prompt.body }}</small>
      </button>
    </div>
  </section>
</template>

<script setup>
defineProps({
  eyebrow: {
    type: String,
    default: "",
  },
  title: {
    type: String,
    default: "",
  },
  body: {
    type: String,
    default: "",
  },
  prompts: {
    type: Array,
    default: () => [],
  },
});

defineEmits(["use-prompt"]);
</script>
