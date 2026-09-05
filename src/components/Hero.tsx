import { motion } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import { Download, Mail, FileText, X, Terminal, Layers } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

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
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center px-6 pt-24 overflow-hidden"
    >
      {/* organic morphing blob */}
      <div className="hero-blob" aria-hidden="true" />


      <div className="relative z-10 max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center lg:text-left hero-glass p-6 md:p-10"
        >
          <span className="inline-block px-4 py-1 rounded-full glass text-xs uppercase tracking-widest text-primary dark:text-accent mb-6">
            👋 Welcome to my portfolio
          </span>
          <h1 className="text-4xl md:text-5xl xl:text-6xl font-bold leading-tight mb-4 overflow-visible">
            <span className="block">Hi, I'm</span>
            <span className="gradient-text inline-block overflow-visible cursor-default pr-[0.25em] pb-3 leading-[1.25]">
              Aswin Kumar M
            </span>
          </h1>

          <h2 className="text-2xl md:text-3xl font-medium text-muted-foreground mb-6 min-h-[2.5rem] flex items-center justify-center lg:justify-start">
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
          <p className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8">
            💻 B.E. CSE student passionate about developing scalable software solutions using Core Java, J2EE, and modern web technologies while transforming innovative ideas into efficient real-world applications.
          </p>

          <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
            <button
              onClick={() => scrollTo("contact")}
              className="px-6 py-3 rounded-full gradient-primary text-primary-foreground font-medium shadow-glow hover:scale-105 transition-smooth flex items-center gap-2"
            >
              <Mail size={18} /> Hire Me
            </button>
            <button
              onClick={() => setResumeOpen(true)}
              className="px-6 py-3 rounded-full glass font-medium hover:bg-primary/10 transition-smooth flex items-center gap-2"
            >
              <FileText size={18} /> Resume
            </button>
          </div>

          <div className="flex gap-4 mt-8 justify-center lg:justify-start">
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
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative flex justify-center"
        >
          <div className="relative w-72 h-72 md:w-96 md:h-96">
            <div className="absolute inset-0 rounded-full gradient-primary blur-2xl opacity-60 animate-pulse" />
            <div className="absolute inset-0 rounded-full gradient-primary p-1.5 shadow-elegant">
              <div className="w-full h-full rounded-full overflow-hidden bg-card">
                <img
                  src={profile}
                  alt="Aswin Kumar M"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            {/* floating badges */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="absolute -top-3 -right-3 glass px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-2"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-md border border-primary/50 bg-primary/10 text-primary">
                <Terminal size={14} />
              </span>
              Go Backend Developer
            </motion.div>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 3, delay: 1 }}
              className="absolute -bottom-3 -left-3 glass px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-2"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-md border border-primary/50 bg-primary/10 text-primary">
                <Layers size={14} />
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
          <div className="flex shrink-0 items-center justify-between gap-3 px-6 py-4 border-b border-primary/25">
            <h3 className="text-2xl font-bold gradient-text pr-1">Resume</h3>
            <div className="flex items-center gap-3">
              <a
                href="/resume.pdf"
                download="Aswin_Kumar_M_Resume.pdf"
                className="px-5 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold flex flex-col items-center gap-0.5 shadow-glow hover:scale-105 transition-smooth"
              >
                <Download size={18} />
                Download
              </a>
              <button
                onClick={() => setResumeOpen(false)}
                className="p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-smooth"
                aria-label="Close resume"
              >
                <X size={22} />
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
