const progress = document.querySelector("#scroll-progress");
const statusEl = document.querySelector("#copy-status");
const navLinks = [...document.querySelectorAll(".top-nav a, .toc a")];
const sections = [...document.querySelectorAll("section[id]")];

function updateProgress() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const width = max > 0 ? (scrollTop / max) * 100 : 0;
  progress.style.width = `${Math.min(100, Math.max(0, width))}%`;
}

window.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", updateProgress);
updateProgress();

const observer = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;

    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`);
    });
  },
  {
    rootMargin: "-20% 0px -65% 0px",
    threshold: [0.05, 0.2, 0.5],
  },
);

sections.forEach((section) => observer.observe(section));

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

document.querySelectorAll("[data-copy-target]").forEach((button) => {
  button.addEventListener("click", async () => {
    const target = document.querySelector(button.dataset.copyTarget);
    if (!target) return;

    const text = target.innerText.trim();
    const original = button.innerHTML;

    try {
      await copyText(text);
      button.classList.add("copied");
      button.textContent = "已复制";
      statusEl.textContent = "模板已复制，可以直接粘贴给 Codex。";
      window.setTimeout(() => {
        button.classList.remove("copied");
        button.innerHTML = original;
        statusEl.textContent = "";
      }, 1800);
    } catch {
      statusEl.textContent = "复制失败，请手动选中文本复制。";
    }
  });
});

const filterButtons = [...document.querySelectorAll("[data-filter]")];
const templateCards = [...document.querySelectorAll(".template-card")];

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((item) => item.classList.toggle("active", item === button));
    templateCards.forEach((card) => {
      const show = filter === "all" || card.dataset.category === filter;
      card.classList.toggle("is-hidden", !show);
    });
  });
});
