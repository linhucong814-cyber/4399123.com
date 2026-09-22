<template>
  <section class="auth-page prompt-library-page">
    <div class="section-head blog-page-head">
      <div>
        <p class="eyebrow">教程 / 提示词</p>
        <h1>{{ detail?.title || "提示词" }}</h1>
      </div>
      <div class="share-section-actions">
        <a class="secondary-link compact-action" href="/vibe-coding/prompt-library/">返回列表</a>
        <a v-if="detail?.canEdit" class="primary-link compact-action" :href="`/vibe-coding/prompt-library/${detail.id}/edit/`">编辑</a>
      </div>
    </div>

    <article v-if="detailLoading" class="blog-state">正在读取这条提示词...</article>
    <article v-else-if="!detail" class="auth-panel">
      <p class="form-message error-state">{{ detailError || "这条提示词不存在，或还没有公开。" }}</p>
      <a class="secondary-link compact-action" href="/vibe-coding/prompt-library/">返回提示词库</a>
    </article>
    <article v-else class="auth-panel prompt-detail-body">
      <p class="prompt-meta">
        <span>{{ detail.categoryLabel }}</span>
        <span>{{ detail.authorName }}</span>
        <span>复制 {{ detail.copyCount }} 次</span>
        <span>点赞 {{ detail.likeCount }}</span>
        <span>留言 {{ detail.commentCount }}</span>
      </p>
      <p>{{ detail.summary }}</p>
      <div v-if="detail.images.length" class="prompt-image-grid">
        <figure v-for="image in detail.images" :key="image.id">
          <img :src="image.url" :alt="image.caption || detail.title" />
          <figcaption v-if="image.caption">{{ image.caption }}</figcaption>
        </figure>
      </div>
      <p v-if="detail.tags.length" class="prompt-meta">
        <span v-for="tag in detail.tags" :key="tag">#{{ tag }}</span>
      </p>
      <h2>提示词</h2>
      <pre class="prompt-text">{{ detail.promptText }}</pre>
      <div v-if="detail.exampleInput" class="prompt-example">
        <h2>示例输入</h2>
        <pre class="prompt-text">{{ detail.exampleInput }}</pre>
      </div>
      <div v-if="detail.exampleOutput" class="prompt-example">
        <h2>示例输出</h2>
        <pre class="prompt-text">{{ detail.exampleOutput }}</pre>
      </div>
      <div class="prompt-library-actions">
        <button class="primary-link compact-action" type="button" @click="copyItem(detail)">复制提示词</button>
        <button class="secondary-link compact-action" type="button" @click="toggleLike(detail)">
          {{ detail.liked ? "已点赞" : "点赞" }} {{ detail.likeCount }}
        </button>
        <p v-if="actionMessage" class="form-message">{{ actionMessage }}</p>
      </div>

      <section class="prompt-comments" aria-labelledby="prompt-comments-title">
        <h2 id="prompt-comments-title">留言</h2>
        <p v-if="commentsError" class="form-message error-state">{{ commentsError }}</p>
        <p v-else-if="!comments.length" class="blog-state">还没有留言。</p>
        <article v-for="comment in comments" :key="comment.id" class="prompt-comment">
          <p class="prompt-meta"><span>{{ comment.authorName }}</span></p>
          <p>{{ comment.body }}</p>
          <button v-if="comment.canDelete" class="secondary-link compact-action" type="button" @click="removeComment(comment)">删除</button>
        </article>
        <form v-if="user && user.emailVerified" class="prompt-comment-form" @submit.prevent="sendComment">
          <label class="field-label">
            写留言
            <textarea v-model.trim="commentBody" rows="3" maxlength="1000" placeholder="说说这条提示词哪里好用。"></textarea>
          </label>
          <button class="primary-link compact-action" type="submit" :disabled="isCommenting">{{ isCommenting ? "发送中..." : "留言" }}</button>
        </form>
        <p v-else class="blog-state">
          <a :href="loginHref">登录</a>
          并验证邮箱后可以点赞和留言。
        </p>
      </section>
    </article>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { refreshAuth } from "../services/authState";
