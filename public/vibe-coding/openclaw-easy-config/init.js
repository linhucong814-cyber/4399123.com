    setLang(currentLang);
    document.getElementById("langBtn").addEventListener("click", () => {
      setLang(currentLang === "zh" ? "en" : "zh");
    });
