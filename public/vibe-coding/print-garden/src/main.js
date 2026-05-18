import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TransformControls } from "three/addons/controls/TransformControls.js";

const SHAPE_NAMES = {
  planter: "花盆",
  bot: "小机器人",
  vase: "花瓶",
  rocket: "火箭",
  custom: "自由作品",
};

const PRIMITIVE_NAMES = {
  box: "方块",
  sphere: "球体",
  cylinder: "圆柱",
  cone: "圆锥",
  torus: "圆环",
  stroke: "手绘线条",
};

const BASE_DIMENSIONS = {
  box: [0.72, 0.72, 0.72],
  sphere: [0.84, 0.84, 0.84],
  cylinder: [0.68, 0.82, 0.68],
  cone: [0.84, 0.92, 0.84],
  torus: [0.98, 0.22, 0.98],
  stroke: [1, 1, 1],
};

const AXIS = { x: 0, y: 1, z: 2 };
const SNAP_STEP = 0.25;
const SNAP_THRESHOLD = 0.055;
const STORAGE_KEY = "print-garden-gallery-v2";
const NAME_PREFIXES = ["晨雾", "珊瑚", "薄荷", "星轨", "橘光", "陶白", "蓝湾", "麦穗", "松石", "晴窗"];
const NAME_NOUNS = ["花园", "火箭", "花瓶", "伙伴", "塔台", "灯笼", "容器", "小岛", "种子", "回声"];
const RARITIES = [
  { key: "common", label: "普通", min: 0 },
  { key: "uncommon", label: "精良", min: 42 },
  { key: "rare", label: "稀有", min: 68 },
  { key: "epic", label: "史诗", min: 96 },
  { key: "legendary", label: "传说", min: 132 },
];
const savedGallery = loadGallery();

const state = {
  draft: {
    shape: "planter",
    color: "#ff755f",
    baseColor: "#ff755f",
    size: 1,
    detail: 3,
    components: [
      {
        id: crypto.randomUUID(),
        type: "box",
        color: "#ff755f",
        position: [0, 0.35, 0],
        rotation: [0, 0.35, 0],
        scale: [1.1, 0.7, 0.8],
      },
      {
        id: crypto.randomUUID(),
        type: "sphere",
        color: "#44c7b2",
        position: [0.28, 1.02, 0],
        rotation: [0, 0, 0],
        scale: [0.55, 0.55, 0.55],
      },
    ],
  },
  selectedComponentId: null,
  editorTool: "select",
  transformMode: "translate",
  drawing: {
    active: false,
    points: [],
    preview: null,
  },
  print: null,
  finished: null,
  gallery: savedGallery,
  selectedId: savedGallery[0]?.id || null,
  coins: 0,
  level: 1,
  speed: 1,
  autoSpin: true,
};

const ui = {
  shapeControls: document.querySelector("#shapeControls"),
  colorControls: document.querySelector("#colorControls"),
  paintControls: document.querySelector("#paintControls"),
  customColorInput: document.querySelector("#customColorInput"),
  toneRange: document.querySelector("#toneRange"),
  applyAllColorBtn: document.querySelector("#applyAllColorBtn"),
  customEditor: document.querySelector("#customEditor"),
  primitiveControls: document.querySelector("#primitiveControls"),
  quickControls: document.querySelector("#quickControls"),
  toolControls: document.querySelector("#toolControls"),
  deletePartBtn: document.querySelector("#deletePartBtn"),
  editorHint: document.querySelector("#editorHint"),
  partInspector: document.querySelector("#partInspector"),
  selectedPartLabel: document.querySelector("#selectedPartLabel"),
  selectedScaleRange: document.querySelector("#selectedScaleRange"),
  selectedScaleLabel: document.querySelector("#selectedScaleLabel"),
  dimensionSliders: document.querySelectorAll("[data-dimension-slider]"),
  dimensionInputs: document.querySelectorAll("[data-dimension]"),
  positionInputs: document.querySelectorAll("[data-position]"),
  sizeRange: document.querySelector("#sizeRange"),
  detailRange: document.querySelector("#detailRange"),
  nameInput: document.querySelector("#nameInput"),
  randomNameBtn: document.querySelector("#randomNameBtn"),
  rarityLabel: document.querySelector("#rarityLabel"),
  sizeLabel: document.querySelector("#sizeLabel"),
  detailLabel: document.querySelector("#detailLabel"),
  estimateLabel: document.querySelector("#estimateLabel"),
  startPrintBtn: document.querySelector("#startPrintBtn"),
  harvestBtn: document.querySelector("#harvestBtn"),
  harvestHint: document.querySelector("#harvestHint"),
  printerTitle: document.querySelector("#printerTitle"),
  printStatus: document.querySelector("#printStatus"),
  progressLabel: document.querySelector("#progressLabel"),
  progressBar: document.querySelector("#progressBar"),
  shelfList: document.querySelector("#shelfList"),
  collectionWall: document.querySelector("#collectionWall"),
  favoriteLabel: document.querySelector("#favoriteLabel"),
  clearCollectionBtn: document.querySelector("#clearCollectionBtn"),
  coinLabel: document.querySelector("#coinLabel"),
  levelLabel: document.querySelector("#levelLabel"),
  emptyGallery: document.querySelector("#emptyGallery"),
  speedBtn: document.querySelector("#speedBtn"),
  spinBtn: document.querySelector("#spinBtn"),
};

const scenes = {
  workbench: createViewer(document.querySelector("#workbenchCanvas"), {
    camera: [3.2, 2.4, 4.8],
    controls: true,
    clear: 0xf2eee3,
  }),
  printer: createViewer(document.querySelector("#printerCanvas"), {
    camera: [6.8, 4.4, 7.6],
    target: [0, 1.15, 0],
    controls: false,
    clear: 0xe9eee8,
  }),
  gallery: createViewer(document.querySelector("#galleryCanvas"), {
    camera: [3.6, 2.6, 5.4],
    controls: true,
    clear: 0xe8e1d4,
  }),
};

const buildPlate = createBuildPlate();
const printerRig = createPrinterRig();
scenes.printer.scene.add(buildPlate, printerRig.group);

let workbenchModel = null;
let printModel = null;
let galleryModel = null;
let selectedObject = null;
let alignmentGuides = null;
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const drawPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.08);
const transformControls = new TransformControls(scenes.workbench.camera, scenes.workbench.renderer.domElement);
transformControls.setMode(state.transformMode);
transformControls.setSize(0.78);
transformControls.addEventListener("dragging-changed", (event) => {
  scenes.workbench.controls.enabled = !event.value;
});
transformControls.addEventListener("objectChange", syncSelectedComponent);
transformControls.addEventListener("mouseUp", () => {
  snapSelectedComponent();
  updateInspector();
});
scenes.workbench.scene.add(transformControls);
const clock = new THREE.Clock();

