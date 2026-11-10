import { useEffect, useRef, useState } from "react";
import { FaJava, FaHtml5, FaJsSquare, FaGitAlt, FaGithub, FaDatabase, FaCode } from "react-icons/fa";
import { SiGo, SiMongodb, SiMysql, SiCss, SiPostman, SiSwagger, SiTailwindcss, SiHibernate } from "react-icons/si";
import { Globe, FileJson, Lock, Cpu, Radio } from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface MultiverseSkill {
  name: string;
  dimension: string;
  role: string;
  category: "Core" | "Backend" | "Database" | "Frontend" | "DevOps";
  icon: React.ElementType;
  color: string;
  accent: string;
}

const NODES: MultiverseSkill[] = [
  { name: "Go", dimension: "EARTH-2099", role: "High-Concurrency Core", category: "Core", icon: SiGo, color: "#00ADD8", accent: "#00f0ff" },
  { name: "Java", dimension: "EARTH-616", role: "Enterprise Prime Canon", category: "Core", icon: FaJava, color: "#f89820", accent: "#fbbf24" },
  { name: "Gin", dimension: "EARTH-1610", role: "Lightning HTTP Router", category: "Backend", icon: Globe, color: "#00ADD8", accent: "#38bdf8" },
  { name: "MongoDB", dimension: "EARTH-928", role: "Nueva York Doc Engine", category: "Database", icon: SiMongodb, color: "#47A248", accent: "#10b981" },
  { name: "MySQL", dimension: "EARTH-65", role: "Gwen's Relational Harmony", category: "Database", icon: SiMysql, color: "#00A6D6", accent: "#06b6d4" },
  { name: "JavaScript", dimension: "EARTH-50101", role: "Dynamic Matrix Flux", category: "Frontend", icon: FaJsSquare, color: "#F7DF1E", accent: "#facc15" },
  { name: "HTML5", dimension: "EARTH-42", role: "Structural Blueprint", category: "Frontend", icon: FaHtml5, color: "#E34F26", accent: "#ff0055" },
  { name: "CSS3", dimension: "EARTH-8311", role: "Visual Style Spectrum", category: "Frontend", icon: SiCss, color: "#1572B6", accent: "#60a5fa" },
  { name: "Git", dimension: "EARTH-801", role: "Timeline Branch Divergence", category: "DevOps", icon: FaGitAlt, color: "#F05032", accent: "#ff0055" },
  { name: "GitHub", dimension: "EARTH-90214", role: "Noir Multiverse Archive", category: "DevOps", icon: FaGithub, color: "#E2E8F0", accent: "#c084fc" },
  { name: "REST API", dimension: "EARTH-138", role: "Spider-Punk Protocol", category: "Backend", icon: FileJson, color: "#38BDF8", accent: "#00f0ff" },
  { name: "JWT", dimension: "EARTH-833", role: "Quantum Auth Shield", category: "Backend", icon: Lock, color: "#F59E0B", accent: "#fbbf24" },
  { name: "SQL", dimension: "EARTH-312500", role: "Direct Relational Queries", category: "Database", icon: FaDatabase, color: "#00758F", accent: "#0284c7" },
  { name: "Postman", dimension: "EARTH-1983", role: "Packet Warp Dispatcher", category: "DevOps", icon: SiPostman, color: "#FF6C37", accent: "#f97316" },
  { name: "Swagger", dimension: "EARTH-2018", role: "Contract Nexus Portal", category: "DevOps", icon: SiSwagger, color: "#85EA2D", accent: "#a3e635" },
  { name: "Tailwind", dimension: "EARTH-2023", role: "Glitch Utility Fabric", category: "Frontend", icon: SiTailwindcss, color: "#06B6D4", accent: "#00f0ff" },
  { name: "Hibernate", dimension: "EARTH-1995", role: "ORM Persistence Anchor", category: "Backend", icon: SiHibernate, color: "#8FA5AC", accent: "#94a3b8" },
  { name: "Goroutines", dimension: "EARTH-199999", role: "Parallel Thread Matrix", category: "Core", icon: Cpu, color: "#A855F7", accent: "#e879f9" },
];

const RADIUS = 230;

