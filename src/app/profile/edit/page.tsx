"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/auth-context";

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
  icon: string;
  color: string;
  bg: string;
  border: string;
}[] = [
  {
    value: "working",
    label: "Working",
    icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
    color: "#10B981",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.25)",
  },
  {
    value: "studying",
    label: "Studying",
    icon: "M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222",
    color: "#3B82F6",
    bg: "rgba(59,130,246,0.08)",
    border: "rgba(59,130,246,0.25)",
  },
  {
    value: "freelancing",
    label: "Freelancing",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    color: "#8B5CF6",
    bg: "rgba(139,92,246,0.08)",
    border: "rgba(139,92,246,0.25)",
  },
  {
    value: "looking",
    label: "Looking",
    icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.25)",
  },
];

const EMPTY_PROFILE: ProfileData = {
  name: "",
  photoUrl: "",
  status: "",
  company: "",
  jobTitle: "",
  description: "",
  university: "",
  program: "",
  country: "",
  freelanceArea: "",
  lookingFor: "",
  skills: "",
  linkedinUrl: "",
  githubUrl: "",
  telegramUrl: "",
  portfolioUrl: "",
};

export default function EditProfilePage() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<ProfileData>(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoggedIn) {
        router.push("/batches");
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [isLoggedIn, router]);

  // Load existing profile
  const loadProfile = useCallback(async () => {
    if (!user?.email) return;
    try {
      const res = await fetch(`/api/profiles?batchId=${user.batchId}`);
      if (!res.ok) return;
      const data = await res.json();
      const existing = data.profiles.find(
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
        setProfile((prev) => ({ ...prev, name: user.name }));
      }
    } catch {
      // Ignore errors, keep defaults
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) loadProfile();
  }, [user, loadProfile]);

  function updateField(field: keyof ProfileData, value: string) {
    setProfile((prev) => ({ ...prev, [field]: value }));
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/profiles/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        showToast("error", data.error || "Upload failed");
        return;
      }
      updateField("photoUrl", data.url);
      showToast("success", "Photo uploaded!");
    } catch {
      showToast("error", "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleSave() {
    if (!user) return;

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
          studentEmail: user.email,
          name: profile.name,
          enrollmentNo: user.enrollmentNo,
          batchId: user.batchId,
          photoUrl: profile.photoUrl,
          status: profile.status || null,
          company: profile.company,
          jobTitle: profile.jobTitle,
          description: profile.description,
          university: profile.university,
          program: profile.program,
          country: profile.country,
          freelanceArea: profile.freelanceArea,
          lookingFor: profile.lookingFor,
          skills: profile.skills,
          linkedinUrl: profile.linkedinUrl,
          githubUrl: profile.githubUrl,
          telegramUrl: profile.telegramUrl,
          portfolioUrl: profile.portfolioUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast("error", data.error || "Failed to save");
        return;
      }
      showToast("success", "Profile saved successfully!");
    } catch {
      showToast("error", "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const initials = profile.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen">
        <Navbar showBack title="Edit Profile" />
        <div className="flex justify-center pt-32">
          <p className="text-zinc-400">Redirecting to login...</p>
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

  const activeStatus = STATUS_OPTIONS.find((s) => s.value === profile.status);

  return (
    <main className="relative min-h-screen">
      <Navbar showBack title="Edit Profile" />

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ x: [0, 30, -20, 0], y: [0, -40, 20, 0], scale: [1, 1.1, 0.95, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[5%] right-[10%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, -20, 30, 0], y: [0, 30, -20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[20%] left-[5%] w-[400px] h-[400px] rounded-full bg-violet-500/10 blur-[120px]"
        />
        <div className="absolute inset-0 grid-bg opacity-30" />
      </div>

      <div className="relative z-10 pt-24 pb-16 px-6 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-2">Your Career Profile</h1>
            <p className="text-sm text-zinc-400">
              Share what you&apos;re up to with your classmates
            </p>
          </div>

          {/* Photo Upload */}
          <div className="flex justify-center mb-10">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-indigo-500/50 transition-all duration-300 shadow-lg group-hover:shadow-indigo-500/20">
                {profile.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.photoUrl}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-2xl font-bold text-white">
                    {initials}
                  </div>
                )}
              </div>
              {/* Camera overlay */}
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                {uploading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Name */}
          <div className="mb-8">
            <label className="text-xs font-medium text-zinc-400 mb-2 block">Full Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Your full name"
              className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
          </div>

          {/* Status Selector */}
          <div className="mb-8">
            <label className="text-xs font-medium text-zinc-400 mb-3 block">
              What are you up to?
            </label>
            <div className="grid grid-cols-2 gap-3">
              {STATUS_OPTIONS.map((opt) => {
                const isSelected = profile.status === opt.value;
                return (
                  <motion.button
                    key={opt.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() =>
                      updateField("status", isSelected ? "" : opt.value)
                    }
                    className="relative p-4 rounded-2xl text-left transition-all duration-300 overflow-hidden"
                    style={{
                      background: isSelected ? opt.bg : "rgba(255,255,255,0.03)",
                      border: `1px solid ${isSelected ? opt.border : "rgba(255,255,255,0.06)"}`,
                      boxShadow: isSelected
                        ? `0 0 20px ${opt.color}15, inset 0 1px 0 ${opt.color}10`
                        : "none",
                    }}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="statusGlow"
                        className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl"
                        style={{ background: opt.color, opacity: 0.15 }}
                      />
                    )}
                    <div className="relative flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{
                          background: isSelected
                            ? `${opt.color}20`
                            : "rgba(255,255,255,0.04)",
                        }}
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={isSelected ? opt.color : "#71717A"}
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d={opt.icon} />
                        </svg>
                      </div>
                      <span
                        className="text-sm font-semibold"
                        style={{ color: isSelected ? opt.color : "#A1A1AA" }}
                      >
                        {opt.label}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Status-specific fields */}
          <AnimatePresence mode="wait">
            {profile.status && (
              <motion.div
                key={profile.status}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="mb-8 overflow-hidden"
              >
                <div
                  className="p-5 rounded-2xl space-y-4"
                  style={{
                    background: activeStatus ? activeStatus.bg : "transparent",
                    border: `1px solid ${activeStatus ? activeStatus.border : "transparent"}`,
                  }}
                >
                  {profile.status === "working" && (
                    <>
                      <InputField
                        label="Company"
                        value={profile.company}
                        onChange={(v) => updateField("company", v)}
                        placeholder="e.g. Google, startup name..."
                        color={activeStatus?.color}
                      />
                      <InputField
                        label="Job Title"
                        value={profile.jobTitle}
                        onChange={(v) => updateField("jobTitle", v)}
                        placeholder="e.g. Software Engineer"
                        color={activeStatus?.color}
                      />
                      <TextareaField
                        label="What do you do?"
                        value={profile.description}
                        onChange={(v) => updateField("description", v)}
                        placeholder="Brief description of your role..."
                        color={activeStatus?.color}
                      />
                    </>
                  )}
                  {profile.status === "studying" && (
                    <>
                      <InputField
                        label="University"
                        value={profile.university}
                        onChange={(v) => updateField("university", v)}
                        placeholder="e.g. MIT, Oxford..."
                        color={activeStatus?.color}
                      />
                      <InputField
                        label="Program"
                        value={profile.program}
                        onChange={(v) => updateField("program", v)}
                        placeholder="e.g. MSc Computer Science"
                        color={activeStatus?.color}
                      />
                      <InputField
                        label="Country"
                        value={profile.country}
                        onChange={(v) => updateField("country", v)}
                        placeholder="e.g. United States"
                        color={activeStatus?.color}
                      />
                    </>
                  )}
                  {profile.status === "freelancing" && (
                    <>
                      <InputField
                        label="Freelance Area"
                        value={profile.freelanceArea}
                        onChange={(v) => updateField("freelanceArea", v)}
                        placeholder="e.g. Web Development, Design..."
                        color={activeStatus?.color}
                      />
                      <TextareaField
                        label="What do you do?"
                        value={profile.description}
                        onChange={(v) => updateField("description", v)}
                        placeholder="Brief description of your work..."
                        color={activeStatus?.color}
                      />
                    </>
                  )}
                  {profile.status === "looking" && (
                    <>
                      <InputField
                        label="Looking for"
                        value={profile.lookingFor}
                        onChange={(v) => updateField("lookingFor", v)}
                        placeholder="e.g. Frontend Developer role"
                        color={activeStatus?.color}
                      />
                      <InputField
                        label="Skills"
                        value={profile.skills}
                        onChange={(v) => updateField("skills", v)}
                        placeholder="e.g. React, Node.js, Python"
                        color={activeStatus?.color}
                      />
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Social Links */}
          <div className="mb-8 space-y-4">
            <label className="text-xs font-medium text-zinc-400 mb-2 block">Social Links</label>

            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#0A66C2">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </div>
              <input
                type="url"
                value={profile.linkedinUrl}
                onChange={(e) => updateField("linkedinUrl", e.target.value)}
                placeholder="LinkedIn URL (required)"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#0A66C2]/50 transition-colors"
              />
            </div>

            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#71717A">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </div>
              <input
                type="url"
                value={profile.githubUrl}
                onChange={(e) => updateField("githubUrl", e.target.value)}
                placeholder="GitHub URL (optional)"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>

            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#71717A">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
              </div>
              <input
                type="url"
                value={profile.telegramUrl}
                onChange={(e) => updateField("telegramUrl", e.target.value)}
                placeholder="Telegram URL (optional)"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>

            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#71717A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                </svg>
              </div>
              <input
                type="url"
                value={profile.portfolioUrl}
                onChange={(e) => updateField("portfolioUrl", e.target.value)}
                placeholder="Portfolio URL (optional)"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>
          </div>

          {/* Save Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
              boxShadow: "0 4px 20px rgba(99,102,241,0.3)",
            }}
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              "Save Profile"
            )}
          </motion.button>
        </motion.div>
      </div>

      {/* Toast notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
          >
            <div
              className={`px-5 py-3 rounded-xl text-sm font-medium backdrop-blur-xl shadow-2xl ${
                toast.type === "success"
                  ? "bg-green-500/15 text-green-400 border border-green-500/25"
                  : "bg-red-500/15 text-red-400 border border-red-500/25"
              }`}
            >
              {toast.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

/* ─── Helper Input Components ─── */

function InputField({
  label,
  value,
  onChange,
  placeholder,
  color,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  color?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium mb-1.5 block" style={{ color: color || "#A1A1AA" }}>
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-xl bg-black/20 border border-white/[0.08] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20 transition-colors"
      />
    </div>
  );
}

function TextareaField({
  label,
  value,
  onChange,
  placeholder,
  color,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  color?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium mb-1.5 block" style={{ color: color || "#A1A1AA" }}>
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full px-4 py-2.5 rounded-xl bg-black/20 border border-white/[0.08] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20 transition-colors resize-none"
      />
    </div>
  );
}
