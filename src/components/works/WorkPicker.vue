<template>
  <div class="work-picker">
    <div v-if="modelValue" class="work-picker-selected">
      <WorkIcon :work="modelValue" :size="36" />
      <span><small>关联作品</small><strong>{{ modelValue.title }}</strong></span>
      <button type="button" @click="$emit('update:modelValue', null)">移除</button>
    </div>
    <template v-else>
      <label class="work-picker-label" :for="inputId">关联作品（可选）</label>
      <input
        :id="inputId"
        v-model.trim="query"
        type="search"
        maxlength="80"
        placeholder="搜索作品名"
        autocomplete="off"
        @input="schedule"
      />
      <ul v-if="query && results.length" class="work-picker-results" role="listbox">
        <li v-for="work in results" :key="work.id">
          <button type="button" role="option" @click="choose(work)">
            <WorkIcon :work="work" :size="28" />
            <span>{{ work.title }}</span>
          </button>
        </li>
      </ul>
      <p v-else-if="query && searched && !loading" class="work-picker-empty">没有找到匹配的公开作品。</p>
    </template>
  </div>
</template>

<script setup>
import { onUnmounted, ref } from "vue";
import WorkIcon from "./WorkIcon.vue";
import { getWorks } from "../../services/works";

defineProps({ modelValue: { type: Object, default: null } });
const emit = defineEmits(["update:modelValue"]);

const inputId = `work-picker-${Math.random().toString(36).slice(2, 8)}`;
const query = ref("");
const results = ref([]);
const loading = ref(false);
const searched = ref(false);
let timer = 0;

onUnmounted(() => window.clearTimeout(timer));

function schedule() {
  window.clearTimeout(timer);
  timer = window.setTimeout(search, 250);
}

async function search() {
  const q = query.value;
  if (!q) {
    results.value = [];
    return;
  }
  loading.value = true;
  try {
    const data = await getWorks({ q, pageSize: 6 });
    if (q === query.value) results.value = Array.isArray(data.works) ? data.works : [];
  } catch {
    results.value = [];
  } finally {
    loading.value = false;
    searched.value = true;
  }
}

function choose(work) {
  emit("update:modelValue", work);
  query.value = "";
  results.value = [];
}

defineExpose({ search });
</script>
