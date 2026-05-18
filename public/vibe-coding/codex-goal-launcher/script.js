const ideaInput = document.querySelector("#idea-input");
const heroGenerateButton = document.querySelector("#hero-generate");
const copyButton = document.querySelector("#copy-goal");
const resultPanel = document.querySelector("#result");
const goalOutput = document.querySelector("#goal-output");
const toast = document.querySelector("#toast");
const summaryType = document.querySelector("#summary-type");
const summaryStyle = document.querySelector("#summary-style");
const summaryFeatures = document.querySelector("#summary-features");
let hasGeneratedGoal = false;

const templates = {
  todo: {
    idea: "做一个待办事项网页，可以添加任务、标记完成、筛选全部/进行中/已完成，并把任务保存在本地。",
    type: "网页应用",
    style: "极简",
    features: ["响应式", "本地保存", "动画效果"],
  },
  timer: {
    idea: "做一个番茄钟小工具，可以设置专注和休息时间，开始/暂停/重置计时，并在完成后给出提醒。",
    type: "小工具",
    style: "科技感",
    features: ["响应式", "动画效果", "本地保存"],
  },
  portfolio: {
    idea: "做一个个人作品集落地页，展示我的简介、项目案例、技能标签和联系入口，整体要高级、清晰、适合求职展示。",
    type: "落地页",
    style: "商务",
    features: ["响应式", "动画效果", "下载导出"],
  },
};

const showToast = (message) => {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 1800);
};

const selectRadio = (name, value) => {
  const item = Array.from(document.getElementsByName(name)).find((input) => input.value === value);
  if (item) item.checked = true;
};

const selectFeatures = (features) => {
  document.querySelectorAll('input[name="feature"]').forEach((item) => {
    item.checked = features.includes(item.value);
  });
};

const getSelected = (selector) => document.querySelector(`${selector}:checked`)?.value || "";

const getFeatures = () =>
  Array.from(document.querySelectorAll('input[name="feature"]:checked')).map((item) => item.value);

const updateConfigSummary = () => {
  const type = getSelected('input[name="project-type"]');
  const style = getSelected('input[name="visual-style"]');
  const features = getFeatures();

  summaryType.textContent = type || "未选择";
  summaryStyle.textContent = style || "未选择";
  summaryFeatures.textContent = features.length ? features.join("、") : "根据目标自动设计";
};

const buildGoal = () => {
  const idea = ideaInput.value.trim();
  const type = getSelected('input[name="project-type"]');
  const style = getSelected('input[name="visual-style"]');
  const features = getFeatures();
  const featureText = features.length
    ? features.map((feature) => `- ${feature}`).join("\n")
    : "- 根据用户目标设计必要功能";

  return `/goal 请在当前目录创建或修改完整网页文件，实现一个可直接运行的${type}。

用户目标：
${idea}

技术要求：
- 使用原生 HTML、CSS、JavaScript
- 创建或更新 index.html、styles.css、script.js
- 不使用大型框架
- 不依赖外部图片
- 可以直接本地打开运行，也可以通过本地服务预览
- 响应式适配桌面和手机

功能要求：
${featureText}
- 围绕用户目标补充必要的页面结构、状态反馈和边界处理
- 体验要完整可用，不要只做静态说明页面

视觉要求：
- 视觉风格：${style}
- 深色或清晰高级的界面基调，排版层级明确
- 关键面板、按钮、选项和结果区域要有精致的视觉状态
- 移动端布局自然，按钮和输入区域好点按

交互要求：
- 主要按钮需要有 hover 和 active 反馈
- 选择项要有明显选中状态
- 如有导航或锚点，点击后平滑滚动到对应区域
- 如果需要复制、导出、保存等操作，需要提供成功或失败提示

完成后的检查要求：
- 检查页面能否正常运行
- 验证 index.html、styles.css、script.js 都能正常加载
- 检查桌面和手机布局，修复文字溢出、遮挡和横向滚动问题
- 如适合，请启动本地预览服务
- 最后告诉我修改了哪些文件、文件路径和本地访问地址`;
};

const generateGoal = () => {
  if (!ideaInput.value.trim()) {
    ideaInput.focus();
    showToast("先输入一个项目想法");
    return;
  }

  goalOutput.textContent = buildGoal();
  resultPanel.classList.add("has-result");
  hasGeneratedGoal = true;
  resultPanel.scrollIntoView({ behavior: "smooth", block: "start" });
};

const refreshGoalFromConfig = ({ scroll = false } = {}) => {
  updateConfigSummary();
  if (!ideaInput.value.trim()) return;

  goalOutput.textContent = buildGoal();
  resultPanel.classList.add("has-result");
  hasGeneratedGoal = true;

  if (scroll) {
    resultPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

const copyGoal = async () => {
  if (!goalOutput.textContent.trim()) {
    generateGoal();
    if (!goalOutput.textContent.trim()) return;
  }

  try {
    await navigator.clipboard.writeText(goalOutput.textContent);
    showToast("已复制，可以粘贴到 Codex 运行");
  } catch {
    const helper = document.createElement("textarea");
    helper.value = goalOutput.textContent;
    helper.setAttribute("readonly", "");
    helper.style.position = "fixed";
    helper.style.left = "-9999px";
    document.body.appendChild(helper);
    helper.select();
    document.execCommand("copy");
    helper.remove();
    showToast("已复制，可以粘贴到 Codex 运行");
  }
};

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const target = document.querySelector(anchor.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

document.querySelectorAll(".button").forEach((button) => {
  button.addEventListener("pointerdown", () => button.classList.add("is-pressed"));
  button.addEventListener("pointerup", () => {
    window.setTimeout(() => button.classList.remove("is-pressed"), 120);
  });
  button.addEventListener("pointerleave", () => button.classList.remove("is-pressed"));
});

document.querySelectorAll("[data-template]").forEach((button) => {
  button.addEventListener("click", () => {
    const template = templates[button.dataset.template];
    if (!template) return;
    ideaInput.value = template.idea;
    selectRadio("project-type", template.type);
    selectRadio("visual-style", template.style);
    selectFeatures(template.features);
    refreshGoalFromConfig({ scroll: true });
    showToast("已填入模板并更新指令");
  });
});

heroGenerateButton.addEventListener("click", generateGoal);
copyButton.addEventListener("click", copyGoal);

document.querySelectorAll('input[name="project-type"], input[name="visual-style"], input[name="feature"]').forEach((item) => {
  item.addEventListener("change", () => {
    refreshGoalFromConfig();
    if (ideaInput.value.trim()) showToast("配置已更新到指令");
  });
});

ideaInput.addEventListener("input", () => {
  updateConfigSummary();
  if (hasGeneratedGoal && ideaInput.value.trim()) {
    goalOutput.textContent = buildGoal();
  }
});

updateConfigSummary();

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -30px 0px" }
);

document.querySelectorAll(".reveal").forEach((item, index) => {
  item.style.transitionDelay = `${Math.min(index * 70, 260)}ms`;
  observer.observe(item);
});

window.setTimeout(() => {
  document.querySelectorAll(".reveal").forEach((item) => {
    const rect = item.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.95) item.classList.add("is-visible");
  });
}, 80);
