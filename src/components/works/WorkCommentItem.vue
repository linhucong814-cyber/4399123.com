<template>
  <article class="work-comment-item">
    <header>
      <a v-if="comment.author" class="work-comment-author" :href="`/users/${comment.author.id}`">@{{ comment.author.username }}</a>
      <span v-else class="work-comment-author is-deleted">已删除</span>
      <time :datetime="comment.createdAt">{{ formatTime(comment.createdAt) }}</time>
    </header>
    <p :class="{ 'is-deleted': comment.isDeleted }">{{ comment.body }}</p>
    <div v-if="!comment.isDeleted" class="work-comment-tools">
      <button type="button" @click="$emit('reply')">回复</button>
      <button v-if="comment.canDelete" type="button" @click="$emit('delete')">删除</button>
    </div>
  </article>
</template>

<script setup>
defineProps({ comment: { type: Object, required: true } });
defineEmits(["reply", "delete"]);

function formatTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false });
}
</script>
