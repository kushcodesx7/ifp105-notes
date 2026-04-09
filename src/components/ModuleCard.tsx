"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface ModuleCardProps {
  number: string;
  title: string;
  description: string;
  icon: string;
  href?: string;
  accent: string;
  tags: string[];
  locked?: boolean;
  delay?: number;
}

export default function ModuleCard({
  number,
  title,
  description,
  icon,
  href,
  accent,
  tags,
  locked = false,
  delay = 0,
}: ModuleCardProps) {
  const content = (
    <motion.div
      whileHover={locked ? {} : { y: -4 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative overflow-hidden rounded-2xl card-glass ${
        locked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      {/* Gradient top line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-60 group-hover:opacity-100 transition-opacity"
        style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
      />

      {/* Glow on hover */}
      {!locked && (
        <div
          className="absolute -top-24 -right-24 w-48 h-48 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl"
          style={{ background: accent }}
        />
      )}

      <div className="relative p-7">
        {/* Number */}
        <div
          className="text-5xl font-bold opacity-[0.07] absolute top-4 right-6 font-[var(--font-dm-serif)]"
          style={{ color: accent }}
        >
          {number}
        </div>

        {/* Icon */}
        <div className="text-3xl mb-4">{icon}</div>

        {/* Title */}
        <h3 className="text-lg font-semibold mb-2 tracking-tight">{title}</h3>

        {/* Description */}
        <p className="text-sm text-zinc-400 leading-relaxed mb-5">
          {description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {locked ? (
            <span className="text-[11px] font-medium px-3 py-1 rounded-full bg-white/5 text-zinc-500 uppercase tracking-wider">
              Coming Soon
            </span>
          ) : (
            tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-medium px-3 py-1 rounded-full bg-white/5 text-zinc-400 border border-white/5"
              >
                {tag}
              </span>
            ))
          )}
        </div>

        {/* Arrow */}
        {!locked && (
          <div className="absolute bottom-7 right-7 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              className="text-zinc-400"
            >
              <path
                d="M4 10h12m0 0l-4-4m4 4l-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>
    </motion.div>
  );

  if (locked || !href) return content;
  return <Link href={href}>{content}</Link>;
}
