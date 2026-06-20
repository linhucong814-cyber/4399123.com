<template>
  <section class="blog-page">
    <div class="section-head blog-page-head">
      <div>
        <p class="eyebrow">Journal</p>
        <h2>博客</h2>
      </div>
      <a class="secondary-link compact-action" href="/">返回首页</a>
    </div>

    <div v-if="selectedPost" class="blog-detail">
      <a class="text-button" href="/blog">返回博客列表</a>
      <article class="blog-article">
        <p class="blog-date">{{ selectedPost.date }}</p>
        <h1>{{ selectedPost.title }}</h1>
        <p class="blog-summary">{{ selectedPost.summary }}</p>
        <div class="tag-row blog-tags">
          <span v-for="tag in selectedPost.tags" :key="tag">{{ tag }}</span>
        </div>
        <div class="blog-content">
          <template v-for="block in selectedPostBlocks" :key="block.key">
            <figure v-if="block.type === 'video'" class="blog-video-frame">
              <video controls preload="metadata" playsinline>
                <source :src="block.src" :type="block.mimeType" />
                当前浏览器无法播放这个视频。
              </video>
            </figure>
            <figure v-else-if="block.type === 'image'" class="blog-image-frame">
              <img :src="block.src" :alt="block.alt" loading="lazy" />
            </figure>
            <p v-else>{{ block.text }}</p>
          </template>
        </div>
      </article>
    </div>

    <div v-else-if="isLoading" class="blog-state">正在加载博客...</div>

    <div v-else-if="missingSlug" class="blog-state error-state">
      没有找到这篇博客
    </div>

    <div v-else-if="!posts.length" class="blog-state">
      暂无已发布博客
    </div>

    <div v-else class="blog-grid">
      <a
        v-for="(post, index) in posts"
        :key="post.id"
        v-reveal="index"
        class="blog-card"
        :href="postHref(post)"
      >
        <p class="blog-date">{{ post.date }}</p>
        <h3>{{ post.title }}</h3>
        <p>{{ post.summary }}</p>
        <div class="tag-row">
          <span v-for="tag in post.tags" :key="tag">{{ tag }}</span>
        </div>
        <span>阅读全文</span>
      </a>
    </div>

    <section v-if="showComments" class="blog-comments">
      <div class="blog-comments-head">
        <div>
          <p class="eyebrow">Comments</p>
          <h3>评论</h3>
        </div>
        <p>{{ comments.length }} 条评论</p>
      </div>

      <div class="comment-box">
        <div v-if="commentUser" class="comment-form">
          <p class="comment-note">当前登录：{{ commentUser.username }}</p>
          <textarea v-model="commentBody" maxlength="1200" placeholder="写下你的评论"></textarea>
          <div class="comment-actions">
            <button type="button" :disabled="isSubmittingComment || !commentsEnabled" @click="submitComment">
              发布评论
            </button>
            <button type="button" class="secondary-comment-button" @click="logoutCommentUser">
              退出登录
            </button>
          </div>
        </div>

        <form v-else class="comment-login" @submit.prevent="loginForComment">
          <p class="comment-note">登录后可以评论。没有账号可先注册。</p>
          <input v-model="loginIdentifier" autocomplete="username" placeholder="用户名或邮箱" />
          <input v-model="loginPassword" autocomplete="current-password" type="password" placeholder="密码" />
          <div class="comment-actions">
            <button type="submit" :disabled="isSubmittingComment">登录</button>
            <a class="secondary-comment-link" href="/register">注册账号</a>
          </div>
        </form>

        <p v-if="!commentsEnabled" class="comment-status">评论暂时关闭，已有评论仍可查看。</p>
        <p v-else-if="commentStatus" class="comment-status">{{ commentStatus }}</p>
      </div>

      <div class="comment-list">
        <article v-for="comment in comments" :key="comment.id" class="comment-item">
          <header>
            <strong>{{ comment.authorName }}</strong>
            <span>{{ formatCommentTime(comment.createdAt) }}</span>
          </header>
          <p>{{ comment.body }}</p>
        </article>
        <p v-if="!comments.length" class="blog-state">还没有评论。</p>
      </div>
    </section>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch, watchEffect } from "vue";
import { localBlogPosts } from "../data/content";
import { getCurrentUser, loginUser, logoutUser } from "../services/auth";
import { getCsrfToken } from "../services/csrf";
import { setPageSeo } from "../utils/seo";

const props = defineProps({
  slug: {
    type: String,
    default: "",
  },
});

const posts = ref([...localBlogPosts]);
const isLoading = ref(true);
const comments = ref([]);
const commentUser = ref(null);
const commentsEnabled = ref(true);
const commentBody = ref("");
const commentStatus = ref("");
const loginIdentifier = ref("");
const loginPassword = ref("");
const isSubmittingComment = ref(false);

const selectedPost = computed(() => {
  if (!props.slug) {
    return null;
  }

    return posts.value.find((post) => post.slug === props.slug || post.id === props.slug) || null;
});
const missingSlug = computed(() => Boolean(props.slug) && !selectedPost.value);
const activeCommentPost = computed(() => props.slug || "blog-index");
const showComments = computed(() => !isLoading.value && !missingSlug.value);
const selectedPostBlocks = computed(() => {
  if (!selectedPost.value) {
    return [];
  }

  return selectedPost.value.content
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph, index) => {
      const videoMatch = paragraph.match(/^\[video:(.+)]$/);
      if (videoMatch) {
        const src = videoMatch[1];
        return {
          key: `video-${index}-${src}`,
          type: "video",
          src,
          mimeType: videoMimeType(src),
        };
      }

      const imageMatch = paragraph.match(/^\[image:([^|\]]+)(?:\|([^\]]+))?]$/);
      if (imageMatch) {
        const src = imageMatch[1].trim();
        const alt = (imageMatch[2] || selectedPost.value.title).trim();
        return {
          key: `image-${index}-${src}`,
          type: "image",
          src,
          alt,
        };
      }

      return {
        key: `text-${index}-${paragraph}`,
        type: "text",
        text: paragraph,
      };
    });
});

