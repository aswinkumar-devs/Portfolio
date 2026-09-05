import { useEffect, useRef, useState } from "react";
import { FaJava, FaHtml5, FaJsSquare, FaGitAlt, FaGithub, FaDatabase } from "react-icons/fa";
import { SiGo, SiMongodb, SiMysql, SiCss, SiPostman, SiSwagger, SiTailwindcss, SiHibernate } from "react-icons/si";
import { Globe, FileJson, Lock, Cpu } from "lucide-react";

type Node = { name: string; icon: React.ElementType; color: string };

const NODES: Node[] = [
  { name: "Go", icon: SiGo, color: "#00ADD8" },
  { name: "Java", icon: FaJava, color: "#f89820" },
  { name: "Gin", icon: Globe, color: "#00ADD8" },
  { name: "MongoDB", icon: SiMongodb, color: "#47A248" },
  { name: "MySQL", icon: SiMysql, color: "#00A6D6" },
  { name: "JavaScript", icon: FaJsSquare, color: "#F7DF1E" },
  { name: "HTML", icon: FaHtml5, color: "#E34F26" },
  { name: "CSS", icon: SiCss, color: "#1572B6" },
  { name: "Git", icon: FaGitAlt, color: "#F05032" },
  { name: "GitHub", icon: FaGithub, color: "#9BA3AF" },
  { name: "REST", icon: FileJson, color: "#38BDF8" },
  { name: "JWT", icon: Lock, color: "#F59E0B" },
  { name: "SQL", icon: FaDatabase, color: "#00758F" },
  { name: "Postman", icon: SiPostman, color: "#FF6C37" },
  { name: "Swagger", icon: SiSwagger, color: "#85EA2D" },
  { name: "Tailwind", icon: SiTailwindcss, color: "#06B6D4" },
  { name: "Hibernate", icon: SiHibernate, color: "#8FA5AC" },
  { name: "Goroutines", icon: Cpu, color: "#00ADD8" },
];

// Fibonacci sphere distribution
const BASE = NODES.map((n, i) => {
  const k = i + 0.5;
  const phi = Math.acos(1 - (2 * k) / NODES.length);
  const theta = Math.PI * (1 + Math.sqrt(5)) * k;
  return {
    ...n,
    x: Math.cos(theta) * Math.sin(phi),
    y: Math.sin(theta) * Math.sin(phi),
    z: Math.cos(phi),
  };
});

// Precompute neighbour edges (geodesic-ish wireframe)
const EDGES: [number, number][] = [];
BASE.forEach((a, i) => {
  const dists = BASE.map((b, j) => ({
    j,
    d: Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z),
  }))
    .filter((e) => e.j !== i)
    .sort((p, q) => p.d - q.d)
    .slice(0, 3);
  dists.forEach(({ j }) => {
    if (!EDGES.some(([m, n]) => (m === i && n === j) || (m === j && n === i))) EDGES.push([i, j]);
  });
});

const RADIUS = 230;

