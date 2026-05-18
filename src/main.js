import { createApp } from "vue";
import App from "./App.vue";
import "./styles.css";

createApp(App).mount("#app");

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
