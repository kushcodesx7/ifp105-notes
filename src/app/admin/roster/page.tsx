"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Breadcrumbs from "@/components/admin/Breadcrumbs";

// Phase 1 stub for the new Roster tab.
// Phase 2 will:
//   - Absorb /admin/batches (batch creation + roll management)
//   - Absorb /admin/batch-progress (per-section drilldowns)
//   - Add a 4-step batch creation wizard
//   - Let admins add/remove/rename sections and rolls inline
//
// For now we land here as a friendly "Phase 2 coming soon" with clear
// shortcuts to the existing functionality so the teacher isn't stranded.
export default function RosterPage() {
  return (
    <main className="min-h-screen">
      <Navbar title="Admin" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Breadcrumbs
          items={[
            { label: "Admin", href: "/admin" },
            { label: "Roster" },
          ]}
        />

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Roster</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Manage batches · sections · roll lists
          </p>
        </div>

        <div
          className="rounded-2xl p-5 mb-4"
          style={{
            background: "rgba(99,102,241,0.05)",
            border: "1px solid rgba(99,102,241,0.18)",
          }}
        >
          <div className="flex items-start gap-3">
            <div className="text-2xl shrink-0">🚧</div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-indigo-300 mb-1">
                Phase 2 — coming soon
              </h2>
              <p className="text-[12px] text-zinc-400 leading-relaxed">
                The new Roster page is Phase 2: batch creation wizard,
                inline section/roll management, archive support, CSV
                imports. Until then, use the existing pages below — they
                still work, they&apos;re just not redesigned yet.
              </p>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <Link
            href="/admin/batch-progress"
            className="block p-5 rounded-2xl card-glass transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="text-sm font-bold mb-1">Batch progress</h3>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Per-batch registration + progress summary, per-section health
              bars, orphan student list.
            </p>
            <div className="mt-3 text-[10px] font-semibold text-indigo-400">
              Open →
            </div>
          </Link>

          <Link
            href="/admin/batches"
            className="block p-5 rounded-2xl card-glass transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="text-2xl mb-2">🎓</div>
            <h3 className="text-sm font-bold mb-1">Batches &amp; enrollments</h3>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Create batches, upload roll numbers per section, add/remove
              registered students.
            </p>
            <div className="mt-3 text-[10px] font-semibold text-indigo-400">
              Open →
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
