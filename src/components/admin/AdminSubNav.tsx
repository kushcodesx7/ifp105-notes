"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Pill-tab navigation shown on every /admin/* page so the teacher can hop
// between admin sections without going back to the dashboard each time.

const TABS = [
  { href: "/admin", label: "Dashboard", icon: "🏠", exact: true },
  { href: "/admin/progress", label: "Students", icon: "📊" },
  { href: "/admin/batch-progress", label: "Batches", icon: "🎯" },
  { href: "/admin/batches", label: "Enrollments", icon: "🎓" },
];

export default function AdminSubNav() {
  const pathname = usePathname() || "";

  function isActive(tab: (typeof TABS)[number]): boolean {
    if (tab.exact) return pathname === tab.href;
    return pathname === tab.href || pathname.startsWith(tab.href + "/");
  }

  return (
    <div
      // mt-14 pushes it below the fixed top Navbar (which doesn't take flow
      // space). sticky top-14 then pins it right under the Navbar on scroll.
      className="sticky top-14 mt-14 z-30 backdrop-blur-xl border-b"
      style={{
        background: "rgba(9,9,15,0.7)",
        borderColor: "rgba(255,255,255,0.06)",
      }}
    >
      <nav
        className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center gap-1.5 overflow-x-auto py-2"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
        aria-label="Admin sections"
      >
        {TABS.map((tab) => {
          const active = isActive(tab);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all whitespace-nowrap shrink-0 ${
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
      </nav>
    </div>
  );
}
