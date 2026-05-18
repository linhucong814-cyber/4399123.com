import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

const aiTestPath = "/vibe-coding/ai-personality-test";
const agentPath = "/vibe-coding/4399123agent";

function aiTestDevRoute() {
  return {
    name: "ai-test-dev-route",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split("?")[0];

        if (url === aiTestPath || url === `${aiTestPath}/`) {
          req.url = "/ai-test.html";
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
  server: {
    proxy: {
      "/api": "http://127.0.0.1:8000",
      "/admin": "http://127.0.0.1:8000",
      "/static": "http://127.0.0.1:8000",
      [agentPath]: {
        target: "http://127.0.0.1:4399",
        rewrite: (path) => path.replace(/^\/vibe-coding\/4399123agent/, "") || "/",
      },
    },
  },
});
