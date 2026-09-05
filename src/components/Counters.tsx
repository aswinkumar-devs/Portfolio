import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";
import { Rocket, Code2, Server } from "lucide-react";

const items = [
  { icon: Rocket, label: "Projects Completed", value: 5, suffix: "+" },
  { icon: Code2, label: "Technologies Known", value: 8, suffix: "+" },
  { icon: Server, label: "Backend-developer", value: 1, suffix: " yr", staticText: "Go" },
];

const Counter = ({ to, suffix }: { to: number; suffix: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { amount: 0.5 });
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v));

  useEffect(() => {
    if (inView) {
      mv.set(0);
      const controls = animate(mv, to, { duration: 1.6, ease: "easeOut" });
      return controls.stop;
    }
  }, [inView, to, mv]);

  return (
    <span ref={ref} className="inline-flex items-baseline">
      <motion.span>{rounded}</motion.span>
      <span>{suffix}</span>
    </span>
  );
};

const Counters = () => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
    {items.map((it, i) => (
      <motion.div
        key={it.label}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
        className="glass rounded-2xl p-6 text-center hover:shadow-glow transition-smooth"
      >
        <it.icon className="mx-auto mb-3 text-primary dark:text-accent" size={32} />
        <div className="text-4xl font-bold text-primary dark:text-accent">
          {"staticText" in it && it.staticText ? (
            it.staticText
          ) : (
            <Counter to={it.value} suffix={it.suffix} />
          )}
        </div>
        <div className="text-sm text-muted-foreground mt-2">{it.label}</div>
      </motion.div>
    ))}
  </div>
);

export default Counters;
