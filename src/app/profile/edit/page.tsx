"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/auth-context";
import { GoogleLogin } from "@react-oauth/google";

type Status = "working" | "studying" | "freelancing" | "looking";

interface ProfileData {
  name: string;
  photoUrl: string;
  status: Status | "";
  company: string;
  jobTitle: string;
  description: string;
  university: string;
  program: string;
  country: string;
  freelanceArea: string;
  lookingFor: string;
  skills: string;
  linkedinUrl: string;
  githubUrl: string;
  telegramUrl: string;
  portfolioUrl: string;
}

const STATUS_OPTIONS: {
  value: Status;
  label: string;
  emoji: string;
  color: string;
  bg: string;
  border: string;
  desc: string;
}[] = [
  { value: "working", label: "Working", emoji: "🏢", color: "#10B981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.25)", desc: "Currently employed" },
  { value: "studying", label: "Studying Further", emoji: "🎓", color: "#3B82F6", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.25)", desc: "Pursuing higher education" },
  { value: "freelancing", label: "Freelancing", emoji: "🚀", color: "#8B5CF6", bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.25)", desc: "Self-employed or own business" },
  { value: "looking", label: "Looking", emoji: "🔍", color: "#F59E0B", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)", desc: "Exploring opportunities" },
];

const EMPTY_PROFILE: ProfileData = {
  name: "", photoUrl: "", status: "", company: "", jobTitle: "", description: "",
  university: "", program: "", country: "", freelanceArea: "", lookingFor: "",
  skills: "", linkedinUrl: "", githubUrl: "", telegramUrl: "", portfolioUrl: "",
};

