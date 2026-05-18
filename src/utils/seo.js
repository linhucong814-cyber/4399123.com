const siteUrl = "https://4399123.com";
const siteName = "4399123";
const defaultDescription =
  "4399123 是一个开放的 vibe coding 创作者社区基础设施，连接创作者、项目、想法和社区反馈。";
const defaultImage = `${siteUrl}/assets/brand/4399123-domain-logo-transparent.png`;

export function setPageSeo({
  title = siteName,
  description = defaultDescription,
  path = window.location.pathname,
  image = defaultImage,
  type = "website",
  jsonLd,
} = {}) {
  const fullTitle = title === siteName ? siteName : `${title} | ${siteName}`;
  const canonical = new URL(path, siteUrl).toString();

  document.title = fullTitle;
  setMeta("name", "description", description);
  setMeta("property", "og:site_name", siteName);
  setMeta("property", "og:title", fullTitle);
  setMeta("property", "og:description", description);
  setMeta("property", "og:type", type);
  setMeta("property", "og:url", canonical);
  setMeta("property", "og:image", absoluteUrl(image));
  setMeta("name", "twitter:card", "summary_large_image");
  setMeta("name", "twitter:title", fullTitle);
  setMeta("name", "twitter:description", description);
  setMeta("name", "twitter:image", absoluteUrl(image));
  setCanonical(canonical);
  setJsonLd(
    jsonLd || {
      "@context": "https://schema.org",
      "@type": type === "article" ? "BlogPosting" : "WebSite",
      name: fullTitle,
      description,
      url: canonical,
    },
  );
}

export function defaultSeo() {
  setPageSeo({
    title: "4399123",
    path: "/",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: "4399123",
      url: siteUrl,
      description: defaultDescription,
      inLanguage: "zh-CN",
    },
  });
}

function absoluteUrl(value) {
  return new URL(value || defaultImage, siteUrl).toString();
}

function setMeta(attribute, key, content) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function setCanonical(href) {
  let element = document.head.querySelector('link[rel="canonical"]');
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", "canonical");
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
}

function setJsonLd(data) {
  let element = document.head.querySelector('script[data-schema="page"]');
  if (!element) {
    element = document.createElement("script");
    element.type = "application/ld+json";
    element.dataset.schema = "page";
    document.head.appendChild(element);
  }
  element.textContent = JSON.stringify(data);
}
