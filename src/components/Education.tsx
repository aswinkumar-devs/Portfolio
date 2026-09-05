import { motion } from "framer-motion";
import { GraduationCap, Calendar, Award, School } from "lucide-react";
import Section from "./Section";

const items = [
  {
    icon: GraduationCap,
    title: "B.E. Computer Science Engineering",
    place: "Park College of Engineering and Technology",
    period: "2022 – 2026",
    score: "CGPA: 8.41",
  },
  {
    icon: School,
    title: "HSC",
    place: "Literacy Mission Matriculation Higher Secondary School, Tirupur",
    period: "2022",
    score: "84.5%",
  },
  {
    icon: School,
    title: "SSLC",
    place: "Literacy Mission Matriculation Higher Secondary School, Tirupur",
    period: "2020",
    score: "69.4%",
  },
];

const Education = () => (
  <Section id="education" eyebrow="My journey" title="Education">
    <div className="max-w-3xl mx-auto space-y-6">
      {items.map((item, i) => (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.6, delay: i * 0.1 }}
          className="glass rounded-3xl p-8 shadow-card hover:shadow-elegant transition-smooth relative overflow-hidden"
        >
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary/20 blur-3xl" />
          <div className="flex items-start gap-5 relative">
            <div className="p-4 rounded-2xl gradient-primary text-primary-foreground shadow-glow">
              <item.icon size={28} />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-1">{item.title}</h3>
              <p className="text-primary dark:text-accent font-medium mb-3">{item.place}</p>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Calendar size={16} /> {item.period}
                </span>
                <span className="flex items-center gap-2">
                  <Award size={16} /> {item.score}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </Section>
);

export default Education;