// Precomputed Fibonacci sphere positions
const BASE_NODES = NODES.map((n, i) => {
  const k = i + 0.5;
  const phi = Math.acos(1 - (2 * k) / NODES.length);
  const theta = Math.PI * (1 + Math.sqrt(5)) * k;
  return {
    ...n,
    id: i,
    x: Math.cos(theta) * Math.sin(phi),
    y: Math.sin(theta) * Math.sin(phi),
    z: Math.cos(phi),
  };
});

// Precomputed Spider-Verse geodesic web filaments between skill nodes
const PRIMARY_EDGES: [number, number][] = [];
BASE_NODES.forEach((a, i) => {
  const dists = BASE_NODES.map((b, j) => ({
    j,
    d: Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z),
  }))
    .filter((e) => e.j !== i)
    .sort((p, q) => p.d - q.d)
    .slice(0, 3);
  dists.forEach(({ j }) => {
    if (!PRIMARY_EDGES.some(([m, n]) => (m === i && n === j) || (m === j && n === i))) {
      PRIMARY_EDGES.push([i, j]);
    }
  });
});

// Concentric Spider-Verse geometric web rings (Web of Life and Destiny)
const WEB_RING_LATITUDES = [-0.62, 0.0, 0.62];
const WEB_SPOKE_COUNT = 10;
const WEB_RING_POINTS: { x: number; y: number; z: number }[] = [];

WEB_RING_LATITUDES.forEach((lat) => {
  const cosLat = Math.cos(lat);
  const sinLat = Math.sin(lat);
  for (let s = 0; s < WEB_SPOKE_COUNT; s++) {
    const angle = (s / WEB_SPOKE_COUNT) * Math.PI * 2;
    WEB_RING_POINTS.push({
      x: Math.cos(angle) * cosLat,
      y: sinLat,
      z: Math.sin(angle) * cosLat,
    });
  }
});

const SPIDER_NET_LINES: { from: number; to: number; type: "ring" | "spoke" }[] = [];

// Ring lines
WEB_RING_LATITUDES.forEach((_, rIdx) => {
  const start = rIdx * WEB_SPOKE_COUNT;
  for (let s = 0; s < WEB_SPOKE_COUNT; s++) {
    const next = (s + 1) % WEB_SPOKE_COUNT;
    SPIDER_NET_LINES.push({ from: start + s, to: start + next, type: "ring" });
  }
});

// Spoke lines
for (let s = 0; s < WEB_SPOKE_COUNT; s++) {
  SPIDER_NET_LINES.push({ from: s, to: WEB_SPOKE_COUNT + s, type: "spoke" });
  SPIDER_NET_LINES.push({ from: WEB_SPOKE_COUNT + s, to: WEB_SPOKE_COUNT * 2 + s, type: "spoke" });
}

