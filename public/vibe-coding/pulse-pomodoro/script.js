const STORAGE_KEY = "pulse-pomodoro-state";
const TODAY_KEY = new Date().toISOString().slice(0, 10);

const modes = {
  focus: { label: "专注", ready: "准备专注", done: "专注完成" },
  shortBreak: { label: "短休息", ready: "准备短休息", done: "短休息结束" },
  longBreak: { label: "长休息", ready: "准备长休息", done: "长休息结束" },
};

const elements = {
  tabs: document.querySelectorAll(".mode-tab"),
  time: document.querySelector("#time-display"),
  state: document.querySelector("#state-label"),
  cycle: document.querySelector("#cycle-label"),
  progress: document.querySelector(".ring-progress"),
  startPause: document.querySelector("#start-pause"),
  reset: document.querySelector("#reset"),
  skip: document.querySelector("#skip"),
  status: document.querySelector("#status-strip"),
  focusMinutes: document.querySelector("#focus-minutes"),
  shortMinutes: document.querySelector("#short-minutes"),
  longMinutes: document.querySelector("#long-minutes"),
  cycles: document.querySelector("#cycles"),
  autoStart: document.querySelector("#auto-start"),
  soundEnabled: document.querySelector("#sound-enabled"),
  completedFocus: document.querySelector("#completed-focus"),
  totalMinutes: document.querySelector("#total-minutes"),
  currentMode: document.querySelector("#current-mode"),
  nextLabel: document.querySelector("#next-label"),
  toast: document.querySelector("#toast"),
};

const circumference = 2 * Math.PI * 104;
elements.progress.style.strokeDasharray = `${circumference}`;

const defaultState = {
  mode: "focus",
  remaining: 25 * 60,
  running: false,
  cycle: 1,
  settings: {
    focus: 25,
    shortBreak: 5,
    longBreak: 15,
    cycles: 4,
    autoStart: false,
    soundEnabled: true,
  },
  stats: {
    date: TODAY_KEY,
    completedFocus: 0,
    totalMinutes: 0,
  },
};

let state = loadState();
let timerId = null;
let lastTick = Date.now();

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!parsed) return structuredClone(defaultState);
    const merged = {
      ...defaultState,
      ...parsed,
      settings: { ...defaultState.settings, ...parsed.settings },
      stats: { ...defaultState.stats, ...parsed.stats },
    };
    if (merged.stats.date !== TODAY_KEY) {
      merged.stats = { ...defaultState.stats };
    }
    merged.running = false;
    return merged;
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, running: false }));
}

function durationFor(mode = state.mode) {
  return Math.max(1, Number(state.settings[mode] || defaultState.settings[mode])) * 60;
}

function clampInput(input, fallback) {
  const min = Number(input.min);
  const max = Number(input.max);
  const value = Number(input.value);
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.round(value)));
}

function formatTime(seconds) {
  const safe = Math.max(0, Math.ceil(seconds));
  const minutes = String(Math.floor(safe / 60)).padStart(2, "0");
  const rest = String(safe % 60).padStart(2, "0");
  return `${minutes}:${rest}`;
}

function updateDocumentTitle() {
  document.title = `${formatTime(state.remaining)} · ${modes[state.mode].label} | Pulse Pomodoro`;
}

function nextMode() {
  if (state.mode !== "focus") return "focus";
  return state.cycle >= state.settings.cycles ? "longBreak" : "shortBreak";
}

function syncInputs() {
  elements.focusMinutes.value = state.settings.focus;
  elements.shortMinutes.value = state.settings.shortBreak;
  elements.longMinutes.value = state.settings.longBreak;
  elements.cycles.value = state.settings.cycles;
  elements.autoStart.checked = state.settings.autoStart;
  elements.soundEnabled.checked = state.settings.soundEnabled;
}

function render() {
  const duration = durationFor();
  const progress = duration ? 1 - state.remaining / duration : 0;
  elements.progress.style.strokeDashoffset = `${circumference * (1 - Math.max(0, Math.min(1, progress)))}`;
  elements.time.textContent = formatTime(state.remaining);
  elements.state.textContent = state.running ? `${modes[state.mode].label}进行中` : modes[state.mode].ready;
  elements.cycle.textContent = `第 ${state.cycle} 轮 / 共 ${state.settings.cycles} 轮`;
  elements.startPause.textContent = state.running ? "暂停" : "开始";
  elements.status.textContent = state.running
    ? "计时进行中，关闭页面前会保留当前设置和今日统计。"
    : "设置时间后点击开始，当前配置会自动保存。";
  elements.currentMode.textContent = modes[state.mode].label;
  elements.completedFocus.textContent = state.stats.completedFocus;
  elements.totalMinutes.textContent = state.stats.totalMinutes;
  elements.nextLabel.textContent = `完成后进入${modes[nextMode()].label}`;
  elements.tabs.forEach((tab) => tab.classList.toggle("is-active", tab.dataset.mode === state.mode));
  updateDocumentTitle();
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => elements.toast.classList.remove("is-visible"), 2200);
}

