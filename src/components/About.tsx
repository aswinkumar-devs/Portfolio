import { motion } from "framer-motion";
import { Code2, Briefcase, Rocket, Sparkles } from "lucide-react";
import Section from "./Section";
import Counters from "./Counters";

const stats = [
  { icon: Code2, label: "Languages", value: "8+" },
  { icon: Briefcase, label: "Internship Experience", value: "1 yr" },
  { icon: Rocket, label: "Projects", value: "3+" },
  { icon: Sparkles, label: "CGPA", value: "8.41" },
];

const About = () => (
  <Section id="about" eyebrow="Who I am" title="About Me">
    <div className="grid md:grid-cols-5 gap-8 items-center">
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.6 }}
        className="md:col-span-3 glass rounded-3xl p-8 shadow-card"
      >
        <p className="text-lg leading-relaxed text-muted-foreground">
          I'm a <span className="text-foreground font-semibold">Software Developer</span>{" "}
          with a solid foundation in Core Java, Advanced Java (J2EE), SQL, HTML, CSS,
          JavaScript and object-oriented programming.
        </p>
        <p className="text-lg leading-relaxed text-muted-foreground mt-4">
          I'm currently completing a{" "}
          <span className="text-foreground font-semibold">1-year internship as a Trainee Go Backend Developer at Sterna Security Solutions</span>,
          where I build and maintain RESTful APIs in Go with the Gin framework, handle
          concurrent workloads using goroutines and channels, design MySQL/MongoDB schemas
          with GORM, and secure services with JWT authentication — shipping production-style
          backend features alongside the team.
        </p>
        <p className="text-lg leading-relaxed text-muted-foreground mt-4">
          I'm passionate about building efficient backend systems and solving real-world
          problems through clean, scalable code. Currently pursuing my B.E. in Computer
          Science Engineering, I love turning ideas into reliable software.
        </p>
      </motion.div>


      <div className="md:col-span-2 grid grid-cols-2 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="glass rounded-2xl p-6 text-center hover:shadow-glow hover:-translate-y-1 transition-smooth"
          >
            <s.icon className="mx-auto mb-2 text-primary dark:text-accent" size={28} />
            <div className="text-2xl font-bold text-primary dark:text-accent">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
    <Counters />
  </Section>
);

export default About;
