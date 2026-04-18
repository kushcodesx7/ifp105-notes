"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { BLOOM_META, BLOOM_ORDER, type BloomLevel } from "@/lib/blooms";

export interface BloomsRadarLevel {
  level: BloomLevel;
  correct: number;
  total: number;
  pct: number;
}

interface Props {
  levels: BloomsRadarLevel[];
  size?: number; // px, defaults to 280
}

// Pure SVG hexagonal radar chart — one axis per Bloom's level.
// No new deps. Animates in on first render.
//
// Layout:
//   - 6 axes radiate from the centre at 60° intervals starting straight up.
//   - Three concentric hexagons mark 33 / 67 / 100 percent grid lines.
//   - Each level's point sits at (pct/100) along its axis.
//   - Each level's coloured dot + label anchors at the axis end.
//
// Visual goal: a student glances at it and INSTANTLY sees which cognitive
// levels bulge vs. dent — the shape is the message.

export default function BloomsRadar({ levels, size = 280 }: Props) {
  // Normalise to the canonical order and fill missing levels with 0
  const dataByLevel = useMemo(() => {
    const map: Record<BloomLevel, BloomsRadarLevel> = Object.fromEntries(
      BLOOM_ORDER.map((lvl) => [
        lvl,
        { level: lvl, correct: 0, total: 0, pct: 0 },
      ])
    ) as Record<BloomLevel, BloomsRadarLevel>;
    for (const l of levels) map[l.level] = l;
    return map;
  }, [levels]);

  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.35; // axis length — leaves room for labels

  // 6 evenly-spaced axes; start at -90° (top) so "Remember" sits at 12 o'clock
  // and the ladder winds clockwise: Remember → Understand → Apply → Analyze →
  // Evaluate → Create.
  function axisAngle(i: number): number {
    return -Math.PI / 2 + (i * Math.PI * 2) / 6;
  }

  function axisEnd(i: number, r = radius): { x: number; y: number } {
    const a = axisAngle(i);
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  }

  // Build the data polygon: each vertex sits at (pct/100) along its axis
  const dataPoints = BLOOM_ORDER.map((lvl, i) => {
    const pct = dataByLevel[lvl].pct;
    const r = radius * (pct / 100);
    const a = axisAngle(i);
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  });
  const dataPath = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  // Grid hexagons at 33 / 67 / 100
  const gridRings = [0.33, 0.67, 1].map((r) =>
    BLOOM_ORDER.map((_, i) => {
      const p = axisEnd(i, radius * r);
      return `${p.x},${p.y}`;
    }).join(" ")
  );

  // Has-any-data check — don't draw the coloured polygon if every level is 0%
  const hasData = BLOOM_ORDER.some((lvl) => dataByLevel[lvl].total > 0);

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width="100%"
      height={size}
      role="img"
      aria-label="Bloom's Taxonomy radar showing your per-level performance"
    >
      {/* Grid hexagons */}
      {gridRings.map((points, i) => (
        <polygon
          key={i}
          points={points}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={1}
        />
      ))}

      {/* Axis lines */}
      {BLOOM_ORDER.map((_, i) => {
        const p = axisEnd(i);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={1}
          />
        );
      })}

      {/* Data polygon — animated fill-in */}
      {hasData && (
        <motion.polygon
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
          points={dataPath}
          fill="url(#bloomRadarGradient)"
          fillOpacity={0.55}
          stroke="#A78BFA"
          strokeWidth={2}
          strokeLinejoin="round"
        />
      )}

      {/* Per-level coloured dots at the data vertex */}
      {BLOOM_ORDER.map((lvl, i) => {
        const pct = dataByLevel[lvl].pct;
        if (dataByLevel[lvl].total === 0) return null;
        const r = radius * (pct / 100);
        const a = axisAngle(i);
        const x = cx + r * Math.cos(a);
        const y = cy + r * Math.sin(a);
        return (
          <motion.circle
            key={lvl}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + i * 0.05, duration: 0.3 }}
            cx={x}
            cy={y}
            r={4}
            fill={BLOOM_META[lvl].color}
            stroke="#0d0d14"
            strokeWidth={2}
          />
        );
      })}

      {/* Axis end labels — icon + level name + pct */}
      {BLOOM_ORDER.map((lvl, i) => {
        const meta = BLOOM_META[lvl];
        const labelR = radius + 18;
        const a = axisAngle(i);
        const x = cx + labelR * Math.cos(a);
        const y = cy + labelR * Math.sin(a);
        const pct = dataByLevel[lvl].pct;
        const total = dataByLevel[lvl].total;
        // Text anchor flips based on which side of the centre the label is
        const textAnchor =
          Math.abs(Math.cos(a)) < 0.2
            ? "middle"
            : Math.cos(a) > 0
              ? "start"
              : "end";
        return (
          <g key={lvl}>
            <text
              x={x}
              y={y - 4}
              textAnchor={textAnchor}
              fontSize={10}
              fontWeight={700}
              fill={meta.color}
              style={{ userSelect: "none" }}
            >
              {meta.icon} {meta.label}
            </text>
            <text
              x={x}
              y={y + 9}
              textAnchor={textAnchor}
              fontSize={10}
              fontWeight={600}
              fill={total > 0 ? "#d4d4d8" : "#52525b"}
              style={{ userSelect: "none" }}
            >
              {total > 0 ? `${pct}%` : "—"}
            </text>
          </g>
        );
      })}

      {/* Gradient fill for the data polygon */}
      <defs>
        <radialGradient id="bloomRadarGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#6366F1" stopOpacity="0.25" />
        </radialGradient>
      </defs>
    </svg>
  );
}
