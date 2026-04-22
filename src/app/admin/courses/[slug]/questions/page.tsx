"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import AdminAuthGate, {
  useAdminAuth,
} from "@/components/admin/AdminAuthGate";
import { useAdminFetch } from "@/lib/useAdminFetch";
import { BLOOM_ORDER, BLOOM_META, type BloomLevel } from "@/lib/blooms";
import { Skeleton } from "@/components/ui/Skeleton";

// /admin/courses/[slug]/questions
//
// Cross-module MCQ bank view. Lists every question in the course,
// filterable by module + Bloom's level, with a header strip showing
// the distribution. Addresses the audit finding: "no MCQ bulk view —
// can't see Bloom's coverage across the class at once".
//
// One API call (/api/admin/courses/[slug]/question-bank), one scrollable
// table, inline filters. No bulk edit on purpose — per-question editing
// stays in the existing module editor to keep intent focused.

interface BankQuestion {
  id: string;
  number: number;
  question: string;
  options: string[];
  correctIndex: number;
  bloom: string | null;
  explanation: string | null;
  difficulty: string | null;
  moduleNumber: number;
  moduleTitle: string;
  topicNumber: number;
  topicTitle: string;
  attemptCount?: number;
  approxCorrectPct?: number | null;
  /** Server-flagged when the topic this question belongs to has a
   *  >70% wrong-answer rate across 5+ student attempts. Likely a
   *  bad distractor or unclear wording. */
  trap?: boolean;
}

interface BloomDistribution {
  level: string | null;
  count: number;
}

interface ModuleBreakdown {
  moduleNumber: number;
  title: string;
  questionCount: number;
  byBloom: Record<string, number>;
}

interface BankResponse {
  questions: BankQuestion[];
  bloomDistribution: BloomDistribution[];
  moduleBreakdown: ModuleBreakdown[];
  total: number;
  trapCount?: number;
  migrationPending?: string;
}

