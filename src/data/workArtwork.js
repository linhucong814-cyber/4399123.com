// Generated artwork is versioned separately from user-uploaded covers.
export const workArtwork = {
  "prompt-library": {
    "icon": "/assets/works/art-20261015/prompt-library-icon.webp",
    "cover": "/assets/works/art-20261015/prompt-library-cover.webp"
  },
  "agent-prompt-template": {
    "icon": "/assets/works/art-20261015/agent-prompt-template-icon.webp",
    "cover": "/assets/works/art-20261015/agent-prompt-template-cover.webp"
  },
  "openclaw-easy-config": {
    "icon": "/assets/works/art-20261015/openclaw-easy-config-icon.webp",
    "cover": "/assets/works/art-20261015/openclaw-easy-config-cover.webp"
  },
  "print-garden": {
    "icon": "/assets/works/art-20261015/print-garden-icon.webp",
    "cover": "/assets/works/art-20261015/print-garden-cover.webp"
  },
  "codex-goal-launcher": {
    "icon": "/assets/works/art-20261015/codex-goal-launcher-icon.webp",
    "cover": "/assets/works/art-20261015/codex-goal-launcher-cover.webp"
  },
  "codex-tutorial": {
    "icon": "/assets/works/art-20261015/codex-tutorial-icon.webp",
    "cover": "/vibe-coding/codex-tutorial/assets/codex-workflow.png"
  },
  "404notfound": {
    "icon": "/assets/works/art-20261015/404notfound-icon.webp",
    "cover": "/assets/blog/404notfound-offline-fishman-cover.png"
  },
  "4399123com-1": {
    "icon": "/assets/works/art-20261015/4399123com-1-icon.webp"
  }
};

function artworkFor(work = {}) {
  if (workArtwork[work.slug]) return workArtwork[work.slug];
  const path = String(work.projectUrl || work.href || "").split(/[?#]/)[0];
  if (!path.startsWith("/") || path.startsWith("//")) return undefined;
  const slug = path.replace(/\/$/, "").split("/").pop();
  return workArtwork[slug];
}

export function workIconUrl(work = {}) {
  return artworkFor(work)?.icon || work.iconUrl || work.coverUrl || "";
}

export function workCoverUrl(work = {}) {
  const current = work.coverUrl || work.image || work.cover || "";
  const artwork = artworkFor(work);
  const placeholder = !current || current === "/assets/brand/4399123-domain-logo-transparent.png"
    || current === "/assets/brand/project-cover-placeholder.svg"
    || current.startsWith("/assets/works/icons/");
  // A later uploaded custom cover must continue to take precedence.
  return placeholder && artwork?.cover ? artwork.cover : current;
}
