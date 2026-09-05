import { useCallback, useEffect, useRef, useState } from "react";
import {
  Code2,
  Database,
  Layers,
  Landmark,
  Sparkles,
  Lightbulb,
  Rocket,
  Brain,
  Flame,
  Briefcase,
  GitBranch,
  Users,
  TrendingUp,
  Target,
  Zap,
  Bug,
  Server,
  CloudUpload,
  Hammer,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  X,
  LucideIcon,
} from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Section from "./Section";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type Item = {
  icon: LucideIcon;
  title: string;
  text: string;
  details: string;
  category: string;
};

const items: Item[] = [
  {
    icon: Code2,
    title: "Java Backend Expertise",
    text: "Strong foundation in Java backend development with JSP, Servlets, and JDBC.",
    details:
      "I've built robust server-side logic using core Java, JSP, Servlets, and JDBC. Comfortable with request lifecycle, session handling, and connecting Java apps to relational databases for production-style use cases.",
    category: "Technical Strength",
  },
  {
    icon: Layers,
    title: "Full-Stack Builder",
    text: "Experience building end-to-end full-stack applications.",
    details:
      "From designing UI screens to writing backend APIs and persisting data — I’ve shipped complete features end-to-end, integrating frontend, backend, and database layers into one cohesive product.",
    category: "Technical Strength",
  },
  {
    icon: Database,
    title: "Database & Queries",
    text: "Good understanding of database design and query optimization with MySQL.",
    details:
      "I design normalized schemas, write efficient SQL with joins and indexes, and tune slow queries. Comfortable modeling real-world entities and relationships for scalable data access.",
    category: "Technical Strength",
  },
  {
    icon: Landmark,
    title: "Banking System Project",
    text: "Built a banking system with authentication and transaction handling.",
    details:
      "Implemented user authentication, account creation, deposits, withdrawals, and transaction history with proper validation and data integrity — mirroring real banking workflows.",
    category: "Real-World Projects",
  },
  {
    icon: Sparkles,
    title: "Clean & Scalable Code",
    text: "Focus on writing clean, maintainable, and scalable code.",
    details:
      "I prioritize readability, modularity, and reusable components. My code follows consistent naming, separation of concerns, and is structured so future contributors can scale it easily.",
    category: "Real-World Projects",
  },
  {
    icon: Lightbulb,
    title: "Problem → Solution",
    text: "Ability to convert real-world problems into working software solutions.",
    details:
      "I break down ambiguous problems into clear requirements, design a working approach, and ship a usable solution — the engineer’s mindset of turning ideas into shipped features.",
    category: "Real-World Projects",
  },
  {
    icon: Rocket,
    title: "Fast Learner",
    text: "Quickly adapt to new technologies, tools, and frameworks.",
    details:
      "I pick up new stacks rapidly by reading docs, building small prototypes, and shipping. I’ve self-learned multiple frameworks outside my coursework whenever a project demanded it.",
    category: "Work Ethic",
  },
  {
    icon: Brain,
    title: "Logical Problem Solver",
    text: "Strong problem-solving approach with structured logical thinking.",
    details:
      "I approach problems methodically — clarify the goal, break it into steps, choose the right data structures, and validate edge cases before declaring it done.",
    category: "Work Ethic",
  },
  {
    icon: Flame,
    title: "Always Improving",
    text: "Passionate about continuous learning and self-improvement.",
    details:
      "I dedicate time weekly to learn new patterns, refactor old code, and explore better tools. Growth is a habit, not an event.",
    category: "Work Ethic",
  },
  {
    icon: Briefcase,
    title: "Industry-Style Projects",
    text: "Experience working on projects similar to real industry use-cases.",
    details:
      "My projects mimic real industry scenarios — auth, transactions, dashboards, deployments — so I’m comfortable with the patterns teams actually use in production.",
    category: "Professional Readiness",
  },
  {
    icon: GitBranch,
    title: "SDLC Awareness",
    text: "Basic understanding of the software development lifecycle.",
    details:
      "Familiar with requirements gathering, design, development, testing, deployment, and maintenance phases — and how Agile teams iterate through them.",
    category: "Professional Readiness",
  },
  {
    icon: Users,
    title: "Solo & Team Player",
    text: "Able to work both independently and in collaborative team environments.",
    details:
      "I can own a feature end-to-end on my own, and equally enjoy collaborating — pairing, code reviews, and aligning with teammates to ship together.",
    category: "Professional Readiness",
  },
  {
    icon: TrendingUp,
    title: "Growth Mindset",
    text: "Highly motivated to grow as a software engineer in fast-paced environments.",
    details:
      "I thrive on stretch goals and feedback. Fast-paced environments push me to learn quickly, take ownership, and level up faster.",
    category: "Career Drive",
  },
  {
    icon: Target,
    title: "Impact-Driven",
    text: "Interested in contributing to impactful and scalable applications.",
    details:
      "I want my code to matter — to be used, to scale, and to solve real problems. I prefer working on products where my contributions create visible impact.",
    category: "Career Drive",
  },
  {
    icon: Zap,
    title: "Startup Mindset",
    text: "Excited about building, shipping, and innovating real products.",
    details:
      "I love the build-ship-iterate loop. Comfortable wearing multiple hats, moving fast, and prioritizing what actually matters for users.",
    category: "Career Drive",
  },
  {
    icon: Bug,
    title: "Calm Under Pressure",
    text: "Ability to debug and fix issues efficiently when deadlines are tight.",
    details:
      "When things break close to a deadline, I stay calm, isolate the issue with logs and tests, and ship a fix without panicking — pressure sharpens focus.",
    category: "Engineering Edge",
  },
  {
    icon: Server,
    title: "Backend & System Design",
    text: "Strong interest in backend performance and system design fundamentals.",
    details:
      "Actively learning system design — caching, load balancing, database scaling, and API design — to build backends that perform well as they grow.",
    category: "Engineering Edge",
  },
  {
    icon: CloudUpload,
    title: "Deployment Ready",
    text: "Hands-on experience deploying projects using Netlify and Vercel.",
    details:
      "I’ve deployed multiple projects to Netlify and Vercel — managing build configs, environment variables, custom domains, and previews. I know how to take code from localhost to live URL.",
    category: "Engineering Edge",
  },
  {
    icon: Hammer,
    title: "Builder Mindset",
    text: "Built projects beyond academics with a real implementation focus.",
    details:
      "I build because I love it, not just for grades. My portfolio is full of self-driven projects that exist purely because I wanted to make them real.",
    category: "Engineering Edge",
  },
  {
    icon: BookOpen,
    title: "Learn by Building",
    text: "Always focused on learning by building, not just consuming theory.",
    details:
      "Tutorials are a starting point, not the goal. I cement concepts by building something real with them — that’s how I retain and master skills.",
    category: "Engineering Edge",
  },
];

