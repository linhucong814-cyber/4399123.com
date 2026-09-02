<template>
  <aside class="community-rail" aria-label="社区快捷入口">
    <a class="rail-link active" href="/community">信息流</a>
    <button class="rail-link" type="button" @click="$emit('focus-composer')">{{ composerLabel }}</button>
    <a v-if="isLoggedIn" class="rail-link" href="/community?inbox=1">消息</a>
    <a v-else class="rail-link" :href="loginHref">登录</a>
  </aside>
</template>

<script setup>
defineProps({
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