function createViewer(canvas, options) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(options.clear);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(...options.camera);
  camera.lookAt(...(options.target || [0, 0.75, 0]));

  const hemi = new THREE.HemisphereLight(0xffffff, 0x9c9587, 2.2);
  scene.add(hemi);

  const key = new THREE.DirectionalLight(0xffffff, 2.8);
  key.position.set(4, 7, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0x7fcfc1, 0.8);
  fill.position.set(-4, 3, 3);
  scene.add(fill);

  let controls = null;
  if (options.controls) {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 0.55, 0);
    controls.minDistance = 2.6;
    controls.maxDistance = 8;
    controls.enablePan = false;
  }

  return { scene, renderer, camera, controls, canvas };
}

function createMaterial(color, roughness = 0.55) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness: 0.04,
  });
}

function createBaseGround(width = 6, depth = 5, color = 0xd8d0c1) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(width, 0.12, depth),
    createMaterial(color, 0.8),
  );
  mesh.position.y = -0.06;
  mesh.receiveShadow = true;
  return mesh;
}

function createBuildPlate() {
  const group = new THREE.Group();
  const base = createBaseGround(5.6, 4.2, 0xcfd5cf);
  base.position.y = -0.02;
  group.add(base);

  const grid = new THREE.GridHelper(5.2, 10, 0x6f7a82, 0xb6beb7);
  grid.position.y = 0.055;
  group.add(grid);
  return group;
}

function createAlignmentGuides() {
  const group = new THREE.Group();
  group.visible = false;

  const grid = new THREE.GridHelper(5.2, 20, 0x8f968f, 0xcbd2ca);
  grid.position.y = 0.071;
  group.add(grid);

  const xMaterial = new THREE.LineBasicMaterial({ color: 0xff755f });
  const zMaterial = new THREE.LineBasicMaterial({ color: 0x526cff });
  const yMaterial = new THREE.LineBasicMaterial({ color: 0x44c7b2 });

  const xLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-2.6, 0.085, 0), new THREE.Vector3(2.6, 0.085, 0)]),
    xMaterial,
  );
  xLine.name = "guideX";
  group.add(xLine);

  const zLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0.09, -2.0), new THREE.Vector3(0, 0.09, 2.0)]),
    zMaterial,
  );
  zLine.name = "guideZ";
  group.add(zLine);

  const yLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0.05, 0), new THREE.Vector3(0, 2.4, 0)]),
    yMaterial,
  );
  yLine.name = "guideY";
  group.add(yLine);

  return group;
}

function createPrinterRig() {
  const group = new THREE.Group();
  const dark = createMaterial(0x27313d, 0.48);
  const rail = createMaterial(0x46515f, 0.38);
  const accent = createMaterial(0xff755f, 0.4);

  const posts = [
    [-2.4, 1.25, -1.65],
    [2.4, 1.25, -1.65],
    [-2.4, 1.25, 1.65],
    [2.4, 1.25, 1.65],
  ];
  posts.forEach(([x, y, z]) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.5, 0.12), dark);
    post.position.set(x, y, z);
    post.castShadow = true;
    group.add(post);
  });

  const topBars = [
    [0, 2.5, -1.65, 5.0, 0.12, 0.12],
    [0, 2.5, 1.65, 5.0, 0.12, 0.12],
    [-2.4, 2.5, 0, 0.12, 0.12, 3.4],
    [2.4, 2.5, 0, 0.12, 0.12, 3.4],
  ];
  topBars.forEach(([x, y, z, w, h, d]) => {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), dark);
    bar.position.set(x, y, z);
    bar.castShadow = true;
    group.add(bar);
  });

  const gantry = new THREE.Group();
  const xRail = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.1, 0.1), rail);
  xRail.castShadow = true;
  gantry.add(xRail);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.34, 0.42), accent);
  head.position.y = -0.24;
  head.castShadow = true;
  gantry.add(head);

  const nozzle = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.28, 24), createMaterial(0x20242a, 0.3));
  nozzle.position.y = -0.55;
  nozzle.rotation.x = Math.PI;
  nozzle.castShadow = true;
  gantry.add(nozzle);

  gantry.position.y = 2.05;
  group.add(gantry);

  return { group, gantry, head };
}

function createModel(spec) {
  const group = new THREE.Group();
  const color = spec.color || "#ff755f";
  const mat = createMaterial(color);
  const alt = createMaterial(lighten(color, 0.22));
  const dark = createMaterial(0x27313d, 0.45);
  const scale = spec.size || 1;
  const detail = spec.detail || 3;

  if (spec.shape === "bot") buildBot(group, mat, alt, dark, detail);
  if (spec.shape === "vase") buildVase(group, mat, alt, detail);
  if (spec.shape === "rocket") buildRocket(group, mat, alt, dark, detail);
  if (spec.shape === "planter") buildPlanter(group, mat, alt, detail);
  if (spec.shape === "custom") buildCustom(group, spec.components || []);

  group.scale.setScalar(scale);
  group.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      child.userData.paintable = child.material === mat || child.material === alt;
    }
  });
  return group;
}

function buildCustom(group, components) {
  components.forEach((component) => {
    const mesh = createComponentMesh(component);
    if (!mesh) return;
    mesh.userData.componentId = component.id;
    mesh.userData.componentType = component.type;
    group.add(mesh);
  });
}

function createComponentMesh(component) {
  const color = component.color || "#ff755f";
  const material = createMaterial(color);
  let geometry;

  if (component.type === "box") geometry = new THREE.BoxGeometry(0.72, 0.72, 0.72);
  if (component.type === "sphere") geometry = new THREE.SphereGeometry(0.42, 32, 18);
  if (component.type === "cylinder") geometry = new THREE.CylinderGeometry(0.34, 0.34, 0.82, 32);
  if (component.type === "cone") geometry = new THREE.ConeGeometry(0.42, 0.92, 32);
  if (component.type === "torus") geometry = new THREE.TorusGeometry(0.38, 0.11, 14, 42);
  if (component.type === "stroke") geometry = createStrokeGeometry(component.points || [], component.radius || 0.055);
  if (!geometry) return null;

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.fromArray(component.position || [0, 0.4, 0]);
  mesh.rotation.fromArray(component.rotation || [0, 0, 0]);
  mesh.scale.fromArray(component.scale || [1, 1, 1]);
  mesh.userData.paintable = true;
  return mesh;
}

function createStrokeGeometry(points, radius) {
  const vectors = points.map((point) => new THREE.Vector3(...point));
  if (vectors.length < 2) {
    vectors.push(new THREE.Vector3(0, 0.1, 0), new THREE.Vector3(0.25, 0.1, 0.25));
  }
  const curve = new THREE.CatmullRomCurve3(vectors);
  return new THREE.TubeGeometry(curve, Math.max(8, vectors.length * 3), radius, 12, false);
}

function buildPlanter(group, mat, alt, detail) {
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.58, 0.9, 48, 1, true), mat);
  pot.position.y = 0.48;
  group.add(pot);

  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.79, 0.06, 12, 48), alt);
  rim.position.y = 0.95;
  rim.rotation.x = Math.PI / 2;
  group.add(rim);

  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.52, 0.18, 48), alt);
  foot.position.y = 0.12;
  group.add(foot);

  for (let i = 0; i < detail + 2; i += 1) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.15, 18, 12), createMaterial(i % 2 ? 0x44c7b2 : 0x6fd18a));
    const angle = (i / (detail + 2)) * Math.PI * 2;
    leaf.scale.set(0.7, 1.7, 0.32);
    leaf.position.set(Math.cos(angle) * 0.28, 1.16 + i * 0.035, Math.sin(angle) * 0.28);
    leaf.rotation.z = -angle;
    group.add(leaf);
  }
}

