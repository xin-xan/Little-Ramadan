/**
 * Noor, Amina and Hilmy as real-time 3D models, built from geometry in code (no model
 * files to download, original artwork, fully offline). Soft "clay" materials and
 * hand-tuned animation give the cute 3D-cartoon look from the character guide
 * (docs/phase-0/03-character-guide.md). Palette is fixed here for consistency.
 */
import * as THREE from "three";

export type CharacterId = "noor" | "amina" | "hilmy";
export type Pose = "happy" | "wave" | "think" | "cheer" | "calm" | "talk";

export const COLORS = {
  noor: { skin: "#C98E62", hair: "#3A2618", outfit: "#2E8B6E", trim: "#E9C66B", trousers: "#FFF3DE", cap: "#FFFFFF" },
  amina: { skin: "#D9A27A", outfit: "#B9A6E3", hijab: "#F3C6D3", sleeves: "#FFF3DE", trousers: "#FFF3DE" },
  hilmy: { moon: "#F5D06A", glow: "#FFE9A8" },
  face: { eye: "#21140E", cheek: "#F08A7E", mouth: "#8A3B2B", white: "#FFFFFF" },
};

const clay = (color: string, opts: Partial<THREE.MeshPhysicalMaterialParameters> = {}) =>
  new THREE.MeshPhysicalMaterial({ color, roughness: 0.62, metalness: 0, sheen: 0.4, sheenRoughness: 0.8, sheenColor: new THREE.Color("#ffffff"), ...opts });

const gloss = (color: string) => new THREE.MeshPhysicalMaterial({ color, roughness: 0.15, clearcoat: 1, clearcoatRoughness: 0.1 });

function mesh(geo: THREE.BufferGeometry, mat: THREE.Material, pos: [number, number, number] = [0, 0, 0], scale: [number, number, number] = [1, 1, 1]) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(...pos);
  m.scale.set(...scale);
  return m;
}

/** Soft round contact shadow under the feet (cheap alternative to real shadows). */
function contactShadow(radius = 0.9) {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(18,40,35,0.35)");
  grad.addColorStop(1, "rgba(18,40,35,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(radius * 2, radius * 2), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2;
  m.position.y = 0.005;
  return m;
}

// ---------- face ----------

interface Face {
  group: THREE.Group;
  setEyes(open: number, happy: boolean): void;
  setMouth(kind: "smile" | "open" | "o" | "talk", amount?: number): void;
}

function buildFace(scale = 1, eyeSpread = 0.22): Face {
  const group = new THREE.Group();
  const eyeMat = gloss(COLORS.face.eye);
  const white = new THREE.MeshBasicMaterial({ color: COLORS.face.white });
  const eyes: THREE.Group[] = [];
  const happyEyes: THREE.Mesh[] = [];
  for (const sx of [-1, 1]) {
    const eye = new THREE.Group();
    eye.position.set(sx * eyeSpread * scale, 0.02 * scale, 0.56 * scale);
    const ball = mesh(new THREE.SphereGeometry(0.1 * scale, 24, 16), eyeMat, [0, 0, 0], [0.85, 1.15, 0.55]);
    const hl1 = mesh(new THREE.SphereGeometry(0.032 * scale, 12, 8), white, [0.03 * scale, 0.045 * scale, 0.05 * scale]);
    const hl2 = mesh(new THREE.SphereGeometry(0.015 * scale, 8, 6), white, [-0.03 * scale, -0.04 * scale, 0.05 * scale]);
    eye.add(ball, hl1, hl2);
    group.add(eye);
    eyes.push(eye);
    const arc = mesh(new THREE.TorusGeometry(0.075 * scale, 0.022 * scale, 8, 20, Math.PI), eyeMat, [sx * eyeSpread * scale, 0.0, 0.58 * scale]);
    arc.visible = false;
    group.add(arc);
    happyEyes.push(arc);
    const cheek = mesh(new THREE.SphereGeometry(0.09 * scale, 16, 12), new THREE.MeshBasicMaterial({ color: COLORS.face.cheek, transparent: true, opacity: 0.45 }), [sx * 0.36 * scale, -0.14 * scale, 0.47 * scale], [1, 0.6, 0.3]);
    group.add(cheek);
  }

  const mouthMat = new THREE.MeshStandardMaterial({ color: COLORS.face.mouth, roughness: 0.5 });
  const smileCurve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(-0.1, 0, 0), new THREE.Vector3(0, -0.085, 0.02), new THREE.Vector3(0.1, 0, 0));
  const smile = mesh(new THREE.TubeGeometry(smileCurve, 16, 0.02, 8, false), mouthMat, [0, -0.2 * scale, 0.57 * scale], [scale, scale, scale]);
  const openShape = new THREE.Shape();
  openShape.moveTo(-0.1, 0);
  openShape.quadraticCurveTo(0, -0.17, 0.1, 0);
  openShape.closePath();
  const open = mesh(new THREE.ShapeGeometry(openShape, 12), new THREE.MeshBasicMaterial({ color: "#7A2E22", side: THREE.DoubleSide }), [0, -0.19 * scale, 0.585 * scale], [scale, scale, scale]);
  const tongue = mesh(new THREE.CircleGeometry(0.045, 16), new THREE.MeshBasicMaterial({ color: "#E8857A" }), [0, -0.1, 0.002]);
  open.add(tongue);
  const o = mesh(new THREE.TorusGeometry(0.035, 0.016, 8, 16), mouthMat, [0.02 * scale, -0.21 * scale, 0.575 * scale], [scale, scale * 1.2, scale]);
  group.add(smile, open, o);

  return {
    group,
    setEyes(openAmt, happy) {
      eyes.forEach((e) => {
        e.visible = !happy;
        e.scale.y = Math.max(0.08, openAmt);
      });
      happyEyes.forEach((h) => (h.visible = happy));
    },
    setMouth(kind, amount = 1) {
      smile.visible = kind === "smile";
      open.visible = kind === "open" || kind === "talk";
      o.visible = kind === "o";
      if (kind === "talk") open.scale.set(scale, scale * (0.35 + 0.65 * amount), scale);
      else open.scale.set(scale, scale, scale);
    },
  };
}

