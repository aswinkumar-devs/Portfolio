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

const Linkedin = ({ size = 28, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} {...props}>
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 110-4.13 2.06 2.06 0 010 4.13zM7.12 20.45H3.56V9h3.56v11.45z" />
  </svg>
);

const OWNER_EMAIL = "mass07.webdev@gmail.com";
const WHATSAPP_NUMBER = "919597972924";

const contacts = [
  { icon: Mail, label: "Email", value: OWNER_EMAIL, href: `mailto:${OWNER_EMAIL}` },
  { icon: Phone, label: "Phone", value: "+91 9597972924", href: "tel:+919597972924" },
  { icon: Linkedin, label: "LinkedIn", value: "aswin-kumar-backend-developer", href: "https://www.linkedin.com/in/aswin-kumar-backend-developer/" },
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
    "w-full px-4 py-3 rounded-xl bg-background/40 border border-white/10 outline-none transition-smooth focus:border-primary/60 focus:shadow-glow focus:bg-background/60";

  return (
    <motion.form
      onSubmit={onSubmit}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="glass rounded-3xl p-8 shadow-elegant relative overflow-hidden"
    >
      <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-primary/30 blur-3xl" />
      <div className="relative">
        <h3 className="text-2xl font-bold mb-1">Get in Touch</h3>
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

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-full gradient-primary text-primary-foreground font-medium shadow-glow hover:scale-105 transition-smooth flex items-center gap-2 disabled:opacity-60"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              {loading ? "Sending..." : "Send"}
            </button>
            <a
              href={`mailto:${OWNER_EMAIL}?subject=Portfolio%20Contact&body=Hi%20Aswin,`}
              className="px-6 py-3 rounded-full glass font-medium hover:bg-primary/10 transition-smooth flex items-center gap-2"
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
      viewport={{ once: false, amount: 0.2 }}
      transition={{ duration: 0.5 }}
      className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10"
    >
      {contacts.map((c) => (
        <a
          key={c.label}
          href={c.href}
          target={c.href.startsWith("http") ? "_blank" : undefined}
          rel="noreferrer"
          className="glass rounded-2xl p-5 hover:bg-primary/10 hover:-translate-y-1 transition-smooth group text-center"
        >
          <c.icon className="mx-auto mb-3 text-primary dark:text-accent group-hover:scale-110 transition-smooth" size={28} />
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</div>
          <div className="font-medium mt-1 break-all">{c.value}</div>
        </a>
      ))}
    </motion.div>

    <footer className="text-center text-sm text-muted-foreground mt-16">
      © {new Date().getFullYear()} Aswin Kumar M · Crafted with ❤️ and lots of ☕
    </footer>
  </Section>
);

export default Contact;
