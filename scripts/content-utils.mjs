import { promises as fs } from "node:fs";
import path from "node:path";

export const siteUrl = "https://4399123.com";
export const siteDescription =
  "4399123 是一个开放的 vibe coding 创作者社区基础设施，连接创作者、项目、想法和社区反馈。";

export async function readContent(rootDir = process.cwd()) {
  const contentDir = path.join(rootDir, "content");
  const categories = ["thoughts", "projects", "interesting"];
  const items = [];

  for (const category of categories) {
    const dir = path.join(contentDir, category);
    let files = [];
    try {
      files = await fs.readdir(dir);
    } catch {
      continue;
    }

    for (const file of files.filter((name) => name.endsWith(".json")).sort()) {
      const fullPath = path.join(dir, file);
      const raw = await fs.readFile(fullPath, "utf8");
      const item = JSON.parse(raw);
      const body = Array.isArray(item.body) ? item.body : String(item.body || "").split(/\n+/);
      items.push({
        ...item,
        category: item.category || category,
        tags: Array.isArray(item.tags) ? item.tags : [],
        body,
        content: body.join("\n\n"),
      });
    }
  }

  return items.sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

export function contentUrl(item) {
  if (item.category === "projects" && item.href) {
    return item.href;
  }
  return `/blog/${encodeURIComponent(item.slug)}`;
}

export function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function absoluteUrl(value) {
  return new URL(value || "/", siteUrl).toString();
}
