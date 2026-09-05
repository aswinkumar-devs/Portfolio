import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Braces, MousePointer2, ArrowLeft } from "lucide-react";
import SkillsGlobe from "@/components/SkillsGlobe";

const SkillsUniverse = () => {
  const navigate = useNavigate();

  const goBack = () => {
    sessionStorage.setItem("portfolio:returnToSkills", "1");
    navigate("/", { replace: true });
  };

  return (
    <motion.main
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="skills-universe-bg relative min-h-screen w-full overflow-hidden text-foreground"
    >
      <div className="absolute top-6 left-6 z-20 flex items-center gap-2 text-sm font-mono text-muted-foreground">
        <Braces size={16} className="text-primary" />
        <span># Skills.json</span>
      </div>

      <button
        onClick={goBack}
        className="fixed top-5 right-5 z-30 inline-flex items-center gap-2 rounded-full border border-primary/60 bg-background/80 px-5 py-2.5 text-sm font-medium text-foreground shadow-[0_0_20px_hsl(var(--primary)/0.35)] backdrop-blur-md transition-all hover:border-primary hover:shadow-[0_0_30px_hsl(var(--primary)/0.6)] hover:-translate-y-0.5"
      >
        <ArrowLeft size={16} className="text-primary" /> Back to portfolio
      </button>

      <div className="min-h-screen flex items-center justify-center px-4">
        <SkillsGlobe />
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 text-xs text-muted-foreground">
        <MousePointer2 size={13} className="rounded-full" />
        <span>Drag to explore skills universe</span>
      </div>
    </motion.main>
  );
};

export default SkillsUniverse;
