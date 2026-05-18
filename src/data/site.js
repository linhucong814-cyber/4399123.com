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
    label: "番茄钟",
    href: "/vibe-coding/pulse-pomodoro/",
  },
  {
    label: "VibeCPU",
    href: "/vibecpu/",
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
