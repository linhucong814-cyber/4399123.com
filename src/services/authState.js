import { reactive } from "vue";
import { getCurrentUser, logoutUser } from "./auth";

// Global auth state singleton. Every component subscribes to this instead of
// calling /api/auth/me itself, so each page load fetches the session once.
export const authState = reactive({
  user: null,
  isLoading: false,
  isLoaded: false,
});

let inflight = null;

export function refreshAuth(force = false) {
  if (inflight) return inflight;
  if (authState.isLoaded && !force) return Promise.resolve(authState.user);
  authState.isLoading = true;
  inflight = getCurrentUser()
    .then((data) => {
      authState.user = data.user || null;
      return authState.user;
    })
    .catch(() => {
      authState.user = null;
      return null;
    })
    .finally(() => {
      authState.isLoading = false;
      authState.isLoaded = true;
      inflight = null;
    });
  return inflight;
}

export function setAuthUser(user) {
  authState.user = user || null;
  authState.isLoaded = true;
  window.dispatchEvent(new CustomEvent("auth:user-updated", { detail: { user: authState.user } }));
}

export async function logoutAndClear() {
  try {
    await logoutUser();
  } finally {
    setAuthUser(null);
  }
}
