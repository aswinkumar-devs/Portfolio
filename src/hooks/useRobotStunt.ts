/**
 * ============================================================================
 * useRobotStunt — Autonomous Double-Click "Crash & Magnetic Self-Repair" Hook
 * ============================================================================
 *
 * STATE MACHINE:
 *   idle     -> Normal interactive companion (single click, cursor tracking, idle float).
 *   fly      -> Catmull-Rom spline route across viewport, accelerating into wall/ceiling.
 *               Sheds 3 to 5 random parts mid-air; continuously flakes debris;
 *               sputters with orange sparks in bad phase (last 20%).
 *   fall     -> Wall/ceiling crash! Burst of sparks, smoke, debris, screen shake & flash.
 *               Remaining parts scatter; body rebounds & bounces on floor until resting.
 *   dead     -> Lies dead for ~1.8s. Dim/flickering eyes, smoke wisps, loose spark twitches.
 *               Thruster flame completely disabled.
 *   repair   -> Magnetic self-repair! Body levitates ~120px above floor, eases upright.
 *               Contracting cyan magnetic rings pulse every ~0.18s. Loose parts launch
 *               staggered (0.17s apart) with random spin and are pulled to their sockets
 *               along orbital swirl spring-damper paths with jittery cyan magnetic tethers.
 *               Snap bursts with 3px body bump. Debris absorbed. Failsafe at 5s.
 *   reboot   -> Eyes flash in high-speed on/off boot sequence for ~0.8s, flame reignites.
 *   fly(ret) -> Takes off from repair site, flies fresh spline back to home docking pad.
 *               Lands softly upright, restores idle companion behavior and speech.
 *
 * TUNABLE CONSTANTS:
 *   - DOUBLE_CLICK_WINDOW_MS: 350ms (double-tap threshold)
 *   - GRAVITY_PARTS:          1500 px/s^2 (downward acceleration for falling parts)
 *   - GRAVITY_BODY:           1500 px/s^2 (downward acceleration for rebounding body)
 *   - GRAVITY_DEBRIS:         1300 px/s^2 (downward acceleration for tiny flakes)
 *   - RESTITUTION_PARTS:      0.35 (bounce elasticity for parts)
 *   - RESTITUTION_BODY:       0.38 (bounce elasticity for body)
 *   - RESTITUTION_DEBRIS:     0.30 (bounce elasticity for debris bits)
 *   - DAMPING_HORIZ_PARTS:    0.70, DAMPING_SPIN_PARTS: 0.50
 *   - DAMPING_HORIZ_BODY:     0.70, DAMPING_SPIN_BODY: 0.60
 *   - SPRING_K_START:         40, SPRING_K_END: 460 (magnetic attraction ramp over 0.9s)
 *   - DEAD_DURATION_S:        1.8s (motionless duration before repair)
 *   - REBOOT_DURATION_S:      0.8s (eye blink sequence before return flight)
 *   - MAX_PARTICLES:          400 (cap on additive particles)
 *   - MAX_DEBRIS_BITS:        220 (cap on physical loose debris flakes)
 * ============================================================================
 */

import { useCallback, useEffect, useRef, useState } from "react";

const D = 180 / Math.PI;
const R = (a: number, b: number) => a + Math.random() * (b - a);
const cl = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export type StuntState = "idle" | "fly" | "fall" | "dead" | "repair" | "reboot";

// Sockets and contact radii for EVE robot parts relative to body core center (0, 0)
// in screen coordinates (x right, y down)
export const PART_META: Record<string, { cx: number; cy: number; r: number }> = {
  antenna: { cx: 0, cy: -55, r: 8 },
  head: { cx: 0, cy: -24, r: 24 },
  earL: { cx: -24, cy: -24, r: 6 },
  earR: { cx: 24, cy: -24, r: 6 },
  armL: { cx: -31, cy: 14, r: 16 },
  armR: { cx: 31, cy: 14, r: 16 },
  chest: { cx: -10, cy: 8, r: 9 },
  thruster: { cx: 0, cy: 54, r: 14 },
};

export interface StuntPart {
  n: string;
  cx: number;
  cy: number;
  r: number;
  att: boolean;
  mode: "att" | "free" | "rest" | "mag";
  x: number;
  y: number;
  rot: number;
  vx: number;
  vy: number;
  vr: number;
  tm: number;
  d: number;
}

export interface Particle {
  k: "t" | "p" | "m" | "r"; // t: thruster trail, p: spark line, m: smoke puff, r: contracting ring
  x: number;
  y: number;
  vx: number;
  vy: number;
  l: number;
  m: number;
  s: number;
  r?: number;
  vr?: number;
  g?: number;
  c?: string;
}

export interface DebrisBit {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  vr: number;
  s: number;
  c: string;
  rest: boolean;
  mag: boolean;
  d: number;
}

