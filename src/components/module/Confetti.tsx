"use client";

import { motion, AnimatePresence } from "framer-motion";
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

function generateParticles(): Particle[] {
  return Array.from({ length: 40 }, (_, i) => ({
    id: Date.now() + i,
    x: Math.random() * 100,
    endY: 80 + Math.random() * 30,
    driftX: (Math.random() - 0.5) * 200,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: 4 + Math.random() * 8,
    rotation: Math.random() * 360,
    rotDir: Math.random() > 0.5 ? 1 : -1,
    delay: Math.random() * 0.3,
    duration: 1.2 + Math.random() * 0.8,
    isCircle: Math.random() > 0.5,
  }));
}

export default function Confetti({ trigger }: { trigger: number }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (trigger === 0) return;
    setParticles(generateParticles());
    const timer = setTimeout(() => setParticles([]), 2500);
    return () => clearTimeout(timer);
  }, [trigger]);

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
    </div>
  );
}
