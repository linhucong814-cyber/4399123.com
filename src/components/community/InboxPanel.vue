<template>
  <section class="inbox-panel" :class="{ open: isOpen }" aria-label="社区消息信箱">
    <button class="inbox-toggle" type="button" @click="$emit('toggle')">
      <span>
        <b>消息信箱</b>
        <small>{{ unreadCount ? `${unreadCount} 条未读` : "暂无未读" }}</small>
      </span>
      <strong>{{ isOpen ? "收起" : "查看" }}</strong>
    </button>
    <div v-if="isOpen" class="inbox-list">
      <div class="inbox-actions">
        <p>{{ notifications.length ? "有人回复或点赞你的内容时，会出现在这里。" : "暂时没有社区消息。" }}</p>
        <button v-if="unreadCount" class="secondary-link small-action" type="button" @click="$emit('mark-all-read')">
          全部已读
        </button>
      </div>
      <p v-if="error" class="form-message error-state" role="alert">
        {{ error }}
        <button class="text-action" type="button" @click="$emit('retry')">重试</button>
      </p>
      <a
        v-for="notification in notifications"
        :key="notification.id"
        class="inbox-item"
        :class="{ unread: !notification.isRead }"
        :href="notification.post.url"
        @click.prevent="$emit('open-notification', notification)"
      >
        <div>
          <strong>{{ notification.title }}</strong>
          <p>{{ notification.body }}</p>
        </div>
        <time :datetime="notification.createdAt">{{ formatTime(notification.createdAt) }}</time>
      </a>
    </div>
  </section>
</template>

<script setup>
import { formatTime } from "./helpers.js";

defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  unreadCount: {
    type: Number,
    default: 0,
  },
  notifications: {
    type: Array,
    default: () => [],
  },
  error: {
    type: String,
    default: "",
  },
});

defineEmits(["toggle", "mark-all-read", "retry", "open-notification"]);
</script>