const WhyHireMe = () => {
  const autoplayRef = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: false }),
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "center", containScroll: false },
    [autoplayRef.current],
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [openItem, setOpenItem] = useState<Item | null>(null);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();
  const scrollTo = (i: number) => emblaApi?.scrollTo(i);

  const handleOpen = (item: Item) => {
    autoplayRef.current?.stop();
    setOpenItem(item);
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setOpenItem(null);
      autoplayRef.current?.play();
    }
  };

  return (
    <Section id="why-hire-me" eyebrow="Why Hire Me" title="What I Bring to the Table">
      <div className="relative animate-fade-in hero-glass p-4 md:p-8">
        {/* Arrows */}
        <button
          onClick={scrollPrev}
          aria-label="Previous"
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full glass shadow-card items-center justify-center hover:shadow-elegant transition-smooth hover:-translate-x-0.5 -translate-x-2"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={scrollNext}
          aria-label="Next"
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full glass shadow-card items-center justify-center hover:shadow-elegant transition-smooth hover:translate-x-0.5 translate-x-2"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Carousel */}
        <div
          className="overflow-hidden px-2 md:px-10 py-6"
          ref={emblaRef}
          style={{
            maskImage:
              "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
          }}
        >
          <div className="flex gap-6">
            {items.map((item, i) => {
              const Icon = item.icon;
              const isActive = i === selectedIndex;
              return (
                <div
                  key={item.title}
                  className="shrink-0 grow-0 basis-[80%] sm:basis-[45%] lg:basis-[32%]"
                >
                  <article
                    className={`group relative h-full p-6 sm:p-8 rounded-2xl glass shadow-card transition-all duration-500 flex flex-col ${
                      isActive
                        ? "scale-100 md:scale-[1.04] shadow-elegant"
                        : "scale-95 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <div
                      className="absolute inset-0 rounded-2xl opacity-60 pointer-events-none"
                      style={{ background: "var(--gradient-mesh)" }}
                    />
                    <div className="relative flex flex-col h-full">
                      <div className="flex items-center gap-4 mb-5">
                        <div className="shrink-0 w-14 h-14 rounded-xl flex items-center justify-center gradient-primary shadow-glow">
                          <Icon className="w-7 h-7 text-primary-foreground" />
                        </div>
                        <span className="text-[10px] uppercase tracking-widest text-primary dark:text-accent font-semibold">
                          {item.category}
                        </span>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-bold text-foreground leading-snug mb-3">
                        {item.title}
                      </h3>

                      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed line-clamp-3 flex-1">
                        {item.text}
                      </p>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpen(item)}
                        className="mt-5 self-start text-primary hover:text-primary hover:bg-primary/10 px-3"
                      >
                        Read more →
                      </Button>
                    </div>
                  </article>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dots */}
        <div className="flex flex-wrap justify-center gap-2 mt-8">
          {scrollSnaps.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === selectedIndex
                  ? "w-8 bg-primary"
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Modal */}
      <Dialog open={!!openItem} onOpenChange={handleClose}>
        <DialogContent className="max-w-lg">
          {openItem && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4 mb-2">
                  <div className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center gradient-primary shadow-glow">
                    <openItem.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-primary dark:text-accent font-semibold">
                    {openItem.category}
                  </span>
                </div>
                <DialogTitle className="text-2xl">{openItem.title}</DialogTitle>
                <DialogDescription className="text-base text-muted-foreground leading-relaxed pt-2">
                  {openItem.details}
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end pt-4">
                <Button variant="outline" onClick={() => handleClose(false)}>
                  <X className="w-4 h-4 mr-1" /> Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Section>
  );
};

export default WhyHireMe;
