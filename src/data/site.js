import { localVibeCodingProjects } from "./content";

export const brandDigits = "4399123".split("").map((value, index) => ({
  value,
  index,
}));

export const brandLogo = {
  src: "/assets/brand/4399123-domain-logo-transparent.png",
  alt: "4399123",
};

export const navigationItems = [
  {
    label: "社区",
    href: "/community",
  },
  {
    label: "博客",
    href: "/blog",
  },
  {
    label: "Vibe Coding",
    href: "/vibe-coding",
  },
  {
    label: "Image 提示词",
    href: "/vibe-coding/chinese-image-prompt/",
  },
  {
    label: "Agent 提示词模板生成器",
    href: "/vibe-coding/agent-prompt-template/",
  },
  {
    label: "分享 Vibe Coding",
    href: "/vibe-coding/showcase",
  },
  {
    label: "番茄钟",
    href: "/vibe-coding/pulse-pomodoro/",
  },
  {
    label: "OpenClaw 第三方 API 配置生成器",
    href: "/vibe-coding/openclaw-easy-config/",
  },
  {
    label: "VibeCPU",
    href: "/vibecpu/",
  },
  {
    label: "中转站",
    href: "https://shinemoon.com/",
    external: true,
  },
  {
    label: "AI 人格测试",
    href: "/vibe-coding/ai-personality-test",
  },
  {
    label: "Agent AI",
    href: "/vibe-coding/4399123agent/",
  },
];

export const vibeCodingProjects = localVibeCodingProjects;

export const featuredProject = vibeCodingProjects[0];
