"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/lib/auth-context";

interface LoginPromptProps {
  onClose: () => void;
}

interface GoogleCredentialResponse {
  credential?: string;
}

function decodeJwt(token: string): Record<string, string> {
  try {
    const base64 = token.split(".")[1];
    const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return {};
  }
}

export default function LoginPrompt({ onClose }: LoginPromptProps) {
  const { login } = useAuth();
  const [step, setStep] = useState<"google" | "enroll">("google");
  const [googleName, setGoogleName] = useState("");
  const [googleEmail, setGoogleEmail] = useState("");
  const [enrollmentNo, setEnrollmentNo] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [batches, setBatches] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGoogleSuccess(response: GoogleCredentialResponse) {
    if (!response.credential) return;
    const payload = decodeJwt(response.credential);
    const name = payload.name || "";
    const email = payload.email || "";
    setGoogleName(name);
    setGoogleEmail(email);

    // Fetch batches for the enrollment step
    try {
      const res = await fetch("/api/batches");
      if (res.ok) {
        const data = await res.json();
        setBatches(
          (data.batches || []).map((b: { id: string; name: string }) => ({
            id: b.id,
            name: b.name,
          }))
        );
      }
    } catch {}

    setStep("enroll");
  }

  async function handleEnrollmentSubmit() {
    if (!enrollmentNo.trim() || !selectedBatch) {
      setError("Please enter your enrollment number and select a batch.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Verify enrollment number exists in roll_list
      const res = await fetch("/api/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchId: selectedBatch,
          enrollmentNo: enrollmentNo.trim().toUpperCase(),
          name: googleName,
          email: googleEmail,
          linkedinUrl: "https://linkedin.com/in/placeholder",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (
          data.error?.includes("Enrollment number not found")
        ) {
          setError(
            "Enrollment number not found in the roll list. Contact your instructor."
          );
        } else {
          setError(data.error || "Verification failed.");
        }
        setLoading(false);
        return;
      }

      // Login success
      login({
        name: googleName,
        email: googleEmail,
        enrollmentNo: enrollmentNo.trim().toUpperCase(),
        batchId: selectedBatch,
      });

      onClose();
    } catch {
      setError("Network error. Please try again.");
    }

    setLoading(false);
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center px-4"
        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm rounded-2xl p-6 relative"
          style={{
            background:
              "linear-gradient(135deg, rgba(15,15,25,0.95), rgba(12,12,20,0.98))",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow:
              "0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M5 5l8 8M13 5l-8 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>

          {step === "google" ? (
            <>
              <div className="text-center mb-6">
                <div className="text-3xl mb-3">&#128640;</div>
                <h2 className="text-lg font-bold text-white mb-1.5">
                  Save your progress!
                </h2>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Sign in to save your quiz scores and track your progress
                  across devices.
                </p>
              </div>

              <div className="flex justify-center mb-4">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError("Google sign-in failed.")}
                  theme="filled_black"
                  size="large"
                  shape="pill"
                  text="signin_with"
                />
              </div>

              {error && (
                <p className="text-sm text-red-400 text-center mt-2">
                  {error}
                </p>
              )}

              <p className="text-[11px] text-zinc-600 text-center mt-4">
                You can dismiss this and continue without saving.
              </p>
            </>
          ) : (
            <>
              <div className="text-center mb-5">
                <div className="text-2xl mb-2">&#128218;</div>
                <h2 className="text-lg font-bold text-white mb-1">
                  Almost there!
                </h2>
                <p className="text-sm text-zinc-400">
                  Welcome, <span className="text-white">{googleName}</span>.
                  Verify your enrollment.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-zinc-500 mb-1 block">
                    Batch
                  </label>
                  <select
                    value={selectedBatch}
                    onChange={(e) => setSelectedBatch(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-white/20"
                  >
                    <option value="">Select your batch...</option>
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-500 mb-1 block">
                    Enrollment Number
                  </label>
                  <input
                    type="text"
                    value={enrollmentNo}
                    onChange={(e) => setEnrollmentNo(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleEnrollmentSubmit()
                    }
                    placeholder="e.g. A12345678"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-400">{error}</p>
                )}

                <button
                  onClick={handleEnrollmentSubmit}
                  disabled={loading}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-500 hover:scale-[1.02] transition-transform disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Verify & Start Tracking"}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
