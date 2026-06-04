"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import WorkedExample from "@/components/exam-prep/WorkedExample";
import CoreConcepts from "@/components/exam-prep/CoreConcepts";

// /exam-prep — Revision guide for IFP105 ICT long-answer questions.
//
// Audience: students revising the IFP105 ICT material, including
// those retaking the subject or strengthening shaky topics. They
// know the content from the modules and quizzes but want a clean
// structure for long-answer questions.
//
// One framework, used everywhere on this page: D-E-E-D
//   D — Define the term
//   E — Explain why / how it matters
//   E — Examples (2-3 real ones)
//   D — Diagram (only if the question fits)
//
// Framing rule: this is revision material, not exam prediction.
// No mark allocations, no "this will be on the paper" — just structure.
//
// Page is "use client" because the practice-questions accordion is
// interactive (expand on tap). Everything else is static so the
// initial paint is fast.

const recipe = [
  {
    letter: "D",
    word: "Define",
    icon: "📖",
    color: "#818CF8",
    line: "The key term(s) in your own words. 1-2 lines is enough.",
  },
  {
    letter: "E",
    word: "Explain",
    icon: "💡",
    color: "#60A5FA",
    line: "Why it matters or how it works. 2-3 sentences. Don't repeat the definition.",
  },
  {
    letter: "E",
    word: "Examples",
    icon: "🎯",
    color: "#34D399",
    line: "2-3 real examples. Bullets are fine. Concrete > abstract.",
  },
  {
    letter: "D",
    word: "Diagram",
    icon: "📊",
    color: "#A78BFA",
    line: "Simple labelled visual. Only if the question fits.",
  },
];

const depthGuide = [
  { depth: "Short", look: "1 line definition", strategy: "Just the definition. No examples." },
  { depth: "Brief", look: "Definition + 1 example", strategy: "1 line define + 1 example. Skip the diagram." },
  { depth: "Medium", look: "D-E-E (drop the diagram)", strategy: "Define + Explain + 2 Examples." },
  { depth: "Full", look: "Full D-E-E-D recipe", strategy: "All four steps. Diagram covers the last point." },
  { depth: "Extended", look: "D-E-E-D + extended", strategy: "Bigger explanation, 4-5 examples, 1-2 diagrams, short conclusion." },
];

