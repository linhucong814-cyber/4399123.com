import { localVibeCodingProjects } from "./content";

export const brandDigits = "4399123".split("").map((value, index) => ({
  value,
  index,
}));

export const navigationItems = [
  {
    label: "作品",
    href: "/vibe-coding",
    primary: true,
  },
  {
    label: "社区",
    href: "/community",
    primary: true,
  },
  {
    label: "博客",
    href: "/blog",
    primary: true,
  },
  {
    label: "文档",
    href: "/docs",
    primary: true,
  },
  {
    label: "Agent 提示词模板生成器",
    href: "/vibe-coding/agent-prompt-template/",
  },
  {
    label: "OpenClaw 第三方 API 配置生成器",
    href: "/vibe-coding/openclaw-easy-config/",
  },
  {
    label: "提示词模板库",
    href: "/vibe-coding/prompt-library/",
    group: "tutorials",
  },
  {
    label: "如何使用 Codex 教学手册",
    href: "/vibe-coding/codex-tutorial/",
    group: "tutorials",
  },
  {
    label: "ChatGPT 橙皮书",
    href: "https://bozhoudev.github.io/codex-orange-book/",
    external: true,
    group: "tutorials",
  },
  {
    label: "图片画布",
    href: "https://i.shinemoon.com/",
    external: true,
  },
  {
    label: "中转站",
    href: "https://shinemoon.com/",
    external: true,
  },
  {
    label: "焚诀",
    href: "https://fenjue.org/",
    external: true,
    group: "tutorials",
  },
];

export const vibeCodingProjects = localVibeCodingProjects;

export const featuredProject = vibeCodingProjects[0];
