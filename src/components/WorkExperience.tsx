import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Building2,
  Calendar,
  Sparkles,
  Cpu,
  Layers,
  Database,
  ShieldCheck,
  Terminal,
  Zap,
  CheckCircle2,
  Rocket,
  FileText,
  Send,
  ArrowDown,
  Compass,
  Download,
  X,
} from "lucide-react";
import Section from "./Section";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useTheme } from "./ThemeProvider";

interface DomainArchitecture {
  id: string;
  name: string;
  icon: React.ElementType;
  accent: string;
  accentLight: string;
  badge: string;
  summary: string;
  capabilities: {
    title: string;
    detail: string;
  }[];
}

const ARCHITECTURE_DOMAINS: DomainArchitecture[] = [
  {
    id: "concurrency",
    name: "Concurrency",
    icon: Cpu,
    accent: "#00f0ff",
    accentLight: "#0284c7",
    badge: "Core Go",
    summary: "Thread-safe, non-blocking asynchronous pipelines with Go channels & worker pools.",
    capabilities: [
      {
        title: "Goroutines & Channels",
        detail: "Lightweight execution pipelines with buffered & unbuffered synchronization.",
      },
      {
        title: "Worker Queue Pool",
        detail: "Bounded worker routines preventing memory exhaustion under spike traffic.",
      },
      {
        title: "Mutex & Atomics",
        detail: "Deterministic sync primitives eliminating race conditions and lock contention.",
      },
      {
        title: "Concurrent TCP Server",
        detail: "Low-level connection multiplexing and concurrent packet stream processing.",
      },
    ],
  },
  {
    id: "api-engine",
    name: "API & Web",
    icon: Layers,
    accent: "#a855f7",
    accentLight: "#9333ea",
    badge: "Gin Engine",
    summary: "Production-grade RESTful backends with sub-millisecond route dispatch and middleware.",
    capabilities: [
      {
        title: "Gin Web Engine",
        detail: "Fast routing, modular router groups, and custom recovery/auth middlewares.",
      },
      {
        title: "Graceful Shutdown",
        detail: "OS signal interception (SIGINT/SIGTERM) to drain active requests without data loss.",
      },
      {
        title: "Pagination & Filters",
        detail: "High-performance cursor/offset pagination with dynamic query filtering.",
      },
      {
        title: "Swagger OpenAPI 3.0",
        detail: "Living, testable contract documentation generated automatically from Go structs.",
      },
    ],
  },
  {
    id: "data-persistence",
    name: "DB & Queries",
    icon: Database,
    accent: "#10b981",
    accentLight: "#059669",
    badge: "GORM / Mongo",
    summary: "Hybrid relational and NoSQL storage pipelines with tuned index structures.",
    capabilities: [
      {
        title: "MongoDB Aggregation",
        detail: "Multi-stage pipeline queries ($match, $group, $lookup) for analytics & reporting.",
      },
      {
        title: "GORM Architecture",
        detail: "Eager/lazy loading optimization, hook lifecycle management, and clean schema migrations.",
      },
      {
        title: "SQL Query Tuning",
        detail: "Index optimization, query execution plan analysis, and connection pool sizing.",
      },
      {
        title: "ACID Ledger Design",
        detail: "Clean transactional boundaries with strict consistency on critical data paths.",
      },
    ],
  },
  {
    id: "security-reliability",
    name: "Auth & Tooling",
    icon: ShieldCheck,
    accent: "#f59e0b",
    accentLight: "#d97706",
    badge: "Security",
    summary: "Zero-trust token security, scheduled background daemons, and automated testing.",
    capabilities: [
      {
        title: "JWT Authentication",
        detail: "Stateless claims verification, signature validation, and role-based access control.",
      },
      {
        title: "Cron & Schedulers",
        detail: "Deterministic recurring background job daemons for maintenance & automated sync.",
      },
      {
        title: "Structured Logging",
        detail: "Zero-allocation JSON log output with contextual correlation IDs for tracing.",
      },
      {
        title: "Postman Automation",
        detail: "Automated regression collections, mock servers, and CI contract validation.",
      },
    ],
  },
];