export default function QuestionBankPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { idToken, password, setPassword, ready, setAuthenticated } =
    useAdminAuth();

  const credential = { idToken };
  const { data, isLoading } = useAdminFetch<BankResponse>(
    `/api/admin/courses/${encodeURIComponent(slug)}/question-bank`,
    credential,
    { enabled: ready }
  );

  const [moduleFilter, setModuleFilter] = useState<number | "all">("all");
  const [bloomFilter, setBloomFilter] = useState<string | "all">("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    return data.questions.filter((qrow) => {
      if (moduleFilter !== "all" && qrow.moduleNumber !== moduleFilter)
        return false;
      if (
        bloomFilter !== "all" &&
        (qrow.bloom || "").toLowerCase() !== bloomFilter
      )
        return false;
      if (q) {
        const hay = `${qrow.question} ${qrow.topicTitle} ${qrow.moduleTitle}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [data, moduleFilter, bloomFilter, query]);

  if (!ready) {
    return (
      <AdminAuthGate
        password={password}
        setPassword={setPassword}
        setAuthenticated={setAuthenticated}
        probeUrl={`/api/admin/courses/${encodeURIComponent(slug)}/question-bank`}
      />
    );
  }

  const bloomCounts: Record<string, number> = {};
  for (const b of data?.bloomDistribution || []) {
    bloomCounts[b.level || "untagged"] = b.count;
  }

  return (
    <main className="min-h-screen">
      <Navbar title="Admin" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <Breadcrumbs
          items={[
            { label: "Admin", href: "/admin" },
            { label: "Courses", href: "/admin/courses" },
            {
              label: slug,
              href: `/admin/courses/${encodeURIComponent(slug)}`,
            },
            { label: "MCQ bank" },
          ]}
        />

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">MCQ bank</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Every question in this course · Bloom&apos;s distribution · filter by module or level
          </p>
        </div>

        {data?.migrationPending && (
          <div
            className="rounded-xl p-4 text-[13px] mb-6"
            style={{
              background: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.3)",
              color: "#fcd34d",
            }}
          >
            ⚠️ {data.migrationPending}
          </div>
        )}

        {/* ─── Bloom's distribution strip ────────────────────── */}
        <div
          className="rounded-2xl p-5 mb-6"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <h2 className="text-sm font-bold text-zinc-300 mb-3">
            Bloom&apos;s coverage · {data?.total ?? 0} question
            {data?.total === 1 ? "" : "s"} total
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {BLOOM_ORDER.map((lvl: BloomLevel) => {
              const count = bloomCounts[lvl] || 0;
              const meta = BLOOM_META[lvl];
              const pct =
                data?.total && data.total > 0
                  ? Math.round((count / data.total) * 100)
                  : 0;
              return (
                <div
                  key={lvl}
                  className="rounded-lg p-2.5"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: `1px solid ${meta?.color || "#818CF8"}33`,
                  }}
                >
                  <div
                    className="text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: meta?.color || "#818CF8" }}
                  >
                    {meta?.label || lvl}
                  </div>
                  <div className="text-xl font-bold text-white mt-1">
                    {count}
                  </div>
                  <div className="text-[10px] text-zinc-500">{pct}%</div>
                </div>
              );
            })}
          </div>
          {bloomCounts.untagged > 0 && (
            <p className="text-[11px] text-amber-400 mt-3">
              ⚠️ {bloomCounts.untagged} question
              {bloomCounts.untagged === 1 ? " is" : "s are"} untagged. Tag them
              for accurate Bloom&apos;s analytics.
            </p>
          )}
        </div>

        {/* ─── Filters ──────────────────────────────────────── */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search question text…"
            className="flex-1 min-w-[200px] px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50"
          />
          <select
            value={moduleFilter}
            onChange={(e) =>
              setModuleFilter(
                e.target.value === "all" ? "all" : parseInt(e.target.value, 10)
              )
            }
            className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-indigo-500/50"
          >
            <option value="all">All modules</option>
            {(data?.moduleBreakdown || []).map((m) => (
              <option key={m.moduleNumber} value={m.moduleNumber}>
                M{m.moduleNumber} · {m.title} ({m.questionCount})
              </option>
            ))}
          </select>
          <select
            value={bloomFilter}
            onChange={(e) => setBloomFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-indigo-500/50"
          >
            <option value="all">All Bloom&apos;s</option>
            {BLOOM_ORDER.map((lvl: BloomLevel) => (
              <option key={lvl} value={lvl}>
                {BLOOM_META[lvl]?.label || lvl}
              </option>
            ))}
            <option value="untagged">Untagged</option>
          </select>
        </div>

        {/* ─── Question table ───────────────────────────────── */}
        {isLoading && !data ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} height={80} radius={12} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-sm text-zinc-400">
            No questions match these filters.
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((q) => {
              const bloomMeta = q.bloom
                ? BLOOM_META[q.bloom as BloomLevel]
                : null;
              return (
                <Link
                  key={q.id}
                  href={`/admin/courses/${encodeURIComponent(slug)}/modules/${q.moduleNumber}`}
                  className="block rounded-xl p-4 transition-all hover:bg-white/[0.035]"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                          M{q.moduleNumber} · T{q.topicNumber} · Q{q.number}
                        </span>
                        {bloomMeta ? (
                          <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{
                              background: `${bloomMeta.color}1A`,
                              color: bloomMeta.color,
                              border: `1px solid ${bloomMeta.color}33`,
                            }}
                          >
                            {bloomMeta.label}
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            Untagged
                          </span>
                        )}
                        {q.difficulty && (
                          <span className="text-[10px] text-zinc-500">
                            · {q.difficulty}
                          </span>
                        )}
                        {/* Trap detector badge — fires when the topic
                            this question lives in has <30% correct
                            (>70% wrong) across 5+ attempts. Likely a
                            bad distractor or unclear wording. The
                            attribution is per-topic not per-question
                            because we don't store per-question scores;
                            still surfaces the right neighbourhood. */}
                        {q.trap && (
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{
                              background: "rgba(239,68,68,0.15)",
                              color: "#FCA5A5",
                              border: "1px solid rgba(239,68,68,0.3)",
                            }}
                            title={`Topic average ${q.approxCorrectPct}% correct across ${q.attemptCount} attempts. Review this question's wording / distractors.`}
                          >
                            🚨 Needs review
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-zinc-200">{q.question}</p>
                      <p className="text-[11px] text-zinc-600 mt-1 truncate">
                        {q.topicTitle} · correct: {q.options[q.correctIndex] || "—"}
                        {q.attemptCount && q.attemptCount > 0 ? (
                          <span className="ml-2 text-zinc-500">
                            · {q.attemptCount} attempt{q.attemptCount === 1 ? "" : "s"}
                            {q.approxCorrectPct !== null && q.approxCorrectPct !== undefined ? (
                              <span
                                className={
                                  q.approxCorrectPct < 30
                                    ? "text-red-400 ml-1"
                                    : q.approxCorrectPct < 60
                                      ? "text-amber-400 ml-1"
                                      : "text-emerald-400 ml-1"
                                }
                              >
                                {q.approxCorrectPct}% correct
                              </span>
                            ) : null}
                          </span>
                        ) : null}
                      </p>
                    </div>
                    <span className="text-zinc-600 shrink-0">→</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
