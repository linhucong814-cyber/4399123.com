import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

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
