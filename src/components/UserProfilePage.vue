<template>
  <section class="public-profile-page">
    <a class="secondary-link compact-action public-profile-back" href="/community">返回社区</a>

    <div v-if="isLoading" class="blog-state public-profile-state">
      正在读取用户主页...
    </div>

    <div v-else-if="error" class="blog-state public-profile-state error-state">
      {{ error }}
    </div>

    <template v-else-if="profile">
      <header class="public-profile-hero">
        <div class="public-profile-avatar" :class="{ empty: !profile.avatarUrl }" :style="avatarStyle(profile.username)">
          <img v-if="profile.avatarUrl" :src="profile.avatarUrl" :alt="`${profile.username} 的头像`" @error="profile.avatarUrl = ''" />
          <span v-else>{{ authorInitial(profile.username) }}</span>
        </div>
        <div class="public-profile-intro">
          <p class="eyebrow">Member</p>
          <h1>@{{ profile.username }}</h1>
          <p>{{ profile.bio || "这个用户还没有填写个人介绍。" }}</p>
          <div class="public-profile-stats" aria-label="用户公开数据">
            <span><strong>{{ profile.postCount || posts.length }}</strong> 公开帖子</span>
            <span><strong>{{ profile.followerCount || 0 }}</strong> 粉丝</span>
            <span><strong>{{ profile.followingCount || 0 }}</strong> 关注</span>
            <span v-if="!bookmarksPrivate"><strong>{{ profile.bookmarkCount || 0 }}</strong> 收藏</span>
            <span v-if="profile.joinedAt">加入于 {{ formatDate(profile.joinedAt) }}</span>
          </div>
          <button
            v-if="profile.canFollow"
            class="primary-link compact-action profile-follow-button"
            type="button"
            :disabled="followBusy"
            @click="toggleFollow"
          >
            {{ profile.followedByMe ? "已关注" : "关注这个用户" }}
          </button>
        </div>
      </header>

      <section class="public-profile-posts" aria-label="用户发布的帖子">
        <div class="section-head public-profile-section-head">
          <div>
            <p class="eyebrow">Posts</p>
            <h2>发布过的帖子</h2>
          </div>
          <a class="secondary-link compact-action" href="/community">浏览社区</a>
        </div>

        <div v-if="posts.length" class="public-profile-post-list">
          <a
            v-for="post in posts"
            :key="post.id"
            class="public-profile-post-card"
            :href="postUrl(post)"
          >
            <span class="stream-post-meta">
              <span>{{ post.channelLabel }}</span>
              <time :datetime="post.createdAt">{{ formatTime(post.createdAt) }}</time>
            </span>
            <h3>{{ post.title }}</h3>
            <p>{{ post.bodyPreview || "这篇帖子暂时没有更多预览内容。" }}</p>
            <span class="public-profile-post-metrics">
              <span>{{ post.replyCount || 0 }} 回复</span>
              <span>{{ post.likeCount || 0 }} 赞</span>
              <span>{{ post.shareCount || 0 }} 分享</span>
              <span v-if="post.attachmentCount">{{ post.attachmentCount }} 附件</span>
            </span>
          </a>
        </div>

        <div v-else class="empty-panel public-profile-empty">
          <h3>还没有公开帖子</h3>
          <p>@{{ profile.username }} 发布的公开帖子会出现在这里。</p>
        </div>
      </section>

      <section class="public-profile-posts" aria-label="用户收藏和最近互动">
        <div class="section-head public-profile-section-head">
          <div>
            <p class="eyebrow">Activity</p>
            <h2>{{ bookmarksPrivate ? "最近互动" : "收藏与最近互动" }}</h2>
          </div>
        </div>

        <div class="profile-activity-grid">
          <div v-if="!bookmarksPrivate" class="profile-activity-panel">
            <h3>收藏内容</h3>
            <a
              v-for="post in bookmarks"
              :key="post.id"
              class="profile-activity-row"
              :href="postUrl(post)"
            >
              <strong>{{ post.title }}</strong>
              <span>{{ post.channelLabel }} · {{ post.likeCount || 0 }} 赞 · {{ post.replyCount || 0 }} 回复</span>
            </a>
            <p v-if="!bookmarks.length" class="profile-activity-empty">最近还没有公开收藏内容。</p>
          </div>

          <div v-else class="profile-activity-panel">
            <h3>收藏内容</h3>
            <p class="profile-activity-empty">收藏列表仅用户本人可见。</p>
          </div>

          <div class="profile-activity-panel">
            <h3>最近互动</h3>
            <a
              v-for="item in recentInteractions"
              :key="item.id"
              class="profile-activity-row"
              :href="item.post.url"
            >
              <strong>回复了《{{ item.post.title }}》</strong>
              <span>{{ item.body || "发布了一条回复" }} · {{ formatTime(item.createdAt) }}</span>
            </a>
            <p v-if="!recentInteractions.length" class="profile-activity-empty">最近还没有公开互动。</p>
          </div>
        </div>
      </section>
    </template>
  </section>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import { getCommunityUser, getCommunityUserActivity, getCommunityUserPosts, toggleCommunityUserFollow } from "../services/community";
