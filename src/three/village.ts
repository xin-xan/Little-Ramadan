/**
 * The Ramadan Village as an interactive 3D island at night: gentle sea, palms, a fictional
 * village mosque, the five destinations, Noor and Amina, Hilmy in the sky and a string of
 * lanterns that light up as the child earns decorations. Built from code — no model files.
 * Not a depiction of any real island or mosque.
 */
import * as THREE from "three";
import { buildCharacter, type Model } from "./characters";

export type DestinationId = "house" | "garden" | "street" | "palace" | "square";

export interface VillageOptions {
  animate: boolean;
  lowPower: boolean;
  lanterns: number; // 0..12 lit
  flowers: number; // 0..10
  onSelect(id: DestinationId): void;
  /** Called every rendered frame with screen positions (px within the canvas) of each destination pin. */
  onPins(p: Record<DestinationId, { x: number; y: number; visible: boolean }>): void;
}

const std = (color: string, o: Partial<THREE.MeshStandardMaterialParameters> = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.75, ...o });

function add(parent: THREE.Object3D, geo: THREE.BufferGeometry, mat: THREE.Material, pos: [number, number, number], rot: [number, number, number] = [0, 0, 0], scale: [number, number, number] = [1, 1, 1]) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(...pos);
  m.rotation.set(...rot);
  m.scale.set(...scale);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

function gableRoof(w: number, d: number, h: number, mat: THREE.Material) {
  const s = new THREE.Shape();
  s.moveTo(-w / 2 - 0.12, 0);
  s.lineTo(0, h);
  s.lineTo(w / 2 + 0.12, 0);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: d + 0.24, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 2 });
  g.translate(0, 0, -(d + 0.24) / 2);
  const m = new THREE.Mesh(g, mat);
  m.castShadow = true;
  return m;
}

function arch(w: number, h: number, mat: THREE.Material) {
  const s = new THREE.Shape();
  s.moveTo(-w / 2, 0);
  s.lineTo(-w / 2, h - w / 2);
  s.absarc(0, h - w / 2, w / 2, Math.PI, 0, true);
  s.lineTo(w / 2, 0);
  s.closePath();
  return new THREE.Mesh(new THREE.ShapeGeometry(s, 16), mat);
}

function house(color: string, roof: string, w = 1.8, h = 1.2, d = 1.6) {
  const g = new THREE.Group();
  add(g, new THREE.BoxGeometry(w, h, d), std(color), [0, h / 2, 0]);
  const r = gableRoof(w, d, 0.75, std(roof, { roughness: 0.6 }));
  r.position.y = h;
  g.add(r);
  const door = arch(0.42, 0.75, std("#7b4b2e"));
  door.position.set(0, 0.01, d / 2 + 0.01);
  g.add(door);
  const lit = std("#ffd27a", { emissive: new THREE.Color("#ffb648"), emissiveIntensity: 1.4 });
  for (const x of [-w / 3.2, w / 3.2]) {
    const win = arch(0.3, 0.42, lit);
    win.position.set(x, h * 0.42, d / 2 + 0.01);
    g.add(win);
  }
  return g;
}

function palm(scale = 1) {
  const g = new THREE.Group();
  const trunkMat = std("#8a5a3b", { roughness: 0.9 });
  let y = 0;
  for (let i = 0; i < 7; i++) {
    const seg = add(g, new THREE.CylinderGeometry(0.11 - i * 0.008, 0.13 - i * 0.008, 0.42, 8), trunkMat, [Math.sin(i * 0.35) * 0.18 * i * 0.25, y + 0.21, 0]);
    seg.rotation.z = -0.06 * i;
    y += 0.38;
  }
  const top = new THREE.Vector3(0.45, y, 0);
  const leafMat = std("#3e9b74", { side: THREE.DoubleSide, roughness: 0.6 });
  for (let i = 0; i < 7; i++) {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.quadraticCurveTo(0.6, 0.18, 1.4, -0.25);
    s.quadraticCurveTo(0.6, -0.05, 0, 0);
    const leaf = new THREE.Mesh(new THREE.ShapeGeometry(s, 10), leafMat);
    leaf.position.copy(top);
    leaf.rotation.set(-Math.PI / 2 + 0.5, (i / 7) * Math.PI * 2, 0, "YXZ");
    leaf.castShadow = true;
    g.add(leaf);
  }
  add(g, new THREE.SphereGeometry(0.12, 10, 8), std("#6b4a2a"), [top.x, top.y - 0.08, 0.05]);
  g.scale.setScalar(scale);
  return g;
}

