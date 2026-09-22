import { promises as fs } from "node:fs";
import path from "node:path";
import { absoluteUrl, contentUrl, readContent, siteDescription, siteUrl } from "./content-utils.mjs";

const root = process.cwd();
const publicDir = path.join(root, "public");
const items = await readContent(root);
const now = new Date().toISOString();

await fs.mkdir(publicDir, { recursive: true });

const publicPaths = [
  { loc: "/", priority: "1.0", changefreq: "weekly" },
  { loc: "/blog", priority: "0.8", changefreq: "weekly" },
  { loc: "/community", priority: "0.8", changefreq: "daily" },
  { loc: "/vibe-coding", priority: "0.8", changefreq: "weekly" },
  { loc: "/docs", priority: "0.7", changefreq: "monthly" },
  { loc: "/vibe-coding/agent-prompt-template/doc/", priority: "0.6", changefreq: "monthly" },
  { loc: "/vibe-coding/prompt-library/", priority: "0.7", changefreq: "weekly" },
  { loc: "/help", priority: "0.5", changefreq: "monthly" },
  { loc: "/404notfound/", priority: "0.2", changefreq: "yearly" },
  ...items.map((item) => ({
    loc: contentUrl(item),
    priority: item.category === "projects" ? "0.7" : "0.6",
    changefreq: "monthly",
    lastmod: item.date,
  })),
];

const uniquePaths = Array.from(new Map(publicPaths.map((entry) => [entry.loc, entry])).values());

await fs.writeFile(
  path.join(publicDir, "robots.txt"),
  [
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin/",
    "Disallow: /api/",
    `Sitemap: ${siteUrl}/sitemap.xml`,
    "",
  ].join("\n"),
);

await fs.writeFile(
  path.join(publicDir, "sitemap.xml"),
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...uniquePaths.map((entry) =>
      [
        "  <url>",
        `    <loc>${absoluteUrl(entry.loc)}</loc>`,
        `    <lastmod>${entry.lastmod || now.slice(0, 10)}</lastmod>`,
        `    <changefreq>${entry.changefreq}</changefreq>`,
        `    <priority>${entry.priority}</priority>`,
        "  </url>",
      ].join("\n"),
    ),
    "</urlset>",
    "",
  ].join("\n"),
);

await fs.writeFile(
  path.join(publicDir, "rss.xml"),
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    "    <title>4399123</title>",
    `    <link>${siteUrl}</link>`,
    `    <description>${siteDescription}</description>`,
    "    <language>zh-CN</language>",
    `    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
    `    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />`,
    ...items
      .filter((item) => item.category !== "projects")
      .map((item) =>
        [
          "    <item>",
          `      <title><![CDATA[${item.title}]]></title>`,
          `      <link>${absoluteUrl(contentUrl(item))}</link>`,
          `      <guid>${absoluteUrl(contentUrl(item))}</guid>`,
          `      <pubDate>${new Date(item.date).toUTCString()}</pubDate>`,
          `      <description><![CDATA[${item.summary}]]></description>`,
          "    </item>",
        ].join("\n"),
      ),
    "  </channel>",
    "</rss>",
    "",
  ].join("\n"),
);

console.log(`Generated robots.txt, sitemap.xml and rss.xml for ${uniquePaths.length} URLs.`);
