const squares = [
  { left: "6%", size: 54, duration: "26s", delay: "0s", filled: false },
  { left: "17%", size: 26, duration: "19s", delay: "-6s", filled: true },
  { left: "28%", size: 70, duration: "33s", delay: "-12s", filled: false },
  { left: "39%", size: 18, duration: "16s", delay: "-3s", filled: true },
  { left: "58%", size: 40, duration: "23s", delay: "-9s", filled: false },
  { left: "69%", size: 62, duration: "30s", delay: "-1s", filled: false },
  { left: "80%", size: 22, duration: "18s", delay: "-14s", filled: true },
  { left: "91%", size: 46, duration: "27s", delay: "-5s", filled: false },
];

const AnimatedBackground = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
    <div className="absolute inset-0">
      {squares.map((s, i) => (
        <span
          key={i}
          className={`float-square absolute bottom-[-150px] block rounded-[6px] border ${
            s.filled
              ? "border-transparent bg-blue-100/50 dark:bg-[#00E5FF]/10"
              : "border-gray-300 dark:border-[#00E5FF]/25"
          }`}
          style={{
            left: s.left,
            width: s.size,
            height: s.size,
            animationDuration: s.duration,
            animationDelay: s.delay,
          }}
        />
      ))}
    </div>
  </div>
);

export default AnimatedBackground;