function glowSprite(color = "rgba(255,210,122,", size = 1) {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const x = c.getContext("2d")!;
  const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, `${color}0.9)`);
  gr.addColorStop(0.4, `${color}0.35)`);
  gr.addColorStop(1, `${color}0)`);
  x.fillStyle = gr;
  x.fillRect(0, 0, 64, 64);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  sp.scale.setScalar(size);
  return sp;
}

function skyTexture() {
  const c = document.createElement("canvas");
  c.width = 4;
  c.height = 256;
  const g = c.getContext("2d")!;
  const gr = g.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, "#0e1636");
  gr.addColorStop(0.55, "#253a78");
  gr.addColorStop(1, "#5a5f9c");
  g.fillStyle = gr;
  g.fillRect(0, 0, 4, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export interface VillageHandle {
  setProgress(lanterns: number, flowers: number): void;
  setAnimate(on: boolean): void;
  dispose(): void;
}

export function mountVillage(canvas: HTMLCanvasElement, opts: VillageOptions): VillageHandle | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: !opts.lowPower, alpha: false, powerPreference: "default" });
  } catch {
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.lowPower ? 1 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = !opts.lowPower;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = skyTexture();
  scene.fog = new THREE.Fog("#2c3d74", 34, 70);

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 120);
  const lookAt = new THREE.Vector3(0, 1.2, 0.6);

  // lights
  scene.add(new THREE.HemisphereLight("#8fa6e6", "#4a3a24", 1.25));
  const moon = new THREE.DirectionalLight("#c9d8ff", 1.6);
  moon.position.set(-7, 12, -3);
  moon.castShadow = true;
  moon.shadow.mapSize.set(1024, 1024);
  moon.shadow.camera.left = -10;
  moon.shadow.camera.right = 10;
  moon.shadow.camera.top = 10;
  moon.shadow.camera.bottom = -10;
  moon.shadow.bias = -0.0008;
  scene.add(moon);
  const warm1 = new THREE.PointLight("#ffb860", 18, 9, 1.6);
  warm1.position.set(-2.5, 2.4, 3);
  const warm2 = new THREE.PointLight("#ffb860", 18, 9, 1.6);
  warm2.position.set(2.5, 2.4, 3);
  scene.add(warm1, warm2);

  // stars
  const starGeo = new THREE.BufferGeometry();
  const sp: number[] = [];
  for (let i = 0; i < 260; i++) {
    const a = Math.random() * Math.PI * 2;
    const e = 0.15 + Math.random() * 1.2;
    const r = 40;
    sp.push(Math.cos(a) * Math.cos(e) * r, Math.sin(e) * r + 2, Math.sin(a) * Math.cos(e) * r - 10);
  }
  starGeo.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3));
  const starMat = new THREE.PointsMaterial({ color: "#fff6dc", size: 0.22, sizeAttenuation: true, transparent: true, opacity: 0.9, fog: false });
  scene.add(new THREE.Points(starGeo, starMat));

  // sea with gentle waves
  const seaGeo = new THREE.PlaneGeometry(90, 90, opts.lowPower ? 24 : 44, opts.lowPower ? 24 : 44);
  seaGeo.rotateX(-Math.PI / 2);
  const seaBase = Float32Array.from(seaGeo.attributes.position.array as Float32Array);
  const sea = new THREE.Mesh(seaGeo, new THREE.MeshStandardMaterial({ color: "#1f6d93", roughness: 0.25, metalness: 0.1, flatShading: true }));
  sea.position.y = -0.15;
  sea.receiveShadow = true;
  scene.add(sea);

  // island
  const island = new THREE.Group();
  scene.add(island);
  const sandMat = std("#f1d9a4", { roughness: 0.95 });
  add(island, new THREE.CylinderGeometry(8.2, 9.2, 0.9, 64), sandMat, [0, -0.35, 0.4]);
  add(island, new THREE.CylinderGeometry(9.5, 10.5, 0.2, 64), std("#e8cc8f", { transparent: true, opacity: 0.85 }), [0, -0.12, 0.4]);
  const path = add(island, new THREE.CircleGeometry(1, 48), std("#fbe9c2", { roughness: 1 }), [0, 0.111, 1.6], [-Math.PI / 2, 0, 0], [5.2, 2.6, 1]);
  path.castShadow = false;
  const grass = std("#5aa66f");
  for (const [x, z, s] of [
    [-6, -2, 1.4],
    [6.2, -1.6, 1.2],
    [-5.6, 4, 0.9],
    [5.8, 4.2, 1],
    [0, -5.2, 1.6],
  ] as const)
    add(island, new THREE.SphereGeometry(1, 20, 12), grass, [x, 0, z], [0, 0, 0], [s * 1.6, 0.35, s]);

  // mosque landmark (fictional)
  const mosque = new THREE.Group();
  mosque.position.set(0, 0.1, -3.4);
  island.add(mosque);
  const cream = std("#fff3dc", { roughness: 0.8 });
  const teal = std("#2a7a69", { roughness: 0.45, metalness: 0.1 });
  const gold = std("#e9c66b", { roughness: 0.3, metalness: 0.6 });
  add(mosque, new THREE.BoxGeometry(3.6, 1.7, 2.4), cream, [0, 0.85, 0]);
  add(mosque, new THREE.CylinderGeometry(1.05, 1.1, 0.4, 32), cream, [0, 1.9, 0]);
  add(mosque, new THREE.SphereGeometry(1.05, 40, 24, 0, Math.PI * 2, 0, Math.PI / 2), teal, [0, 2.1, 0], [0, 0, 0], [1, 1.15, 1]);
  add(mosque, new THREE.SphereGeometry(0.1, 12, 10), gold, [0, 3.35, 0]);
  add(mosque, new THREE.CylinderGeometry(0.02, 0.02, 0.3, 6), gold, [0, 3.5, 0]);
  add(mosque, new THREE.CylinderGeometry(0.3, 0.34, 4, 24), cream, [-2.3, 2, -0.4]);
  add(mosque, new THREE.TorusGeometry(0.4, 0.07, 8, 24), gold, [-2.3, 3.2, -0.4], [Math.PI / 2, 0, 0]);
  add(mosque, new THREE.ConeGeometry(0.36, 0.9, 24), teal, [-2.3, 4.45, -0.4]);
  add(mosque, new THREE.SphereGeometry(0.07, 10, 8), gold, [-2.3, 4.95, -0.4]);
  const doorMat = std("#1a5246");
  const mDoor = arch(0.8, 1.25, doorMat);
  mDoor.position.set(0, 0.01, 1.21);
  mosque.add(mDoor);
  const winMat = std("#ffd27a", { emissive: new THREE.Color("#ffb648"), emissiveIntensity: 1.2 });
  for (const x of [-1.2, 1.2]) {
    const w = arch(0.45, 0.8, winMat);
    w.position.set(x, 0.55, 1.21);
    mosque.add(w);
  }
  const mosqueGlow = glowSprite("rgba(255,214,140,", 6);
  mosqueGlow.position.set(0, 1.4, 1.4);
  mosque.add(mosqueGlow);

  // destinations
  const dests: Record<DestinationId, THREE.Group> = {
    house: new THREE.Group(),
    garden: new THREE.Group(),
    street: new THREE.Group(),
    palace: new THREE.Group(),
    square: new THREE.Group(),
  };
  const pinOffset: Record<DestinationId, number> = { house: 2.2, garden: 1.3, street: 2.4, palace: 2.2, square: 2.7 };
  dests.house.position.set(-5, 0.1, -0.3);
  dests.house.rotation.y = 0.45;
  dests.house.add(house("#fff1d6", "#2a7a69"));
  dests.garden.position.set(0, 0.1, 0.9);
  dests.street.position.set(5, 0.1, -0.3);
  dests.street.rotation.y = -0.45;
  const h1 = house("#f6c9d5", "#c2577e", 1.3, 1.1, 1.3);
  h1.position.x = -0.75;
  const h2 = house("#cfe6f5", "#2f6fa8", 1.3, 1.5, 1.3);
  h2.position.x = 0.75;
  dests.street.add(h1, h2);
  dests.palace.position.set(-3.3, 0.1, 4.3);
  dests.palace.scale.setScalar(0.85);
  dests.palace.rotation.y = 0.3;
  const lav = std("#ded3f5");
  const purple = std("#7a5fb5", { roughness: 0.4 });
  add(dests.palace, new THREE.BoxGeometry(1.8, 1.2, 1.2), lav, [0, 0.6, 0]);
  for (const x of [-1.05, 1.05]) {
    add(dests.palace, new THREE.CylinderGeometry(0.32, 0.34, 1.9, 20), lav, [x, 0.95, 0]);
    add(dests.palace, new THREE.SphereGeometry(0.36, 20, 14), purple, [x, 1.95, 0], [0, 0, 0], [1, 1.25, 1]);
  }
  add(dests.palace, new THREE.SphereGeometry(0.55, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), purple, [0, 1.2, 0]);
  const pDoor = arch(0.5, 0.8, purple);
  pDoor.position.set(0, 0.01, 0.61);
  dests.palace.add(pDoor);
  dests.square.position.set(3.3, 0.1, 4.3);
  add(dests.square, new THREE.CylinderGeometry(1.25, 1.35, 0.14, 40), std("#e9c66b", { roughness: 0.5, metalness: 0.2 }), [0, 0.07, 0]);
  add(dests.square, new THREE.CylinderGeometry(0.05, 0.05, 2.1, 8), std("#8a5a3b"), [0, 1.1, 0]);
  const balloonCols = ["#e2725b", "#2f8f6a", "#e9c66b", "#7a5fb5"];
  balloonCols.forEach((c, i) => add(dests.square, new THREE.SphereGeometry(0.22, 16, 12), std(c, { roughness: 0.3 }), [Math.cos(i * 1.6) * 0.35, 2.2 + (i % 2) * 0.25, Math.sin(i * 1.6) * 0.35], [0, 0, 0], [1, 1.2, 1]));
  // bunting around the square
  const bunt = new THREE.Group();
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const f = add(bunt, new THREE.ConeGeometry(0.12, 0.26, 3), std(balloonCols[i % 4]), [Math.cos(a) * 1.15, 1.45 - Math.abs(Math.sin(a * 2)) * 0.15, Math.sin(a) * 1.15], [Math.PI, a, 0]);
    f.castShadow = false;
  }
  dests.square.add(bunt);
  // knowledge garden: hedge arch, flowering bushes, an open book on a stand
  const hedge = std("#3e8e5a");
  const gArch = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.16, 12, 32, Math.PI), hedge);
  gArch.position.set(0, 0, 0);
  gArch.castShadow = true;
  dests.garden.add(gArch);
  for (const x of [-1.1, 1.1]) add(dests.garden, new THREE.SphereGeometry(0.45, 18, 12), hedge, [x, 0.3, 0.1], [0, 0, 0], [1, 0.8, 1]);
  add(dests.garden, new THREE.CylinderGeometry(0.05, 0.08, 0.5, 8), std("#8a5a3b"), [0, 0.25, 0.7]);
  add(dests.garden, new THREE.BoxGeometry(0.55, 0.05, 0.38), std("#fffaf0"), [0, 0.52, 0.7], [-0.5, 0, 0]);
  Object.values(dests).forEach((g) => island.add(g));

  // flowers (kindness)
  const flowerGroup = new THREE.Group();
  island.add(flowerGroup);
  const petalCols = ["#f28ca8", "#e2725b", "#f6d36b", "#ffffff"];
  for (let i = 0; i < 10; i++) {
    const f = new THREE.Group();
    const a = -0.9 + (i / 9) * 1.8;
    f.position.set(Math.sin(a) * 3.2, 0.12, 2.6 + Math.cos(a) * 0.9);
    add(f, new THREE.CylinderGeometry(0.02, 0.02, 0.3, 5), std("#3e8e5a"), [0, 0.15, 0]);
    add(f, new THREE.SphereGeometry(0.11, 10, 8), std(petalCols[i % 4], { roughness: 0.5 }), [0, 0.32, 0], [0, 0, 0], [1, 0.6, 1]);
    add(f, new THREE.SphereGeometry(0.045, 8, 6), std("#e9b93c"), [0, 0.36, 0]);
    f.visible = false;
    flowerGroup.add(f);
  }

  // palms
  for (const [x, z, s, r] of [
    [-7, -0.6, 1.1, 0.2],
    [-6.4, 2.6, 0.9, 1.2],
    [6.9, -0.4, 1.05, 2.4],
    [6.3, 2.9, 0.85, 3.6],
    [-3.6, -4.6, 1.2, 0.9],
    [3.8, -4.4, 1.15, 4.4],
    [0, 6.6, 0.8, 1.8],
  ] as const) {
    const p = palm(s);
    p.position.set(x, 0.1, z);
    p.rotation.y = r;
    island.add(p);
  }

  // lantern string across the front
  const lanternGroup = new THREE.Group();
  island.add(lanternGroup);
  for (const x of [-5.4, 5.4]) add(island, new THREE.CylinderGeometry(0.06, 0.07, 2.8, 8), std("#8a5a3b"), [x, 1.4, 2.4]);
  const ropePts: THREE.Vector3[] = [];
  for (let i = 0; i <= 24; i++) {
    const x = -5.4 + (i / 24) * 10.8;
    ropePts.push(new THREE.Vector3(x, 2.75 - Math.sin((i / 24) * Math.PI) * 0.7, 2.4));
  }
  const rope = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ropePts), 48, 0.018, 6), std("#5b3a22"));
  island.add(rope);
  const lanternMeshes: { body: THREE.MeshStandardMaterial; glow: THREE.Sprite; g: THREE.Group }[] = [];
  for (let i = 0; i < 12; i++) {
    const tt = (i + 0.5) / 12;
    const x = -5.4 + tt * 10.8;
    const y = 2.75 - Math.sin(tt * Math.PI) * 0.7;
    const g = new THREE.Group();
    g.position.set(x, y, 2.4);
    const body = new THREE.MeshStandardMaterial({ color: "#7d8799", roughness: 0.5, emissive: new THREE.Color("#ffb648"), emissiveIntensity: 0 });
    add(g, new THREE.CylinderGeometry(0.03, 0.03, 0.12, 6), std("#c99a2e", { metalness: 0.6, roughness: 0.3 }), [0, -0.06, 0]);
    add(g, new THREE.SphereGeometry(0.16, 16, 12), body, [0, -0.3, 0], [0, 0, 0], [1, 1.35, 1]);
    add(g, new THREE.ConeGeometry(0.12, 0.12, 12), std("#c99a2e", { metalness: 0.6, roughness: 0.3 }), [0, -0.1, 0]);
    const glow = glowSprite("rgba(255,196,110,", 1.3);
    glow.position.y = -0.3;
    glow.visible = false;
    g.add(glow);
    lanternGroup.add(g);
    lanternMeshes.push({ body, glow, g });
  }

  // characters
  const chars: { m: Model; o: THREE.Object3D }[] = [];
  const placeChar = (id: "noor" | "amina" | "hilmy", pos: [number, number, number], scale: number, rotY: number, pose: "wave" | "happy" | "cheer") => {
    const m = buildCharacter(id);
    m.setPose(pose);
    m.root.position.set(...pos);
    m.root.scale.setScalar(scale);
    m.root.rotation.y = rotY;
    m.root.traverse((o) => ((o as THREE.Mesh).castShadow = true));
    scene.add(m.root);
    chars.push({ m, o: m.root });
  };
  placeChar("noor", [-2.2, 0.1, 1.9], 0.6, 0.35, "wave");
  placeChar("amina", [1.6, 0.1, 2.1], 0.6, -0.3, "happy");
  placeChar("hilmy", [5.2, 4.6, -9], 1.5, -0.2, "happy");
  // The moon should glow in the night sky rather than be lit like the ground.
  chars[chars.length - 1].o.traverse((o) => {
    const m = (o as THREE.Mesh).material as THREE.MeshPhysicalMaterial | undefined;
    if (m && "emissive" in m && m.color.getHexString() === "f5d06a") {
      m.emissive = new THREE.Color("#f5c95a");
      m.emissiveIntensity = 0.75;
      m.fog = false;
    }
  });

  // ---------- state ----------
  const setProgress = (lanterns: number, flowers: number) => {
    lanternMeshes.forEach((l, i) => {
      const lit = i < lanterns;
      l.body.color.set(lit ? "#f6c35c" : "#7d8799");
      l.body.emissiveIntensity = lit ? 1.1 : 0;
      l.glow.visible = lit;
    });
    flowerGroup.children.forEach((f, i) => (f.visible = i < flowers));
    dirty = true;
  };

  // ---------- interaction ----------
  let azimuth = 0;
  let dragging = false;
  let dragStartX = 0;
  let dragAz = 0;
  let moved = false;
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const onDown = (e: PointerEvent) => {
    dragging = true;
    moved = false;
    dragStartX = e.clientX;
    dragAz = azimuth;
  };
  const onMove = (e: PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - dragStartX;
    if (Math.abs(dx) > 6) moved = true;
    azimuth = Math.max(-0.45, Math.min(0.45, dragAz - dx * 0.004));
    dirty = true;
    kick();
  };
  const onUp = (e: PointerEvent) => {
    if (!dragging) return; // only taps that started on the 3D scene (not on a pin or elsewhere)
    dragging = false;
    if (moved) return;
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hits = ray.intersectObjects(Object.values(dests), true);
    if (!hits.length) return;
    let o: THREE.Object3D | null = hits[0].object;
    while (o) {
      const id = (Object.keys(dests) as DestinationId[]).find((k) => dests[k] === o);
      if (id) return opts.onSelect(id);
      o = o.parent;
    }
  };
  canvas.addEventListener("pointerdown", onDown);
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);

  // ---------- loop ----------
  let animate = opts.animate && !opts.lowPower;
  let dirty = true;
  let raf = 0;
  let t = 0;
  let last = performance.now();
  let visible = true;
  let frameNo = 0;
  let camKey = "";
  const anchor = new THREE.Vector3();

  const resize = () => {
    camKey = "";
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = 38;
    camera.updateProjectionMatrix();
    dirty = true;
  };
  const ro = new ResizeObserver(() => {
    resize();
    kick();
  });
  ro.observe(canvas);
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) kick();
  });
  io.observe(canvas);

  function frame(now: number) {
    raf = 0;
    if (animate && !dragging && !dirty && now - last < 1000 / 30 - 2) {
      raf = requestAnimationFrame(frame);
      return;
    }
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    if (animate) t += dt;
    // Camera moves only when the child drags, so the tap targets (pins) stay still.
    const az = azimuth;
    const narrow = camera.aspect < 1.3;
    const dist = narrow ? 22 : 19;
    camera.position.set(Math.sin(az) * dist, narrow ? 9.5 : 8, Math.cos(az) * dist + 0.9);
    camera.lookAt(lookAt);
    if (animate) {
      const pos = seaGeo.attributes.position as THREE.BufferAttribute;
      const arr = pos.array as Float32Array;
      for (let i = 0; i < arr.length; i += 3) {
        const x = seaBase[i];
        const z = seaBase[i + 2];
        arr[i + 1] = Math.sin(x * 0.35 + t * 1.1) * 0.12 + Math.cos(z * 0.4 + t * 0.8) * 0.1;
      }
      pos.needsUpdate = true;
      if (++frameNo % 3 === 0) seaGeo.computeVertexNormals();
      lanternMeshes.forEach((l, i) => {
        l.g.rotation.z = Math.sin(t * 1.4 + i) * 0.08;
        if (l.glow.visible) l.glow.material.opacity = 0.75 + Math.sin(t * 3 + i * 1.7) * 0.25;
      });
      starMat.opacity = 0.75 + Math.sin(t * 1.5) * 0.15;
      bunt.rotation.y = Math.sin(t * 0.5) * 0.05;
    }
    chars.forEach((c) => c.m.update(t, animate ? dt : 0.016));
    renderer.render(scene, camera);
    // pins: only re-project when the view changed (drag, resize, first frame)
    if (camKey !== `${az}|${canvas.clientWidth}|${canvas.clientHeight}`) {
    camKey = `${az}|${canvas.clientWidth}|${canvas.clientHeight}`;
    const pins = {} as Record<DestinationId, { x: number; y: number; visible: boolean }>;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    (Object.keys(dests) as DestinationId[]).forEach((id) => {
      dests[id].getWorldPosition(anchor);
      anchor.y += pinOffset[id];
      anchor.project(camera);
      pins[id] = { x: ((anchor.x + 1) / 2) * w, y: ((1 - anchor.y) / 2) * h, visible: anchor.z < 1 };
    });
    opts.onPins(pins);
    }
    dirty = false;
    if (visible && document.visibilityState === "visible" && (animate || dirty || dragging)) raf = requestAnimationFrame(frame);
  }
  function kick() {
    if (!raf) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  }
  const onVis = () => kick();
  document.addEventListener("visibilitychange", onVis);
  resize();
  setProgress(opts.lanterns, opts.flowers);
  kick();

  return {
    setProgress(l, f) {
      setProgress(l, f);
      kick();
    },
    setAnimate(on) {
      animate = on && !opts.lowPower;
      kick();
    },
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else mat?.dispose();
      });
      renderer.dispose();
    },
  };
}
