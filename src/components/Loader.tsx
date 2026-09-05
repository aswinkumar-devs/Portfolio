import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const NAME = "ASWIN KUMAR";

const Loader = () => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShow(false), 2400);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, filter: "blur(8px)" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background overflow-hidden"
        >
          {/* ambient gradient blobs */}
          <motion.div
            className="absolute -top-32 -left-32 w-[28rem] h-[28rem] rounded-full bg-primary/30 blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-accent/30 blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* subtle grid */}
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative flex flex-col items-center gap-10">
            {/* orbital monogram */}
            <div className="relative h-32 w-32 flex items-center justify-center">
              <motion.span
                className="absolute inset-0 rounded-full border border-primary/20"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
              <motion.span
                className="absolute inset-2 rounded-full border border-dashed border-accent/40"
                animate={{ rotate: -360 }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              />
              <motion.span
                className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary border-r-accent"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-5 rounded-full gradient-primary shadow-glow flex items-center justify-center"
                animate={{ scale: [0.92, 1.04, 0.92] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              >
                <span className="text-primary-foreground font-extrabold text-2xl tracking-tight">
                  AK
                </span>
              </motion.div>
            </div>

            {/* animated name */}
            <div className="flex gap-[2px] md:gap-1">
              {NAME.split("").map((ch, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{
                    duration: 0.5,
                    delay: 0.3 + i * 0.06,
                    ease: "easeOut",
                  }}
                  className={`text-2xl md:text-4xl font-bold tracking-[0.2em] ${
                    ch === " " ? "w-2 md:w-3" : "gradient-text"
                  }`}
                >
                  {ch === " " ? "\u00A0" : ch}
                </motion.span>
              ))}
            </div>

            {/* progress bar */}
            <div className="relative w-56 h-[3px] rounded-full bg-muted overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 gradient-primary rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-xs uppercase tracking-[0.4em] text-muted-foreground"
            >
              Crafting experience
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Loader;
