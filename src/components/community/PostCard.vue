<template>
  <article
    v-reveal="index"
    class="pc"
    :class="{ 'pc--share': isSharePost(post) }"
  >
    <AuthorAvatar :author="post.author" :href="userProfileUrl(post.author)" />
    <div class="pc-body">
      <span class="pc-meta">
        <a class="pc-user" :href="userProfileUrl(post.author)" @click.stop>@{{ post.author.username }}</a>
        <a class="pc-channel" :href="topicHref" @click.stop>{{ post.topic?.label || post.channelLabel }}</a>
        <span v-for="badge in post.badges || []" :key="`${post.id}-${badge.key}`" class="forum-badge" :class="`badge-${badge.key}`">{{ badge.label }}</span>
        <span v-if="post.isDraft" class="draft-badge">草稿</span>
        <time class="pc-time" :datetime="post.createdAt">{{ formatTime(post.createdAt) }}</time>
      </span>
      <button
        class="pc-click"
        type="button"
        @click="$emit('open', post)"
      >
        <span v-if="isSharePost(post)" class="share-cover" :class="{ empty: !coverImage(post) }">
          <img v-if="coverImage(post)" :src="coverImage(post).url" :alt="coverImage(post).name" loading="lazy" />
          <span v-else>分享发现</span>
        </span>
        <span v-if="shouldShowTitle(post)" class="pc-title">{{ post.title }}</span>
        <span class="pc-excerpt">{{ excerpt(post.body) }}</span>
      </button>
      <div class="pc-summary">
        <span>{{ post.replyCount || replyCount(post) }} 回复</span>
        <span>{{ post.viewCount || 0 }} 浏览</span>
        <span>最后活跃 {{ formatTime(post.lastActivityAt || post.updatedAt) }}</span>
      </div>
      <div v-if="post.attachments?.length" class="feed-media-grid" @click.stop>
        <button
          v-for="attachment in post.attachments.slice(0, 4)"
          :key="attachment.id"
          class="feed-media-tile"
          type="button"
          @click="$emit('open', post)"
        >
          <img v-if="attachment.type === 'image'" :src="attachment.url" :alt="attachment.name" loading="lazy" />
          <video v-else-if="attachment.type === 'video'" :src="attachment.url" preload="metadata" muted></video>
          <span v-else>{{ attachmentIcon(attachment.contentType) }}</span>
        </button>
      </div>
      <div class="pc-actions" @click.stop>
        <button class="pc-act" type="button" @click="$emit('open', post, { focusReply: true })">
          <span aria-hidden="true">💬</span>
          <span class="pc-c">{{ replyCount(post) }}</span>
        </button>
        <button class="pc-act" type="button" @click="$emit('share', post)">
          <span aria-hidden="true">↗</span>
          <span class="pc-c">{{ shareStatusPostId === post.id ? "已分享" : (post.shareCount || 0) }}</span>
        </button>
        <button
          class="pc-act"
          :class="{ on: post.likedByMe }"
          type="button"
          :disabled="likeBusyPostId === post.id"
          @click="$emit('like', post)"
        >
          <span aria-hidden="true">{{ post.likedByMe ? "♥" : "♡" }}</span>
          <span class="pc-c">{{ post.likeCount || 0 }}</span>
        </button>
        <button
          class="pc-act"
          :class="{ on: post.bookmarkedByMe }"
          type="button"
          :disabled="bookmarkBusyPostId === post.id"
          @click="$emit('bookmark', post)"
        >
          <span aria-hidden="true">{{ post.bookmarkedByMe ? "★" : "☆" }}</span>
          <span v-if="post.bookmarkCount" class="pc-c">{{ post.bookmarkCount }}</span>
        </button>
        <button
          v-if="post.author?.canFollow"
          class="pc-act pc-act--follow"
          :class="{ on: post.author.followedByMe }"
          type="button"
          :disabled="followBusyUserId === post.author.id"
          @click="$emit('follow', post.author)"
        >
          {{ post.author.followedByMe ? "已关注" : "+ 关注" }}
        </button>
      </div>
    </div>
  </article>