{/* Symmetrical Timeline Electric Lightning Arc Conduit (Classic line in center + plasma lightning arcs around it) */}
interface ElectricLineProps {
  delay?: number;
}

const ElectricLine = ({ delay = 0 }: ElectricLineProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { resolvedTheme } = useTheme();
  const isBright = resolvedTheme === "light";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let t = delay * 2.5;
    let lastTime = 0;
    const targetFps = 30;
    const interval = 1000 / targetFps;

    // Retina DPI scaling
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssWidth = 56;
    const cssHeight = 32;
    canvas.width = Math.round(cssWidth * dpr);
    canvas.height = Math.round(cssHeight * dpr);
    ctx.scale(dpr, dpr);

    const cx = cssWidth / 2;
    const h = cssHeight;

    const render = (currentTime: number) => {
      animId = requestAnimationFrame(render);
      if (currentTime - lastTime < interval) return;
      lastTime = currentTime;

      t += 0.05; // Smooth downward surge phase
      ctx.clearRect(0, 0, cssWidth, cssHeight);

      // 1. Ambient vertical electric plasma column glow (soft aura)
      const grad = ctx.createRadialGradient(cx, h / 2, 2, cx, h / 2, 16);
      if (isBright) {
        grad.addColorStop(0, "rgba(2, 132, 199, 0.28)");
        grad.addColorStop(1, "rgba(2, 132, 199, 0)");
      } else {
        grad.addColorStop(0, "rgba(0, 240, 255, 0.35)");
        grad.addColorStop(1, "rgba(0, 240, 255, 0)");
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, cssWidth, cssHeight);

      // 2. Generate sinuous plasma tendrils wrapping around the central line
      const generateRibbon = (phaseOff: number, amp: number, freq: number) => {
        const pts: { x: number; y: number }[] = [];
        for (let y = 0; y <= h; y += 2) {
          // Traveling wave from top to bottom
          const p1 = y * 0.16 - t * 3.6 + phaseOff;
          const p2 = y * freq + t * 2.4 + phaseOff * 1.4;
          const disp = Math.sin(p1) * amp + Math.sin(p2) * (amp * 0.55);
          // Micro-crackle electrical jitter
          const jitter = (Math.random() - 0.5) * 1.4;
          pts.push({ x: cx + disp + jitter, y });
        }
        return pts;
      };

      const ribbons = [
        generateRibbon(0.0, 5.8, 0.26),
        generateRibbon(2.4, 4.4, 0.34),
      ];

      // Occasional offshoot spark branches (like in the user's reference image)
      const branches: { x: number; y: number }[][] = [];
      if (Math.random() > 0.25) {
        const parent = ribbons[Math.random() > 0.5 ? 0 : 1];
        const idx = Math.floor(parent.length * 0.25 + Math.random() * (parent.length * 0.5));
        if (parent[idx]) {
          const startPt = parent[idx];
          const dir = Math.random() > 0.5 ? 1 : -1;
          const bPts: { x: number; y: number }[] = [startPt];
          const bLen = Math.floor(3 + Math.random() * 4);
          for (let s = 1; s <= bLen; s++) {
            const by = Math.min(h, startPt.y + s * 2.6);
            const bx = startPt.x + dir * (s * 1.5) + (Math.random() - 0.5) * 2;
            bPts.push({ x: bx, y: by });
          }
          branches.push(bPts);
        }
      }

      const allPaths = [...ribbons, ...branches];

      // Multi-pass glow rendering matching media_1794036634633_0569ffa7.png
      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // Pass 1: Outer Electric Plasma Aura
      ctx.lineWidth = isBright ? 3.8 : 4.5;
      ctx.strokeStyle = isBright ? "rgba(2, 132, 199, 0.35)" : "rgba(0, 200, 255, 0.45)";
      ctx.shadowColor = isBright ? "#0284c7" : "#00f0ff";
      ctx.shadowBlur = isBright ? 7 : 12;
      allPaths.forEach((path) => {
        ctx.beginPath();
        path.forEach((pt, i) => (i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y)));
        ctx.stroke();
      });

      // Pass 2: Intense Neon Mid-Filament
      ctx.lineWidth = isBright ? 1.8 : 2.2;
      ctx.strokeStyle = isBright ? "rgba(37, 99, 235, 0.85)" : "rgba(100, 230, 255, 0.9)";
      ctx.shadowColor = isBright ? "#2563eb" : "#38bdf8";
      ctx.shadowBlur = 4;
      allPaths.forEach((path) => {
        ctx.beginPath();
        path.forEach((pt, i) => (i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y)));
        ctx.stroke();
      });

      // Pass 3: White-Hot / Golden Core Spark (exact match to the reference image)
      ctx.lineWidth = 1.0;
      ctx.strokeStyle = isBright ? "#ffffff" : "#fef08a";
      ctx.shadowColor = "#ffffff";
      ctx.shadowBlur = 2;
      allPaths.forEach((path) => {
        ctx.beginPath();
        path.forEach((pt, i) => (i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y)));
        ctx.stroke();
      });

      ctx.restore();
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isBright, delay]);

  return (
    <div className="relative flex items-center justify-center w-14 h-8 select-none">
      {/* 1. Normal straight line from the old design (the core conduit) */}
      <div className="relative w-[2px] h-8 rounded-full bg-slate-300/80 dark:bg-white/[0.12] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/40 via-primary to-primary/40" />
      </div>

      {/* 2. Authentic Electric Plasma Lightning Arc Canvas (Wrapping & crackling around the normal line) */}
      <canvas
        ref={canvasRef}
        style={{ width: 56, height: 32 }}
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-0 z-10"
      />
    </div>
  );
};