function decodeJwt(token: string) {
  try {
    const base64 = token.split(".")[1];
    const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch { return null; }
}

export default function EditProfilePage() {
  const { user, isLoggedIn, login } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<ProfileData>(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Login step for users not yet authenticated
  const [googleUser, setGoogleUser] = useState<{ name: string; email: string } | null>(null);
  const [enrollmentNo, setEnrollmentNo] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [batches, setBatches] = useState<{ id: string; name: string }[]>([]);
  const [loginError, setLoginError] = useState("");
  const [loginStep, setLoginStep] = useState<"google" | "enroll">("google");

  // Load batches for enrollment step
  useEffect(() => {
    fetch("/api/batches").then(r => r.json()).then(d => {
      setBatches((d.batches || []).map((b: { id: string; name: string }) => ({ id: b.id, name: b.name })));
    }).catch(() => {});
  }, []);

  // If already logged in, load profile
  useEffect(() => {
    if (isLoggedIn) setLoading(false);
    else {
      const timer = setTimeout(() => setLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn]);

  const loadProfile = useCallback(async () => {
    if (!user?.email) return;
    try {
      // Try loading by email directly (not batch-dependent)
      const res = await fetch(`/api/profiles?batchId=${user.batchId || "all"}`);
      if (!res.ok) return;
      const data = await res.json();
      const existing = data.profiles?.find(
        (p: { studentEmail: string }) => p.studentEmail === user.email
      );
      if (existing) {
        setProfile({
          name: existing.name || user.name,
          photoUrl: existing.photoUrl || "",
          status: existing.status || "",
          company: existing.company || "",
          jobTitle: existing.jobTitle || "",
          description: existing.description || "",
          university: existing.university || "",
          program: existing.program || "",
          country: existing.country || "",
          freelanceArea: existing.freelanceArea || "",
          lookingFor: existing.lookingFor || "",
          skills: existing.skills || "",
          linkedinUrl: existing.linkedinUrl || "",
          githubUrl: existing.githubUrl || "",
          telegramUrl: existing.telegramUrl || "",
          portfolioUrl: existing.portfolioUrl || "",
        });
      } else {
        setProfile(prev => ({ ...prev, name: user.name }));
      }
    } catch {}
  }, [user]);

  useEffect(() => {
    if (user) loadProfile();
  }, [user, loadProfile]);

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }

  function updateField(field: keyof ProfileData, value: string) {
    setProfile(prev => ({ ...prev, [field]: value }));
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast("error", "Photo must be under 2MB");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("email", user?.email || "unknown");

    try {
      const res = await fetch("/api/profiles/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        updateField("photoUrl", data.url);
        showToast("success", "Photo uploaded!");
      } else {
        showToast("error", data.error || "Upload failed");
      }
    } catch {
      showToast("error", "Upload failed");
    }
    setUploading(false);
  }

  async function handleSave() {
    if (!profile.linkedinUrl.trim()) {
      showToast("error", "LinkedIn URL is required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentEmail: user!.email,
          name: profile.name,
          enrollmentNo: user!.enrollmentNo,
          batchId: user!.batchId || null,
          photoUrl: profile.photoUrl || null,
          status: profile.status || null,
          company: profile.company || null,
          jobTitle: profile.jobTitle || null,
          description: profile.description || null,
          university: profile.university || null,
          program: profile.program || null,
          country: profile.country || null,
          freelanceArea: profile.freelanceArea || null,
          lookingFor: profile.lookingFor || null,
          skills: profile.skills || null,
          linkedinUrl: profile.linkedinUrl,
          githubUrl: profile.githubUrl || null,
          telegramUrl: profile.telegramUrl || null,
          portfolioUrl: profile.portfolioUrl || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast("error", data.error || "Failed to save profile");
      } else {
        showToast("success", "Profile saved! View it on your batch page.");
      }
    } catch {
      showToast("error", "Network error. Please try again.");
    }
    setSaving(false);
  }

  function handleGoogleSuccess(response: { credential?: string }) {
    if (!response.credential) return;
    const decoded = decodeJwt(response.credential);
    if (decoded?.name && decoded?.email) {
      setGoogleUser({ name: decoded.name, email: decoded.email });
      setLoginStep("enroll");
    }
  }

  async function handleEnrollSubmit() {
    if (!enrollmentNo.trim() || !selectedBatch) {
      setLoginError("Select your batch and enter enrollment number");
      return;
    }
    setLoginError("");

    // Login through auth context
    login({
      name: googleUser!.name,
      email: googleUser!.email,
      enrollmentNo: enrollmentNo.trim().toUpperCase(),
      batchId: selectedBatch,
    });

    setProfile(prev => ({ ...prev, name: googleUser!.name }));
  }

  const selectedStatus = STATUS_OPTIONS.find(s => s.value === profile.status);

  // Not logged in — show login flow
  if (!isLoggedIn && !loading) {
    return (
      <main className="relative min-h-screen">
        <Navbar showBack title="Edit Profile" />
        <div className="relative z-10 pt-24 pb-16 px-6 max-w-md mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <div className="text-4xl mb-4">👤</div>
            <h1 className="text-2xl font-bold mb-2">Create Your Profile</h1>
            <p className="text-sm text-zinc-400">Sign in with Google to get started</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>

            {loginStep === "google" ? (
              <div className="flex flex-col items-center gap-4">
                <p className="text-xs text-zinc-500 text-center">Your name and email will be used for your profile</p>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setLoginError("Google sign-in failed")}
                  theme="filled_black"
                  shape="pill"
                  size="large"
                />
                {loginError && <p className="text-sm text-red-400">{loginError}</p>}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                  <p className="text-sm font-medium">{googleUser?.name}</p>
                  <p className="text-xs text-zinc-500">{googleUser?.email}</p>
                </div>

                <div>
                  <label className="text-xs text-zinc-400 mb-1.5 block">Batch</label>
                  <select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-white/20">
                    <option value="">Select your batch...</option>
                    {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-zinc-400 mb-1.5 block">Enrollment Number</label>
                  <input type="text" value={enrollmentNo} onChange={e => setEnrollmentNo(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleEnrollSubmit()}
                    placeholder="e.g. A12345678"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20" />
                </div>

                {loginError && <p className="text-sm text-red-400">{loginError}</p>}

                <button onClick={handleEnrollSubmit}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-500 hover:scale-[1.02] transition-transform">
                  Continue to Profile
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen">
        <Navbar showBack title="Edit Profile" />
        <div className="flex justify-center pt-32">
          <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen">
      <Navbar showBack title="Edit Profile" />

      <div className="relative z-10 pt-24 pb-16 px-6 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold mb-1">Your Career Profile</h1>
          <p className="text-sm text-zinc-400 mb-8">This will be visible on your batch page</p>

          {/* Photo */}
          <div className="flex items-center gap-5 mb-8">
            <div className="relative cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/[0.08] group-hover:border-indigo-500/50 transition-colors"
                style={{ background: "rgba(255,255,255,0.04)" }}>
                {profile.photoUrl ? (
                  <img src={profile.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-zinc-600">
                    {profile.name ? profile.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "?"}
                  </div>
                )}
              </div>
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-xs font-medium">{uploading ? "..." : "Edit"}</span>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </div>
            <div>
              <input type="text" value={profile.name} onChange={e => updateField("name", e.target.value)}
                className="text-lg font-semibold bg-transparent border-none outline-none text-white placeholder:text-zinc-600 w-full"
                placeholder="Your Name" />
              <p className="text-xs text-zinc-500">{user?.email}</p>
            </div>
          </div>

          {/* Status */}
          <div className="mb-8">
            <label className="text-sm font-semibold text-zinc-300 mb-3 block">What are you doing now?</label>
            <div className="grid grid-cols-2 gap-3">
              {STATUS_OPTIONS.map(opt => (
                <motion.button key={opt.value} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => updateField("status", profile.status === opt.value ? "" : opt.value)}
                  className="p-4 rounded-xl text-left transition-all"
                  style={{
                    background: profile.status === opt.value ? opt.bg : "rgba(255,255,255,0.02)",
                    border: `1px solid ${profile.status === opt.value ? opt.border : "rgba(255,255,255,0.06)"}`,
                  }}>
                  <div className="text-xl mb-2">{opt.emoji}</div>
                  <div className="text-sm font-semibold" style={{ color: profile.status === opt.value ? opt.color : "#a1a1aa" }}>{opt.label}</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">{opt.desc}</div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Status-specific fields */}
          <AnimatePresence mode="wait">
            {profile.status && (
              <motion.div key={profile.status} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="mb-8 space-y-4 p-5 rounded-xl" style={{ background: selectedStatus?.bg, border: `1px solid ${selectedStatus?.border}` }}>

                {profile.status === "working" && (<>
                  <Field label="Company" value={profile.company} onChange={v => updateField("company", v)} placeholder="e.g. Google, Uzcard" />
                  <Field label="Job Title" value={profile.jobTitle} onChange={v => updateField("jobTitle", v)} placeholder="e.g. Frontend Developer" />
                  <Field label="Short Description (optional)" value={profile.description} onChange={v => updateField("description", v)} placeholder="What do you do?" />
                </>)}
                {profile.status === "studying" && (<>
                  <Field label="University" value={profile.university} onChange={v => updateField("university", v)} placeholder="e.g. MIT, Oxford" />
                  <Field label="Program" value={profile.program} onChange={v => updateField("program", v)} placeholder="e.g. Masters in AI" />
                  <Field label="Country" value={profile.country} onChange={v => updateField("country", v)} placeholder="e.g. USA, UK" />
                </>)}
                {profile.status === "freelancing" && (<>
                  <Field label="Area" value={profile.freelanceArea} onChange={v => updateField("freelanceArea", v)} placeholder="e.g. Web Development" />
                  <Field label="Short Description (optional)" value={profile.description} onChange={v => updateField("description", v)} placeholder="What do you offer?" />
                </>)}
                {profile.status === "looking" && (<>
                  <Field label="Looking For" value={profile.lookingFor} onChange={v => updateField("lookingFor", v)} placeholder="e.g. Frontend Developer role" />
                  <Field label="Skills" value={profile.skills} onChange={v => updateField("skills", v)} placeholder="e.g. React, Python, SQL" />
                </>)}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Links */}
          <div className="mb-8 space-y-4">
            <label className="text-sm font-semibold text-zinc-300 block">Links</label>
            <Field label="LinkedIn URL *" value={profile.linkedinUrl} onChange={v => updateField("linkedinUrl", v)} placeholder="https://linkedin.com/in/yourname" required />
            <Field label="GitHub (optional)" value={profile.githubUrl} onChange={v => updateField("githubUrl", v)} placeholder="https://github.com/yourname" />
            <Field label="Telegram (optional)" value={profile.telegramUrl} onChange={v => updateField("telegramUrl", v)} placeholder="https://t.me/yourname" />
            <Field label="Portfolio (optional)" value={profile.portfolioUrl} onChange={v => updateField("portfolioUrl", v)} placeholder="https://yourwebsite.com" />
          </div>

          {/* Save */}
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleSave} disabled={saving}
            className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)", boxShadow: "0 4px 20px rgba(99,102,241,0.3)" }}>
            {saving ? "Saving..." : "Save Profile"}
          </motion.button>
        </motion.div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full text-sm font-medium ${
              toast.type === "success" ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"
            }`}>
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function Field({ label, value, onChange, placeholder, required }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string; required?: boolean;
}) {
  return (
    <div>
      <label className="text-xs text-zinc-400 mb-1.5 block">{label}</label>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required}
        className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20 transition-colors" />
    </div>
  );
}
