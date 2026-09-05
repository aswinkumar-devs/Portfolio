import { motion } from "framer-motion";
import { Briefcase, Building2, Calendar, Sparkles, MapPin } from "lucide-react";
import Section from "./Section";

interface Experience {
  role: string;
  company: string;
  duration: string;
  location?: string;
  responsibilities: string[];
  status: "current" | "upcoming";
}

const experiences: Experience[] = [
  {
    role: "Trainee Software Engineer (Go Backend Developer)",
    company: "Sterna Security Solutions",
    duration: "May 2026 – Present",
    status: "current",
    responsibilities: [
      "Building production-ready REST APIs",
      "Developing monolithic backend applications",
      "Gin Framework",
      "GORM",
      "MongoDB Aggregation",
      "SQL Optimization",
      "JWT Authentication",
      "Scheduling",
      "Concurrent TCP Server Development",
      "Goroutines",
      "Channels",
      "Mutex / RWMutex",
      "Atomic Operations",
      "Worker Queue Implementation",
      "Logging",
      "Swagger Documentation",
      "Graceful Shutdown",
      "API Pagination & Filtering",
      "API Testing / Postman",
    ],
  },
];

const TimelineNode = ({ status }: { status: Experience["status"] }) => (
  <div className="relative flex flex-col items-center shrink-0">
    <div className="relative">
      {status === "current" && (
        <span className="absolute inset-0 rounded-full gradient-primary opacity-60 blur-md animate-pulse" />
      )}
      <div
        className={
          status === "current"
            ? "relative w-5 h-5 rounded-full gradient-primary shadow-glow ring-4 ring-background"
            : "relative w-5 h-5 rounded-full bg-background border-2 border-solid border-primary/50 ring-4 ring-background"
        }
      />
    </div>
  </div>
);

const ExperienceCard = ({ exp, index }: { exp: Experience; index: number }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: false, amount: 0.2 }}
    transition={{ duration: 0.6, delay: index * 0.1 }}
    className="relative flex gap-6"
  >
    <TimelineNode status={exp.status} />

    <div className="flex-1 pb-12">
      <div
        className={
          exp.status === "current"
            ? "glass rounded-3xl p-8 shadow-card hover:shadow-elegant transition-smooth relative overflow-hidden"
            : "rounded-3xl p-8 border-2 border-solid border-primary/30 bg-card/20 backdrop-blur-sm relative overflow-hidden"
        }
      >
        {exp.status === "current" && (
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary/20 blur-3xl" />
        )}

        <div className="flex items-start gap-5 relative">
          <div
            className={
              exp.status === "current"
                ? "p-4 rounded-2xl gradient-primary text-primary-foreground shadow-glow shrink-0"
                : "p-4 rounded-2xl bg-muted text-muted-foreground shrink-0"
            }
          >
            {exp.status === "current" ? <Briefcase size={28} /> : <Sparkles size={28} />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span
                className={
                  exp.status === "current"
                    ? "text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary/15 text-primary dark:text-accent"
                    : "text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                }
              >
                {exp.status === "current" ? "Current" : "Upcoming"}
              </span>
            </div>
            <h3 className="text-2xl font-bold mb-1">{exp.role}</h3>
            <p className="text-primary dark:text-accent font-medium mb-3 flex items-center gap-2">
              <Building2 size={16} />
              {exp.company}
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
              <span className="flex items-center gap-2">
                <Calendar size={16} /> {exp.duration}
              </span>
              {exp.location && (
                <span className="flex items-center gap-2">
                  <MapPin size={16} /> {exp.location}
                </span>
              )}
            </div>

            {exp.responsibilities.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Responsibilities
                </h4>
                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
                  {exp.responsibilities.map((item) => (
                    <div key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

const WorkExperience = () => (
  <Section id="experience" eyebrow="My professional journey" title="Work Experience">
    <div className="max-w-3xl mx-auto relative">
      {/* Vertical flow line — grows in as the section scrolls into view */}
      <motion.div
        initial={{ scaleY: 0, opacity: 0.2 }}
        whileInView={{ scaleY: 1, opacity: 1 }}
        viewport={{ once: false, amount: 0.15 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute left-[9px] top-2 bottom-2 w-0.5 origin-top pointer-events-none gradient-primary rounded-full shadow-[0_0_10px_hsl(var(--primary)/0.8),0_0_22px_hsl(var(--primary)/0.45)]"
        aria-hidden
      />



      <div className="relative">
        {experiences.map((exp, i) => (
          <ExperienceCard key={exp.company + exp.role} exp={exp} index={i} />
        ))}

        {/* Future placeholder node */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="relative flex gap-6 items-center"
        >
          <div className="relative flex flex-col items-center shrink-0">
            <span className="absolute inset-0 rounded-full gradient-primary opacity-40 blur-md animate-pulse" />
            <div className="relative w-5 h-5 rounded-full gradient-primary opacity-80 ring-4 ring-background" />
          </div>
          <div className="flex-1 py-4">
            <p className="text-sm text-muted-foreground italic">
              The next chapter — coming soon.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  </Section>
);

export default WorkExperience;
