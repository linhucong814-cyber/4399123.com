const contentModules = import.meta.glob("../../content/**/*.json", {
  eager: true,
  import: "default",
});

function normalizeItem(item, path) {
  const categoryFromPath = path.split("/").at(-2) || "thoughts";
  const category = item.category || categoryFromPath;
  const body = Array.isArray(item.body) ? item.body : String(item.body || "").split(/\n+/);

  return {
    ...item,
    id: item.slug,
    slug: item.slug,
    category,
    tags: Array.isArray(item.tags) ? item.tags : [],
    cover: item.cover || "",
    content: body.join("\n\n"),
    date: formatDate(item.date),
    isoDate: item.date,
  };
}

function formatDate(value) {
  if (!value) return "";
  return String(value).replaceAll("-", "/");
}

export const contentItems = Object.entries(contentModules)
  .map(([path, item]) => normalizeItem(item, path))
  .sort((a, b) => String(b.isoDate).localeCompare(String(a.isoDate)));

export const thoughtPosts = contentItems.filter((item) => item.category === "thoughts");
export const projectItems = contentItems.filter((item) => item.category === "projects");
export const interestingItems = contentItems.filter((item) => item.category === "interesting");

export const localBlogPosts = thoughtPosts;

export const localVibeCodingProjects = projectItems.map((item, index) => ({
  id: item.slug,
  eyebrow: item.eyebrow || `Vibe Coding / ${String(index + 1).padStart(3, "0")}`,
  title: item.title,
  description: item.summary,
  href: item.href || `/blog/${encodeURIComponent(item.slug)}`,
  image: item.cover || "/assets/brand/4399123-domain-logo-transparent.png",
  imageAlt: item.title,
  actionLabel: item.actionLabel || "打开记录",
  date: item.date,
  tags: item.tags,
}));
