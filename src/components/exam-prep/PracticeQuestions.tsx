"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// PracticeQuestions — 10 collapsible model answers covering Modules
// 1, 3, and 5 in the proportions students will face on the IFP105
// exam. Each entry is structured with the same D-E-E-D headings the
// rest of the page teaches, so the student can map the recipe onto
// real questions visually.
//
// Default state: collapsed. The page already has a long worked
// example above; opening every model answer at once would bury the
// rest of the structure and turn this into a wall of text. Tap to
// expand whichever they want to study.

interface ModelAnswer {
  module: string; // "Module 1" / "Module 3" / "Module 5"
  marks: number;
  question: string;
  answer: React.ReactNode;
}

const QUESTIONS: ModelAnswer[] = [
  {
    module: "Module 1",
    marks: 4,
    question: "Define hardware and software with examples.",
    answer: (
      <>
        <p className="font-semibold text-indigo-300 mb-1">Define</p>
        <p className="mb-3">
          <strong>Hardware</strong> = the physical parts of a computer you can touch and see.<br />
          <strong>Software</strong> = the programs / instructions that tell the hardware what to do.
        </p>
        <p className="font-semibold text-indigo-300 mb-1">Examples</p>
        <ul className="list-disc ml-5 mb-3 space-y-0.5">
          <li>Hardware: keyboard, monitor, RAM, CPU, USB stick</li>
          <li>Software: Windows, Chrome, MS Word, WhatsApp</li>
        </ul>
        <p className="font-semibold text-indigo-300 mb-1">Key idea</p>
        <p>Without software, hardware is just metal. Without hardware, software has nowhere to run. They always work together.</p>
      </>
    ),
  },
  {
    module: "Module 1",
    marks: 6,
    question: "What is RAM? Explain its role with a labelled diagram.",
    answer: (
      <>
        <p className="font-semibold text-indigo-300 mb-1">Define</p>
        <p className="mb-3">
          <strong>RAM (Random Access Memory)</strong> is the fast, temporary memory the CPU uses while a program is running.
        </p>
        <p className="font-semibold text-indigo-300 mb-1">Explain</p>
        <p className="mb-3">
          When you open Chrome, the program is loaded from the slow hard disk INTO RAM so the CPU can use it quickly. RAM is much faster than the hard disk but loses everything when the computer turns off.
        </p>
        <p className="font-semibold text-indigo-300 mb-1">Examples</p>
        <ul className="list-disc ml-5 mb-3 space-y-0.5">
          <li>A laptop with 8GB RAM can run more apps at once than 4GB</li>
          <li>Closing Chrome tabs frees up RAM</li>
          <li>Restart fixes &ldquo;slow computer&rdquo; — clears the RAM</li>
        </ul>
        <p className="font-semibold text-indigo-300 mb-1">Diagram</p>
        <div
          className="rounded-lg p-3 my-2"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <svg viewBox="0 0 360 90" className="w-full h-20">
            <rect x="6" y="20" width="100" height="50" rx="6" fill="rgba(251,191,36,0.12)" stroke="#FBBF24"/>
            <text x="56" y="44" textAnchor="middle" fill="#FBBF24" fontSize="11" fontFamily="system-ui" fontWeight="600">Hard Disk</text>
            <text x="56" y="58" textAnchor="middle" fill="#A1A1AA" fontSize="9" fontFamily="system-ui">slow · permanent</text>
            <line x1="108" y1="45" x2="134" y2="45" stroke="#A1A1AA" strokeWidth="2" markerEnd="url(#arr2)"/>
            <rect x="136" y="20" width="100" height="50" rx="6" fill="rgba(96,165,250,0.14)" stroke="#60A5FA"/>
            <text x="186" y="44" textAnchor="middle" fill="#60A5FA" fontSize="11" fontFamily="system-ui" fontWeight="600">RAM</text>
            <text x="186" y="58" textAnchor="middle" fill="#A1A1AA" fontSize="9" fontFamily="system-ui">fast · temporary</text>
            <line x1="238" y1="45" x2="264" y2="45" stroke="#A1A1AA" strokeWidth="2" markerEnd="url(#arr2)"/>
            <rect x="266" y="20" width="90" height="50" rx="6" fill="rgba(167,139,250,0.14)" stroke="#A78BFA"/>
            <text x="311" y="44" textAnchor="middle" fill="#A78BFA" fontSize="11" fontFamily="system-ui" fontWeight="600">CPU</text>
            <text x="311" y="58" textAnchor="middle" fill="#A1A1AA" fontSize="9" fontFamily="system-ui">the brain</text>
            <defs>
              <marker id="arr2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                <path d="M0,0 L10,5 L0,10 z" fill="currentColor"/>
              </marker>
            </defs>
          </svg>
        </div>
      </>
    ),
  },
  {
    module: "Module 1",
    marks: 4,
    question: "Explain the IPO cycle with a diagram.",
    answer: (
      <>
        <p className="font-semibold text-indigo-300 mb-1">Define</p>
        <p className="mb-3">
          <strong>IPO = Input → Processing → Output.</strong> Every computer follows this basic three-step cycle for every task.
        </p>
        <p className="font-semibold text-indigo-300 mb-1">Each step</p>
        <ul className="list-disc ml-5 mb-3 space-y-0.5">
          <li><strong>Input:</strong> data going in (typing, clicking, microphone)</li>
          <li><strong>Processing:</strong> CPU does the work (calculation, decision)</li>
          <li><strong>Output:</strong> result coming out (screen, speaker, printer)</li>
        </ul>
        <p className="font-semibold text-indigo-300 mb-1">Example</p>
        <p className="mb-3">You type &ldquo;5+3&rdquo; on the keyboard (input) → CPU adds the numbers (processing) → screen shows &ldquo;8&rdquo; (output).</p>
        <p className="font-semibold text-indigo-300 mb-1">Diagram</p>
        <div className="rounded-lg p-3 my-2" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <svg viewBox="0 0 360 80" className="w-full h-16">
            <rect x="10" y="20" width="90" height="40" rx="6" fill="rgba(99,102,241,0.15)" stroke="#818CF8"/>
            <text x="55" y="44" textAnchor="middle" fill="#E4E4E7" fontSize="11" fontFamily="system-ui" fontWeight="600">Input</text>
            <line x1="102" y1="40" x2="128" y2="40" stroke="#818CF8" strokeWidth="2" markerEnd="url(#arr3)"/>
            <rect x="130" y="20" width="100" height="40" rx="6" fill="rgba(96,165,250,0.15)" stroke="#60A5FA"/>
            <text x="180" y="44" textAnchor="middle" fill="#E4E4E7" fontSize="11" fontFamily="system-ui" fontWeight="600">Processing</text>
            <line x1="232" y1="40" x2="258" y2="40" stroke="#60A5FA" strokeWidth="2" markerEnd="url(#arr3)"/>
            <rect x="260" y="20" width="90" height="40" rx="6" fill="rgba(52,211,153,0.15)" stroke="#34D399"/>
            <text x="305" y="44" textAnchor="middle" fill="#E4E4E7" fontSize="11" fontFamily="system-ui" fontWeight="600">Output</text>
            <defs>
              <marker id="arr3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                <path d="M0,0 L10,5 L0,10 z" fill="currentColor"/>
              </marker>
            </defs>
          </svg>
        </div>
      </>
    ),
  },
  {
    module: "Module 1",
    marks: 6,
    question: "Explain the difference between hardware and software with a diagram.",
    answer: (
      <>
        <p className="font-semibold text-indigo-300 mb-1">Define</p>
        <p className="mb-3">
          <strong>Hardware</strong> = the physical, touchable parts of a computer.<br />
          <strong>Software</strong> = the instructions / programs that run on the hardware.
        </p>
        <p className="font-semibold text-indigo-300 mb-1">Key difference</p>
        <p className="mb-3">Hardware is the body; software is the brain instructions. Hardware never changes once made; software is updated all the time. You can install new software but you can&apos;t install new hardware without opening the computer.</p>
        <p className="font-semibold text-indigo-300 mb-1">Examples</p>
        <ul className="list-disc ml-5 mb-3 space-y-0.5">
          <li>Hardware: laptop, phone, USB stick, keyboard, RAM chip</li>
          <li>Software: WhatsApp, Google Translate, Windows / iOS</li>
        </ul>
        <p className="font-semibold text-indigo-300 mb-1">Diagram</p>
        <div className="rounded-lg p-3 my-2" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <svg viewBox="0 0 360 110" className="w-full h-24">
            <rect x="10" y="10" width="340" height="90" rx="10" fill="none" stroke="#A78BFA" strokeWidth="2" strokeDasharray="4 4"/>
            <text x="180" y="26" textAnchor="middle" fill="#A78BFA" fontSize="11" fontFamily="system-ui" fontWeight="700">COMPUTER</text>
            <rect x="20" y="36" width="155" height="56" rx="6" fill="rgba(251,191,36,0.10)" stroke="#FBBF24"/>
            <text x="97" y="56" textAnchor="middle" fill="#FBBF24" fontSize="11" fontFamily="system-ui" fontWeight="600">Hardware</text>
            <text x="97" y="71" textAnchor="middle" fill="#A1A1AA" fontSize="9" fontFamily="system-ui">touchable parts</text>
            <text x="97" y="84" textAnchor="middle" fill="#A1A1AA" fontSize="9" fontFamily="system-ui">CPU · RAM · screen</text>
            <rect x="185" y="36" width="155" height="56" rx="6" fill="rgba(96,165,250,0.12)" stroke="#60A5FA"/>
            <text x="262" y="56" textAnchor="middle" fill="#60A5FA" fontSize="11" fontFamily="system-ui" fontWeight="600">Software</text>
            <text x="262" y="71" textAnchor="middle" fill="#A1A1AA" fontSize="9" fontFamily="system-ui">programs that run</text>
            <text x="262" y="84" textAnchor="middle" fill="#A1A1AA" fontSize="9" fontFamily="system-ui">apps · OS · games</text>
          </svg>
        </div>
      </>
    ),
  },
  {
    module: "Module 3",
    marks: 6,
    question: "What is social media? List 3 benefits and 3 drawbacks.",
    answer: (
      <>
        <p className="font-semibold text-indigo-300 mb-1">Define</p>
        <p className="mb-3">
          <strong>Social media</strong> = apps and websites where users post their own content and reply to each other (e.g. Instagram, TikTok, Telegram). It is two-way, unlike old TV which only broadcasts.
        </p>
        <p className="font-semibold text-indigo-300 mb-1">3 Benefits</p>
        <ul className="list-disc ml-5 mb-3 space-y-0.5">
          <li>Connects you with friends and family worldwide for free</li>
          <li>Free way to learn (tutorials, news, language practice)</li>
          <li>Almost-free advertising for small shops in Tashkent</li>
        </ul>
        <p className="font-semibold text-indigo-300 mb-1">3 Drawbacks</p>
        <ul className="list-disc ml-5 mb-3 space-y-0.5">
          <li>Time-wasting — apps designed to keep you scrolling for hours</li>
          <li>Misinformation spreads fast; not everything is true</li>
          <li>Privacy risk — once posted, content can stay online forever</li>
        </ul>
        <p className="font-semibold text-indigo-300 mb-1">Conclusion</p>
        <p>Use it mindfully — set time limits, fact-check before sharing.</p>
      </>
    ),
  },
  {
    module: "Module 3",
    marks: 4,
    question: "Differentiate between Instagram and LinkedIn.",
    answer: (
      <>
        <p className="font-semibold text-indigo-300 mb-1">Comparison table</p>
        <div
          className="rounded-lg overflow-hidden mb-3"
          style={{ border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <table className="w-full text-[12px]">
            <thead style={{ background: "rgba(99,102,241,0.12)" }}>
              <tr>
                <th className="px-3 py-2 text-left text-zinc-300">Feature</th>
                <th className="px-3 py-2 text-left text-zinc-300">Instagram</th>
                <th className="px-3 py-2 text-left text-zinc-300">LinkedIn</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <td className="px-3 py-2 font-medium text-zinc-300">Purpose</td>
                <td className="px-3 py-2 text-zinc-400">Personal — photos, friends, fun</td>
                <td className="px-3 py-2 text-zinc-400">Professional — jobs, careers</td>
              </tr>
              <tr className="border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <td className="px-3 py-2 font-medium text-zinc-300">Audience</td>
                <td className="px-3 py-2 text-zinc-400">Teens, young adults</td>
                <td className="px-3 py-2 text-zinc-400">Working professionals</td>
              </tr>
              <tr className="border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <td className="px-3 py-2 font-medium text-zinc-300">Content</td>
                <td className="px-3 py-2 text-zinc-400">Photos, Reels, Stories</td>
                <td className="px-3 py-2 text-zinc-400">CV, work updates, articles</td>
              </tr>
              <tr className="border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <td className="px-3 py-2 font-medium text-zinc-300">Use case</td>
                <td className="px-3 py-2 text-zinc-400">Sharing daily life</td>
                <td className="px-3 py-2 text-zinc-400">Finding internships, networking</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="font-semibold text-indigo-300 mb-1">Conclusion</p>
        <p>Instagram = personal life. LinkedIn = career. Same idea (post + follow), very different audience.</p>
      </>
    ),
  },
  {
    module: "Module 5",
    marks: 6,
    question: "Define AI and ML. Give 2 benefits and 2 examples of each.",
    answer: (
      <>
        <p className="text-[12px] text-zinc-500 italic mb-2">
          (This is the question we walked through in the Worked Example above — see the marker comments there for full mark allocation.)
        </p>
        <p className="font-semibold text-indigo-300 mb-1">Define</p>
        <p className="mb-3">
          <strong>AI</strong> = software that does tasks needing human thinking (face recognition, speech, decisions).<br />
          <strong>ML</strong> = a branch of AI where the software learns from data instead of being programmed step-by-step.
        </p>
        <p className="font-semibold text-indigo-300 mb-1">Benefits + Examples</p>
        <ul className="list-disc ml-5 space-y-1">
          <li><strong>AI benefits:</strong> works 24/7, doesn&apos;t get tired · saves time on repetitive tasks</li>
          <li><strong>AI examples:</strong> Siri, Google Translate</li>
          <li><strong>ML benefits:</strong> gets better the more data it sees · spots patterns humans would miss</li>
          <li><strong>ML examples:</strong> YouTube recommendations, Gmail spam filter</li>
        </ul>
      </>
    ),
  },
  {
    module: "Module 5",
    marks: 6,
    question: "Define cloud computing. Why is it useful? Give 3 examples.",
    answer: (
      <>
        <p className="font-semibold text-indigo-300 mb-1">Define</p>
        <p className="mb-3">
          <strong>Cloud computing</strong> = using software, storage, or computing power that runs on the internet, not on your own computer.
        </p>
        <p className="font-semibold text-indigo-300 mb-1">Why useful</p>
        <ul className="list-disc ml-5 mb-3 space-y-0.5">
          <li>Access your files from any device, anywhere with internet</li>
          <li>No need for expensive hardware on your own computer</li>
          <li>Automatic backups — files are safe even if your laptop breaks</li>
        </ul>
        <p className="font-semibold text-indigo-300 mb-1">3 Examples</p>
        <ul className="list-disc ml-5 mb-3 space-y-0.5">
          <li><strong>Google Drive</strong> — store and share files online</li>
          <li><strong>Gmail</strong> — your email lives on Google&apos;s servers, not your phone</li>
          <li><strong>Spotify</strong> — music streamed from the cloud, not stored on your phone</li>
        </ul>
        <p className="font-semibold text-indigo-300 mb-1">Diagram</p>
        <div className="rounded-lg p-3 my-2" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <svg viewBox="0 0 360 130" className="w-full h-28">
            <ellipse cx="180" cy="30" rx="100" ry="22" fill="rgba(167,139,250,0.18)" stroke="#A78BFA" strokeWidth="2"/>
            <text x="180" y="35" textAnchor="middle" fill="#E4E4E7" fontSize="13" fontFamily="system-ui" fontWeight="700">☁ The Cloud</text>
            <line x1="180" y1="52" x2="80" y2="100" stroke="#60A5FA" strokeWidth="1.5" strokeDasharray="3 3"/>
            <line x1="180" y1="52" x2="180" y2="100" stroke="#60A5FA" strokeWidth="1.5" strokeDasharray="3 3"/>
            <line x1="180" y1="52" x2="280" y2="100" stroke="#60A5FA" strokeWidth="1.5" strokeDasharray="3 3"/>
            <rect x="40" y="100" width="80" height="22" rx="4" fill="rgba(96,165,250,0.18)" stroke="#60A5FA"/>
            <text x="80" y="115" textAnchor="middle" fill="#E4E4E7" fontSize="10" fontFamily="system-ui">Laptop</text>
            <rect x="140" y="100" width="80" height="22" rx="4" fill="rgba(96,165,250,0.18)" stroke="#60A5FA"/>
            <text x="180" y="115" textAnchor="middle" fill="#E4E4E7" fontSize="10" fontFamily="system-ui">Phone</text>
            <rect x="240" y="100" width="80" height="22" rx="4" fill="rgba(96,165,250,0.18)" stroke="#60A5FA"/>
            <text x="280" y="115" textAnchor="middle" fill="#E4E4E7" fontSize="10" fontFamily="system-ui">Tablet</text>
          </svg>
        </div>
      </>
    ),
  },
  {
    module: "Module 5",
    marks: 6,
    question: "What is cybersecurity? List 4 ways to stay safe online.",
    answer: (
      <>
        <p className="font-semibold text-indigo-300 mb-1">Define</p>
        <p className="mb-3">
          <strong>Cybersecurity</strong> = the practice of protecting computers, networks, and personal data from attacks like hacking, viruses, and identity theft.
        </p>
        <p className="font-semibold text-indigo-300 mb-1">Why it matters</p>
        <p className="mb-3">One leaked password can give a hacker access to your bank, email, social media, and family photos. Most attacks succeed because of weak passwords or careless clicks — not advanced hacking.</p>
        <p className="font-semibold text-indigo-300 mb-1">4 Ways to stay safe</p>
        <ol className="list-decimal ml-5 mb-3 space-y-0.5">
          <li><strong>Strong, unique passwords</strong> — mix of letters, numbers, symbols. A different password for each important account.</li>
          <li><strong>Two-factor authentication (2FA)</strong> — a code from your phone in addition to the password. Even if the password leaks, the hacker cannot get in.</li>
          <li><strong>Don&apos;t click suspicious links</strong> in emails, SMS, or messages — this is called &ldquo;phishing&rdquo; and is the #1 way accounts get stolen.</li>
          <li><strong>Keep software updated</strong> — every update patches security holes. An old phone or browser is an open door.</li>
        </ol>
      </>
    ),
  },
  {
    module: "Module 5",
    marks: 4,
    question: "Define VR and AR. Give 1 example each.",
    answer: (
      <>
        <p className="font-semibold text-indigo-300 mb-1">Define</p>
        <p className="mb-3">
          <strong>VR (Virtual Reality)</strong> = a fully digital world you experience through a headset that <em>blocks out</em> the real world.<br />
          <strong>AR (Augmented Reality)</strong> = digital things <em>added on top</em> of the real world through your phone camera or special glasses.
        </p>
        <p className="font-semibold text-indigo-300 mb-1">Examples</p>
        <ul className="list-disc ml-5 mb-3 space-y-0.5">
          <li><strong>VR example:</strong> Meta Quest headset for VR games or virtual classroom tours.</li>
          <li><strong>AR example:</strong> Snapchat / Instagram filters that put dog ears on your face. Or the IKEA Place app to see how a sofa looks in your room before buying.</li>
        </ul>
        <p className="font-semibold text-indigo-300 mb-1">Key difference</p>
        <p>VR replaces reality. AR enhances reality. VR needs a headset; AR usually needs only a phone.</p>
      </>
    ),
  },
];

const MODULE_COLOR: Record<string, { bg: string; text: string }> = {
  "Module 1": { bg: "rgba(99,102,241,0.18)", text: "#A5B4FC" },
  "Module 3": { bg: "rgba(59,130,246,0.18)", text: "#93C5FD" },
  "Module 5": { bg: "rgba(139,92,246,0.18)", text: "#C4B5FD" },
};

export default function PracticeQuestions() {
  // Track which question is open. Single-open accordion (clicking
  // another closes the previous) so the page doesn't grow into a
  // 5-screen wall of text on a phone.
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section className="mb-14">
      <div className="text-center mb-6">
        <div className="text-xs font-bold tracking-widest uppercase text-zinc-500 mb-1">Practice</div>
        <h2 className="text-2xl sm:text-3xl font-bold">10 sample questions with model answers</h2>
        <p className="text-sm text-zinc-400 mt-2">Tap any question to see how to structure the answer. From Modules 1, 3, and 5.</p>
      </div>

      <div className="space-y-2.5">
        {QUESTIONS.map((q, i) => {
          const isOpen = openIdx === i;
          const color = MODULE_COLOR[q.module] ?? MODULE_COLOR["Module 1"];
          return (
            <div
              key={i}
              className="card-glass rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : i)}
                className="w-full text-left px-4 sm:px-5 py-4 flex items-start gap-3 hover:bg-white/[0.02] transition-colors"
                aria-expanded={isOpen}
              >
                <span
                  className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-[12px] font-bold mt-0.5"
                  style={{ background: "rgba(255,255,255,0.04)", color: "#D4D4D8", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span
                      className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide"
                      style={{ background: color.bg, color: color.text }}
                    >
                      {q.module}
                    </span>
                    <span
                      className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold"
                      style={{ background: "rgba(99,102,241,0.15)", color: "#A5B4FC" }}
                    >
                      {q.marks} marks
                    </span>
                    <span className="text-[10px] text-zinc-500">~{q.marks} min</span>
                  </div>
                  <p className="text-sm sm:text-[15px] text-zinc-100 font-medium leading-snug">
                    &ldquo;{q.question}&rdquo;
                  </p>
                </div>
                <span
                  className="shrink-0 text-zinc-400 text-xs mt-1 transition-transform"
                  style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                  aria-hidden="true"
                >
                  ▼
                </span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div
                      className="px-4 sm:px-5 py-4 text-[13.5px] text-zinc-300 leading-relaxed"
                      style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      {q.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