function buildBot(group, mat, alt, dark, detail) {
  const body = new THREE.Mesh(new THREE.BoxGeometry(1, 0.9, 0.72), mat);
  body.position.y = 0.72;
  group.add(body);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.55, 0.62), alt);
  head.position.y = 1.45;
  group.add(head);

  [-0.23, 0.23].forEach((x) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 10), dark);
    eye.position.set(x, 1.5, 0.325);
    group.add(eye);
  });

  [-0.66, 0.66].forEach((x) => {
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.58, 8, 16), alt);
    arm.position.set(x, 0.75, 0);
    arm.rotation.z = x > 0 ? -0.18 : 0.18;
    group.add(arm);
  });

  [-0.26, 0.26].forEach((x) => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.38, 0.22), dark);
    leg.position.set(x, 0.19, 0);
    group.add(leg);
  });

  for (let i = 0; i < detail; i += 1) {
    const button = new THREE.Mesh(new THREE.SphereGeometry(0.04, 14, 8), dark);
    button.position.set(-0.18 + i * 0.18, 0.82, 0.37);
    group.add(button);
  }
}

function buildVase(group, mat, alt, detail) {
  const points = [
    new THREE.Vector2(0.28, 0),
    new THREE.Vector2(0.5, 0.18),
    new THREE.Vector2(0.7, 0.72),
    new THREE.Vector2(0.5, 1.18),
    new THREE.Vector2(0.34, 1.52),
    new THREE.Vector2(0.48, 1.68),
  ];
  const vase = new THREE.Mesh(new THREE.LatheGeometry(points, 56), mat);
  group.add(vase);

  for (let i = 0; i < detail; i += 1) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.46 + i * 0.025, 0.018, 8, 48), alt);
    ring.position.y = 0.38 + i * 0.22;
    ring.rotation.x = Math.PI / 2;
    group.add(ring);
  }
}

function buildRocket(group, mat, alt, dark, detail) {
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.48, 1.35, 48), mat);
  body.position.y = 0.85;
  group.add(body);

  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.58, 48), alt);
  nose.position.y = 1.82;
  group.add(nose);

  for (let i = 0; i < 3; i += 1) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.48, 0.34), dark);
    const angle = (i / 3) * Math.PI * 2;
    fin.position.set(Math.cos(angle) * 0.48, 0.28, Math.sin(angle) * 0.48);
    fin.rotation.y = -angle;
    group.add(fin);
  }

  for (let i = 0; i < detail; i += 1) {
    const window = new THREE.Mesh(new THREE.SphereGeometry(0.08, 18, 12), createMaterial(0xdff7ff, 0.12));
    window.position.set(0, 0.78 + i * 0.2, 0.49);
    window.scale.z = 0.25;
    group.add(window);
  }
}

function createPrintLayers(spec, progress) {
  const model = createModel(spec);
  const revealHeight = THREE.MathUtils.lerp(0.04, 2.35, progress);
  model.traverse((child) => {
    if (child.isMesh) {
      child.scale.y *= Math.min(1, Math.max(0.05, revealHeight / Math.max(child.position.y + 0.3, 0.4)));
    }
  });
  return model;
}

function lighten(color, amount) {
  const c = new THREE.Color(color);
  c.lerp(new THREE.Color(0xffffff), amount);
  return c;
}

function shiftTone(color, amount) {
  const c = new THREE.Color(color);
  const target = amount >= 0 ? new THREE.Color(0xffffff) : new THREE.Color(0x000000);
  c.lerp(target, Math.abs(amount) / 100);
  return `#${c.getHexString()}`;
}

function replaceModel(viewer, current, next) {
  if (current) viewer.scene.remove(current);
  viewer.scene.add(next);
  return next;
}

function updateWorkbenchModel() {
  transformControls.detach();
  selectedObject = null;
  const model = createModel(state.draft);
  model.position.y = 0.04;
  workbenchModel = replaceModel(scenes.workbench, workbenchModel, model);
  reselectComponent();
  updateEditorVisibility();
  updateEstimate();
}

function updateEstimate() {
  const seconds = getPrintDuration(state.draft);
  ui.estimateLabel.textContent = formatTime(seconds);
  const rarity = getRarity(state.draft);
  ui.rarityLabel.textContent = rarity.label;
  ui.rarityLabel.className = `rarity-pill rarity-${rarity.key}`;
}

function getPrintDuration(spec) {
  if (spec.shape === "custom") {
    const parts = spec.components?.length || 0;
    const strokes = spec.components?.filter((component) => component.type === "stroke").length || 0;
    return Math.round(12 + parts * 3 + strokes * 4 + (spec.size - 1) * 10);
  }
  const shapeBonus = { planter: 0, bot: 4, vase: 3, rocket: 5 }[spec.shape] || 0;
  return Math.round(10 + spec.detail * 2 + (spec.size - 1) * 10 + shapeBonus);
}

function formatTime(total) {
  const minutes = Math.floor(total / 60).toString().padStart(2, "0");
  const seconds = Math.floor(total % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function getDraftName() {
  return sanitizeName(ui.nameInput.value) || makeRandomName();
}

function sanitizeName(value) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, 18);
}

function makeRandomName() {
  const prefix = NAME_PREFIXES[Math.floor(Math.random() * NAME_PREFIXES.length)];
  const noun = NAME_NOUNS[Math.floor(Math.random() * NAME_NOUNS.length)];
  return `${prefix}${noun}`;
}

function prepareNextName() {
  ui.nameInput.value = makeRandomName();
  updateEstimate();
}

function getRarity(spec) {
  const components = spec.components || [];
  const uniqueColors = new Set(components.map((component) => component.color).filter(Boolean)).size;
  const strokes = components.filter((component) => component.type === "stroke").length;
  const shapeBonus = { planter: 5, bot: 10, vase: 12, rocket: 14, custom: 16 }[spec.shape] || 5;
  const customScore = spec.shape === "custom" ? components.length * 4 + strokes * 5 + uniqueColors * 5 : 0;
  const score = Math.round((spec.detail || 1) * 7 + ((spec.size || 1) - 0.8) * 30 + shapeBonus + customScore);
  const index = RARITIES.reduce((best, rarity, rarityIndex) => (score >= rarity.min ? rarityIndex : best), 0);
  return { ...RARITIES[index], score, rank: index };
}

function saveGallery() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.gallery));
  } catch {
    // Storage can be unavailable in private or embedded browser contexts.
  }
}

function loadGallery() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const items = JSON.parse(raw);
    if (!Array.isArray(items)) return [];
    return items
      .filter((item) => item && item.id && item.shape)
      .map((item) => ({
        ...item,
        name: sanitizeName(item.name) || `${SHAPE_NAMES[item.shape] || "作品"} #${Date.now().toString().slice(-4)}`,
        rarity: item.rarity || getRarity(item),
        favorite: Boolean(item.favorite),
      }));
  } catch {
    return [];
  }
}

