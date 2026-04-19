"use client";

import { useState } from "react";
import type { ContentBlock } from "@/types/content";
import { PlainInput } from "./primitives";

export function ImageEditor({
  block,
  onChange,
  courseSlug,
  moduleNumber,
  topicNumber,
  idToken,
  password,
}: {
  block: Extract<ContentBlock, { type: "image" }>;
  onChange: (next: ContentBlock) => void;
  courseSlug: string;
  moduleNumber: number;
  topicNumber: number;
  idToken: string | null;
  /** Legacy no-op — password admin path removed. Kept for call-site compat. */
  password: string;
}) {
  void password;
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // File uploads go through /api/admin/upload → Supabase Storage and
  // write the public URL straight back into block.src. Upload context
  // (course/module/topic) becomes the storage key prefix so the
  // orphan-cleanup helper can find + delete on later row deletes.
  async function handleFile(file: File) {
    setErr(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("courseSlug", courseSlug);
      fd.append("moduleNumber", String(moduleNumber));
      fd.append("topicNumber", String(topicNumber));

      const headers: Record<string, string> = {};
      if (idToken) headers["x-id-token"] = idToken;

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers,
        body: fd,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `Upload failed (${res.status})`);
      onChange({ ...block, src: json.url });
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      {block.src ? (
        <div
          className="rounded-lg overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.06)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={block.src}
            alt={block.description}
            className="w-full h-auto block"
          />
        </div>
      ) : (
        <label
          className="block cursor-pointer text-center py-6 rounded-lg text-[12px] text-zinc-500 hover:text-white transition-colors"
          style={{
            background: "rgba(99,102,241,0.04)",
            border: "1px dashed rgba(99,102,241,0.3)",
          }}
        >
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
          {uploading ? "Uploading…" : "Click to upload image (max 5 MB)"}
        </label>
      )}

      {block.src && (
        <div className="flex items-center gap-2">
          <code
            className="text-[10px] text-zinc-600 truncate flex-1"
            title={block.src}
          >
            {block.src}
          </code>
          <label className="text-[11px] text-indigo-400 hover:text-indigo-300 cursor-pointer">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
            Replace
          </label>
          <button
            onClick={() => onChange({ ...block, src: undefined })}
            className="text-[11px] text-zinc-500 hover:text-red-400"
          >
            Remove
          </button>
        </div>
      )}

      <PlainInput
        value={block.description}
        onChange={(description) => onChange({ ...block, description })}
        placeholder="Alt text (describe the image for accessibility)"
      />

      {err && <p className="text-[11px] text-red-400">{err}</p>}
    </div>
  );
}
