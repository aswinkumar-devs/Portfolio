import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Network, MousePointer2 } from "lucide-react";
import SkillsGlobe from "@/components/SkillsGlobe";
import { useTheme } from "@/components/ThemeProvider";

const SkillsUniverse = () => {
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const isBright = resolvedTheme === "light";

  const goBack = () => {
    sessionStorage.setItem("portfolio:returnToSkills", "1");
    navigate("/", { replace: true });
  };

  return (
    <motion.main
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={`relative h-[100dvh] sm:min-h-screen w-full overflow-hidden select-none transition-colors duration-500 ${
        isBright ? "bg-[#f8fafc] text-slate-900" : "bg-[#030611] text-foreground"
      }`}
    >
      {/* 1. Spider-Verse Multiverse Backdrop (Bright Holographic / Cosmic Dark) */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-70 transition-opacity duration-500"
        style={{
          background: isBright
            ? "radial-gradient(circle at 50% 50%, rgba(255, 0, 85, 0.08) 0%, rgba(2, 132, 199, 0.12) 35%, rgba(124, 58, 237, 0.05) 60%, rgba(248, 250, 252, 0.98) 100%)"
            : "radial-gradient(circle at 50% 50%, rgba(255, 0, 85, 0.12) 0%, rgba(0, 240, 255, 0.08) 35%, rgba(124, 58, 237, 0.05) 60%, rgba(3, 6, 17, 0.95) 100%)",
        }}
      />

      {/* 2. Full-Screen Spider-Verse Dimensional Web Matrix in Background */}
      <svg
        className={`pointer-events-none absolute inset-0 w-full h-full transition-opacity duration-500 ${
          isBright ? "opacity-35" : "opacity-25"
        }`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="bg-spider-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isBright ? "#0284c7" : "#00f0ff"} stopOpacity="0.8" />
            <stop offset="100%" stopColor={isBright ? "#e11d48" : "#ff0055"} stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="bg-spider-magenta" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isBright ? "#e11d48" : "#ff0055"} stopOpacity="0.8" />
            <stop offset="100%" stopColor={isBright ? "#0284c7" : "#00f0ff"} stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Diagonal Corner-to-Center Spider-Web Structural Anchor Lines */}
        <line x1="0" y1="0" x2="50%" y2="50%" stroke="url(#bg-spider-cyan)" strokeWidth="0.8" strokeDasharray="6 4" />
        <line x1="100%" y1="0" x2="50%" y2="50%" stroke="url(#bg-spider-magenta)" strokeWidth="0.8" strokeDasharray="6 4" />
        <line x1="0" y1="100%" x2="50%" y2="50%" stroke="url(#bg-spider-magenta)" strokeWidth="0.8" strokeDasharray="6 4" />
        <line x1="100%" y1="100%" x2="50%" y2="50%" stroke="url(#bg-spider-cyan)" strokeWidth="0.8" strokeDasharray="6 4" />

        {/* Horizontal and Vertical Cross-Filaments */}
        <line
          x1="0"
          y1="50%"
          x2="100%"
          y2="50%"
          stroke={isBright ? "#0284c7" : "#00f0ff"}
          strokeOpacity={isBright ? 0.20 : 0.12}
          strokeWidth="0.6"
          strokeDasharray="8 6"
        />
        <line
          x1="50%"
          y1="0"
          x2="50%"
          y2="100%"
          stroke={isBright ? "#e11d48" : "#ff0055"}
          strokeOpacity={isBright ? 0.20 : 0.12}
          strokeWidth="0.6"
          strokeDasharray="8 6"
        />

        {/* Concentric Polygonal Spider Web Rings */}
        {[0.18, 0.32, 0.46, 0.60].map((scale, i) => (
          <polygon
            key={`poly-${i}`}
            points={`
              ${50 - 35 * scale}%,${50 - 20 * scale}%
              50%,${50 - 38 * scale}%
              ${50 + 35 * scale}%,${50 - 20 * scale}%
              ${50 + 40 * scale}%,50%
              ${50 + 35 * scale}%,${50 + 20 * scale}%
              50%,${50 + 38 * scale}%
              ${50 - 35 * scale}%,${50 + 20 * scale}%
              ${50 - 40 * scale}%,50%
            `}
            fill="none"
            stroke={i % 2 === 0 ? (isBright ? "#0284c7" : "#00f0ff") : (isBright ? "#e11d48" : "#ff0055")}
            strokeOpacity={isBright ? 0.16 : 0.10}
            strokeWidth="0.75"
          />
        ))}
      </svg>

      {/* 3. Top-Left: Spider-Verse Dimension Anomaly Tag */}
      <div className="absolute top-3 left-3 sm:top-6 sm:left-6 z-20 flex flex-col gap-0.5 sm:gap-1 max-w-[55%] sm:max-w-none">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff0055] opacity-75" />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 ${
                isBright ? "bg-[#0284c7]" : "bg-[#00f0ff]"
              }`}
            />
          </span>
          <span
            className={`font-mono text-[10px] sm:text-xs font-bold tracking-wider sm:tracking-widest uppercase truncate ${
              isBright ? "text-[#0284c7]" : "text-[#00f0ff]"
            }`}
          >
            SPIDER-VERSE // WEB OF DESTINY
          </span>
        </div>
        <div
          className={`hidden sm:flex items-center gap-2 font-mono text-[10px] pl-4.5 ${
            isBright ? "text-slate-600 font-medium" : "text-slate-400"
          }`}
        >
          <Network size={12} className={isBright ? "text-[#e11d48]" : "text-[#ff0055]"} />
          <span>SECTOR-104 • 18 ANOMALOUS TIMELINES CONNECTED</span>
        </div>
      </div>

      {/* 4. Top-Right: Back to Portfolio Button with Spider-Verse Edge */}
      <button
        type="button"
        onClick={goBack}
        className={`fixed top-3 right-3 sm:top-5 sm:right-5 z-30 inline-flex items-center gap-1.5 sm:gap-2 rounded-full border px-3 py-1.5 text-xs sm:px-5 sm:py-2.5 sm:text-sm font-bold shadow-md backdrop-blur-md transition-all hover:-translate-y-0.5 active:translate-y-0 ${
          isBright
            ? "border-[#ff0055]/50 bg-white/90 text-slate-900 hover:bg-white hover:border-[#0284c7] shadow-[0_0_15px_rgba(255,0,85,0.2)]"
            : "border-[#ff0055]/70 bg-slate-950/85 text-white hover:border-[#00f0ff] shadow-[0_0_20px_rgba(255,0,85,0.4),0_0_35px_rgba(0,240,255,0.25)]"
        }`}
        style={{
          clipPath:
            "polygon(8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0% calc(100% - 8px), 0% 8px)",
        }}
      >
        <ArrowLeft size={15} className={isBright ? "text-[#0284c7]" : "text-[#00f0ff]"} />
        <span className="hidden sm:inline">Return to Prime Canon</span>
        <span className="sm:hidden">Back</span>
      </button>

      {/* 5. Center 3D Multiverse Web Sphere */}
      <div className="h-full sm:min-h-screen flex items-center justify-center px-2 sm:px-4 relative z-10 overflow-hidden">
        <SkillsGlobe />
      </div>

      {/* 6. Bottom Spider-Sense Interaction HUD */}
      <div
        className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex w-max max-w-[94%] items-center gap-2 sm:gap-2.5 rounded-full border px-3 sm:px-4 py-1.5 text-[9px] sm:text-xs font-mono shadow-xl backdrop-blur-md overflow-x-auto no-scrollbar transition-colors duration-500 ${
          isBright
            ? "border-slate-200/90 bg-white/90 text-slate-700 shadow-slate-200/50"
            : "border-slate-800 bg-slate-950/80 text-slate-300 shadow-black/50"
        }`}
      >
        <MousePointer2 size={11} className={`${isBright ? "text-[#0284c7]" : "text-[#00f0ff]"} animate-bounce shrink-0`} />
        <span className={`${isBright ? "text-[#0284c7]" : "text-[#00f0ff]"} font-bold`}>[DRAG]</span>
        <span className="whitespace-nowrap">Traverse</span>
        <span className={isBright ? "text-slate-400" : "text-slate-600"}>•</span>
        <span className="text-[#ff0055] font-bold">[HOVER]</span>
        <span className="whitespace-nowrap">Inspect</span>
        <span className={isBright ? "text-slate-400" : "text-slate-600"}>•</span>
        <span className={`${isBright ? "text-amber-600 font-semibold" : "text-amber-400 font-bold"}`}>[CLICK]</span>
        <span className="whitespace-nowrap">Pulse</span>
      </div>
    </motion.main>
  );
};

export default SkillsUniverse;