function chime() {
  if (!state.settings.soundEnabled) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const context = new AudioContext();
  const gain = context.createGain();
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.18, context.currentTime + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.7);
  gain.connect(context.destination);
  [660, 880].forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    oscillator.connect(gain);
    oscillator.start(context.currentTime + index * 0.13);
    oscillator.stop(context.currentTime + 0.62 + index * 0.13);
  });
}

function notify(message) {
  showToast(message);
  chime();
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("Pulse Pomodoro", { body: message });
  }
}

function setMode(mode, keepRunning = false) {
  state.mode = mode;
  state.remaining = durationFor(mode);
  state.running = keepRunning;
  lastTick = Date.now();
  saveState();
  render();
}

function completeStage() {
  const finishedMode = state.mode;
  if (finishedMode === "focus") {
    state.stats.completedFocus += 1;
    state.stats.totalMinutes += state.settings.focus;
  }

  const incoming = nextMode();
  if (finishedMode === "longBreak") {
    state.cycle = 1;
  } else if (finishedMode === "shortBreak") {
    state.cycle = Math.min(state.settings.cycles, state.cycle + 1);
  }

  notify(`${modes[finishedMode].done}，接下来是${modes[incoming].label}。`);
  state.mode = incoming;
  state.remaining = durationFor(incoming);
  state.running = state.settings.autoStart;
  lastTick = Date.now();
  saveState();
  render();
  if (state.running) startTicker();
}

function tick() {
  const now = Date.now();
  const elapsed = Math.max(0, Math.floor((now - lastTick) / 1000));
  if (elapsed > 0) {
    state.remaining -= elapsed;
    lastTick = now;
  }
  if (state.remaining <= 0) {
    state.remaining = 0;
    stopTicker(false);
    completeStage();
    return;
  }
  render();
}

function startTicker() {
  window.clearInterval(timerId);
  timerId = window.setInterval(tick, 250);
}

function stopTicker(update = true) {
  window.clearInterval(timerId);
  timerId = null;
  if (update) {
    state.running = false;
    saveState();
    render();
  }
}

function toggleTimer() {
  if (state.running) {
    stopTicker();
    showToast("已暂停");
    return;
  }
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission().catch(() => {});
  }
  state.running = true;
  lastTick = Date.now();
  startTicker();
  render();
}

function resetTimer() {
  stopTicker(false);
  state.running = false;
  state.remaining = durationFor();
  saveState();
  render();
  showToast("当前阶段已重置");
}

function skipStage() {
  stopTicker(false);
  state.remaining = 0;
  completeStage();
}

function updateSettings() {
  const previousDuration = durationFor();
  const elapsedRatio = previousDuration ? state.remaining / previousDuration : 1;
  state.settings.focus = clampInput(elements.focusMinutes, defaultState.settings.focus);
  state.settings.shortBreak = clampInput(elements.shortMinutes, defaultState.settings.shortBreak);
  state.settings.longBreak = clampInput(elements.longMinutes, defaultState.settings.longBreak);
  state.settings.cycles = clampInput(elements.cycles, defaultState.settings.cycles);
  state.settings.autoStart = elements.autoStart.checked;
  state.settings.soundEnabled = elements.soundEnabled.checked;
  state.cycle = Math.min(state.cycle, state.settings.cycles);
  if (!state.running) {
    state.remaining = Math.round(durationFor() * elapsedRatio);
  }
  syncInputs();
  saveState();
  render();
  showToast("设置已保存");
}

elements.tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    stopTicker(false);
    setMode(tab.dataset.mode);
  });
});

elements.startPause.addEventListener("click", toggleTimer);
elements.reset.addEventListener("click", resetTimer);
elements.skip.addEventListener("click", skipStage);

[
  elements.focusMinutes,
  elements.shortMinutes,
  elements.longMinutes,
  elements.cycles,
  elements.autoStart,
  elements.soundEnabled,
].forEach((control) => {
  control.addEventListener("change", updateSettings);
});

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const target = document.querySelector(anchor.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

syncInputs();
render();
