<template>
  <section class="star-game-section content-section" aria-label="星球信使小游戏">
    <div
      ref="playfield"
      class="star-game-field"
      :class="`is-${status}`"
      role="application"
      aria-label="星球信使小游戏"
      tabindex="0"
      @pointermove="handlePointerMove"
      @pointerdown="handlePointerDown"
      @keydown="handleKeydown"
    >
      <div class="star-game-sky" aria-hidden="true">
        <span v-for="particle in particles" :key="particle.id" :style="particle.style" />
      </div>

      <div class="star-game-hud" aria-label="游戏数据">
        <span><strong>{{ score }}</strong><small>得分</small></span>
        <span><strong>{{ collected }}</strong><small>灵感</small></span>
        <span><strong>{{ remainingSeconds }}</strong><small>时间</small></span>
      </div>

      <img
        class="star-game-island"
        src="/assets/game/star-messenger/workbench-island.png"
        alt=""
        draggable="false"
      />
      <img
        class="star-game-mailbox"
        src="/assets/game/star-messenger/mailbox.png"
        alt=""
        draggable="false"
      />

      <button
        v-for="item in items"
        :key="item.id"
        class="star-game-item"
        :class="`is-${item.kind}`"
        type="button"
        :aria-label="item.kind === 'note' ? '收集社区纸条' : '收集灵感泡泡'"
        :style="{ left: `${item.x}%`, top: `${item.y}%` }"
        @pointerdown.stop="collectItem(item)"
        @click.prevent
      >
        <img :src="item.src" alt="" draggable="false" />
      </button>

      <img
        class="star-game-messenger"
        src="/assets/game/star-messenger/messenger.png"
        alt=""
        draggable="false"
        :style="{ left: `${messenger.x}%`, top: `${messenger.y}%` }"
      />

      <img
        class="star-game-sparkles"
        src="/assets/game/star-messenger/sparkles.png"
        alt=""
        draggable="false"
      />

      <div v-if="feedback" class="star-game-feedback" aria-hidden="true">
        {{ feedback }}
      </div>
      <p class="sr-only" aria-live="polite">{{ assistiveStatus }}</p>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, reactive, ref } from "vue";
import { getAnonymousGameId, submitStarMessengerResult } from "../services/game";

const GAME_SECONDS = 30;
const GAME_VERSION = "2026-06-mvp";
const bubbleAssets = [
  "/assets/game/star-messenger/bubble-yellow.png",
  "/assets/game/star-messenger/bubble-green.png",
  "/assets/game/star-messenger/bubble-blue.png",
];
const noteAssets = [
  "/assets/game/star-messenger/note-heart.png",
  "/assets/game/star-messenger/note-star.png",
  "/assets/game/star-messenger/note-leaf.png",
];

const playfield = ref(null);
const status = ref("idle");
const score = ref(0);
const collected = ref(0);
const noteCount = ref(0);
const remainingMs = ref(GAME_SECONDS * 1000);
const items = ref([]);
const feedback = ref("");
const submitState = ref("idle");
const submitWarning = ref("");
const messenger = reactive({ x: 28, y: 58 });
const particles = Array.from({ length: 18 }, (_, index) => ({
  id: index,
  style: {
    "--x": `${8 + ((index * 17) % 86)}%`,
    "--y": `${12 + ((index * 23) % 72)}%`,
    "--delay": `${(index % 6) * -0.55}s`,
    "--scale": `${0.72 + (index % 4) * 0.12}`,
  },
}));

let animationFrame = 0;
let startedAt = 0;
let lastFrameAt = 0;
let lastSpawnAt = 0;
let gameStartedAtIso = "";
let feedbackTimer = 0;
let itemId = 0;
let restartTimer = 0;

const remainingSeconds = computed(() => Math.max(0, Math.ceil(remainingMs.value / 1000)));
const statusText = computed(() => {
  if (submitState.value === "submitting") return "正在保存本轮成绩...";
  if (submitWarning.value) return submitWarning.value;
  if (status.value === "running") return "灵感正在漂浮。";
  if (status.value === "ended") return `得分 ${score.value}，已完成一次社区投递。`;
  return "社区星球正在等一封小信。";
});
const assistiveStatus = computed(() => (
  `状态 ${statusText.value} 得分 ${score.value} 灵感 ${collected.value} 剩余 ${remainingSeconds.value} 秒`
));

function startGame({ shouldFocus = false } = {}) {
  window.cancelAnimationFrame(animationFrame);
  window.clearTimeout(feedbackTimer);
  window.clearTimeout(restartTimer);
  status.value = "running";
  submitState.value = "idle";
  submitWarning.value = "";
  score.value = 0;
  collected.value = 0;
  noteCount.value = 0;
  remainingMs.value = GAME_SECONDS * 1000;
  items.value = [];
  feedback.value = "";
  messenger.x = 28;
  messenger.y = 58;
  itemId = 0;
  startedAt = performance.now();
  lastFrameAt = startedAt;
  lastSpawnAt = startedAt - 900;
  gameStartedAtIso = new Date().toISOString();
  for (let index = 0; index < 6; index += 1) {
    spawnItem(index * 90);
  }
  if (shouldFocus) {
    nextTick(() => playfield.value?.focus({ preventScroll: true }));
  }
  animationFrame = window.requestAnimationFrame(tick);
}

