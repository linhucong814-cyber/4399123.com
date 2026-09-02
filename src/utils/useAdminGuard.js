import { computed, onMounted, ref } from "vue";
import { authState, refreshAuth } from "../services/authState";

// Shared guard for /admin* pages. Resolves the current user via the global
// authState singleton and exposes gate flags. Anonymous users are redirected
// to /login?next=...; non-staff users see an in-page "no permission" state.
export function useAdminGuard() {
  const isChecking = ref(true);

  const user = computed(() => authState.user);
  const isAdmin = computed(() => Boolean(user.value && user.value.isAdmin));
  const isAnonymous = computed(() => !isChecking.value && !user.value);
  const isForbidden = computed(() => !isChecking.value && !!user.value && !isAdmin.value);

  onMounted(async () => {
    isChecking.value = true;
    try {
      await refreshAuth();
    } finally {
      isChecking.value = false;
      if (isAnonymous.value) {
        const next = window.location.pathname + window.location.search;
        window.location.href = `/login?next=${encodeURIComponent(next)}`;
      }
    }
  });

  return { user, isAdmin, isAnonymous, isForbidden, isChecking };
}
