import { motion } from "framer-motion";
import { ReactNode } from "react";

interface Props {
  id: string;
  title: string;
  eyebrow?: string;
  children: ReactNode;
}

const Section = ({ id, title, eyebrow, children }: Props) => (
  <section id={id} className="relative z-10 py-24 px-6">
    <div className="relative z-10 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="mb-12 text-center"
      >
        {eyebrow && (
          <span className="inline-block px-4 py-1 rounded-full glass text-xs uppercase tracking-widest text-primary dark:text-accent mb-4">
            {eyebrow}
          </span>
        )}
        <h2 className="text-4xl md:text-5xl font-bold gradient-text">{title}</h2>
        <div className="mx-auto mt-4 h-1 w-20 rounded-full gradient-primary" />
      </motion.div>
      {children}
    </div>
  </section>
);

export default Section;
