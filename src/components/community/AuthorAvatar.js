import { h } from "vue";

export const avatarPalette = ["#1e6f5c", "#294f8f", "#c84f3a", "#7b5d15", "#5b5fc7", "#20736f"];

export function authorInitial(username = "") {
  return String(username || "U").trim().slice(0, 1).toUpperCase() || "U";
}

export function avatarStyle(username = "") {
  const text = String(username || "user");
  let hash = 0;
  for (const char of text) {
    hash = (hash + char.charCodeAt(0)) % avatarPalette.length;
  }
  return { "--avatar-bg": avatarPalette[hash] };
}

const AuthorAvatar = {
  name: "AuthorAvatar",
  props: {
    author: {
      type: Object,
      default: () => ({}),
    },
    size: {
      type: String,
      default: "",
    },
    href: {
      type: String,
      default: "",
    },
  },
  data() {
    return { imageFailed: false };
  },
  computed: {
    username() {
      return this.author?.username || "user";
    },
    avatarUrl() {
      return this.imageFailed ? "" : this.author?.avatarUrl || "";
    },
    initial() {
      return authorInitial(this.username);
    },
    style() {
      return avatarStyle(this.username);
    },
    label() {
      return `${this.username} 的头像`;
    },
  },
  watch: {
    "author.avatarUrl"() {
      this.imageFailed = false;
    },
  },
  render() {
    const tag = this.href ? "a" : "span";
    return h(
      tag,
      {
        href: this.href || undefined,
        class: ["author-avatar", { large: this.size === "large", "has-image": Boolean(this.avatarUrl) }],
        style: this.style,
        "aria-label": this.label,
        onClick: this.href
          ? (event) => {
              event.stopPropagation();
            }
          : undefined,
      },
      this.avatarUrl
        ? [
            h("img", {
              src: this.avatarUrl,
              alt: this.label,
              loading: "lazy",
              onError: () => {
                this.imageFailed = true;
              },
            }),
          ]
        : [h("span", { "aria-hidden": "true" }, this.initial)],
    );
  },
};

export default AuthorAvatar;
