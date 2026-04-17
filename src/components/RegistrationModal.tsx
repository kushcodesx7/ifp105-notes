"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";

interface Batch {
  id: string;
  name: string;
  accent: string | null;
  studentCount: number;
}

interface RegistrationModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  closable?: boolean;
}

// Extract first name from Google user name
function firstName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  return parts[0] || fullName;
}

// Extract last 3 digits/chars of roll number
function lastThree(roll: string): string {
  const cleaned = roll.trim().toUpperCase();
  return cleaned.slice(-3);
}

// Build display name: last3_firstname
function buildDisplayName(roll: string, fullName: string): string {
  if (!roll.trim() || !fullName.trim()) return "";
  return `${lastThree(roll)}_${firstName(fullName)}`;
}

export default function RegistrationModal({
  open,
  onClose,
  onSuccess,
  closable = true,
}: RegistrationModalProps) {
  const { user, login } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(false);
  const [batchesLoading, setBatchesLoading] = useState(true);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [enrollmentNo, setEnrollmentNo] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [error, setError] = useState("");

  // Load batches when modal opens
  useEffect(() => {
    if (!open) return;
    setBatchesLoading(true);
    fetch("/api/batches")
      .then((r) => r.json())
      .then((data) => {
        setBatches(data.batches || []);
        setBatchesLoading(false);
        if (data.batches?.length === 1) {
          setSelectedBatchId(data.batches[0].id);
        }
      })
      .catch(() => {
        setError("Could not load batches. Please try again.");
        setBatchesLoading(false);
      });
  }, [open]);

  // Auto-build name preview: last3_firstname (e.g., 267_Farangiz)
  const previewName = user?.name ? buildDisplayName(enrollmentNo, user.name) : "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!selectedBatchId) {
      setError("Please select your batch.");
      return;
    }
    if (!enrollmentNo.trim()) {
      setError("Please enter your enrollment number.");
      return;
    }
    if (linkedinUrl.trim() && !/^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/.test(linkedinUrl.trim())) {
      setError("LinkedIn URL format: https://linkedin.com/in/yourname");
      return;
    }

    // Build the name in rollnumber_firstname format
    const rollNum = enrollmentNo.trim().toUpperCase();
    const nameToSave = displayName.trim() || `${rollNum}_${firstName(user!.name)}`;

    setLoading(true);
    const res = await fetch("/api/batches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        batchId: selectedBatchId,
        enrollmentNo: rollNum,
        name: nameToSave,
        email: user!.email,
        linkedinUrl: linkedinUrl.trim() || `https://linkedin.com/in/placeholder-${rollNum}`,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Registration failed. Check your enrollment number and batch.");
      return;
    }

    // Update auth context with batch info
    login({
      ...user!,
      name: nameToSave,
      enrollmentNo: rollNum,
      batchId: selectedBatchId,
    });

    // Reset form
    setSelectedBatchId("");
    setEnrollmentNo("");
    setDisplayName("");
    setLinkedinUrl("");
    onSuccess?.();
    onClose();
  }

  if (!user) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
          onClick={closable ? onClose : undefined}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl p-6 relative my-8"
            style={{
              background: "linear-gradient(135deg, rgba(15,15,25,0.98), rgba(12,12,20,0.98))",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
            }}
          >
            {/* Close button */}
            {closable && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors"
                aria-label="Close"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M5 5l8 8M13 5l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            )}

            {/* Header */}
            <div className="mb-5">
              <div className="text-3xl mb-3">🎓</div>
              <h2 className="text-xl font-bold text-white mb-1">Complete Registration</h2>
              <p className="text-sm text-zinc-400">
                Hi <span className="text-white font-semibold">{firstName(user.name)}</span>! Link your account
                to your batch so your progress syncs across devices.
              </p>
            </div>

            {/* Warning box */}
            <div
              className="mb-4 p-3 rounded-lg text-[11px] leading-relaxed"
              style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}
            >
              <span className="text-amber-400 font-bold">⚠️ Important:</span>{" "}
              <span className="text-zinc-400">
                Your roll number and batch are <strong className="text-white">locked forever</strong> once set.
                Make sure they&apos;re correct — double-check with your teacher if unsure.
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Batch dropdown */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-2">
                  Your Batch <span className="text-red-400">*</span>
                </label>
                {batchesLoading ? (
                  <div className="h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center px-4">
                    <div className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                    <span className="ml-2 text-sm text-zinc-500">Loading batches...</span>
                  </div>
                ) : (
                  <select
                    value={selectedBatchId}
                    onChange={(e) => setSelectedBatchId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                    required
                  >
                    <option value="">Select your batch...</option>
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Enrollment number */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-2">
                  Enrollment / Roll Number <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={enrollmentNo}
                  onChange={(e) => {
                    setEnrollmentNo(e.target.value);
                    // Auto-update display name preview
                    if (e.target.value.trim() && user?.name) {
                      setDisplayName(`${e.target.value.trim().toUpperCase()}_${firstName(user.name)}`);
                    }
                  }}
                  placeholder="e.g., 56, 267, A11234"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                  required
                />
                <p className="text-[10px] text-zinc-600 mt-1">
                  The roll number your teacher gave you. This will be your unique ID.
                </p>
              </div>

              {/* Display name (auto-generated, but editable) */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-2">
                  Display Name <span className="text-zinc-600">(format: rollnumber_firstname)</span>
                </label>
                <input
                  type="text"
                  value={displayName || previewName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={previewName || "56_kush"}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                />
                <p className="text-[10px] text-zinc-600 mt-1">
                  This is how teachers see you in the roster. You can edit this later.
                </p>
              </div>

              {/* LinkedIn URL (optional) */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-2">
                  LinkedIn URL <span className="text-zinc-600">(optional)</span>
                </label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/yourname"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                />
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-400 p-3 rounded-lg"
                  style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
                >
                  {error}
                </motion.div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-500 hover:scale-[1.01] transition-transform disabled:opacity-50 disabled:hover:scale-100"
              >
                {loading ? "Registering..." : "Register — Lock in my details →"}
              </button>

              {closable && (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  I&apos;ll do this later
                </button>
              )}
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
