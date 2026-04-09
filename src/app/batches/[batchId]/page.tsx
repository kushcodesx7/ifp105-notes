"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

interface Student {
  enrollmentNo: string;
  name: string;
  email: string;
  linkedinUrl: string;
  addedAt: string;
}

interface Batch {
  id: string;
  name: string;
  accent: string;
  studentCount: number;
  students: Student[];
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

function decodeJwt(token: string) {
  try {
    const base64 = token.split(".")[1];
    const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// Generate a consistent color from a name
function nameToColor(name: string) {
  const colors = [
    ["#6366F1", "#818CF8"], // indigo
    ["#8B5CF6", "#A78BFA"], // violet
    ["#EC4899", "#F472B6"], // pink
    ["#06B6D4", "#22D3EE"], // cyan
    ["#10B981", "#34D399"], // emerald
    ["#F59E0B", "#FBBF24"], // amber
    ["#3B82F6", "#60A5FA"], // blue
    ["#EF4444", "#F87171"], // red
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export default function BatchDetailPage() {
  const params = useParams();
  const batchId = params.batchId as string;

  const [batch, setBatch] = useState<Batch | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [googleUser, setGoogleUser] = useState<{ name: string; email: string } | null>(null);
  const [enrollmentNo, setEnrollmentNo] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function fetchBatch() {
    fetch("/api/batches")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load batch");
        return r.json();
      })
      .then((d) => {
        const found = d.batches.find((b: Batch) => b.id === batchId);
        setBatch(found || null);
        setLoading(false);
      })
      .catch(() => {
        setBatch(null);
        setLoading(false);
      });
  }

  useEffect(() => {
    fetchBatch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchId]);

  function handleGoogleSuccess(credentialResponse: { credential?: string }) {
    if (credentialResponse.credential) {
      const decoded = decodeJwt(credentialResponse.credential);
      if (decoded?.name && decoded?.email) {
        setGoogleUser({ name: decoded.name, email: decoded.email });
      } else {
        setError("Could not read Google account info. Please try again.");
      }
    }
  }

  async function handleSubmit() {
    setError("");
    if (!enrollmentNo.trim()) { setError("Please enter your enrollment number."); return; }
    if (!linkedinUrl.trim()) { setError("Please enter your LinkedIn URL."); return; }
    if (!/^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/.test(linkedinUrl.trim())) {
      setError("Please enter a valid LinkedIn URL (e.g. https://linkedin.com/in/yourname).");
      return;
    }

    setSubmitting(true);
    const res = await fetch("/api/batches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        batchId,
        enrollmentNo: enrollmentNo.trim(),
        name: googleUser!.name,
        email: googleUser!.email,
        linkedinUrl: linkedinUrl.trim(),
      }),
    });

    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) { setError(data.error || "Something went wrong."); return; }

