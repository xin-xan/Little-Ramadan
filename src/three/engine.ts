/**
 * One shared WebGL renderer draws every character on the page into its own 2D canvas.
 * This keeps the app to a single GPU context (phones limit how many they allow), renders
 * only characters that are on screen, pauses when the app is hidden, caps the frame rate,
 * and renders a single still frame when motion is reduced.
 */
import * as THREE from "three";
import { addStudioLights, buildCharacter, type CharacterId, type Model, type Pose } from "./characters";

let renderer: THREE.WebGLRenderer | null = null;
let failed = false;

export function webglAvailable(): boolean {
  if (failed) return false;
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

function getRenderer() {
  if (renderer || failed) return renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    renderer.setPixelRatio(1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.addEventListener("webglcontextlost", (e) => {
      e.preventDefault();
      failed = true;
    });
  } catch {
    failed = true;
  }
  return renderer;
}

interface Instance {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  model: Model;
  visible: boolean;
  animate: boolean;
  dirty: boolean;
  t: number;
}

const instances = new Set<Instance>();
let raf = 0;
let last = 0;
const FRAME = 1000 / 30;

let bufW = 0;
let bufH = 0;

function draw(inst: Instance) {
  const r = getRenderer();
  if (!r) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.max(1, Math.round(inst.canvas.clientWidth * dpr));
  const h = Math.max(1, Math.round(inst.canvas.clientHeight * dpr));
  if (inst.canvas.width !== w || inst.canvas.height !== h) {
    inst.canvas.width = w;
    inst.canvas.height = h;
    inst.camera.aspect = w / h;
    inst.camera.updateProjectionMatrix();
  }
  // Grow the shared drawing buffer only when needed, then render into a viewport of it.
  // (Resizing the buffer for every character every frame is very expensive.)
  if (w > bufW || h > bufH) {
    bufW = Math.max(bufW, w);
    bufH = Math.max(bufH, h);
    r.setSize(bufW, bufH, false);
  }
  r.setViewport(0, 0, w, h);
  r.setScissor(0, 0, w, h);
  r.setScissorTest(true);
  r.clear();
  r.render(inst.scene, inst.camera);
  inst.ctx.clearRect(0, 0, w, h);
  // WebGL's viewport origin is bottom-left; the 2D source rect is measured from the top.
  inst.ctx.drawImage(r.domElement, 0, bufH - h, w, h, 0, 0, w, h);
}

function loop(now: number) {
  raf = 0;
  const dt = Math.min(0.1, (now - last) / 1000);
  if (now - last >= FRAME - 2) {
    last = now;
    for (const inst of instances) {
      if (!inst.visible) continue;
      if (inst.animate) {
        inst.t += dt;
        inst.model.update(inst.t, dt);
        draw(inst);
      } else if (inst.dirty) {
        inst.model.update(inst.t, 0.016);
        draw(inst);
        inst.dirty = false;
      }
    }
  }
  if ([...instances].some((i) => i.visible && (i.animate || i.dirty)) && document.visibilityState === "visible") raf = requestAnimationFrame(loop);
}

function kick() {
  if (!raf) {
    last = performance.now() - FRAME;
    raf = requestAnimationFrame(loop);
  }
}

if (typeof document !== "undefined") document.addEventListener("visibilitychange", kick);

export interface CharacterHandle {
  setPose(p: Pose): void;
  setAnimate(on: boolean): void;
  poke(): void;
  dispose(): void;
}

/** Mounts a 3D character into a 2D canvas. Returns null if WebGL is unavailable. */
export function mountCharacter(canvas: HTMLCanvasElement, id: CharacterId, pose: Pose, animate: boolean): CharacterHandle | null {
  if (!getRenderer()) return null;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const scene = new THREE.Scene();
  addStudioLights(scene);
  const model = buildCharacter(id);
  model.setPose(pose);
  scene.add(model.root);
  const camera = new THREE.PerspectiveCamera(id === "hilmy" ? 32 : 28, 1, 0.1, 50);
  if (id === "hilmy") {
    camera.position.set(0, 1.42, 5.2);
    camera.lookAt(0, 1.4, 0);
  } else {
    camera.position.set(0, 1.6, 6.1);
    camera.lookAt(0, 1.3, 0);
  }
  const inst: Instance = { canvas, ctx, scene, camera, model, visible: true, animate, dirty: true, t: Math.random() * 10 };
  instances.add(inst);
  const io = new IntersectionObserver(([e]) => {
    inst.visible = e.isIntersecting;
    if (inst.visible) kick();
  });
  io.observe(canvas);
  kick();
  return {
    setPose(p) {
      model.setPose(p);
      inst.dirty = true;
      kick();
    },
    setAnimate(on) {
      inst.animate = on;
      inst.dirty = true;
      kick();
    },
    poke() {
      model.poke();
      // A tap always plays the short hop, even with reduced motion off-loop: animate briefly.
      if (!inst.animate) {
        inst.animate = true;
        kick();
        setTimeout(() => {
          inst.animate = false;
          inst.dirty = true;
          kick();
        }, 900);
      }
    },
    dispose() {
      io.disconnect();
      instances.delete(inst);
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else mat?.dispose();
      });
    },
  };
}