const diagramTips = [
  {
    title: "Box + arrow flowchart",
    use: "When showing a process or cycle",
    example: "IPO cycle, password-reset flow",
    svg: (
      <svg viewBox="0 0 320 80" className="w-full h-16">
        <rect x="10" y="20" width="80" height="40" rx="6" fill="rgba(99,102,241,0.15)" stroke="#818CF8"/>
        <text x="50" y="44" textAnchor="middle" fill="#E4E4E7" fontSize="11" fontFamily="system-ui">Input</text>
        <line x1="92" y1="40" x2="118" y2="40" stroke="#818CF8" strokeWidth="2" markerEnd="url(#arr1)"/>
        <rect x="120" y="20" width="80" height="40" rx="6" fill="rgba(96,165,250,0.15)" stroke="#60A5FA"/>
        <text x="160" y="44" textAnchor="middle" fill="#E4E4E7" fontSize="11" fontFamily="system-ui">Process</text>
        <line x1="202" y1="40" x2="228" y2="40" stroke="#60A5FA" strokeWidth="2" markerEnd="url(#arr1)"/>
        <rect x="230" y="20" width="80" height="40" rx="6" fill="rgba(52,211,153,0.15)" stroke="#34D399"/>
        <text x="270" y="44" textAnchor="middle" fill="#E4E4E7" fontSize="11" fontFamily="system-ui">Output</text>
        <defs>
          <marker id="arr1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="currentColor"/>
          </marker>
        </defs>
      </svg>
    ),
  },
  {
    title: "Hierarchy tree",
    use: "When one thing contains another",
    example: "AI > ML > Deep Learning",
    svg: (
      <svg viewBox="0 0 320 100" className="w-full h-20">
        <rect x="120" y="6" width="80" height="26" rx="6" fill="rgba(167,139,250,0.18)" stroke="#A78BFA"/>
        <text x="160" y="23" textAnchor="middle" fill="#E4E4E7" fontSize="11" fontFamily="system-ui">AI</text>
        <line x1="160" y1="34" x2="160" y2="44" stroke="#A78BFA" strokeWidth="2"/>
        <rect x="120" y="46" width="80" height="26" rx="6" fill="rgba(96,165,250,0.18)" stroke="#60A5FA"/>
        <text x="160" y="63" textAnchor="middle" fill="#E4E4E7" fontSize="11" fontFamily="system-ui">ML</text>
        <line x1="160" y1="74" x2="160" y2="84" stroke="#60A5FA" strokeWidth="2"/>
        <rect x="100" y="86" width="120" height="26" rx="6" fill="rgba(52,211,153,0.18)" stroke="#34D399"/>
        <text x="160" y="103" textAnchor="middle" fill="#E4E4E7" fontSize="11" fontFamily="system-ui">Deep Learning</text>
      </svg>
    ),
  },
  {
    title: "Comparison table",
    use: "When the question says 'differentiate'",
    example: "RAM vs ROM, Instagram vs LinkedIn",
    svg: (
      <svg viewBox="0 0 320 90" className="w-full h-16">
        <rect x="10" y="10" width="300" height="22" fill="rgba(129,140,248,0.18)" stroke="#818CF8"/>
        <line x1="160" y1="10" x2="160" y2="80" stroke="#818CF8" strokeWidth="1"/>
        <text x="85" y="25" textAnchor="middle" fill="#E4E4E7" fontSize="11" fontFamily="system-ui" fontWeight="600">RAM</text>
        <text x="235" y="25" textAnchor="middle" fill="#E4E4E7" fontSize="11" fontFamily="system-ui" fontWeight="600">ROM</text>
        <line x1="10" y1="32" x2="310" y2="32" stroke="#818CF8" strokeWidth="1"/>
        <text x="85" y="48" textAnchor="middle" fill="#A1A1AA" fontSize="10" fontFamily="system-ui">Temporary</text>
        <text x="235" y="48" textAnchor="middle" fill="#A1A1AA" fontSize="10" fontFamily="system-ui">Permanent</text>
        <line x1="10" y1="55" x2="310" y2="55" stroke="rgba(129,140,248,0.3)" strokeWidth="1"/>
        <text x="85" y="71" textAnchor="middle" fill="#A1A1AA" fontSize="10" fontFamily="system-ui">Read &amp; write</text>
        <text x="235" y="71" textAnchor="middle" fill="#A1A1AA" fontSize="10" fontFamily="system-ui">Read only</text>
        <rect x="10" y="10" width="300" height="70" fill="none" stroke="#818CF8" strokeWidth="1"/>
      </svg>
    ),
  },
  {
    title: "Labelled component",
    use: "When showing parts of one thing",
    example: "Parts of a CPU, parts of a webpage",
    svg: (
      <svg viewBox="0 0 320 90" className="w-full h-16">
        <rect x="80" y="20" width="160" height="50" rx="8" fill="rgba(167,139,250,0.12)" stroke="#A78BFA" strokeWidth="2"/>
        <text x="160" y="50" textAnchor="middle" fill="#E4E4E7" fontSize="14" fontFamily="system-ui" fontWeight="600">CPU</text>
        <line x1="80" y1="35" x2="40" y2="20" stroke="#34D399" strokeWidth="1"/>
        <text x="38" y="18" textAnchor="end" fill="#34D399" fontSize="9" fontFamily="system-ui">ALU</text>
        <line x1="240" y1="35" x2="280" y2="20" stroke="#60A5FA" strokeWidth="1"/>
        <text x="282" y="18" textAnchor="start" fill="#60A5FA" fontSize="9" fontFamily="system-ui">Control</text>
        <line x1="80" y1="55" x2="40" y2="80" stroke="#FBBF24" strokeWidth="1"/>
        <text x="38" y="84" textAnchor="end" fill="#FBBF24" fontSize="9" fontFamily="system-ui">Cache</text>
        <line x1="240" y1="55" x2="280" y2="80" stroke="#F87171" strokeWidth="1"/>
        <text x="282" y="84" textAnchor="start" fill="#F87171" fontSize="9" fontFamily="system-ui">Bus</text>
      </svg>
    ),
  },
];

