import { promises as fs } from "node:fs";
import path from "node:path";
import { absoluteUrl, contentUrl, escapeHtml, readContent, siteDescription, siteUrl } from "./content-utils.mjs";

const root = process.cwd();
const distDir = path.join(root, "dist");
const indexPath = path.join(distDir, "index.html");
const indexHtml = await fs.readFile(indexPath, "utf8");
const items = await readContent(root);

function metaHtml({ title, description, url, image, type = "website", jsonLd }) {
  const fullTitle = title === "4399123" ? title : `${title} | 4399123`;
  const canonical = absoluteUrl(url);
  const socialImage = absoluteUrl(image || "/assets/brand/4399123-domain-logo-transparent.png");
  return [
    `<title>${escapeHtml(fullTitle)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}">`,
    `<link rel="canonical" href="${canonical}">`,
    '<meta property="og:site_name" content="4399123">',
    `<meta property="og:title" content="${escapeHtml(fullTitle)}">`,
    `<meta property="og:description" content="${escapeHtml(description)}">`,
    `<meta property="og:type" content="${type}">`,
    `<meta property="og:url" content="${canonical}">`,
    `<meta property="og:image" content="${socialImage}">`,
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${escapeHtml(fullTitle)}">`,
    `<meta name="twitter:description" content="${escapeHtml(description)}">`,
    `<meta name="twitter:image" content="${socialImage}">`,
    '<link rel="alternate" type="application/rss+xml" title="4399123 RSS" href="/rss.xml">',
    `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`,
  ].join("\n    ");
}

function replaceHead(html, meta) {
  return html
    .replace(/\s*<title>.*?<\/title>/s, "")
    .replace(/\s*<meta name="description"[^>]*>/gi, "")
    .replace(/\s*<link rel="canonical"[^>]*>/gi, "")
    .replace(/\s*<meta property="og:[^"]+"[^>]*>/gi, "")
    .replace(/\s*<meta name="twitter:[^"]+"[^>]*>/gi, "")
    .replace(/\s*<link rel="alternate"[^>]*application\/rss\+xml[^>]*>/gi, "")
    .replace(/\s*<script type="application\/ld\+json">.*?<\/script>/gis, "")
    .replace("</head>", `    ${meta}\n  </head>`);
}

function replaceApp(html, appHtml) {
  return html.replace(/<div id="app">[\s\S]*?<\/div>/, appHtml);
}

function appShellHtml(itemsForPage) {
  return [
    '<div id="app">',
    '  <main class="seo-static">',
    "    <h1>4399123</h1>",
    `    <p>${escapeHtml(siteDescription)}</p>`,
    "    <nav>",
    '      <a href="/blog">最新内容</a>',
    '      <a href="/community">社区</a>',
    '      <a href="/vibe-coding">Vibe Coding</a>',
    '      <a href="/rss.xml">RSS</a>',
    "    </nav>",
    ...itemsForPage.map(
      (item) =>
        `    <article><h2><a href="${escapeHtml(contentUrl(item))}">${escapeHtml(item.title)}</a></h2><p>${escapeHtml(item.summary)}</p></article>`,
    ),
    "  </main>",
    "</div>",
  ].join("\n");
}

async function writeRoute(route, html) {
  const cleanRoute = route.replace(/^\/+|\/+$/g, "");
  const file = cleanRoute ? path.join(distDir, cleanRoute, "index.html") : indexPath;
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, html);
}

const homeMeta = metaHtml({
  title: "4399123",
  description: siteDescription,
  url: "/",
  type: "website",
  jsonLd: {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "4399123",
    url: siteUrl,
    description: siteDescription,
    inLanguage: "zh-CN",
  },
});

await writeRoute(
  "/",
  replaceApp(replaceHead(indexHtml, homeMeta), appShellHtml(items.slice(0, 8))),
);

await writeRoute(
  "/blog",
  replaceApp(
    replaceHead(
      indexHtml,
      metaHtml({
        title: "最新内容",
        description: "4399123 的 vibe coding 想法、AI/编程实验、项目记录和有趣发现。",
        url: "/blog",
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "4399123 最新内容",
          url: `${siteUrl}/blog`,
        },
      }),
    ),
    appShellHtml(items.filter((item) => item.category !== "projects")),
  ),
);

await writeRoute(
  "/community",
  replaceApp(
    replaceHead(
      indexHtml,
      metaHtml({
        title: "社区",
        description: "4399123 社区：Vibe Coding、AI 工具、作品展示、需求反馈和闲聊讨论区。",
        url: "/community",
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "DiscussionForumPosting",
          name: "4399123 社区",
          url: `${siteUrl}/community`,
        },
      }),
    ),
    [
      '<div id="app">',
      '  <main class="seo-static">',
      "    <h1>4399123 社区</h1>",
      "    <p>围绕 Vibe Coding、AI 工具、作品展示、需求反馈和闲聊的轻量讨论区。</p>",
      '    <a href="/login">登录后发帖</a>',
      "  </main>",
      "</div>",
    ].join("\n"),
  ),
);

await writeRoute(
  "/vibe-coding",
  replaceApp(
    replaceHead(
      indexHtml,
      metaHtml({
        title: "Vibe Coding",
        description: "4399123 的 AI 小实验、互动工具和快速成型项目入口。",
        url: "/vibe-coding",
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "4399123 Vibe Coding",
          url: `${siteUrl}/vibe-coding`,
        },
      }),
    ),
    appShellHtml(
      items.filter(
        (item) =>
          item.category === "projects" ||
          item.tags?.some((tag) => String(tag).toLowerCase() === "vibe coding"),
      ),
    ),
  ),
);

for (const item of items.filter((entry) => entry.category !== "projects")) {
  const bodyHtml = item.body
    .map((block) => block.replace(/^\[(image|video):.*]$/, "").trim())
    .filter(Boolean)
    .map((block) => `<p>${escapeHtml(block)}</p>`)
    .join("\n");
  await writeRoute(
    `/blog/${item.slug}`,
    replaceApp(
      replaceHead(
        indexHtml,
        metaHtml({
          title: item.title,
          description: item.summary,
          url: `/blog/${item.slug}`,
          image: item.cover,
          type: "article",
          jsonLd: {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: item.title,
            description: item.summary,
            datePublished: item.date,
            dateModified: item.date,
            url: `${siteUrl}/blog/${item.slug}`,
            image: item.cover ? absoluteUrl(item.cover) : undefined,
            author: { "@type": "Person", name: "4399123" },
          },
        }),
      ),
      `<div id="app"><article class="seo-static"><h1>${escapeHtml(item.title)}</h1><p>${escapeHtml(item.summary)}</p>${bodyHtml}</article></div>`,
    ),
  );
}

console.log("Generated static route HTML for homepage, collections and blog posts.");
