<template>
  <aside class="community-rail" aria-label="社区快捷入口">
    <a class="rail-link active" href="/community">主页</a>
    <button class="rail-link" type="button" :aria-expanded="isLoggedIn ? composerExpanded : null" :aria-controls="isLoggedIn ? 'community-post-composer' : null" @click="$emit('focus-composer')">{{ composerLabel }}</button>
    <a v-if="isLoggedIn" class="rail-link" href="/community?inbox=1">消息</a>
    <a v-else class="rail-link" :href="loginHref">登录</a>
  </aside>
</template>

<script setup>
defineProps({
  composerExpanded: {
    type: Boolean,
    default: false,
  },
  composerLabel: {
    type: String,
    default: "发帖",
  },
  isLoggedIn: {
    type: Boolean,
    default: false,
  },
  loginHref: {
    type: String,
    default: "/login",
  },
});

defineEmits(["focus-composer"]);
</script>
