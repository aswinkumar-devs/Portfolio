import { useState } from "react";
import { motion, Variants } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FaJava,
  FaHtml5,
  FaJsSquare,
  FaDatabase,
  FaServer,
  FaGitAlt,
  FaGithub,
  FaCode,
  FaBrain,
} from "react-icons/fa";
import {
  SiGo,
  SiMongodb,
  SiMysql,
  SiPostman,
  SiSwagger,
  SiTailwindcss,
  SiCss,
  SiHibernate,
  SiIntellijidea,
} from "react-icons/si";
import {
  Globe,
  DatabaseBackup,
  FileJson,
  Lock,
  Cpu,
  Network,
  Workflow,
  LayoutTemplate,
  Boxes,
  Code2,
  Layers,
  ArrowRight,
} from "lucide-react";

interface Skill {
  name: string;
  icon: React.ElementType;
  color: string;
}

interface Category {
  title: string;
  skills: Skill[];
}

const categories: Category[] = [
  {
    title: "Languages",
    skills: [
      { name: "Go", icon: SiGo, color: "#00ADD8" },
      { name: "Java", icon: FaJava, color: "#f89820" },
      { name: "J2EE", icon: FaCode, color: "#5382a1" },
      { name: "JavaScript", icon: FaJsSquare, color: "#F7DF1E" },
      { name: "SQL", icon: FaDatabase, color: "#00758F" },
    ],
  },
  {
    title: "Backend & Frameworks",
    skills: [
      { name: "Gin", icon: Globe, color: "#00ADD8" },
      { name: "GORM", icon: DatabaseBackup, color: "#00ADD8" },
      { name: "REST API", icon: FileJson, color: "#38BDF8" },
      { name: "JWT", icon: Lock, color: "#F59E0B" },
      { name: "JSP", icon: FaServer, color: "#e76f00" },
      { name: "Servlets", icon: FaServer, color: "#e76f00" },
      { name: "Hibernate", icon: SiHibernate, color: "#8FA5AC" },
    ],
  },
  {
    title: "Databases",
    skills: [
      { name: "MongoDB", icon: SiMongodb, color: "#47A248" },
      { name: "MySQL", icon: SiMysql, color: "#00A6D6" },
      { name: "JDBC", icon: Layers, color: "#bb8c3c" },
      { name: "Indexing", icon: DatabaseBackup, color: "#47A248" },
    ],
  },
  {
    title: "Concurrency & Architecture",
    skills: [
      { name: "Goroutines", icon: Cpu, color: "#00ADD8" },
      { name: "Channels", icon: Network, color: "#00ADD8" },
      { name: "Worker Pool", icon: Workflow, color: "#00ADD8" },
      { name: "MVC", icon: LayoutTemplate, color: "#8B5CF6" },
      { name: "Monolith", icon: Boxes, color: "#8B5CF6" },
      { name: "OOP", icon: FaBrain, color: "#a78bfa" },
    ],
  },
  {
    title: "Frontend & Tools",
    skills: [
      { name: "HTML5", icon: FaHtml5, color: "#E34F26" },
      { name: "CSS3", icon: SiCss, color: "#1572B6" },
      { name: "Tailwind", icon: SiTailwindcss, color: "#06B6D4" },
      { name: "Git", icon: FaGitAlt, color: "#F05032" },
      { name: "GitHub", icon: FaGithub, color: "#9BA3AF" },
      { name: "Postman", icon: SiPostman, color: "#FF6C37" },
      { name: "Swagger", icon: SiSwagger, color: "#85EA2D" },
      { name: "VS Code", icon: Code2, color: "#007ACC" },
      { name: "IntelliJ", icon: SiIntellijidea, color: "#B07CF0" },
    ],
  },
];

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

