import { useEffect, useLayoutEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import WorkExperience from "@/components/WorkExperience";
import Skills from "@/components/Skills";
import Education from "@/components/Education";
import Projects from "@/components/Projects";
import WhyHireMe from "@/components/WhyHireMe";
import Contact from "@/components/Contact";

const Index = () => {
  const { hash } = useLocation();
  const [returningToSkills] = useState(
    () => sessionStorage.getItem("portfolio:returnToSkills") === "1",
  );

  // Restore before paint so the hero is never shown during the return transition.
  useLayoutEffect(() => {
    if (!returningToSkills) return;
    window.history.scrollRestoration = "manual";
    sessionStorage.removeItem("portfolio:returnToSkills");
    const saved = Number(sessionStorage.getItem("portfolio:scrollY") ?? "0");
    const skillsTop = document.getElementById("skills")?.offsetTop ?? 0;
    const root = document.documentElement;
    const previousBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    window.scrollTo({ top: saved > 0 ? saved : skillsTop, behavior: "auto" });
    const frame = window.requestAnimationFrame(() => {
      root.style.scrollBehavior = previousBehavior;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [returningToSkills]);

  useEffect(() => {
    if (!hash) return;
    const id = hash.slice(1);
    const t = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
    return () => window.clearTimeout(t);
  }, [hash]);

  return (
    <motion.div
      initial={returningToSkills ? { opacity: 0, scale: 0.98 } : false}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: returningToSkills ? 0.45 : 0, ease: "easeOut" }}
    >
      <Navbar />
      <main className="min-h-screen relative z-10">
        <Hero />
        <About />
        <WorkExperience />
        <Skills />
        <Education />
        <Projects />
        <WhyHireMe />
        <Contact />
      </main>
    </motion.div>
  );
};

export default Index;
