"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import useSWR from "swr";
import { useAuth } from "@/lib/auth-context";
import BloomsRadar from "@/components/BloomsRadar";
import { BLOOM_META, type BloomLevel } from "@/lib/blooms";

interface BloomsResponse {
  levels: {
    level: BloomLevel;
    correct: number;
    total: number;
    pct: number;
  }[];
  calibration: { rated: number; confidentWrong: number; humbleRight: number };
  topicsContributing: number;
  weakestLevel: BloomLevel | null;
  migrationPending?: boolean;
}

async function fetcher([url, token]: [string, string]): Promise<BloomsResponse> {
  const res = await fetch(url, { headers: { "x-id-token": token } });
  if (!res.ok) throw new Error(`blooms ${res.status}`);
  return res.json();
}

// "Your thinking profile" — the Phase 3 home-page radar. Only shows for
// signed-in students who've completed at least one quiz that contributed
// Bloom's data. Silent for everyone else so the home page isn't polluted.
export default function HomeBloomsProfile() {
  const { user, isLoggedIn, getIdToken } = useAuth();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (isLoggedIn) setToken(getIdToken());
  }, [isLoggedIn, getIdToken]);

  const { data, error } = useSWR<BloomsResponse>(
    isLoggedIn && token ? ["/api/me/blooms", token] : null,
    fetcher,
    { revalidateOnFocus: true, refreshInterval: 60_000 }
  );

  if (!isLoggedIn || !user) return null;
  if (error || !data) return null;

  // Hide entirely until the student has contributed at least one quiz with
  // Bloom's data. Showing an empty hexagon to new users is visual noise.
  if (data.topicsContributing === 0) return null;

  const weakMeta = data.weakestLevel ? BLOOM_META[data.weakestLevel] : null;
  const weakLevel = data.weakestLevel ? data.levels.find((l) => l.level === data.weakestLevel) : null;

  return (
    <section className="px-6 mb-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-5xl mx-auto rounded-2xl p-5 card-glass"
      >
        <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
          <div>
            <h3 className="text-[15px] font-semibold text-white">
              🧭 Your thinking profile
            </h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Aggregated across {data.topicsContributing}{" "}
              {data.topicsContributing === 1 ? "quiz" : "quizzes"} you&apos;ve completed
            </p>
          </div>
          {data.calibration.rated >= 3 && (
            <div
              className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
              style={{
                background: "rgba(99,102,241,0.1)",
                border: "1px solid rgba(99,102,241,0.2)",
                color: "#a5b4fc",
              }}
              title="Questions where you rated your confidence"
            >
              {data.calibration.rated} rated
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-4 items-center">
          {/* Radar chart — let it fill the column; SVG scales via viewBox.
               Constraining to a pixel max on mobile clipped axis labels. */}
          <div className="flex justify-center">
            <div className="w-full max-w-[360px]">
              <BloomsRadar levels={data.levels} />
            </div>
          </div>

          {/* Insights panel */}
          <div className="space-y-3">
            {weakMeta && weakLevel && (
              <div
                className="p-3 rounded-xl"
                style={{
                  background: weakMeta.bgTint,
                  border: `1px solid ${weakMeta.borderTint}`,
                }}
              >
                <div
                  className="text-[10px] font-bold tracking-widest uppercase mb-1"
                  style={{ color: weakMeta.color }}
                >
                  {weakMeta.icon} Weakest: {weakMeta.label}
                </div>
                <div className="text-[12px] text-zinc-300 leading-relaxed">
                  {weakLevel.correct}/{weakLevel.total} ({weakLevel.pct}%) —{" "}
                  {weakMeta.description}
                </div>
                <div className="text-[11px] text-zinc-500 mt-1.5 italic">
                  Re-try quizzes and focus on the {weakMeta.label.toLowerCase()}{" "}
                  questions (badge:{" "}
                  <span style={{ color: weakMeta.color }}>{weakMeta.icon}</span>
                  ).
                </div>
              </div>
            )}

            {data.calibration.confidentWrong > 0 && (
              <div
                className="p-3 rounded-xl"
                style={{
                  background: "rgba(245,158,11,0.06)",
                  border: "1px solid rgba(245,158,11,0.2)",
                }}
              >
                <div className="text-[10px] font-bold tracking-widest uppercase mb-1 text-amber-400">
                  ⚠ Confidence gap
                </div>
                <div className="text-[12px] text-zinc-300 leading-relaxed">
                  You were <em className="text-white">sure</em> but wrong{" "}
                  <span className="text-amber-300 font-semibold">
                    {data.calibration.confidentWrong}
                  </span>{" "}
                  time{data.calibration.confidentWrong > 1 ? "s" : ""}. Those are
                  worth a second look.
                </div>
              </div>
            )}

            {data.calibration.humbleRight > 0 && (
              <div
                className="p-3 rounded-xl"
                style={{
                  background: "rgba(16,185,129,0.06)",
                  border: "1px solid rgba(16,185,129,0.2)",
                }}
              >
                <div className="text-[10px] font-bold tracking-widest uppercase mb-1 text-emerald-400">
                  ✓ You know more than you think
                </div>
                <div className="text-[12px] text-zinc-300 leading-relaxed">
                  You called it a <em className="text-white">guess</em> and got
                  it right{" "}
                  <span className="text-emerald-300 font-semibold">
                    {data.calibration.humbleRight}
                  </span>{" "}
                  time{data.calibration.humbleRight > 1 ? "s" : ""}.
                </div>
              </div>
            )}

            {!weakMeta && data.calibration.confidentWrong === 0 && data.calibration.humbleRight === 0 && (
              <div className="text-[12px] text-zinc-500 leading-relaxed italic">
                Complete a few more quizzes to unlock per-level insights and
                confidence calibration.
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