const mistakes = [
  { line: "Writing definitions only — no examples", cost: "Answer feels half finished" },
  { line: "Skipping the diagram on a 'with a diagram' question", cost: "A required part is missing" },
  { line: "Rambling — readers skim, clear structure helps", cost: "The point gets buried" },
  { line: "Repeating yourself instead of adding new info", cost: "Repeats add nothing new" },
  { line: "Spending too long on a short question", cost: "Eats time from other questions" },
];

export default function ExamPrepPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="relative overflow-hidden">
        {/* Ambient glow background — matches the home hero */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(900px 500px at 50% 0%, rgba(99,102,241,0.18), transparent 60%)",
          }}
        />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          {/* ─── Hero ─── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-12"
          >
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
              style={{
                background: "rgba(99,102,241,0.12)",
                border: "1px solid rgba(99,102,241,0.25)",
                color: "#A5B4FC",
              }}
            >
              📝 Revision Guide
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">
              Revise the core ICT concepts
            </h1>
            <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              A study guide for students preparing or retaking the subject. One
              simple structure — <strong className="text-zinc-200">D · E · E · D</strong> —
              you can reuse on any long-answer question while revising.
            </p>
            <div className="flex items-center justify-center gap-6 mt-6 text-sm text-zinc-500">
              <span><strong className="text-white">4-step</strong> structure</span>
              <span>·</span>
              <span><strong className="text-white">28 concepts</strong> to revise</span>
              <span>·</span>
              <span><strong className="text-white">Worked example</strong> included</span>
            </div>

            {/* Start-here strip — gives a nervous student a clear path
                 through the page in two lines. Sits inside the hero
                 so it never feels like a separate task. */}
            <div
              className="mt-8 inline-flex flex-col sm:flex-row items-center gap-2 sm:gap-4 px-4 py-3 rounded-2xl text-[12.5px]"
              style={{
                background: "rgba(99,102,241,0.06)",
                border: "1px solid rgba(99,102,241,0.20)",
              }}
            >
              <span className="font-bold text-indigo-300 uppercase tracking-wider text-[10px]">
                Start here
              </span>
              <span className="text-zinc-300">
                <strong className="text-white">1.</strong> Learn the structure
                <span className="mx-2 text-zinc-600">→</span>
                <strong className="text-white">2.</strong> Read the worked example
                <span className="mx-2 text-zinc-600">→</span>
                <strong className="text-white">3.</strong> Revise the 28 core concepts
              </span>
            </div>
          </motion.div>

          {/* ─── The D-E-E-D recipe ─── */}
          <section className="mb-14">
            <div className="text-center mb-6">
              <div className="text-xs font-bold tracking-widest uppercase text-zinc-500 mb-1">The Structure</div>
              <h2 className="text-2xl sm:text-3xl font-bold">D · E · E · D</h2>
              <p className="text-sm text-zinc-400 mt-2">Use these four steps in order whenever you practise a long-answer question.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {recipe.map((r, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.4, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className="card-glass rounded-2xl p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-black"
                      style={{
                        background: `${r.color}22`,
                        border: `1px solid ${r.color}55`,
                        color: r.color,
                      }}
                    >
                      {r.letter}
                    </div>
                    <span className="text-2xl">{r.icon}</span>
                  </div>
                  <div className="text-base font-bold text-white mb-1">{r.word}</div>
                  <p className="text-[12px] text-zinc-400 leading-relaxed">{r.line}</p>
                </motion.div>
              ))}
            </div>
            <div
              className="mt-4 rounded-xl p-3 text-[12px] text-zinc-300 text-center"
              style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.22)" }}
            >
              ⏱ <strong>Tip:</strong> match the depth of your answer to the depth of the question. Short question → short answer.
            </div>
          </section>

          {/* ─── Answer depth guide ─── */}
          <section className="mb-14">
            <div className="text-center mb-6">
              <div className="text-xs font-bold tracking-widest uppercase text-zinc-500 mb-1">Answer Depth</div>
              <h2 className="text-2xl sm:text-3xl font-bold">How to scale your answer</h2>
              <p className="text-sm text-zinc-400 mt-2">A short question doesn&apos;t need a diagram. A long one usually does.</p>
            </div>
            <div className="card-glass rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.18), rgba(139,92,246,0.12))" }}>
                      <th className="px-4 py-3 text-left font-semibold text-white tracking-wide">Depth</th>
                      <th className="px-4 py-3 text-left font-semibold text-white tracking-wide">Looks like</th>
                      <th className="px-4 py-3 text-left font-semibold text-white tracking-wide">Strategy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {depthGuide.map((m, i) => (
                      <tr
                        key={m.depth}
                        className="hover:bg-white/[0.02] transition-colors"
                        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                      >
                        <td className="px-4 py-3">
                          <span
                            className="inline-block px-3 py-1 rounded-full font-semibold text-white text-[11px] tracking-wide"
                            style={{
                              background: i === 4 ? "linear-gradient(135deg,#A78BFA,#7C3AED)" : `linear-gradient(135deg, rgba(99,102,241,${0.4 + i * 0.12}), rgba(139,92,246,${0.4 + i * 0.12}))`,
                            }}
                          >
                            {m.depth}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-zinc-300 font-medium">{m.look}</td>
                        <td className="px-4 py-3 text-zinc-400">{m.strategy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* ─── Worked example (the killer feature) ─── */}
          <WorkedExample />

          {/* ─── Diagram tips ─── */}
          <section className="mb-14">
            <div className="text-center mb-6">
              <div className="text-xs font-bold tracking-widest uppercase text-zinc-500 mb-1">Useful Diagram Types</div>
              <h2 className="text-2xl sm:text-3xl font-bold">4 simple diagram types</h2>
              <p className="text-sm text-zinc-400 mt-2">You don&apos;t need to be an artist. Boxes, arrows, labels. Always label every part.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {diagramTips.map((d, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="card-glass rounded-2xl p-4"
                >
                  <div className="text-sm font-bold text-white mb-1">{d.title}</div>
                  <p className="text-[12px] text-zinc-400 mb-3">
                    <strong className="text-zinc-300">Use when:</strong> {d.use}
                    <br />
                    <strong className="text-zinc-300">Example:</strong> {d.example}
                  </p>
                  <div
                    className="rounded-lg p-3"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    {d.svg}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ─── Core concepts bank — main study material ─── */}
          <CoreConcepts />

          {/* ─── Common mistakes ─── */}
          <section className="mb-14">
            <div className="text-center mb-6">
              <div className="text-xs font-bold tracking-widest uppercase text-zinc-500 mb-1">Watch Out For</div>
              <h2 className="text-2xl sm:text-3xl font-bold">Common mistakes to avoid</h2>
            </div>
            <div
              className="rounded-2xl p-5"
              style={{
                background: "rgba(239,68,68,0.04)",
                border: "1px solid rgba(239,68,68,0.22)",
              }}
            >
              <ul className="space-y-3">
                {mistakes.map((m, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span className="shrink-0 mt-0.5 w-6 h-6 rounded-full bg-red-500/15 text-red-300 text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <div className="text-zinc-200">{m.line}</div>
                      <div className="text-[11px] text-red-400 mt-0.5">{m.cost}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* ─── Quick reference card (screenshot this) ─── */}
          <section className="mb-12">
            <div className="text-center mb-4">
              <div className="text-xs font-bold tracking-widest uppercase text-zinc-500 mb-1">Save This</div>
              <h2 className="text-2xl sm:text-3xl font-bold">Quick reference — keep handy while revising</h2>
            </div>
            <div
              className="rounded-2xl p-6 sm:p-8"
              style={{
                background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))",
                border: "1px solid rgba(99,102,241,0.3)",
              }}
            >
              <div className="text-center mb-5">
                <div className="text-3xl sm:text-4xl font-black tracking-tight bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #A78BFA, #C4B5FD)" }}>
                  D · E · E · D
                </div>
                <div className="text-xs text-zinc-400 mt-1">The 4-step structure for any long answer</div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                {recipe.map((r) => (
                  <div key={r.letter + r.word} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div className="text-xs font-bold mb-1" style={{ color: r.color }}>{r.letter}</div>
                    <div className="text-[13px] font-semibold text-white">{r.word}</div>
                  </div>
                ))}
              </div>
              <div className="mt-5 text-center text-[12px] text-zinc-300">
                ⏱ <strong>Match depth to depth.</strong> Add a diagram for longer questions. Always label every part.
              </div>
            </div>
          </section>

          {/* Back to home */}
          <div className="text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-indigo-300 hover:text-indigo-200 transition-colors"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
