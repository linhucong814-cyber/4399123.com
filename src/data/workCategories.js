export const workCategories = [
  { value: "web-tool", label: "网页工具" },
  { value: "game", label: "小游戏" },
  { value: "ai-app", label: "AI 应用" },
  { value: "visualization", label: "可视化" },
  { value: "productivity", label: "效率" },
  { value: "other", label: "其他" },
];

export const workSorts = [
  { value: "newest", label: "最新" },
  { value: "popular", label: "最热" },
  { value: "likes", label: "最多点赞" },
];

export const workStatusLabels = {
  pending: "待审核",
  approved: "已公开",
  rejected: "已拒绝",
  needs_changes: "需修改",
};

// Gradient pairs for cover placeholders, keyed by category.
export const workCategoryColors = {
  "web-tool": ["#294f8f", "#1e6f5c"],
  game: ["#c84f3a", "#f0c85a"],
  "ai-app": ["#1e6f5c", "#7fc8a9"],
  visualization: ["#171918", "#294f8f"],
  productivity: ["#7a5c1e", "#f0c85a"],
  other: ["#5f6661", "#171918"],
};

/** First meaningful character of a title, skipping bracketed prefixes like "[演示] ". */
export function workInitial(title = "") {
  const clean = String(title).replace(/^\s*[\[【(（][^\]】)）]*[\]】)）]\s*/, "").trim();
  const match = clean.match(/[\p{L}\p{N}]/u);
  return match ? match[0].toUpperCase() : "作";
}

export function workCategoryLabel(value) {
  return workCategories.find((item) => item.value === value)?.label || "其他";
}