import {
  copyPromptLibraryItem,
  createPromptLibraryComment,
  deletePromptLibraryComment,
  getPromptLibraryComments,
  getPromptLibraryItem,
  likePromptLibraryItem,
} from "../services/vibeCoding";
import { setPageSeo } from "../utils/seo";

const props = defineProps({
  itemId: { type: String, required: true },
});

const user = ref(null);
const detail = ref(null);
const detailLoading = ref(true);
const detailError = ref("");
const actionMessage = ref("");
const comments = ref([]);
const commentsError = ref("");
const commentBody = ref("");
const isCommenting = ref(false);
const loginHref = computed(() => `/login?next=${encodeURIComponent(`/vibe-coding/prompt-library/${props.itemId}/`)}`);

onMounted(async () => {
  user.value = await refreshAuth();
  await loadDetail();
});

async function loadDetail() {
  detailLoading.value = true;
  detailError.value = "";
  try {
    const data = await getPromptLibraryItem(props.itemId);
    detail.value = data.item || null;
    if (detail.value) {
      setPageSeo({
        title: detail.value.title,
        description: detail.value.summary,
        path: `/vibe-coding/prompt-library/${detail.value.id}`,
      });
      await loadComments();
    }
  } catch (error) {
    detail.value = null;
    detailError.value = error.message || "这条提示词不存在，或还没有公开。";
    setPageSeo({
      title: "提示词",
      description: "这条提示词不存在，或还没有公开。",
      path: `/vibe-coding/prompt-library/${props.itemId}`,
    });
  } finally {
    detailLoading.value = false;
  }
}

async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
  } catch {
    // Clipboard can be blocked without a direct user gesture.
  }
  const fallback = document.createElement("textarea");
  fallback.value = text;
  fallback.setAttribute("readonly", "");
  fallback.style.position = "fixed";
  fallback.style.top = "-999px";
  document.body.appendChild(fallback);
  fallback.select();
  const copied = document.execCommand("copy");
  fallback.remove();
  if (!copied) throw new Error("复制失败，请手动选择文本");
}

async function copyItem(item) {
  actionMessage.value = "";
  try {
    const data = await copyPromptLibraryItem(item.id);
    item.copyCount = data.copyCount;
    try {
      await copyText(data.promptText);
      actionMessage.value = "已复制提示词";
    } catch (error) {
      actionMessage.value = error.message || "复制失败，请手动选择文本";
    }
  } catch (error) {
    actionMessage.value = error.message || "复制失败，请稍后重试。";
  }
}

async function toggleLike(item) {
  actionMessage.value = "";
  if (!user.value) {
    actionMessage.value = "请先登录后再点赞。";
    return;
  }
  try {
    const data = await likePromptLibraryItem(item.id);
    item.liked = data.liked;
    item.likeCount = data.likeCount;
  } catch (error) {
    actionMessage.value = error.message || "点赞失败，请稍后重试。";
  }
}

async function loadComments() {
  commentsError.value = "";
  try {
    const data = await getPromptLibraryComments(props.itemId);
    comments.value = Array.isArray(data.comments) ? data.comments : [];
  } catch (error) {
    comments.value = [];
    commentsError.value = error.message || "读取留言失败。";
  }
}

async function sendComment() {
  commentsError.value = "";
  if (!commentBody.value) {
    commentsError.value = "留言需要 1-1000 个字符。";
    return;
  }
  isCommenting.value = true;
  try {
    const data = await createPromptLibraryComment(props.itemId, commentBody.value);
    comments.value = [...comments.value, data.comment];
    if (detail.value) detail.value.commentCount = data.commentCount;
    commentBody.value = "";
  } catch (error) {
    commentsError.value = error.message || "留言失败，请稍后重试。";
  } finally {
    isCommenting.value = false;
  }
}

async function removeComment(comment) {
  commentsError.value = "";
  try {
    const data = await deletePromptLibraryComment(comment.id);
    comments.value = comments.value.filter((entry) => entry.id !== comment.id);
    if (detail.value) detail.value.commentCount = data.commentCount;
  } catch (error) {
    commentsError.value = error.message || "删除留言失败。";
  }
}
</script>