function updateProgression() {
  state.coins = state.gallery.reduce((total, item) => total + 8 + (item.detail || 1) * 3 + (item.rarity?.rank || 0) * 5, 0);
  state.level = 1 + Math.floor(state.gallery.length / 3);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);
}

function startPrint() {
  if (state.print) return;
  const spec = {
    id: crypto.randomUUID(),
    name: getDraftName(),
    shape: state.draft.shape,
    color: state.draft.color,
    size: state.draft.size,
    detail: state.draft.detail,
    components: cloneComponents(state.draft.components),
    createdAt: Date.now(),
  };
  spec.rarity = getRarity(spec);
  state.print = {
    spec,
    duration: getPrintDuration(spec),
    elapsed: 0,
  };
  state.finished = null;
  ui.startPrintBtn.disabled = true;
  ui.startPrintBtn.textContent = "打印中";
  ui.harvestBtn.disabled = true;
  ui.harvestHint.textContent = "打印机正在工作";
  ui.printerTitle.textContent = `正在打印 ${spec.name}`;
}

function finishPrint() {
  state.finished = state.print.spec;
  state.print = null;
  ui.startPrintBtn.disabled = false;
  ui.startPrintBtn.textContent = "继续制作下一个";
  ui.harvestBtn.disabled = false;
  ui.harvestHint.textContent = `${state.finished.name} 已完成`;
  ui.printerTitle.textContent = "打印完成";
  ui.printStatus.textContent = "可以收获了";
  ui.progressLabel.textContent = "100%";
  ui.progressBar.style.width = "100%";
}

function harvestPrint() {
  if (!state.finished) return;
  const item = {
    ...state.finished,
    rarity: state.finished.rarity || getRarity(state.finished),
    favorite: false,
  };
  state.gallery.unshift(item);
  state.selectedId = item.id;
  state.finished = null;
  updateProgression();
  ui.harvestBtn.disabled = true;
  ui.harvestHint.textContent = "已放入展示台";
  ui.printerTitle.textContent = "空闲中";
  ui.printStatus.textContent = "选择作品后开始打印";
  ui.progressLabel.textContent = "0%";
  ui.progressBar.style.width = "0%";
  renderShelf();
  renderCollectionWall();
  updateGalleryModel();
  updateCounters();
  saveGallery();
  prepareNextName();
}

function updateGalleryModel() {
  const item = state.gallery.find((entry) => entry.id === state.selectedId);
  ui.emptyGallery.classList.toggle("hidden", Boolean(item));
  if (!item) {
    if (galleryModel) scenes.gallery.scene.remove(galleryModel);
    galleryModel = null;
    return;
  }
  const model = createModel(item);
  model.position.y = 0.04;
  galleryModel = replaceModel(scenes.gallery, galleryModel, model);
}

function renderShelf() {
  ui.shelfList.innerHTML = "";
  state.gallery.forEach((item) => {
    const card = document.createElement("article");
    card.className = `shelf-item${item.id === state.selectedId ? " active" : ""}`;
    card.dataset.id = item.id;
    const partText = item.shape === "custom" ? `${item.components?.length || 0} 个零件` : `${item.detail} 级细节`;
    const rarity = item.rarity || getRarity(item);
    card.innerHTML = `
      <div class="shelf-topline">
        <button class="shelf-select" type="button" data-select-id="${escapeHtml(item.id)}">
          <b>${escapeHtml(item.name)}</b>
        </button>
        <button class="favorite-toggle${item.favorite ? " active" : ""}" type="button" data-favorite-id="${escapeHtml(item.id)}" aria-label="收藏 ${escapeHtml(item.name)}">收</button>
      </div>
      <span>${escapeHtml(partText)} · ${Math.round(item.size * 100)}%</span>
      <span class="rarity-pill rarity-${rarity.key}">${rarity.label}</span>
    `;
    ui.shelfList.append(card);
  });
}

function renderCollectionWall() {
  const favorites = state.gallery.filter((item) => item.favorite);
  ui.collectionWall.innerHTML = "";
  if (!favorites.length) {
    const empty = document.createElement("div");
    empty.className = "collection-card empty";
    empty.textContent = "点击作品卡片上的“收”，把喜欢的打印件挂到这里。";
    ui.collectionWall.append(empty);
    return;
  }
  favorites.forEach((item) => {
    const rarity = item.rarity || getRarity(item);
    const card = document.createElement("button");
    card.type = "button";
    card.className = "collection-card";
    card.dataset.collectionId = item.id;
    card.innerHTML = `
      <b>${escapeHtml(item.name)}</b>
      <span>${escapeHtml(SHAPE_NAMES[item.shape] || "自由作品")} · ${new Date(item.createdAt).toLocaleDateString("zh-CN")}</span>
      <span class="rarity-pill rarity-${rarity.key}">${rarity.label}</span>
    `;
    ui.collectionWall.append(card);
  });
}

function toggleFavorite(id) {
  const item = state.gallery.find((entry) => entry.id === id);
  if (!item) return;
  item.favorite = !item.favorite;
  renderShelf();
  renderCollectionWall();
  updateCounters();
  saveGallery();
}

function clearCollection() {
  state.gallery = state.gallery.map((item) => ({ ...item, favorite: false }));
  renderShelf();
  renderCollectionWall();
  updateCounters();
  saveGallery();
}

function updateCounters() {
  updateProgression();
  ui.coinLabel.textContent = state.coins;
  ui.levelLabel.textContent = state.level;
  ui.favoriteLabel.textContent = state.gallery.filter((item) => item.favorite).length;
}

function updateEditorVisibility() {
  const isCustom = state.draft.shape === "custom";
  ui.customEditor.hidden = !isCustom;
  if (alignmentGuides) alignmentGuides.visible = isCustom;
  ui.editorHint.textContent = getEditorHint();
  if (!isCustom) {
    transformControls.detach();
    state.selectedComponentId = null;
    selectedObject = null;
  }
  updateInspector();
}

function getEditorHint() {
  if (state.draft.shape !== "custom") return "";
  if (state.editorTool === "draw") return "按住并拖动画布来画线，松开后会生成可打印的 3D 管状笔触。";
  if (!state.selectedComponentId) return "点击一个零件选中；也可以添加几何体开始搭建。";
  const modeText = { translate: "移动", rotate: "旋转", scale: "缩放" }[state.transformMode];
  return `已选中零件，可以单独调缩放、长宽高和 XYZ，也可以用 WASD 或方向键平移，Q/E 上下移动。靠近网格线会自动吸附对齐。`;
}

function addPrimitive(type) {
  const count = state.draft.components.length;
  const offset = ((count % 5) - 2) * 0.32;
  const component = {
    id: crypto.randomUUID(),
    type,
    color: state.draft.color,
    position: [offset, type === "torus" ? 0.58 : 0.42, Math.floor(count / 5) * 0.28],
    rotation: [0, type === "torus" ? Math.PI / 2 : 0, 0],
    scale: [1, 1, 1],
  };
  state.draft.components.push(component);
  state.selectedComponentId = component.id;
  updateWorkbenchModel();
}

