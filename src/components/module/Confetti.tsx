"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useState, useEffect } from "react";

const colors = ["#6366F1", "#8B5CF6", "#EC4899", "#10B981", "#F59E0B", "#06B6D4", "#F97316"];

interface Particle {
  id: number;
  x: number;
  endY: number;
  driftX: number;
  color: string;
  size: number;
  rotation: number;
  rotDir: number;
  delay: number;
  duration: number;
  isCircle: boolean;
}

// Two celebration tiers:
//   - "normal": ~40 particles for marking a single topic done
//   - "module": ~80 particles + a "MODULE COMPLETE" banner for finishing
//     the whole module. Used when the final topic is marked done.
// Larger `count` on module tier makes the payoff unmistakable without
// needing a new animation engine.
function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: Date.now() + i,
    x: Math.random() * 100,
    endY: 80 + Math.random() * 30,
    driftX: (Math.random() - 0.5) * 240,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: 4 + Math.random() * 10,
    rotation: Math.random() * 360,
    rotDir: Math.random() > 0.5 ? 1 : -1,
    delay: Math.random() * 0.4,
    duration: 1.2 + Math.random() * 1.0,
    isCircle: Math.random() > 0.5,
  }));
}

export default function Confetti({
  trigger,
  variant = "normal",
}: {
  trigger: number;
  /**
   * "normal" fires a standard ~40-particle burst for per-topic completion.
   * "module" fires ~80 particles plus a MODULE COMPLETE banner —
   * reserved for finishing the last topic of a module so the moment
   * actually feels different from the preceding ten.
   */
  variant?: "normal" | "module";
}) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showBanner, setShowBanner] = useState(false);
  // Respect prefers-reduced-motion — 40+ particles flinging across the
  // viewport is exactly the kind of animation vestibular-sensitive
  // users flag. When reduced motion is on, we skip the celebration
  // entirely. Completion UX still works; only the confetti is gone.
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (trigger === 0) return;
    if (reduceMotion) return;
    const count = variant === "module" ? 80 : 40;
    setParticles(generateParticles(count));
    if (variant === "module") {
      setShowBanner(true);
      const bannerTimer = setTimeout(() => setShowBanner(false), 2200);
      const particleTimer = setTimeout(() => setParticles([]), 3000);
      return () => {
        clearTimeout(bannerTimer);
        clearTimeout(particleTimer);
      };
    }
    const timer = setTimeout(() => setParticles([]), 2500);
    return () => clearTimeout(timer);
  }, [trigger, reduceMotion, variant]);

  if (reduceMotion) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ left: `${p.x}%`, top: "-5%", rotate: 0, opacity: 1, scale: 0 }}
            animate={{
              top: `${p.endY}%`,
              rotate: p.rotation + 360 * p.rotDir,
              opacity: 0,
              scale: 1,
              x: p.driftX,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: p.duration, delay: p.delay, ease: [0.16, 1, 0.3, 1] }}
            className="absolute"
            style={{
              width: p.size,
              height: p.size,
              background: p.color,
              borderRadius: p.isCircle ? "50%" : "2px",
            }}
          />
        ))}
      </AnimatePresence>

      {/* "MODULE COMPLETE" banner — only for module-tier celebration.
           Slides up, scales in with a spring, holds briefly, then fades.
           Sits above the confetti so the text stays readable through
           the particle shower. */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            key="module-banner"
            initial={{ opacity: 0, y: 40, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="fixed inset-x-0 top-1/3 flex items-center justify-center px-6"
          >
            <div
              className="text-center px-8 py-5 rounded-2xl backdrop-blur-xl"
              style={{
                background: "linear-gradient(135deg, rgba(99,102,241,0.18), rgba(139,92,246,0.18))",
                border: "1px solid rgba(99,102,241,0.35)",
                boxShadow:
                  "0 20px 60px rgba(99,102,241,0.35), inset 0 1px 0 rgba(255,255,255,0.08)",
              }}
            >
              <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-indigo-300 mb-1">
                ⭐ Achievement Unlocked
              </div>
              <div
                className="text-2xl sm:text-3xl font-bold tracking-tight"
                style={{
                  background:
                    "linear-gradient(135deg, #818CF8, #C084FC, #F472B6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                MODULE COMPLETE
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
