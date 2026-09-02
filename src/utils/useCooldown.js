import { onUnmounted, ref } from "vue";

// Shared countdown helper for "resend code/email" buttons.
export function useCooldown() {
  const cooldownSeconds = ref(0);
  let timer = 0;

  function stopCooldown() {
    if (timer) {
      window.clearInterval(timer);
      timer = 0;
    }
  }

  function startCooldown(seconds) {
    cooldownSeconds.value = Math.max(0, Math.ceil(Number(seconds) || 0));
    stopCooldown();
    if (cooldownSeconds.value <= 0) return;
    timer = window.setInterval(() => {
      cooldownSeconds.value = Math.max(0, cooldownSeconds.value - 1);
      if (cooldownSeconds.value <= 0) stopCooldown();
    }, 1000);
  }

  onUnmounted(stopCooldown);

  return { cooldownSeconds, startCooldown, stopCooldown };
}
