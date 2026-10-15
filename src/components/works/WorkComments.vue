<template>
  <section class="work-comments" aria-labelledby="work-comments-title">
    <h2 id="work-comments-title">评论 {{ count }}</h2>

    <form v-if="canComment" class="work-comment-form" @submit.prevent="submit(null)">
      <label class="sr-only" for="work-comment-input">写评论</label>
      <textarea id="work-comment-input" v-model="draft" maxlength="1000" rows="3" placeholder="说说你玩下来的感受，或给作者一个建议"></textarea>
      <div class="work-comment-actions">
        <span class="work-comment-hint">{{ draft.length }}/1000</span>
        <button class="work-comment-submit" type="submit" :disabled="busy || !draft.trim()">{{ busy ? "发送中..." : "发表评论" }}</button>
      </div>
    </form>
    <p v-else class="work-comment-login"><a :href="loginUrl">登录</a>后参与评论。</p>
    <p v-if="message" class="form-message" :class="{ 'error-state': isError }" role="status">{{ message }}</p>

    <p v-if="loading" class="work-comment-empty">正在读取评论...</p>
    <p v-else-if="!threads.length" class="work-comment-empty">还没有评论，来写第一条吧。</p>
    <ol v-else class="work-comment-list">
      <li v-for="thread in threads" :key="thread.id" class="work-comment">
        <WorkCommentItem :comment="thread" @reply="startReply(thread)" @delete="remove(thread)" />
        <ol v-if="thread.replies.length" class="work-comment-replies">
          <li v-for="reply in thread.replies" :key="reply.id">
            <WorkCommentItem :comment="reply" @reply="startReply(thread, reply)" @delete="remove(reply)" />
          </li>
        </ol>
        <form v-if="replyTo && replyTo.rootId === thread.id" class="work-comment-form is-reply" @submit.prevent="submit(replyTo.targetId)">
          <label class="sr-only" :for="`reply-${thread.id}`">回复</label>
          <textarea :id="`reply-${thread.id}`" v-model="replyDraft" maxlength="1000" rows="2" :placeholder="`回复 @${replyTo.username}`"></textarea>
          <div class="work-comment-actions">
            <button class="work-comment-cancel" type="button" @click="replyTo = null">取消</button>
            <button class="work-comment-submit" type="submit" :disabled="busy || !replyDraft.trim()">回复</button>
          </div>
        </form>
      </li>
    </ol>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import WorkCommentItem from "./WorkCommentItem.vue";
import { deleteWorkComment, getWorkComments, postWorkComment } from "../../services/works";

const props = defineProps({
  slug: { type: String, required: true },
  canComment: { type: Boolean, default: false },
  initialCount: { type: Number, default: 0 },
});
const emit = defineEmits(["count"]);

const threads = ref([]);
const count = ref(props.initialCount);
const loading = ref(true);
const busy = ref(false);
const draft = ref("");
const replyDraft = ref("");
const replyTo = ref(null);
const message = ref("");
const isError = ref(false);
const loginUrl = computed(() => `/login?next=${encodeURIComponent(`/works/${props.slug}`)}`);

onMounted(load);
watch(() => props.slug, load);

async function load() {
  loading.value = true;
  try {
    const data = await getWorkComments(props.slug);
    threads.value = Array.isArray(data.comments) ? data.comments : [];
    setCount(data.commentCount ?? count.value);
  } catch {
    threads.value = [];
  } finally {
    loading.value = false;
  }
}

function setCount(value) {
  count.value = value;
  emit("count", value);
}

function startReply(thread, reply = null) {
  const target = reply || thread;
  replyTo.value = { rootId: thread.id, targetId: target.id, username: target.author?.username || "" };
  replyDraft.value = "";
}

async function submit(parentId) {
  const body = (parentId ? replyDraft.value : draft.value).trim();
  if (!body || busy.value) return;
  busy.value = true;
  message.value = "";
  try {
    const data = await postWorkComment(props.slug, body, parentId);
    if (parentId) {
      replyDraft.value = "";
      replyTo.value = null;
    } else {
      draft.value = "";
    }
    setCount(data.commentCount);
    await load();
  } catch (err) {
    isError.value = true;
    message.value = err.status === 429 ? "评论太频繁了，请稍后再试。" : err.message || "评论失败。";
  } finally {
    busy.value = false;
  }
}

async function remove(comment) {
  if (busy.value || !window.confirm("确定删除这条评论吗？")) return;
  busy.value = true;
  try {
    const data = await deleteWorkComment(comment.id);
    setCount(data.commentCount);
    await load();
  } catch (err) {
    isError.value = true;
    message.value = err.message || "删除失败。";
  } finally {
    busy.value = false;
  }
}
</script>
