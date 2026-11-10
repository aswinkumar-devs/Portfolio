import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  ShieldCheck,
  Globe,
  ArrowUpRight,
  Landmark,
  ExternalLink,
  DatabaseZap,
  Sparkles,
} from "lucide-react";
import Section from "./Section";
import { Button } from "@/components/ui/button";
import captchaImg from "@/assets/project-captcha.png";
import ravaImg from "@/assets/project-rava.png";
import portfolioImg from "@/assets/project-portfolio.png";
import hydraImage from "@/assets/project-hydraetl.png";
import bankingImage from "@/assets/project-bank.png";

type ProjectCategory = "All" | "Go & Backend" | "AI & Systems" | "Full Stack";

interface Project {
  icon: React.ElementType;
  title: string;
  desc: string;
  tags: string[];
  image?: string;
  liveUrl?: string;
  categories: ProjectCategory[];
  accent: string;
}

const CATEGORIES: ProjectCategory[] = ["All", "Go & Backend", "AI & Systems", "Full Stack"];

const projects: Project[] = [
  {
    icon: DatabaseZap,
    title: "HydraETL",
    desc: "A concurrent, memory-bounded ETL engine that streams multi-gigabyte files through a Go worker-pool pipeline into MongoDB with batched writes, graceful shutdown, and a real-time monitoring dashboard.",
    tags: ["Go", "Gin", "MongoDB", "React", "Tailwind CSS", "Docker"],
    image: hydraImage,
    categories: ["Go & Backend"],
    accent: "#00f0ff",
  },
  {
    icon: Bot,
    title: "RAVA – Personal AI Assistant",
    desc: "A voice-enabled personal assistant that handles everyday tasks via natural language and integrates with multiple APIs.",
    tags: ["Python", "Flask", "Speech NLP", "APIs"],
    image: ravaImg,
    liveUrl: "https://rava-chatbot.netlify.app/",
    categories: ["AI & Systems"],
    accent: "#a855f7",
  },
  {
    icon: ShieldCheck,
    title: "Game-Based CAPTCHA Replacement",
    desc: "An interactive game-based bot prevention system that improves UX while staying secure against automated attacks.",
    tags: ["Node.js", "MongoDB", "JavaScript", "Security"],
    image: captchaImg,
    liveUrl: "https://v0-mass-db.vercel.app/",
    categories: ["AI & Systems"],
    accent: "#10b981",
  },
  {
    icon: Globe,
    title: "Portfolio & E-commerce Sites",
    desc: "Modern responsive frontends with smooth animations, clean layouts, and accessible design patterns.",
    tags: ["HTML", "CSS", "JavaScript", "React"],
    image: portfolioImg,
    liveUrl: "https://aswinkumar-m.netlify.app/",
    categories: ["Full Stack"],
    accent: "#38bdf8",
  },
  {
    icon: Landmark,
    title: "Banking Application",
    desc: "A web-based banking system supporting account management, secure transactions, and balance tracking with a clean JSP-driven UI.",
    tags: ["Java", "JDBC", "Servlet", "JSP", "MySQL"],
    image: bankingImage,
    categories: ["Go & Backend", "Full Stack"],
    accent: "#f59e0b",
  },
];

