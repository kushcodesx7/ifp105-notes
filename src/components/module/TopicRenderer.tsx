"use client";

import { motion } from "framer-motion";

// Content block types
interface TopicCard { icon: string; title: string; description: string; tag?: string; tagColor?: string; }
interface EraCard { icon: string; period: string; title: string; description: string; limitation: string; }
interface TableRow { cells: string[]; }
interface Step { title: string; description: string; }

type ContentBlock =
  | { type: "text"; html: string }
  | { type: "cards"; columns: 2 | 3 | 4; items: TopicCard[] }
  | { type: "era-cards"; columns: 4; items: EraCard[] }
  | { type: "callout"; variant?: "amber" | "blue" | "red" | "purple" | "dark"; html: string }
  | { type: "analogy"; label: string; html: string }
  | { type: "table"; headers: string[]; rows: TableRow[] }
  | { type: "steps"; items: Step[] }
  | { type: "image"; src?: string; description: string };

const calloutColors: Record<string, { bg: string; border: string; text: string }> = {
  default: { bg: 'rgba(99,102,241,0.08)', border: '#4F46E5', text: '#818CF8' },
  amber: { bg: 'rgba(124,58,237,0.08)', border: '#7C3AED', text: '#A78BFA' },
  blue: { bg: 'rgba(37,99,235,0.08)', border: '#2563EB', text: '#60A5FA' },
  red: { bg: 'rgba(239,68,68,0.08)', border: '#EF4444', text: '#F87171' },
  purple: { bg: 'rgba(124,58,237,0.08)', border: '#7C3AED', text: '#A78BFA' },
  dark: { bg: '#0D0D1F', border: '#4F46E5', text: '#A5B4FC' },
};

const tagColors: Record<string, { bg: string; color: string }> = {
  default: { bg: 'rgba(99,102,241,0.12)', color: '#818CF8' },
  amber: { bg: 'rgba(124,58,237,0.12)', color: '#A78BFA' },
  blue: { bg: 'rgba(37,99,235,0.12)', color: '#60A5FA' },
  grn: { bg: 'rgba(34,197,94,0.12)', color: '#4ADE80' },
};

const vp = { once: true, margin: "-60px" as const };