import { setPageSeo } from "../utils/seo";

const props = defineProps({
  userId: {
    type: String,
    default: "",
  },
});

const profile = ref(null);
const posts = ref([]);
const bookmarks = ref([]);
const recentInteractions = ref([]);
const bookmarksPrivate = ref(true);
const isLoading = ref(true);
const error = ref("");
const followBusy = ref(false);
const avatarPalette = ["#1e6f5c", "#294f8f", "#c84f3a", "#7b5d15", "#5b5fc7", "#20736f"];

onMounted(loadProfile);

watch(
  () => props.userId,
  () => {
    loadProfile();
  },
);

async function loadProfile() {
  if (!props.userId) {
    error.value = "没有找到这个用户。";
    isLoading.value = false;
    return;
  }

  isLoading.value = true;
  error.value = "";
  profile.value = null;
  posts.value = [];
  bookmarks.value = [];
  recentInteractions.value = [];
  bookmarksPrivate.value = true;
  try {
    const [profileData, postsData, activityData] = await Promise.all([
      getCommunityUser(props.userId),
      getCommunityUserPosts(props.userId),
      getCommunityUserActivity(props.userId),
    ]);
    profile.value = profileData.user || postsData.user || null;
    posts.value = Array.isArray(postsData.posts) ? postsData.posts : [];
    bookmarks.value = Array.isArray(activityData.bookmarks) ? activityData.bookmarks : [];
    bookmarksPrivate.value = Boolean(activityData.bookmarksPrivate);
    recentInteractions.value = Array.isArray(activityData.recentInteractions) ? activityData.recentInteractions : [];
    if (!profile.value) {
      throw new Error("没有找到这个用户。");
    }
    setPageSeo({
      title: `${profile.value.username} 的主页`,
      description: profile.value.bio || `查看 ${profile.value.username} 在 4399123 社区发布的公开帖子。`,
      path: `/users/${encodeURIComponent(profile.value.id)}`,
    });
  } catch (err) {
    if (err.status === 404) {
      error.value = "没有找到这个用户，或该用户主页暂不可访问。";
    } else {
      error.value = err.message || "读取用户主页失败。";
    }
  } finally {
    isLoading.value = false;
  }
}

async function toggleFollow() {
  if (!profile.value?.id || followBusy.value) return;
  followBusy.value = true;
  try {
    const data = await toggleCommunityUserFollow(profile.value.id, !profile.value.followedByMe);
    profile.value = {
      ...profile.value,
      followedByMe: data.following,
      followerCount: data.followerCount,
      followingCount: data.followingCount,
    };
  } catch (err) {
    error.value = err.message || "关注失败。";
  } finally {
    followBusy.value = false;
  }
}

function postUrl(post) {
  return `/community/posts/${encodeURIComponent(post.id)}`;
}

function authorInitial(username = "") {
  return String(username || "U").trim().slice(0, 1).toUpperCase() || "U";
}

function avatarStyle(username = "") {
  const text = String(username || "user");
  let hash = 0;
  for (const char of text) {
    hash = (hash + char.charCodeAt(0)) % avatarPalette.length;
  }
  return { "--avatar-bg": avatarPalette[hash] };
}

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

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
</script>