const Projects = () => {
  const [activeCategory, setActiveCategory] = useState<ProjectCategory>("All");

  const filteredProjects = projects.filter((p) => {
    if (activeCategory === "All") return true;
    return p.categories.includes(activeCategory);
  });

  return (
    <Section id="projects" eyebrow="Things I've built" title="Projects">
      {/* Category Filter Tabs Bar (Theme-Adaptive Sleek Capsule) */}
      <div className="mb-8 sm:mb-10 flex flex-wrap items-center justify-center gap-2 px-2">
        <div className="flex flex-wrap items-center justify-center gap-1 p-1 rounded-2xl sm:rounded-full border border-slate-200/80 dark:border-white/[0.08] bg-slate-100/80 dark:bg-white/[0.03] backdrop-blur-xl shadow-sm max-w-full">
          {CATEGORIES.map((cat) => {
            const count =
              cat === "All"
                ? projects.length
                : projects.filter((p) => p.categories.includes(cat)).length;
            const isActive = activeCategory === cat;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`relative px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 flex items-center gap-1.5 sm:gap-2 ${
                  isActive
                    ? "text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-slate-200/50 dark:hover:bg-white/[0.05]"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeCategoryPill"
                    className="absolute inset-0 rounded-full gradient-primary shadow-glow"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{cat}</span>
                <span
                  className={`relative z-10 px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono leading-none transition-colors ${
                    isActive
                      ? "bg-black/20 dark:bg-black/30 text-white font-bold"
                      : "bg-slate-200/80 dark:bg-white/[0.08] text-slate-600 dark:text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Projects Grid with Old UI Layout & 3D Overlap Over Neighbouring Card */}
      <motion.div layout className="relative z-10 grid grid-cols-1 gap-8 md:grid-cols-2 overflow-visible">
        <AnimatePresence mode="popLayout">
          {filteredProjects.map((p, i) => (
            <motion.article
              key={p.title}
              layout
              initial={{ opacity: 0, y: 25, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="group glass relative mt-0 md:mt-6 flex min-h-[300px] flex-col overflow-hidden md:overflow-visible rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white/60 dark:bg-card/40 backdrop-blur-xl transition-all duration-400 ease-out hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl z-10 hover:z-40"
            >
              {/* Subtle Ambient Radial Glow on Hover */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background: `radial-gradient(550px circle at 50% 0%, ${p.accent}14, transparent 45%)`,
                }}
              />

              {/* Iconic Floating Tilted Preview Screenshot (Old UI Style) */}
              {p.image ? (
                <a
                  href={p.liveUrl ?? p.image ?? "#contact"}
                  target="_blank"
                  rel="noreferrer"
                  className="relative m-4 mb-0 z-20 block aspect-video w-auto origin-center md:absolute md:m-0 md:-top-5 md:aspect-auto md:w-[60%] md:-rotate-[7deg] overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/[0.1] bg-muted shadow-elegant transition-all duration-400 ease-out md:group-hover:rotate-0 md:group-hover:scale-105 md:group-hover:translate-x-3 md:group-hover:-translate-y-1.5 md:-right-3 lg:-right-5 xl:-right-8 md:h-40 group-hover:z-50 md:group-hover:shadow-[0_16px_36px_-8px_rgba(0,0,0,0.7)] md:group-hover:border-primary/50"
                  aria-label={`View ${p.title}`}
                >
                  <img
                    src={p.image}
                    alt={`${p.title} project interface`}
                    loading="lazy"
                    width={1600}
                    height={912}
                    className="h-full w-full object-cover object-center transition-transform duration-500 md:group-hover:scale-[1.03]"
                  />
                  {/* Subtle glass reflection sheen overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20 opacity-0 transition-opacity duration-300 md:group-hover:opacity-100 pointer-events-none" />
                </a>
              ) : (
                <div className="absolute right-8 top-12 flex h-24 w-28 -rotate-[7deg] items-center justify-center rounded-2xl border border-slate-200/80 dark:border-white/[0.1] bg-muted shadow-elegant transition-all duration-400 ease-out group-hover:rotate-0 group-hover:scale-105 group-hover:translate-x-3 group-hover:-translate-y-1.5 group-hover:z-50">
                  <p.icon size={36} className="text-primary dark:text-accent" />
                </div>
              )}

              {/* Card Left-Hand Content */}
              <div className="relative z-20 flex flex-1 flex-col p-5 pt-6">
                <div className="flex max-w-full flex-col md:min-h-32 md:max-w-[44%]">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="inline-flex rounded-xl p-2 gradient-primary text-primary-foreground shadow-glow transition-transform duration-300 group-hover:scale-105">
                      <p.icon size={20} />
                    </div>
                    {/* Live status badge */}
                    {p.liveUrl && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono font-medium text-emerald-500 dark:text-emerald-400">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                        </span>
                        Live
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold leading-tight tracking-tight text-foreground">{p.title}</h3>
                </div>

                <div className="mt-auto pt-5">
                  <p className="mb-4 text-sm text-muted-foreground md:line-clamp-2 leading-relaxed">{p.desc}</p>
                  <div className="mb-5 flex flex-wrap gap-1.5">
                    {p.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] font-medium text-primary dark:text-accent transition-colors hover:border-primary/40 hover:bg-primary/15"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    {p.liveUrl ? (
                      <a
                        href={p.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-all hover:gap-3 dark:text-accent group/link"
                      >
                        <ExternalLink size={14} className="transition-transform group-hover/link:translate-x-0.5" /> Live Demo
                      </a>
                    ) : (
                      <a
                        href="#contact"
                        className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-all hover:gap-3 dark:text-accent group/link"
                      >
                        <ArrowUpRight size={14} className="transition-transform group-hover/link:translate-x-0.5" /> Ask about project
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </motion.div>
    </Section>
  );
};

export default Projects;
