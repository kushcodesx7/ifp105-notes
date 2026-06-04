"use client";

import { motion } from "framer-motion";

// WorkedExample — a single 6-mark question fully answered using the
// D-E-E-D framework, with study notes in the right margin explaining
// why each part of the answer works.
//
// Why this is a useful block on /exam-prep:
//   Students who feel shaky on a topic often know the content but
//   don't have a clear model of what a tidy long answer looks like.
//   Putting study notes next to the answer makes the structure
//   visible: "ah, THIS phrase is the definition; THIS bit links
//   the ideas together."
//
// Layout:
//   Desktop: 2-column grid — answer on left (2/3 width), notes
//            on right (1/3 width). Each note vertically aligned
//            with the answer line it refers to.
//   Mobile : stacked — answer block, then a notes list below.

interface AnswerSection {
  /** Section heading the student writes ("Definition", "Examples"…). */
  heading: string;
  /** The actual student-written answer for this section. */
  body: React.ReactNode;
  /** Study note explaining why this part of the answer works. */
  comment: string;
  /** Approximate marks allocated to this section. Used to colour the chip. */
  marks: number;
  /** Tone of the study note — green for a strong part, amber for
   *  "could be tighter", red for a common slip to watch for. */
  tone?: "good" | "ok" | "warn";
}

const SECTIONS: AnswerSection[] = [
  {
    heading: "Define",
    body: (
      <>
        <p className="mb-2">
          <strong>AI (Artificial Intelligence)</strong> is software that can do
          tasks that usually need human thinking — like recognising faces,
          understanding speech, or making decisions.
        </p>
        <p>
          <strong>ML (Machine Learning)</strong> is a branch of AI where the
          software learns from data instead of being programmed step-by-step.
        </p>
      </>
    ),
    comment: "Both terms are defined cleanly in the student's own words. Two distinct ideas, no copy-paste from the question.",
    marks: 2,
    tone: "good",
  },
  {
    heading: "Explain",
    body: (
      <p>
        AI gives computers human-like skills (sight, speech, decisions). ML is
        the engine that powers most modern AI — instead of hand-writing every
        rule, the system trains itself on examples and gets better as it sees
        more data.
      </p>
    ),
    comment: "Good link between the two terms. The reader can see the student understands HOW they relate, not just what they are.",
    marks: 2,
    tone: "good",
  },
  {
    heading: "Examples",
    body: (
      <>
        <p className="mb-1.5"><strong>AI in daily life:</strong></p>
        <ul className="list-disc ml-5 mb-3 space-y-0.5 text-zinc-300">
          <li>Siri / Google Assistant (understands speech)</li>
          <li>Google Translate (converts languages)</li>
        </ul>
        <p className="mb-1.5"><strong>ML in daily life:</strong></p>
        <ul className="list-disc ml-5 space-y-0.5 text-zinc-300">
          <li>YouTube recommendations (learns what you watch)</li>
          <li>Gmail spam filter (learns what looks like spam)</li>
        </ul>
      </>
    ),
    comment: "Two for each — exactly what the question asked. Concrete, well-known apps anyone can recognise.",
    marks: 1.5,
    tone: "good",
  },
  {
    heading: "Diagram",
    body: (
      <div
        className="rounded-lg p-4 my-2"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <svg viewBox="0 0 360 160" className="w-full h-32">
          {/* Outer AI circle */}
          <circle cx="180" cy="80" r="75" fill="rgba(167,139,250,0.10)" stroke="#A78BFA" strokeWidth="2"/>
          <text x="180" y="22" textAnchor="middle" fill="#A78BFA" fontSize="13" fontFamily="system-ui" fontWeight="700">AI</text>
          <text x="180" y="36" textAnchor="middle" fill="#A1A1AA" fontSize="9" fontFamily="system-ui">Artificial Intelligence</text>
          {/* Middle ML circle */}
          <circle cx="180" cy="92" r="50" fill="rgba(96,165,250,0.14)" stroke="#60A5FA" strokeWidth="2"/>
          <text x="180" y="60" textAnchor="middle" fill="#60A5FA" fontSize="12" fontFamily="system-ui" fontWeight="700">ML</text>
          <text x="180" y="73" textAnchor="middle" fill="#A1A1AA" fontSize="9" fontFamily="system-ui">Machine Learning</text>
          {/* Inner DL circle */}
          <circle cx="180" cy="102" r="22" fill="rgba(52,211,153,0.18)" stroke="#34D399" strokeWidth="2"/>
          <text x="180" y="106" textAnchor="middle" fill="#34D399" fontSize="10" fontFamily="system-ui" fontWeight="700">DL</text>
        </svg>
        <div className="text-[11px] text-zinc-500 text-center mt-1">
          AI is the big idea · ML is a part of AI · Deep Learning (DL) is a part of ML
        </div>
      </div>
    ),
    comment: "Concentric circles show containment clearly. Every part is labelled. A simple sketch like this is enough — no artistic skill needed.",
    marks: 0.5,
    tone: "good",
  },
];

