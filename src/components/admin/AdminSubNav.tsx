"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Pill-tab navigation shown on every /admin/* page.
//
// Phase 1 of the admin rebuild: 4 clear tabs mapping to 4 distinct mental
// modes so there's never confusion about where to go for a given task.
//
//   Home   — daily status check (overview, alerts, at-risk)
//   People — find / inspect / fix any student
//   Roster — batches · sections · rolls · wizard
//   Tools  — destructive / sensitive actions (reset, unlink, export, audit log)
//
// Previous structure (Dashboard / Students / Batches / Enrollments) was
// confusing because "Batches" meant analytics and "Enrollments" meant
// roster management — backwards from what the words suggest.

const TABS = [
  { href: "/admin", label: "Home", icon: "📊", exact: true },
  { href: "/admin/people", label: "People", icon: "👥", alts: ["/admin/progress"] },
  { href: "/admin/roster", label: "Roster", icon: "🎓", alts: ["/admin/batches", "/admin/batch-progress"] },
  // Phase 4 — course content editor. The Courses tab sits between Roster
  // and Tools because it's content-management (adjacent to Roster's
  // people-management) rather than a destructive/debug surface.
  { href: "/admin/courses", label: "Courses", icon: "📚" },
  { href: "/admin/tools", label: "Tools", icon: "🛠" },
];

export default function AdminSubNav() {
  const pathname = usePathname() || "";

  function isActive(tab: (typeof TABS)[number]): boolean {
    if (tab.exact) return pathname === tab.href;
    if (pathname === tab.href || pathname.startsWith(tab.href + "/")) return true;
    // Match legacy URLs so admins landing on /admin/progress see People highlighted
    if (tab.alts) {
      for (const alt of tab.alts) {
        if (pathname === alt || pathname.startsWith(alt + "/")) return true;
      }
    }
    return false;
  }

  return (
    <div
      // mt-14 pushes below the fixed top Navbar. sticky top-14 pins here on scroll.
      className="sticky top-14 mt-14 z-30 backdrop-blur-xl border-b"
      style={{
        background: "rgba(9,9,15,0.7)",
        borderColor: "rgba(255,255,255,0.06)",
      }}
    >
      <nav
        className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center gap-1.5 overflow-x-auto py-2"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
        aria-label="Admin sections"
      >
        {TABS.map((tab) => {
          const active = isActive(tab);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all whitespace-nowrap shrink-0 active:scale-95 ${
                active
                  ? "text-white"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
              }`}
              style={{
                background: active
                  ? "linear-gradient(135deg, #6366F1, #8B5CF6)"
                  : "transparent",
                boxShadow: active ? "0 4px 14px rgba(99,102,241,0.35)" : "none",
              }}
            >
              <span aria-hidden="true">{tab.icon}</span>
              {tab.label}
            </Link>
          );
        })}
        {/* ⌘K hint — static, zero interaction. Teaches the shortcut the
            first time the admin opens the sub-nav without spending a tab
            slot or a click surface. The actual keyboard handler lives
            in AdminCommandPaletteMount. Hidden on narrow screens where
            there's no keyboard anyway. */}
        <span
          className="ml-auto hidden md:inline-flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1.5 rounded-full text-zinc-500 whitespace-nowrap shrink-0"
          title="Press ⌘K (or Ctrl-K) to jump to any student, course, or page"
        >
          <span aria-hidden="true">⚡</span>
          <span>Press</span>
          <kbd className="font-mono px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-zinc-300">
            ⌘K
          </kbd>
          <span>to jump</span>
        </span>

        {/* Explicit "back to the student-facing site" chip at the far
            right. The tab labelled "Home" inside this sub-nav means
            "admin dashboard", which was confusing teachers who expected
            it to return to /. This link disambiguates. */}
        <Link
          href="/"
          aria-label="Back to the student-facing site"
          title="View the student-facing site"
          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full text-zinc-500 hover:text-white hover:bg-white/[0.04] transition-all whitespace-nowrap shrink-0"
        >
          <span aria-hidden="true">↗</span>
          <span>View site</span>
        </Link>
      </nav>
    </div>
  );
}
