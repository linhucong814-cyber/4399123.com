<template>
  <div v-if="open" class="admin-modal-backdrop" @click.self="$emit('cancel')">
    <div class="admin-modal" role="dialog" aria-modal="true">
      <h3>{{ title }}</h3>
      <p v-if="message" class="admin-modal-message">{{ message }}</p>
      <label v-if="withReason" class="field-label">
        {{ reasonLabel }}
        <textarea :value="reason" rows="3" maxlength="500" :placeholder="reasonPlaceholder" @input="$emit('update:reason', $event.target.value)" />
      </label>
      <p v-if="error" class="form-message error-state">{{ error }}</p>
      <div class="admin-modal-actions">
        <button class="secondary-link compact-action" type="button" :disabled="busy" @click="$emit('cancel')">取消</button>
        <button class="primary-link compact-action" type="button" :disabled="busy" @click="$emit('confirm')">
          {{ busy ? "处理中..." : confirmLabel }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: "确认操作" },
  message: { type: String, default: "" },
  withReason: { type: Boolean, default: true },
  reason: { type: String, default: "" },
  reasonLabel: { type: String, default: "原因（将写入审计日志）" },
  reasonPlaceholder: { type: String, default: "选填，说明本次操作的原因" },
  confirmLabel: { type: String, default: "确认" },
  busy: { type: Boolean, default: false },
  error: { type: String, default: "" },
});
defineEmits(["confirm", "cancel", "update:reason"]);
</script>

<style scoped>
.admin-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(12, 20, 16, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 1000;
}
.admin-modal {
  background: var(--surface, #fff);
  color: var(--text, #17211d);
  border-radius: 14px;
  padding: 24px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.25);
}
.admin-modal h3 {
  margin: 0 0 12px;
}
.admin-modal-message {
  margin: 0 0 16px;
  line-height: 1.6;
}
.admin-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}
</style>
