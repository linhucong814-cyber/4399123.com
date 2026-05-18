# 4399123 content

本目录是主站的轻量内容源。新增内容时复制一个同类 JSON 文件即可，构建会自动把公开内容写进 `sitemap.xml`、`rss.xml` 和静态路由 HTML。

- `thoughts/`: vibe coding 想法、项目记录、AI/编程实验日志
- `projects/`: 小项目 / 实验入口
- `interesting/`: 有趣分享和灵感碎片

字段约定：

```json
{
  "title": "标题",
  "slug": "url-slug",
  "date": "2026-05-10",
  "summary": "摘要",
  "tags": ["Vibe Coding"],
  "category": "thoughts",
  "cover": "/assets/example.webp",
  "href": "/optional-project-url/",
  "body": ["正文段落", "[image:/assets/example.webp|图片说明]"]
}
```

`projects/` 内容可以设置 `href`、`eyebrow` 和 `actionLabel`，用于首页项目卡片。
