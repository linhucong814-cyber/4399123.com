# Print Garden

一款在浏览器中完成“创作玩具 → 虚拟 3D 打印 → 收获展示 → 收藏升级”的 Three.js 小游戏。

## 本地运行

```bash
npm install
npm run serve
```

然后访问 `http://127.0.0.1:4173`。

Three.js 0.164.1 已固定在 `vendor/three/`，因此运行时不依赖第三方 CDN，并兼容站点现有的同源 CSP。许可证见 `vendor/three/LICENSE`。

## 验证

```bash
npm test
```

冒烟测试会在严格 CSP 下验证 1440×900、768×1024、390×844 三种视口，以及自由创作、撤销/重做、打印、收获、收藏和刷新恢复流程。若系统 Chrome 不在默认位置，可通过 `CHROME_PATH` 指定。

## 部署副本

本目录是 Print Garden 的权威源码。主站部署副本位于 `../ai/frontend/public/vibe-coding/print-garden/`。

```bash
npm run sync:deploy
npm run sync:check
```

同步后在 `../ai/frontend` 运行 `npm run build`。部署生产环境需要单独授权。

## 主要文件

- `index.html`：页面结构、流程导航和可访问性语义
- `style.css`：响应式布局和玩具工坊视觉系统
- `src/main.js`：Three.js 场景、编辑器、游戏状态与本地存档
- `tests/smoke.mjs`：端到端冒烟测试
- `scripts/sync-deploy.mjs`：部署副本同步和一致性检查