// Template drawn routes in 804x541 coordinate space
const TA: [number, number][] = [
  [100, 505], [165, 490], [210, 445], [250, 415], [320, 396], [450, 395],
  [520, 388], [580, 380], [620, 362], [670, 330], [720, 285], [770, 230], [800, 200],
];
const TB: [number, number][] = [
  [35, 440], [16, 320], [34, 225], [85, 185], [130, 160], [165, 132], [200, 112],
  [245, 93], [300, 73], [360, 66], [420, 62], [460, 68], [500, 90], [512, 115],
  [500, 140], [440, 142], [425, 120], [440, 88], [470, 78], [540, 77], [590, 85],
  [650, 110], [710, 145], [760, 175], [800, 200],
];

// Catmull-Rom spline evaluator with cumulative arc-length and continuous unwrapped tangent angles
export function buildSpline(points: [number, number][]) {
  const S: [number, number][] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, points.length - 1)];
    for (let k = 0; k < 24; k++) {
      const t = k / 24;
      const t2 = t * t;
      const t3 = t2 * t;
      S.push([
        0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
      ]);
    }
  }
  S.push([...points[points.length - 1]]);
  const L = [0];
  const a: number[] = [];
  let pv = 0;
  for (let i = 1; i < S.length; i++) {
    L[i] = L[i - 1] + Math.hypot(S[i][0] - S[i - 1][0], S[i][1] - S[i - 1][1]);
  }
  for (let i = 0; i < S.length; i++) {
    const j = Math.min(i + 1, S.length - 1);
    const h = Math.max(i - 1, 0);
    let g = Math.atan2(S[j][1] - S[h][1], S[j][0] - S[h][0]);
    if (i) {
      while (g - pv > Math.PI) g -= 2 * Math.PI;
      while (g - pv < -Math.PI) g += 2 * Math.PI;
    }
    a[i] = pv = g;
  }
  return { S, L, a, len: L[L.length - 1] };
}

export function atSpline(path: ReturnType<typeof buildSpline>, dist: number) {
  let lo = 0;
  let hi = path.L.length - 1;
  while (hi - lo > 1) {
    const m = (lo + hi) >> 1;
    path.L[m] < dist ? (lo = m) : (hi = m);
  }
  const f = cl((dist - path.L[lo]) / ((path.L[hi] - path.L[lo]) || 1), 0, 1);
  return {
    x: path.S[lo][0] + (path.S[hi][0] - path.S[lo][0]) * f,
    y: path.S[lo][1] + (path.S[hi][1] - path.S[lo][1]) * f,
    g: path.a[lo] + (path.a[hi] - path.a[lo]) * f,
  };
}

const BIT_COLORS = ["#ffffff", "#e2e8f0", "#94a3b8", "#00e5ff", "#38bdf8"];

// Pre-render soft circular smoke / thruster puff sprite once for zero-allocation blitting
function createSmokeSpriteCanvas(): HTMLCanvasElement | null {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 64;
  const ctx = c.getContext("2d");
  if (ctx) {
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, "rgba(220, 250, 255, 1)");
    grad.addColorStop(0.3, "rgba(0, 229, 255, 0.85)");
    grad.addColorStop(0.7, "rgba(0, 140, 255, 0.35)");
    grad.addColorStop(1, "rgba(0, 100, 255, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
  }
  return c;
}

function createGraySmokeSpriteCanvas(): HTMLCanvasElement | null {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 64;
  const ctx = c.getContext("2d");
  if (ctx) {
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, "rgba(180, 190, 200, 0.7)");
    grad.addColorStop(0.4, "rgba(120, 130, 140, 0.4)");
    grad.addColorStop(1, "rgba(80, 90, 100, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
  }
  return c;
}

const smokeSprite = typeof document !== "undefined" ? createSmokeSpriteCanvas() : null;
const graySmokeSprite = typeof document !== "undefined" ? createGraySmokeSpriteCanvas() : null;