    setSuccess(true);
    setShowModal(false);
    setGoogleUser(null);
    setEnrollmentNo("");
    setLinkedinUrl("");
    fetchBatch();
  }

  if (loading) {
    return (
      <main className="min-h-screen">
        <Navbar showBack title="Loading..." />
        <div className="flex justify-center pt-32">
          <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      </main>
    );
  }

  if (!batch) {
    return (
      <main className="min-h-screen">
        <Navbar showBack title="Not Found" />
        <div className="text-center pt-32 text-zinc-400">Batch not found.</div>
      </main>
    );
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID} locale="en">
      <main className="relative min-h-screen">
        <Navbar showBack title={batch.name} />

        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ x: [0, 30, -20, 0], y: [0, -40, 20, 0], scale: [1, 1.1, 0.95, 1] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[5%] right-[10%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-20"
            style={{ background: batch.accent }}
          />
          <motion.div
            animate={{ x: [0, -20, 30, 0], y: [0, 30, -20, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[20%] left-[5%] w-[400px] h-[400px] rounded-full bg-violet-500/10 blur-[120px]"
          />
          <div className="absolute inset-0 grid-bg opacity-30" />
        </div>

        <div className="relative z-10 pt-24 pb-16 px-6 max-w-5xl mx-auto">
          {/* Hero header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] backdrop-blur-sm mb-6">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: batch.accent }} />
              <span className="text-xs font-medium text-zinc-400 tracking-wide">
                IFP105 · {batch.id}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05] mb-4">
              {batch.name.split("Batch")[0]}
              <span className="gradient-text-animated">Batch</span>
            </h1>

            <p className="text-base text-zinc-400 max-w-md mx-auto mb-8">
              Connect with your classmates. Add your LinkedIn profile and build your professional network.
            </p>

            {/* Stats */}
            <div className="inline-flex items-center gap-0 rounded-2xl bg-white/[0.04] border border-white/[0.06] backdrop-blur-sm overflow-hidden inner-glow mb-8">
              <div className="flex flex-col items-center px-6 sm:px-8 py-3">
                <span className="text-xl sm:text-2xl font-bold text-white">{batch.students.length}</span>
                <span className="text-[10px] sm:text-[11px] font-medium text-zinc-500 uppercase tracking-wider mt-0.5">
                  Students
                </span>
              </div>
              <div className="flex flex-col items-center px-6 sm:px-8 py-3 border-l border-white/[0.06]">
                <span className="text-xl sm:text-2xl font-bold text-white">
                  {batch.students.filter(s => s.linkedinUrl).length}
                </span>
                <span className="text-[10px] sm:text-[11px] font-medium text-zinc-500 uppercase tracking-wider mt-0.5">
                  Linked
                </span>
              </div>
            </div>

            <div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setShowModal(true); setSuccess(false); setError(""); }}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold text-white transition-all focus-glow"
                style={{
                  background: `linear-gradient(135deg, ${batch.accent}, ${batch.accent}cc)`,
                  boxShadow: `0 4px 20px ${batch.accent}40`,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3v10m-5-5h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Add Your Profile
              </motion.button>
            </div>
          </motion.div>

          {/* Success toast */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-8 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center max-w-md mx-auto"
              >
                Profile added successfully!
              </motion.div>
            )}
          </AnimatePresence>

          {/* Student grid */}
          {batch.students.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                <span className="text-3xl">👋</span>
              </div>
              <p className="text-zinc-400 text-lg mb-2">No students registered yet</p>
              <p className="text-zinc-600 text-sm">Be the first to add your profile!</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {batch.students.map((student, i) => {
                const [color1, color2] = nameToColor(student.name);
                const initials = student.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <motion.div
                    key={student.enrollmentNo}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <motion.div
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="group relative overflow-hidden rounded-2xl card-glass"
                    >
                      {/* Gradient top line */}
                      <div
                        className="absolute top-0 left-0 right-0 h-[2px] opacity-60 group-hover:opacity-100 transition-opacity"
                        style={{ background: `linear-gradient(90deg, ${color1}, ${color2}, transparent)` }}
                      />

                      {/* Hover glow */}
                      <div
                        className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl"
                        style={{ background: color1 }}
                      />

                      <div className="relative p-6">
                        {/* Avatar + Name */}
                        <div className="flex items-start gap-4 mb-5">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-lg"
                            style={{
                              background: `linear-gradient(135deg, ${color1}, ${color2})`,
                              boxShadow: `0 4px 15px ${color1}40`,
                            }}
                          >
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm font-semibold truncate">{student.name}</h3>
                          </div>
                        </div>

                        {/* LinkedIn button */}
                        <a
                          href={student.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-medium bg-[#0A66C2]/10 text-[#0A66C2] border border-[#0A66C2]/20 hover:bg-[#0A66C2]/20 hover:border-[#0A66C2]/40 transition-all group-hover:shadow-[0_0_20px_rgba(10,102,194,0.1)]"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                          </svg>
                          Connect on LinkedIn
                        </a>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add Profile Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-md rounded-2xl bg-[#12121A] border border-white/[0.08] p-6 shadow-2xl"
              >
                <h2 className="text-lg font-bold mb-1">Add Your Profile</h2>
                <p className="text-sm text-zinc-400 mb-6">
                  Sign in with Google to verify your identity, then add your LinkedIn.
                </p>

                {!googleUser ? (
                  <div>
                    <p className="text-xs text-zinc-500 mb-4">
                      Your name will be displayed publicly. Your email is only used for verification.
                    </p>
                    {GOOGLE_CLIENT_ID ? (
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => setError("Google sign-in failed.")}
                        theme="filled_black"
                        shape="pill"
                        size="large"
                        width="100%"
                      />
                    ) : (
                      <p className="text-sm text-amber-400/80 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        Google Sign-In not configured. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID in your environment.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                      <p className="text-sm font-medium">{googleUser.name}</p>
                      <p className="text-xs text-zinc-500">{googleUser.email}</p>
                    </div>

                    <div>
                      <label className="text-xs text-zinc-400 mb-1.5 block">Enrollment Number</label>
                      <input
                        type="text"
                        value={enrollmentNo}
                        onChange={(e) => setEnrollmentNo(e.target.value)}
                        placeholder="e.g. IFP2025001"
                        className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-zinc-400 mb-1.5 block">LinkedIn Profile URL</label>
                      <input
                        type="url"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        placeholder="https://linkedin.com/in/yourname"
                        className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20 transition-colors"
                      />
                    </div>

                    {error && (
                      <p className="text-sm text-red-400 p-3 rounded-lg bg-red-500/10 border border-red-500/20">{error}</p>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
                      style={{ background: `linear-gradient(135deg, ${batch.accent}, ${batch.accent}cc)` }}
                    >
                      {submitting ? "Adding..." : "Add My Profile"}
                    </motion.button>
                  </div>
                )}

                <button
                  onClick={() => { setShowModal(false); setGoogleUser(null); setError(""); }}
                  className="mt-4 w-full py-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Cancel
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </GoogleOAuthProvider>
  );
}
