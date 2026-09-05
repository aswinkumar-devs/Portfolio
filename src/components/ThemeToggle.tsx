import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme, ThemeMode } from "./ThemeProvider";

const options: { value: ThemeMode; icon: typeof Sun; label: string }[] = [
  { value: "light", icon: Sun, label: "Light" },
  { value: "system", icon: Monitor, label: "System" },
  { value: "dark", icon: Moon, label: "Dark" },
];

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const activeIndex = options.findIndex((o) => o.value === theme);

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="relative inline-flex items-center h-9 rounded-full glass border border-border p-1 transition-smooth"
    >
      {/* sliding pill */}
      <span
        className="absolute top-1 left-1 h-7 w-7 rounded-full gradient-primary shadow-glow transition-transform duration-300 ease-out"
        style={{ transform: `translateX(${activeIndex * 28}px)` }}
        aria-hidden="true"
      />
      {options.map(({ value, icon: Icon, label }) => {
        const isActive = theme === value;
        return (
          <button
            key={value}
            role="radio"
            aria-checked={isActive}
            aria-label={label}
            title={label}
            onClick={() => setTheme(value)}
            className={`relative z-10 inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
              isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon size={14} />
          </button>
        );
      })}
    </div>
  );
};

export default ThemeToggle;
