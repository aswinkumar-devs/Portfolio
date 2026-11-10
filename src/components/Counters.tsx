import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";
import { Rocket, Briefcase, Code2, Sparkles } from "lucide-react";

interface CounterItem {
  icon: typeof Rocket;
  label: string;
  value: number;
  suffix?: string;
  decimals?: number;
}

const items: CounterItem[] = [
  { icon: Rocket, label: "Projects Completed", value: 4, suffix: "+" },
  { icon: Briefcase, label: "Industry Experience", value: 1, suffix: " yr" },
  { icon: Code2, label: "Core Technologies", value: 10, suffix: "+" },
  { icon: Sparkles, label: "Cumulative CGPA", value: 8.41, decimals: 2 },
];

const Counter = ({ to, suffix = "", decimals = 0 }: { to: number; suffix?: string; decimals?: number }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { amount: 0.5 });
  const mv = useMotionValue(0);
  const formatted = useTransform(mv, (v) => (decimals > 0 ? v.toFixed(decimals) : Math.round(v).toString()));

  useEffect(() => {
    if (inView) {
      mv.set(0);
      const controls = animate(mv, to, { duration: 1.6, ease: "easeOut" });
      return controls.stop;
    }
  }, [inView, to, mv]);

  return (
    <span ref={ref} className="inline-flex items-baseline">
      <motion.span>{formatted}</motion.span>
      {suffix && <span>{suffix}</span>}
    </span>
  );
};

const Counters = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 sm:mt-8">
    {items.map((it, i) => (
      <motion.div
        key={it.label}
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.4, delay: i * 0.08, ease: "easeOut" }}
        className="glass rounded-xl p-3 sm:p-4 text-center hover:shadow-glow hover:-translate-y-0.5 transition-smooth flex flex-col items-center justify-center border border-border/40"
      >
        <div className="flex items-center gap-2 mb-1">
          <it.icon size={16} className="text-primary dark:text-accent" />
          <span className="text-lg sm:text-xl md:text-2xl font-bold gradient-text">
            <Counter to={it.value} suffix={it.suffix} decimals={it.decimals} />
          </span>
        </div>
        <div className="text-[11px] sm:text-xs text-muted-foreground font-medium">{it.label}</div>
      </motion.div>
    ))}
  </div>
);

export default Counters;
