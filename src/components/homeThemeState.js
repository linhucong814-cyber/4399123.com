import { computed, ref, watch } from "vue";

export const backgroundThemes = [
  {
    id: "mint",
    name: "Mint Cobalt",
    shortName: "Mint",
    image: "/assets/home-backgrounds/bg-mint-cobalt.jpg",
    alt: "薄荷绿与钴蓝抽象拼贴背景",
    ink: "#141716",
    muted: "#52635b",
    accent: "#145f87",
    ctaBg: "#141716",
    ctaFg: "#f5f7ef",
    overlay: "linear-gradient(90deg, rgba(226, 243, 230, 0.16), rgba(226, 243, 230, 0.04))",
  },
  {
    id: "sunlit",
    name: "Sunlit Paper",
    shortName: "Sunlit",
    image: "/assets/home-backgrounds/bg-sunlit-paper.jpg",
    alt: "暖纸黄与青绿色几何线条背景",
    ink: "#171918",
    muted: "#5f6661",
    accent: "#1e6f5c",
    ctaBg: "#171918",
    ctaFg: "#f6f7f3",
    overlay: "linear-gradient(90deg, rgba(246, 247, 243, 0.28), rgba(246, 247, 243, 0.05))",
  },
  {
    id: "midnight",
    name: "Midnight Grid",
    shortName: "Midnight",
    image: "/assets/home-backgrounds/bg-midnight-grid.jpg",
    alt: "深黑底色与琥珀光晕网格背景",
    ink: "#f8f6ed",
    muted: "rgba(248, 246, 237, 0.76)",
    accent: "#7ddcc6",
    ctaBg: "#f0c85a",
    ctaFg: "#171918",
    overlay: "linear-gradient(90deg, rgba(5, 8, 8, 0.18), rgba(5, 8, 8, 0.04))",
  },
  {
    id: "newsprint",
    name: "Newsprint",
    shortName: "Newsprint",
    image: "/assets/home-backgrounds/bg-newsprint.jpg",
    alt: "米白报纸肌理与黑色半调图形背景",
    ink: "#171716",
    muted: "#5e615d",
    accent: "#16766b",
    ctaBg: "#171716",
    ctaFg: "#f7f4ea",
    overlay: "linear-gradient(90deg, rgba(247, 244, 234, 0.18), rgba(247, 244, 234, 0.03))",
  },
  {
    id: "coral",
    name: "Coral Sunset",
    shortName: "Coral",
    image: "/assets/home-backgrounds/bg-coral-sunset.jpg",
    alt: "珊瑚橙与黄色光晕背景",
    ink: "#171414",
    muted: "#644d49",
    accent: "#0e6a68",
    ctaBg: "#171414",
    ctaFg: "#fff0e2",
    overlay: "linear-gradient(90deg, rgba(255, 236, 222, 0.18), rgba(255, 236, 222, 0.03))",
  },
  {
    id: "violet",
    name: "Violet Signal",
    shortName: "Violet",
    image: "/assets/home-backgrounds/bg-violet-signal.jpg",
    alt: "紫罗兰霓虹信号与荧光线条背景",
    ink: "#f8f3ff",
    muted: "rgba(248, 243, 255, 0.78)",
    accent: "#c9ff3f",
    ctaBg: "#c9ff3f",
    ctaFg: "#1b1023",
    overlay: "linear-gradient(90deg, rgba(29, 14, 39, 0.18), rgba(29, 14, 39, 0.04))",
  },
];

function readStoredTheme() {
  if (typeof window === "undefined") return "mint";
  try {
    const stored = window.localStorage.getItem("4399123-home-theme");
    return backgroundThemes.some((theme) => theme.id === stored) ? stored : "mint";
  } catch {
    return "mint";
  }
}

export const activeThemeId = ref(readStoredTheme());
export const activeTheme = computed(
  () => backgroundThemes.find((theme) => theme.id === activeThemeId.value) || backgroundThemes[0],
);
export const isThemePickerOpen = ref(false);

watch(activeThemeId, (themeId) => {
  try {
    window.localStorage.setItem("4399123-home-theme", themeId);
  } catch {
    // Private browsing or blocked storage should not prevent theme switching.
  }
});

export function selectTheme(themeId) {
  if (backgroundThemes.some((theme) => theme.id === themeId)) {
    activeThemeId.value = themeId;
  }
}

export function cycleTheme(step = 1) {
  const index = backgroundThemes.findIndex((theme) => theme.id === activeThemeId.value);
  const nextIndex = (index + step + backgroundThemes.length) % backgroundThemes.length;
  activeThemeId.value = backgroundThemes[nextIndex].id;
}
