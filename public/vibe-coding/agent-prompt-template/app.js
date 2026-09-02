    const topicInput = document.getElementById("topicInput");
    const promptOutput = document.getElementById("promptOutput");
    const copyButton = document.getElementById("copyButton");
    const expandButton = document.getElementById("expandButton");
    const clearButton = document.getElementById("clearButton");
    const copyStatus = document.getElementById("copyStatus");
    const inputCounter = document.getElementById("inputCounter");
    const outputCounter = document.getElementById("outputCounter");
    const aiDialog = document.getElementById("aiDialog");
    const aiPromptOutput = document.getElementById("aiPromptOutput");
    const aiStatus = document.getElementById("aiStatus");
    const copyAiButton = document.getElementById("copyAiButton");
    const closeDialogButton = document.getElementById("closeDialogButton");
    const templateButtons = Array.from(document.querySelectorAll("[data-template]"));

    const suffix = "检查完成之后制定修复方案并向我汇报，在批准后执行";
    const placeholder = "输入内容后，这里会生成完整提示词。";
    const expandEndpoint = "/api/vibe-coding/prompt-template/expand";
    let aiPrompt = "";
    let activeTemplate = "default";

    const templates = {
      default(content) {
        return `请帮我生成一段提示词交给agent，让它帮我做一个“${content}”，然后把ai的一大段提示词再发给agent，末尾加一句：${suffix}`;
      },
      goal(content) {
        return `请你帮我把下面这个想法整理成一个适合交给 /goal 指令执行的完整任务。

我的原始想法是：
${content}

请输出一段完整的 /goal 任务提示词，要求：
- 目标清晰
- 范围明确
- 结果可验证
- 任务可以被 agent 持续执行
- 包含必要的背景信息
- 包含具体要求和约束
- 包含完成标准
- 如果信息不足，请先指出缺失信息，并给出可补充的问题
- 最终输出要适合我直接复制给 /goal 使用

输出格式请包含：
1. 任务目标
2. 背景说明
3. 具体要求
4. 完成标准
5. 给 /goal 使用的最终提示词

请把 AI 生成的一大段提示词整理好后再发给 agent，末尾必须加一句：${suffix}`;
      }
    };

    function buildPrompt(rawValue) {
      const content = rawValue.trim();
      if (!content) {
        return "";
      }
      return templates[activeTemplate](content);
    }

    function setActiveTemplate(templateName) {
      activeTemplate = templateName;
      templateButtons.forEach((button) => {
        const isActive = button.dataset.template === templateName;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
      });

      topicInput.placeholder = templateName === "goal"
        ? "例如：检查首页移动端排版问题并生成可执行修复任务"
        : "例如：帮我检查一个网站的 UI 问题";

      render();
    }

    function setStatus(message) {
      copyStatus.textContent = message;
      if (message) {
        window.clearTimeout(setStatus.timer);
        setStatus.timer = window.setTimeout(() => {
          copyStatus.textContent = "";
        }, 1800);
      }
    }

    function setAiStatus(message) {
      aiStatus.textContent = message;
      if (message && message !== "正在生成...") {
        window.clearTimeout(setAiStatus.timer);
        setAiStatus.timer = window.setTimeout(() => {
          aiStatus.textContent = "";
        }, 2200);
      }
    }

    function openAiDialog() {
      if (typeof aiDialog.showModal === "function" && !aiDialog.open) {
        aiDialog.showModal();
        return;
      }
      aiDialog.setAttribute("open", "");
    }

    function setGenerating(isGenerating) {
      expandButton.disabled = isGenerating || !buildPrompt(topicInput.value);
      expandButton.textContent = isGenerating ? "生成中..." : "AI 生成下一步";
      copyAiButton.disabled = isGenerating || !aiPrompt;
    }

    async function copyText(text) {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return;
      }

      const fallback = document.createElement("textarea");
      fallback.value = text;
      fallback.setAttribute("readonly", "");
      fallback.style.position = "fixed";
      fallback.style.top = "-999px";
      document.body.appendChild(fallback);
      fallback.select();
      document.execCommand("copy");
      fallback.remove();
    }

    function render() {
      const inputValue = topicInput.value;
      const prompt = buildPrompt(inputValue);
      const hasInput = inputValue.trim().length > 0;

      inputCounter.textContent = `${inputValue.trim().length} 字`;
      outputCounter.textContent = `${prompt.length} 字`;
      promptOutput.value = prompt || placeholder;
      promptOutput.classList.toggle("placeholder", !prompt);
      copyButton.disabled = !prompt;
      expandButton.disabled = !prompt;
      clearButton.disabled = !hasInput;
      if (!prompt) {
        setStatus("");
      }
    }

    topicInput.addEventListener("input", render);
    templateButtons.forEach((button) => {
      button.addEventListener("click", () => setActiveTemplate(button.dataset.template));
    });

    copyButton.addEventListener("click", async () => {
      const prompt = buildPrompt(topicInput.value);
      if (!prompt) {
        return;
      }

      try {
        await copyText(prompt);
        setStatus("已复制");
      } catch (error) {
        setStatus("复制失败，请手动选择文本");
      }
    });

    expandButton.addEventListener("click", async () => {
      const prompt = buildPrompt(topicInput.value);
      const topic = topicInput.value.trim();
      if (!prompt) {
        return;
      }

      aiPrompt = "";
      aiPromptOutput.value = "正在生成...";
      copyAiButton.disabled = true;
      openAiDialog();
      setAiStatus("正在生成...");
      setGenerating(true);

      try {
        const response = await fetch(expandEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt, topic }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.ok || !data.prompt) {
          throw new Error(data.error || "AI 生成暂时失败，请稍后重试。");
        }

        aiPrompt = data.prompt.trim();
        aiPromptOutput.value = aiPrompt;
        copyAiButton.disabled = !aiPrompt;
        setAiStatus("生成完成");
      } catch (error) {
        aiPromptOutput.value = error.message || "AI 生成暂时失败，请稍后重试。";
        setAiStatus("生成失败");
      } finally {
        setGenerating(false);
      }
    });

    copyAiButton.addEventListener("click", async () => {
      if (!aiPrompt) {
        return;
      }

      try {
        await copyText(aiPrompt);
        setAiStatus("已复制");
      } catch (error) {
        setAiStatus("复制失败，请手动选择文本");
      }
    });

    closeDialogButton.addEventListener("click", () => {
      aiDialog.close();
    });

    clearButton.addEventListener("click", () => {
      topicInput.value = "";
      topicInput.focus();
      render();
    });

    render();
