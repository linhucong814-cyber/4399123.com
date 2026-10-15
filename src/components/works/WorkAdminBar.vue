<template>
  <section class="work-admin-bar" aria-label="管理员操作">
    <strong>管理</strong>
    <button type="button" :class="{ active: work.isFeatured }" :aria-pressed="work.isFeatured" :disabled="busy" @click="save({ isFeatured: !work.isFeatured })">
      {{ work.isFeatured ? "取消精选" : "设为精选" }}
    </button>
    <label>
      分类
      <select :value="work.category" :disabled="busy" @change="save({ category: $event.target.value })">
        <option v-for="item in workCategories" :key="item.value" :value="item.value">{{ item.label }}</option>
      </select>
    </label>
    <span v-if="message" class="work-admin-message" role="status">{{ message }}</span>
  </section>
</template>

<script setup>
import { ref } from "vue";
import { workCategories } from "../../data/workCategories";
import { adminUpdateWork } from "../../services/works";

const props = defineProps({ work: { type: Object, required: true } });
const emit = defineEmits(["updated"]);
const busy = ref(false);
const message = ref("");

async function save(payload) {
  busy.value = true;
  message.value = "";
  try {
    const data = await adminUpdateWork(props.work.slug, payload);
    emit("updated", data.work);
    message.value = "已保存";
  } catch (err) {
    message.value = err.message || "保存失败";
  } finally {
    busy.value = false;
  }
}
</script>
