<template>
  <section class="auth-page">
    <div class="section-head blog-page-head">
      <div>
        <p class="eyebrow">Admin</p>
        <h2>星球信使记录</h2>
      </div>
      <a class="secondary-link compact-action" href="/account">返回账号</a>
    </div>

    <form class="admin-filter-row game-filter-row" @submit.prevent="applyFilters">
      <label>
        <span>开始日期</span>
        <input v-model="filters.from" type="date" />
      </label>
      <label>
        <span>结束日期</span>
        <input v-model="filters.to" type="date" />
      </label>
      <label>
        <span>用户或匿名 ID</span>
        <input v-model.trim="filters.user" type="search" placeholder="userId / anonymousId" />
      </label>
      <label>
        <span>完成状态</span>
        <select v-model="filters.completed">
          <option value="">全部</option>
          <option value="true">已完成</option>
          <option value="false">未完成</option>
        </select>
      </label>
      <button class="primary-link compact-action" type="submit">筛选</button>
    </form>

    <div v-if="isLoading" class="blog-state">正在加载游戏记录...</div>
    <div v-else-if="error" class="blog-state error-state">{{ error }}</div>
    <div v-else class="admin-table-wrap">
      <p v-if="warning" class="inline-state">{{ warning }}</p>
      <table class="admin-user-table game-record-table">
        <thead>
          <tr>
            <th>记录 ID</th>
            <th>用户</th>
            <th>得分</th>
            <th>灵感</th>
            <th>纸条</th>
            <th>时长</th>
            <th>设备</th>
            <th>完成</th>
            <th>创建时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in records" :key="record.id || record.startedAt">
            <td>{{ record.id || "暂无" }}</td>
            <td>{{ userLabel(record) }}</td>
            <td>{{ numberLabel(record.score) }}</td>
            <td>{{ numberLabel(record.collectCount) }}</td>
            <td>{{ numberLabel(record.noteCount) }}</td>
            <td>{{ durationLabel(record.durationMs) }}</td>
            <td>{{ record.deviceType || "未知" }}</td>
            <td>{{ record.completed === false ? "否" : "是" }}</td>
            <td>{{ formatTime(record.createdAt || record.endedAt) }}</td>
          </tr>
        </tbody>
      </table>
      <p v-if="!records.length" class="blog-state">暂无游戏记录。</p>
      <div class="game-pagination" aria-label="游戏记录分页">
        <button class="secondary-link compact-action" type="button" :disabled="page <= 1" @click="changePage(-1)">
          上一页
        </button>
        <span>第 {{ page }} 页 / 共 {{ totalPages }} 页</span>
        <button class="secondary-link compact-action" type="button" :disabled="page >= totalPages" @click="changePage(1)">
          下一页
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { getStarMessengerRecords } from "../../services/game";
import { setPageSeo } from "../../utils/seo";

const pageSize = 20;
const page = ref(1);
const total = ref(0);
const records = ref([]);
const isLoading = ref(true);
const error = ref("");
const warning = ref("");
const filters = reactive({
  from: "",
  to: "",
  user: "",
  completed: "",
});

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)));

setPageSeo({
  title: "星球信使记录后台",
  description: "查看 4399123.com 首页小游戏的用户游戏数据。",
  path: "/admin/game-records",
});

onMounted(loadRecords);

async function loadRecords() {
  isLoading.value = true;
  error.value = "";
  warning.value = "";
  try {
    const data = await getStarMessengerRecords({
      page: page.value,
      pageSize,
      from: filters.from,
      to: filters.to,
      user: filters.user,
      completed: filters.completed,
    });
    records.value = Array.isArray(data.records) ? data.records : [];
    total.value = Number(data.total ?? records.value.length);
    warning.value = data.warning || (data.localFallback ? "后端暂不可用，正在显示本地调试记录。" : "");
  } catch (err) {
    error.value = err.message || "加载失败。";
  } finally {
    isLoading.value = false;
  }
}

function applyFilters() {
  page.value = 1;
  loadRecords();
}

function changePage(direction) {
  page.value = Math.min(totalPages.value, Math.max(1, page.value + direction));
  loadRecords();
}

function userLabel(record) {
  return record.username || record.userId || record.anonymousId || "匿名";
}

function numberLabel(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function durationLabel(value) {
  const seconds = Math.round(Number(value || 0) / 1000);
  return seconds ? `${seconds}s` : "暂无";
}

function formatTime(value) {
  if (!value) return "暂无";
  return new Date(value).toLocaleString("zh-CN", { hour12: false });
}
</script>
