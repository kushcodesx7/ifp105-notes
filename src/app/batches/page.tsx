"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";

interface Batch {
  id: string;
  name: string;
  accent: string;
  studentCount: number;
}

export default function BatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/batches")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load batches");
        return r.json();
      })
      .then((d) => {
        setBatches(d.batches);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <main className="relative min-h-screen">
      <Navbar showBack title="Student Batches" />

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ x: [0, 30, -20, 0], y: [0, -40, 20, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] right-[15%] w-[400px] h-[400px] rounded-full bg-indigo-500/15 blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, -20, 30, 0], y: [0, 30, -20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[20%] left-[10%] w-[350px] h-[350px] rounded-full bg-violet-500/10 blur-[120px]"
        />
      </div>

      <div className="relative z-10 pt-24 pb-16 px-6 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] backdrop-blur-sm mb-6">
            <span className="text-xs font-medium text-zinc-400 tracking-wide">
              Connect with your batchmates
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Student <span className="gradient-text-animated">Batches</span>
          </h1>
          <p className="text-zinc-400 max-w-md mx-auto">
            Find your batch, add your LinkedIn profile, and connect with fellow
            IFP105 students.
          </p>
        </motion.div>

        {/* Batch cards */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => { setLoading(true); setError(""); location.reload(); }}
              className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Try again
            </button>
          </div>
        ) : batches.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">
            No batches yet. Check back later!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {batches.map((batch, i) => (
              <motion.div
                key={batch.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={`/batches/${batch.id}`}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="group relative overflow-hidden rounded-2xl card-glass cursor-pointer"
                  >
                    {/* Gradient top line */}
                    <div
                      className="absolute top-0 left-0 right-0 h-[2px] opacity-60 group-hover:opacity-100 transition-opacity"
                      style={{
                        background: `linear-gradient(90deg, ${batch.accent}, transparent)`,
                      }}
                    />

                    {/* Glow */}
                    <div
                      className="absolute -top-24 -right-24 w-48 h-48 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl"
                      style={{ background: batch.accent }}
                    />

                    <div className="relative p-7">
                      <div className="text-3xl mb-4">🎓</div>
                      <h3 className="text-lg font-semibold mb-2 tracking-tight">
                        {batch.name}
                      </h3>
                      <p className="text-sm text-zinc-400 mb-4">
                        {batch.studentCount === 0
                          ? "No students registered yet — be the first!"
                          : `${batch.studentCount} student${batch.studentCount > 1 ? "s" : ""} registered`}
                      </p>
                      <div className="flex gap-2">
                        <span className="text-[11px] font-medium px-3 py-1 rounded-full bg-white/5 text-zinc-400 border border-white/5">
                          View Batch →
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
