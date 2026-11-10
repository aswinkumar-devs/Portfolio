import { motion } from "framer-motion";
import { Mail, Phone, Send, Loader2, ExternalLink, MessageCircle } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import emailjs from "@emailjs/browser";
import Section from "./Section";

const EMAILJS_SERVICE_ID = "service_x846wfn";
const EMAILJS_TEMPLATE_ID = "template_7148d2a";
const EMAILJS_PUBLIC_KEY = "WBXFR9_WvUslYjmyx";

const Linkedin = ({ size = 26, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} {...props}>
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 110-4.13 2.06 2.06 0 010 4.13zM7.12 20.45H3.56V9h3.56v11.45z" />
  </svg>
);

const Github = ({ size = 26, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} {...props}>
    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.34-1.28-1.7-1.28-1.7-1.04-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11.04 11.04 0 015.79 0c2.21-1.49 3.18-1.18 3.18-1.18.62 1.58.23 2.75.11 3.04.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.68.8.56A11.5 11.5 0 0023.5 12C23.5 5.65 18.35.5 12 .5z" />
  </svg>
);

const OWNER_EMAIL = "mass07.webdev@gmail.com";
const WHATSAPP_NUMBER = "919597972924";

const contacts = [
  { icon: Mail, label: "Email", value: OWNER_EMAIL, href: `mailto:${OWNER_EMAIL}` },
  { icon: Phone, label: "Phone", value: "+91 9597972924", href: "tel:+919597972924" },
  { icon: Linkedin, label: "LinkedIn", value: "aswin-kumar-backend-developer", href: "https://www.linkedin.com/in/aswin-kumar-backend-developer/" },
  { icon: Github, label: "GitHub", value: "aswinkumar-devs", href: "https://github.com/aswinkumar-devs" },
  { icon: MessageCircle, label: "WhatsApp", value: "Chat on WhatsApp", href: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi Aswin, I came across your portfolio!")}` },
];

const contactSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  message: z.string().trim().min(5, "Message is too short").max(1000),
});

const ContactForm = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateField = (k: keyof typeof form, v: string) => {
    const res = contactSchema.shape[k].safeParse(v);
    setErrors((e) => ({ ...e, [k]: res.success ? "" : res.error.issues[0].message }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = contactSchema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (errs[i.path[0] as string] = i.message));
      setErrors(errs);
      toast.error("Please fix the highlighted fields");
      return;
    }
    setLoading(true);
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name: parsed.data.name,
          from_email: parsed.data.email,
          message: parsed.data.message,
          to_email: OWNER_EMAIL,
          reply_to: parsed.data.email,
        },
        { publicKey: EMAILJS_PUBLIC_KEY }
      );
      setForm({ name: "", email: "", message: "" });
      toast.success("Message sent! I'll get back to you soon.");
    } catch (err) {
      console.error("EmailJS error:", err);
      toast.error("Failed to send. Please try again or use Direct Email.");
    } finally {
      setLoading(false);
    }
  };

  const field =
    "w-full px-4 py-3 rounded-xl bg-background/40 border border-border outline-none transition-smooth focus:border-primary/60 focus:shadow-glow focus:bg-background/60 text-foreground placeholder:text-muted-foreground/60 text-sm";

  return (
    <motion.form
      onSubmit={onSubmit}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="glass rounded-3xl p-5 sm:p-8 shadow-elegant relative overflow-hidden"
    >
      <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-primary/30 blur-3xl pointer-events-none" />
      <div className="relative">
        <h3 className="text-2xl font-bold mb-1 text-foreground">Get in Touch</h3>
        <p className="text-sm text-muted-foreground mb-6">Send me a quick message — I'll reply soon.</p>

        <div className="space-y-4">
          <div>
            <input
              className={field}
              placeholder="Your name"
              value={form.name}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value });
                validateField("name", e.target.value);
              }}
            />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
          </div>
          <div>
            <input
              className={field}
              placeholder="Your email"
              type="email"
              value={form.email}
              onChange={(e) => {
                setForm({ ...form, email: e.target.value });
                validateField("email", e.target.value);
              }}
            />
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
          </div>
          <div>
            <textarea
              className={`${field} min-h-[120px] resize-y`}
              placeholder="Your message"
              value={form.message}
              onChange={(e) => {
                setForm({ ...form, message: e.target.value });
                validateField("message", e.target.value);
              }}
            />
            {errors.message && <p className="text-xs text-destructive mt-1">{errors.message}</p>}
          </div>

          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-full gradient-primary text-primary-foreground font-medium shadow-glow hover:scale-105 transition-smooth flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              {loading ? "Sending..." : "Send"}
            </button>
            <a
              href={`mailto:${OWNER_EMAIL}?subject=Portfolio%20Contact&body=Hi%20Aswin,`}
              className="px-6 py-3 rounded-full glass font-medium hover:bg-primary/10 transition-smooth flex items-center justify-center gap-2 text-foreground"
            >
              <ExternalLink size={18} /> Direct Email
            </a>
          </div>
        </div>
      </div>
    </motion.form>
  );
};

const Contact = () => (
  <Section id="contact" eyebrow="Let's connect" title="Get In Touch">
    <div className="max-w-2xl mx-auto">
      <ContactForm />
    </div>

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mt-8 sm:mt-10"
    >
      {contacts.map((c, idx) => (
        <a
          key={c.label}
          href={c.href}
          target={c.href.startsWith("http") ? "_blank" : undefined}
          rel="noreferrer"
          className={`glass rounded-2xl p-3.5 sm:p-5 hover:bg-primary/10 hover:-translate-y-1 transition-smooth group text-center flex flex-col items-center justify-center ${
            idx === 4 ? "col-span-2 sm:col-span-1" : ""
          }`}
        >
          <c.icon className="mx-auto mb-2 text-primary dark:text-accent group-hover:scale-110 transition-smooth" size={24} />
          <div className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground font-medium">{c.label}</div>
          <div className="text-xs sm:text-sm font-semibold mt-0.5 sm:mt-1 break-all line-clamp-1 group-hover:text-primary transition-colors text-foreground">{c.value}</div>
        </a>
      ))}
    </motion.div>

    <footer className="text-center text-xs sm:text-sm text-muted-foreground mt-12 sm:mt-16 pb-24 sm:pb-8 font-mono px-4">
      © {new Date().getFullYear()} Aswin Kumar M · Crafted with ❤️ and lots of ☕
    </footer>
  </Section>
);

export default Contact;