const Skills = () => {
  // returning from /skills-universe: render already-settled, skip entrance replay
  const [instant] = useState(
    () => typeof window !== "undefined" && sessionStorage.getItem("portfolio:returnToSkills") === "1",
  );

  return (
  <section id="skills" className="relative py-16 px-4 sm:py-24 sm:px-6 scroll-mt-20 overflow-hidden skills-grid-bg">
    <div className="relative z-10 max-w-6xl mx-auto">
      <motion.div
        initial={instant ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-14"
      >
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
          <span className="gradient-text">My Stack</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          A curated selection of technologies I use to build high-performance applications.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
        {categories.map((cat, ci) => (
          <motion.div
            key={cat.title}
            initial={instant ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.15 }}
            transition={{ duration: 0.5, delay: ci * 0.06 }}
            className="glass min-w-0 rounded-2xl p-4 sm:p-6 border border-border"
          >
            <div className="flex items-center gap-3 mb-5">
              <span className="block w-1 h-5 rounded-full gradient-primary" />
              <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-foreground">
                {cat.title}
              </h3>
            </div>

            <motion.div
              variants={container}
              initial={instant ? "show" : "hidden"}
              whileInView="show"
              viewport={{ once: false, amount: 0.1 }}
              className="grid grid-cols-3 gap-2 sm:gap-3 sm:grid-cols-[repeat(auto-fill,minmax(90px,1fr))]"
            >
              {cat.skills.map((s) => {
                const Icon = s.icon;
                return (
                  <motion.div
                    key={s.name}
                    variants={item}
                    whileHover={{ y: -3, scale: 1.04 }}
                    className="rounded-xl border border-border bg-background/40 min-w-0 p-2 sm:p-3 flex flex-col items-center justify-center gap-2 transition-smooth hover:border-primary/50"
                  >
                    <Icon
                      size={32}
                      style={{ color: s.color, filter: `drop-shadow(0 0 8px ${s.color}55)` }}
                    />
                    <span className="text-[10px] font-medium uppercase tracking-wide text-center leading-tight text-muted-foreground">
                      {s.name}
                    </span>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        ))}
      </div>

      <div className="mt-14 flex flex-col items-center gap-3">
        <Link
          to="/skills-universe"
          onClick={() => sessionStorage.setItem("portfolio:scrollY", String(window.scrollY))}
          className="group relative inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-8 py-2.5 sm:py-3.5 rounded-full text-xs sm:text-sm font-semibold tracking-wider uppercase overflow-hidden transition-all duration-300 hover:scale-105 max-w-full"
          style={{
            background: "linear-gradient(135deg, rgba(0, 240, 255, 0.12) 0%, rgba(255, 0, 85, 0.12) 100%)",
            border: "1px solid rgba(0, 240, 255, 0.45)",
            boxShadow: "0 0 24px rgba(0, 240, 255, 0.25), inset 0 0 16px rgba(255, 0, 85, 0.18)",
          }}
        >
          {/* Animated gradient sweep / spider-web glow on hover */}
          <span
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: "linear-gradient(135deg, rgba(0, 240, 255, 0.25) 0%, rgba(255, 0, 85, 0.25) 100%)",
              boxShadow: "0 0 35px rgba(0, 240, 255, 0.6), inset 0 0 25px rgba(255, 0, 85, 0.4)",
            }}
          />
          <span className="relative flex flex-wrap sm:flex-nowrap items-center justify-center gap-1.5 sm:gap-2.5 text-foreground font-mono font-bold tracking-wider sm:tracking-widest text-[11px] sm:text-sm">
            <Network size={15} className="text-[#00f0ff] animate-pulse" />
            <span className="text-[#00f0ff] drop-shadow-[0_0_8px_#00f0ff]">SPIDER-VERSE WEB</span>
            <span className="text-muted-foreground/50 hidden sm:inline">//</span>
            <span>ENTER MULTIVERSE</span>
            <ArrowRight size={15} className="text-[#ff0055] transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </Link>
        <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] inline-block animate-ping" />
          Earth-616 • Dimensional Neural Net
        </span>
      </div>
    </div>
  </section>
  );
};

export default Skills;
