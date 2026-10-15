import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const publicDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "public");

// Resolve /some/dir or /some/dir/ to public/some/dir/index.html when it exists, so
// standalone pages (404 game, tools, works previews in iframes) are served in dev
// instead of the SPA fallback. `vite preview` already does this from dist/.
function publicIndexFor(url) {
  if (!url || url.includes("..") || path.extname(url)) return "";
  const relative = url.replace(/^\/+|\/+$/g, "");
  if (!relative) return "";
  const candidate = path.join(publicDir, relative, "index.html");
  return candidate.startsWith(publicDir) && existsSync(candidate) && statSync(candidate).isFile()
    ? `/${relative}/index.html`
    : "";
}

const aiTestPath = "/vibe-coding/ai-personality-test";
const agentPath = "/vibe-coding/4399123agent";
const openclawEasyConfigPath = "/vibe-coding/openclaw-easy-config";
const frontendAdminPaths = new Set([
  "/admin",
  "/admin/",
  "/admin/users",
  "/admin/users/",
  "/admin/vibe-coding-submissions",
  "/admin/vibe-coding-submissions/",
  "/admin/game-records",
  "/admin/game-records/",
]);

function aiTestDevRoute() {
  return {
    name: "ai-test-dev-route",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split("?")[0];

        if (url === aiTestPath || url === `${aiTestPath}/`) {
          req.url = "/ai-test.html";
        }

        if (url === openclawEasyConfigPath || url === `${openclawEasyConfigPath}/`) {
          req.url = `${openclawEasyConfigPath}/index.html`;
        }

        const publicIndex = publicIndexFor(url);
        if (publicIndex) {
          if (!url.endsWith("/")) {
            // Keep relative asset URLs (./styles.css) resolving inside the directory.
            res.statusCode = 301;
            res.setHeader("Location", `${url}/`);
            res.end();
            return;
          }
          req.url = publicIndex;
        }

        if (url === agentPath) {
          res.statusCode = 301;
          res.setHeader("Location", `${agentPath}/`);
          res.end();
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [aiTestDevRoute(), vue()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["vue"],
        },
      },
    },
  },
  server: {
    proxy: {
      "/api": "http://127.0.0.1:8000",
      "/admin": {
        target: "http://127.0.0.1:8000",
        bypass(req) {
          const url = req.url?.split("?")[0];
          if (frontendAdminPaths.has(url)) {
            return "/index.html";
          }
        },
      },
      "/static": "http://127.0.0.1:8000",
      "/media": "http://127.0.0.1:8000",
      [agentPath]: {
        target: "http://127.0.0.1:4399",
        rewrite: (path) => path.replace(/^\/vibe-coding\/4399123agent/, "") || "/",
      },
    },
  },
});