export function useRobotStunt(onReturnToIdle?: () => void) {
  const [stuntActive, setStuntActive] = useState(false);
  const [stuntState, setStuntState] = useState<StuntState>("idle");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const flashRef = useRef<HTMLDivElement | null>(null);

  const stateRef = useRef({
    st: "idle" as StuntState,
    kind: "crash" as "crash" | "return",
    t: 0,
    T: 0,
    path: null as ReturnType<typeof buildSpline> | null,
    dur: 3.5,
    norm: [-1, 0] as [number, number],
    plan: [] as { n: string; u: number }[],
    pos: { x: 88, y: 0 },
    vel: { x: 0, y: 0 },
    rot: 0,
    av: 0,
    shake: 0,
    rest: 0,
    bump: 0,
    bx: 0,
    by: 0,
    ring: 0,
    lastMode: -1,
    W: typeof window !== "undefined" ? window.innerWidth : 1200,
    H: typeof window !== "undefined" ? window.innerHeight : 800,
    homePos: { x: 88, y: 700 },
  });

  const partsRef = useRef<StuntPart[]>(
    Object.entries(PART_META).map(([n, { cx, cy, r }]) => ({
      n,
      cx,
      cy,
      r,
      att: true,
      mode: "att",
      x: 0,
      y: 0,
      rot: 0,
      vx: 0,
      vy: 0,
      vr: 0,
      tm: 0,
      d: 0,
    }))
  );

  const particlesRef = useRef<Particle[]>([]);
  const bitsRef = useRef<DebrisBit[]>([]);
  const lastNozzleRef = useRef<{ x: number; y: number } | null>(null);
  const wasCanvasDirtyRef = useRef(false);
  const stageElRef = useRef<HTMLElement | null>(null);

  // Exact nozzle transform calculation in screen-pixel coordinates (matching Three.js robotRoot & bodyGroup transform)
  const getThrusterTransform = useCallback(() => {
    const s = stateRef.current;
    const rad = (s.rot * Math.PI) / 180;
    const sin = Math.sin(rad);
    const cos = Math.cos(rad);

    // In Three.js:
    // robotRoot is at (s.pos.x + s.bx, H - (s.pos.y + s.by))
    // flameGroup nozzle is at (0, 0.36 * 65 - 1.2 * 65) = (0, -54.6px) relative to robotRoot
    // Rotated around Z by -s.rot:
    const nozzleDist = 54.6;
    const x = s.pos.x + s.bx - nozzleDist * sin;
    const y = s.pos.y + s.by + nozzleDist * cos;

    // Unit vector pointing backwards out of the nozzle into exhaust
    const dirX = -sin;
    const dirY = cos;

    // Unit vector perpendicular across the nozzle rim
    const perpX = cos;
    const perpY = sin;

    return { x, y, dirX, dirY, perpX, perpY };
  }, []);

  // Socket transform calculation
  const getSock = useCallback((p: StuntPart) => {
    const s = stateRef.current;
    const r = s.rot / D;
    const c = Math.cos(r);
    const sn = Math.sin(r);
    return {
      x: s.pos.x + s.bx + p.cx * c - p.cy * sn,
      y: s.pos.y + s.by + p.cx * sn + p.cy * c,
    };
  }, []);

  const emitParticle = useCallback((p: Partial<Particle> & { k: Particle["k"] }) => {
    const ps = particlesRef.current;
    const item: Particle = {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      l: 0,
      m: 1,
      s: 3,
      r: 0,
      vr: 0,
      g: 0,
      ...p,
    };
    if (ps.length >= 400) {
      ps[0] = item;
      return;
    }
    ps.push(item);
  }, []);

  const sprayBits = useCallback((x: number, y: number, n: number, vx: number, vy: number, sp: number) => {
    const bits = bitsRef.current;
    for (let i = 0; i < n; i++) {
      const bit: DebrisBit = {
        x,
        y,
        vx: vx + R(-sp, sp),
        vy: vy + R(-sp, sp),
        r: R(0, 360),
        vr: R(-720, 720),
        s: R(1.8, 4.2),
        c: BIT_COLORS[Math.floor(Math.random() * BIT_COLORS.length)],
        rest: false,
        mag: false,
        d: 0,
      };
      if (bits.length >= 220) {
        bits[0] = bit;
      } else {
        bits.push(bit);
      }
    }
  }, []);

  const emitSparks = useCallback((x: number, y: number, n: number, v = 300, c = "255,190,80") => {
    for (let i = 0; i < n; i++) {
      const a = R(0, 6.28);
      const s = R(60, v);
      emitParticle({
        k: "p",
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        g: 700,
        m: R(0.2, 0.7),
        c,
      });
    }
  }, [emitParticle]);

  const detachPart = useCallback((p: StuntPart, v: [number, number]) => {
    const s = stateRef.current;
    const sk = getSock(p);
    p.x = sk.x;
    p.y = sk.y;
    p.rot = s.rot;
    p.att = false;
    p.mode = "free";
    p.vx = v[0];
    p.vy = v[1];
    p.vr = R(-600, 600);
    emitSparks(sk.x, sk.y, 8, 260);
    sprayBits(sk.x, sk.y, 6, v[0] * 0.4, v[1] * 0.4, 90);
    for (let i = 0; i < 2; i++) {
      emitParticle({
        k: "m",
        x: sk.x,
        y: sk.y,
        vx: R(-20, 20),
        vy: R(-50, -10),
        m: R(0.8, 1.4),
        s: R(8, 14),
      });
    }
  }, [getSock, emitSparks, sprayBits, emitParticle]);

  // Route generators
  const generateCrashRoute = useCallback((f: { x: number; y: number }) => {
    const s = stateRef.current;
    const choices = [0, 1, 2].filter((v) => v !== s.lastMode);
    const m = choices[Math.floor(Math.random() * choices.length)];
    s.lastMode = m;
    const mir = f.x > s.W * 0.55;
    const P: [number, number][] = [[f.x, f.y]];
    let norm: [number, number] = [-1, 0];

    if (m === 2) {
      // Swoop into ceiling
      const xe = R(0.3, 0.85) * s.W;
      P.push(
        [R(0.2, 0.45) * s.W, R(0.6, 0.85) * s.H],
        [R(0.45, 0.7) * s.W, R(0.3, 0.5) * s.H],
        [xe + R(-0.08, 0.08) * s.W, 0.22 * s.H],
        [xe, 50]
      );
      norm = [0, 1];
    } else {
      const T = m === 1 ? TB : TA;
      const dy = R(-0.15, 0.25) * s.H;
      T.forEach(([x, y], i) => {
        const fx = x / 804 + (i && i < T.length - 1 ? R(-0.02, 0.02) : 0);
        const fy = (y / 541) * s.H + (dy * i) / T.length;
        P.push([(mir ? 1 - fx : fx) * s.W, cl(fy, 70, s.H - 90)]);
      });
      P[P.length - 1][0] = mir ? 46 : s.W - 46;
      norm = [mir ? 1 : -1, 0];
    }
    return { path: buildSpline(P), norm };
  }, []);

  const generateReturnRoute = useCallback((f: { x: number; y: number }) => {
    const s = stateRef.current;
    const P: [number, number][] = [
      [f.x, f.y],
      [R(0.15, 0.85) * s.W, R(0.08, 0.35) * s.H],
      [R(0.1, 0.6) * s.W, R(0.3, 0.6) * s.H],
      [s.homePos.x, s.homePos.y],
    ];
    return buildSpline(P);
  }, []);

  const startRepair = useCallback(() => {
    const s = stateRef.current;
    s.rot = ((s.rot % 360) + 540) % 360 - 180;
    s.av = 0;
    s.vel = { x: 0, y: 0 };
    s.t = 0;
    s.ring = 0;
    s.st = "repair";
    setStuntState("repair");

    const detached = partsRef.current.filter((p) => !p.att);
    // Head always launches first so antenna and ears have their docking socket
    const headPart = detached.find((p) => p.n === "head");
    const otherParts = detached.filter((p) => p.n !== "head").sort(() => Math.random() - 0.5);
    const launchOrder = headPart ? [headPart, ...otherParts] : otherParts;
    launchOrder.forEach((p, i) => {
      p.d = 0.35 + i * 0.20;
    });

    bitsRef.current.forEach((b) => {
      b.mag = false;
      b.rest = true;
      b.d = 0.7 + R(0, 1.4);
    });
  }, []);

  const takeoffHome = useCallback(() => {
    const s = stateRef.current;
    s.path = generateReturnRoute({ x: s.pos.x, y: s.pos.y });
    s.dur = cl(s.path.len / (s.W * 0.3), 2.4, 5.0);
    s.kind = "return";
    s.t = 0;
    s.st = "fly";
    setStuntState("fly");
  }, [generateReturnRoute]);

  const triggerLaunch = useCallback((currentPos?: { x: number; y: number }) => {
    const s = stateRef.current;
    if (s.st !== "idle") return;

    if (currentPos) {
      s.pos.x = currentPos.x;
      s.pos.y = currentPos.y;
    }

    // Check prefers-reduced-motion: if set, do short shake + repair
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setStuntActive(true);
      s.st = "dead";
      s.t = 1.0;
      setStuntState("dead");
      return;
    }

    const { path, norm } = generateCrashRoute({ x: s.pos.x, y: s.pos.y });
    s.path = path;
    s.norm = norm;
    s.dur = cl(path.len / (s.W * 0.36), 2.6, 6.5);
    s.kind = "crash";
    s.t = 0;
    s.st = "fly";
    setStuntActive(true);
    setStuntState("fly");

    // Pick 3 to 5 random parts to break off mid-flight
    const candidateNames = ["antenna", "earL", "earR", "armL", "armR", "chest"];
    const shuffledNames = candidateNames.sort(() => Math.random() - 0.5);
    const count = 3 + Math.floor(Math.random() * 3);
    s.plan = shuffledNames
      .slice(0, count)
      .map((n) => ({ n, u: R(0.2, 0.88) }))
      .sort((a, b) => a.u - b.u);
  }, [generateCrashRoute]);

  const snapPart = useCallback((p: StuntPart) => {
    p.att = true;
    p.mode = "att";
    emitSparks(p.x, p.y, 10, 200, "0,229,255");
    stateRef.current.bump = 1;
  }, [emitSparks]);

  const freePhys = useCallback((p: StuntPart, dt: number) => {
    const s = stateRef.current;
    p.vy += 1500 * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.rot += p.vr * dt;
    const fy = s.H - p.r;
    if (p.x < p.r || p.x > s.W - p.r) {
      p.x = cl(p.x, p.r, s.W - p.r);
      p.vx *= -0.5;
    }
    if (p.y < p.r) {
      p.y = p.r;
      p.vy = Math.abs(p.vy) * 0.5;
    }
    if (p.y > fy) {
      p.y = fy;
      if (Math.abs(p.vy) > 90) {
        p.vy *= -0.35;
        p.vx *= 0.7;
        p.vr *= 0.5;
        emitSparks(p.x, p.y + p.r, 4, 200);
      } else {
        p.vy = 0;
        p.vx *= 0.85;
        p.vr *= 0.8;
      }
    }
  }, [emitSparks]);

  const crashImpact = useCallback(() => {
    const s = stateRef.current;
    const upV = [Math.sin(s.rot / D), -Math.cos(s.rot / D)];
    const x = s.pos.x + upV[0] * 60;
    const y = s.pos.y + upV[1] * 60;
    const sp = Math.hypot(s.vel.x, s.vel.y);
    const n = s.norm;

    emitSparks(x, y, 70, 560);
    for (let i = 0; i < 14; i++) {
      emitParticle({
        k: "m",
        x: x + R(-20, 20),
        y: y + R(-20, 20),
        vx: R(-40, 40),
        vy: R(-80, -20),
        m: R(1, 2),
        s: R(14, 26),
      });
    }
    sprayBits(x, y, 60, n[0] * 200, n[1] * 200 - 100, 380);

    // Remaining parts scatter outward
    const detachProb: Record<string, number> = { head: 0.7, thruster: 0.8, chest: 0.6 };
    partsRef.current.forEach((p) => {
      if (p.att && Math.random() < (detachProb[p.n] ?? 1.0)) {
        detachPart(p, [n[0] * R(80, 400) + R(-200, 200), n[1] * R(80, 400) - R(100, 300)]);
      }
    });

    s.vel = { x: n[0] * sp * 0.2 + R(-40, 40), y: n[1] * sp * 0.2 - sp * 0.08 };
    s.av = (Math.random() < 0.5 ? -1 : 1) * R(220, 420);
    s.shake = 1;
    if (flashRef.current) flashRef.current.style.opacity = "0.7";
    s.st = "fall";
    setStuntState("fall");
  }, [emitSparks, emitParticle, sprayBits, detachPart]);

  // Main simulation step called per animation frame
  const step = useCallback((dt: number) => {
    const s = stateRef.current;
    s.T += dt;

    if (s.st === "idle") {
      // Idle posture
      s.pos.x = s.homePos.x;
      s.pos.y = s.homePos.y + Math.sin(s.T * 2) * 5;
      s.rot = Math.sin(s.T * 1.3) * 3;
    } else if (s.st === "fly" && s.path) {
      s.t += dt;
      const u = Math.min(s.t / s.dur, 1);
      const cr = s.kind === "crash";
      const speedU = cr
        ? 0.55 * u * u * (3 - 2 * u) + 0.45 * Math.pow(u, 3)
        : u * u * (3 - 2 * u);
      const q = atSpline(s.path, speedU * s.path.len);
      const bad = cr ? Math.max(0, (u - 0.8) / 0.2) : 0;
      const wobble = (cr ? 4 + 20 * Math.pow(u, 3) : 3) *
        Math.sin(speedU * s.path.len * 0.025 + s.t * 3) *
        (1 - Math.max(0, (u - (cr ? 0.94 : 0.9)) / (cr ? 0.06 : 0.1)));

      const x0 = s.pos.x;
      const y0 = s.pos.y;
      const liftK = Math.min(1, u / 0.14);
      const smoothLift = liftK * liftK * (3 - 2 * liftK);
      const landY = cr ? 0 : Math.max(0, (u - 0.82) / 0.18);

      s.pos.x = q.x - Math.sin(q.g) * wobble;
      s.pos.y = q.y + Math.cos(q.g) * wobble;
      s.rot = (q.g * D + 90) * smoothLift * (1 - landY * landY * (3 - 2 * landY)) +
        Math.sin(s.t * 18) * (2 + 16 * bad);
      s.vel = { x: (s.pos.x - x0) / dt, y: (s.pos.y - y0) / dt };

      const thrusterPart = partsRef.current.find((p) => p.n === "thruster");
      if (thrusterPart && thrusterPart.att) {
        const tf = getThrusterTransform();
        const prev = lastNozzleRef.current;
        const count = 4;

        for (let i = 0; i < count; i++) {
          const frac = count > 1 ? i / (count - 1) : 1;
          // Interpolate between previous nozzle position and current nozzle position
          // so fast flight never leaves gaps or appears detached from the thruster
          const baseX = prev ? prev.x + (tf.x - prev.x) * frac : tf.x;
          const baseY = prev ? prev.y + (tf.y - prev.y) * frac : tf.y;

          // Lateral jitter strictly across the nozzle rim diameter
          const lateral = R(-2.4, 2.4);
          const px = baseX + tf.perpX * lateral;
          const py = baseY + tf.perpY * lateral;

          // Exhaust thrust backwards + slight momentum inertia
          const exhaustSpd = R(55, 120);
          const pvx = tf.dirX * exhaustSpd + s.vel.x * 0.12 + tf.perpX * R(-6, 6);
          const pvy = tf.dirY * exhaustSpd + s.vel.y * 0.12 + tf.perpY * R(-6, 6);

          emitParticle({
            k: "t",
            x: px,
            y: py,
            vx: pvx,
            vy: pvy,
            m: R(0.55, 0.85),
            s: R(5, 8.5),
          });
        }
        lastNozzleRef.current = { x: tf.x, y: tf.y };
      } else {
        lastNozzleRef.current = null;
      }

      if (cr) {
        while (s.plan.length && u >= s.plan[0].u) {
          const nm = s.plan.shift()!.n;
          const p = partsRef.current.find((a) => a.n === nm);
          if (p && p.att) {
            detachPart(p, [s.vel.x * 0.6 + R(-120, 120), s.vel.y * 0.6 - R(0, 160)]);
          }
        }
        if (u > 0.18 && Math.random() < 0.12 + bad * 0.5) {
          sprayBits(s.pos.x + R(-20, 20), s.pos.y + R(-30, 30), 1, s.vel.x * 0.5, s.vel.y * 0.5, 60);
        }
        if (bad) {
          if (Math.random() < 0.35) emitSparks(s.pos.x, s.pos.y, 1, 180);
          if (Math.random() < 0.5) {
            emitParticle({
              k: "m",
              x: s.pos.x,
              y: s.pos.y,
              vx: R(-20, 20),
              vy: R(-40, -10),
              m: R(0.8, 1.4),
              s: R(8, 14),
            });
          }
        }
        if (u >= 1) crashImpact();
      } else if (u >= 1) {
        lastNozzleRef.current = null;

        // Soft touchdown cushion: blue smoke expands outward from base and disappears slowly
        for (let i = 0; i < 14; i++) {
          const angle = (i / 14) * Math.PI * 2 + R(-0.25, 0.25);
          const spd = R(16, 48);
          emitParticle({
            k: "t",
            x: s.homePos.x + R(-8, 8),
            y: s.homePos.y + 48 + R(-3, 3), // right at the base ground contact
            vx: Math.cos(angle) * spd,
            vy: Math.sin(angle) * spd * 0.35 - R(6, 16), // float gently upward
            m: R(1.6, 2.4), // disappears slowly over ~2 seconds!
            s: R(9, 15),
          });
        }

        s.st = "idle";
        setStuntState("idle");
        setStuntActive(false);
        onReturnToIdle?.();
      }
    } else if (s.st === "fall") {
      s.t += dt;
      s.vel.y += 1500 * dt;
      s.pos.x += s.vel.x * dt;
      s.pos.y += s.vel.y * dt;
      s.rot += s.av * dt;

      // Keep body within viewport bounds
      if (s.pos.x < 45) {
        s.pos.x = 45;
        s.vel.x = Math.abs(s.vel.x) * 0.5;
        s.av *= -0.7;
      } else if (s.pos.x > s.W - 45) {
        s.pos.x = s.W - 45;
        s.vel.x = -Math.abs(s.vel.x) * 0.5;
        s.av *= -0.7;
      }

      // Dynamic floor contact based on body orientation
      const rad = Math.abs(s.rot * (Math.PI / 180));
      const effR = Math.sqrt(Math.pow(32 * Math.cos(rad), 2) + Math.pow(58 * Math.sin(rad), 2));
      const fy = s.H - effR;

      if (s.pos.y >= fy) {
        s.pos.y = fy;
        if (Math.abs(s.vel.y) > 120) {
          s.vel.y *= -0.38;
          s.vel.x *= 0.7;
          s.av *= 0.6;
          s.shake = Math.max(s.shake, 0.35);
          emitSparks(s.pos.x, fy + 20, 8, 220);
          sprayBits(s.pos.x, fy + 15, 5, 0, -100, 100);
        } else {
          s.vel.y = 0;
          s.vel.x *= 0.85;
          s.av *= 0.8;
          if (Math.hypot(s.vel.x, s.vel.y) < 15 && Math.abs(s.av) < 15) {
            s.rest += dt;
            if (s.rest > 0.25) {
              s.st = "dead";
              setStuntState("dead");
              s.t = 0;
              s.rest = 0;
            }
          }
        }
      }

      // Failsafe if falling takes longer than 3.5s
      if (s.t > 3.5 && s.pos.y >= fy - 10) {
        s.pos.y = fy;
        s.vel = { x: 0, y: 0 };
        s.av = 0;
        s.st = "dead";
        setStuntState("dead");
        s.t = 0;
        s.rest = 0;
      }
    } else if (s.st === "dead") {
      s.t += dt;
      if (Math.random() < 0.2) {
        emitParticle({
          k: "m",
          x: s.pos.x,
          y: s.pos.y - 10,
          vx: R(-10, 10),
          vy: R(-60, -30),
          m: R(1, 1.8),
          s: R(8, 12),
        });
      }
      if (Math.random() < 0.04) {
        const detached = partsRef.current.find((a) => !a.att && a.mode === "rest");
        if (detached) emitSparks(detached.x, detached.y, 3, 120, "0,229,255");
      }
      if (s.t > 1.8) startRepair();
    } else if (s.st === "repair") {
      s.t += dt;
      const targetY = s.H - 120;
      s.pos.y += (targetY - s.pos.y) * Math.min(1, dt * 3);
      s.rot *= 1 - Math.min(1, dt * 4);

      if ((s.ring += dt) > 0.18) {
        s.ring = 0;
        emitParticle({ k: "r", s: 140, m: 0.7 });
      }

      for (const p of partsRef.current) {
        if (!p.att) {
          if (p.mode !== "mag") {
            if (s.t > p.d) {
              p.mode = "mag";
              p.tm = 0;
              p.vy -= R(260, 420);
              p.vx += R(-120, 120);
              p.vr = R(-400, 400);
            } else {
              freePhys(p, dt);
            }
          } else {
            p.tm += dt;
            const sk = getSock(p);
            const dx = sk.x - p.x;
            const dy = sk.y - p.y;
            const d = Math.hypot(dx, dy) || 1;
            const k = 40 + 420 * Math.min(1, p.tm / 0.9);
            const c = 2 * Math.sqrt(k) * 0.6;
            const tg = (900 * Math.max(0, 1 - p.tm * 1.1)) / d;
            p.vx += (k * dx - c * p.vx - dy * tg) * dt;
            p.vy += (k * dy - c * p.vy + dx * tg) * dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            const dAngle = (((s.rot - p.rot + 540) % 360) - 180);
            p.rot += dAngle * Math.min(1, dt * (6 + p.tm * 10));

            if ((d < 16 && p.tm > 0.25) || p.tm > 2.5) {
              snapPart(p);
            }
          }
        }
      }

      const bits = bitsRef.current;
      for (let i = bits.length - 1; i >= 0; i--) {
        const b = bits[i];
        if (s.t < b.d) continue;
        b.mag = true;
        b.rest = false;
        const dx = s.pos.x - b.x;
        const dy = s.pos.y - b.y;
        const d = Math.hypot(dx, dy) || 1;
        const k = 60 + 300 * Math.min(1, (s.t - b.d) / 0.8);
        b.vx += (k * dx - 2 * Math.sqrt(k) * 0.6 * b.vx) * dt;
        b.vy += (k * dy - 2 * Math.sqrt(k) * 0.6 * b.vy) * dt;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        if (d < 14 || s.t - b.d > 2.5) {
          if (Math.random() < 0.3) emitSparks(b.x, b.y, 2, 120, "0,229,255");
          bits[i] = bits[bits.length - 1];
          bits.pop();
        }
      }

      const allPartsAttached = partsRef.current.every((p) => p.att);
      if (allPartsAttached || s.t > 5.0) {
        partsRef.current.forEach((p) => {
          if (!p.att) snapPart(p);
        });
        bits.length = 0;
        s.st = "reboot";
        setStuntState("reboot");
        s.t = 0;
        emitParticle({ k: "r", s: 200, m: 0.8 });
        if (flashRef.current) flashRef.current.style.opacity = "0.25";
      }
    } else if (s.st === "reboot") {
      s.t += dt;
      if (s.t > 0.8) {
        takeoffHome();
      }
    }

    // Free physics for parts not in mag repair
    for (const p of partsRef.current) {
      if (!p.att && p.mode !== "mag" && s.st !== "repair") {
        if (p.mode === "free") {
          freePhys(p, dt);
          if (Math.abs(p.vy) < 1 && Math.abs(p.vx) < 5 && p.y >= s.H - p.r - 0.5) {
            p.mode = "rest";
          }
        }
      }
    }

    // Bump damping
    s.bump = Math.max(0, s.bump - dt * 5);
    s.bx = R(-1, 1) * s.bump * 3;
    s.by = R(-1, 1) * s.bump * 3;

    // Decay crash shake intensity over time (vibration handled internally by WebGL camera and fx canvas, NEVER mutating DOM <main>)
    if (s.shake > 0) {
      s.shake = Math.max(0, s.shake - dt * 1.6);
      if (s.shake <= 0.01) {
        s.shake = 0;
      }
    }

    // Screen flash decay
    if (flashRef.current) {
      const curOp = parseFloat(flashRef.current.style.opacity || "0");
      flashRef.current.style.opacity = `${Math.max(0, curOp - dt * 2.5)}`;
    }
  }, [
    emitParticle,
    sprayBits,
    emitSparks,
    detachPart,
    crashImpact,
    freePhys,
    getSock,
    snapPart,
    startRepair,
    takeoffHome,
    onReturnToIdle,
  ]);

  // Particle canvas draw (zero-allocation GPU sprite blitting and idle skip)
  const drawFx = useCallback((dt: number) => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const s = stateRef.current;

    const ps = particlesRef.current;
    const bits = bitsRef.current;

    // Early return in idle when no particles or debris exist — completely eliminates full-screen canvas redraws
    if (ps.length === 0 && bits.length === 0 && s.st !== "repair") {
      if (wasCanvasDirtyRef.current) {
        ctx.clearRect(0, 0, s.W, s.H);
        wasCanvasDirtyRef.current = false;
      }
      return;
    }
    wasCanvasDirtyRef.current = true;
    ctx.clearRect(0, 0, s.W, s.H);

    const hasShake = s.shake > 0;
    if (hasShake) {
      ctx.save();
      const m = s.shake * s.shake * 8;
      ctx.translate(R(-m, m), R(-m, m));
    }

    // Jittery cyan magnetic tether lines during self-repair
    if (s.st === "repair") {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = "rgba(0, 229, 255, 0.45)";
      ctx.lineWidth = 1.8;
      for (const p of partsRef.current) {
        if (p.mode === "mag") {
          ctx.beginPath();
          ctx.moveTo(s.pos.x, s.pos.y);
          ctx.lineTo((s.pos.x + p.x) / 2 + R(-9, 9), (s.pos.y + p.y) / 2 + R(-9, 9));
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    // Loose debris bits
    for (let i = bits.length - 1; i >= 0; i--) {
      const b = bits[i];
      if (!b.mag && !b.rest) {
        b.vy += 1300 * dt;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.r += b.vr * dt;
        if (b.y > s.H - b.s) {
          b.y = s.H - b.s;
          b.vy *= -0.3;
          b.vx *= 0.6;
          b.vr *= 0.5;
          if (Math.abs(b.vy) < 35) b.rest = true;
        }
      }
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate((b.r * Math.PI) / 180);
      ctx.fillStyle = b.c;
      ctx.fillRect(-b.s, -b.s * 0.6, b.s * 2, b.s * 1.2);
      ctx.restore();
    }

    // Particles (thruster trail, sparks, smoke, contracting rings)
    for (let i = ps.length - 1; i >= 0; i--) {
      const p = ps[i];
      p.l += dt;
      if (p.l >= p.m) {
        // O(1) swap-and-pop removal
        ps[i] = ps[ps.length - 1];
        ps.pop();
        continue;
      }
      p.vy += (p.g ?? 0) * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.r = (p.r ?? 0) + (p.vr ?? 0) * dt;
      const a = 1 - p.l / p.m;

      if (p.k === "t") {
        // Aerodynamic damping & gentle buoyant float
        p.vx *= Math.pow(0.88, dt * 60);
        p.vy *= Math.pow(0.88, dt * 60);
        p.vy -= 10 * dt;

        const progress = Math.min(Math.max(p.l / p.m, 0), 1);
        const fade = Math.pow(1 - progress, 1.4);
        const alpha = fade * 0.72;
        const currentRadius = p.s * (1 + progress * 2.5);
        const r = Math.max(1, currentRadius);

        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = alpha;
        if (smokeSprite) {
          ctx.drawImage(smokeSprite, p.x - r, p.y - r, r * 2, r * 2);
        }
      } else if (p.k === "p") {
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = 1;
        ctx.strokeStyle = `rgba(${p.c}, ${a})`;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 0.03, p.y - p.vy * 0.03);
        ctx.stroke();
      } else if (p.k === "m") {
        const progress = Math.min(Math.max(p.l / p.m, 0), 1);
        const currentRadius = p.s * (1 + progress * 2.5);
        const r = Math.max(1, currentRadius);

        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = a * 0.38;
        if (graySmokeSprite) {
          ctx.drawImage(graySmokeSprite, p.x - r, p.y - r, r * 2, r * 2);
        }
      } else if (p.k === "r") {
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = 1;
        ctx.strokeStyle = `rgba(0, 229, 255, ${0.75 * Math.sin((Math.PI * p.l) / p.m)})`;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.arc(s.pos.x, s.pos.y, Math.max(12, 18 + p.s * a), 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    if (hasShake) {
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }, []);

  const reset = useCallback(() => {
    const s = stateRef.current;
    s.st = "idle";
    setStuntState("idle");
    setStuntActive(false);
    lastNozzleRef.current = null;
    particlesRef.current.length = 0;
    bitsRef.current.length = 0;
    partsRef.current.forEach((p) => {
      p.att = true;
      p.mode = "att";
    });
    const stageEl = document.querySelector("main") as HTMLElement | null;
    if (stageEl && stageEl.style.transform) stageEl.style.transform = "";
    if (flashRef.current) flashRef.current.style.opacity = "0";
  }, []);

  // Window resize handler
  useEffect(() => {
    function onResize() {
      const s = stateRef.current;
      s.W = window.innerWidth;
      s.H = window.innerHeight;
      s.homePos = { x: 88, y: s.H - 96 };

      const cv = canvasRef.current;
      if (cv) {
        const dpr = window.devicePixelRatio || 1;
        cv.width = s.W * dpr;
        cv.height = s.H * dpr;
        const ctx = cv.getContext("2d");
        if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    }
    window.addEventListener("resize", onResize);
    onResize();
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return {
    stuntActive,
    stuntState,
    triggerLaunch,
    canvasRef,
    flashRef,
    stateRef,
    partsRef,
    step,
    drawFx,
    reset,
  };
}
