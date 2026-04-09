"use client";

import { motion } from "framer-motion";
import type { ModuleCheatSheet } from "@/data/cheatsheets";

interface CheatSheetProps {
  data: ModuleCheatSheet;
  accentFrom: string;
  accentTo: string;
}

const vp = { once: true, margin: "-40px" as const };

export default function CheatSheet({ data, accentFrom, accentTo }: CheatSheetProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="text-4xl mb-3">📋</div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">{data.title}</h2>
        <p className="text-sm text-zinc-500">Key terms, definitions, and exam tips — all in one place.</p>
      </motion.div>

      {/* Sections */}
      {data.sections.map((section, si) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={vp}
          transition={{ duration: 0.4, delay: si * 0.05 }}
          className="rounded-2xl overflow-hidden"
          style={{ background: '#0D0D1F', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {/* Section header */}
          <div className="px-5 py-3 relative overflow-hidden" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(ellipse at 80% 50%, ${accentFrom}30, transparent 60%)` }} />
            <h3 className="text-sm font-bold text-white relative">{section.title}</h3>
          </div>

          {/* Items */}
          <div className="px-5 py-3">
            {section.items.map((item, ii) => (
              <div
                key={item.term}
                className="flex gap-3 py-2.5 items-start"
                style={{ borderBottom: ii < section.items.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
              >
                <span className="text-[13px] font-semibold shrink-0 min-w-[140px]" style={{ color: accentFrom }}>
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
      {data.confusionPairs.length > 0 && (
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
            {data.confusionPairs.map((pair, i) => (
              <div key={i} className="pb-3" style={{ borderBottom: i < data.confusionPairs.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.8)' }}>
                    {pair.termA}
                  </span>
                  <span className="text-[10px] font-bold text-zinc-600">vs</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.8)' }}>
                    {pair.termB}
                  </span>
                </div>
                <p className="text-[12px] text-zinc-500 leading-relaxed">{pair.tip}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
