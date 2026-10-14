<template>
  <aside class="community-sidecard" aria-label="社区说明">
    <div v-if="socialSummary.liveSignals.length" class="sidecard-panel live-panel">
      <p class="eyebrow">Live</p>
      <h2>正在发生</h2>
      <a
        v-for="signal in socialSummary.liveSignals"
        :key="`${signal.kind}-${signal.href}-${signal.createdAt}`"
        class="live-signal"
        :href="signal.href"
      >
        <span>{{ signal.text }}</span>
        <time :datetime="signal.createdAt">{{ formatTime(signal.createdAt) }}</time>
      </a>
    </div>
    <div v-if="socialSummary.recommendedUsers.length" class="sidecard-panel">
      <p class="eyebrow">People</p>
      <h2>推荐用户</h2>
      <div class="recommended-user-list">
        <a
          v-for="person in socialSummary.recommendedUsers"
          :key="person.id"
          class="recommended-user"
          :href="userProfileUrl(person)"
        >
          <AuthorAvatar :author="person" />
          <span>
            <strong>@{{ person.username }}</strong>
            <small>{{ person.postCount }} 发布 · {{ person.followerCount }} 粉丝</small>
          </span>
        </a>
      </div>
    </div>
    <div class="sidecard-panel">
      <p class="eyebrow">What To Post</p>
      <h2>适合发布什么</h2>
      <ul>
        <li>展示一个刚做完的 Vibe Coding 作品，请别人看可用性和表达。</li>
        <li>分享文章、资料线索、行业观察和经验复盘。</li>
        <li>记录一次 AI 工具链、提示词或自动化流程的真实踩坑。</li>
        <li>提出希望 4399123 增加或改进的功能，并说明使用场景。</li>
      </ul>
    </div>
    <div class="sidecard-panel">
      <p class="eyebrow">Rules</p>
      <h2>社区共识</h2>
      <p>标题说清问题，正文补足上下文；作品展示建议附链接、截图和想要的反馈。避免刷屏、广告、攻击和泄露隐私。</p>
    </div>
    <div class="sidecard-panel">
      <p class="eyebrow">First Move</p>
      <h2>新用户下一步</h2>
      <p>在主页浏览全部社区内容，也可以用“发帖”分享想法或发起讨论。</p>
    </div>
  </aside>
</template>

<script setup>
import AuthorAvatar from "./AuthorAvatar.js";

defineProps({
  socialSummary: {
    type: Object,
    default: () => ({ activeTopics: [], recommendedUsers: [], latestMembers: [], liveSignals: [] }),
  },
});

function formatTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function userProfileUrl(author = {}) {
  return author?.id ? `/users/${encodeURIComponent(author.id)}` : "/community";
}
</script>
