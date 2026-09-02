import { createApp } from "vue";
import App from "./App.vue";
import "./styles.css";
import "./runway.css";
import "./minimal-home.css";

const app = createApp(App);

app.directive("reveal", {
  mounted(el, binding) {
    el.classList.add("motion-reveal");

    const index = Number(binding.value);
    if (Number.isFinite(index)) {
      el.style.setProperty("--reveal-index", String(Math.min(index, 8)));
    }

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      el.classList.add("is-visible");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.classList.add("is-visible");
        observer.disconnect();
      },
      {
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.12,
      },
    );

    observer.observe(el);
    el.__motionRevealObserver = observer;
  },
  unmounted(el) {
    el.__motionRevealObserver?.disconnect();
  },
});

app.mount("#app");

if ("serviceWorker" in navigator) {
  let refreshingForServiceWorker = false;
  const hadServiceWorkerController = Boolean(navigator.serviceWorker.controller);

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!hadServiceWorkerController) return;
    if (refreshingForServiceWorker) return;
    refreshingForServiceWorker = true;
    window.location.reload();
  });

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => registration.update())
      .catch(() => {});
  });
}

function openOfflineFallback() {
  if (!window.location.pathname.startsWith("/404notfound")) {
    window.location.assign("/404notfound/");
  }
}

window.addEventListener("offline", openOfflineFallback);

if (navigator.onLine === false) {
  openOfflineFallback();
}
