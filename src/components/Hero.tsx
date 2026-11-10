import { motion } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import { Download, Mail, FileText, X, Terminal, Layers } from "lucide-react";
import { useState, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";

const Linkedin = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={20} height={20} {...props}>
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 110-4.13 2.06 2.06 0 010 4.13zM7.12 20.45H3.56V9h3.56v11.45z"/>
  </svg>
);
const Github = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={20} height={20} {...props}>
    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.34-1.28-1.7-1.28-1.7-1.04-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11.04 11.04 0 015.79 0c2.21-1.49 3.18-1.18 3.18-1.18.62 1.58.23 2.75.11 3.04.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.68.8.56A11.5 11.5 0 0023.5 12C23.5 5.65 18.35.5 12 .5z"/>
  </svg>
);
import profile from "@/assets/profile.jpg";

const Hero = () => {
  const [resumeOpen, setResumeOpen] = useState(false);
  const photoRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 });
  const [isHovering, setIsHovering] = useState(false);

  const handlePhotoMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = photoRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotateY = (x / (rect.width / 2)) * 10;
    const rotateX = -(y / (rect.height / 2)) * 10;
    const glareX = ((e.clientX - rect.left) / rect.width) * 100;
    const glareY = ((e.clientY - rect.top) / rect.height) * 100;
    setTilt({ rotateX, rotateY, glareX, glareY });
  };

  const handlePhotoMouseLeave = () => {
    setIsHovering(false);
    setTilt({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 });
  };

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

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    window.dispatchEvent(new CustomEvent("portfolio:navigate", { detail: id }));
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center px-4 pt-24 pb-24 sm:px-6 lg:pb-0 overflow-hidden"
    >
      {/* organic morphing blob */}
      <div className="hero-blob" aria-hidden="true" />


      <div className="relative z-10 w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center lg:text-left hero-glass min-w-0 p-2 sm:p-6 md:p-10"
        >
          <span className="inline-block px-4 py-1 rounded-full glass text-xs uppercase tracking-widest text-primary dark:text-accent mb-6">
            👋 Welcome to my portfolio
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl xl:text-6xl font-bold leading-tight mb-4 overflow-visible">
            <span className="block">Hi, I'm</span>
            <span className="gradient-text inline-block overflow-visible cursor-default sm:pr-[0.25em] pb-3 leading-[1.25]">
              Aswin Kumar M
            </span>
          </h1>

          <h2 className="text-lg sm:text-2xl md:text-3xl font-medium text-muted-foreground mb-4 sm:mb-6 min-h-[3.5rem] sm:min-h-[2.5rem] flex flex-wrap items-center justify-center lg:justify-start">
            <span className="text-foreground/80">I'm a&nbsp;</span>
            <TypeAnimation
              sequence={[
                3000,
                "Java Developer", 1500,
                "Web Developer", 1500,
                "Software Developer", 1500,
                "Backend Developer", 1500,
                "Go-lang Developer", 1500,
              ]}
              speed={50}
              deletionSpeed={70}
              repeat={Infinity}
              cursor={false}
              className="gradient-text font-semibold"
            />
            <span className="typed-cursor h-7 md:h-8" aria-hidden="true" />
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-6 sm:mb-8">
            💻 B.E. CSE student passionate about developing scalable software solutions using Core Java, J2EE, and modern web technologies while transforming innovative ideas into efficient real-world applications.
          </p>

          <div className="flex flex-wrap gap-3 sm:gap-4 justify-center lg:justify-start">
            <button
              onClick={() => scrollTo("contact")}
              className="px-6 py-3 rounded-full gradient-primary text-primary-foreground font-medium shadow-glow hover:scale-105 transition-smooth flex items-center gap-2"
            >
              <Mail size={18} /> Hire Me
            </button>
            <button
              onClick={handleResumeClick}
              className="px-6 py-3 rounded-full glass font-medium hover:bg-primary/10 transition-smooth flex items-center gap-2"
            >
              <FileText size={18} /> Resume
            </button>
          </div>

          <div className="flex gap-4 mt-6 sm:mt-8 justify-center lg:justify-start">
            <a
              href="https://www.linkedin.com/in/aswin-kumar-backend-developer/"
              target="_blank"
              rel="noreferrer"
              className="p-3 rounded-full glass hover:bg-primary/20 hover:scale-110 transition-smooth"
              aria-label="LinkedIn"
            >
              <Linkedin width={20} height={20} />
            </a>
            <a
              href="mailto:mass07.webdev@gmail.com"
              className="p-3 rounded-full glass hover:bg-primary/20 hover:scale-110 transition-smooth"
              aria-label="Email"
            >
              <Mail size={20} />
            </a>
            <a
              href="https://github.com/aswinkumar-devs"
              target="_blank"
              rel="noreferrer"
              className="p-3 rounded-full glass hover:bg-primary/20 hover:scale-110 transition-smooth"
              aria-label="GitHub"
            >
              <Github width={20} height={20} />
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.72, y: 54, rotateY: -16 }}
          animate={{ opacity: 1, scale: 1, y: 0, rotateY: 0 }}
          transition={{ type: "spring", stiffness: 92, damping: 13, delay: 0.2 }}
          className="relative flex justify-center"
          style={{ perspective: 1200 }}
        >
          <div className="relative w-60 h-[17.6rem] sm:w-[17rem] sm:h-[19.8rem] md:w-80 md:h-[24rem]">
            <motion.div
              aria-hidden="true"
              animate={{ scale: [0.94, 1.04, 0.94], opacity: [0.35, 0.58, 0.35] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -inset-4 rounded-[2.4rem] gradient-primary blur-2xl"
            />
            <div
              ref={photoRef}
              onMouseMove={handlePhotoMouseMove}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={handlePhotoMouseLeave}
              className="absolute inset-0 rounded-[2rem] shadow-elegant will-change-transform"
              style={{
                transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale(${isHovering ? 1.035 : 1})`,
                padding: isHovering ? 0 : "6px",
                transition: isHovering
                  ? "transform 0.12s ease-out, padding 0.45s ease"
                  : "transform 0.55s cubic-bezier(0.22, 1, 0.36, 1), padding 0.45s ease",
                transformStyle: "preserve-3d",
              }}
            >
              {/* gradient border layer — fades out smoothly on hover */}
              <div
                aria-hidden="true"
                className="absolute -inset-0 rounded-[2rem] gradient-primary pointer-events-none"
                style={{
                  opacity: isHovering ? 0 : 1,
                  transition: "opacity 0.45s ease",
                }}
              />
              <div
                className="relative w-full h-full overflow-hidden bg-card"
                style={{
                  borderRadius: isHovering ? "2rem" : "1.65rem",
                  transition: "border-radius 0.45s ease",
                }}
              >
                <img
                  src={profile}
                  alt="Aswin Kumar M"
                  className="w-full h-full object-cover"
                  style={{ transform: "translateZ(24px)", objectPosition: "center 25%" }}
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300"
                  style={{
                    opacity: isHovering ? 0.28 : 0,
                    background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, hsl(var(--primary-foreground) / 0.8), transparent 34%)`,
                    transform: "translateZ(36px)",
                  }}
                />
              </div>
            </div>
            {/* floating badges */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="absolute -top-3 right-0 sm:-right-5 glass px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-[11px] sm:text-sm font-medium whitespace-nowrap flex items-center gap-1.5 sm:gap-2 shadow-card"
              style={{ transform: "translateZ(54px)" }}
            >
              <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-md border border-primary/50 bg-primary/10 text-primary">
                <Terminal size={12} className="sm:hidden" />
                <Terminal size={14} className="hidden sm:inline" />
              </span>
              Go Backend Developer
            </motion.div>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 3, delay: 1 }}
              className="absolute -bottom-3 left-0 sm:-left-5 glass px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-[11px] sm:text-sm font-medium whitespace-nowrap flex items-center gap-1.5 sm:gap-2 shadow-card"
              style={{ transform: "translateZ(54px)" }}
            >
              <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-md border border-primary/50 bg-primary/10 text-primary">
                <Layers size={12} className="sm:hidden" />
                <Layers size={14} className="hidden sm:inline" />
              </span>
              Software Developer
            </motion.div>
          </div>
        </motion.div>
      </div>

      <button
        onClick={() => scrollTo("about")}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 p-3 group cursor-pointer"
        aria-label="Scroll down"
      >
        <span className="block w-7 h-11 rounded-full border-2 border-muted-foreground/60 group-hover:border-primary transition-colors relative">
          <motion.span
            animate={{ y: [0, 14, 0], opacity: [1, 0, 1] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
            className="absolute left-1/2 top-2 w-1.5 h-1.5 -ml-[3px] rounded-full bg-muted-foreground group-hover:bg-primary"
          />
        </span>
      </button>

      <Dialog open={resumeOpen} onOpenChange={setResumeOpen}>
        <DialogContent className="max-w-4xl w-[95vw] h-[88vh] p-0 overflow-hidden flex flex-col gap-0 border border-primary/40 bg-background/95 shadow-[0_0_60px_hsl(var(--primary)/0.35)] rounded-2xl [&>button]:hidden">
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
                className="px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-xl gradient-primary text-primary-foreground text-xs sm:text-sm font-semibold flex items-center sm:flex-col gap-1 sm:gap-0.5 shadow-glow hover:scale-105 transition-smooth"
              >
                <Download size={15} />
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
    </section>
  );
};

export default Hero;
