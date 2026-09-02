<template>
  <div v-if="pagination && pagination.totalPages > 1" class="admin-pager">
    <button class="secondary-link compact-action" type="button" :disabled="pagination.page <= 1" @click="$emit('change', pagination.page - 1)">
      上一页
    </button>
    <span class="admin-pager-info">第 {{ pagination.page }} / {{ pagination.totalPages }} 页 · 共 {{ pagination.total }} 条</span>
    <button
      class="secondary-link compact-action"
      type="button"
      :disabled="pagination.page >= pagination.totalPages"
      @click="$emit('change', pagination.page + 1)"
    >
      下一页
    </button>
  </div>
</template>

<script setup>
defineProps({
  pagination: {
    type: Object,
    default: null,
  },
});
defineEmits(["change"]);
</script>

<style scoped>
.admin-pager {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  flex-wrap: wrap;
}
.admin-pager-info {
  font-size: 0.9rem;
  color: var(--muted, #5d6b63);
}
</style>