// ---------- kids ----------

export interface Model {
  root: THREE.Group;
  /** Advance the animation. t = seconds since start. */
  update(t: number, dt: number): void;
  setPose(p: Pose): void;
  /** A tap: a little hop and giggle. */
  poke(): void;
}

function robeGeometry(bottom: number, top: number, height: number, flare = 0.08) {
  const pts: THREE.Vector2[] = [];
  const n = 14;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const y = t * height;
    const r = bottom + (top - bottom) * Math.pow(t, 0.9) + flare * Math.sin(Math.PI * (1 - t)) * (1 - t);
    pts.push(new THREE.Vector2(r, y));
  }
  pts.push(new THREE.Vector2(top * 0.55, height + 0.06));
  pts.push(new THREE.Vector2(0.001, height + 0.08));
  pts.unshift(new THREE.Vector2(0.001, -0.02));
  return new THREE.LatheGeometry(pts, 48);
}

function buildArm(sleeve: THREE.Material, skin: THREE.Material, side: -1 | 1) {
  const pivot = new THREE.Group();
  const arm = mesh(new THREE.CapsuleGeometry(0.11, 0.34, 6, 12), sleeve, [0, -0.25, 0]);
  const hand = mesh(new THREE.SphereGeometry(0.125, 16, 12), skin, [0, -0.5, 0.02]);
  pivot.add(arm, hand);
  pivot.position.set(side * 0.44, 1.12, 0);
  pivot.rotation.z = side * 0.32;
  return pivot;
}