function duplicateSelectedComponent() {
  const component = getSelectedComponent();
  if (!component) return;
  const next = cloneComponents([component])[0];
  next.id = crypto.randomUUID();
  next.position = [
    THREE.MathUtils.clamp((next.position?.[0] || 0) + 0.28, -2.4, 2.4),
    next.position?.[1] || 0.42,
    THREE.MathUtils.clamp((next.position?.[2] || 0) + 0.18, -1.8, 1.8),
  ];
  state.draft.components.push(next);
  state.selectedComponentId = next.id;
  updateWorkbenchModel();
}

function mirrorSelectedComponent() {
  const component = getSelectedComponent();
  if (!component) return;
  const next = cloneComponents([component])[0];
  next.id = crypto.randomUUID();
  next.position = [-(next.position?.[0] || 0), next.position?.[1] || 0.42, next.position?.[2] || 0];
  next.rotation = [next.rotation?.[0] || 0, -(next.rotation?.[1] || 0), next.rotation?.[2] || 0];
  state.draft.components.push(next);
  state.selectedComponentId = next.id;
  updateWorkbenchModel();
}

function clearCustomCanvas() {
  if (state.draft.shape !== "custom") return;
  state.draft.components = [];
  state.selectedComponentId = null;
  updateWorkbenchModel();
}

function generateSurpriseCustom() {
  state.draft.shape = "custom";
  const palette = ["#ff755f", "#44c7b2", "#f7c44a", "#6c83ff", "#f4f0e8", "#20242a", "#b36bff"];
  const count = 5 + Math.floor(Math.random() * 5);
  state.draft.components = [];
  for (let index = 0; index < count; index += 1) {
    const type = ["box", "sphere", "cylinder", "cone", "torus"][Math.floor(Math.random() * 5)];
    const x = ((index % 3) - 1) * (0.28 + Math.random() * 0.18);
    const z = (Math.floor(index / 3) - 1) * 0.28;
    state.draft.components.push(part(
      crypto.randomUUID(),
      type,
      palette[Math.floor(Math.random() * palette.length)],
      [x, 0.32 + Math.random() * 0.74, z],
      [Math.random() * 0.4, Math.random() * Math.PI, Math.random() * 0.3],
      [0.45 + Math.random() * 0.8, 0.45 + Math.random() * 0.9, 0.45 + Math.random() * 0.8],
    ));
  }
  state.selectedComponentId = state.draft.components[0]?.id || null;
  ui.shapeControls.querySelectorAll("button").forEach((button) => {
    button.classList.toggle("active", button.dataset.shape === "custom");
  });
  updateWorkbenchModel();
}

function addSpongeBuddyPreset() {
  const baseId = crypto.randomUUID().slice(0, 8);
  const pieces = [
    part(`${baseId}-body`, "box", "#f7d94a", [0, 0.78, 0], [0, 0.08, 0], [1.05, 1.28, 0.42]),
    part(`${baseId}-apron`, "box", "#44c7b2", [0, 0.28, 0.32], [0, 0, 0], [0.92, 0.32, 0.08]),
    part(`${baseId}-belt`, "box", "#20242a", [0, 0.45, 0.36], [0, 0, 0], [1.0, 0.08, 0.08]),
    part(`${baseId}-eye-l`, "sphere", "#f4f0e8", [-0.22, 1.08, 0.36], [0, 0, 0], [0.28, 0.28, 0.08]),
    part(`${baseId}-eye-r`, "sphere", "#f4f0e8", [0.22, 1.08, 0.36], [0, 0, 0], [0.28, 0.28, 0.08]),
    part(`${baseId}-pupil-l`, "sphere", "#526cff", [-0.22, 1.08, 0.43], [0, 0, 0], [0.08, 0.08, 0.035]),
    part(`${baseId}-pupil-r`, "sphere", "#526cff", [0.22, 1.08, 0.43], [0, 0, 0], [0.08, 0.08, 0.035]),
    part(`${baseId}-smile`, "torus", "#20242a", [0, 0.83, 0.42], [Math.PI / 2, 0, 0], [0.34, 0.06, 0.16]),
    part(`${baseId}-arm-l`, "cylinder", "#f7d94a", [-0.62, 0.72, 0.02], [0, 0, Math.PI / 2], [0.3, 0.62, 0.3]),
    part(`${baseId}-arm-r`, "cylinder", "#f7d94a", [0.62, 0.72, 0.02], [0, 0, Math.PI / 2], [0.3, 0.62, 0.3]),
    part(`${baseId}-leg-l`, "cylinder", "#526cff", [-0.22, 0.06, 0], [0, 0, 0], [0.22, 0.38, 0.22]),
    part(`${baseId}-leg-r`, "cylinder", "#526cff", [0.22, 0.06, 0], [0, 0, 0], [0.22, 0.38, 0.22]),
    part(`${baseId}-shoe-l`, "box", "#20242a", [-0.22, -0.14, 0.12], [0, 0, 0], [0.32, 0.12, 0.42]),
    part(`${baseId}-shoe-r`, "box", "#20242a", [0.22, -0.14, 0.12], [0, 0, 0], [0.32, 0.12, 0.42]),
  ];

  const holes = [
    [-0.36, 1.34, 0.42, 0.09],
    [0.38, 1.36, 0.42, 0.07],
    [-0.42, 0.82, 0.43, 0.06],
    [0.4, 0.65, 0.43, 0.08],
    [0.06, 1.48, 0.42, 0.055],
    [-0.1, 0.55, 0.43, 0.055],
  ];
  holes.forEach(([x, y, z, size], index) => {
    pieces.push(part(`${baseId}-hole-${index}`, "sphere", "#d9ad2b", [x, y, z], [0, 0, 0], [size, size, 0.025]));
  });

  state.draft.shape = "custom";
  state.draft.components.push(...pieces);
  state.selectedComponentId = `${baseId}-body`;
  ui.shapeControls.querySelectorAll("button").forEach((button) => {
    button.classList.toggle("active", button.dataset.shape === "custom");
  });
  updateWorkbenchModel();
}

function part(id, type, color, position, rotation, scale) {
  return { id, type, color, position, rotation, scale };
}

function setEditorTool(tool) {
  state.editorTool = tool;
  ui.toolControls.querySelectorAll("[data-tool]").forEach((button) => {
    button.classList.toggle("active", button.dataset.tool === tool);
  });
  scenes.workbench.controls.enabled = tool !== "draw";
  transformControls.enabled = tool !== "draw";
  if (tool === "draw") transformControls.detach();
  if (tool === "select") reselectComponent();
  ui.editorHint.textContent = getEditorHint();
}

function setTransformMode(mode) {
  state.transformMode = mode;
  transformControls.setMode(mode);
  ui.toolControls.querySelectorAll("[data-transform]").forEach((button) => {
    button.classList.toggle("active", button.dataset.transform === mode);
  });
  setEditorTool("select");
}

function syncSelectedComponent() {
  if (!selectedObject || !state.selectedComponentId) return;
  if (state.transformMode === "translate") {
    applyMagneticSnap(selectedObject.position);
    updateAlignmentGuides(selectedObject.position);
  }
  const component = state.draft.components.find((item) => item.id === state.selectedComponentId);
  if (!component) return;
  component.position = selectedObject.position.toArray();
  component.rotation = [selectedObject.rotation.x, selectedObject.rotation.y, selectedObject.rotation.z];
  component.scale = selectedObject.scale.toArray();
  updateInspector();
}

