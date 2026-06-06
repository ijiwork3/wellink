type Page = "main" | "advertiser" | "influencer" | "campaigns";

interface Crumb {
  label: string;
  page?: Page;
}

interface BreadcrumbProps {
  crumbs: Crumb[];
  onNavigate?: (p: Page) => void;
  variant?: "light" | "dark";
}

export function Breadcrumb({ crumbs, onNavigate, variant = "light" }: BreadcrumbProps) {
  const isDark = variant === "dark";
  const baseText = isDark ? "text-white/50" : "text-neutral-400";
  const linkText = isDark ? "text-white/70 hover:text-white" : "text-neutral-500 hover:text-[var(--cp)]";
  const activeText = isDark ? "text-white/90" : "text-neutral-700";
  const sepColor = isDark ? "text-white/30" : "text-neutral-300";

  return (
    <nav className="mx-auto max-w-[1280px] px-6 py-4 lg:px-10">
      <ol className="flex items-center gap-1.5 flex-wrap">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <li key={crumb.label} className="flex items-center gap-1.5">
              {crumb.page && !isLast && onNavigate ? (
                <button
                  onClick={() => onNavigate(crumb.page!)}
                  className={`transition-colors ${linkText}`}
                  style={{ fontSize: 14, fontWeight: 500 }}
                >
                  {crumb.label}
                </button>
              ) : (
                <span
                  className={isLast ? activeText : baseText}
                  style={{ fontSize: 14, fontWeight: isLast ? 600 : 500 }}
                >
                  {crumb.label}
                </span>
              )}
              {!isLast && (
                <span className={sepColor} style={{ fontSize: 12 }}>›</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
