const siteUrl = "https://4399123.com";
const siteName = "4399123";
const defaultDescription =
  "4399123 是一个为「创造想法」而生的 Vibe Coding 社区：把 AI 与 Vibe Coding 的想法做成可直接点击的作品，在作品、博客与社区讨论之间持续迭代。";
const defaultImage = `${siteUrl}/assets/brand/4399123-og.png`;

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
  setMeta("property", "og:locale", "zh_CN");
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
      inLanguage: "zh-CN",
    },
  );
}

export function defaultSeo() {
  setPageSeo({
    title: "为创造想法而生的 Vibe Coding 社区",
    path: "/",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebSite",
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
