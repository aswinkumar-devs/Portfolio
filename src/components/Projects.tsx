import { motion } from "framer-motion";
import { Bot, ShieldCheck, Globe, ArrowUpRight, Landmark, ExternalLink, DatabaseZap, FileText } from "lucide-react";
import Section from "./Section";
import { Button } from "@/components/ui/button";
import captchaImg from "@/assets/project-captcha.png";
import ravaImg from "@/assets/project-rava.png";
import portfolioImg from "@/assets/project-portfolio.png";
import hydraImage from "@/assets/hydraetl-dashboard.svg";
import bankingImage from "@/assets/project-banking.svg";

type Project = {
  icon: typeof Bot;
  title: string;
  desc: string;
  tags: string[];
  image?: string;
  liveUrl?: string;
  documentUrl?: string;
};

const projects: Project[] = [
  {
    icon: DatabaseZap,
    title: "HydraETL",
    desc: "A concurrent, memory-bounded ETL engine that streams multi-gigabyte files through a Go worker-pool pipeline into MongoDB with batched writes, graceful shutdown, and a real-time monitoring dashboard.",
    tags: ["Go", "Gin", "MongoDB", "React", "Tailwind CSS", "Docker"],
    image: hydraImage,
    documentUrl: "file:///home/aswinkumar/Downloads/HydraETL-portfolio-content.md",
  },
  {
    icon: Bot,
    title: "RAVA – Personal AI Assistant",
    desc: "A voice-enabled personal assistant that handles everyday tasks via natural language and integrates with multiple APIs.",
    tags: ["Python", "Flask", "APIs"],
    image: ravaImg,
    liveUrl: "https://rava-chatbot.netlify.app/",
  },
  {
    icon: ShieldCheck,
    title: "Game-Based CAPTCHA Replacement",
    desc: "An interactive game-based bot prevention system that improves UX while staying secure against automated attacks.",
    tags: ["Node.js", "MongoDB", "JavaScript"],
    image: captchaImg,
    liveUrl: "https://v0-mass-db.vercel.app/",
  },
  {
    icon: Globe,
    title: "Portfolio & E-commerce Sites",
    desc: "Modern responsive frontends with smooth animations, clean layouts, and accessible design patterns.",
    tags: ["HTML", "CSS", "JavaScript"],
    image: portfolioImg,
    liveUrl: "https://aswinkumar-m.netlify.app/",
  },
  {
    icon: Landmark,
    title: "Banking Application",
    desc: "A web-based banking system supporting account management, secure transactions, and balance tracking with a clean JSP-driven UI.",
    tags: ["Java", "JDBC", "Servlet", "JSP"],
    image: bankingImage,
    documentUrl: "#contact",
  },
];

const Projects = () => (
  <Section id="projects" eyebrow="Things I've built" title="Projects">
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      {projects.map((p, i) => (
        <motion.article
          key={p.title}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          className="group glass relative mt-6 flex min-h-[300px] flex-col overflow-visible rounded-3xl transition-transform duration-300 ease-out hover:-translate-y-1.5 hover:shadow-elegant"
        >
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 z-30 h-8 w-8 rounded-full border border-border bg-background/70 backdrop-blur-md"
          >
            <a
              href={p.liveUrl ?? p.documentUrl ?? p.image}
              target={(p.liveUrl ?? p.documentUrl)?.startsWith("#") ? undefined : "_blank"}
              rel={(p.liveUrl ?? p.documentUrl)?.startsWith("#") ? undefined : "noreferrer"}
              aria-label={`Open ${p.title}`}
              title={`Open ${p.title}`}
            >
              <ArrowUpRight size={16} />
            </a>
          </Button>

          {p.image ? (
            <a
              href={p.liveUrl ?? p.documentUrl ?? p.image}
              target={(p.liveUrl ?? p.documentUrl)?.startsWith("#") ? undefined : "_blank"}
              rel={(p.liveUrl ?? p.documentUrl)?.startsWith("#") ? undefined : "noreferrer"}
              className="absolute -right-12 -top-5 z-10 block h-36 w-[62%] origin-center -rotate-[9deg] overflow-hidden rounded-xl border border-border bg-muted shadow-elegant transition-transform duration-300 ease-out group-hover:-translate-x-2 group-hover:translate-y-1 group-hover:rotate-0 group-hover:scale-[1.04] md:-right-14 md:h-40"
              aria-label={`View ${p.title}`}
            >
              <img src={p.image} alt={`${p.title} project interface`} loading="lazy" width={1600} height={912} className="h-full w-full object-cover object-center" />
            </a>
          ) : (
            <div className="absolute right-10 top-14 flex h-28 w-32 -rotate-[9deg] items-center justify-center rounded-lg border border-border bg-muted shadow-elegant transition-transform duration-300 group-hover:rotate-0 group-hover:scale-[1.03]">
              <p.icon size={42} className="text-primary dark:text-accent" />
            </div>
          )}

          <div className="relative z-20 flex flex-1 flex-col p-5 pt-6">
            <div className="flex min-h-28 max-w-[44%] flex-col md:min-h-32">
              <div className="mb-3 inline-flex w-fit rounded-xl p-2 gradient-primary text-primary-foreground shadow-glow">
                <p.icon size={20} />
              </div>
              <h3 className="text-2xl font-bold leading-tight">{p.title}</h3>
            </div>

            <div className="mt-auto pt-5">
              <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{p.desc}</p>
              <div className="mb-5 flex flex-wrap gap-1.5">
                {p.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] font-medium text-primary dark:text-accent"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                {p.liveUrl && (
                  <a
                    href={p.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-all hover:gap-3 dark:text-accent"
                  >
                    <ExternalLink size={14} /> Live Demo
                  </a>
                )}
                {p.documentUrl && (
                  <a
                    href={p.documentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-all hover:gap-3 dark:text-accent"
                  >
                    <FileText size={14} /> Documentation
                  </a>
                )}
              </div>
              {!p.liveUrl && !p.documentUrl && (
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-all hover:gap-3 dark:text-accent"
                >
                  <ArrowUpRight size={14} /> Ask about project
                </a>
              )}
            </div>
          </div>
        </motion.article>
      ))}
    </div>
  </Section>
);

export default Projects;
