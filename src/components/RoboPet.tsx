// @ts-nocheck — supplied self-contained Three.js widget
import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import * as THREE from "three";
import { useRobotStunt } from "@/hooks/useRobotStunt";

/**
 * RoboPet — a small interactive 3D companion for a corner of your site.
 *
 * Drop <RoboPet /> once near the root of your layout (e.g. in App.jsx,
 * outside your route switch, so it persists across pages). It renders
 * itself fixed to the bottom-left corner and manages its own Three.js
 * scene — no other setup required.
 *
 * Design: a conical hull (no legs) that hovers on a flickering blue
 * thruster flame instead of standing.
 *
 * Behaviors:
 *  - Idle hover bob + gentle drift/tilt + flickering thruster flame
 *  - Head + eyes track the cursor, anchored to the robot's real screen
 *    position (not a naive whole-window normalization), so it actually
 *    looks toward the cursor wherever it is on the page
 *  - Periodic blinking
 *  - Falls asleep after 15s of no interaction (flame dims), wakes on
 *    movement/click
 *  - Click cycles through reactions (wave / spin / boost-hop / dance)
 *    with a little speech bubble, and gives the thrusters a kick
 *
 * Requires: npm install three   (uses only APIs stable since old three
 * versions, so it should work with whatever version you already have.)
 */

// ---- Tunables: EVE (WALL-E Inspired) --------------------------------
const ACCENT = "#00e5ff"; // EVE's electric cyan visor eyes & ion thruster
const BODY_COLOR = "#ffffff"; // EVE's pristine glossy white shell
const VISOR_COLOR = "#030406"; // deep obsidian convex visor
const WIDGET_SIZE = 175; // px, square mount
const SLEEP_TIMEOUT_MS = 45000; // Sleep after 45s of base inactivity (never sleeps when displaced)
const RETURN_DELAY_MS = 15000; // Returns home exactly 15s after being moved
const DRAG_THRESHOLD_PX = 5;
const HOME_BOTTOM_PX = 8;
const RETURN_DURATION_MS = 3600; // Silky-smooth cinematic low-gravity flight home
const LOOK_SENSITIVITY_PX = 900; // cursor distance (px) at which head rotation saturates

const ACTIONS = [
  "dance",
  "groove",
  "happy",
  "angry",
  "jealous",
  "love",
  "shocked",
  "smile",
  "wave",
  "giggle",
  "spin",
  "scan",
  "hop",
];
const MESSAGES = {
  dance: [
    "Cosmic Space Waltz! 💃🌌",
    "Dancing through the cosmos with Wall-E ✨🎵",
    "Zero-gravity pirouette! 🚀💫",
    "Directive: Dance mode engaged! 🎶✨",
  ],
  groove: [
    "Drop the space beat! 🎧⚡",
    "Ion thruster groove! 🕺🎵",
    "Breakdancing in zero gravity! 🌌🎶",
    "Feel the cosmic rhythm! 🤖💥",
  ],
  happy: ["Directive: Pure Happiness! 💚", "*joyful chime* E-V-A beams ✨", "Happiness index: 100%! 🌟"],
  smile: ["*sweet smile* Hello human! 😊", "Directive: Spread joy ✨", "E-V-A glad to see you! 💙"],
  angry: ["*stern mechanical grunt* Hmph! 💢", "Warning: Laser cannon armed! 🎯🔥", "Directive: Don't provoke E-V-A! 😤", "Core temperature spiking! ⚡"],
  jealous: ["*suspicious side-eye* Who are you looking at? 👀", "Hmph! E-V-A is the prime AI! 💅", "Directive: Pay attention to ME! 😤", "Jealousy metric: High! 💙"],
  love: ["*gentle romantic chime* E-V-A + Wall-E 💖", "Directive: Affection detected! 🌱✨", "Plant directive fulfilled: Love! 💚🌸", "Core warmth nominal 💓"],
  shocked: ["Gasp! Anomaly detected! ⚡", "Whoa! Sensors overloaded! 🌌", "Directive: Alert status! ʘ ʘ"],
  wave: ["E-V-A! 👋", "Hello, explorer! ✨", "Directive: Say hi 🚀"],
  spin: ["360° diagnostic scan 🛰️", "Systems 100% nominal ✨", "Orbit calibrated 🌌"],
  scan: ["Directive: Evaluating portfolio 🌱", "Scanning developer talent... Match 100%! ⚡", "Specimen analysis complete ✅"],
  giggle: ["*giggles* Hehe! ✨🤖", "Directive: Happiness! 💚", "E-V-A amused ✨"],
  hop: ["Ion thrusters max! 🚀", "Zero-G hover jump! 🌌", "Anti-grav boost ⚡"],
  wake: ["E-V-A online! 🛰️", "Systems restored from sleep ✨", "Sensors active 🌐"],
  lift: ["Ion engines engaged! 🚀", "Ascending to low orbit! 🌌", "Flight mode active ✨"],
  moonFall: ["Moon gravity descent 🌙", "Gliding in low-g... 🌕", "Retro-thrusters smooth ✨"],
  landing: ["Soft lunar touchdown! 🌕", "Docked safely on base ✅", "Landed smooth! ✨"],
};
const RETURN_MESSAGES = ["Heading home! 🏠", "Back to base~", "E-V-A returning ✨"];
const HOME_MESSAGES = ["Base reached safely!", "Docked and charging ✅", "*happy EVE chime* ✨"];
const SECTION_WELCOMES = {
  home: "Directive: Explore Aswin Kumar's portfolio! E-V-A online 👋",
  about: "Directive: Inspect About! Meet the human behind my code ✨",
  skills: "Directive: Scan Skills! Superpowers detected: 100% ⚡",
  experience: "Directive: Evaluate Experience! High-impact engineering 🚀",
  projects: "Directive: Analyze Projects! Verified working prototypes 🛠️",
  education: "Directive: Review Education! Solid academic foundation 🎓",
  "why-hire-me": "Why hire Aswin? Specimen analysis: Elite match! 🤖🌱",
  contact: "Directive: Initiate Communication! Let's build together 💬",
};

function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

// Moon gravity smooth descent curve:
// Starts floaty with gentle acceleration under 1/6th g,
// then softly decelerates via retro-thruster cushion to zero velocity at touchdown (p = 1)
function moonDescent(p) {
  if (p <= 0) return 0;
  if (p >= 1) return 1;
  if (p < 0.6) {
    // Low-gravity float acceleration phase
    const t = p / 0.6;
    return 0.48 * (t * t);
  } else {
    // Retro-thrusters deceleration phase (featherlight touchdown)
    const t = (p - 0.6) / 0.4;
    const cushion = 1 - Math.pow(1 - t, 2.4);
    return 0.48 + 0.52 * cushion;
  }
}

function createStarTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
  gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
  gradient.addColorStop(0.2, "rgba(180, 240, 255, 0.9)");
  gradient.addColorStop(0.5, "rgba(0, 229, 255, 0.4)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(32, 32, 30, 0, Math.PI * 2);
  ctx.fill();
  return new THREE.CanvasTexture(canvas);
}

function createLunarRingTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  const grad = ctx.createRadialGradient(64, 64, 8, 64, 64, 60);
  grad.addColorStop(0, "rgba(0, 229, 255, 0.5)");
  grad.addColorStop(0.5, "rgba(0, 229, 255, 0.18)");
  grad.addColorStop(1, "rgba(0, 229, 255, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  ctx.strokeStyle = "rgba(0, 229, 255, 0.65)";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(64, 64, 40, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(64, 64, 22, 0, Math.PI * 2);
  ctx.stroke();
  return new THREE.CanvasTexture(canvas);
}

