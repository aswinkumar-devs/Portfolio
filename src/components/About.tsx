import { motion } from "framer-motion";
import { Briefcase, Code2, GraduationCap, Cpu, MapPin } from "lucide-react";
import Section from "./Section";
import Counters from "./Counters";

const milestones = [
  {
    icon: Briefcase,
    colorClass: "bg-blue-500/10 text-blue-500 dark:text-blue-400 border-blue-500/20",
    role: "Trainee Go Backend Dev",
    org: "Sterna Security Solutions",
    detail: "Go • Gin • Concurrency",
  },
  {
    icon: Code2,
    colorClass: "bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/20",
    role: "Java Full Stack Certified",
    org: "QSpiders Coimbatore",
    detail: "J2EE • Hibernate • JDBC",
  },
  {
    icon: GraduationCap,
    colorClass: "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/20",
    role: "B.E. Computer Science",
    org: "Park College of Engg & Tech",
    detail: "2022–2026 • CGPA 8.41",
  },
  {
    icon: Cpu,
    colorClass: "bg-purple-500/10 text-purple-500 dark:text-purple-400 border-purple-500/20",
    role: "AI & Data Science Intern",
    org: "NSIC Technical Center",
    detail: "Python • ML Pipelines",
  },
];

const SKILL_TAGS = [
  "Go (Gin)",
  "Goroutines",
  "Mutex Safety",
  "Java / J2EE",
  "Hibernate",
  "MySQL",
  "MongoDB",
  "JWT Auth",
  "REST APIs",
];

const About = () => (
  <Section id="about" eyebrow="Who I am" title="About Me">
    <div className="grid min-w-0 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
      {/* Left Column: Compact Narrative Story */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.5 }}
        className="lg:col-span-7 min-w-0 glass rounded-2xl p-5 sm:p-6 shadow-card flex flex-col justify-between"
      >
        <div>
          {/* Header Badge */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-3 mb-3.5">
            <div className="flex items-center gap-2 text-xs font-mono font-medium text-primary dark:text-accent uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span>Full Stack & Backend Developer</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
              <MapPin size={12} className="text-primary/70" />
              <span>Coimbatore, Tamil Nadu</span>
            </div>
          </div>

          {/* Narrative Content */}
          <div className="space-y-2.5 text-xs sm:text-sm leading-relaxed text-muted-foreground">
            <p>
              I'm a <span className="text-foreground font-semibold">Go / Java Full Stack Developer</span> and 
              2026 B.E. Computer Science graduate from <span className="text-foreground font-semibold">Park College of Engineering & Technology (CGPA: 8.41)</span>, 
              focused on building robust monolithic backend architectures, concurrent services, and secure REST APIs.
            </p>
            <p>
              Currently working as a <span className="text-foreground font-semibold">Trainee Software Engineer at Sterna Security Solutions</span>, 
              building high-performance Go services with Gin and GORM. I engineer concurrent systems using Go-routines, worker queues, and Mutex 
              thread safety, while implementing JWT authentication, task scheduling, pagination, and graceful shutdowns.
            </p>
            <p>
              Certified in <span className="text-foreground font-semibold">Java Full Stack Development from QSpiders</span> (Core Java, J2EE, Hibernate, JDBC) 
              and trained in AI/ML at <span className="text-foreground font-semibold">NSIC</span>, I pair database optimization in MySQL and MongoDB with responsive, clean web frontends.
            </p>
          </div>
        </div>

        {/* Competency Tags */}
        <div className="mt-4 pt-3 border-t border-border/40 flex flex-wrap gap-1.5">
          {SKILL_TAGS.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-[11px] font-medium text-foreground/80 transition-colors hover:border-primary/50 hover:bg-primary/10"
            >
              {tag}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Right Column: 4 Compact Milestone Cards */}
      <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5 sm:gap-3">
        {milestones.map((m, i) => (
          <motion.div
            key={m.role}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className="glass rounded-xl p-3 sm:p-3.5 hover:shadow-glow hover:-translate-y-0.5 transition-smooth flex items-center gap-3 border border-border/40"
          >
            <div className={`shrink-0 p-2 rounded-lg border ${m.colorClass}`}>
              <m.icon size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xs sm:text-sm font-bold text-foreground leading-snug truncate">
                {m.role}
              </h3>
              <div className="text-[11px] font-mono text-primary dark:text-accent font-medium truncate">
                {m.org}
              </div>
              <div className="text-[10.5px] text-muted-foreground truncate">
                {m.detail}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>

    {/* Compact Metrics Strip */}
    <Counters />
  </Section>
);

export default About;