const toneColor = {
  good: { bg: "rgba(52,211,153,0.10)", border: "rgba(52,211,153,0.30)", text: "#34D399" },
  ok: { bg: "rgba(251,191,36,0.10)", border: "rgba(251,191,36,0.30)", text: "#FBBF24" },
  warn: { bg: "rgba(248,113,113,0.10)", border: "rgba(248,113,113,0.30)", text: "#F87171" },
} as const;

export default function WorkedExample() {
  const totalMarks = SECTIONS.reduce((s, x) => s + x.marks, 0);

  return (
    <section className="mb-14">
      <div className="text-center mb-6">
        <div className="text-xs font-bold tracking-widest uppercase text-zinc-500 mb-1">Worked Example</div>
        <h2 className="text-2xl sm:text-3xl font-bold">A worked example of a clear answer</h2>
        <p className="text-sm text-zinc-400 mt-2">A 6-mark practice question, a sample student answer, and study notes in the margin to show why each part works.</p>
      </div>

      {/* The question card */}
      <div
        className="rounded-2xl p-5 mb-4"
        style={{
          background: "linear-gradient(135deg, rgba(99,102,241,0.10), rgba(139,92,246,0.06))",
          border: "1px solid rgba(99,102,241,0.30)",
        }}
      >
        <div className="flex items-center gap-3 mb-2">
          <span
            className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide"
            style={{ background: "rgba(99,102,241,0.18)", color: "#A5B4FC" }}
          >
            6 MARKS
          </span>
          <span className="text-[10px] text-zinc-500">~6 min</span>
        </div>
        <p className="text-base sm:text-lg text-zinc-100 font-medium leading-relaxed">
          &ldquo;Define <strong>AI</strong> and <strong>ML</strong>. Give 2
          benefits and 2 examples of each.&rdquo;
        </p>
      </div>

      {/* Answer + margin comments */}
      <div className="card-glass rounded-2xl overflow-hidden">
        <div className="grid lg:grid-cols-[2fr_1fr]">
          {/* Left: the answer */}
          <div className="p-5 lg:p-6 lg:border-r" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <div className="text-[10px] font-bold tracking-widest uppercase text-zinc-500 mb-3">
              Student&apos;s Answer
            </div>
            {SECTIONS.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className={i < SECTIONS.length - 1 ? "mb-5" : ""}
              >
                <div className="text-[11px] font-bold tracking-wider uppercase text-indigo-300 mb-1.5">
                  {s.heading}
                </div>
                <div className="text-[14px] text-zinc-200 leading-relaxed">
                  {s.body}
                </div>
                {/* Mobile-only marker comment under each section */}
                <div className="lg:hidden mt-3">
                  <div
                    className="rounded-lg p-3 text-[12px]"
                    style={{
                      background: toneColor[s.tone || "good"].bg,
                      border: `1px solid ${toneColor[s.tone || "good"].border}`,
                    }}
                  >
                    <div
                      className="text-[10px] font-bold tracking-wide uppercase mb-1"
                      style={{ color: toneColor[s.tone || "good"].text }}
                    >
                      ✓ ~{s.marks} {s.marks === 1 ? "mark" : "marks"} · study note
                    </div>
                    <div className="text-zinc-300">{s.comment}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right: margin comments — desktop only, vertically aligned via flex */}
          <div className="hidden lg:block p-5 lg:p-6">
            <div className="text-[10px] font-bold tracking-widest uppercase text-zinc-500 mb-3">
              Study Notes
            </div>
            {SECTIONS.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: i * 0.08 + 0.1 }}
                className={i < SECTIONS.length - 1 ? "mb-5" : ""}
              >
                <div
                  className="rounded-lg p-3 text-[12px]"
                  style={{
                    background: toneColor[s.tone || "good"].bg,
                    border: `1px solid ${toneColor[s.tone || "good"].border}`,
                  }}
                >
                  <div
                    className="text-[10px] font-bold tracking-wide uppercase mb-1"
                    style={{ color: toneColor[s.tone || "good"].text }}
                  >
                    ✓ ~{s.marks} {s.marks === 1 ? "mark" : "marks"}
                  </div>
                  <div className="text-zinc-300 leading-relaxed">{s.comment}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer total */}
        <div
          className="flex items-center justify-between px-5 lg:px-6 py-3"
          style={{ background: "rgba(52,211,153,0.06)", borderTop: "1px solid rgba(52,211,153,0.22)" }}
        >
          <div className="text-[12px] text-zinc-400">
            Covers all 6 marks: <strong className="text-emerald-300">{totalMarks} / 6</strong>
          </div>
          <div className="text-[11px] text-emerald-300 font-semibold">
            ✓ Strong answer
          </div>
        </div>
      </div>
    </section>
  );
}