function selectComponent(object) {
  const mesh = object?.isMesh ? object : null;
  const id = mesh?.userData.componentId;
  if (!id) return;
  state.selectedComponentId = id;
  selectedObject = mesh;
  transformControls.attach(mesh);
  transformControls.setMode(state.transformMode);
  ui.editorHint.textContent = getEditorHint();
  updateAlignmentGuides(mesh.position);
  updateInspector();
}

function reselectComponent() {
  if (state.draft.shape !== "custom" || !workbenchModel || !state.selectedComponentId) return;
  const found = findComponentObject(state.selectedComponentId);
  if (found) selectComponent(found);
}

function findComponentObject(id) {
  let found = null;
  workbenchModel.traverse((child) => {
    if (!found && child.isMesh && child.userData.componentId === id) found = child;
  });
  return found;
}

function deleteSelectedComponent() {
  if (state.draft.shape !== "custom" || !state.selectedComponentId) return;
  state.draft.components = state.draft.components.filter((component) => component.id !== state.selectedComponentId);
  state.selectedComponentId = null;
  transformControls.detach();
  selectedObject = null;
  updateWorkbenchModel();
}

function getSelectedComponent() {
  if (!state.selectedComponentId) return null;
  return state.draft.components.find((item) => item.id === state.selectedComponentId) || null;
}

function updateInspector() {
  const component = getSelectedComponent();
  const enabled = Boolean(component);
  ui.selectedPartLabel.textContent = component ? PRIMITIVE_NAMES[component.type] || "零件" : "未选中";
  ui.selectedScaleRange.disabled = !enabled;
  ui.dimensionSliders.forEach((input) => {
    input.disabled = !enabled || component?.type === "stroke";
  });
  [...ui.dimensionInputs, ...ui.positionInputs].forEach((input) => {
    input.disabled = !enabled || component?.type === "stroke" && input.dataset.dimension;
  });
  if (!component) {
    ui.selectedScaleRange.value = "100";
    ui.selectedScaleLabel.textContent = "100%";
    ui.dimensionSliders.forEach((input) => {
      input.value = "100";
    });
    [...ui.dimensionInputs, ...ui.positionInputs].forEach((input) => {
      input.value = "";
    });
    return;
  }

  const dims = getComponentDimensions(component);
  const uniformScale = getUniformScale(component);
  ui.selectedScaleRange.value = String(Math.round(uniformScale * 100));
  ui.selectedScaleLabel.textContent = `${Math.round(uniformScale * 100)}%`;
  ui.dimensionInputs.forEach((input) => {
    input.value = formatNumber(dims[AXIS[input.dataset.dimension]]);
  });
  ui.dimensionSliders.forEach((input) => {
    input.value = String(Math.round(dims[AXIS[input.dataset.dimensionSlider]] * 100));
  });
  ui.positionInputs.forEach((input) => {
    input.value = formatNumber(component.position[AXIS[input.dataset.position]]);
  });
}

function getComponentDimensions(component) {
  const base = BASE_DIMENSIONS[component.type] || [1, 1, 1];
  return base.map((value, index) => Math.abs(value * component.scale[index]));
}

function getUniformScale(component) {
  const scale = component.scale || [1, 1, 1];
  return (Math.abs(scale[0]) + Math.abs(scale[1]) + Math.abs(scale[2])) / 3;
}

function setSelectedUniformScale(value) {
  const component = getSelectedComponent();
  if (!component) return;
  if (!Number.isFinite(value)) return;
  const next = THREE.MathUtils.clamp(value / 100, 0.3, 2.2);
  component.scale = [next, next, next];
  if (selectedObject) selectedObject.scale.fromArray(component.scale);
  syncSelectedComponent();
  updateInspector();
}

function setComponentDimension(axis, value) {
  const component = getSelectedComponent();
  if (!component || component.type === "stroke") return;
  if (!Number.isFinite(value)) return;
  const base = BASE_DIMENSIONS[component.type] || [1, 1, 1];
  const index = AXIS[axis];
  const next = THREE.MathUtils.clamp(value, 0.05, 3);
  component.scale[index] = next / base[index];
  if (selectedObject) selectedObject.scale.fromArray(component.scale);
  syncSelectedComponent();
  updateInspector();
}

function setComponentPosition(axis, value) {
  const component = getSelectedComponent();
  if (!component) return;
  if (!Number.isFinite(value)) return;
  const index = AXIS[axis];
  const limits = { x: [-2.4, 2.4], y: [0, 2.5], z: [-1.8, 1.8] }[axis];
  component.position[index] = THREE.MathUtils.clamp(value, limits[0], limits[1]);
  const vector = new THREE.Vector3(...component.position);
  applyMagneticSnap(vector);
  component.position = vector.toArray();
  if (selectedObject) selectedObject.position.fromArray(component.position);
  syncSelectedComponent();
  updateInspector();
}

function applyMagneticSnap(position) {
  position.x = snapValue(position.x, SNAP_STEP, SNAP_THRESHOLD);
  position.z = snapValue(position.z, SNAP_STEP, SNAP_THRESHOLD);
  if (Math.abs(position.y) < 0.08) position.y = 0;
}

function snapValue(value, step, threshold) {
  const target = Math.round(value / step) * step;
  return Math.abs(value - target) <= threshold ? target : value;
}

function snapSelectedComponent() {
  if (!selectedObject) return;
  applyMagneticSnap(selectedObject.position);
  updateAlignmentGuides(selectedObject.position);
  syncSelectedComponent();
}

function updateAlignmentGuides(position) {
  if (!alignmentGuides || !position) return;
  const xLine = alignmentGuides.getObjectByName("guideX");
  const zLine = alignmentGuides.getObjectByName("guideZ");
  const yLine = alignmentGuides.getObjectByName("guideY");
  if (xLine) {
    xLine.position.z = snapValue(position.z, SNAP_STEP, SNAP_THRESHOLD * 2);
    xLine.visible = Math.abs(position.z - xLine.position.z) <= SNAP_THRESHOLD * 2;
  }
  if (zLine) {
    zLine.position.x = snapValue(position.x, SNAP_STEP, SNAP_THRESHOLD * 2);
    zLine.visible = Math.abs(position.x - zLine.position.x) <= SNAP_THRESHOLD * 2;
  }
  if (yLine) {
    yLine.position.x = position.x;
    yLine.position.z = position.z;
    yLine.visible = true;
  }
}

function formatNumber(value) {
  return Number(value).toFixed(2).replace(/\.?0+$/, "");
}

function paintDraftColor(color, options = {}) {
  if (options.resetTone) ui.toneRange.value = "0";
  state.draft.baseColor = color;
  const tonedColor = shiftTone(state.draft.baseColor, Number(ui.toneRange.value || 0));
  state.draft.color = tonedColor;
  ui.customColorInput.value = tonedColor;
  if (state.draft.shape === "custom" && state.selectedComponentId) {
    const component = state.draft.components.find((item) => item.id === state.selectedComponentId);
    if (component) component.color = tonedColor;
    if (selectedObject?.material?.color) selectedObject.material.color.set(tonedColor);
    return;
  }
  updateWorkbenchModel();
}

