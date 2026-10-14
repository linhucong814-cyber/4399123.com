export const USERNAME_HELP = "1-32 位字母、数字（支持中文）、下划线、点或短横线。";
export const USERNAME_RE = /^[\p{L}\p{N}_.-]{1,32}$/u;
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

export function characterCount(value = "") {
  return Array.from(String(value)).length;
}

export function normalizeUsername(value = "") {
  return String(value).normalize("NFKC").trim();
}

export function normalizeBio(value = "") {
  return String(value).replace(/\r\n/g, "\n").trim();
}

export function profileIsDirty(form, user) {
  if (!user) return false;
  return normalizeUsername(form.username) !== user.username || normalizeBio(form.bio) !== (user.bio || "");
}

export function usernameIsLocked(user, now = Date.now()) {
  return !!user && !user.isAdmin && new Date(user.canChangeUsernameAt).getTime() > now;
}

export function avatarValidationError(file) {
  if (!/\.(jpe?g|png|gif|webp)$/i.test(file.name) || !["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type)) {
    return "头像仅支持 JPG、PNG、GIF 或 WebP。";
  }
  return file.size > AVATAR_MAX_BYTES ? "头像不能超过 2MB。" : "";
}
