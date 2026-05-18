<template>
  <section class="community-page">
    <div class="community-hero">
      <div>
        <p class="eyebrow">Community</p>
        <h1>4399123 社区</h1>
        <p>
          一个围绕 Vibe Coding、AI 工具、作品展示和站点反馈的轻量讨论区。登录后即可发帖，未登录也可以浏览。
        </p>
      </div>
      <div class="community-stats">
        <span>今日入口</span>
        <strong>{{ posts.length }}</strong>
        <small>当前筛选下的主题</small>
      </div>
    </div>

    <div class="community-layout">
      <aside class="community-sidebar" aria-label="社区栏目">
        <button
          class="channel-pill"
          :class="{ active: selectedChannel === 'all' }"
          type="button"
          @click="selectChannel('all')"
        >
          <strong>全部</strong>
          <span>所有主题</span>
        </button>
        <button
          v-for="channel in channels"
          :key="channel.id"
          class="channel-pill"
          :class="{ active: selectedChannel === channel.id }"
          type="button"
          @click="selectChannel(channel.id)"
        >
          <strong>{{ channel.label }}</strong>
          <span>{{ channel.description }}</span>
        </button>
      </aside>

      <div class="community-main">
        <section v-if="user" class="inbox-panel" :class="{ open: isInboxOpen }" aria-label="社区消息信箱">
          <button class="inbox-toggle" type="button" @click="toggleInbox">
            <span>
              <b>消息信箱</b>
              <small>{{ unreadNotifications ? `${unreadNotifications} 条未读` : "暂无未读" }}</small>
            </span>
            <strong>{{ isInboxOpen ? "收起" : "查看" }}</strong>
          </button>
          <div v-if="isInboxOpen" class="inbox-list">
            <div class="inbox-actions">
              <p>{{ notifications.length ? "有人回复或点赞你的内容时，会出现在这里。" : "暂时没有社区消息。" }}</p>
              <button v-if="unreadNotifications" class="secondary-link small-action" type="button" @click="markAllNotificationsRead">
                全部已读
              </button>
            </div>
            <a
              v-for="notification in notifications"
              :key="notification.id"
              class="inbox-item"
              :class="{ unread: !notification.isRead }"
              :href="notification.post.url"
              @click="markNotificationRead(notification)"
            >
              <div>
                <strong>{{ notification.title }}</strong>
                <p>{{ notification.body }}</p>
              </div>
              <time :datetime="notification.createdAt">{{ formatTime(notification.createdAt) }}</time>
            </a>
          </div>
        </section>

        <form
          v-if="user"
          class="composer-panel"
          :class="{ 'drag-over': isComposerDragOver }"
          @submit.prevent="submitPost"
          @paste="handleComposerPaste"
          @dragenter.prevent="handleComposerDragEnter"
          @dragover.prevent="isComposerDragOver = true"
          @dragleave.prevent="handleComposerDragLeave"
          @drop.prevent="handleComposerDrop"
        >
          <div class="composer-head">
            <div>
              <p class="eyebrow">New Topic</p>
              <h2>发布主题</h2>
            </div>
            <span>以 {{ user.username }} 身份发帖</span>
          </div>

          <div class="composer-grid">
            <label class="field-label">
              栏目
              <select v-model="form.channel">
                <option v-for="channel in channels" :key="channel.id" :value="channel.id">
                  {{ channel.label }}
                </option>
              </select>
            </label>
            <label class="field-label">
              标题
              <input v-model.trim="form.title" maxlength="120" placeholder="把问题、作品或想法说清楚" />
            </label>
          </div>

          <label class="field-label">
            正文
            <textarea v-model.trim="form.body" rows="6" maxlength="4000" placeholder="补充背景、链接、截图说明或你希望大家反馈的点。"></textarea>
          </label>

          <div class="attachment-uploader">
            <label class="attachment-trigger">
              <span>📎 添加附件</span>
              <small>可点击选择、粘贴截图，或把文件拖到发帖栏</small>
              <input type="file" multiple accept="image/*,video/*,.pdf,.txt,.zip" @change="handleAttachmentChange" />
            </label>
            <div v-if="attachmentFiles.length" class="attachment-list draft">
              <div v-for="file in attachmentFiles" :key="`${file.name}-${file.size}`" class="attachment-chip">
                <span>{{ attachmentIcon(file.type) }}</span>
                <strong>{{ file.name }}</strong>
                <small>{{ formatFileSize(file.size) }}</small>
                <button type="button" @click="removeAttachment(file)">移除</button>
              </div>
            </div>
          </div>

          <div class="composer-actions">
            <p v-if="error" class="form-message error-state">{{ error }}</p>
            <p v-else-if="success" class="form-message">{{ success }}</p>
            <div class="inline-actions">
              <button class="secondary-link small-action" type="button" :disabled="isSubmitting" @click="saveDraft">
                存草稿
              </button>
              <button class="primary-link compact-action" type="submit" :disabled="isSubmitting">
                {{ isSubmitting ? "保存中..." : "发布帖子" }}
              </button>
            </div>
          </div>
        </form>

        <div v-else class="composer-panel community-login-panel">
          <div>
            <p class="eyebrow">Sign In</p>
            <h2>登录后发帖</h2>
            <p>社区帖子会绑定你的 4399123.com 账号，方便后续做回复、收藏和通知。</p>
          </div>
          <div class="auth-actions">
            <a class="primary-link" href="/login">登录</a>
            <a class="secondary-link" href="/register">注册</a>
          </div>
        </div>

        <div v-if="isLoading" class="blog-state">正在读取社区帖子...</div>
        <div v-else-if="!posts.length" class="blog-state">这个栏目还没有帖子，登录后发第一篇。</div>
        <div v-else class="topic-list">
          <article
            v-for="post in posts"
            :key="post.id"
            class="topic-card topic-summary-card"
            role="button"
            tabindex="0"
            @click="openPost(post)"
            @keydown.enter.prevent="openPost(post)"
            @keydown.space.prevent="openPost(post)"
          >
            <div class="topic-meta">
              <div class="topic-badges">
                <span>{{ post.channelLabel }}</span>
                <span v-if="post.isDraft" class="draft-badge">草稿</span>
              </div>
              <time :datetime="post.createdAt">{{ formatTime(post.createdAt) }}</time>
            </div>
            <h2>{{ post.title }}</h2>
            <p class="topic-excerpt">{{ excerpt(post.body) }}</p>
            <div v-if="post.attachments?.length" class="attachment-summary">
              📎 {{ post.attachments.length }} 个附件
            </div>
            <div class="reaction-row" @click.stop>
              <button
                v-for="emoji in reactionChoices"
                :key="`${post.id}-${emoji}`"
                class="reaction-button"
                :class="{ active: post.myReactions?.includes(emoji) }"
                type="button"
                :disabled="reactionBusyKey === `post:${post.id}:${emoji}`"
                @click="togglePostReaction(post, emoji)"
              >
                {{ emoji }} {{ reactionCount(post.reactions, emoji) || "" }}
              </button>
            </div>
            <div class="topic-footer">
              <strong>@{{ post.author.username }}</strong>
              <div class="topic-actions">
                <button
                  class="like-button"
                  :class="{ active: post.likedByMe }"
                  type="button"
                  :disabled="likeBusyPostId === post.id"
                  @click.stop="toggleLike(post)"
                >
                  {{ post.likedByMe ? "已赞" : "点赞" }} · {{ post.likeCount || 0 }}
                </button>
                <span>{{ post.replies?.length || 0 }} 回复</span>
                <span>查看</span>
              </div>
            </div>
          </article>
        </div>
      </div>

      <aside class="community-sidecard" aria-label="社区说明">
        <div class="sidecard-panel">
          <p class="eyebrow">Guide</p>
          <h2>栏目策划</h2>
          <ul>
            <li>站务：公告、规则、账号问题。</li>
            <li>Vibe Coding：快速开发、项目复盘。</li>
            <li>AI 工具：模型、提示词、自动化。</li>
            <li>作品展示：把做好的东西发出来。</li>
            <li>需求与反馈：提出想做或想改的功能。</li>
            <li>闲聊：灵感碎片和轻松话题。</li>
          </ul>
        </div>
        <div class="sidecard-panel">
          <p class="eyebrow">Rules</p>
          <h2>发帖规则</h2>
          <p>标题具体，正文补充上下文；避免刷屏、广告、攻击和敏感隐私。作品展示建议附上链接、截图说明和想要的反馈。</p>
        </div>
      </aside>
    </div>

    <div v-if="selectedPost" class="topic-modal-backdrop" role="presentation" @click.self="closePost">
      <article class="topic-card topic-detail-card topic-modal" role="dialog" aria-modal="true" :aria-labelledby="`topic-title-${selectedPost.id}`">
          <button class="text-action back-action" type="button" @click="closePost">关闭窗口</button>

          <form v-if="editingPostId === selectedPost.id" class="edit-panel" @submit.prevent="submitEdit(selectedPost)">
            <div class="composer-grid">
              <label class="field-label">
                栏目
                <select v-model="editForm.channel">
                  <option v-for="channel in channels" :key="channel.id" :value="channel.id">
                    {{ channel.label }}
                  </option>
                </select>
              </label>
              <label class="field-label">
                标题
                <input v-model.trim="editForm.title" maxlength="120" />
              </label>
            </div>
            <label class="field-label">
              正文
              <textarea v-model.trim="editForm.body" rows="5" maxlength="4000"></textarea>
            </label>
            <div class="composer-actions">
              <p v-if="postActionError" class="form-message error-state">{{ postActionError }}</p>
              <span v-else></span>
              <div class="inline-actions">
                <button class="secondary-link small-action" type="button" @click="cancelEdit">取消</button>
                <button class="secondary-link small-action" type="button" :disabled="isPostActionBusy" @click="submitEdit(selectedPost, 'draft')">
                  存为草稿
                </button>
                <button class="primary-link compact-action" type="submit" :disabled="isPostActionBusy">
                  发布更新
                </button>
              </div>
            </div>
          </form>

          <template v-else>
            <div class="topic-meta">
              <div class="topic-badges">
                <span>{{ selectedPost.channelLabel }}</span>
                <span v-if="selectedPost.isDraft" class="draft-badge">草稿</span>
              </div>
              <time :datetime="selectedPost.createdAt">{{ formatTime(selectedPost.createdAt) }}</time>
            </div>
            <h2 :id="`topic-title-${selectedPost.id}`">{{ selectedPost.title }}</h2>
            <p>{{ selectedPost.body }}</p>
            <div v-if="selectedPost.attachments?.length" class="attachment-gallery">
              <a
                v-for="attachment in selectedPost.attachments"
                :key="attachment.id"
                class="attachment-card"
                :href="attachment.url"
                target="_blank"
                rel="noopener"
              >
                <img v-if="attachment.type === 'image'" :src="attachment.url" :alt="attachment.name" loading="lazy" />
                <video v-else-if="attachment.type === 'video'" :src="attachment.url" controls preload="metadata"></video>
                <span v-else class="file-tile">📎</span>
                <strong>{{ attachment.name }}</strong>
                <small>{{ formatFileSize(attachment.size) }}</small>
              </a>
            </div>
            <div class="reaction-row">
              <button
                v-for="emoji in reactionChoices"
                :key="`detail-${selectedPost.id}-${emoji}`"
                class="reaction-button"
                :class="{ active: selectedPost.myReactions?.includes(emoji) }"
                type="button"
                :disabled="reactionBusyKey === `post:${selectedPost.id}:${emoji}`"
                @click="togglePostReaction(selectedPost, emoji)"
              >
                {{ emoji }} {{ reactionCount(selectedPost.reactions, emoji) || "" }}
              </button>
            </div>
            <div class="topic-footer">
              <strong>@{{ selectedPost.author.username }}</strong>
              <div class="topic-actions">
                <button
                  class="like-button"
                  :class="{ active: selectedPost.likedByMe }"
                  type="button"
                  :disabled="likeBusyPostId === selectedPost.id"
                  @click="toggleLike(selectedPost)"
                >
                  {{ selectedPost.likedByMe ? "已赞" : "点赞" }} · {{ selectedPost.likeCount || 0 }}
                </button>
                <button v-if="selectedPost.canManage" class="text-action" type="button" @click="startEdit(selectedPost)">编辑</button>
                <button
                  v-if="selectedPost.canManage"
                  class="text-action danger"
                  type="button"
                  :disabled="isPostActionBusy"
                  @click="removePost(selectedPost)"
                >
                  删除
                </button>
                <span>#{{ selectedPost.id }}</span>
              </div>
            </div>
          </template>

          <div v-if="!selectedPost.isDraft" class="reply-panel">
            <div class="reply-head">
              <strong>{{ selectedPost.replies?.length || 0 }} 条回复</strong>
              <button v-if="user" class="text-action" type="button" @click="toggleReply(selectedPost.id)">
                {{ activeReplyPostId === selectedPost.id ? "收起" : "回复" }}
              </button>
            </div>

            <div v-if="selectedPost.replies?.length" class="reply-list">
              <div v-for="reply in selectedPost.replies" :key="reply.id" class="reply-item">
                <div>
                  <strong>@{{ reply.author.username }}</strong>
                  <time :datetime="reply.createdAt">{{ formatTime(reply.createdAt) }}</time>
                </div>
                <p>{{ reply.body }}</p>
                <div class="reply-actions">
                  <button
                    class="like-button"
                    :class="{ active: reply.likedByMe }"
                    type="button"
                    :disabled="likeBusyReplyId === reply.id"
                    @click="toggleReplyLike(reply)"
                  >
                    {{ reply.likedByMe ? "已赞" : "点赞" }} · {{ reply.likeCount || 0 }}
                  </button>
                  <div class="reaction-row compact">
                    <button
                      v-for="emoji in reactionChoices"
                      :key="`reply-${reply.id}-${emoji}`"
                      class="reaction-button"
                      :class="{ active: reply.myReactions?.includes(emoji) }"
                      type="button"
                      :disabled="reactionBusyKey === `reply:${reply.id}:${emoji}`"
                      @click="toggleReplyReaction(reply, emoji)"
                    >
                      {{ emoji }} {{ reactionCount(reply.reactions, emoji) || "" }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <form v-if="user && activeReplyPostId === selectedPost.id" class="reply-form" @submit.prevent="submitReply(selectedPost)">
              <textarea v-model.trim="replyForms[selectedPost.id]" rows="3" maxlength="2000" placeholder="写下你的回复"></textarea>
              <div class="composer-actions">
                <p v-if="replyError" class="form-message error-state">{{ replyError }}</p>
                <span v-else></span>
                <button class="primary-link compact-action" type="submit" :disabled="isReplySubmitting">
                  {{ isReplySubmitting ? "发送中..." : "发送回复" }}
                </button>
              </div>
            </form>

            <p v-else-if="!user" class="reply-login">登录后可以回复这个帖子。</p>
          </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from "vue";
import { getCurrentUser } from "../services/auth";
import {
  createCommunityPost,
  createCommunityReply,
  deleteCommunityPost,
  getCommunityNotifications,
  getCommunityPost,
  getCommunityPosts,
  markCommunityNotificationsRead,
  toggleCommunityPostLike,
  toggleCommunityPostReaction,
  toggleCommunityReplyLike,
  toggleCommunityReplyReaction,
  updateCommunityPost,
} from "../services/community";
import { setPageSeo } from "../utils/seo";

const props = defineProps({
  postId: {
    type: String,
    default: "",
  },
});

const fallbackChannels = [
  { id: "meta", label: "站务", description: "账号、公告、社区规则和站点建设讨论。" },
  { id: "vibe-coding", label: "Vibe Coding", description: "快速成型、AI 辅助开发、实验项目复盘。" },
  { id: "ai-tools", label: "AI 工具", description: "模型、提示词、工作流和工具链经验。" },
  { id: "showcase", label: "作品展示", description: "展示你做出的网页、小游戏、图片和原型。" },
  { id: "requests", label: "需求与反馈", description: "提出想要的工具、改进建议和协作需求。" },
  { id: "lounge", label: "闲聊", description: "轻松话题、灵感碎片和日常交流。" },
];

const channels = ref([...fallbackChannels]);
const posts = ref([]);
const user = ref(null);
const selectedChannel = ref("all");
const isLoading = ref(true);
const isSubmitting = ref(false);
const isPostActionBusy = ref(false);
const isReplySubmitting = ref(false);
const likeBusyPostId = ref(null);
const likeBusyReplyId = ref(null);
const reactionBusyKey = ref("");
const error = ref("");
const success = ref("");
const postActionError = ref("");
const replyError = ref("");
const isComposerDragOver = ref(false);
const notifications = ref([]);
const unreadNotifications = ref(0);
const isInboxOpen = ref(false);
const activeReplyPostId = ref(null);
const editingPostId = ref(null);
const selectedPostId = ref(null);
const replyForms = reactive({});
const attachmentFiles = ref([]);
const form = reactive({
  channel: "vibe-coding",
  title: "",
  body: "",
});
const editForm = reactive({
  channel: "vibe-coding",
  title: "",
  body: "",
});
const reactionChoices = ["👍", "❤️", "😂", "🎉", "🤔", "👏"];
const maxAttachmentCount = 5;
const maxAttachmentSize = 25 * 1024 * 1024;
let composerDragDepth = 0;
const selectedPost = computed(() => posts.value.find((post) => post.id === selectedPostId.value) || null);
const isStandalonePost = computed(() => Boolean(props.postId));

setPageSeo({
  title: "社区",
  description: "4399123 社区：Vibe Coding、AI 工具、作品展示、需求反馈和闲聊讨论区。",
  path: "/community",
});

onMounted(async () => {
  window.addEventListener("keydown", handleKeydown);
  isInboxOpen.value = new URLSearchParams(window.location.search).get("inbox") === "1";
  await Promise.all([loadUser(), isStandalonePost.value ? loadPostDetail(props.postId) : loadPosts()]);
  if (user.value) await loadNotifications();
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
  unlockPageScroll();
});

async function loadUser() {
  try {
    const data = await getCurrentUser();
    user.value = data.user || null;
  } catch {
    user.value = null;
  }
}

async function loadPosts() {
  isLoading.value = true;
  try {
    const data = await getCommunityPosts(selectedChannel.value);
    channels.value = Array.isArray(data.channels) && data.channels.length ? data.channels : fallbackChannels;
    posts.value = Array.isArray(data.posts) ? data.posts : [];
    if (selectedPostId.value && !posts.value.some((post) => post.id === selectedPostId.value)) {
      closePost();
    }
    user.value = data.user || user.value;
    unreadNotifications.value = Number(data.unreadNotifications || unreadNotifications.value || 0);
  } catch (err) {
    error.value = err.message || "读取社区失败。";
    posts.value = [];
  } finally {
    isLoading.value = false;
  }
}

async function loadPostDetail(postId) {
  isLoading.value = true;
  try {
    const data = await getCommunityPost(postId);
    channels.value = Array.isArray(data.channels) && data.channels.length ? data.channels : fallbackChannels;
    user.value = data.user || user.value;
    unreadNotifications.value = Number(data.unreadNotifications || unreadNotifications.value || 0);
    posts.value = data.post ? [data.post] : [];
    selectedPostId.value = data.post?.id || null;
    if (selectedPostId.value) lockPageScroll();
  } catch (err) {
    error.value = err.message || "读取帖子失败。";
    posts.value = [];
    selectedPostId.value = null;
  } finally {
    isLoading.value = false;
  }
}

function selectChannel(channel) {
  if (isStandalonePost.value) {
    window.location.href = channel === "all" ? "/community" : `/community?channel=${encodeURIComponent(channel)}`;
    return;
  }
  selectedChannel.value = channel;
  if (channel !== "all") form.channel = channel;
  closePost();
  loadPosts();
}

function openPost(post) {
  selectedPostId.value = post.id;
  editingPostId.value = null;
  postActionError.value = "";
  replyError.value = "";
  activeReplyPostId.value = null;
  lockPageScroll();
}

function closePost() {
  selectedPostId.value = null;
  editingPostId.value = null;
  activeReplyPostId.value = null;
  postActionError.value = "";
  replyError.value = "";
  unlockPageScroll();
}

function handleKeydown(event) {
  if (event.key === "Escape" && selectedPost.value) {
    closePost();
  }
}

function lockPageScroll() {
  document.body.classList.add("modal-open");
}

function unlockPageScroll() {
  document.body.classList.remove("modal-open");
}

async function submitPost() {
  await savePost(CommunityPostStatus.PUBLISHED);
}

async function saveDraft() {
  await savePost(CommunityPostStatus.DRAFT);
}

async function savePost(status) {
  error.value = "";
  success.value = "";
  if (form.title.length < 4) {
    error.value = "标题至少需要 4 个字符。";
    return;
  }
  if (status === CommunityPostStatus.PUBLISHED && form.body.length < 6) {
    error.value = "正文至少需要 6 个字符。";
    return;
  }
  if (status === CommunityPostStatus.DRAFT && form.body.length < 1) {
    error.value = "草稿正文至少需要 1 个字符。";
    return;
  }
  const attachmentError = validateSelectedAttachments(attachmentFiles.value);
  if (attachmentError) {
    error.value = attachmentError;
    return;
  }

  isSubmitting.value = true;
  try {
    const payload = buildPostPayload(form, status, attachmentFiles.value);
    const data = await createCommunityPost(payload);
    posts.value = [data.post, ...posts.value.filter((post) => post.id !== data.post.id)];
    selectedChannel.value = form.channel;
    selectedPostId.value = data.post.id;
    form.title = "";
    form.body = "";
    attachmentFiles.value = [];
    success.value = status === CommunityPostStatus.DRAFT ? "草稿已保存。" : "发布成功。";
  } catch (err) {
    error.value = err.message || "保存失败。";
  } finally {
    isSubmitting.value = false;
  }
}

function buildPostPayload(source, status, files = []) {
  if (!files.length) {
    return { ...source, status };
  }
  const payload = new FormData();
  payload.set("channel", source.channel);
  payload.set("title", source.title);
  payload.set("body", source.body);
  payload.set("status", status);
  for (const file of files) {
    payload.append("attachments", file);
  }
  return payload;
}

function handleAttachmentChange(event) {
  error.value = "";
  addAttachmentFiles(Array.from(event.target.files || []));
  event.target.value = "";
}

function handleComposerPaste(event) {
  const files = Array.from(event.clipboardData?.files || []);
  if (!files.length) return;
  addAttachmentFiles(files);
}

function handleComposerDragEnter() {
  composerDragDepth += 1;
  isComposerDragOver.value = true;
}

function handleComposerDragLeave() {
  composerDragDepth = Math.max(0, composerDragDepth - 1);
  if (!composerDragDepth) {
    isComposerDragOver.value = false;
  }
}

function handleComposerDrop(event) {
  composerDragDepth = 0;
  isComposerDragOver.value = false;
  addAttachmentFiles(Array.from(event.dataTransfer?.files || []));
}

function addAttachmentFiles(files) {
  if (!files.length) return;
  error.value = "";
  const merged = [...attachmentFiles.value, ...files].slice(0, maxAttachmentCount);
  const validationError = validateSelectedAttachments(merged, files.length + attachmentFiles.value.length > maxAttachmentCount);
  if (validationError) {
    error.value = validationError;
    if (merged.some((file) => file.size > maxAttachmentSize)) {
      return;
    }
  }
  attachmentFiles.value = merged;
}

function validateSelectedAttachments(files, exceededCount = false) {
  if (exceededCount || files.length > maxAttachmentCount) {
    return `一次最多添加 ${maxAttachmentCount} 个附件。`;
  }
  if (files.some((file) => file.size > maxAttachmentSize)) {
    return "单个附件不能超过 25MB。";
  }
  return "";
}

function removeAttachment(file) {
  attachmentFiles.value = attachmentFiles.value.filter((item) => item !== file);
}

function attachmentIcon(type = "") {
  if (type.startsWith("image/")) return "🖼";
  if (type.startsWith("video/")) return "🎬";
  return "📎";
}

function formatFileSize(size = 0) {
  if (!size) return "0 B";
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / 1024 / 1024).toFixed(size >= 10 * 1024 * 1024 ? 0 : 1)} MB`;
}

function startEdit(post) {
  postActionError.value = "";
  editingPostId.value = post.id;
  editForm.channel = post.channel;
  editForm.title = post.title;
  editForm.body = post.body;
}

function cancelEdit() {
  editingPostId.value = null;
  postActionError.value = "";
}

async function submitEdit(post, status = CommunityPostStatus.PUBLISHED) {
  postActionError.value = "";
  if (editForm.title.length < 4) {
    postActionError.value = "标题至少需要 4 个字符。";
    return;
  }
  if (status === CommunityPostStatus.PUBLISHED && editForm.body.length < 6) {
    postActionError.value = "正文至少需要 6 个字符。";
    return;
  }
  if (status === CommunityPostStatus.DRAFT && editForm.body.length < 1) {
    postActionError.value = "草稿正文至少需要 1 个字符。";
    return;
  }

  isPostActionBusy.value = true;
  try {
    const data = await updateCommunityPost(post.id, { ...editForm, status });
    posts.value = posts.value.map((item) => (item.id === post.id ? data.post : item));
    editingPostId.value = null;
  } catch (err) {
    postActionError.value = err.message || "更新失败。";
  } finally {
    isPostActionBusy.value = false;
  }
}

async function removePost(post) {
  postActionError.value = "";
  if (!window.confirm("确定删除这篇帖子吗？")) return;

  isPostActionBusy.value = true;
  try {
    await deleteCommunityPost(post.id);
    posts.value = posts.value.filter((item) => item.id !== post.id);
    if (selectedPostId.value === post.id) closePost();
  } catch (err) {
    postActionError.value = err.message || "删除失败。";
  } finally {
    isPostActionBusy.value = false;
  }
}

function excerpt(value) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  return text.length > 128 ? `${text.slice(0, 128)}...` : text;
}

function toggleReply(postId) {
  replyError.value = "";
  activeReplyPostId.value = activeReplyPostId.value === postId ? null : postId;
}

async function toggleLike(post) {
  if (!user.value) {
    error.value = "请先登录后再点赞。";
    return;
  }
  if (likeBusyPostId.value) return;
  likeBusyPostId.value = post.id;
  try {
    const data = await toggleCommunityPostLike(post.id);
    updatePostLikeState(post.id, data.liked, data.likeCount);
  } catch (err) {
    error.value = err.message || "点赞失败。";
  } finally {
    likeBusyPostId.value = null;
  }
}

function updatePostLikeState(postId, liked, likeCount) {
  posts.value = posts.value.map((item) =>
    item.id === postId ? { ...item, likedByMe: liked, likeCount } : item,
  );
}

async function toggleReplyLike(reply) {
  if (!user.value) {
    replyError.value = "请先登录后再点赞。";
    return;
  }
  if (likeBusyReplyId.value) return;
  likeBusyReplyId.value = reply.id;
  try {
    const data = await toggleCommunityReplyLike(reply.id);
    updateReplyState(reply.id, { likedByMe: data.liked, likeCount: data.likeCount });
  } catch (err) {
    replyError.value = err.message || "点赞失败。";
  } finally {
    likeBusyReplyId.value = null;
  }
}

async function togglePostReaction(post, emoji) {
  if (!user.value) {
    error.value = "请先登录后再添加表情。";
    return;
  }
  const key = `post:${post.id}:${emoji}`;
  if (reactionBusyKey.value) return;
  reactionBusyKey.value = key;
  try {
    const data = await toggleCommunityPostReaction(post.id, emoji);
    updatePostReactionState(post.id, data.reactions, data.myReactions);
  } catch (err) {
    error.value = err.message || "表情回应失败。";
  } finally {
    reactionBusyKey.value = "";
  }
}

async function toggleReplyReaction(reply, emoji) {
  if (!user.value) {
    replyError.value = "请先登录后再添加表情。";
    return;
  }
  const key = `reply:${reply.id}:${emoji}`;
  if (reactionBusyKey.value) return;
  reactionBusyKey.value = key;
  try {
    const data = await toggleCommunityReplyReaction(reply.id, emoji);
    updateReplyState(reply.id, { reactions: data.reactions, myReactions: data.myReactions });
  } catch (err) {
    replyError.value = err.message || "表情回应失败。";
  } finally {
    reactionBusyKey.value = "";
  }
}

function updatePostReactionState(postId, reactions, myReactions) {
  posts.value = posts.value.map((item) =>
    item.id === postId ? { ...item, reactions, myReactions } : item,
  );
}

function updateReplyState(replyId, patch) {
  posts.value = posts.value.map((post) => ({
    ...post,
    replies: (post.replies || []).map((reply) => (reply.id === replyId ? { ...reply, ...patch } : reply)),
  }));
}

function reactionCount(reactions, emoji) {
  return reactions?.find((reaction) => reaction.emoji === emoji)?.count || 0;
}

async function submitReply(post) {
  replyError.value = "";
  const body = (replyForms[post.id] || "").trim();
  if (!body) {
    replyError.value = "回复内容不能为空。";
    return;
  }

  isReplySubmitting.value = true;
  try {
    const data = await createCommunityReply(post.id, { body });
    posts.value = posts.value.map((item) =>
      item.id === post.id ? { ...item, replies: [...(item.replies || []), data.reply] } : item,
    );
    replyForms[post.id] = "";
    activeReplyPostId.value = null;
    await loadNotifications();
  } catch (err) {
    replyError.value = err.message || "回复失败。";
  } finally {
    isReplySubmitting.value = false;
  }
}

async function loadNotifications() {
  try {
    const data = await getCommunityNotifications();
    notifications.value = Array.isArray(data.notifications) ? data.notifications : [];
    unreadNotifications.value = Number(data.unread || 0);
  } catch {
    notifications.value = [];
    unreadNotifications.value = 0;
  }
}

async function toggleInbox() {
  isInboxOpen.value = !isInboxOpen.value;
  if (isInboxOpen.value) await loadNotifications();
}

async function markNotificationRead(notification) {
  if (notification.isRead) return;
  notification.isRead = true;
  unreadNotifications.value = Math.max(0, unreadNotifications.value - 1);
  try {
    await markCommunityNotificationsRead(notification.id);
  } catch {
    await loadNotifications();
  }
}

async function markAllNotificationsRead() {
  try {
    await markCommunityNotificationsRead();
    await loadNotifications();
  } catch {
    await loadNotifications();
  }
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

const CommunityPostStatus = {
  DRAFT: "draft",
  PUBLISHED: "published",
};
</script>