function applyColorToAllParts() {
  const color = shiftTone(state.draft.baseColor, Number(ui.toneRange.value || 0));
  state.draft.color = color;
  ui.customColorInput.value = color;
  if (state.draft.shape === "custom") {
    state.draft.components = state.draft.components.map((component) => ({ ...component, color }));
    updateWorkbenchModel();
    return;
  }
  updateWorkbenchModel();
}

function getPointerOnPlane(event) {
  const rect = scenes.workbench.canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, scenes.workbench.camera);
  const point = new THREE.Vector3();
  const hit = raycaster.ray.intersectPlane(drawPlane, point);
  if (!hit) return null;
  point.x = THREE.MathUtils.clamp(point.x, -2.2, 2.2);
  point.z = THREE.MathUtils.clamp(point.z, -1.7, 1.7);
  point.y = 0.12;
  return point;
}

function pickComponent(event) {
  if (state.draft.shape !== "custom" || state.editorTool !== "select" || !workbenchModel) return;
  const rect = scenes.workbench.canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, scenes.workbench.camera);
  const meshes = [];
  workbenchModel.traverse((child) => {
    if (child.isMesh && child.userData.componentId) meshes.push(child);
  });
  const [hit] = raycaster.intersectObjects(meshes, false);
  if (hit) {
    selectComponent(hit.object);
  }
}

function beginDraw(event) {
  if (state.draft.shape !== "custom" || state.editorTool !== "draw") return;
  const point = getPointerOnPlane(event);
  if (!point) return;
  state.drawing.active = true;
  state.drawing.points = [point.toArray()];
  scenes.workbench.controls.enabled = false;
  scenes.workbench.canvas.setPointerCapture(event.pointerId);
}

function continueDraw(event) {
  if (!state.drawing.active) return;
  const point = getPointerOnPlane(event);
  if (!point) return;
  const last = state.drawing.points.at(-1);
  const lastPoint = new THREE.Vector3(...last);
  if (lastPoint.distanceTo(point) < 0.08) return;
  state.drawing.points.push(point.toArray());
  updateStrokePreview();
}

function finishDraw(event) {
  if (!state.drawing.active) return;
  state.drawing.active = false;
  scenes.workbench.canvas.releasePointerCapture(event.pointerId);
  scenes.workbench.controls.enabled = false;
  if (state.drawing.preview) {
    scenes.workbench.scene.remove(state.drawing.preview);
    state.drawing.preview.geometry.dispose();
    state.drawing.preview.material.dispose();
    state.drawing.preview = null;
  }
  if (state.drawing.points.length >= 2) {
    const component = {
      id: crypto.randomUUID(),
      type: "stroke",
      color: state.draft.color,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      radius: 0.055,
      points: state.drawing.points,
    };
    state.draft.components.push(component);
    state.selectedComponentId = component.id;
    updateWorkbenchModel();
  }
  state.drawing.points = [];
}

function updateStrokePreview() {
  if (state.drawing.preview) {
    scenes.workbench.scene.remove(state.drawing.preview);
    state.drawing.preview.geometry.dispose();
    state.drawing.preview.material.dispose();
  }
  const geometry = createStrokeGeometry(state.drawing.points, 0.055);
  state.drawing.preview = new THREE.Mesh(geometry, createMaterial(state.draft.color));
  state.drawing.preview.castShadow = true;
  scenes.workbench.scene.add(state.drawing.preview);
}

function paintSelected(color) {
  const item = state.gallery.find((entry) => entry.id === state.selectedId);
  if (!item) return;
  item.color = color;
  if (item.shape === "custom") {
    item.components = item.components.map((component) => ({ ...component, color }));
    item.rarity = getRarity(item);
  }
  updateGalleryModel();
  renderShelf();
  renderCollectionWall();
  updateCounters();
  saveGallery();
}

function cloneComponents(components = []) {
  return components.map((component) => ({
    ...component,
    position: [...component.position],
    rotation: [...component.rotation],
    scale: [...component.scale],
    points: component.points ? component.points.map((point) => [...point]) : undefined,
  }));
}

function updatePrintScene(delta) {
  const print = state.print;
  if (!print) {
    printerRig.gantry.position.x = Math.sin(performance.now() * 0.001) * 0.12;
    return;
  }

  print.elapsed += delta * state.speed;
  const progress = Math.min(1, print.elapsed / print.duration);
  ui.printStatus.textContent = `剩余 ${formatTime(Math.max(0, print.duration - print.elapsed))}`;
  ui.progressLabel.textContent = `${Math.round(progress * 100)}%`;
  ui.progressBar.style.width = `${progress * 100}%`;

  if (printModel) scenes.printer.scene.remove(printModel);
  printModel = createPrintLayers(print.spec, progress);
  printModel.position.y = 0.06;
  scenes.printer.scene.add(printModel);

  const path = performance.now() * 0.0045 * state.speed;
  printerRig.gantry.position.x = Math.sin(path) * 1.4;
  printerRig.gantry.position.z = Math.cos(path * 0.73) * 0.82;
  printerRig.gantry.position.y = 2.05 - progress * 0.92;

  if (progress >= 1) finishPrint();
}

function resizeViewer(viewer) {
  const rect = viewer.canvas.getBoundingClientRect();
  const width = Math.max(1, Math.floor(rect.width));
  const height = Math.max(1, Math.floor(rect.height));
  const needsResize = viewer.canvas.width !== width || viewer.canvas.height !== height;
  if (needsResize) {
    viewer.renderer.setSize(width, height, false);
    viewer.camera.aspect = width / height;
    viewer.camera.updateProjectionMatrix();
  }
}

function animate() {
  const delta = clock.getDelta();
  Object.values(scenes).forEach((viewer) => {
    resizeViewer(viewer);
    if (viewer.controls) viewer.controls.update();
  });

  if (workbenchModel && state.draft.shape !== "custom") workbenchModel.rotation.y += delta * 0.28;
  if (galleryModel && state.autoSpin) galleryModel.rotation.y += delta * 0.48;

  updatePrintScene(delta);
  scenes.workbench.renderer.render(scenes.workbench.scene, scenes.workbench.camera);
  scenes.printer.renderer.render(scenes.printer.scene, scenes.printer.camera);
  scenes.gallery.renderer.render(scenes.gallery.scene, scenes.gallery.camera);
  requestAnimationFrame(animate);
}

