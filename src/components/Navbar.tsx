import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { Button } from "@/components/ui/button";

const links = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
  { id: "education", label: "Education" },
  { id: "projects", label: "Projects" },
  { id: "why-hire-me", label: "Why Hire Me" },
  { id: "contact", label: "Contact" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30);
      const y = window.scrollY + 120;
      const hero = document.getElementById("home");
      // nothing highlighted while still within the hero / at the very top
      if (hero && y < hero.offsetTop + hero.offsetHeight) {
        setActive("");
        return;
      }
      let current = "";
      for (const l of links) {
        const el = document.getElementById(l.id);
        if (el && el.offsetTop <= y && el.offsetTop + el.offsetHeight > y) {
          current = l.id;
        }
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const closeOnDesktop = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("resize", closeOnDesktop);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("resize", closeOnDesktop);
    };
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    window.dispatchEvent(new CustomEvent("portfolio:navigate", { detail: id }));
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-smooth ${
        scrolled ? "glass shadow-card" : "bg-transparent"
      }`}
      style={{ position: "fixed" }}
    >
      <nav aria-label="Main navigation" className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <Button variant="ghost"
          onClick={() => {
            document.getElementById("home")?.scrollIntoView({ behavior: "smooth" });
            setActive("");
            window.dispatchEvent(new CustomEvent("portfolio:navigate", { detail: "home" }));
          }}
          className="h-auto p-0 text-lg sm:text-xl font-bold gradient-text hover:bg-transparent hover:scale-105 transition-smooth flex items-center group"
          aria-label="Go to home"
          title="Home"
        >
          <span>AK<span className="text-foreground">.</span></span>
        </Button>

        <ul className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <li key={l.id}>
              <Button variant="ghost"
                onClick={() => go(l.id)}
                className={`h-auto px-4 py-2 rounded-full text-sm font-medium transition-smooth ${
                  active === l.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {l.label}
              </Button>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <ThemeToggle />
          <Button variant="ghost" size="icon"
            aria-label="Toggle menu"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            className="lg:hidden h-10 w-10 sm:h-9 sm:w-9 p-2 rounded-lg glass"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>
      </nav>

      {open && (
        <div id="mobile-navigation" className="lg:hidden max-h-[calc(100dvh-4.5rem)] overflow-y-auto border-t border-border bg-background/95 backdrop-blur-xl">
          <ul className="px-4 sm:px-6 py-3 sm:py-4 flex flex-col gap-1.5 sm:gap-2">
            {links.map((l) => (
              <li key={l.id}>
                <Button variant="ghost"
                  onClick={() => go(l.id)}
                  className={`h-auto w-full justify-start text-left px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-lg text-sm hover:bg-primary/10 transition-smooth ${active === l.id ? "bg-primary/10 text-primary" : ""}`}
                >
                  {l.label}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
};

export default Navbar;