const WorkExperience = () => {
  const [activeDomain, setActiveDomain] = useState<string>("concurrency");
  const [resumeOpen, setResumeOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const isBright = resolvedTheme === "light";

  const selectedDomain =
    ARCHITECTURE_DOMAINS.find((d) => d.id === activeDomain) || ARCHITECTURE_DOMAINS[0];
  const domainAccent = isBright ? selectedDomain.accentLight : selectedDomain.accent;

  const handleResumeClick = () => {
    // 1. Show: Open the in-app resume viewer modal
    setResumeOpen(true);

    // 2. Download: Trigger immediate PDF download
    const link = document.createElement("a");
    link.href = "/resume.pdf";
    link.download = "Aswin_Kumar_M_Resume.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Resume preview opened & download started!");
  };

  return (
    <Section id="experience" eyebrow="My professional journey" title="Work Experience">
      <div className="max-w-3xl mx-auto">
        {/* ================= CHAPTER 01: ACTIVE ROLE ================= */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white/60 dark:bg-card/50 backdrop-blur-xl p-5 sm:p-7 shadow-card transition-all duration-300 hover:border-slate-300 dark:hover:border-white/[0.14]"
        >
          {/* Subtle Ambient Glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full opacity-15 blur-3xl transition-colors duration-500"
            style={{ backgroundColor: domainAccent }}
          />

          {/* Chapter & Timeline Badge Row */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-200/60 dark:border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                Chapter 01
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
                Active Production
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground/80">
              <Calendar size={12} className="text-primary" />
              <span>May 2026 – Present</span>
            </div>
          </div>

          {/* Role Header */}
          <div className="relative z-10 flex items-start gap-3.5 mb-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl gradient-primary text-primary-foreground shadow-glow">
              <Briefcase size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Trainee Software Engineer
              </h3>
              <p className="text-sm font-semibold text-primary dark:text-accent flex items-center gap-1.5 mt-0.5">
                <Building2 size={15} className="shrink-0" />
                Sterna Security Solutions
              </p>
            </div>
          </div>

          {/* Seamless Segmented Architecture Telemetry Tabs */}
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-muted-foreground">
                <Terminal size={14} className="text-primary" />
                <span>Backend Engineering Competencies</span>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground/60 hidden sm:inline">
                [ Click to inspect ]
              </span>
            </div>

            {/* Clean Segmented Tab Control (Theme-Adaptive) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-1.5 p-1 rounded-2xl bg-slate-100/90 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] mb-3">
              {ARCHITECTURE_DOMAINS.map((domain) => {
                const isActive = activeDomain === domain.id;
                const Icon = domain.icon;
                const accent = isBright ? domain.accentLight : domain.accent;
                return (
                  <button
                    key={domain.id}
                    type="button"
                    onClick={() => setActiveDomain(domain.id)}
                    className={`relative flex items-center gap-1.5 sm:gap-2 rounded-xl px-2 py-1.5 sm:px-2.5 sm:py-2 text-left transition-all duration-200 ${
                      isActive
                        ? "bg-white dark:bg-white/[0.08] text-slate-900 dark:text-foreground shadow-sm border border-slate-200/90 dark:border-white/[0.12]"
                        : "text-slate-600 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-foreground hover:bg-white/60 dark:hover:bg-white/[0.04] border border-transparent"
                    }`}
                  >
                    <div
                      className="flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-lg transition-transform duration-200"
                      style={{
                        backgroundColor: `${accent}18`,
                        color: accent,
                      }}
                    >
                      <Icon size={13} className="sm:size-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] sm:text-[11px] font-semibold truncate leading-tight">
                        {domain.name}
                      </div>
                      <div
                        className="text-[8.5px] sm:text-[9px] font-mono leading-none mt-0.5 truncate font-bold"
                        style={{ color: accent }}
                      >
                        {domain.badge}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Domain Breakdown Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedDomain.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="rounded-2xl bg-white/70 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] p-4 backdrop-blur-md shadow-sm dark:shadow-none"
              >
                <div className="flex items-center gap-2 text-xs font-medium text-foreground/90 mb-3">
                  <Zap size={13} style={{ color: domainAccent }} />
                  <span>{selectedDomain.summary}</span>
                </div>

                {/* Sub-capabilities 2x2 Grid */}
                <div className="grid sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-200/60 dark:border-white/[0.04]">
                  {selectedDomain.capabilities.map((cap) => (
                    <div
                      key={cap.title}
                      className="flex items-start gap-2.5 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] hover:bg-white dark:hover:bg-white/[0.05] p-2.5 transition-colors border border-slate-200/60 dark:border-white/[0.04] hover:border-slate-300 dark:hover:border-white/[0.08]"
                    >
                      <CheckCircle2
                        size={14}
                        className="shrink-0 mt-0.5"
                        style={{ color: domainAccent }}
                      />
                      <div className="min-w-0">
                        <div className="font-semibold text-foreground text-xs leading-tight">
                          {cap.title}
                        </div>
                        <div className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                          {cap.detail}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ================= TIME-FLOW CONDUIT WITH ELECTRIC WAVES ================= */}
        <div className="relative py-1.5 flex flex-col items-center justify-center">
          {/* Upper Straight Flow Line with Electric Wave */}
          <ElectricLine delay={0} />

          {/* Central Milestone Status Badge (Exact Classic Clean Pill) */}
          <div className="relative my-0.5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-200/90 dark:border-white/[0.1] bg-white/95 dark:bg-[#0c0d12]/95 shadow-sm dark:shadow-[0_0_20px_rgba(0,240,255,0.08)] backdrop-blur-md z-10 transition-transform hover:scale-105">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-wider uppercase text-foreground/85">
              Next Chapter
            </span>
            <ArrowDown size={11} className="text-primary animate-bounce" />
          </div>

          {/* Lower Straight Flow Line with Electric Wave (Surging down into Chapter 02) */}
          <ElectricLine delay={0.42} />
        </div>

        {/* ================= CHAPTER 02: NEXT HORIZON ================= */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.4 }}
          className="group relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white/60 dark:bg-card/50 p-5 sm:p-6 backdrop-blur-xl shadow-card transition-all duration-300 hover:border-slate-300 dark:hover:border-white/[0.14]"
        >
          {/* Subtle Ambient Glow Accent */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full opacity-10 dark:opacity-15 blur-3xl transition-opacity duration-500 group-hover:opacity-20"
            style={{ backgroundColor: domainAccent }}
          />

          {/* Chapter & Timeline Header Row */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-3.5 border-b border-slate-200/60 dark:border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                Chapter 02
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-primary dark:text-cyan-400 font-medium">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
                </span>
                Future Horizon
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground/80">
              <Sparkles size={12} className="text-primary" />
              <span>Open to Opportunities</span>
            </div>
          </div>

          {/* Main Card Content */}
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-5">
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl gradient-primary text-primary-foreground shadow-glow transition-transform duration-300 group-hover:scale-105">
                <Rocket size={20} />
              </div>
              <div className="min-w-0">
                <h4 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                  The Next Engineering Chapter
                </h4>
                <p className="text-xs sm:text-sm font-semibold text-primary dark:text-accent mt-0.5">
                  Go Backend & Distributed Systems
                </p>
                <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed mt-1 max-w-lg">
                  Open to high-impact software engineering roles specializing in scalable Go backend services, distributed microservices, and high-throughput systems.
                </p>
              </div>
            </div>

            {/* Quick Actions (Let's Connect + Direct-Click Dual-Action Resume) */}
            <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
              <Button
                asChild
                size="sm"
                className="gradient-primary text-primary-foreground text-xs font-semibold shadow-glow gap-1.5 h-9 px-4 rounded-xl transition-all hover:scale-105 active:scale-95"
              >
                <a href="#contact">
                  <Send size={13} />
                  <span>Let's Connect</span>
                </a>
              </Button>

              <Button
                type="button"
                onClick={handleResumeClick}
                variant="outline"
                size="sm"
                className="text-xs font-semibold gap-1.5 h-9 px-4 rounded-xl border-slate-200/90 dark:border-white/[0.12] bg-white/90 dark:bg-white/[0.04] text-foreground hover:bg-slate-100 dark:hover:bg-white/[0.08] shadow-sm transition-all hover:scale-105 active:scale-95"
              >
                <FileText size={13} className="text-primary" />
                <span>Resume</span>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* ================= RESUME PREVIEW MODAL (SHOW & DOWNLOAD) ================= */}
        <Dialog open={resumeOpen} onOpenChange={setResumeOpen}>
          <DialogContent className="max-w-4xl w-[95vw] h-[88vh] p-0 overflow-hidden flex flex-col gap-0 border border-primary/40 bg-background/95 shadow-[0_0_60px_hsl(var(--primary)/0.35)] rounded-2xl [&>button]:hidden z-50">
            <div className="flex shrink-0 items-center justify-between gap-2 sm:gap-3 px-3 py-2.5 sm:px-6 sm:py-4 border-b border-primary/25">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <img
                  src="/logo.png"
                  alt="AK Dragon Logo"
                  className="w-8 h-8 sm:w-10 sm:h-10 object-contain shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-xl font-bold gradient-text leading-tight truncate">
                    Aswin Kumar M — Resume
                  </h3>
                  <p className="text-[10px] sm:text-[11px] font-mono text-muted-foreground truncate">
                    Backend Software Engineer (Go / Microservices)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                <a
                  href="/resume.pdf"
                  download="Aswin_Kumar_M_Resume.pdf"
                  className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl gradient-primary text-primary-foreground text-xs sm:text-sm font-semibold flex items-center gap-1 shadow-glow hover:scale-105 transition-smooth"
                  onClick={() => toast.success("Resume download started!")}
                >
                  <Download size={14} className="sm:size-4" />
                  <span>Download</span>
                </a>
                <button
                  onClick={() => setResumeOpen(false)}
                  className="p-1.5 sm:p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-smooth"
                  aria-label="Close resume"
                >
                  <X size={18} className="sm:size-5" />
                </button>
              </div>
            </div>
            <iframe
              src="/resume.pdf#view=FitH"
              title="Aswin Kumar M Resume"
              className="w-full flex-1 bg-background"
            />
          </DialogContent>
        </Dialog>
      </div>
    </Section>
  );
};

export default WorkExperience;