function buildKid(who: "noor" | "amina"): Model {
  const c = who === "noor" ? COLORS.noor : COLORS.amina;
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(contactShadow(0.85), body);

  const skin = clay(c.skin, { roughness: 0.55, sheen: 0.2 });
  const outfit = clay(c.outfit);
  const trousers = clay(c.trousers);

  // legs + shoes
  for (const sx of [-1, 1]) {
    body.add(mesh(new THREE.CapsuleGeometry(0.13, 0.22, 6, 12), trousers, [sx * 0.19, 0.27, 0]));
    body.add(mesh(new THREE.SphereGeometry(0.16, 16, 12), clay("#8A5A3B"), [sx * 0.19, 0.1, 0.06], [1, 0.62, 1.35]));
  }

  // robe
  const robe = mesh(who === "noor" ? robeGeometry(0.56, 0.4, 0.86, 0.05) : robeGeometry(0.66, 0.38, 0.9, 0.12), outfit, [0, 0.3, 0]);
  body.add(robe);

  const torso = new THREE.Group();
  torso.position.y = 0;
  body.add(torso);

  const sleeve = who === "noor" ? outfit : clay(COLORS.amina.sleeves);
  const armL = buildArm(sleeve, skin, -1);
  const armR = buildArm(sleeve, skin, 1);
  torso.add(armL, armR);

  // head
  const head = new THREE.Group();
  head.position.set(0, 1.78, 0);
  torso.add(head);
  head.add(mesh(new THREE.SphereGeometry(0.62, 48, 32), skin, [0, 0, 0], [1, 0.96, 0.95]));
  const face = buildFace(1);
  head.add(face.group);

  if (who === "noor") {
    // collar + buttons
    body.add(mesh(new THREE.TorusGeometry(0.2, 0.045, 10, 32), clay(COLORS.noor.trim, { roughness: 0.35, metalness: 0.2 }), [0, 1.17, 0.02], [1, 1, 1]).rotateX(Math.PI / 2 - 0.25));
    for (let i = 0; i < 3; i++) body.add(mesh(new THREE.SphereGeometry(0.035, 10, 8), clay(COLORS.noor.trim, { metalness: 0.3, roughness: 0.3 }), [0, 1.02 - i * 0.16, 0.47 - i * 0.02]));
    for (const sx of [-1, 1]) head.add(mesh(new THREE.SphereGeometry(0.13, 16, 12), skin, [sx * 0.6, -0.02, 0], [0.7, 1, 0.8]));
    // hair and kufi cap
    const hair = mesh(new THREE.SphereGeometry(0.635, 40, 24, 0, Math.PI * 2, 0, 1.25), clay(COLORS.noor.hair, { roughness: 0.8 }), [0, 0.02, -0.03]);
    hair.rotation.x = -0.32;
    head.add(hair);
    const cap = mesh(new THREE.SphereGeometry(0.645, 40, 24, 0, Math.PI * 2, 0, 0.92), clay(COLORS.noor.cap, { roughness: 0.7, sheen: 0.8 }), [0, 0.04, -0.02]);
    cap.rotation.x = -0.12;
    head.add(cap);
    const band = mesh(new THREE.TorusGeometry(0.515, 0.035, 10, 48), clay(COLORS.noor.trim, { metalness: 0.25, roughness: 0.35 }), [0, 0.39, -0.07]);
    band.rotation.x = Math.PI / 2 - 0.12;
    head.add(band);
  } else {
    // hijab: a hood with the face left open, a soft frame around the face, and a drape
    const hijabMat = clay(COLORS.amina.hijab, { side: THREE.DoubleSide, sheen: 0.9 });
    const gap = 2.25;
    const hood = mesh(new THREE.SphereGeometry(0.72, 48, 32, Math.PI / 2 + gap / 2, Math.PI * 2 - gap), hijabMat, [0, 0.02, -0.04], [1, 1.04, 1]);
    head.add(hood);
    const cap = mesh(new THREE.SphereGeometry(0.725, 48, 24, 0, Math.PI * 2, 0, 0.95), hijabMat, [0, 0.03, -0.02]);
    cap.rotation.x = -0.18;
    head.add(cap);
    const frame = mesh(new THREE.TorusGeometry(0.56, 0.085, 14, 48), hijabMat, [0, -0.02, 0.36], [0.95, 1.1, 1]);
    head.add(frame);
    const drape = mesh(robeGeometry(0.62, 0.34, 0.5, 0.04), hijabMat, [0, 1.02, 0]);
    torso.add(drape);
  }

  // ---------- animation ----------
  let pose: Pose = "happy";
  let pokeT = -10;
  let nextBlink = 1.5;
  let blinkT = -1;

  const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
  const target = { armL: -0.32, armR: 0.32, armLx: 0, armRx: 0, tilt: 0, bounce: 0 };

  return {
    root,
    setPose(p) {
      if (p !== pose) {
        pose = p;
      }
    },
    poke() {
      pokeT = 0;
    },
    update(t, dt) {
      pokeT += dt;
      const breathe = Math.sin(t * 2.2) * 0.012;
      // targets per pose
      target.armL = -0.32;
      target.armR = 0.32;
      target.armLx = 0;
      target.armRx = 0;
      target.tilt = Math.sin(t * 0.9) * 0.04;
      target.bounce = 0;
      let mouth: "smile" | "open" | "o" | "talk" = "smile";
      let happyEyes = false;
      switch (pose) {
        case "wave":
          target.armR = 2.55 + Math.sin(t * 9) * 0.35;
          mouth = "open";
          break;
        case "cheer":
          target.armL = -2.6 - Math.sin(t * 8) * 0.12;
          target.armR = 2.6 + Math.sin(t * 8) * 0.12;
          target.bounce = Math.abs(Math.sin(t * 5)) * 0.14;
          mouth = "open";
          happyEyes = true;
          break;
        case "think":
          target.armR = -0.45;
          target.armRx = -1.3;
          target.tilt = 0.18 + Math.sin(t * 1.3) * 0.03;
          mouth = "o";
          break;
        case "calm":
          happyEyes = true;
          target.tilt = Math.sin(t * 0.6) * 0.06;
          break;
        case "talk":
          mouth = "talk";
          target.armR = 0.7 + Math.sin(t * 2.5) * 0.15;
          break;
      }
      // poke: hop + giggle
      const poking = pokeT >= 0 && pokeT < 0.7;
      const pk = poking ? Math.sin((pokeT / 0.7) * Math.PI) : 0;
      if (poking) {
        mouth = "open";
        happyEyes = true;
      }
      const k = 1 - Math.pow(0.0001, dt); // frame-rate independent smoothing
      armL.rotation.z = lerp(armL.rotation.z, target.armL, k * 1.3);
      armR.rotation.z = lerp(armR.rotation.z, target.armR, k * 1.3);
      armL.rotation.x = lerp(armL.rotation.x, target.armLx, k);
      armR.rotation.x = lerp(armR.rotation.x, target.armRx, k);
      head.rotation.z = lerp(head.rotation.z, target.tilt, k);
      head.rotation.y = Math.sin(t * 0.7) * 0.08;
      head.position.y = 1.78 + breathe * 1.4;
      torso.scale.y = 1 + breathe * 0.5;
      body.position.y = target.bounce + pk * 0.25;
      body.rotation.y = Math.sin(t * 0.5) * 0.06 + pk * 0.4;
      // blink
      if (t > nextBlink) {
        blinkT = 0;
        nextBlink = t + 2.5 + Math.random() * 3;
      }
      let eyeOpen = 1;
      if (blinkT >= 0) {
        blinkT += dt;
        eyeOpen = blinkT < 0.16 ? Math.abs(1 - blinkT / 0.08) : 1;
        if (blinkT > 0.16) blinkT = -1;
      }
      face.setEyes(eyeOpen, happyEyes);
      face.setMouth(mouth, Math.abs(Math.sin(t * 12)));
    },
  };
}

