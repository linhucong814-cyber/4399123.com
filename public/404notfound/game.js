const setFrame = (setName, index) => (
  `./assets/fishman_transparent/${setName}/aligned/${setName}_${String(index).padStart(2, "0")}.png`
);

const idleFrames = [1, 2, 3, 4, 5, 6].map((index) => setFrame("set_d", index));
const reactionFrames = [2, 3, 7, 8, 13, 14, 20, 24, 29, 30].map((index) => setFrame("set_a", index));

const state = {
  hits: 0,
  cursorX: -100,
  cursorY: -100,
  reactionTimer: 0,
};

const monsterWrap = document.querySelector("#monsterWrap");
const monster = document.querySelector("#monster");
const slash = document.querySelector("#slash");
const knifeCursor = document.querySelector("#knifeCursor");
const HOME_URL = "/";

[
  ...idleFrames,
  ...reactionFrames,
  "./assets/ui/knife-cursor.png",
  "./assets/ui/slash.png",
].forEach((src) => {
  const image = new Image();
  image.src = src;
});

function updateCursor(event) {
  state.cursorX = event.clientX - 14;
  state.cursorY = event.clientY - 14;
  knifeCursor.style.setProperty("--cursor-x", `${state.cursorX}px`);
  knifeCursor.style.setProperty("--cursor-y", `${state.cursorY}px`);
  knifeCursor.style.transform = `translate3d(${state.cursorX}px, ${state.cursorY}px, 0) rotate(-25deg)`;
}

function replayClass(element, className) {
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
}

function isMonsterHit(event) {
  const rect = monster.getBoundingClientRect();
  return (
    event.clientX >= rect.left + rect.width * 0.12 &&
    event.clientX <= rect.right - rect.width * 0.12 &&
    event.clientY >= rect.top + rect.height * 0.06 &&
    event.clientY <= rect.bottom - rect.height * 0.08
  );
}

function settleToIdle() {
  const moodIndex = Math.min(Math.floor(state.hits / 3), idleFrames.length - 1);
  monster.src = idleFrames[moodIndex];
  replayClass(monsterWrap, "rest");
}

function interact(event) {
  updateCursor(event);
  replayClass(knifeCursor, "swing");

  if (!isMonsterHit(event)) {
    return;
  }

  state.hits += 1;
  monster.src = reactionFrames[state.hits % reactionFrames.length];
  replayClass(monsterWrap, "hit");
  replayClass(slash, "show");

  window.clearTimeout(state.reactionTimer);
  state.reactionTimer = window.setTimeout(settleToIdle, 260);
}

function idleBlink() {
  if (state.hits === 0) {
    monster.src = idleFrames[1];
    window.setTimeout(() => {
      if (state.hits === 0) {
        monster.src = idleFrames[0];
      }
    }, 320);
  }
}

function returnHomeWhenOnline() {
  window.setTimeout(() => {
    if (navigator.onLine) {
      window.location.assign(HOME_URL);
    }
  }, 800);
}

window.addEventListener("pointermove", updateCursor, { passive: true });
window.addEventListener("pointerdown", interact);
window.addEventListener("online", returnHomeWhenOnline);
window.setInterval(idleBlink, 3600);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js");
  });
}