export default function RoboPet() {
  const shellRef = useRef(null);
  const mountRef = useRef(null);
  const hitAreaRef = useRef(null);
  const speechTimeoutRef = useRef(null);
  const returnTimeoutRef = useRef(null);
  const greetRef = useRef(null);
  const sayRef = useRef(null);
  const triggerActionRef = useRef(null);
  const triggerLaunchRef = useRef(null);
  const resetStuntMeshesRef = useRef(null);
  const stuntResetRef = useRef(null);
  const stuntActiveRef = useRef(false);
  const { pathname } = useLocation();
  const isSkillsUniverse = pathname.startsWith("/skills-universe");
  const [speech, setSpeech] = useState(null);

  const onReturnToIdle = useCallback(() => {
    resetStuntMeshesRef.current?.();
    sayRef.current?.(
      [
        "Base reached safely! Reassembled 100% ✅",
        "Systems online! Directive: Intact ✨",
        "Whew! What a crazy ride! 🚀💥",
      ],
      3200
    );
    triggerActionRef.current?.("hop");
  }, []);

  const {
    stuntActive,
    stuntState,
    triggerLaunch,
    canvasRef,
    flashRef,
    stateRef: stuntStateRef,
    partsRef: stuntPartsRef,
    step: stuntStep,
    drawFx: stuntDrawFx,
    reset: stuntReset,
  } = useRobotStunt(onReturnToIdle);

  stuntActiveRef.current = stuntActive;
  triggerLaunchRef.current = triggerLaunch;
  stuntResetRef.current = stuntReset;

  const dragPosRef = useRef({ x: 0, bottom: HOME_BOTTOM_PX });

  const onStuntTrigger = useCallback(() => {
    if (stuntActiveRef.current) return;
    sayRef.current?.(
      [
        "INITIATING CRAZY FLIGHT! 🚀💥",
        "Warning: Thrusters overclocked! ⚡",
        "Hold onto your seat! 💫",
      ],
      2000
    );
    const curScreenX = (dragPosRef.current?.x ?? 0) + 88;
    const curScreenY = window.innerHeight - ((dragPosRef.current?.bottom ?? HOME_BOTTOM_PX) + 88);
    triggerLaunchRef.current?.({
      x: curScreenX,
      y: curScreenY,
    });
  }, []);

  useEffect(() => {
    let scrollRafId = 0;
    let entranceTimer = null;
    let lastSection = null;

    function greetVisibleSection() {
      if (pathname === "/skills-universe") {
        if (lastSection !== pathname) {
          lastSection = pathname;
          greetRef.current?.("Welcome to Skills Universe! A galaxy of possibilities 🌌");
        }
        return;
      }
      const sections = Object.keys(SECTION_WELCOMES)
        .map((id) => document.getElementById(id))
        .filter(Boolean);
      const focus = window.innerHeight * 0.42;
      const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 30;
      const contact = document.getElementById("contact");
      const section = atBottom && contact ? contact : sections.find((element) => {
        const rect = element.getBoundingClientRect();
        return rect.top <= focus && rect.bottom > focus;
      });
      if (!section || section.id === lastSection) return;
      lastSection = section.id;
      greetRef.current?.(SECTION_WELCOMES[section.id]);
    }

    function onScroll() {
      if (!scrollRafId) {
        scrollRafId = requestAnimationFrame(() => {
          greetVisibleSection();
          scrollRafId = 0;
        });
      }
    }

    function handleNavigate(e: Event) {
      const customEvent = e as CustomEvent<string>;
      const id = customEvent.detail;
      if (id && SECTION_WELCOMES[id]) {
        lastSection = id;
        greetRef.current?.(SECTION_WELCOMES[id]);
      }
    }

    // Greet the initial visible section once initial render stabilizes
    entranceTimer = setTimeout(greetVisibleSection, 1800);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("portfolio:navigate", handleNavigate);

    return () => {
      if (scrollRafId) cancelAnimationFrame(scrollRafId);
      if (entranceTimer) clearTimeout(entranceTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("portfolio:navigate", handleNavigate);
    };
  }, [pathname]);

  useEffect(() => {
    const mount = mountRef.current;
    const shell = shellRef.current;
    const hitArea = hitAreaRef.current;
    if (!mount || !shell || !hitArea) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    // ---- Renderer / scene / camera ----
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(0, width, height, 0, -2000, 2000);
    camera.position.set(0, 0, 1000);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    if ("outputColorSpace" in renderer && THREE.SRGBColorSpace) {
      renderer.outputColorSpace = THREE.SRGBColorSpace;
    }
    mount.appendChild(renderer.domElement);

    // ---- Studio & Space Lighting (Cinematic Pixar Look) ----
    scene.add(new THREE.AmbientLight(0xffffff, 0.65));

    // Warm-white key light for crisp highlights on EVE's glossy shell
    const key = new THREE.DirectionalLight(0xffffff, 1.15);
    key.position.set(2.5, 4.0, 3.5);
    scene.add(key);

    // Cool electric cyan rim light from behind/side
    const rim = new THREE.DirectionalLight(0x00e5ff, 0.75);
    rim.position.set(-3.0, 2.0, -2.5);
    scene.add(rim);

    // Soft fill light from front-below
    const fillLight = new THREE.DirectionalLight(0x80d8ff, 0.5);
    fillLight.position.set(0, 0.6, 2.5);
    scene.add(fillLight);

    // Interactive cursor spotlight for dynamic specular gloss as she turns
    const cursorSpot = new THREE.PointLight(0xffffff, 0.55, 600);
    cursorSpot.position.set(0, 0, 200);
    scene.add(cursorSpot);

    // ---- EVE's Pristine Ceramic Materials ----
    // Ultra-glossy pearlescent white composite body
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.12,
      metalness: 0.05,
    });

    // Dark graphite for inner magnetic levitation cavities
    const cavityMat = new THREE.MeshStandardMaterial({
      color: 0x06080e,
      roughness: 0.8,
      metalness: 0.2,
    });

    // Deep obsidian convex visor
    const visorBezelMat = new THREE.MeshStandardMaterial({
      color: 0x020305,
      roughness: 0.08,
      metalness: 0.5,
    });

    // ---- Robot Assembly (EVE) in Screen-Pixel Coordinates ----
    const robotRoot = new THREE.Group();
    robotRoot.position.set(88, HOME_BOTTOM_PX + 88, 0);
    scene.add(robotRoot);

    const robotOffset = new THREE.Group();
    robotOffset.position.set(0, -1.2 * 65, 0);
    robotOffset.scale.set(65, 65, 65);
    robotRoot.add(robotOffset);

    const robot = new THREE.Group();
    robotOffset.add(robot);

    const bodyGroup = new THREE.Group();
    robot.add(bodyGroup);

    // EVE's Aerodynamic Egg Body (Lathe Geometry for silky-smooth curves)
    const bodyPoints = [];
    bodyPoints.push(new THREE.Vector2(0.13, 0.36)); // nozzle inner lip
    bodyPoints.push(new THREE.Vector2(0.17, 0.38)); // nozzle outer rim
    bodyPoints.push(new THREE.Vector2(0.24, 0.52)); // tapering lower body
    bodyPoints.push(new THREE.Vector2(0.35, 0.74)); // mid body
    bodyPoints.push(new THREE.Vector2(0.42, 0.96)); // upper torso
    bodyPoints.push(new THREE.Vector2(0.44, 1.12)); // shoulder crest (widest point)
    bodyPoints.push(new THREE.Vector2(0.38, 1.25)); // curving inward to neck opening
    bodyPoints.push(new THREE.Vector2(0.28, 1.28)); // upper rim
    bodyPoints.push(new THREE.Vector2(0.01, 1.26)); // inner concave neck well
    const bodyGeom = new THREE.LatheGeometry(bodyPoints, 36);
    const hull = new THREE.Mesh(bodyGeom, bodyMat);
    bodyGroup.add(hull);

    // Inner dark magnetic emitter recess at top of body
    const neckCavity = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.20, 0.08, 28), cavityMat);
    neckCavity.position.y = 1.25;
    bodyGroup.add(neckCavity);

    // EVE's iconic glowing green plant evaluation emblem on upper chest
    const emblemCanvas = document.createElement("canvas");
    emblemCanvas.width = 64;
    emblemCanvas.height = 64;
    const ectx = emblemCanvas.getContext("2d");
    ectx.fillStyle = "#00e676";
    ectx.shadowColor = "#00e676";
    ectx.shadowBlur = 10;
    // Leaf shape
    ectx.beginPath();
    ectx.moveTo(32, 14);
    ectx.bezierCurveTo(46, 22, 46, 44, 32, 52);
    ectx.bezierCurveTo(18, 44, 18, 22, 32, 14);
    ectx.fill();
    ectx.strokeStyle = "#ffffff";
    ectx.lineWidth = 2.5;
    ectx.beginPath();
    ectx.moveTo(32, 52);
    ectx.lineTo(32, 24);
    ectx.stroke();
    const emblemTex = new THREE.CanvasTexture(emblemCanvas);
    const emblemMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.11, 0.11),
      new THREE.MeshBasicMaterial({ map: emblemTex, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending })
    );
    emblemMesh.position.set(-0.16, 1.08, 0.38);
    emblemMesh.rotation.y = -0.36;
    bodyGroup.add(emblemMesh);

    // EVE's Head (Magnetically levitates at y = 1.56, tilting independently)
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.56, 0);
    bodyGroup.add(headGroup);

    // Egg-dome head geometry
    const headGeom = new THREE.SphereGeometry(0.38, 36, 28);
    headGeom.scale(0.96, 1.06, 0.96);
    const headDome = new THREE.Mesh(headGeom, bodyMat);
    headGroup.add(headDome);

    // Under-head magnetic emitter (dark floating well)
    const headBaseCavity = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.14, 0.06, 24), cavityMat);
    headBaseCavity.position.y = -0.34;
    headGroup.add(headBaseCavity);

    // EVE's Micro-Antenna with glowing electric cyan orb
    const antennaGroup = new THREE.Group();
    antennaGroup.position.set(0, 0.38, 0);
    const antennaRod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.22, 12),
      new THREE.MeshStandardMaterial({ color: 0x8e969f, metalness: 0.8, roughness: 0.2 })
    );
    antennaRod.position.y = 0.11;
    const antennaOrb = new THREE.Mesh(
      new THREE.SphereGeometry(0.038, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x00e5ff })
    );
    antennaOrb.position.y = 0.22;
    antennaGroup.add(antennaRod, antennaOrb);
    headGroup.add(antennaGroup);

    // EVE's Left and Right Magnetic Ear Communicator Pods
    function createEarPod(side) {
      const ear = new THREE.Group();
      ear.position.set(0.37 * side, 0, 0);
      const pod = new THREE.Mesh(
        new THREE.CylinderGeometry(0.032, 0.032, 0.12, 16),
        bodyMat
      );
      pod.rotation.x = Math.PI / 2;
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.034, 0.008, 8, 16),
        new THREE.MeshBasicMaterial({ color: 0x00e5ff })
      );
      ear.add(pod, ring);
      return ear;
    }
    const earL = createEarPod(-1);
    const earR = createEarPod(1);
    headGroup.add(earL, earR);

    // EVE's seamless convex black visor
    const visorGroup = new THREE.Group();
    visorGroup.position.set(0, 0.03, 0.30);
    headGroup.add(visorGroup);

    const bezelGeom = new THREE.SphereGeometry(0.32, 32, 24);
    bezelGeom.scale(0.94, 0.70, 0.22);
    const bezel = new THREE.Mesh(bezelGeom, visorBezelMat);
    visorGroup.add(bezel);

    const faceCanvas = document.createElement("canvas");
    faceCanvas.width = 512;
    faceCanvas.height = 320;
    const faceCtx = faceCanvas.getContext("2d");
    const faceTexture = new THREE.CanvasTexture(faceCanvas);
    faceTexture.minFilter = THREE.LinearFilter;
    faceTexture.magFilter = THREE.LinearFilter;
    faceTexture.generateMipmaps = false;

    // Pre-bake static visor scanlines and glass rim gleam once to eliminate 80 fillRect operations per frame
    const visorBgCanvas = document.createElement("canvas");
    visorBgCanvas.width = 512;
    visorBgCanvas.height = 320;
    const bgCtx = visorBgCanvas.getContext("2d");
    if (bgCtx) {
      bgCtx.fillStyle = "rgba(0, 229, 255, 0.02)";
      for (let y = 0; y < 320; y += 4) {
        bgCtx.fillRect(0, y, 512, 1.5);
      }
      bgCtx.strokeStyle = "rgba(0, 229, 255, 0.07)";
      bgCtx.lineWidth = 1.5;
      bgCtx.beginPath();
      bgCtx.arc(256, 320 * 0.18, 512 * 0.38, Math.PI * 0.85, Math.PI * 0.15, true);
      bgCtx.stroke();
    }

    const visorBgAngryCanvas = document.createElement("canvas");
    visorBgAngryCanvas.width = 512;
    visorBgAngryCanvas.height = 320;
    const bgAngryCtx = visorBgAngryCanvas.getContext("2d");
    if (bgAngryCtx) {
      bgAngryCtx.fillStyle = "rgba(255, 50, 50, 0.03)";
      for (let y = 0; y < 320; y += 4) {
        bgAngryCtx.fillRect(0, y, 512, 1.5);
      }
      bgAngryCtx.strokeStyle = "rgba(255, 80, 80, 0.12)";
      bgAngryCtx.lineWidth = 1.5;
      bgAngryCtx.beginPath();
      bgAngryCtx.arc(256, 320 * 0.18, 512 * 0.38, Math.PI * 0.85, Math.PI * 0.15, true);
      bgAngryCtx.stroke();
    }

    // Curved face screen conforming smoothly to EVE's convex black visor
    const faceGeom = new THREE.PlaneGeometry(0.48, 0.30, 32, 32);
    const facePos = faceGeom.attributes.position;
    for (let i = 0; i < facePos.count; i++) {
      const vx = facePos.getX(i);
      const vy = facePos.getY(i);
      const normSq = Math.pow(vx / 0.3008, 2) + Math.pow(vy / 0.224, 2);
      const vz = normSq < 1 ? 0.0704 * Math.sqrt(1 - normSq) : 0;
      // Offset slightly forward (+0.0035) so it hovers right on the visor glass without clipping
      facePos.setZ(i, vz + 0.0035);
    }
    facePos.needsUpdate = true;
    faceGeom.computeVertexNormals();

    const faceMat = new THREE.MeshBasicMaterial({
      map: faceTexture,
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -4,
      toneMapped: false,
    });
    const faceScreen = new THREE.Mesh(faceGeom, faceMat);
    faceScreen.renderOrder = 10;
    visorGroup.add(faceScreen);

    // EVE's Floating Magnetic Arms (Wing-fins)
    function createEveArm(side) {
      const armGroup = new THREE.Group();
      armGroup.position.set(0.47 * side, 0.98, 0);

      // Curved aerodynamic wing silhouette
      const shape = new THREE.Shape();
      shape.moveTo(0, 0.26);
      shape.quadraticCurveTo(0.06 * side, 0.16, 0.05 * side, -0.15);
      shape.quadraticCurveTo(0.02 * side, -0.32, 0, -0.36);
      shape.quadraticCurveTo(-0.02 * side, -0.32, -0.04 * side, -0.15);
      shape.quadraticCurveTo(-0.05 * side, 0.16, 0, 0.26);

      const extrudeSettings = {
        depth: 0.04,
        bevelEnabled: true,
        bevelSegments: 6,
        steps: 1,
        bevelSize: 0.02,
        bevelThickness: 0.02,
      };
      const armGeom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      armGeom.center();
      const armMesh = new THREE.Mesh(armGeom, bodyMat);
      armMesh.rotation.y = -0.14 * side;
      armGroup.add(armMesh);

      // Inner glowing magnetic joint seam
      const seamGeom = new THREE.CylinderGeometry(0.018, 0.018, 0.12, 12);
      const seamMat = new THREE.MeshBasicMaterial({
        color: ACCENT,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
      });
      const seam = new THREE.Mesh(seamGeom, seamMat);
      seam.position.set(-0.02 * side, 0.05, 0);
      armGroup.add(seam);

      return armGroup;
    }
    const armL = createEveArm(-1);
    const armR = createEveArm(1);
    bodyGroup.add(armL, armR);
    const armRBaseRot = { x: armR.rotation.x, y: armR.rotation.y, z: armR.rotation.z };
    const armLBaseRot = { x: armL.rotation.x, y: armL.rotation.y, z: armL.rotation.z };

    // EVE's Diagnostic Holographic Scanner Beam
    const scanGroup = new THREE.Group();
    scanGroup.position.set(0, 1.48, 0.38);
    scanGroup.visible = false;
    bodyGroup.add(scanGroup);

    const scanGeom = new THREE.ConeGeometry(0.75, 2.0, 32, 4, true);
    scanGeom.rotateX(-Math.PI / 2);
    scanGeom.translate(0, 0, 1.0);
    const scanMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const scanCone = new THREE.Mesh(scanGeom, scanMat);
    scanGroup.add(scanCone);

    const scanRingMat = new THREE.MeshBasicMaterial({
      color: 0x00ffaa,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const scanRing = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.016, 8, 32), scanRingMat);
    scanRing.position.z = 1.2;
    scanGroup.add(scanRing);

    // ---- Ion Plasma Thruster & Levitation Shockwave Rings ----
    const flameGroup = new THREE.Group();
    flameGroup.position.set(0, 0.36, 0);
    bodyGroup.add(flameGroup);

    const flamePlume = new THREE.Group();
    flameGroup.add(flamePlume);

    // Ethereal cyan ion sheath
    const flameOuterMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const flameOuter = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.50, 20, 1, true), flameOuterMat);
    flameOuter.rotation.x = Math.PI;
    flameOuter.position.y = -0.25;
    flamePlume.add(flameOuter);

    // Electric plasma core
    const flameInnerMat = new THREE.MeshBasicMaterial({
      color: 0x80d8ff,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const flameInner = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.32, 16, 1, true), flameInnerMat);
    flameInner.rotation.x = Math.PI;
    flameInner.position.y = -0.16;
    flamePlume.add(flameInner);

    // White-hot ion needle
    const flameCoreMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const flameCore = new THREE.Mesh(new THREE.ConeGeometry(0.028, 0.18, 12, 1, true), flameCoreMat);
    flameCore.rotation.x = Math.PI;
    flameCore.position.y = -0.09;
    flamePlume.add(flameCore);

    // Magnetic levitation ripple rings (expanding downward pulses)
    const levRings = [];
    const levRingGeom = new THREE.RingGeometry(0.06, 0.09, 24);
    levRingGeom.rotateX(Math.PI / 2);
    const levRingMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    for (let r = 0; r < 3; r++) {
      const ring = new THREE.Mesh(levRingGeom, levRingMat.clone());
      ring.position.y = -0.15 - r * 0.12;
      flamePlume.add(ring);
      levRings.push(ring);
    }

    const engineLight = new THREE.PointLight(new THREE.Color(ACCENT), 1.3, 3.8);
    engineLight.position.set(0, -0.1, 0);
    flameGroup.add(engineLight);

    // ---- Space Environment: 3D Starfield & Floating Stardust ----
    const starTex = createStarTexture();
    const starCount = 95;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const starSpeeds = new Float32Array(starCount);
    const starPhases = new Float32Array(starCount);

    const starColorPalette = [
      new THREE.Color(0xffffff), // pure white star
      new THREE.Color(0x00e5ff), // cyan neon
      new THREE.Color(0x80d8ff), // soft light blue
      new THREE.Color(0xb388ff), // cosmic violet
      new THREE.Color(0xffe066), // warm yellow star
    ];

    for (let i = 0; i < starCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.5 + Math.random() * 2.3;
      starPositions[i * 3] = Math.cos(angle) * radius;
      starPositions[i * 3 + 1] = 0.05 + Math.random() * 2.8;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 2.6;

      const c = starColorPalette[Math.floor(Math.random() * starColorPalette.length)];
      starColors[i * 3] = c.r;
      starColors[i * 3 + 1] = c.g;
      starColors[i * 3 + 2] = c.b;

      starSpeeds[i] = 0.4 + Math.random() * 1.2;
      starPhases[i] = Math.random() * Math.PI * 2;
    }

    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute("color", new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.085,
      map: starTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const starField = new THREE.Points(starGeometry, starMat);
    robotOffset.add(starField);

    // Deep space backdrop nebula aura
    const nebulaCanvas = document.createElement("canvas");
    nebulaCanvas.width = 128;
    nebulaCanvas.height = 128;
    const nctx = nebulaCanvas.getContext("2d");
    const ngrad = nctx.createRadialGradient(64, 64, 4, 64, 64, 62);
    ngrad.addColorStop(0, "rgba(0, 229, 255, 0.2)");
    ngrad.addColorStop(0.35, "rgba(100, 50, 220, 0.12)");
    ngrad.addColorStop(0.75, "rgba(10, 20, 60, 0.05)");
    ngrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    nctx.fillStyle = ngrad;
    nctx.fillRect(0, 0, 128, 128);
    const nebulaTex = new THREE.CanvasTexture(nebulaCanvas);
    const nebulaMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 3.6),
      new THREE.MeshBasicMaterial({ map: nebulaTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    nebulaMesh.position.set(0, 1.2, -1.0);
    robotOffset.add(nebulaMesh);

    // Thruster exhaust plasma sparks particle system
    const sparkCount = 35;
    const sparkGeometry = new THREE.BufferGeometry();
    const sparkPositions = new Float32Array(sparkCount * 3);
    const sparkVelocities = [];
    const sparkLifetimes = new Float32Array(sparkCount);
    const sparkMaxLifetimes = new Float32Array(sparkCount);

    for (let i = 0; i < sparkCount; i++) {
      sparkPositions[i * 3] = 0;
      sparkPositions[i * 3 + 1] = -100;
      sparkPositions[i * 3 + 2] = 0;
      sparkVelocities.push({ x: 0, y: 0, z: 0 });
      sparkLifetimes[i] = 1;
      sparkMaxLifetimes[i] = 0.35;
    }
    sparkGeometry.setAttribute("position", new THREE.BufferAttribute(sparkPositions, 3));

    const sparkMat = new THREE.PointsMaterial({
      size: 0.08,
      map: starTex,
      color: new THREE.Color(ACCENT),
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const sparkField = new THREE.Points(sparkGeometry, sparkMat);
    robot.add(sparkField);

    // Lunar landing beacon & ring beneath the robot
    const glowTex = createLunarRingTexture();
    const glowMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.25, 1.25),
      new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    glowMesh.rotation.x = -Math.PI / 2;
    glowMesh.position.y = 0.02;
    robot.add(glowMesh);

    // ---- EVE's Emotional Eye Animation Engine (WALL-E Pixar Style) ----
    const eyeAnim = {
      // Dynamic morph parameters:
      archL: 0.08,    // 0 = neutral oval, +1 = happy crescent (◠), -0.5 = focused slit
      archR: 0.08,
      scaleXL: 1.0,
      scaleXR: 1.0,
      scaleYL: 1.0,
      scaleYR: 1.0,
      // Positive canthal tilt: outer corners elevated (+ on left, - on right)
      tiltL: 0.13,
      tiltR: -0.13,
      openL: 1.0,
      openR: 1.0,
      pupilXL: 0,
      pupilXR: 0,
      pupilYL: 0,
      pupilYR: 0,
      scanLaserY: -1, // -1 = off, 0..1 = sweeping scanline
      shimmer: 0,     // 0 = steady, 1 = laughing LED pixel shimmer
      glowIntensity: 1.0,
      colorMode: "cyan", // "cyan", "angry", "love"
    };

    function drawEveEyes({ t }) {
      const w = faceCanvas.width;
      const h = faceCanvas.height;
      faceCtx.clearRect(0, 0, w, h);

      const eyeY = h * 0.48;
      const eyeSpacing = 95;
      const isAngry = eyeAnim.colorMode === "angry";
      const isLove = eyeAnim.colorMode === "love";
      const glowColor = isAngry ? "#ff3344" : isLove ? "#f472b6" : "#00e5ff";
      const deepColor = isAngry ? "#b71c1c" : isLove ? "#db2777" : "#0096c7";
      const midColor = isAngry ? "#ff6b35" : isLove ? "#f9a8d4" : "#00e5ff";
      const coreWhite = "#ffffff";
      const glowMult = eyeAnim.glowIntensity || 1.0;

      // Fast single-blit background from pre-baked cache (eliminates 80 fillRect operations per frame)
      const bgImg = isAngry ? visorBgAngryCanvas : visorBgCanvas;
      faceCtx.drawImage(bgImg, 0, 0, w, h);

      [-1, 1].forEach((side) => {
        const isLeft = side === -1;
        const arch = isLeft ? eyeAnim.archL : eyeAnim.archR;
        const scaleX = isLeft ? eyeAnim.scaleXL : eyeAnim.scaleXR;
        const scaleY = isLeft ? eyeAnim.scaleYL : eyeAnim.scaleYR;
        const open = isLeft ? eyeAnim.openL : eyeAnim.openR;
        const effectiveY = scaleY * open;
        const tilt = isLeft ? eyeAnim.tiltL : eyeAnim.tiltR;
        const pupilX = isLeft ? eyeAnim.pupilXL : eyeAnim.pupilXR;
        const pupilY = isLeft ? eyeAnim.pupilYL : eyeAnim.pupilYR;

        const cx = w / 2 + side * eyeSpacing + pupilX * 16;
        const cy = eyeY + pupilY * 10;

        faceCtx.save();
        faceCtx.translate(cx, cy);
        faceCtx.rotate(tilt);

        const baseW = 50 * scaleX;
        const baseH = 34 * Math.max(0.04, effectiveY);

        // Completely closed / sleeping / blinking: sleek glowing horizontal laser slit
        if (effectiveY < 0.10) {
          faceCtx.shadowColor = glowColor;
          faceCtx.shadowBlur = 18 * glowMult;
          faceCtx.strokeStyle = glowColor;
          faceCtx.lineWidth = 5.5;
          faceCtx.lineCap = "round";
          faceCtx.beginPath();
          faceCtx.moveTo(-baseW * 0.85, 0);
          faceCtx.lineTo(baseW * 0.85, 0);
          faceCtx.stroke();

          faceCtx.strokeStyle = coreWhite;
          faceCtx.lineWidth = 2.4;
          faceCtx.beginPath();
          faceCtx.moveTo(-baseW * 0.65, 0);
          faceCtx.lineTo(baseW * 0.65, 0);
          faceCtx.stroke();

          faceCtx.restore();
          return;
        }

        // Dynamic EVE eye shape with Bezier curves that smoothly morph:
        // Arch controls the emotional morph:
        // arch > 0: smiling happy crescent (◠)
        // arch = 0: canonical rounded pill / oval
        // arch < 0: focused, stern, or inquisitive narrowing
        faceCtx.beginPath();
        let topPeakY, btmPeakY;
        if (arch >= 0) {
          // Smiling upward crescent (WALL-E signature laugh / happy arc)
          topPeakY = -baseH - arch * 22;
          btmPeakY = baseH - arch * (baseH * 1.68);
          faceCtx.moveTo(-baseW, 0);
          faceCtx.bezierCurveTo(-baseW * 0.75, topPeakY * 0.72, -baseW * 0.35, topPeakY, 0, topPeakY);
          faceCtx.bezierCurveTo(baseW * 0.35, topPeakY, baseW * 0.75, topPeakY * 0.72, baseW, 0);
          faceCtx.bezierCurveTo(baseW * 0.75, btmPeakY * 0.72, baseW * 0.35, btmPeakY, 0, btmPeakY);
          faceCtx.bezierCurveTo(-baseW * 0.35, btmPeakY, -baseW * 0.75, btmPeakY * 0.72, -baseW, 0);
        } else {
          // Focused / determined aperture
          topPeakY = -baseH - arch * (baseH * 0.5);
          btmPeakY = baseH - arch * 12;
          faceCtx.moveTo(-baseW, 0);
          faceCtx.bezierCurveTo(-baseW * 0.7, topPeakY * 0.8, -baseW * 0.3, topPeakY, 0, topPeakY);
          faceCtx.bezierCurveTo(baseW * 0.3, topPeakY, baseW * 0.7, topPeakY * 0.8, baseW, 0);
          faceCtx.bezierCurveTo(baseW * 0.7, btmPeakY * 0.8, baseW * 0.3, btmPeakY, 0, btmPeakY);
          faceCtx.bezierCurveTo(-baseW * 0.3, btmPeakY, -baseW * 0.7, btmPeakY * 0.8, -baseW, 0);
        }
        faceCtx.closePath();

        // 1. Neon Bloom (Atmospheric Aura matching current emotion)
        faceCtx.shadowColor = glowColor;
        faceCtx.shadowBlur = 28 * glowMult;
        faceCtx.fillStyle = glowColor;
        faceCtx.fill();

        // 2. High-energy Luminous Core Gradient
        const grad = faceCtx.createRadialGradient(
          pupilX * 16,
          (arch >= 0 ? -arch * 10 : 0) + pupilY * 8,
          3,
          pupilX * 16,
          (arch >= 0 ? -arch * 10 : 0) + pupilY * 8,
          baseW * 0.95
        );
        grad.addColorStop(0, coreWhite); // Intense white energy center
        grad.addColorStop(0.25, isAngry ? "#ffe082" : isLove ? "#fce7f3" : "#a5f3fc");
        grad.addColorStop(0.65, midColor);
        grad.addColorStop(1.0, deepColor);
        faceCtx.fillStyle = grad;
        faceCtx.fill();

        // 3. Clip inner eye for LED Matrix Raster & Reflections
        faceCtx.save();
        faceCtx.clip();

        // Movie-accurate horizontal LED matrix scanlines
        faceCtx.fillStyle = "rgba(2, 6, 23, 0.42)";
        const barSpacing = 4.2;
        const shimmerOffset = eyeAnim.shimmer * Math.sin(t * 36) * 2.5;
        for (let dy = -70; dy <= 70; dy += barSpacing) {
          faceCtx.fillRect(-baseW - 12, dy + shimmerOffset, (baseW + 12) * 2, 1.4);
        }

        // Diagnostic scanner laser sweep line (when scanning)
        if (eyeAnim.scanLaserY >= 0) {
          const laserY = -baseH + eyeAnim.scanLaserY * (baseH * 2.2);
          faceCtx.shadowColor = "#00ffcc";
          faceCtx.shadowBlur = 20;
          faceCtx.fillStyle = "#ffffff";
          faceCtx.fillRect(-baseW - 12, laserY - 2.5, (baseW + 12) * 2, 5);
          faceCtx.fillStyle = "rgba(0, 255, 200, 0.55)";
          faceCtx.fillRect(-baseW - 12, laserY - 10, (baseW + 12) * 2, 20);
        }

        // Specular glass sheen / OLED surface reflection
        const glint = faceCtx.createLinearGradient(-baseW * 0.2, -baseH * 0.9, baseW * 0.7, -baseH * 0.2);
        glint.addColorStop(0, "rgba(255, 255, 255, 0.55)");
        glint.addColorStop(0.45, "rgba(255, 255, 255, 0.15)");
        glint.addColorStop(1, "rgba(255, 255, 255, 0)");
        faceCtx.fillStyle = glint;
        faceCtx.beginPath();
        faceCtx.ellipse(baseW * 0.28, -baseH * 0.38, baseW * 0.42, baseH * 0.26, -Math.PI / 8, 0, Math.PI * 2);
        faceCtx.fill();

        faceCtx.restore(); // unclip

        // 4. Crisp Outer Neon Contour Stroke
        faceCtx.shadowColor = glowColor;
        faceCtx.shadowBlur = 14 * glowMult;
        faceCtx.strokeStyle = glowColor;
        faceCtx.lineWidth = 2.8;
        faceCtx.stroke();

        faceCtx.restore();
      });

      faceTexture.needsUpdate = true;
    }

    // ---- Drag & Position Management (Initialized before robotAnchor to prevent TDZ error) ----
    const drag = {
      active: false,
      moved: false,
      pointerId: null,
      startClientX: 0,
      startClientY: 0,
      startX: 0,
      startBottom: HOME_BOTTOM_PX,
      x: 0,
      bottom: HOME_BOTTOM_PX,
    };
    let dragVelocity = { x: 0, y: 0 };
    let lastDragPoint = { x: 0, y: 0, time: 0 };
    let liftIntensity = 0; // 0 (idle) to 1 (full lift thrust)
    let isLiftAnnounced = false;

    function clampX(x) {
      return THREE.MathUtils.clamp(x, 0, Math.max(0, window.innerWidth - WIDGET_SIZE));
    }

    function clampBottom(bottom) {
      const topLimit = Math.max(HOME_BOTTOM_PX, window.innerHeight - WIDGET_SIZE - 20);
      return THREE.MathUtils.clamp(bottom, HOME_BOTTOM_PX, topLimit);
    }

    function applyShellPosition(x, bottom) {
      drag.x = clampX(x);
      drag.bottom = clampBottom(bottom);
      dragPosRef.current = { x: drag.x, bottom: drag.bottom };
      // Hardware-accelerated GPU translation: zero layout reflows on the document
      const offsetX = drag.x;
      const offsetY = -(drag.bottom - HOME_BOTTOM_PX);
      shell.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
      updateRobotAnchor();
    }

    // ---- Cursor targeting, anchored to the robot's real screen position ----
    const robotAnchor = { x: 88, y: 0 };
    function updateRobotAnchor() {
      robotAnchor.x = (drag?.x ?? 0) + 88;
      robotAnchor.y = window.innerHeight - ((drag?.bottom ?? HOME_BOTTOM_PX) + 88 + 23.4);
    }
    updateRobotAnchor();

    // ---- Interaction state & Emotional Director ----
    const pointer = { clientX: robotAnchor.x, clientY: robotAnchor.y - 200 };
    const headRot = { curX: 0, curY: 0, tgtX: 0, tgtY: 0 };
    const pupil = { curX: 0, curY: 0, tgtX: 0, tgtY: 0 };
    let lastInteraction = performance.now();
    let asleep = false;

    // Snappy, bug-free organic blink system
    const blinkState = {
      active: false,
      start: 0,
      duration: 160,
      isDouble: false,
      nextAt: performance.now() + 2500 + Math.random() * 3000,
    };
    let blinkAmt = 1.0;

    // Spontaneous emotional micro-expressions
    let idleEmotion = null; // { type, start, duration }
    let nextIdleEmotionAt = performance.now() + 3500 + Math.random() * 3500;

    let currentAction = null; // { type, start, duration }
    let lastActionType = null;
    let boostUntil = 0; // extra thruster kick after an action fires
    let returning = false; // gliding back to home spot after a drag
    let motion = null;
    let grounded = true;
    let pendingGreeting = null;
    let greetingReadyAt = 0;

    function pickAction() {
      let choices = ACTIONS.filter((a) => a !== lastActionType);
      const type = choices[Math.floor(Math.random() * choices.length)];
      lastActionType = type;
      return type;
    }

    function say(list, duration = 2000) {
      if (!list || !list.length) return;
      const msg = list[Math.floor(Math.random() * list.length)];
      setSpeech(msg);
      clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = setTimeout(() => setSpeech(null), duration);
    }
    sayRef.current = say;

    function triggerAction(forcedType) {
      if (currentAction) return;
      const type = forcedType || pickAction();
      const dur =
        type === "dance" ? 3.4 :
        type === "groove" ? 2.8 :
        type === "scan" ? 2.4 :
        type === "giggle" ? 1.6 :
        type === "spin" ? 1.0 :
        type === "angry" ? 1.8 :
        type === "jealous" ? 2.2 :
        type === "love" ? 2.0 :
        type === "shocked" ? 1.5 : 1.4;
      currentAction = { type, start: clock.getElapsedTime(), duration: dur };
      boostUntil = clock.getElapsedTime() + currentAction.duration + 0.4;
      say(MESSAGES[type] || MESSAGES.happy, 2500);
      wake();
    }
    triggerActionRef.current = triggerAction;

    function wake() {
      lastInteraction = performance.now();
      if (asleep) {
        asleep = false;
        say(MESSAGES.wake);
      }
    }

    function dropFromReleasePoint() {
      grounded = false;
      isLiftAnnounced = false;
      const dropDistance = Math.max(0, drag.bottom - HOME_BOTTOM_PX);
      if (dropDistance < 2) {
        grounded = true;
        applyShellPosition(drag.x, HOME_BOTTOM_PX);
        if (drag.x > 2) scheduleReturn();
        return;
      }

      // Moon gravity timing: ~1/6th Earth gravity. Smooth, slow, floaty descent
      const maxH = Math.max(100, window.innerHeight * 0.75);
      const normDist = Math.min(dropDistance / maxH, 1);
      const duration = 1600 + Math.sqrt(normDist) * 1200; // 1600ms to 2800ms float

      motion = {
        type: "drop",
        start: performance.now(),
        fromX: drag.x,
        fromBottom: drag.bottom,
        duration: duration,
        distance: dropDistance,
      };
      shell.dataset.motion = "dropping";
      say(MESSAGES.moonFall, Math.min(2400, duration));
    }

    let returnDueAt = 0;

    function startReturnFlight() {
      if (drag.active || drag.x <= 2) {
        returnDueAt = 0;
        return;
      }
      returnDueAt = 0;
      clearTimeout(returnTimeoutRef.current);
      returnTimeoutRef.current = null;
      currentAction = null;
      idleEmotion = null;
      asleep = false;
      lastInteraction = performance.now();
      returning = true;
      grounded = false;
      say(RETURN_MESSAGES, 2400);
      boostUntil = clock.getElapsedTime() + RETURN_DURATION_MS / 1000 + 0.5;
      motion = {
        type: "return",
        start: performance.now(),
        fromX: drag.x,
        fromBottom: drag.bottom,
        duration: RETURN_DURATION_MS,
      };
      shell.dataset.motion = "returning";
    }

    function scheduleReturn(delayMs = RETURN_DELAY_MS) {
      clearTimeout(returnTimeoutRef.current);
      if (drag.x <= 2) {
        returnDueAt = 0;
        return;
      }
      returnDueAt = performance.now() + delayMs;
      returnTimeoutRef.current = setTimeout(() => {
        returnTimeoutRef.current = null;
        if (!drag.active && drag.x > 2 && (!motion || motion.type !== "return")) {
          startReturnFlight();
        }
      }, delayMs);
    }

    greetRef.current = (message) => {
      if (!message || drag.active || motion) return;
      asleep = false;
      lastInteraction = performance.now();
      say([message], 3800);
      currentAction = { type: "wave", start: clock.getElapsedTime(), duration: 1.0 };
      pendingGreeting = null;
    };

    function onPointerMove(e) {
      pointer.clientX = e.clientX;
      pointer.clientY = e.clientY;
      lastInteraction = performance.now();
      if (asleep) wake();

      if (!drag.active || e.pointerId !== drag.pointerId) return;
      const deltaX = e.clientX - drag.startClientX;
      const deltaY = e.clientY - drag.startClientY;
      if (Math.hypot(deltaX, deltaY) >= DRAG_THRESHOLD_PX) drag.moved = true;
      if (!drag.moved) return;
      grounded = false;
      shell.dataset.motion = "lifted";

      const now = performance.now();
      const dt = Math.max(now - lastDragPoint.time, 16);
      dragVelocity.x = (e.clientX - lastDragPoint.x) / dt;
      dragVelocity.y = (e.clientY - lastDragPoint.y) / dt;
      lastDragPoint.x = e.clientX;
      lastDragPoint.y = e.clientY;
      lastDragPoint.time = now;

      applyShellPosition(drag.startX + deltaX, drag.startBottom - deltaY);

      if (!isLiftAnnounced && (drag.bottom - HOME_BOTTOM_PX) > 25) {
        isLiftAnnounced = true;
        say(MESSAGES.lift, 2200);
      }
    }
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    function onPointerDown(e) {
      if (e.button !== undefined && e.button !== 0) return;
      clearTimeout(returnTimeoutRef.current);
      returnDueAt = 0;
      returning = false;
      motion = null; // Freeze at the actual current position, not the old destination.
      drag.active = true;
      drag.moved = false;
      drag.pointerId = e.pointerId;
      drag.startClientX = e.clientX;
      drag.startClientY = e.clientY;
      drag.startX = drag.x;
      drag.startBottom = drag.bottom;
      lastDragPoint = { x: e.clientX, y: e.clientY, time: performance.now() };
      dragVelocity = { x: 0, y: 0 };
      isLiftAnnounced = false;
      shell.style.transition = "none";
      hitArea.setPointerCapture?.(e.pointerId);
      wake();
    }

    let lastTapTime = 0;
    let singleTapTimeout = null;

    function handleDoubleTrigger() {
      clearTimeout(singleTapTimeout);
      singleTapTimeout = null;
      onStuntTrigger();
    }

    function finishPointer(e) {
      if (!drag.active || e.pointerId !== drag.pointerId) return;
      const wasMoved = drag.moved;
      drag.active = false;
      drag.pointerId = null;
      hitArea.releasePointerCapture?.(e.pointerId);
      if (wasMoved || !grounded) {
        dropFromReleasePoint();
        if (drag.x > 2) scheduleReturn();
      } else {
        const now = performance.now();
        if (now - lastTapTime < 350) {
          // Double-click / double-tap detected!
          lastTapTime = 0;
          handleDoubleTrigger();
        } else {
          lastTapTime = now;
          clearTimeout(singleTapTimeout);
          singleTapTimeout = setTimeout(() => {
            singleTapTimeout = null;
            triggerAction();
            if (drag.x > 2) scheduleReturn();
          }, 240);
        }
      }
    }

    function onDblClick(e) {
      e.preventDefault();
      e.stopPropagation();
      handleDoubleTrigger();
    }

    function finishReturn() {
      returning = false;
      motion = null;
      grounded = true;
      returnDueAt = 0;
      applyShellPosition(0, HOME_BOTTOM_PX);
      robotRoot.position.set(88, HOME_BOTTOM_PX + 88, 0);
      robotRoot.rotation.set(0, 0, 0);
      bodyGroup.position.set(0, 0, 0);
      bodyGroup.rotation.set(0, 0, 0);
      robot.rotation.set(0, 0, 0);
      headGroup.rotation.set(0, 0, 0);
      armL.rotation.set(armLBaseRot.x, armLBaseRot.y, armLBaseRot.z);
      armR.rotation.set(armRBaseRot.x, armRBaseRot.y, armRBaseRot.z);
      shell.dataset.motion = "home";
      greetingReadyAt = performance.now() + 2200;
      say(HOME_MESSAGES, 2400);
      const now = clock.getElapsedTime();
      currentAction = { type: "hop", start: now, duration: 1.2 }; // happy landing hop
      boostUntil = now + 1.2;
    }

    hitArea.addEventListener("pointerdown", onPointerDown);
    hitArea.addEventListener("dblclick", onDblClick);
    window.addEventListener("pointerup", finishPointer);
    window.addEventListener("pointercancel", finishPointer);
    hitArea.addEventListener("lostpointercapture", finishPointer);

    function onResize() {
      width = window.innerWidth;
      height = window.innerHeight;
      if (!width || !height) return;
      camera.left = 0;
      camera.right = width;
      camera.top = height;
      camera.bottom = 0;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      applyShellPosition(drag.x, drag.bottom);
      updateRobotAnchor();
    }
    window.addEventListener("resize", onResize);

    // ---- 3D Robot Stunt Parts Mapping & Synchronization ----
    const partMap = {
      antenna: {
        mesh: antennaGroup,
        parent: headGroup,
        origPos: new THREE.Vector3(0, 0.38, 0),
        origRot: new THREE.Euler(0, 0, 0),
        origScale: new THREE.Vector3(1, 1, 1),
      },
      earL: {
        mesh: earL,
        parent: headGroup,
        origPos: new THREE.Vector3(-0.37, 0, 0),
        origRot: new THREE.Euler(0, 0, 0),
        origScale: new THREE.Vector3(1, 1, 1),
      },
      earR: {
        mesh: earR,
        parent: headGroup,
        origPos: new THREE.Vector3(0.37, 0, 0),
        origRot: new THREE.Euler(0, 0, 0),
        origScale: new THREE.Vector3(1, 1, 1),
      },
      head: {
        mesh: headGroup,
        parent: bodyGroup,
        origPos: new THREE.Vector3(0, 1.56, 0),
        origRot: new THREE.Euler(0, 0, 0),
        origScale: new THREE.Vector3(1, 1, 1),
      },
      armL: {
        mesh: armL,
        parent: bodyGroup,
        origPos: new THREE.Vector3(-0.47, 0.98, 0),
        origRot: new THREE.Euler(armLBaseRot.x, armLBaseRot.y, armLBaseRot.z),
        origScale: new THREE.Vector3(1, 1, 1),
      },
      armR: {
        mesh: armR,
        parent: bodyGroup,
        origPos: new THREE.Vector3(0.47, 0.98, 0),
        origRot: new THREE.Euler(armRBaseRot.x, armRBaseRot.y, armRBaseRot.z),
        origScale: new THREE.Vector3(1, 1, 1),
      },
      chest: {
        mesh: emblemMesh,
        parent: bodyGroup,
        origPos: new THREE.Vector3(-0.16, 1.08, 0.38),
        origRot: new THREE.Euler(0, -0.36, 0),
        origScale: new THREE.Vector3(1, 1, 1),
      },
      thruster: {
        mesh: flameGroup,
        parent: bodyGroup,
        origPos: new THREE.Vector3(0, 0.36, 0),
        origRot: new THREE.Euler(0, 0, 0),
        origScale: new THREE.Vector3(1, 1, 1),
      },
    };

    function applyStuntToThree() {
      const s = stuntStateRef.current;
      const H = window.innerHeight;
      const parts = stuntPartsRef.current;

      // Body core (never detaches) follows position and rotation
      robotRoot.position.set(s.pos.x + s.bx, H - (s.pos.y + s.by), 0);
      robotRoot.rotation.z = -s.rot * (Math.PI / 180);

      // Apply kinetic impact vibration directly to the 3D camera (0 DOM mutation, 0 layout shifts, 0 scrollbars)
      if (s.shake > 0) {
        const m = s.shake * s.shake * 8;
        camera.position.x = (Math.random() - 0.5) * 2 * m;
        camera.position.y = (Math.random() - 0.5) * 2 * m;
      } else if (camera.position.x !== 0 || camera.position.y !== 0) {
        camera.position.x = 0;
        camera.position.y = 0;
      }

      // Keep bodyGroup & robot reset at (0,0,0) so idle drift doesn't offset them
      bodyGroup.position.set(0, 0, 0);
      bodyGroup.rotation.set(0, 0, 0);
      robot.position.set(0, 0, 0);
      robot.rotation.set(0, 0, 0);

      for (const p of parts) {
        const info = partMap[p.n];
        if (!info) continue;
        const mesh = info.mesh;

        if (p.att) {
          if (mesh.parent !== info.parent) {
            info.parent.add(mesh);
            mesh.position.copy(info.origPos);
            mesh.rotation.copy(info.origRot);
            mesh.scale.copy(info.origScale);
          }
          if (p.n === "head") {
            mesh.position.copy(info.origPos);
            mesh.rotation.set(0, 0, 0);
          }
        } else {
          if (mesh.parent !== scene) {
            scene.add(mesh);
            mesh.scale.set(65, 65, 65);
          }
          mesh.position.set(p.x, H - p.y, 0);
          mesh.rotation.z = -p.rot * (Math.PI / 180);
          if (p.mode === "mag") {
            mesh.rotation.x *= Math.max(0, 1 - 0.05 * 5);
            mesh.rotation.y *= Math.max(0, 1 - 0.05 * 5);
          } else {
            mesh.rotation.x += (p.vr || 0) * 0.001;
            mesh.rotation.y += (p.vr || 0) * 0.0015;
          }
        }
      }
    }

    function resetStuntMeshes() {
      for (const info of Object.values(partMap)) {
        info.parent.add(info.mesh);
        info.mesh.position.copy(info.origPos);
        info.mesh.rotation.copy(info.origRot);
        info.mesh.scale.copy(info.origScale);
      }
      robotRoot.rotation.set(0, 0, 0);
      bodyGroup.position.set(0, 0, 0);
      bodyGroup.rotation.set(0, 0, 0);
      headGroup.position.set(0, 1.56, 0);
      headGroup.rotation.set(0, 0, 0);
      flameGroup.visible = true;
      flamePlume.scale.set(1, 1, 1);
      drag.x = 0;
      drag.bottom = HOME_BOTTOM_PX;
      applyShellPosition(0, HOME_BOTTOM_PX);
      robotRoot.position.set(88, HOME_BOTTOM_PX + 88, 0);
      camera.position.set(0, 0, 0);
    }
    resetStuntMeshesRef.current = resetStuntMeshes;

    function updateStuntVisorAndFlame(t, dt) {
      const s = stuntStateRef.current;
      const u = s.dur > 0 ? Math.min(s.t / s.dur, 1) : 0;
      const isCrashFly = s.st === "fly" && s.kind === "crash";
      const isBad = isCrashFly && u > 0.8;
      const parts = stuntPartsRef.current;

      const thrusterPart = parts.find((p) => p.n === "thruster");
      const thrusterAttached = thrusterPart ? thrusterPart.att : true;

      if (!thrusterAttached || s.st === "fall" || s.st === "dead" || s.st === "repair") {
        flameGroup.visible = false;
      } else if (isBad) {
        flameGroup.visible = Math.random() > 0.35;
        flamePlume.scale.set(0.9, 0.7 + Math.random() * 0.5, 0.9);
      } else if (s.st === "reboot") {
        flameGroup.visible = true;
        flamePlume.scale.set(1.1, 1.2, 1.1);
      } else if (s.kind === "return" && u > 0.85) {
        flameGroup.visible = true;
        const landEase = Math.max(0, (1 - u) / 0.15);
        flamePlume.scale.set(
          1.0 + 0.4 * landEase,
          1.0 + (0.7 + Math.random() * 0.2) * landEase,
          1.0 + 0.4 * landEase
        );
      } else {
        flameGroup.visible = true;
        flamePlume.scale.set(1.4, 1.7 + Math.random() * 0.4, 1.4);
      }

      if (s.st === "dead") {
        eyeAnim.openL = 0.05;
        eyeAnim.openR = 0.05;
        eyeAnim.glowIntensity = Math.random() < 0.15 ? 0.6 : 0.05;
      } else if (s.st === "reboot") {
        const on = Math.sin(s.t * 36) > 0;
        eyeAnim.openL = on ? 1.0 : 0.05;
        eyeAnim.openR = on ? 1.0 : 0.05;
        eyeAnim.glowIntensity = on ? 1.8 : 0.05;
      } else if (isBad) {
        const flicker = Math.random() < 0.35;
        eyeAnim.glowIntensity = flicker ? 0.2 : 1.3;
        eyeAnim.openL = flicker ? 0.4 : 1.0;
        eyeAnim.openR = flicker ? 0.4 : 1.0;
      } else if (s.st === "repair") {
        const attachedCount = parts.filter((p) => p.att).length;
        const ratio = attachedCount / parts.length;
        eyeAnim.openL = 0.15 + 0.85 * ratio;
        eyeAnim.openR = 0.15 + 0.85 * ratio;
        eyeAnim.glowIntensity = 0.6 + 0.6 * Math.random();
      } else if (s.st === "fly") {
        eyeAnim.openL = 1.0;
        eyeAnim.openR = 1.0;
        eyeAnim.glowIntensity = 1.4;
        eyeAnim.archL = s.kind === "return" ? 0.25 : 0;
        eyeAnim.archR = s.kind === "return" ? 0.25 : 0;
      }
      drawEveEyes({ t });
    }

    // ---- Animation loop ----
    const clock = new THREE.Clock();
    let rafId;

    function animate() {
      rafId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05) || 0.016;
      const t = clock.getElapsedTime();
      const now = performance.now();

      if (stuntActiveRef.current) {
        try {
          stuntStep(dt);
          applyStuntToThree();
          stuntDrawFx(dt);
          updateStuntVisorAndFlame(t, dt);
        } catch (err) {
          console.error("RoboPet stunt loop error:", err);
          resetStuntMeshes();
          stuntResetRef.current?.();
        }
      } else {

      // Deterministic 15-second return flight trigger
      if (returnDueAt && !drag.active && (!motion || motion.type !== "return") && now >= returnDueAt) {
        startReturnFlight();
      }

      if (motion) {
        const progress = Math.min((now - motion.start) / motion.duration, 1);
        if (motion.type === "drop") {
          // Lunar gravity smooth descent: slow floaty start, decelerates gently at landing
          const ease = moonDescent(progress);
          const currentBottom = HOME_BOTTOM_PX + (motion.fromBottom - HOME_BOTTOM_PX) * (1 - ease);
          applyShellPosition(motion.fromX, currentBottom);

          // Gentle low-gravity attitude sway during float down
          if (!currentAction) {
            bodyGroup.rotation.z = Math.sin(progress * Math.PI * 2) * (1 - progress * 0.5) * 0.08;
            bodyGroup.rotation.x = Math.sin(progress * Math.PI) * 0.04;
          }
        } else {
          // motion.type === "return": Cinematic low-gravity parabolic flight arc back home!
          const p = easeInOutQuad(progress);
          const curX = motion.fromX * (1 - p);

          // Parabolic space flight arc: climbs into low orbit, cruises, then descends softly to base
          const flightAltitude = Math.min(180, Math.max(75, motion.fromX * 0.32));
          const arc = Math.sin(p * Math.PI);
          const fromB = motion.fromBottom !== undefined ? motion.fromBottom : HOME_BOTTOM_PX;
          const curBottom = HOME_BOTTOM_PX + (fromB - HOME_BOTTOM_PX) * (1 - p) + flightAltitude * arc;
          applyShellPosition(curX, curBottom);

          // Flight posture:
          // 1. Aerodynamic banking into flight direction (leaning toward left = +Z)
          bodyGroup.rotation.z = 0.22 * Math.sin(p * Math.PI);
          // 2. Yaw turn toward destination (facing left toward base at x=0)
          bodyGroup.rotation.y = -0.36 * Math.sin(p * Math.PI);
          // 3. Pitch dynamics: nose slightly up on climb, level in cruise, nose up retro-cushion on landing
          const pitch = p < 0.3 ? -0.08 * (1 - p / 0.3) : p > 0.7 ? 0.12 * ((p - 0.7) / 0.3) : -0.04;
          bodyGroup.rotation.x = pitch;

          // 4. Head looks forward toward destination
          headGroup.rotation.y = -0.42 * Math.sin(p * Math.PI);
          headGroup.rotation.x = 0.04 * Math.sin(p * Math.PI);
          headGroup.rotation.z = 0.10 * Math.sin(p * Math.PI);

          // 5. Wings sweep back aerodynamically
          armL.rotation.x = -0.55 * Math.sin(p * Math.PI);
          armR.rotation.x = -0.55 * Math.sin(p * Math.PI);
          armL.rotation.z = -0.20 * Math.sin(p * Math.PI);
          armR.rotation.z = 0.20 * Math.sin(p * Math.PI);
        }
        if (progress === 1) {
          const type = motion.type;
          motion = null;
          grounded = true;
          bodyGroup.rotation.z = 0;
          bodyGroup.rotation.y = 0;
          bodyGroup.rotation.x = 0;
          headGroup.rotation.x = 0;
          headGroup.rotation.y = 0;
          headGroup.rotation.z = 0;
          armL.rotation.set(armLBaseRot.x, armLBaseRot.y, armLBaseRot.z);
          armR.rotation.set(armRBaseRot.x, armRBaseRot.y, armRBaseRot.z);
          if (type === "drop") {
            shell.dataset.motion = "waiting";
            if (drag.x > 2) scheduleReturn(); // The 15-second timer starts after landing!
            say(MESSAGES.landing, 2200);
          } else {
            finishReturn();
          }
        }
      }
      if (pendingGreeting && !drag.active && !motion) {
        asleep = false;
        lastInteraction = now;
        say([pendingGreeting], 3800);
        pendingGreeting = null;
        currentAction = { type: "wave", start: t, duration: 1.0 };
      }

      // Robot only falls asleep when docked safely at home base
      const isAtHome = drag.x <= 4 && Math.abs(drag.bottom - HOME_BOTTOM_PX) <= 4;
      if (!asleep && isAtHome && now - lastInteraction > SLEEP_TIMEOUT_MS) {
        asleep = true;
      }

      // Update lift intensity (fire increases smoothly when lifted or flying)
      const targetLift = (drag.active && drag.moved)
        ? 1.0
        : (returning || motion?.type === "return")
          ? 0.95
          : (motion?.type === "drop")
            ? 0.35
            : 0.0;
      liftIntensity += (targetLift - liftIntensity) * 0.15;

      // Update space starfield smoothly via 3D transforms (zero CPU vertex buffer uploads)
      starField.rotation.y = t * 0.035;
      starField.rotation.z = Math.sin(t * 0.25) * 0.04;
      starField.position.y = Math.sin(t * 0.8) * 0.02;
      starMat.opacity = 0.8 + Math.sin(t * 1.8) * 0.15;

      // Update thruster exhaust plasma sparks
      const spawnSparks = drag.active ? 2 : (returning || motion?.type === "return") ? 2 : (motion?.type === "drop" ? 2 : 1);
      for (let s = 0; s < spawnSparks; s++) {
        const freeIdx = sparkLifetimes.findIndex((lt) => lt >= 1);
        if (freeIdx !== -1) {
          sparkLifetimes[freeIdx] = 0;
          sparkMaxLifetimes[freeIdx] = 0.28 + Math.random() * 0.25;
          const spread = 0.05 * (1 + liftIntensity * 0.6);
          sparkPositions[freeIdx * 3] = (Math.random() - 0.5) * spread;
          sparkPositions[freeIdx * 3 + 1] = 0.36; // at nozzle
          sparkPositions[freeIdx * 3 + 2] = (Math.random() - 0.5) * spread;
          const speed = (0.03 + Math.random() * 0.03) * (1 + liftIntensity * 0.9);
          sparkVelocities[freeIdx] = {
            x: (Math.random() - 0.5) * 0.012,
            y: -speed,
            z: (Math.random() - 0.5) * 0.012,
          };
        }
      }

      for (let i = 0; i < sparkCount; i++) {
        if (sparkLifetimes[i] < 1) {
          sparkLifetimes[i] += 0.04;
          sparkPositions[i * 3] += sparkVelocities[i].x;
          sparkPositions[i * 3 + 1] += sparkVelocities[i].y;
          sparkPositions[i * 3 + 2] += sparkVelocities[i].z;
        } else {
          sparkPositions[i * 3 + 1] = -100;
        }
      }
      sparkGeometry.attributes.position.needsUpdate = true;

      // Realistic tilt when being dragged through space
      if (drag.active && drag.moved && !currentAction) {
        const targetTiltZ = -THREE.MathUtils.clamp(dragVelocity.x * 0.06, -0.22, 0.22);
        const targetTiltX = THREE.MathUtils.clamp(dragVelocity.y * 0.06, -0.18, 0.18);
        bodyGroup.rotation.z += (targetTiltZ - bodyGroup.rotation.z) * 0.15;
        bodyGroup.rotation.x += (targetTiltX - bodyGroup.rotation.x) * 0.15;
      }

      // accurate cursor targeting (see updateRobotAnchor above)
      const dx = pointer.clientX - robotAnchor.x;
      const dy = pointer.clientY - robotAnchor.y;
      const normX = THREE.MathUtils.clamp(dx / LOOK_SENSITIVITY_PX, -1, 1);
      const normY = THREE.MathUtils.clamp(dy / LOOK_SENSITIVITY_PX, -1, 1);
      headRot.tgtY = normX * 0.55;
      headRot.tgtX = -normY * 0.3;
      pupil.tgtX = normX;
      pupil.tgtY = normY;

      // head tracking (skip while an action or return flight is driving the pose)
      if (!currentAction && !returning && motion?.type !== "return") {
        headRot.curX += (headRot.tgtX - headRot.curX) * 0.08;
        headRot.curY += (headRot.tgtY - headRot.curY) * 0.08;
        headGroup.rotation.x = headRot.curX;
        headGroup.rotation.y = headRot.curY;
      }
      pupil.curX += (pupil.tgtX - pupil.curX) * 0.15;
      pupil.curY += (pupil.tgtY - pupil.curY) * 0.15;

      // Snappy, organic bug-free Pixar blink
      const isEmotionSuppressingBlink =
        asleep ||
        currentAction?.type === "wink" ||
        currentAction?.type === "angry" ||
        currentAction?.type === "scan" ||
        idleEmotion?.type === "wink" ||
        idleEmotion?.type === "angry" ||
        idleEmotion?.type === "scan";

      if (!isEmotionSuppressingBlink) {
        if (!blinkState.active && now > blinkState.nextAt) {
          blinkState.active = true;
          blinkState.start = now;
          blinkState.duration = 160;
          blinkState.isDouble = Math.random() < 0.28;
        }
        if (blinkState.active) {
          const elapsed = now - blinkState.start;
          if (elapsed < blinkState.duration) {
            const p = elapsed / blinkState.duration;
            // Smooth closed-form eyelid curve (snappy close in 40% of time, smooth cushioned open in 60%)
            if (p < 0.40) {
              blinkAmt = Math.pow(1 - p / 0.40, 1.8);
            } else {
              const openP = (p - 0.40) / 0.60;
              blinkAmt = Math.pow(openP, 1.4);
            }
          } else {
            if (blinkState.isDouble) {
              blinkState.isDouble = false;
              blinkState.start = now + 80; // natural micro pause before cute second flutter
              blinkState.duration = 130;
              blinkAmt = 1.0;
            } else {
              blinkState.active = false;
              blinkAmt = 1.0;
              blinkState.nextAt = now + 2800 + Math.random() * 3800;
            }
          }
        } else {
          blinkAmt = 1.0;
        }
      } else {
        blinkState.active = false;
        blinkAmt = 1.0;
      }

      // idle hover: bob, gentle drift, and a slight wobble tilt
      const bobAmp = asleep ? 0.02 : 0.045;
      const bobSpeed = asleep ? 0.9 : 1.5;
      if (!returning && motion?.type !== "return") {
        bodyGroup.position.y = Math.sin(t * bobSpeed) * bobAmp;
        bodyGroup.position.x = Math.sin(t * 0.4) * 0.025;
        if (!currentAction && (!drag.active || !drag.moved)) {
          bodyGroup.rotation.z = Math.sin(t * 0.8) * 0.035;
          bodyGroup.rotation.x = Math.sin(t * 0.5 + 1) * 0.02;
        }
      } else {
        // Gentle zero-G float attitude while flying home
        bodyGroup.position.y = Math.sin(t * 3.5) * 0.015;
      }

      // EVE's chest bio-indicator pulse
      emblemMesh.material.opacity = asleep ? 0.3 : 0.75 + Math.sin(t * 2.8) * 0.25;

      // Dynamic cursor spotlight for specular gloss highlights across EVE's white shell
      cursorSpot.position.x = (pointer.clientX - robotAnchor.x) * 0.005;
      cursorSpot.position.y = 1.6 - (pointer.clientY - robotAnchor.y) * 0.005;

      // EVE's floating head gentle magnetic levitation bob
      headGroup.position.y = 1.56 + Math.sin(t * 2.2) * 0.012;
      headGroup.position.x = Math.sin(t * 1.3) * 0.006;

      // Animate expanding magnetic levitation ripple rings
      levRings.forEach((ring, idx) => {
        const ringProgress = (t * 2.2 + idx * 0.33) % 1;
        ring.position.y = -0.12 - ringProgress * 0.42;
        ring.scale.setScalar(1 + ringProgress * 1.8);
        ring.material.opacity = (1 - ringProgress) * 0.55 * (1 + liftIntensity * 0.5);
      });

      // EVE's floating magnetic wing-arms
      if (!currentAction && !returning && motion?.type !== "return") {
        if (drag.active && drag.moved) {
          // Flight mode: wings sweep back gracefully
          armL.rotation.x += (-0.45 - armL.rotation.x) * 0.15;
          armR.rotation.x += (-0.45 - armR.rotation.x) * 0.15;
          armL.rotation.z += (-0.18 - armL.rotation.z) * 0.15;
          armR.rotation.z += (0.18 - armR.rotation.z) * 0.15;
        } else if (motion?.type === "drop") {
          // Glider posture during moon gravity float
          armL.rotation.x += (0.1 - armL.rotation.x) * 0.1;
          armR.rotation.x += (0.1 - armR.rotation.x) * 0.1;
          armL.rotation.z += (0.14 - armL.rotation.z) * 0.1;
          armR.rotation.z += (-0.14 - armR.rotation.z) * 0.1;
        } else {
          // Idle magnetic breathing hover
          armL.rotation.x += (armLBaseRot.x - armL.rotation.x) * 0.1;
          armR.rotation.x += (armRBaseRot.x - armR.rotation.x) * 0.1;
          armL.rotation.y += (armLBaseRot.y - armL.rotation.y) * 0.1;
          armR.rotation.y += (armRBaseRot.y - armR.rotation.y) * 0.1;
          armL.rotation.z = armLBaseRot.z + Math.sin(t * 1.4) * 0.035;
          armR.rotation.z = armRBaseRot.z - Math.sin(t * 1.4) * 0.035;
          armL.position.y = 0.98 + Math.sin(t * 1.8) * 0.012;
          armR.position.y = 0.98 + Math.sin(t * 1.8 + 0.4) * 0.012;
        }
      }

      // ---- thruster flame ----
      const boosting = t < boostUntil;
      const flameBase = asleep ? 0.35 : 1;
      const flameBoost = boosting ? 1.4 : 1;

      // Retro-cushion boost during the final landing phase of moon drop or return flight
      const isDropping = motion?.type === "drop";
      const isLandingFlight = motion?.type === "return" && ((now - motion.start) / motion.duration) > 0.7;
      const dropRetroBoost = (isDropping && ((now - motion.start) / motion.duration) > 0.6)
        ? 1.35 * Math.sin((((now - motion.start) / motion.duration) - 0.6) / 0.4 * Math.PI)
        : isLandingFlight
          ? 1.25 * Math.sin((((now - motion.start) / motion.duration) - 0.7) / 0.3 * Math.PI)
          : 1.0;

      const flicker = (0.85 + Math.sin(t * 22) * 0.1 + Math.sin(t * 8.5) * 0.05) * flameBase * flameBoost * dropRetroBoost;

      // When lifted or flying, the ion fire increases in length and width!
      const flameLength = (1.0 + liftIntensity * 0.65) * flicker;
      const flameWidth = (1.0 + liftIntensity * 0.3) * flicker;
      flamePlume.scale.set(flameWidth, flameLength, flameWidth);

      flameOuterMat.opacity = Math.min(0.85, (0.42 + liftIntensity * 0.35) * flameBase);
      flameInnerMat.opacity = Math.min(1.0, (0.75 + liftIntensity * 0.25) * flameBase);
      flameCoreMat.opacity = Math.min(1.0, (0.4 + liftIntensity * 0.55) * flameBase);

      engineLight.intensity = (1.1 + Math.sin(t * 24) * 0.3) * flameBase * flameBoost * (1.0 + liftIntensity * 1.5);
      engineLight.distance = 3.2 * (1.0 + liftIntensity * 0.5);

      glowMesh.scale.setScalar(flameBase * (1.0 + liftIntensity * 0.3));
      glowMesh.visible = (grounded && !returning && motion?.type !== "return") || (motion?.type === "drop" && ((now - motion.start) / motion.duration) > 0.85);
      shell.dataset.groundGlow = glowMesh.visible ? "visible" : "hidden";
      glowMesh.material.opacity += (((grounded && !returning && motion?.type !== "return") ? flameBase : 0) - glowMesh.material.opacity) * 0.12;

      // ---- Emotional Director & Expressions ----
      const cursorDist = Math.hypot(dx, dy);
      const isCursorClose = cursorDist < 140;

      // Autonomous idle micro-emotions (dance, groove, happy, smile, angry, jealous, love, shocked, curious, wink, giggle, scan)
      if (!currentAction && !drag.active && !motion && !asleep) {
        if (!idleEmotion && now > nextIdleEmotionAt) {
          const emotionChoices = ["dance", "groove", "happy", "smile", "angry", "jealous", "love", "shocked", "curious", "wink", "giggle", "scan"];
          const chosen = emotionChoices[Math.floor(Math.random() * emotionChoices.length)];
          const dur =
            chosen === "dance" ? 3400 :
            chosen === "groove" ? 2800 :
            chosen === "wink" ? 1300 :
            chosen === "curious" ? 2200 :
            chosen === "giggle" ? 1500 :
            chosen === "angry" ? 2000 :
            chosen === "jealous" ? 2300 :
            chosen === "love" ? 2200 :
            chosen === "shocked" ? 1600 : 1800;
          idleEmotion = { type: chosen, start: now, duration: dur };
        }
        if (idleEmotion) {
          if (now - idleEmotion.start >= idleEmotion.duration) {
            idleEmotion = null;
            nextIdleEmotionAt = now + 4000 + Math.random() * 5000;
            if (!returning && motion?.type !== "return" && !currentAction) {
              robot.rotation.y = 0;
              bodyGroup.rotation.set(0, 0, 0);
              bodyGroup.position.set(0, 0, 0);
              headGroup.rotation.set(0, 0, 0);
              armL.rotation.set(armLBaseRot.x, armLBaseRot.y, armLBaseRot.z);
              armR.rotation.set(armRBaseRot.x, armRBaseRot.y, armRBaseRot.z);
            }
          }
        }
      } else {
        idleEmotion = null;
      }

      // Base neutral eye posture with POSITIVE CANTHAL TILT
      // Outer eye corners are elevated (+ on Left, - on Right) for that alert, sleek Pixar EVE look
      let tgtArchL = 0.08, tgtArchR = 0.08;
      let tgtScaleXL = isCursorClose ? 1.12 : 1.0;
      let tgtScaleXR = isCursorClose ? 1.12 : 1.0;
      let tgtScaleYL = isCursorClose ? 1.15 : 1.0;
      let tgtScaleYR = isCursorClose ? 1.15 : 1.0;
      let tgtTiltL = (normX * 0.14) + 0.13;
      let tgtTiltR = (normX * 0.14) - 0.13;
      let tgtOpenL = blinkAmt;
      let tgtOpenR = blinkAmt;
      let tgtShimmer = 0;
      let tgtScanLaser = -1;
      let tgtGlow = 1.0;
      let tgtColorMode = "cyan";

      if (asleep) {
        tgtScaleYL = 0.06;
        tgtScaleYR = 0.06;
        tgtArchL = 0.0;
        tgtArchR = 0.0;
        tgtTiltL = 0.06;
        tgtTiltR = -0.06;
        tgtGlow = 0.45 + Math.sin(t * 1.8) * 0.15;
      } else if (drag.active && drag.moved) {
        // Liftoff / Flight Mode: thrilled excited wide eyes with positive canthal sweep
        tgtArchL = 0.38;
        tgtArchR = 0.38;
        tgtScaleXL = 1.22;
        tgtScaleXR = 1.22;
        tgtScaleYL = 1.28;
        tgtScaleYR = 1.28;
        tgtTiltL = 0.16;
        tgtTiltR = -0.16;
        tgtGlow = 1.5;
      } else if (motion?.type === "drop") {
        // Moon gravity descent: gentle wonder gaze looking down at surface
        tgtArchL = 0.25;
        tgtArchR = 0.25;
        tgtScaleXL = 1.08;
        tgtScaleXR = 1.08;
        tgtScaleYL = 1.18;
        tgtScaleYR = 1.18;
        tgtTiltL = 0.10;
        tgtTiltR = -0.10;
        tgtGlow = 1.25;
      } else if (returning || motion?.type === "return") {
        tgtArchL = 0.92;
        tgtArchR = 0.92;
        tgtTiltL = 0.20;
        tgtTiltR = -0.20;
        tgtScaleXL = 1.15;
        tgtScaleXR = 1.15;
        tgtScaleYL = 1.25;
        tgtScaleYR = 1.25;
        tgtShimmer = 0.65;
        tgtGlow = 1.5;
      } else if (currentAction) {
        const progress = Math.min((t - currentAction.start) / currentAction.duration, 1);
        const eased = easeInOutQuad(progress);

        if (currentAction.type === "happy" || currentAction.type === "smile") {
          // Signature EVE happy upward crescent smile (◠ ◠)
          tgtArchL = 1.0;
          tgtArchR = 1.0;
          tgtTiltL = 0.18;
          tgtTiltR = -0.18;
          tgtScaleXL = 1.12;
          tgtScaleXR = 1.12;
          tgtScaleYL = 1.22;
          tgtScaleYR = 1.22;
          tgtGlow = 1.45;
          headGroup.rotation.z = Math.sin(progress * Math.PI * 4) * 0.12;
          headGroup.position.y = 1.56 + Math.abs(Math.sin(progress * Math.PI * 4)) * 0.03;
          armL.rotation.z = Math.sin(progress * Math.PI * 4) * 0.18;
          armR.rotation.z = -Math.sin(progress * Math.PI * 4) * 0.18;
        } else if (currentAction.type === "angry") {
          // Feisty angry / stern glare: furrowed brow slanting inward with fiery red glow
          tgtArchL = -0.45;
          tgtArchR = -0.45;
          tgtTiltL = -0.22;
          tgtTiltR = 0.22; // inverted V angry furrow
          tgtScaleYL = 0.82;
          tgtScaleYR = 0.82;
          tgtScaleXL = 1.18;
          tgtScaleXR = 1.18;
          tgtGlow = 1.6;
          tgtColorMode = "angry";
          headGroup.rotation.y = Math.sin(progress * Math.PI * 14) * 0.10;
          headGroup.rotation.x = 0.12;
          armL.rotation.z = -0.45;
          armR.rotation.z = 0.45;
          armL.rotation.x = -0.25;
          armR.rotation.x = -0.25;
        } else if (currentAction.type === "jealous") {
          // Jealous / envious side-eye pout
          pupil.curX += (0.9 - pupil.curX) * 0.25;
          pupil.curY += (-0.15 - pupil.curY) * 0.25;
          tgtScaleYL = 0.70;
          tgtArchL = -0.3;
          tgtTiltL = 0.05;
          tgtScaleYR = 1.25;
          tgtArchR = 0.4;
          tgtTiltR = -0.28;
          tgtGlow = 1.3;
          headGroup.rotation.y = -0.35 * Math.sin(Math.min(progress * 2, 1) * Math.PI * 0.5);
          headGroup.rotation.z = -0.15 * Math.sin(Math.min(progress * 2, 1) * Math.PI * 0.5);
          armR.rotation.x = -0.35;
          armR.rotation.y = -0.25;
        } else if (currentAction.type === "love") {
          // Romantic / affectionate warm gaze
          tgtArchL = 0.5;
          tgtArchR = 0.5;
          tgtScaleXL = 1.2;
          tgtScaleXR = 1.2;
          tgtScaleYL = 1.25;
          tgtScaleYR = 1.25;
          tgtTiltL = 0.16;
          tgtTiltR = -0.16;
          tgtGlow = 1.5;
          tgtColorMode = "love";
          headGroup.rotation.z = 0.14 * Math.sin(progress * Math.PI);
          headGroup.position.y = 1.56 + Math.sin(progress * Math.PI * 2) * 0.02;
          armL.rotation.x = -0.35 * Math.sin(progress * Math.PI);
          armR.rotation.x = -0.35 * Math.sin(progress * Math.PI);
        } else if (currentAction.type === "shocked") {
          // Shocked / wide surprise (ʘ ʘ)
          tgtArchL = 0.0;
          tgtArchR = 0.0;
          tgtScaleXL = 1.35;
          tgtScaleXR = 1.35;
          tgtScaleYL = 1.45;
          tgtScaleYR = 1.45;
          tgtTiltL = 0.08;
          tgtTiltR = -0.08;
          tgtGlow = 1.65;
          headGroup.position.y = 1.59;
          headGroup.rotation.x = -0.15;
          armL.rotation.x = -0.65;
          armR.rotation.x = -0.65;
        } else if (currentAction.type === "wave") {
          tgtArchL = 0.95;
          tgtArchR = 0.95;
          tgtTiltL = 0.18;
          tgtTiltR = -0.14;
          tgtGlow = 1.35;
          const raise = Math.sin(Math.min(progress * 3, 1) * Math.PI * 0.5);
          armR.rotation.x = -raise * 1.5;
          armR.rotation.z = 0.25 + Math.sin(progress * Math.PI * 8) * 0.3 * raise;
          headGroup.rotation.z = -0.08 * raise;
        } else if (currentAction.type === "spin") {
          tgtArchL = 0.75;
          tgtArchR = 0.75;
          tgtScaleXL = 1.15;
          tgtScaleXR = 1.15;
          tgtTiltL = 0.16;
          tgtTiltR = -0.16;
          tgtGlow = 1.25;
          robot.rotation.y = eased * Math.PI * 2;
          armL.rotation.x = -0.4 * Math.sin(progress * Math.PI);
          armR.rotation.x = -0.4 * Math.sin(progress * Math.PI);
        } else if (currentAction.type === "scan") {
          // EVE's diagnostic holographic scan
          tgtScanLaser = (progress * 3.5) % 1;
          tgtArchL = -0.15;
          tgtArchR = -0.15;
          tgtTiltL = 0.12;
          tgtTiltR = -0.12;
          tgtScaleYL = 0.85;
          tgtScaleYR = 0.85;
          tgtGlow = 1.4;
          scanGroup.visible = true;
          scanCone.material.opacity = 0.28 + Math.sin(t * 15) * 0.12;
          scanRing.position.z = 0.3 + ((progress * 3.6) % 1.6);
          headGroup.rotation.y = Math.sin(progress * Math.PI * 3) * 0.24;
          headGroup.rotation.x = 0.1 + Math.sin(progress * Math.PI * 2) * 0.06;
          armR.rotation.x = -0.58;
          armR.rotation.y = -0.22;
        } else if (currentAction.type === "giggle") {
          // EVE's signature joyful laugh with crescent LED eyes
          tgtArchL = 1.0;
          tgtArchR = 1.0;
          tgtTiltL = 0.18;
          tgtTiltR = -0.18;
          tgtShimmer = 1.0;
          tgtGlow = 1.4;
          headGroup.rotation.z = Math.sin(progress * Math.PI * 10) * 0.14;
          headGroup.position.y = 1.56 + Math.abs(Math.sin(progress * Math.PI * 10)) * 0.035;
          armL.rotation.z = Math.sin(progress * Math.PI * 8) * 0.15;
          armR.rotation.z = -Math.sin(progress * Math.PI * 8) * 0.15;
        } else if (currentAction.type === "hop") {
          tgtArchL = 0.65;
          tgtArchR = 0.65;
          tgtScaleXL = 1.2;
          tgtScaleXR = 1.2;
          tgtScaleYL = 1.35;
          tgtScaleYR = 1.35;
          tgtTiltL = 0.16;
          tgtTiltR = -0.16;
          tgtGlow = 1.35;
          bodyGroup.position.y += Math.abs(Math.sin(progress * Math.PI * 2)) * 0.22;
          armL.rotation.z = -0.25 * Math.sin(progress * Math.PI);
          armR.rotation.z = 0.25 * Math.sin(progress * Math.PI);
        } else if (currentAction.type === "dance") {
          // Dance Move 1: The Cosmic Space Waltz & Pirouette (WALL-E Fire Extinguisher Dance)
          tgtArchL = 1.0;
          tgtArchR = 1.0;
          tgtTiltL = 0.22;
          tgtTiltR = -0.22;
          tgtScaleXL = 1.15;
          tgtScaleXR = 1.15;
          tgtScaleYL = 1.25;
          tgtScaleYR = 1.25;
          tgtShimmer = 0.85;
          tgtGlow = 1.6;

          // Float high in zero-G with graceful figure-8 swoop
          const floatLift = Math.sin(progress * Math.PI) * 0.45;
          const swoopX = Math.sin(progress * Math.PI * 4) * 0.16;
          bodyGroup.position.y += floatLift;
          bodyGroup.position.x += swoopX;

          // Double pirouette spin during mid-flight
          robot.rotation.y = progress * Math.PI * 4;

          // Ballerina banking posture
          bodyGroup.rotation.z = Math.cos(progress * Math.PI * 4) * 0.22;
          bodyGroup.rotation.x = Math.sin(progress * Math.PI * 2) * 0.14;

          // Aerodynamic wings extended like graceful ballerina wings
          armL.rotation.z = -0.45 + Math.sin(progress * Math.PI * 4) * 0.25;
          armR.rotation.z = 0.45 - Math.sin(progress * Math.PI * 4) * 0.25;
          armL.rotation.x = -0.35 * Math.sin(progress * Math.PI);
          armR.rotation.x = -0.35 * Math.sin(progress * Math.PI);
          headGroup.rotation.z = Math.sin(progress * Math.PI * 4) * 0.12;
        } else if (currentAction.type === "groove") {
          // Dance Move 2: Zero-G Beatbox Breakdance & Pop-and-Lock Rhythm
          const beat = progress * Math.PI * 8;
          tgtArchL = 0.85;
          tgtArchR = 0.85;
          tgtTiltL = 0.18 + Math.sin(beat) * 0.08;
          tgtTiltR = -0.18 + Math.sin(beat) * 0.08;
          tgtScaleXL = 1.15 + Math.sin(beat * 2) * 0.08;
          tgtScaleXR = 1.15 + Math.sin(beat * 2) * 0.08;
          tgtScaleYL = 1.25 + Math.cos(beat * 2) * 0.12;
          tgtScaleYR = 1.25 + Math.cos(beat * 2) * 0.12;
          tgtGlow = 1.45 + Math.abs(Math.sin(beat)) * 0.35;
          tgtShimmer = Math.abs(Math.sin(beat)) * 0.9;

          // Punchy rhythmic head-bob on the beat
          headGroup.rotation.x = Math.abs(Math.sin(beat)) * 0.22 - 0.08;
          headGroup.rotation.y = Math.sin(beat * 0.5) * 0.25;
          headGroup.rotation.z = Math.sin(beat * 0.5) * 0.16;

          // Pop-and-lock body groove with side-to-side hip shimmy
          bodyGroup.position.y += Math.abs(Math.sin(beat)) * 0.18;
          bodyGroup.position.x += Math.sin(beat * 0.5) * 0.18;
          bodyGroup.rotation.z = Math.sin(beat * 0.5) * 0.22;
          bodyGroup.rotation.y = Math.sin(beat * 0.25) * 0.35;

          // Alternating robotic arm pumps (switching on the beat)
          armL.rotation.x = -0.7 + Math.sin(beat) * 0.55;
          armR.rotation.x = -0.7 - Math.sin(beat) * 0.55;
          armL.rotation.z = -0.28 - Math.abs(Math.sin(beat)) * 0.25;
          armR.rotation.z = 0.28 + Math.abs(Math.sin(beat)) * 0.25;
        }

        if (progress >= 1) {
          robot.rotation.y = 0;
          bodyGroup.rotation.x = 0;
          bodyGroup.rotation.y = 0;
          bodyGroup.rotation.z = 0;
          bodyGroup.position.x = 0;
          headGroup.position.y = 1.56;
          headGroup.rotation.x = 0;
          headGroup.rotation.y = 0;
          headGroup.rotation.z = 0;
          armR.rotation.x = 0;
          armR.rotation.y = 0;
          armR.rotation.z = 0;
          armL.rotation.x = 0;
          armL.rotation.y = 0;
          armL.rotation.z = 0;
          scanGroup.visible = false;
          currentAction = null;
        }
      } else if (idleEmotion) {
        // Autonomous spontaneous emotions
        if (idleEmotion.type === "dance") {
          const p = (now - idleEmotion.start) / idleEmotion.duration;
          tgtArchL = 1.0;
          tgtArchR = 1.0;
          tgtTiltL = 0.22;
          tgtTiltR = -0.22;
          tgtGlow = 1.5;
          bodyGroup.position.y += Math.sin(p * Math.PI) * 0.28;
          robot.rotation.y = p * Math.PI * 2;
          bodyGroup.rotation.z = Math.cos(p * Math.PI * 2) * 0.15;
          armL.rotation.z = -0.35;
          armR.rotation.z = 0.35;
        } else if (idleEmotion.type === "groove") {
          const beat = ((now - idleEmotion.start) / idleEmotion.duration) * Math.PI * 6;
          tgtArchL = 0.85;
          tgtArchR = 0.85;
          tgtGlow = 1.45 + Math.abs(Math.sin(beat)) * 0.3;
          headGroup.rotation.x = Math.abs(Math.sin(beat)) * 0.15;
          headGroup.rotation.y = Math.sin(beat * 0.5) * 0.2;
          bodyGroup.position.y += Math.abs(Math.sin(beat)) * 0.12;
          armL.rotation.x = -0.6 + Math.sin(beat) * 0.4;
          armR.rotation.x = -0.6 - Math.sin(beat) * 0.4;
        } else if (idleEmotion.type === "wink") {
          tgtOpenR = 0.05;
          tgtArchL = 0.95;
          tgtTiltL = 0.18;
          tgtGlow = 1.3;
        } else if (idleEmotion.type === "curious") {
          tgtTiltR = -0.28;
          tgtTiltL = 0.18;
          tgtScaleYR = 1.25;
          tgtArchR = -0.15;
          tgtArchL = 0.35;
          tgtGlow = 1.25;
          if (!currentAction) headGroup.rotation.z = 0.15;
        } else if (idleEmotion.type === "happy" || idleEmotion.type === "smile") {
          tgtArchL = 0.95;
          tgtArchR = 0.95;
          tgtTiltL = 0.18;
          tgtTiltR = -0.18;
          tgtGlow = 1.4;
        } else if (idleEmotion.type === "angry") {
          tgtArchL = -0.45;
          tgtArchR = -0.45;
          tgtTiltL = -0.22;
          tgtTiltR = 0.22;
          tgtScaleYL = 0.82;
          tgtScaleYR = 0.82;
          tgtGlow = 1.5;
          tgtColorMode = "angry";
          if (!currentAction) headGroup.rotation.x = 0.1;
        } else if (idleEmotion.type === "jealous") {
          pupil.curX += (0.85 - pupil.curX) * 0.2;
          tgtScaleYL = 0.72;
          tgtArchL = -0.25;
          tgtScaleYR = 1.25;
          tgtArchR = 0.35;
          tgtTiltR = -0.25;
          tgtTiltL = 0.08;
          tgtGlow = 1.25;
          if (!currentAction) headGroup.rotation.y = -0.28;
        } else if (idleEmotion.type === "love") {
          tgtArchL = 0.45;
          tgtArchR = 0.45;
          tgtScaleXL = 1.15;
          tgtScaleYL = 1.2;
          tgtTiltL = 0.15;
          tgtTiltR = -0.15;
          tgtGlow = 1.4;
          tgtColorMode = "love";
          if (!currentAction) headGroup.rotation.z = 0.12;
        } else if (idleEmotion.type === "shocked") {
          tgtArchL = 0.0;
          tgtArchR = 0.0;
          tgtScaleXL = 1.3;
          tgtScaleYL = 1.38;
          tgtTiltL = 0.08;
          tgtTiltR = -0.08;
          tgtGlow = 1.55;
        } else if (idleEmotion.type === "giggle") {
          tgtArchL = 1.0;
          tgtArchR = 1.0;
          tgtTiltL = 0.18;
          tgtTiltR = -0.18;
          tgtShimmer = 0.9;
          tgtGlow = 1.35;
        } else if (idleEmotion.type === "scan") {
          const scanProg = (now - idleEmotion.start) / idleEmotion.duration;
          tgtScanLaser = scanProg;
          tgtArchL = -0.1;
          tgtArchR = -0.1;
          tgtTiltL = 0.12;
          tgtTiltR = -0.12;
          tgtScaleYL = 0.88;
          tgtScaleYR = 0.88;
          tgtGlow = 1.35;
        }
      } else if (isCursorClose) {
        tgtArchL = 0.32;
        tgtArchR = 0.32;
        tgtScaleXL = 1.14;
        tgtScaleXR = 1.14;
        tgtScaleYL = 1.18;
        tgtScaleYR = 1.18;
        tgtTiltL = 0.15;
        tgtTiltR = -0.15;
        tgtGlow = 1.25;
      }

      // Butter-smooth morphing between expressions
      eyeAnim.archL += (tgtArchL - eyeAnim.archL) * 0.18;
      eyeAnim.archR += (tgtArchR - eyeAnim.archR) * 0.18;
      eyeAnim.scaleXL += (tgtScaleXL - eyeAnim.scaleXL) * 0.18;
      eyeAnim.scaleXR += (tgtScaleXR - eyeAnim.scaleXR) * 0.18;
      eyeAnim.scaleYL += (tgtScaleYL - eyeAnim.scaleYL) * 0.18;
      eyeAnim.scaleYR += (tgtScaleYR - eyeAnim.scaleYR) * 0.18;
      eyeAnim.tiltL += (tgtTiltL - eyeAnim.tiltL) * 0.16;
      eyeAnim.tiltR += (tgtTiltR - eyeAnim.tiltR) * 0.16;
      eyeAnim.openL += (tgtOpenL - eyeAnim.openL) * 0.32;
      eyeAnim.openR += (tgtOpenR - eyeAnim.openR) * 0.32;
      eyeAnim.pupilXL += (pupil.curX - eyeAnim.pupilXL) * 0.18;
      eyeAnim.pupilXR += (pupil.curX - eyeAnim.pupilXR) * 0.18;
      eyeAnim.pupilYL += (pupil.curY - eyeAnim.pupilYL) * 0.18;
      eyeAnim.pupilYR += (pupil.curY - eyeAnim.pupilYR) * 0.18;
      eyeAnim.shimmer += (tgtShimmer - eyeAnim.shimmer) * 0.22;
      eyeAnim.glowIntensity += (tgtGlow - eyeAnim.glowIntensity) * 0.20;
      eyeAnim.scanLaserY = tgtScanLaser;
      eyeAnim.colorMode = tgtColorMode;

        robotRoot.position.set(drag.x + 88, drag.bottom + 88, 0);
        robotRoot.rotation.set(0, 0, 0);
        drawEveEyes({ t });

        // Continue rendering lingering blue smoke & sparks so they disappear slowly after landing
        stuntDrawFx(dt);
      }

      renderer.render(scene, camera);
    }
    animate();

    // ---- cleanup ----
    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      clearTimeout(speechTimeoutRef.current);
      clearTimeout(returnTimeoutRef.current);
      greetRef.current = null;
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", finishPointer);
      window.removeEventListener("pointercancel", finishPointer);
      window.removeEventListener("resize", onResize);
      hitArea.removeEventListener("pointerdown", onPointerDown);
      hitArea.removeEventListener("dblclick", onDblClick);
      hitArea.removeEventListener("lostpointercapture", finishPointer);
      clearTimeout(singleTapTimeout);
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
      faceTexture.dispose();
      emblemTex.dispose();
      glowTex.dispose();
      starTex.dispose();
      nebulaTex.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <>
      {/* Full-Screen Stunt Flash Overlay */}
      <div
        ref={flashRef}
        id="robot-stunt-flash"
        className="pointer-events-none fixed inset-0 z-50 bg-white opacity-0 transition-opacity duration-150"
      />

      {/* Full-Screen Particle & FX Canvas Overlay */}
      <canvas
        ref={canvasRef}
        id="robot-stunt-fx"
        className="pointer-events-none fixed inset-0 z-40 w-full h-full"
      />

      {/* Full-Screen 3D Three.js WebGL Mount */}
      <div
        ref={mountRef}
        id="robot-three-mount"
        className={`pointer-events-none fixed inset-0 z-40 w-full h-full ${
          isSkillsUniverse ? "hidden md:block" : ""
        }`}
      />

      {/* Main Interactive Companion Shell & Speech Bubble */}
      <div
        ref={shellRef}
        className={`robopet-shell ${isSkillsUniverse ? "hidden md:block" : ""}`}
        style={{
          position: "fixed",
          bottom: HOME_BOTTOM_PX,
          left: 0,
          width: WIDGET_SIZE,
          height: WIDGET_SIZE,
          zIndex: 41,
          pointerEvents: stuntActive ? "none" : "auto",
          opacity: stuntActive ? 0 : 1,
          transition: "opacity 0.2s ease",
          willChange: "transform",
        }}
      >
        {/* Space ambient cosmic glow aura */}
        <div
          className="pointer-events-none absolute inset-0 -z-10 rounded-full"
          style={{
            background: "radial-gradient(circle at 50% 55%, rgba(0, 229, 255, 0.2) 0%, rgba(124, 58, 237, 0.12) 42%, rgba(15, 23, 42, 0) 72%)",
            filter: "blur(14px)",
            transform: "scale(1.18)",
          }}
        />

        {speech && !stuntActive && (
          <div
            role="status"
            aria-live="polite"
            className="bg-[hsl(var(--robopet-bubble))] text-[hsl(var(--robopet-bubble-foreground))] border border-primary shadow-lg"
            style={{
              position: "absolute",
              bottom: "100%",
              left: 0,
              width: "min(175px, calc(100vw - 24px))",
              maxWidth: 175,
              borderRadius: 8,
              padding: "6px 10px",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              lineHeight: 1.35,
              whiteSpace: "normal",
              overflowWrap: "break-word",
              pointerEvents: "none",
            }}
          >
            {speech}
          </div>
        )}

        {/* Transparent interactive hit target for pointer capture & clicks */}
        <div
          ref={hitAreaRef}
          className="w-[140px] h-[155px] sm:w-full sm:h-full"
          style={{ pointerEvents: "auto", cursor: "grab", touchAction: "none" }}
          title="Single-click to react, drag to fly, double-click to see me go crazy! 🚀"
        />
      </div>

      {/* Realistic Background Laboratory Stand in the Robot Standing Area */}
      <div
        className="hidden md:block pointer-events-none select-none transition-opacity duration-300 opacity-70 hover:opacity-85"
        style={{
          position: "fixed",
          bottom: "6px",
          left: "8px",
          width: "250px",
          height: "175px",
          zIndex: 38, // Grounded behind the 3D robot (z-40) and shell (z-41)
        }}
      >
        <svg
          viewBox="0 0 250 175"
          className="w-full h-full overflow-visible"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Realistic Soft Contact Shadow on Floor */}
            <radialGradient id="lab-floor-shadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(0, 0, 0, 0.75)" />
              <stop offset="55%" stopColor="rgba(0, 0, 0, 0.35)" />
              <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
            </radialGradient>

            {/* Cast-Iron Base Shading (Deep matte charcoal with soft directional lighting) */}
            <linearGradient id="lab-base-bevel" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2c3440" />
              <stop offset="25%" stopColor="#1e232b" />
              <stop offset="70%" stopColor="#13171f" />
              <stop offset="100%" stopColor="#0b0e14" />
            </linearGradient>

            <linearGradient id="lab-base-top" x1="30%" y1="0%" x2="70%" y2="100%">
              <stop offset="0%" stopColor="#1a202a" />
              <stop offset="50%" stopColor="#11151c" />
              <stop offset="100%" stopColor="#0a0c10" />
            </linearGradient>

            {/* Realistic Brushed Steel Cylindrical Rod (Soft specular highlight & shadow) */}
            <linearGradient id="lab-steel-rod" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1a212d" />
              <stop offset="35%" stopColor="#475569" />
              <stop offset="60%" stopColor="#94a3b8" />
              <stop offset="85%" stopColor="#475569" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>

            {/* Machined Boss-head Clamp Shading */}
            <linearGradient id="lab-clamp-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="50%" stopColor="#283241" />
              <stop offset="100%" stopColor="#151b23" />
            </linearGradient>
          </defs>

          {/* 1. Realistic Floor Contact Shadow */}
          <ellipse cx="88" cy="164" rx="58" ry="10" fill="url(#lab-floor-shadow)" />

          {/* 2. Heavy Round Cast-Iron Lab Base */}
          {/* Base Lower Rim Cylinder */}
          <path
            d="M 34,156 C 34,148 142,148 142,156 L 142,163 C 142,171 34,171 34,163 Z"
            fill="url(#lab-base-bevel)"
          />
          {/* Base Top Circular Plate */}
          <ellipse
            cx="88"
            cy="156"
            rx="54"
            ry="9.5"
            fill="url(#lab-base-top)"
            stroke="#374151"
            strokeWidth="1.2"
          />

          {/* Recessed Stage Concentric Ring & Alignment Notches */}
          <ellipse
            cx="88"
            cy="156"
            rx="42"
            ry="7.2"
            fill="none"
            stroke="#1f2937"
            strokeWidth="1"
          />
          <ellipse
            cx="88"
            cy="156"
            rx="24"
            ry="4.2"
            fill="#080b0f"
            stroke="#1f2937"
            strokeWidth="0.8"
          />

          {/* Small Center Recess (Socket directly below EVE) */}
          <ellipse cx="88" cy="156" rx="6" ry="1.5" fill="#040608" />

          {/* 3. Heavy-Duty Mounting Collar / Base Boss where the curved rod anchors */}
          <ellipse cx="128" cy="153" rx="7" ry="3" fill="#334155" stroke="#1e293b" strokeWidth="0.8" />
          <path d="M 121,148 L 135,148 L 135,153 L 121,153 Z" fill="#1e293b" />
          <ellipse cx="128" cy="148" rx="6.5" ry="2.2" fill="#475569" stroke="#64748b" strokeWidth="0.6" />

          {/* 4. Realistic Curved Steel Lab Stand Rod (Arches behind EVE like a specimen cradle) */}
          {/* Main Curved Steel Armature */}
          <path
            d="M 128,148 C 144,124 142,78 126,50 C 114,32 88,32 68,40"
            fill="none"
            stroke="url(#lab-steel-rod)"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Rear Semicircular Retaining Cradle Ring (holds apparatus in place) */}
          <path
            d="M 64,42 C 74,32 98,32 110,44"
            fill="none"
            stroke="#334155"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          {/* Rubberized End Caps on the cradle */}
          <circle cx="64" cy="42" r="2.2" fill="#0f172a" stroke="#1e293b" strokeWidth="0.8" />
          <circle cx="110" cy="44" r="2.2" fill="#0f172a" stroke="#1e293b" strokeWidth="0.8" />

          {/* 5. Machined Laboratory Boss-Head Clamp (Holding the small notice plate) */}
          <rect x="131" y="93" width="9" height="12" rx="2" fill="url(#lab-clamp-grad)" stroke="#1e293b" strokeWidth="0.8" />
          {/* Clamp Thumbscrew Knob */}
          <line x1="128" y1="99" x2="131" y2="99" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" />
          <ellipse cx="127" cy="99" rx="1.5" ry="3" fill="#94a3b8" />

          {/* Horizontal Extension Bar connecting Clamp to Notice Tag */}
          <line x1="140" y1="99" x2="152" y2="99" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* Small Realistic Lab Notice Plaque Clamped to the Stand */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          onStuntTrigger();
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          onStuntTrigger();
        }}
        className="hidden md:block group select-none cursor-pointer transition-all duration-200 pointer-events-auto opacity-75 hover:opacity-100"
        style={{
          position: "fixed",
          bottom: "68px",
          left: "148px",
          zIndex: 42, // In front, directly clickable
          filter: "drop-shadow(0 4px 10px rgba(0, 0, 0, 0.6))",
        }}
        title="Double tap to see me go crazy! 🚀"
      >
        {/* Metal Mounting Bracket Joint */}
        <div className="absolute -left-2 top-3 w-2 h-3 bg-slate-600 rounded-l border border-slate-700 pointer-events-none" />

        {/* Small Brushed Metal / Dark Anodized Asset Label */}
        <div className="relative overflow-hidden rounded border border-slate-700/80 bg-slate-900/90 px-2 py-1 shadow-md backdrop-blur-sm transition-all duration-200 group-hover:border-slate-500 group-hover:bg-slate-900/98">
          {/* Tiny Header Label */}
          <div className="flex items-center gap-1 mb-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 opacity-80" />
            <span className="font-mono text-[8px] font-semibold tracking-wider text-slate-400 uppercase">
              LAB SPECIMEN
            </span>
            <span className="ml-auto font-mono text-[7.5px] text-slate-500">
              [EVA]
            </span>
          </div>

          {/* Main Notice Callout */}
          <div className="font-mono text-[10.5px] leading-tight text-slate-200 tracking-tight whitespace-nowrap">
            Double tap to see me{" "}
            <span className="text-slate-100 font-bold underline decoration-slate-400 underline-offset-2">
              go crazy
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