// ---------- Hilmy ----------

function crescentShape(R = 1, r = 0.86, cx = 0.48, cy = 0.22) {
  // Outer circle at origin minus an offset inner circle. Find the two intersection points.
  const d = Math.hypot(cx, cy);
  const a = (R * R - r * r + d * d) / (2 * d);
  const h = Math.sqrt(R * R - a * a);
  const px = (a * cx) / d;
  const py = (a * cy) / d;
  const p1 = { x: px + (h * cy) / d, y: py - (h * cx) / d };
  const p2 = { x: px - (h * cy) / d, y: py + (h * cx) / d };
  const ang = (p: { x: number; y: number }, ox: number, oy: number) => Math.atan2(p.y - oy, p.x - ox);
  const s = new THREE.Shape();
  s.moveTo(p1.x, p1.y);
  // outer arc the long way round (away from the inner circle)
  s.absarc(0, 0, R, ang(p1, 0, 0), ang(p2, 0, 0), true);
  // inner arc back
  s.absarc(cx, cy, r, ang(p2, cx, cy), ang(p1, cx, cy), false);
  return s;
}

function buildHilmy(): Model {
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);
  const moonMat = new THREE.MeshPhysicalMaterial({ color: COLORS.hilmy.moon, roughness: 0.45, sheen: 0.6, sheenColor: new THREE.Color("#fff6d6"), emissive: new THREE.Color("#7a5200"), emissiveIntensity: 0.18 });
  const geo = new THREE.ExtrudeGeometry(crescentShape(), { depth: 0.22, bevelEnabled: true, bevelThickness: 0.2, bevelSize: 0.16, bevelSegments: 8, curveSegments: 48 });
  geo.center();
  const moon = new THREE.Mesh(geo, moonMat);
  moon.position.set(0.12, 0, 0);
  body.add(moon);
  // soft glow
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,233,168,0.55)");
  grad.addColorStop(1, "rgba(255,233,168,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), depthWrite: false, transparent: true }));
  glow.scale.set(3.4, 3.4, 1);
  glow.position.z = -0.4;
  body.add(glow);
  // face on the fat side of the crescent
  const face = buildFace(0.62, 0.2);
  face.group.position.set(-0.5, 0.02, -0.15);
  face.group.rotation.y = -0.15;
  body.add(face.group);
  body.position.y = 1.4;

  let pose: Pose = "happy";
  let pokeT = -10;
  let nextBlink = 2;
  let blinkT = -1;
  return {
    root,
    setPose(p) {
      pose = p;
    },
    poke() {
      pokeT = 0;
    },
    update(t, dt) {
      pokeT += dt;
      const sleepy = pose === "calm";
      const cheer = pose === "cheer" || pose === "wave";
      body.position.y = 1.4 + Math.sin(t * (sleepy ? 1 : 1.8)) * 0.08 + (cheer ? Math.abs(Math.sin(t * 5)) * 0.12 : 0);
      body.rotation.z = Math.sin(t * 0.9) * (sleepy ? 0.12 : 0.07) + (pokeT >= 0 && pokeT < 0.9 ? Math.sin((pokeT / 0.9) * Math.PI * 2) * 0.35 : 0);
      body.rotation.y = Math.sin(t * 0.6) * 0.12;
      glow.material.opacity = 0.8 + Math.sin(t * 2) * 0.2;
      if (t > nextBlink) {
        blinkT = 0;
        nextBlink = t + 3 + Math.random() * 3;
      }
      let open = 1;
      if (blinkT >= 0) {
        blinkT += dt;
        open = blinkT < 0.16 ? Math.abs(1 - blinkT / 0.08) : 1;
        if (blinkT > 0.16) blinkT = -1;
      }
      const poked = pokeT >= 0 && pokeT < 0.9;
      face.setEyes(open, sleepy || cheer || poked);
      face.setMouth(cheer || poked ? "open" : "smile");
    },
  };
}

export function buildCharacter(id: CharacterId): Model {
  return id === "hilmy" ? buildHilmy() : buildKid(id);
}

/** Studio lighting shared by character scenes: soft sky fill, warm key, cool rim. */
export function addStudioLights(scene: THREE.Scene) {
  scene.add(new THREE.HemisphereLight("#eaf4ff", "#f3dcb5", 1.3));
  const key = new THREE.DirectionalLight("#fff3e0", 2.4);
  key.position.set(-3, 5, 6);
  const rim = new THREE.DirectionalLight("#bfe0ff", 1.6);
  rim.position.set(4, 3, -5);
  const fill = new THREE.DirectionalLight("#ffe6c7", 0.6);
  fill.position.set(4, 1, 4);
  scene.add(key, rim, fill);
}