const SkillsGlobe = () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const rot = useRef({ x: -0.25, y: 0.4 });
  const vel = useRef({ x: 0, y: 0.0035 });
  const drag = useRef<{ active: boolean; px: number; py: number }>({ active: false, px: 0, py: 0 });
  const [, force] = useState(0);
  const frame = useRef(0);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!drag.current.active) {
        vel.current.x *= 0.972;
        vel.current.y *= 0.972;
        // never fully stop: gentle idle spin
        if (Math.abs(vel.current.y) < 0.003) vel.current.y += vel.current.y >= 0 ? 0.0002 : -0.0002;
      }
      rot.current.x += vel.current.x;
      rot.current.y += vel.current.y;
      rot.current.x = Math.max(-1.2, Math.min(1.2, rot.current.x));
      frame.current++;
      force((f) => f + 1);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const down = (cx: number, cy: number) => {
      drag.current = { active: true, px: cx, py: cy };
    };
    const move = (cx: number, cy: number) => {
      if (!drag.current.active) return;
      const dx = cx - drag.current.px;
      const dy = cy - drag.current.py;
      drag.current.px = cx;
      drag.current.py = cy;
      vel.current.y = -dx * 0.0012;
      vel.current.x = dy * 0.0012;
    };
    const hover = (cx: number, cy: number) => {
      if (drag.current.active) return;
      const el = wrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const nx = (cx - (r.left + r.width / 2)) / (r.width / 2);
      const ny = (cy - (r.top + r.height / 2)) / (r.height / 2);
      if (Math.abs(nx) > 1.6 || Math.abs(ny) > 1.6) return;
      vel.current.y += (-nx * 0.012 - vel.current.y) * 0.08;
      vel.current.x += (ny * 0.009 - vel.current.x) * 0.08;
    };
    const up = () => {
      drag.current.active = false;
    };

    const el = wrapRef.current;
    if (!el) return;
    const md = (e: MouseEvent) => down(e.clientX, e.clientY);
    const mm = (e: MouseEvent) => {
      move(e.clientX, e.clientY);
      hover(e.clientX, e.clientY);
    };
    const ts = (e: TouchEvent) => down(e.touches[0].clientX, e.touches[0].clientY);
    const tm = (e: TouchEvent) => {
      if (drag.current.active) e.preventDefault();
      move(e.touches[0].clientX, e.touches[0].clientY);
    };
    el.addEventListener("mousedown", md);
    window.addEventListener("mousemove", mm);
    window.addEventListener("mouseup", up);
    el.addEventListener("touchstart", ts, { passive: true });
    window.addEventListener("touchmove", tm, { passive: false });
    window.addEventListener("touchend", up);
    return () => {
      el.removeEventListener("mousedown", md);
      window.removeEventListener("mousemove", mm);
      window.removeEventListener("mouseup", up);
      el.removeEventListener("touchstart", ts);
      window.removeEventListener("touchmove", tm);
      window.removeEventListener("touchend", up);
    };
  }, []);

  const { x: rx, y: ry } = rot.current;
  const cosX = Math.cos(rx);
  const sinX = Math.sin(rx);
  const cosY = Math.cos(ry);
  const sinY = Math.sin(ry);

  const pts = BASE.map((n) => {
    // rotate around Y then X
    const x1 = n.x * cosY - n.z * sinY;
    const z1 = n.x * sinY + n.z * cosY;
    const y2 = n.y * cosX - z1 * sinX;
    const z2 = n.y * sinX + z1 * cosX;
    const persp = 1 / (1.9 - z2);
    return {
      ...n,
      px: x1 * RADIUS,
      py: y2 * RADIUS,
      z: z2,
      scale: persp * 1.7,
      opacity: 0.25 + ((z2 + 1) / 2) * 0.75,
    };
  });

  const size = RADIUS * 2 + 140;

  return (
    <div
      ref={wrapRef}
      className="relative select-none cursor-grab active:cursor-grabbing touch-none"
      style={{ width: size, height: size, maxWidth: "92vw", maxHeight: "92vw" }}
    >
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`}
      >
        {EDGES.map(([i, j], k) => {
          const a = pts[i];
          const b = pts[j];
          const o = Math.max(0.03, ((a.z + b.z) / 2 + 1) / 2 * 0.22);
          return (
            <line
              key={k}
              x1={a.px}
              y1={a.py}
              x2={b.px}
              y2={b.py}
              stroke="#8AA0AA"
              strokeOpacity={o}
              strokeWidth={0.8}
            />
          );
        })}
      </svg>

      <div className="absolute inset-0">
        {pts.map((p) => {
          const Icon = p.icon;
          return (
            <div
              key={p.name}
              className="absolute left-1/2 top-1/2 flex flex-col items-center gap-1"
              style={{
                transform: `translate(-50%,-50%) translate(${p.px}px, ${p.py}px) scale(${p.scale})`,
                opacity: p.opacity,
                zIndex: Math.round((p.z + 1) * 100),
              }}
            >
              <Icon size={30} style={{ color: p.color }} />
              <span className="text-[9px] font-sans text-foreground/80 whitespace-nowrap">
                {p.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SkillsGlobe;
