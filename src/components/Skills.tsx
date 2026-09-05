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
  <section id="skills" className="relative py-24 px-6 overflow-hidden skills-grid-bg">
    <div className="relative z-10 max-w-6xl mx-auto">
      <motion.div
        initial={instant ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-14"
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="gradient-text">My Stack</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          A curated selection of technologies I use to build high-performance applications.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {categories.map((cat, ci) => (
          <motion.div
            key={cat.title}
            initial={instant ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.15 }}
            transition={{ duration: 0.5, delay: ci * 0.06 }}
            className="glass rounded-2xl p-6 border border-border"
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
              className="grid gap-3"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))" }}
            >
              {cat.skills.map((s) => {
                const Icon = s.icon;
                return (
                  <motion.div
                    key={s.name}
                    variants={item}
                    whileHover={{ y: -3, scale: 1.04 }}
                    className="rounded-xl border border-border bg-background/40 p-3 flex flex-col items-center justify-center gap-2 transition-smooth hover:border-primary/50"
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

      <div className="mt-14 flex justify-center">
        <Link
          to="/skills-universe"
          onClick={() => sessionStorage.setItem("portfolio:scrollY", String(window.scrollY))}
          className="explore-skills-btn inline-flex items-center gap-2 px-8 py-3 rounded-full text-sm font-medium tracking-wide"
        >
          Explore Skills <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  </section>
  );
};

export default Skills;
