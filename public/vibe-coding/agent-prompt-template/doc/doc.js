    const copyButton = document.getElementById("copyPromptButton");
    const promptBox = document.getElementById("agentPrompt");
    const copyStatus = document.getElementById("copyStatus");

    async function copyPrompt() {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(promptBox.value);
        } else {
          promptBox.select();
          document.execCommand("copy");
        }
        copyStatus.textContent = "已复制";
        window.setTimeout(() => {
          copyStatus.textContent = "";
        }, 1800);
      } catch {
        copyStatus.textContent = "复制失败，请手动选择文本";
      }
    }

    copyButton.addEventListener("click", copyPrompt);
