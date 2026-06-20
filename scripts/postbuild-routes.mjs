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

function homeShellHtml() {
  return [
    '<div id="app">',
    '  <main class="seo-static">',
    "    <h1>4399123</h1>",
    `    <p>${escapeHtml(siteDescription)}</p>`,
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

function simpleStaticPage({ route, title, description, heading, body, links = [] }) {
  return replaceApp(
    replaceHead(
      indexHtml,
      metaHtml({
        title,
        description,
        url: route,
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: title,
          description,
          url: `${siteUrl}${route}`,
        },
      }),
    ),
    [
      '<div id="app">',
      '  <main class="seo-static">',
      `    <h1>${escapeHtml(heading)}</h1>`,
      `    <p>${escapeHtml(body)}</p>`,
      links.length ? "    <nav>" : "",
      ...links.map((link) => `      <a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`),
      links.length ? "    </nav>" : "",
      "  </main>",
      "</div>",
    ].filter(Boolean).join("\n"),
  );
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
  replaceApp(replaceHead(indexHtml, homeMeta), homeShellHtml()),
);

await writeRoute(
  "/account",
  simpleStaticPage({
    route: "/account",
    title: "用户后台",
    description: "查看 4399123.com 账号状态、作品审核进度、社区消息和管理入口。",
    heading: "用户后台",
    body: "登录后可以查看账号状态、作品审核进度、社区消息和管理入口。",
    links: [
      { href: "/login?next=/account", label: "登录" },
      { href: "/register?next=/account", label: "注册" },
      { href: "/help", label: "帮助中心" },
    ],
  }),
);

await writeRoute(
  "/account/settings",
  simpleStaticPage({
    route: "/account/settings",
    title: "账户设置",
    description: "管理 4399123.com 账号头像、用户名、简介、邮箱验证和登录状态。",
    heading: "账户设置",
    body: "登录后可以编辑头像、用户名、简介和邮箱验证状态。",
    links: [
      { href: "/login?next=/account/settings", label: "登录" },
      { href: "/account", label: "用户后台" },
      { href: "/help", label: "帮助中心" },
    ],
  }),
);

await writeRoute(
  "/help",
  simpleStaticPage({
    route: "/help",
    title: "帮助中心",
    description: "4399123.com 帮助中心：常见问题、账户问题、作品发布、审核规则和联系支持。",
    heading: "帮助中心",
    body: "查看常见问题、账户问题、作品发布、审核规则和联系支持方式。也可以添加站长微信：Ccxyy0228（笑）。",
    links: [
      { href: "/account", label: "用户后台" },
      { href: "/community?channel=meta", label: "站务反馈" },
      { href: "/vibe-coding/share", label: "提交作品" },
    ],
  }),
);

await writeRoute(
  "/admin",
  simpleStaticPage({
    route: "/admin",
    title: "管理后台",
    description: "4399123.com 管理员后台入口，集中查看作品审核和用户管理。",
    heading: "管理后台",
    body: "管理员登录后可以查看作品审核队列、用户列表和后台工具。",
    links: [
      { href: "/login?next=/admin", label: "管理员登录" },
      { href: "/admin/vibe-coding-submissions", label: "作品审核" },
      { href: "/admin/users", label: "用户管理" },
    ],
  }),
);

await writeRoute(
  "/admin/vibe-coding-submissions",
  simpleStaticPage({
    route: "/admin/vibe-coding-submissions",
    title: "作品审核",
    description: "审核用户提交的 Vibe Coding 作品。",
    heading: "作品审核",
    body: "管理员可以查看待审核内容，并执行通过、拒绝、标记问题和删除操作。",
    links: [
      { href: "/admin", label: "管理后台" },
      { href: "/login?next=/admin/vibe-coding-submissions", label: "管理员登录" },
    ],
  }),
);

await writeRoute(
  "/admin/users",
  simpleStaticPage({
    route: "/admin/users",
    title: "注册用户后台",
    description: "查看 4399123.com 注册用户信息。",
    heading: "注册用户后台",
    body: "管理员可以查看注册用户、邮箱验证、最近登录和账号状态。",
    links: [
      { href: "/admin", label: "管理后台" },
      { href: "/login?next=/admin/users", label: "管理员登录" },
    ],
  }),
);


await writeRoute(
  "/admin/game-records",
  simpleStaticPage({
    route: "/admin/game-records",
    title: "星球信使记录后台",
    description: "查看 4399123.com 首页小游戏的用户游戏数据。",
    heading: "星球信使记录",
    body: "管理员可以查看星球信使得分、灵感数量、时长、设备和完成状态。",
    links: [
      { href: "/admin", label: "管理后台" },
      { href: "/login?next=/admin/game-records", label: "管理员登录" },
    ],
  }),
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
        description: "4399123 社区：围绕 Vibe Coding、AI 工具、作品展示、需求反馈和站点建设的轻量讨论区。",
        url: "/community",
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "4399123 社区",
          description: "围绕 Vibe Coding、AI 工具、作品展示、需求反馈和站点建设的轻量讨论区。",
          url: `${siteUrl}/community`,
          inLanguage: "zh-CN",
          isPartOf: {
            "@type": "WebSite",
            name: "4399123",
            url: siteUrl,
          },
        },
      }),
    ),
    [
      '<div id="app">',
      '  <main class="seo-static">',
      "    <h1>4399123 社区</h1>",
      "    <p>围绕 Vibe Coding、AI 工具、作品展示、需求反馈和站点建设的轻量讨论区。</p>",
      '    <a href="/login">登录后参与讨论</a>',
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

console.log("Generated static route HTML for homepage, account, admin, help, collections and blog posts.");
