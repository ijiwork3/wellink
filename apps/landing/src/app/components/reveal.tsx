type RevealProps = {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  duration?: number;
  className?: string;
  bg?: string;
  bgStyle?: React.CSSProperties;
  as?: "div" | "section" | "li" | "article";
};

export function Reveal({
  children,
  delay = 0,
  y = 24,
  duration = 700,
  className = "",
  bg = "",
  bgStyle,
  as: Tag = "div",
}: RevealProps) {
  const wrapperClass = `${bg} ${className}`.trim();

  return (
    <Tag className={wrapperClass} style={bgStyle}>
      <div
        style={{
          opacity: 1,
          transform: "translateY(0)",
          transition: `opacity ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
          willChange: "opacity, transform",
        }}
      >
        {children}
      </div>
    </Tag>
  );
}
