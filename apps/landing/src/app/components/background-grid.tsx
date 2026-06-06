export function BackgroundGrid({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{
        backgroundImage:
          "radial-gradient(circle at 1px 1px, rgba(15, 60, 35, 0.07) 1px, transparent 0)",
        backgroundSize: "24px 24px",
        maskImage:
          "radial-gradient(ellipse 80% 60% at 50% 30%, black 30%, transparent 80%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 80% 60% at 50% 30%, black 30%, transparent 80%)",
      }}
    />
  );
}

export function FlowLines({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      viewBox="0 0 1440 800"
      fill="none"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="flow1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--cp)" stopOpacity="0" />
          <stop offset="50%" stopColor="var(--cs)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--cl)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="flow2" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--cl)" stopOpacity="0" />
          <stop offset="50%" stopColor="var(--cm)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--cd)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M -100 200 C 300 120, 600 320, 900 240 S 1500 180, 1600 280"
        stroke="url(#flow1)"
        strokeWidth="1.2"
      />
      <path
        d="M -100 480 C 280 380, 620 560, 980 440 S 1480 380, 1600 500"
        stroke="url(#flow2)"
        strokeWidth="1.2"
      />
      <path
        d="M -100 660 C 320 580, 700 720, 1040 620 S 1500 580, 1600 700"
        stroke="url(#flow1)"
        strokeWidth="1"
      />
    </svg>
  );
}
