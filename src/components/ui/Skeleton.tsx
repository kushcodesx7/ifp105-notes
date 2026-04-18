"use client";

// Animated loading skeleton — a dark glass pulse that matches the
// site's palette. Replaces the "Loading…" text that was sprinkled
// across admin pages and the home hero. The pulse uses CSS animation
// rather than framer-motion so it's zero-JS for client-component
// loading states.

import { CSSProperties } from "react";

interface SkeletonProps {
  className?: string;
  /** If provided, fills to a specific size. Default stretches. */
  width?: number | string;
  height?: number | string;
  /** Rounded corners. Default 8px. "full" for circles. */
  radius?: number | "full";
  style?: CSSProperties;
}

export function Skeleton({
  className = "",
  width,
  height,
  radius = 8,
  style,
}: SkeletonProps) {
  return (
    <div
      className={`skeleton-pulse ${className}`}
      style={{
        width,
        height,
        borderRadius: radius === "full" ? "9999px" : radius,
        ...style,
      }}
      aria-busy="true"
      aria-hidden="true"
    />
  );
}

// Convenience primitives — common shapes composed above.

export function SkeletonText({
  lines = 1,
  className = "",
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={12}
          // Last line shorter to mimic a real paragraph
          width={i === lines - 1 && lines > 1 ? "72%" : "100%"}
          radius={4}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl p-5 ${className}`}
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <Skeleton height={14} width="40%" className="mb-3" radius={4} />
      <Skeleton height={28} width="70%" className="mb-2" radius={6} />
      <Skeleton height={10} width="85%" radius={4} />
    </div>
  );
}
