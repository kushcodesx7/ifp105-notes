"use client";

import Link from "next/link";

export interface Crumb {
  label: string;
  href?: string; // omit on the last crumb (current page)
}

interface Props {
  items: Crumb[];
}

// Admin breadcrumbs. Shown at the top of every admin page below the sub-nav.
// Always lets the admin see exactly where they are and click back a level.
//
// Example: Admin › Roster › 2025–2026 › Section 3
export default function Breadcrumbs({ items }: Props) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1 text-[11px] text-zinc-500 mb-4 flex-wrap"
    >
      {items.map((c, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1">
            {c.href && !isLast ? (
              <Link
                href={c.href}
                className="hover:text-zinc-300 transition-colors"
              >
                {c.label}
              </Link>
            ) : (
              <span className={isLast ? "text-zinc-300 font-medium" : ""}>
                {c.label}
              </span>
            )}
            {!isLast && <span className="text-zinc-700">›</span>}
          </span>
        );
      })}
    </nav>
  );
}
