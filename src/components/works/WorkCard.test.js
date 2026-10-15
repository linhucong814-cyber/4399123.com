// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import WorkCard from "./WorkCard.vue";
import { workInitial } from "../../data/workCategories";

describe("作品卡片封面", () => {
  it("skips bracketed prefixes when picking the placeholder initial", () => {
    expect(workInitial("[演示] 摸鱼跑酷")).toBe("摸");
    expect(workInitial("【测试】abc")).toBe("A");
    expect(workInitial("  ")).toBe("作");
  });

  it("renders a category-coloured placeholder when there is no cover", () => {
    const wrapper = mount(WorkCard, {
      props: { work: { id: 1, slug: "x", title: "[演示] 摸鱼跑酷", category: "game", categoryLabel: "小游戏", coverUrl: "", stats: {} } },
    });
    expect(wrapper.get(".work-card-cover-initial").text()).toBe("摸");
    expect(wrapper.get(".work-card-cover-fallback").attributes("style")).toContain("linear-gradient");
    expect(wrapper.get(".work-card-cover").text()).not.toContain("[");
  });
});