export default function SkillsGlobe() {
  const { resolvedTheme } = useTheme();
  const isBright = resolvedTheme === "light";
  const isBrightRef = useRef(isBright);

  useEffect(() => {
    isBrightRef.current = isBright;
  }, [isBright]);

  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const size = RADIUS * 2 + 140;

  // High performance animation refs (Zero React re-render overhead during 60/120fps rotation)
  const rot = useRef({ x: -0.2, y: 0.45 });
  const vel = useRef({ x: 0, y: 0 });
  const spinDirRef = useRef<-1 | 1>(-1); // -1 = spinning right, 1 = spinning left
  const scaleRef = useRef(1);
  const dimsRef = useRef({ w: size, h: size });
  const hoveredIdxRef = useRef<number | null>(null);
  const shockwavesRef = useRef<{ x: number; y: number; time: number }[]>([]);

  const drag = useRef({
    active: false,
    px: 0,
    py: 0,
    lastX: 0,
    lastY: 0,
    moved: false,
  });

  // Handle responsive scaling & dynamic canvas buffer sizing
  useEffect(() => {
    const element = wrapRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        if (w > 0 && h > 0) {
          dimsRef.current = { w, h };
          const s = Math.min(1.0, w / size);
          scaleRef.current = s;

          const canvas = canvasRef.current;
          if (canvas) {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const bw = Math.round(w * dpr);
            const bh = Math.round(h * dpr);
            if (canvas.width !== bw || canvas.height !== bh) {
              canvas.width = bw;
              canvas.height = bh;
            }
          }
        }
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [size]);

  // High-performance Canvas & DOM animation loop (Locked 60/120 FPS, 0 React VDOM re-renders)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const element = wrapRef.current;
    const initialW = element?.clientWidth || size;
    const initialH = element?.clientHeight || size;
    dimsRef.current = { w: initialW, h: initialH };
    scaleRef.current = Math.min(1.0, initialW / size);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(initialW * dpr);
    canvas.height = Math.round(initialH * dpr);

    // Pre-allocated projection buffers to avoid GC pauses
    const projNodes = BASE_NODES.map(() => ({ px: 0, py: 0, z: 0, scale: 1, opacity: 1 }));
    const projWebPoints = WEB_RING_POINTS.map(() => ({ px: 0, py: 0, z: 0 }));

    let rafId = 0;

    const tick = () => {
      rafId = requestAnimationFrame(tick);
      const now = performance.now();

      // 1. Steady rotation physics
      if (drag.current.active) {
        // Direct tracking handled by pointermove
      } else {
        // Apply inertia smoothly
        rot.current.y += vel.current.y;
        rot.current.x += vel.current.x;
        vel.current.y *= 0.94;
        vel.current.x *= 0.94;

        // Rock-steady, buttery smooth auto-rotation:
        // Slow down when hovering a node to make reading/clicking effortless
        const isHovered = hoveredIdxRef.current !== null;
        const targetAutoSpin = isHovered ? 0.0003 : 0.0022;
        rot.current.y += spinDirRef.current * targetAutoSpin;

        // Steady pitch restoring force
        rot.current.x += (-0.18 - rot.current.x) * 0.025;
      }

      // Clamp vertical pitch to prevent flipping
      rot.current.x = Math.max(-0.95, Math.min(0.95, rot.current.x));

      const rx = rot.current.x;
      const ry = rot.current.y;
      const cosX = Math.cos(rx);
      const sinX = Math.sin(rx);
      const cosY = Math.cos(ry);
      const sinY = Math.sin(ry);
      const currentScale = scaleRef.current;

      // 2. Project 3D nodes
      const isMobile = window.innerWidth < 768;
      const mobileScaleFactor = isMobile ? 0.74 : 1.0;

      for (let i = 0; i < BASE_NODES.length; i++) {
        const n = BASE_NODES[i];
        const x1 = n.x * cosY - n.z * sinY;
        const z1 = n.x * sinY + n.z * cosY;
        const y2 = n.y * cosX - z1 * sinX;
        const z2 = n.y * sinX + z1 * cosX;
        const persp = 1 / (2.05 - z2);
        const pn = projNodes[i];
        pn.px = x1 * RADIUS;
        pn.py = y2 * RADIUS;
        pn.z = z2;
        pn.scale = persp * 1.78 * mobileScaleFactor;
        
        // Depth-based opacity: on mobile, fade out rear nodes so only front-facing nodes are visible without collision
        pn.opacity = isMobile
          ? Math.max(0, Math.min(1, (z2 + 0.15) / 1.15))
          : 0.22 + ((z2 + 1) / 2) * 0.78;

        // Instant GPU position update on DOM node without CSS transition rubber-banding
        const el = nodeRefs.current[i];
        if (el) {
          const isHov = hoveredIdxRef.current === i;
          const s = pn.scale * currentScale * (isHov ? 1.25 : 1);
          const screenX = pn.px * currentScale;
          const screenY = pn.py * currentScale;
          const zIndex = Math.round((pn.z + 1) * 100) + (isHov ? 300 : 0);
          const op = isHov ? 1 : pn.opacity;

          el.style.transform = `translate3d(calc(-50% + ${screenX}px), calc(-50% + ${screenY}px), 0) scale(${s})`;
          el.style.opacity = String(op);
          el.style.zIndex = String(zIndex);
          el.style.pointerEvents = (isMobile ? pn.z > -0.05 : pn.z > -0.6) ? "auto" : "none";
          el.style.visibility = op < 0.04 ? "hidden" : "visible";
        }
      }

      // 3. Project 3D web ring points
      for (let i = 0; i < WEB_RING_POINTS.length; i++) {
        const pt = WEB_RING_POINTS[i];
        const x1 = pt.x * cosY - pt.z * sinY;
        const z1 = pt.x * sinY + pt.z * cosY;
        const y2 = pt.y * cosX - z1 * sinX;
        const z2 = pt.y * sinX + z1 * cosX;
        const pwp = projWebPoints[i];
        pwp.px = x1 * RADIUS * currentScale;
        pwp.py = y2 * RADIUS * currentScale;
        pwp.z = z2;
      }

      // 4. Render Spider-Verse Web on Canvas (Theme-Adaptive)
      const curW = dimsRef.current.w;
      const curH = dimsRef.current.h;
      const cx = curW / 2;
      const cy = curH / 2;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.translate(cx, cy);

      const bright = isBrightRef.current;
      const cyanPrefix = bright ? "rgba(2, 132, 199, " : "rgba(0, 240, 255, ";
      const pinkPrefix = bright ? "rgba(225, 29, 72, " : "rgba(255, 0, 85, ";
      const ringAlphaMult = bright ? 1.6 : 1;

      // (A) Concentric latitude web rings (dashed cyan)
      ctx.lineWidth = bright ? 0.95 : 0.85;
      ctx.setLineDash([4, 4]);
      for (let i = 0; i < SPIDER_NET_LINES.length; i++) {
        const line = SPIDER_NET_LINES[i];
        if (line.type !== "ring") continue;
        const a = projWebPoints[line.from];
        const b = projWebPoints[line.to];
        const avgZ = (a.z + b.z) / 2;
        const alpha = Math.max(0.04, ((avgZ + 1) / 2) * 0.24) * ringAlphaMult;
        ctx.strokeStyle = `${cyanPrefix}${alpha})`;
        ctx.beginPath();
        ctx.moveTo(a.px, a.py);
        ctx.lineTo(b.px, b.py);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // (B) Radial longitudinal spokes (magenta)
      ctx.lineWidth = bright ? 0.75 : 0.65;
      for (let i = 0; i < SPIDER_NET_LINES.length; i++) {
        const line = SPIDER_NET_LINES[i];
        if (line.type !== "spoke") continue;
        const a = projWebPoints[line.from];
        const b = projWebPoints[line.to];
        const avgZ = (a.z + b.z) / 2;
        const alpha = Math.max(0.04, ((avgZ + 1) / 2) * 0.20) * ringAlphaMult;
        ctx.strokeStyle = `${pinkPrefix}${alpha})`;
        ctx.beginPath();
        ctx.moveTo(a.px, a.py);
        ctx.lineTo(b.px, b.py);
        ctx.stroke();
      }

      // (C) Primary Interconnected Geodesic Web Filaments
      const activeHover = hoveredIdxRef.current;
      for (let k = 0; k < PRIMARY_EDGES.length; k++) {
        const [i, j] = PRIMARY_EDGES[k];
        const a = projNodes[i];
        const b = projNodes[j];
        const isConnected = activeHover === i || activeHover === j;
        const avgZ = (a.z + b.z) / 2;
        const depthAlpha = Math.max(0.08, ((avgZ + 1) / 2) * 0.55);

        const aX = a.px * currentScale;
        const aY = a.py * currentScale;
        const bX = b.px * currentScale;
        const bY = b.py * currentScale;

        if (isConnected) {
          // Blooming glow highlight strand
          ctx.lineWidth = 3.5;
          ctx.strokeStyle = bright ? "rgba(225, 29, 72, 0.45)" : "rgba(255, 0, 85, 0.4)";
          ctx.beginPath();
          ctx.moveTo(aX, aY);
          ctx.lineTo(bX, bY);
          ctx.stroke();

          ctx.lineWidth = 1.8;
          ctx.strokeStyle = bright ? "#0284c7" : "#00f0ff";
          ctx.beginPath();
          ctx.moveTo(aX, aY);
          ctx.lineTo(bX, bY);
          ctx.stroke();
        } else {
          ctx.lineWidth = bright ? 1.15 : 1.0;
          ctx.strokeStyle =
            k % 2 === 0
              ? `${cyanPrefix}${depthAlpha * (bright ? 0.95 : 0.75)})`
              : `${pinkPrefix}${depthAlpha * (bright ? 0.95 : 0.75)})`;
          ctx.beginPath();
          ctx.moveTo(aX, aY);
          ctx.lineTo(bX, bY);
          ctx.stroke();
        }
      }

      // (D) Quantum Pulses traveling along web strands
      const t = now * 0.0016;
      for (let k = 0; k < PRIMARY_EDGES.length; k++) {
        const [i, j] = PRIMARY_EDGES[k];
        const a = projNodes[i];
        const b = projNodes[j];
        const prog = (t * 0.65 + k * 0.17) % 1;
        const aX = a.px * currentScale;
        const aY = a.py * currentScale;
        const bX = b.px * currentScale;
        const bY = b.py * currentScale;
        const px = aX + (bX - aX) * prog;
        const py = aY + (bY - aY) * prog;
        const z = a.z + (b.z - a.z) * prog;
        const isConnected = activeHover === i || activeHover === j;
        const pulseAlpha = Math.max(0.12, (z + 1) / 2) * (isConnected ? 1 : 0.8);
        const r = isConnected ? 3.5 : 2.2;

        ctx.fillStyle =
          k % 2 === 0
            ? `${cyanPrefix}${pulseAlpha * (bright ? 1.2 : 1)})`
            : `${pinkPrefix}${pulseAlpha * (bright ? 1.2 : 1)})`;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // (E) Spider-Sense Shockwaves
      for (let s = shockwavesRef.current.length - 1; s >= 0; s--) {
        const sw = shockwavesRef.current[s];
        const age = (now - sw.time) / 900;
        if (age >= 1) {
          shockwavesRef.current.splice(s, 1);
          continue;
        }
        const maxR = RADIUS * currentScale * 1.5;
        const curR = age * maxR;
        const alpha = 1 - age;

        ctx.lineWidth = 2.4 * alpha;
        ctx.strokeStyle = `rgba(0, 240, 255, ${alpha * 0.85})`;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, curR, 0, Math.PI * 2);
        ctx.stroke();

        if (curR > 10) {
          ctx.lineWidth = 1.6 * alpha;
          ctx.strokeStyle = `rgba(255, 0, 85, ${alpha * 0.75})`;
          ctx.beginPath();
          ctx.arc(sw.x, sw.y, curR - 10, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      ctx.restore();
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [size]);

  // Pointer drag and touch interactions
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const down = (cx: number, cy: number) => {
      drag.current = {
        active: true,
        px: cx,
        py: cy,
        lastX: cx,
        lastY: cy,
        moved: false,
      };
      vel.current = { x: 0, y: 0 };
    };

    const move = (cx: number, cy: number) => {
      if (!drag.current.active) return;
      const dx = cx - drag.current.lastX;
      const dy = cy - drag.current.lastY;
      drag.current.lastX = cx;
      drag.current.lastY = cy;

      if (Math.hypot(cx - drag.current.px, cy - drag.current.py) > 4) {
        drag.current.moved = true;
      }

      // Direct instant rotation response: dragging right spins right, dragging up spins up
      rot.current.y -= dx * 0.0045;
      rot.current.x -= dy * 0.0045;
      rot.current.x = Math.max(-0.95, Math.min(0.95, rot.current.x));

      // Inertial momentum release
      vel.current.y = -dx * 0.0035;
      vel.current.x = -dy * 0.0035;

      // Persist the user's intended spin direction into idle auto-rotation
      if (Math.abs(dx) > 0.5) {
        spinDirRef.current = dx > 0 ? -1 : 1;
      }
    };

    const up = (cx: number, cy: number) => {
      if (!drag.current.active) return;
      const moved = drag.current.moved;
      drag.current.active = false;

      // Clicked empty space: trigger Spider-Sense pulse!
      if (!moved) {
        const rect = el.getBoundingClientRect();
        const localX = cx - (rect.left + rect.width / 2);
        const localY = cy - (rect.top + rect.height / 2);
        shockwavesRef.current.push({ x: localX, y: localY, time: performance.now() });
      }
    };

    const onMouseDown = (e: MouseEvent) => down(e.clientX, e.clientY);
    const onMouseMove = (e: MouseEvent) => move(e.clientX, e.clientY);
    const onMouseUp = (e: MouseEvent) => up(e.clientX, e.clientY);

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) down(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (drag.current.active && e.cancelable) e.preventDefault();
      if (e.touches.length > 0) move(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchEnd = (e: TouchEvent) => {
      const touch = e.changedTouches[0];
      if (touch) up(touch.clientX, touch.clientY);
      else drag.current.active = false;
    };

    el.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseup", onMouseUp);

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      el.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  const triggerNodeShockwave = (idx: number) => {
    const el = nodeRefs.current[idx];
    if (!el || !wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const nodeRect = el.getBoundingClientRect();
    const localX = nodeRect.left + nodeRect.width / 2 - (rect.left + rect.width / 2);
    const localY = nodeRect.top + nodeRect.height / 2 - (rect.top + rect.height / 2);
    shockwavesRef.current.push({ x: localX, y: localY, time: performance.now() });
  };

  const activeNode =
    hoveredIdx !== null ? NODES[hoveredIdx] : selectedIdx !== null ? NODES[selectedIdx] : null;

  return (
    <div
      ref={wrapRef}
      className="relative select-none cursor-grab active:cursor-grabbing touch-none flex items-center justify-center overflow-visible"
      style={{
        width: size,
        height: size,
        maxWidth: "min(94vw, 76dvh)",
        maxHeight: "min(94vw, 76dvh)",
        aspectRatio: "1 / 1",
      }}
    >
      {/* Spider-Verse Ambient Quantum Halo in Background */}
      <div
        className="pointer-events-none absolute inset-4 -z-10 rounded-full opacity-60 dark:opacity-80 transition-opacity duration-700"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(255, 0, 85, 0.14) 0%, rgba(0, 240, 255, 0.10) 38%, rgba(124, 58, 237, 0.06) 65%, rgba(0,0,0,0) 80%)",
          filter: "blur(28px)",
        }}
      />

      {/* GPU Canvas for the Spider-Verse Net (Locked 60/120 FPS) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* 3D Floating Skill Nodes as Spider-Verse Earth Portals */}
      <div className="absolute inset-0 pointer-events-none">
        {NODES.map((p, idx) => {
          const Icon = p.icon;
          const isHovered = hoveredIdx === idx;
          const isSelected = selectedIdx === idx;

          return (
            <div
              key={p.name}
              ref={(el) => {
                nodeRefs.current[idx] = el;
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIdx(idx);
                triggerNodeShockwave(idx);
              }}
              onMouseEnter={() => {
                setHoveredIdx(idx);
                hoveredIdxRef.current = idx;
              }}
              onMouseLeave={() => {
                setHoveredIdx((prev) => (prev === idx ? null : prev));
                if (hoveredIdxRef.current === idx) hoveredIdxRef.current = null;
              }}
              className="absolute left-1/2 top-1/2 pointer-events-auto cursor-pointer will-change-transform"
              style={{
                transform: "translate3d(-50%, -50%, 0)",
              }}
              title={`${p.name} • [${p.dimension}]`}
            >
              {/* Spider-Verse Hexagon / Comic Portal Shell (Theme-Adaptive) */}
              <div
                className={`relative flex items-center gap-1.5 sm:gap-2 rounded-xl border px-2 py-1 sm:px-2.5 sm:py-1.5 backdrop-blur-md transition-colors duration-150 ${
                  isHovered || isSelected
                    ? isBright
                      ? "border-[#ff0055] bg-white text-slate-900 shadow-[0_0_20px_rgba(255,0,85,0.4),0_0_35px_rgba(2,132,199,0.3)]"
                      : "border-[#ff0055] bg-slate-950/95 text-white shadow-[0_0_20px_#ff0055,0_0_35px_#00f0ff]"
                    : isBright
                    ? "border-slate-300/80 bg-white/90 text-slate-900 shadow-md hover:border-[#0284c7]"
                    : "border-slate-700/60 bg-slate-950/80 text-white shadow-lg hover:border-[#00f0ff]"
                }`}
                style={{
                  clipPath:
                    "polygon(8% 0%, 92% 0%, 100% 25%, 100% 75%, 92% 100%, 8% 100%, 0% 75%, 0% 25%)",
                }}
              >
                {/* Comic Halftone Glitch Corner Accent */}
                <div
                  className={`absolute top-0 left-0 w-2 h-2 ${
                    isHovered ? "bg-[#ff0055]" : isBright ? "bg-[#0284c7]/50" : "bg-[#00f0ff]/40"
                  }`}
                  style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
                />

                {/* Skill Icon with Chromatic Shadow */}
                <div className="relative flex items-center justify-center">
                  <Icon
                    className="w-4 h-4 sm:w-6 sm:h-6"
                    size={24}
                    style={{
                      color: isHovered ? (isBright ? "#e11d48" : p.accent) : p.color,
                      filter: isHovered
                        ? "drop-shadow(-1.5px 0 0 #00f0ff) drop-shadow(1.5px 0 0 #ff0055)"
                        : `drop-shadow(0 0 6px ${p.accent}55)`,
                    }}
                  />
                </div>

                {/* Node Metadata & Dimension Stamp */}
                <div className="flex flex-col">
                  <span
                    className={`font-mono text-[7px] sm:text-[8px] font-bold tracking-wider sm:tracking-widest uppercase leading-none ${
                      isHovered
                        ? isBright
                          ? "text-[#0284c7]"
                          : "text-[#00f0ff]"
                        : isBright
                        ? "text-slate-500 font-semibold"
                        : "text-slate-400"
                    }`}
                  >
                    {p.dimension}
                  </span>
                  <span
                    className={`font-sans text-[10px] sm:text-[11px] font-extrabold tracking-wide leading-tight ${
                      isBright ? "text-slate-900" : "text-white"
                    }`}
                  >
                    {p.name}
                  </span>
                </div>

                {/* Cyber Corner Notches */}
                <div
                  className={`absolute bottom-0 right-0 w-2 h-2 ${
                    isBright ? "bg-[#0284c7]/50" : "bg-[#00f0ff]/40"
                  }`}
                  style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }}
                />
              </div>

              {/* Spider-Sense Radiating Ripple on Hover */}
              {isHovered && (
                <div
                  className={`pointer-events-none absolute -inset-2 rounded-2xl animate-ping border ${
                    isBright ? "border-[#0284c7]/60" : "border-[#00f0ff]/60"
                  }`}
                  style={{ animationDuration: "1.2s" }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Floating Spider-Verse Timeline Inspector HUD (Bottom Card) */}
      {activeNode && (
        <div
          className={`absolute -bottom-14 sm:-bottom-14 left-1/2 -translate-x-1/2 pointer-events-none z-30 flex items-center gap-2 sm:gap-3 rounded-lg border px-2.5 py-1.5 sm:px-4 sm:py-2 shadow-2xl backdrop-blur-md max-w-[94%] overflow-hidden text-ellipsis ${
            isBright
              ? "border-slate-300 bg-white/95 text-slate-900 shadow-slate-300/60"
              : "border-[#ff0055]/70 bg-slate-950/95 text-white shadow-[0_0_25px_rgba(255,0,85,0.4),0_0_40px_rgba(0,240,255,0.3)]"
          }`}
          style={{
            clipPath:
              "polygon(6px 0%, calc(100% - 6px) 0%, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0% calc(100% - 6px), 0% 6px)",
          }}
        >
          <div className="flex items-center gap-1.5 text-[#ff0055] shrink-0">
            <Radio size={13} className="animate-pulse" />
            <span className="font-mono text-[8.5px] sm:text-[9px] font-bold tracking-wider sm:tracking-widest uppercase">
              {activeNode.dimension}
            </span>
          </div>
          <span className={`h-3 w-px shrink-0 ${isBright ? "bg-slate-300" : "bg-slate-700"}`} />
          <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
            <span className={`font-sans text-xs font-bold truncate ${isBright ? "text-slate-900" : "text-white"}`}>
              {activeNode.name}
            </span>
            <span className={`font-mono text-[9px] sm:text-[10px] truncate ${isBright ? "text-[#0284c7] font-semibold" : "text-[#00f0ff]"}`}>
              // {activeNode.role}
            </span>
          </div>
          <span
            className={`ml-1 shrink-0 inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[8px] sm:text-[8.5px] font-semibold uppercase border ${
              isBright
                ? "bg-[#ff0055]/10 text-[#e11d48] border-[#ff0055]/30"
                : "bg-[#ff0055]/20 text-[#ff0055] border-[#ff0055]/40"
            }`}
          >
            {activeNode.category}
          </span>
        </div>
      )}
    </div>
  );
}