function bindEvents() {
  ui.shapeControls.addEventListener("click", (event) => {
    const button = event.target.closest("[data-shape]");
    if (!button) return;
    state.draft.shape = button.dataset.shape;
    ui.shapeControls.querySelectorAll("button").forEach((item) => item.classList.toggle("active", item === button));
    if (state.draft.shape === "custom" && !state.selectedComponentId && state.draft.components.length) {
      state.selectedComponentId = state.draft.components[0].id;
    }
    updateWorkbenchModel();
  });

  ui.colorControls.addEventListener("click", (event) => {
    const button = event.target.closest("[data-color]");
    if (!button) return;
    ui.colorControls.querySelectorAll("button").forEach((item) => item.classList.toggle("active", item === button));
    paintDraftColor(button.dataset.color, { resetTone: true });
    updateEstimate();
  });

  ui.customColorInput.addEventListener("input", () => {
    ui.colorControls.querySelectorAll("button").forEach((item) => item.classList.remove("active"));
    paintDraftColor(ui.customColorInput.value, { resetTone: true });
    updateEstimate();
  });

  ui.toneRange.addEventListener("input", () => {
    paintDraftColor(state.draft.baseColor);
    updateEstimate();
  });

  ui.applyAllColorBtn.addEventListener("click", applyColorToAllParts);

  ui.primitiveControls.addEventListener("click", (event) => {
    const button = event.target.closest("[data-primitive]");
    const presetButton = event.target.closest("[data-preset]");
    if (button) addPrimitive(button.dataset.primitive);
    if (presetButton && presetButton.dataset.preset === "spongeBuddy") addSpongeBuddyPreset();
  });

  ui.quickControls.addEventListener("click", (event) => {
    const button = event.target.closest("[data-quick]");
    if (!button) return;
    const action = button.dataset.quick;
    if (action === "surprise") generateSurpriseCustom();
    if (action === "duplicate") duplicateSelectedComponent();
    if (action === "mirror") mirrorSelectedComponent();
    if (action === "clear") clearCustomCanvas();
  });

  ui.nameInput.addEventListener("input", () => {
    ui.nameInput.value = ui.nameInput.value.slice(0, 18);
  });

  ui.randomNameBtn.addEventListener("click", prepareNextName);

  ui.toolControls.addEventListener("click", (event) => {
    const toolButton = event.target.closest("[data-tool]");
    const transformButton = event.target.closest("[data-transform]");
    if (toolButton) setEditorTool(toolButton.dataset.tool);
    if (transformButton) setTransformMode(transformButton.dataset.transform);
  });

  ui.deletePartBtn.addEventListener("click", deleteSelectedComponent);

  ui.selectedScaleRange.addEventListener("input", () => {
    setSelectedUniformScale(Number(ui.selectedScaleRange.value));
  });

  ui.dimensionSliders.forEach((input) => {
    input.addEventListener("input", () => {
      setComponentDimension(input.dataset.dimensionSlider, Number(input.value) / 100);
    });
  });

  ui.dimensionInputs.forEach((input) => {
    input.addEventListener("input", () => {
      setComponentDimension(input.dataset.dimension, Number(input.value));
    });
  });

  ui.positionInputs.forEach((input) => {
    input.addEventListener("input", () => {
      setComponentPosition(input.dataset.position, Number(input.value));
    });
  });

  scenes.workbench.canvas.addEventListener("pointerdown", (event) => {
    beginDraw(event);
    pickComponent(event);
  });
  scenes.workbench.canvas.addEventListener("pointermove", continueDraw);
  scenes.workbench.canvas.addEventListener("pointerup", finishDraw);
  scenes.workbench.canvas.addEventListener("pointercancel", finishDraw);

  ui.paintControls.addEventListener("click", (event) => {
    const button = event.target.closest("[data-paint]");
    if (!button) return;
    ui.paintControls.querySelectorAll("button").forEach((item) => item.classList.toggle("active", item === button));
    paintSelected(button.dataset.paint);
  });

  ui.sizeRange.addEventListener("input", () => {
    state.draft.size = Number(ui.sizeRange.value) / 100;
    ui.sizeLabel.textContent = `${ui.sizeRange.value}%`;
    updateWorkbenchModel();
  });

  ui.detailRange.addEventListener("input", () => {
    state.draft.detail = Number(ui.detailRange.value);
    ui.detailLabel.textContent = ui.detailRange.value;
    updateWorkbenchModel();
  });

  ui.startPrintBtn.addEventListener("click", startPrint);
  ui.harvestBtn.addEventListener("click", harvestPrint);

  ui.shelfList.addEventListener("click", (event) => {
    const favoriteButton = event.target.closest("[data-favorite-id]");
    if (favoriteButton) {
      toggleFavorite(favoriteButton.dataset.favoriteId);
      return;
    }
    const selectButton = event.target.closest("[data-select-id]");
    if (!selectButton) return;
    state.selectedId = selectButton.dataset.selectId;
    renderShelf();
    updateGalleryModel();
  });

  ui.collectionWall.addEventListener("click", (event) => {
    const card = event.target.closest("[data-collection-id]");
    if (!card) return;
    state.selectedId = card.dataset.collectionId;
    renderShelf();
    updateGalleryModel();
    document.querySelector("#gallery")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  ui.clearCollectionBtn.addEventListener("click", clearCollection);

  ui.speedBtn.addEventListener("click", () => {
    state.speed = state.speed === 1 ? 4 : 1;
    ui.speedBtn.textContent = state.speed === 1 ? "加速" : "正常";
  });

  ui.spinBtn.addEventListener("click", () => {
    state.autoSpin = !state.autoSpin;
    ui.spinBtn.textContent = state.autoSpin ? "自动旋转" : "手动查看";
  });

  window.addEventListener("keydown", handleWorkbenchKeyboard);
}

function handleWorkbenchKeyboard(event) {
  if (state.draft.shape !== "custom" || !selectedObject || state.editorTool === "draw") return;
  if (event.target instanceof HTMLInputElement) return;
  const step = event.shiftKey ? 0.2 : 0.08;
  const move = {
    KeyW: [0, 0, -step],
    KeyS: [0, 0, step],
    KeyA: [-step, 0, 0],
    KeyD: [step, 0, 0],
    KeyQ: [0, step, 0],
    KeyE: [0, -step, 0],
    ArrowUp: [0, 0, -step],
    ArrowDown: [0, 0, step],
    ArrowLeft: [-step, 0, 0],
    ArrowRight: [step, 0, 0],
  }[event.code];
  if (!move) return;
  event.preventDefault();
  selectedObject.position.x = THREE.MathUtils.clamp(selectedObject.position.x + move[0], -2.4, 2.4);
  selectedObject.position.y = THREE.MathUtils.clamp(selectedObject.position.y + move[1], 0, 2.5);
  selectedObject.position.z = THREE.MathUtils.clamp(selectedObject.position.z + move[2], -1.8, 1.8);
  applyMagneticSnap(selectedObject.position);
  updateAlignmentGuides(selectedObject.position);
  syncSelectedComponent();
  updateInspector();
}

function initSceneProps() {
  const workbenchGround = createBaseGround(5.8, 4.6, 0xded7c8);
  const galleryGround = createBaseGround(5.4, 4.2, 0xd9d1c2);
  scenes.workbench.scene.add(workbenchGround);
  scenes.gallery.scene.add(galleryGround);

  alignmentGuides = createAlignmentGuides();
  scenes.workbench.scene.add(alignmentGuides);

  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(1.08, 1.2, 0.22, 64), createMaterial(0xf4f0e8, 0.68));
  pedestal.position.y = 0.05;
  pedestal.receiveShadow = true;
  pedestal.castShadow = true;
  scenes.gallery.scene.add(pedestal);
}

bindEvents();
initSceneProps();
updateWorkbenchModel();
renderShelf();
renderCollectionWall();
updateGalleryModel();
updateCounters();
animate();