function videoMimeType(src) {
  if (/\.webm(?:$|\?)/i.test(src)) {
    return "video/webm";
  }
  if (/\.mov(?:$|\?)/i.test(src)) {
    return "video/quicktime";
  }
  return "video/mp4";
}

onMounted(loadPosts);

onMounted(async () => {
  await loadCommentUser();
  await loadComments();
});

watch(activeCommentPost, () => {
  commentBody.value = "";
  commentStatus.value = "";
  loadComments();
});

watch(showComments, (visible) => {
  if (visible) loadComments();
});

watchEffect(() => {
  if (selectedPost.value) {
    setPageSeo({
      title: selectedPost.value.title,
      description: selectedPost.value.summary,
      path: `/blog/${selectedPost.value.slug}`,
      image: selectedPost.value.cover,
      type: "article",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: selectedPost.value.title,
        description: selectedPost.value.summary,
        datePublished: selectedPost.value.isoDate || selectedPost.value.publishedAt,
        dateModified: selectedPost.value.isoDate || selectedPost.value.publishedAt,
        url: `https://4399123.com/blog/${selectedPost.value.slug}`,
        author: { "@type": "Person", name: "4399123" },
      },
    });
    return;
  }

  setPageSeo({
    title: "最新内容",
    description: "4399123 的 vibe coding 想法、AI/编程实验、项目记录和有趣发现。",
    path: props.slug ? `/blog/${props.slug}` : "/blog",
  });
});

function postHref(post) {
  return `/blog/${encodeURIComponent(post.slug || post.id)}`;
}

async function loadPosts() {
  isLoading.value = true;

  try {
    const response = await fetch("/api/blog/posts", {
      credentials: "same-origin",
    });
    if (!response.ok) {
      throw new Error("posts_request_failed");
    }
    const data = await response.json();
    const remotePosts = Array.isArray(data.posts) ? data.posts : [];
    posts.value = mergePosts(remotePosts, localBlogPosts);
  } catch {
    posts.value = [...localBlogPosts];
  } finally {
    isLoading.value = false;
  }
}

async function loadCommentUser() {
  try {
    const data = await getCurrentUser();
    commentUser.value = data.user ? { id: data.user.id, username: data.user.username } : null;
  } catch {
    commentUser.value = null;
  }
}

async function loadComments() {
  if (!showComments.value) return;

  try {
    const response = await fetch(`/api/blog/comments?post=${encodeURIComponent(activeCommentPost.value)}`, {
      credentials: "same-origin",
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "评论加载失败。");
    }
    comments.value = Array.isArray(data.comments) ? data.comments : [];
    commentsEnabled.value = data.settings?.commentsEnabled !== false;
    if (data.user) {
      commentUser.value = { id: data.user.id, username: data.user.username };
    }
  } catch (error) {
    commentStatus.value = error.message || "评论加载失败。";
  }
}

async function loginForComment() {
  isSubmittingComment.value = true;
  commentStatus.value = "";

  try {
    const data = await loginUser({
      identifier: loginIdentifier.value,
      password: loginPassword.value,
    });
    commentUser.value = data.user ? { id: data.user.id, username: data.user.username } : null;
    loginPassword.value = "";
    commentStatus.value = "已登录，可以评论。";
    await loadComments();
  } catch (error) {
    commentStatus.value = error.message || "登录失败。";
  } finally {
    isSubmittingComment.value = false;
  }
}

async function logoutCommentUser() {
  await logoutUser();
  commentUser.value = null;
  commentBody.value = "";
  commentStatus.value = "已退出登录。";
}

async function submitComment() {
  const body = commentBody.value.trim();
  if (body.length < 2) {
    commentStatus.value = "评论至少需要 2 个字符。";
    return;
  }

  isSubmittingComment.value = true;
  commentStatus.value = "";

  try {
    const csrfToken = await getCsrfToken();
    const response = await fetch("/api/blog/comments", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        ...(csrfToken ? { "X-CSRFToken": csrfToken } : {}),
      },
      body: JSON.stringify({ post: activeCommentPost.value, body }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "评论发布失败。");
    }
    commentBody.value = "";
    commentStatus.value = "评论已发布。";
    await loadComments();
  } catch (error) {
    commentStatus.value = error.message || "评论发布失败。";
  } finally {
    isSubmittingComment.value = false;
  }
}

function formatCommentTime(value) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function mergePosts(remotePosts, fallbackPosts) {
  const map = new Map();
  for (const post of fallbackPosts) {
    map.set(post.slug || post.id, post);
  }
  for (const post of remotePosts) {
    const key = post.slug || post.id;
    map.set(key, {
      ...map.get(key),
      ...post,
      tags: post.tags || map.get(key)?.tags || [],
      cover: post.cover || map.get(key)?.cover || "",
    });
  }
  return Array.from(map.values());
}
</script>
