"use client";

import { motion } from "framer-motion";
// Bring in the cheatsheets data here (not in ModulePage) so this ~22KB
// payload only lands in the bundle when a student opens the cheat sheet
// tab. With next/dynamic in the parent, this becomes its own lazy chunk.
import { cheatsheets, type ModuleCheatSheet } from "@/data/cheatsheets";

interface CheatSheetProps {
  // Legacy prop: if supplied, use as-is.
  data?: ModuleCheatSheet;
  // Preferred: let the component resolve its own data from the module id.
  moduleNumber?: number;
  accentFrom: string;
  accentTo: string;
}

const vp = { once: true, margin: "-40px" as const };

export default function CheatSheet({
  data,
  moduleNumber,
  accentFrom,
  accentTo,
}: CheatSheetProps) {
  const resolved =
    data ??
    (moduleNumber != null
      ? cheatsheets.find((c) => c.moduleId === moduleNumber)
      : undefined);

  if (!resolved) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-4">📋</div>
        <h2 className="text-2xl font-bold mb-2">Cheat Sheet</h2>
        <p className="text-zinc-500">Coming soon!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="text-4xl mb-3">📋</div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">{resolved.title}</h2>
        <p className="text-sm text-zinc-400">Key terms, definitions, and exam tips — all in one place.</p>
      </motion.div>

      {/* Sections */}
      {resolved.sections.map((section, si) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={vp}
          transition={{ duration: 0.4, delay: si * 0.05 }}
          className="rounded-2xl overflow-hidden"
          style={{ background: '#0D0D1F', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {/* Section header — uses both accent stops so the gradient
              sweep matches the module's hero (was using accentFrom only,
              leaving the second prop dead). */}
          <div className="px-5 py-3 relative overflow-hidden" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="absolute inset-0 opacity-20" style={{ background: `linear-gradient(135deg, ${accentFrom}30, ${accentTo}1a 60%, transparent)` }} />
            <h3 className="text-sm font-bold text-white relative">{section.title}</h3>
          </div>

          {/* Items */}
          <div className="px-5 py-3">
            {section.items.map((item, ii) => (
              <div
                key={item.term}
                // Stack term + definition on mobile (narrow screens would
                // squeeze the definition into ~150px otherwise). Side-by-side
                // from sm+ where there's room for the two-column layout.
                className="flex flex-col sm:flex-row gap-1 sm:gap-3 py-2.5 items-start"
                style={{ borderBottom: ii < section.items.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
              >
                <span
                  className="text-[13px] font-semibold shrink-0 sm:min-w-[140px]"
                  style={{ color: accentFrom }}
                >
                  {item.term}
                </span>
                <span className="text-[13px] text-zinc-400 leading-relaxed">
                  {item.definition}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Confusion Pairs */}
      {resolved.confusionPairs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={vp}
          className="rounded-2xl overflow-hidden"
          style={{ background: '#0D0D1F', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 className="text-sm font-bold text-white">⚠️ Commonly Confused</h3>
          </div>
          <div className="px-5 py-3 space-y-3">
            {resolved.confusionPairs.map((pair, i) => (
              <div key={i} className="pb-3" style={{ borderBottom: i < resolved.confusionPairs.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.8)' }}>
                    {pair.termA}
                  </span>
                  <span className="text-[10px] font-bold text-zinc-600">vs</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.8)' }}>
                    {pair.termB}
                  </span>
                </div>
                <p className="text-[12px] text-zinc-400 leading-relaxed">{pair.tip}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