function RenderBlock({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "text":
      return (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={vp}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-[14px] text-zinc-400 leading-[1.9] my-3 [&_strong]:text-zinc-200 [&_strong]:font-semibold [&_mark]:bg-violet-500/15 [&_mark]:text-violet-300 [&_mark]:px-1.5 [&_mark]:py-0.5 [&_mark]:rounded [&_mark]:font-semibold"
          dangerouslySetInnerHTML={{ __html: block.html }}
        />
      );

    case "cards":
      return (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={vp}
          transition={{ duration: 0.3 }}
          className={`grid gap-3 my-4 ${
            block.columns === 4 ? 'grid-cols-2 md:grid-cols-4' :
            block.columns === 3 ? 'grid-cols-2 md:grid-cols-3' :
            'grid-cols-1 sm:grid-cols-2'
          }`}
        >
          {block.items.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={vp}
              transition={{ duration: 0.4, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -3, borderColor: '#4F46E5' }}
              className="card-glass p-4 rounded-xl"
            >
              <span className="text-xl mb-2 block">{card.icon}</span>
              <h4 className="text-sm font-bold text-zinc-200 mb-1">{card.title}</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">{card.description}</p>
              {card.tag && (
                <span
                  className="inline-block mt-2 text-[10px] font-semibold px-2.5 py-0.5 rounded-full"
                  style={tagColors[card.tagColor || 'default']}
                >
                  {card.tag}
                </span>
              )}
            </motion.div>
          ))}
        </motion.div>
      );

    case "era-cards":
      return (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={vp}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4"
        >
          {block.items.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={vp}
              transition={{ duration: 0.4, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="card-glass p-4 rounded-xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: 'linear-gradient(90deg, #4F46E5, #7C3AED)' }} />
              <span className="text-xl mb-2 block">{card.icon}</span>
              <div className="text-[9px] font-bold tracking-widest uppercase text-zinc-500 mb-1">{card.period}</div>
              <h4 className="text-sm font-bold text-zinc-200 mb-1">{card.title}</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">{card.description}</p>
              <div className="text-xs font-semibold mt-2 pt-2 text-zinc-500" style={{ borderTop: '1px solid #2a2a33' }}>
                {card.limitation}
              </div>
            </motion.div>
          ))}
        </motion.div>
      );

    case "callout": {
      const colors = calloutColors[block.variant || 'default'];
      return (
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={vp}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="my-4 px-4 py-3 rounded-r-xl text-[13px] leading-[1.85] [&_strong]:font-bold"
          style={{
            background: colors.bg,
            borderLeft: `3px solid ${colors.border}`,
            color: block.variant === 'dark' ? 'rgba(255,255,255,0.8)' : colors.text,
          }}
          dangerouslySetInnerHTML={{ __html: block.html }}
        />
      );
    }

    case "analogy":
      return (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={vp}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="my-4 p-5 rounded-xl relative overflow-hidden card-glass"
        >
          <div className="absolute top-0 left-0 w-1 h-full" style={{ background: 'linear-gradient(180deg, #7C3AED, #4F46E5, #2563EB)' }} />
          <div className="text-[9px] font-bold tracking-[0.2em] uppercase text-zinc-500 mb-2 pl-3">{block.label}</div>
          <div className="text-[13px] text-zinc-400 leading-[1.85] pl-3 [&_strong]:text-zinc-200 [&_strong]:font-semibold" dangerouslySetInnerHTML={{ __html: block.html }} />
        </motion.div>
      );

    case "table":
      return (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={vp}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="my-4 rounded-xl overflow-hidden inner-glow"
          style={{ border: '1px solid #2a2a33' }}
        >
          <table className="w-full text-[12px]">
            <thead>
              <tr style={{ background: 'linear-gradient(135deg, #4F46E5, #4338CA)' }}>
                {block.headers.map((h, i) => (
                  <th key={i} className="px-4 py-2.5 text-left font-semibold text-white/90 tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri} className="hover:bg-white/[0.02] transition-colors" style={{ borderTop: '1px solid #1e1e28' }}>
                  {row.cells.map((cell, ci) => (
                    <td key={ci} className="px-4 py-2.5 text-zinc-400" style={{ background: ri % 2 ? '#111116' : 'transparent' }}
                      dangerouslySetInnerHTML={{ __html: cell }}
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      );

    case "steps":
      return (
        <div className="my-4 space-y-2">
          {block.items.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={vp}
              transition={{ duration: 0.4, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ borderColor: '#4F46E5' }}
              className="flex gap-3.5 items-start p-4 rounded-xl transition-colors card-glass"
            >
              <div
                className="w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg, #1a1a2e, #2a2a44)', color: '#818CF8', border: '1px solid #333350' }}
              >
                {i + 1}
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-200 mb-0.5">{step.title}</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      );

    case "image":
      return (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={vp}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="my-4 rounded-xl overflow-hidden"
          style={{ background: '#111116', border: '1px solid #2a2a33' }}
        >
          {block.src ? (
            <img
              src={block.src}
              alt={block.description}
              className="w-full h-auto rounded-xl"
              loading="lazy"
            />
          ) : (
            <div className="p-4 text-center text-xs text-zinc-500">
              {block.description}
            </div>
          )}
        </motion.div>
      );

    default:
      return null;
  }
}

interface TopicRendererProps {
  content: ContentBlock[];
}

export default function TopicRenderer({ content }: TopicRendererProps) {
  return (
    <div>
      {content.map((block, i) => (
        <RenderBlock key={i} block={block} />
      ))}
    </div>
  );
}
