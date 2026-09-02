export const SHARE_DISCOVERY_CHANNEL = "share-discovery";

export function formatTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function userProfileUrl(author = {}) {
  return author?.id ? `/users/${encodeURIComponent(author.id)}` : "/community";
}

export function isSharePost(post = {}) {
  return post.channel === SHARE_DISCOVERY_CHANNEL;
}

export function coverImage(post = {}) {
  return (post.attachments || []).find((attachment) => attachment.type === "image") || null;
}

export function shouldShowTitle(post) {
  if (isSharePost(post)) return true;
  const normalizedTitle = String(post.title || "").replace(/\s+/g, " ").trim();
  const normalizedBody = String(post.body || "").replace(/\s+/g, " ").trim();
  return normalizedTitle && !normalizedBody.startsWith(normalizedTitle);
}

export function excerpt(value) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  return text.length > 128 ? `${text.slice(0, 128)}...` : text;
}

export function attachmentIcon(type = "") {
  if (type.startsWith("image/")) return "🖼";
  if (type.startsWith("video/")) return "🎬";
  return "📎";
}

export function countReplies(replies = []) {
  return replies.reduce((count, reply) => count + 1 + (reply.children?.length || 0), 0);
}

export function replyCount(post) {
  if (Number.isFinite(Number(post.replyCount))) return Number(post.replyCount);
  return countReplies(post.replies || []);
}
