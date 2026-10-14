const sorts = new Set(["latest", "active", "hot"]);

export function communityHomeUrl(sort = "latest") {
  return sorts.has(sort) && sort !== "latest" ? `/community?sort=${sort}` : "/community";
}

export function normalizeCommunityHomeUrl(href) {
  const url = new URL(href);
  url.searchParams.delete("channel");
  url.searchParams.delete("feed");
  if (!sorts.has(url.searchParams.get("sort")) || url.searchParams.get("sort") === "latest") {
    url.searchParams.delete("sort");
  }
  return `${url.pathname}${url.search}${url.hash}`;
}