function endGame() {
  if (status.value !== "running") return;
  status.value = "ended";
  remainingMs.value = 0;
  window.cancelAnimationFrame(animationFrame);
  submitResult();
}

async function submitResult() {
  submitState.value = "submitting";
  const durationMs = Math.max(0, Date.now() - new Date(gameStartedAtIso).getTime());
  const payload = {
    gameKey: "star-messenger",
    gameVersion: GAME_VERSION,
    anonymousId: getAnonymousGameId(),
    startedAt: gameStartedAtIso,
    endedAt: new Date().toISOString(),
    score: score.value,
    collectCount: collected.value,
    noteCount: noteCount.value,
    durationMs,
    deviceType: window.matchMedia?.("(pointer: coarse)").matches ? "mobile" : "desktop",
    completed: true,
  };

  try {
    const data = await submitStarMessengerResult(payload);
    submitState.value = data.storedLocally ? "local" : "saved";
    submitWarning.value = data.storedLocally ? "后端暂不可用，本轮成绩已保存在本地。" : "成绩已保存。";
  } catch {
    submitState.value = "error";
    submitWarning.value = "成绩暂时没有保存成功，请稍后再试。";
  } finally {
    restartTimer = window.setTimeout(() => {
      if (status.value === "ended") startGame();
    }, 900);
  }
}

function tick(now) {
  if (status.value !== "running") return;
  const elapsed = now - startedAt;
  const delta = Math.min(42, now - lastFrameAt);
  lastFrameAt = now;
  remainingMs.value = Math.max(0, GAME_SECONDS * 1000 - elapsed);

  if (now - lastSpawnAt > 820 && items.value.length < 9) {
    spawnItem();
    lastSpawnAt = now;
  }

  for (const item of items.value) {
    item.x += item.driftX * delta;
    item.y += item.driftY * delta;
    if (item.x < 12 || item.x > 88) item.driftX *= -1;
    if (item.y < 16 || item.y > 78) item.driftY *= -1;
  }
  checkCollisions();

  if (remainingMs.value <= 0) {
    endGame();
    return;
  }
  animationFrame = window.requestAnimationFrame(tick);
}

function spawnItem(offset = 0) {
  const isNote = Math.random() > 0.74;
  const assets = isNote ? noteAssets : bubbleAssets;
  items.value.push({
    id: `${Date.now()}-${itemId += 1}`,
    kind: isNote ? "note" : "bubble",
    src: assets[itemId % assets.length],
    x: 34 + Math.random() * 49 + offset / 80,
    y: 18 + Math.random() * 50,
    driftX: (Math.random() - 0.5) * 0.006,
    driftY: (Math.random() - 0.5) * 0.005,
    value: isNote ? 20 : 12,
  });
}

function handlePointerDown(event) {
  if (status.value !== "running") {
    startGame({ shouldFocus: true });
    return;
  }
  handlePointerMove(event);
}

function handlePointerMove(event) {
  if (!playfield.value) return;
  const rect = playfield.value.getBoundingClientRect();
  messenger.x = clamp(((event.clientX - rect.left) / rect.width) * 100, 12, 88);
  messenger.y = clamp(((event.clientY - rect.top) / rect.height) * 100, 22, 80);
  if (status.value === "running") {
    checkCollisions();
  }
}

function handleKeydown(event) {
  if (event.key === " " || event.key === "Enter") {
    event.preventDefault();
    if (status.value !== "running") startGame({ shouldFocus: true });
  }

  if (status.value !== "running") return;
  const step = event.shiftKey ? 8 : 5;
  const keys = new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]);
  if (!keys.has(event.key)) return;
  event.preventDefault();
  if (event.key === "ArrowUp") messenger.y = clamp(messenger.y - step, 22, 80);
  if (event.key === "ArrowDown") messenger.y = clamp(messenger.y + step, 22, 80);
  if (event.key === "ArrowLeft") messenger.x = clamp(messenger.x - step, 12, 88);
  if (event.key === "ArrowRight") messenger.x = clamp(messenger.x + step, 12, 88);
  checkCollisions();
}

function checkCollisions() {
  const hit = items.value.find((item) => {
    const dx = item.x - messenger.x;
    const dy = (item.y - messenger.y) * 1.25;
    return Math.sqrt(dx * dx + dy * dy) < (item.kind === "note" ? 9.8 : 8.6);
  });
  if (hit) {
    collectItem(hit);
  }
}

function collectItem(item) {
  if (status.value !== "running") return;
  items.value = items.value.filter((candidate) => candidate.id !== item.id);
  score.value += item.value;
  collected.value += 1;
  if (item.kind === "note") noteCount.value += 1;
  showFeedback(`+${item.value}`);
}

function showFeedback(text) {
  feedback.value = text;
  window.clearTimeout(feedbackTimer);
  feedbackTimer = window.setTimeout(() => {
    feedback.value = "";
  }, 460);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

onMounted(() => {
  nextTick(() => startGame());
});

onUnmounted(() => {
  window.cancelAnimationFrame(animationFrame);
  window.clearTimeout(feedbackTimer);
  window.clearTimeout(restartTimer);
});
</script>
