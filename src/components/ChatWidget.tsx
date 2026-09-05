import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { MessageCircle, X, Send, Trash2 } from "lucide-react";

type Msg = { id: number; role: "user" | "ai"; text: string };


const PILLS = [
  "What is your primary backend stack?",
  "Tell me about your database experience.",
  "Can I download your resume?",
  "Are you available for work?",
  "What projects have you built?",
  "What are your top skills?",
  "Tell me about your work experience.",
  "What is your education background?",
  "How can I contact you?",
  "Do you know Go and concurrency?",
];

const answer = (q: string): string => {
  const key = q.trim().toLowerCase();
  switch (key) {
    case "what is your primary backend stack?":
      return "Aswin's primary backend stack is Go (Golang) with the Gin framework, plus Java/J2EE. He builds RESTful APIs, uses goroutines for concurrency, and secures services with JWT authentication.";
    case "tell me about your database experience.":
      return "He works with MySQL and SQL for relational data modelling, and MongoDB for document stores. On the Java side he uses JDBC and Hibernate ORM, and he's comfortable with schema design, indexing and query optimisation.";
    case "can i download your resume?":
      return "Absolutely — the Download Resume button in the hero section serves the latest PDF. You can also open it directly at /resume.pdf.";
    case "are you available for work?":
      return "Yes! Aswin is open to backend / full-stack developer roles and freelance work. The quickest way to reach him is the contact form below, or WhatsApp from the contact section.";
    case "what are your top skills?":
      return "Core Java, Advanced Java (J2EE), Go with Gin, JSP & Servlets, JDBC & Hibernate, SQL/MySQL, HTML/CSS, JavaScript and strong OOP + problem solving.";
    case "tell me about your work experience.":
      return "He works as a Trainee Go Backend Developer at Sterna Security Solutions, building REST APIs in Go, handling concurrency with goroutines and integrating databases into production-style services.";
    case "what is your education background?":
      return "B.E. in Computer Science Engineering at Park College of Engineering and Technology (2022–2026) with a CGPA of 8.41, after HSC (84.5%) and SSLC (69.4%).";
    case "how can i contact you?":
      return "Use the contact form in the Contact section, the WhatsApp card right beside it, or email mass07.webdev@gmail.com. LinkedIn and GitHub links are in the hero section too.";
    case "do you know go and concurrency?":
      return "Yes — Go is his primary backend language. He uses goroutines, channels and sync primitives for concurrent request handling, plus the Gin framework for REST APIs.";
    default:
      break;
  }
  if (key.includes("go") || key.includes("backend") || key.includes("stack"))
    return "Go with Gin, Java/J2EE, REST APIs, JWT auth and goroutine-based concurrency are his core backend tools.";
  if (key.includes("data") || key.includes("sql") || key.includes("mongo"))
    return "MySQL, SQL, MongoDB, plus JDBC and Hibernate on the Java side.";
  if (key.includes("resume") || key.includes("cv"))
    return "You can grab the resume from the Download Resume button in the hero section.";
  if (key.includes("contact") || key.includes("hire") || key.includes("email") || key.includes("available"))
    return "Reach out through the contact form or WhatsApp in the contact section — he replies quickly.";
  if (key.includes("project"))
    return "Highlights include a Game-Based CAPTCHA replacement, RAVA – a personal AI assistant, and this portfolio/e-commerce build. Check the Projects section for live links.";
  return "Good question! For anything specific, drop a message in the contact section and Aswin will get back to you personally. Meanwhile, try one of the suggested questions above.";
};

const ChatWidget = () => {
  const { pathname } = useLocation();
  const hidden = pathname.startsWith("/skills-universe");
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    { id: 0, role: "ai", text: "Hey! I'm Aswin's AI assistant. Ask me about his stack, projects or availability." },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const idRef = useRef(1);

  useEffect(() => {
    if (hidden) setOpen(false);
  }, [hidden]);


  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const clearChat = () => {
    idRef.current = 1;
    setInput("");
    setMessages([
      { id: 0, role: "ai", text: "Chat cleared. Ask me anything about Aswin's stack, projects or availability." },
    ]);
  };

  const ask = (q: string) => {
    const text = q.trim();
    if (!text) return;
    const uid = idRef.current++;
    setMessages((m) => [...m, { id: uid, role: "user", text }]);
    setInput("");
    window.setTimeout(() => {
      setMessages((m) => [...m, { id: idRef.current++, role: "ai", text: answer(text) }]);
    }, 450);
  };

  if (hidden) return null;

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed bottom-24 right-6 z-50 flex h-[27rem] w-[min(22rem,calc(100vw-3rem))] flex-col overflow-hidden rounded-2xl border border-primary/30 bg-background/95 dark:bg-background/70 backdrop-blur-xl shadow-[0_0_40px_hsl(var(--primary)/0.25)]"
          >

            <div className="flex items-center justify-between border-b border-primary/20 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />
                <span className="text-sm font-semibold">Chat with Aswin's AI</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={clearChat}
                  aria-label="Clear chat"
                  title="Clear chat"
                  className="flex items-center gap-1 rounded-full border border-primary/30 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <Trash2 size={12} /> Clear
                </button>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close chat"
                  className="rounded-full p-1 text-muted-foreground transition-colors hover:text-primary"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div ref={scrollRef} className="neon-scroll flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((m) => (
                <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                  <div
                    className={
                      m.role === "user"
                        ? "max-w-[85%] rounded-2xl rounded-br-sm bg-secondary px-3 py-2 text-sm text-secondary-foreground"
                        : "max-w-[85%] rounded-2xl rounded-bl-sm border border-primary/25 bg-primary/10 px-3 py-2 text-sm text-foreground"
                    }
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-primary/15 px-3 py-2.5">
              <div className="neon-scroll flex max-h-[4.75rem] flex-wrap gap-2 overflow-y-auto pr-1">
                {PILLS.map((p) => (
                  <button
                    key={p}
                    onClick={() => ask(p)}
                    className="rounded-full border border-primary/25 bg-primary/5 px-3 py-1.5 text-left text-xs text-foreground/80 transition-all hover:border-primary hover:bg-primary/10 hover:text-foreground hover:shadow-[0_0_12px_hsl(var(--primary)/0.45)]"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>


            <form
              onSubmit={(e) => {
                e.preventDefault();
                ask(input);
              }}
              className="flex items-center gap-2 border-t border-primary/15 p-3"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 rounded-full border border-border bg-background/60 px-4 py-2 text-sm outline-none focus:border-primary"
              />
              <button
                type="submit"
                aria-label="Send message"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/60 text-primary transition-all hover:bg-primary/10 hover:shadow-[0_0_14px_hsl(var(--primary)/0.5)]"
              >
                <Send size={15} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-1.5">
        <span className="rounded-full border border-primary/40 bg-background/80 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-primary backdrop-blur-sm">
          AI Chatbot
        </span>
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close chat" : "Open chat"}
          className="ai-orb relative flex h-14 w-14 items-center justify-center rounded-full text-primary-foreground transition-transform hover:scale-105"
        >
          <span className="ai-orb-ring" aria-hidden="true" />
          <span className="ai-orb-ring ai-orb-ring--2" aria-hidden="true" />
          <span className="ai-orb-core" aria-hidden="true" />
          <span className="relative z-10">
            {open ? <X size={22} /> : <MessageCircle size={22} />}
          </span>
        </button>
      </div>


    </>
  );
};

export default ChatWidget;