</template>

<script setup>
import AuthorAvatar from "./AuthorAvatar.js";
import {
  attachmentIcon,
  coverImage,
  excerpt,
  formatTime,
  isSharePost,
  replyCount,
  shouldShowTitle,
  userProfileUrl,
} from "./helpers.js";

defineProps({
  post: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    default: 0,
  },
  topicHref: {
    type: String,
    default: "/community",
  },
  shareStatusPostId: {
    type: [Number, String],
    default: null,
  },
  likeBusyPostId: {
    type: [Number, String],
    default: null,
  },
  bookmarkBusyPostId: {
    type: [Number, String],
    default: null,
  },
  followBusyUserId: {
    type: [Number, String],
    default: null,
  },
});

defineEmits(["open", "share", "like", "bookmark", "follow"]);
</script>

<style scoped>
.pc {
  display: flex;
  gap: 14px;
  min-width: 0;
  background: var(--c-surface);
  border: 1px solid var(--c-line);
  border-radius: var(--c-radius);
  box-shadow: var(--c-shadow-soft);
  padding: 18px;
  transition: box-shadow 0.18s ease, transform 0.18s ease, border-color 0.18s ease;
}

.pc:hover {
  border-color: color-mix(in srgb, var(--c-green) 40%, var(--c-line));
  box-shadow: 0 2px 4px rgba(23, 25, 24, 0.06), 0 14px 34px -16px rgba(30, 111, 92, 0.4);
  transform: translateY(-1px);
}

.pc--share {
  border-left: 3px solid var(--c-green);
}

.pc-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.pc-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 13px;
}

.pc-user {
  font-weight: 700;
  color: var(--c-ink);
  text-decoration: none;
}

.pc-user:hover {
  color: var(--c-green);
}

.pc-channel {
  color: var(--c-green);
  font-weight: 600;
  text-decoration: none;
}

.pc-channel:hover {
  text-decoration: underline;
}

.pc-time {
  margin-left: auto;
  color: var(--c-muted);
  font-family: var(--c-mono);
  font-size: 12px;
}

.pc-click {
  display: block;
  text-align: left;
  width: 100%;
  border: 0;
  background: transparent;
  padding: 0;
  margin: 9px 0 0;
  cursor: pointer;
  color: inherit;
  font: inherit;
}

.pc-title {
  display: block;
  font-size: 16.5px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--c-ink);
  margin-bottom: 5px;
}

.pc-excerpt {
  display: block;
  font-size: 14px;
  color: var(--c-muted);
  line-height: 1.6;
}

.pc-summary {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  margin-top: 12px;
  color: var(--c-muted);
  font-family: var(--c-mono);
  font-size: 12px;
}

.pc-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 14px;
}

.pc-act {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 0;
  background: transparent;
  cursor: pointer;
  color: var(--c-muted);
  font: inherit;
  font-size: 13px;
  padding: 6px 10px;
  border-radius: var(--c-pill);
  transition: background 0.15s ease, color 0.15s ease;
}

.pc-act:hover:not(:disabled) {
  background: var(--c-surface-2);
  color: var(--c-ink);
}

.pc-act:disabled {
  opacity: 0.55;
  cursor: default;
}

.pc-act.on {
  color: var(--c-green);
}

.pc-c {
  font-family: var(--c-mono);
  font-variant-numeric: tabular-nums;
}

.pc-act--follow {
  margin-left: auto;
  color: var(--c-green);
  font-weight: 600;
}

.pc-act--follow.on {
  color: var(--c-muted);
}

.pc-act:focus-visible {
  outline: 2px solid var(--c-green);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .pc,
  .pc-act {
    transition: none;
  }
}
</style>
