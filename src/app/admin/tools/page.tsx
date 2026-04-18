"use client";

import Navbar from "@/components/Navbar";
import Breadcrumbs from "@/components/admin/Breadcrumbs";

// Phase 1 stub for the new Tools tab.
// Phase 2 will add:
//   - Reset a student's progress (with before-delete summary)
//   - Unlink a student account (fix wrong-Gmail registrations)
//   - Change a student's section / roll / email
//   - Bulk export (CSV / JSON, full or filtered)
//   - Audit log — every admin action recorded in admin_actions table
export default function ToolsPage() {
  const tools = [
    {
      icon: "🔄",
      title: "Reset a student's progress",
      description:
        "Clear all quiz answers + topic completions for one student. Shows a before-delete summary so you know exactly what you're wiping.",
    },
    {
      icon: "🔗",
      title: "Unlink a student account",
      description:
        "If a student registered with the wrong Gmail, detach their account. Their original progress is preserved if they re-register with the correct email + same roll.",
    },
    {
      icon: "✏️",
      title: "Change section / roll / email",
      description:
        "Correct registration mistakes without SQL. Full diff shown in the confirmation dialog; change logged to the audit trail.",
    },
    {
      icon: "📤",
      title: "Export data",
      description:
        "CSV or JSON export. Full class, per-batch, per-section. Includes progress, MCQ, last active, and Bloom's breakdown.",
    },
    {
      icon: "📜",
      title: "Audit log",
      description:
        "Chronological list of every admin action with who / what / when / before → after. Revert button on safe actions.",
    },
  ];

  return (
    <main className="min-h-screen">
      <Navbar title="Admin" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Breadcrumbs
          items={[
            { label: "Admin", href: "/admin" },
            { label: "Tools" },
          ]}
        />

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Tools</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Destructive / sensitive actions · fix any issue without SQL
          </p>
        </div>

        <div
          className="rounded-2xl p-5 mb-6"
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
                Preview of the tools shipping in Phase 2. Each will have a
                confirmation dialog with an exact diff, toast success/failure,
                and an entry in the audit log.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {tools.map((t) => (
            <div
              key={t.title}
              className="rounded-2xl p-5 opacity-60"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px dashed rgba(255,255,255,0.08)",
              }}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl shrink-0">{t.icon}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-sm font-bold">{t.title}</h3>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400">
                      PHASE 2
                    </span>
                  </div>
                  <p className="text-[12px] text-zinc-500 leading-relaxed">
                    {t.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
