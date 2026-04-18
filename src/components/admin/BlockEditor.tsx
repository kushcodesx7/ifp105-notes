"use client";

import { useRef, useState } from "react";
import type { ContentBlock, TopicCard, TableRow, StepItem } from "@/types/content";

// Block editor for the topic body (`topics.content_json`).
//
// Renders an editable list of ContentBlocks with:
//   - Per-block inline editors (text / callout / analogy / image / steps
//     / table / cards). Specialized era-cards omitted from the MVP —
//     only Module 1 Topic 2 uses it and it stays in TS files.
//   - Reorder (↑ / ↓), delete, and "Add block" dropdown
//   - Image uploads go through /api/admin/upload → Supabase Storage
//     → URL written into `block.src`
//
// The parent owns the blocks array and the save side-effect (this
// component is controlled: `value` in, `onChange` out). The topic
// editor panel in /admin/courses/[slug]/modules/[num] wires onChange
// to a debounced PATCH of contentJson.

interface BlockEditorProps {
  value: ContentBlock[];
  onChange: (next: ContentBlock[]) => void;
  // Upload context — written into the uploaded file's storage path so
  // cleanup scripts can find orphaned uploads per course/module/topic.
  courseSlug: string;
  moduleNumber: number;
  topicNumber: number;
  // Auth passthrough for the upload API
  idToken: string | null;
  password: string;
}

type BlockType = ContentBlock["type"];

const BLOCK_MENU: { type: BlockType; label: string; icon: string }[] = [
  { type: "text", label: "Paragraph", icon: "📝" },
  { type: "callout", label: "Callout", icon: "💡" },
  { type: "analogy", label: "Analogy", icon: "🧠" },
  { type: "image", label: "Image", icon: "🖼" },
  { type: "steps", label: "Steps", icon: "👣" },
  { type: "table", label: "Table", icon: "📊" },
  { type: "cards", label: "Cards grid", icon: "🃏" },
];

function makeEmpty(type: BlockType): ContentBlock {
  switch (type) {
    case "text":
      return { type: "text", html: "" };
    case "callout":
      return { type: "callout", variant: "blue", html: "" };
    case "analogy":
      return { type: "analogy", label: "Real-world parallel", html: "" };
    case "image":
      return { type: "image", src: undefined, description: "" };
    case "steps":
      return { type: "steps", items: [{ title: "", description: "" }] };
    case "table":
      return {
        type: "table",
        headers: ["Column 1", "Column 2"],
        rows: [{ cells: ["", ""] }],
      };
    case "cards":
      return {
        type: "cards",
        columns: 2,
        items: [{ icon: "✨", title: "", description: "" }],
      };
    case "era-cards":
      return { type: "era-cards", columns: 4, items: [] };
  }
}

export default function BlockEditor({
  value,
  onChange,
  courseSlug,
  moduleNumber,
  topicNumber,
  idToken,
  password,
}: BlockEditorProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  function update(i: number, next: ContentBlock) {
    const copy = [...value];
    copy[i] = next;
    onChange(copy);
  }

  function remove(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }

  function move(i: number, delta: -1 | 1) {
    const j = i + delta;
    if (j < 0 || j >= value.length) return;
    const copy = [...value];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    onChange(copy);
  }

  function add(type: BlockType) {
    onChange([...value, makeEmpty(type)]);
    setMenuOpen(false);
  }

  return (
    <div className="space-y-2">
      {value.map((block, i) => (
        <BlockRow
          key={i}
          block={block}
          first={i === 0}
          last={i === value.length - 1}
          onChange={(next) => update(i, next)}
          onDelete={() => remove(i)}
          onMoveUp={() => move(i, -1)}
          onMoveDown={() => move(i, 1)}
          courseSlug={courseSlug}
          moduleNumber={moduleNumber}
          topicNumber={topicNumber}
          idToken={idToken}
          password={password}
        />
      ))}

      {value.length === 0 && (
        <p className="text-[12px] text-zinc-600 italic py-3">
          No content blocks yet. Add one to start writing this topic&apos;s body.
        </p>
      )}

      <div className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="w-full text-[12px] text-zinc-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.06] border border-dashed border-white/[0.08] rounded-lg py-2 transition-colors"
        >
          + Add block
        </button>
        {menuOpen && (
          <>
            <button
              aria-label="Close block menu"
              className="fixed inset-0 z-40 cursor-default"
              onClick={() => setMenuOpen(false)}
            />
            <div
              className="absolute left-0 right-0 top-full mt-1 rounded-lg z-50 overflow-hidden"
              style={{
                background: "rgba(15,15,25,0.97)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(20px)",
              }}
            >
              {BLOCK_MENU.map((m) => (
                <button
                  key={m.type}
                  onClick={() => add(m.type)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-zinc-300 hover:bg-white/[0.06] text-left"
                >
                  <span>{m.icon}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Row wrapper (chrome + per-type editor) ─────────────────

function BlockRow({
  block,
  first,
  last,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  courseSlug,
  moduleNumber,
  topicNumber,
  idToken,
  password,
}: {
  block: ContentBlock;
  first: boolean;
  last: boolean;
  onChange: (next: ContentBlock) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  courseSlug: string;
  moduleNumber: number;
  topicNumber: number;
  idToken: string | null;
  password: string;
}) {
  return (
    <div
      className="rounded-lg p-3"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          {block.type}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={onMoveUp}
            disabled={first}
            className="w-6 h-6 rounded text-[11px] text-zinc-500 hover:text-white hover:bg-white/[0.06] disabled:opacity-30"
            aria-label="Move up"
          >
            ↑
          </button>
          <button
            onClick={onMoveDown}
            disabled={last}
            className="w-6 h-6 rounded text-[11px] text-zinc-500 hover:text-white hover:bg-white/[0.06] disabled:opacity-30"
            aria-label="Move down"
          >
            ↓
          </button>
          <button
            onClick={onDelete}
            className="w-6 h-6 rounded text-[11px] text-red-400 hover:text-red-300 hover:bg-red-500/10"
            aria-label="Delete block"
            title="Delete block"
          >
            ×
          </button>
        </div>
      </div>

      {block.type === "text" && (
        <TextEditor block={block} onChange={onChange} />
      )}
      {block.type === "callout" && (
        <CalloutEditor block={block} onChange={onChange} />
      )}
      {block.type === "analogy" && (
        <AnalogyEditor block={block} onChange={onChange} />
      )}
      {block.type === "image" && (
        <ImageEditor
          block={block}
          onChange={onChange}
          courseSlug={courseSlug}
          moduleNumber={moduleNumber}
          topicNumber={topicNumber}
          idToken={idToken}
          password={password}
        />
      )}
      {block.type === "steps" && (
        <StepsEditor block={block} onChange={onChange} />
      )}
      {block.type === "table" && (
        <TableEditor block={block} onChange={onChange} />
      )}
      {block.type === "cards" && (
        <CardsEditor block={block} onChange={onChange} />
      )}
      {block.type === "era-cards" && (
        <p className="text-[11px] text-zinc-500 italic">
          era-cards editing not supported in the MVP — edit via JSON in a
          future phase.
        </p>
      )}
    </div>
  );
}

// ─── Shared UI primitives ──────────────────────────────────

function HtmlTextarea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  // Wrap the current selection with start/end tags, or insert them at
  // the cursor when nothing is selected. Used by the toolbar buttons.
  function wrap(startTag: string, endTag: string) {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e, value: v } = el;
    const before = v.slice(0, s);
    const selected = v.slice(s, e);
    const after = v.slice(e);
    const next = `${before}${startTag}${selected}${endTag}${after}`;
    onChange(next);
    // Restore selection just inside the wrapper on next tick.
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(s + startTag.length, e + startTag.length);
    }, 0);
  }

  return (
    <div>
      <div className="flex items-center gap-1 mb-1">
        <ToolbarBtn onClick={() => wrap("<strong>", "</strong>")} title="Bold">
          B
        </ToolbarBtn>
        <ToolbarBtn onClick={() => wrap("<em>", "</em>")} title="Italic">
          <i>I</i>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => wrap("<mark>", "</mark>")} title="Highlight">
          H
        </ToolbarBtn>
        <ToolbarBtn onClick={() => wrap("<br>", "")} title="Line break">
          ↵
        </ToolbarBtn>
      </div>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[13px] text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 font-mono"
      />
      <p className="text-[10px] text-zinc-600 mt-1">
        HTML allowed: &lt;strong&gt;, &lt;em&gt;, &lt;mark&gt;, &lt;br&gt;.
      </p>
    </div>
  );
}

function ToolbarBtn({
  onClick,
  title,
  children,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="text-[11px] font-semibold w-7 h-6 rounded bg-white/[0.04] hover:bg-white/[0.1] text-zinc-300"
    >
      {children}
    </button>
  );
}

function PlainInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[13px] text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50"
    />
  );
}

// ─── Text block ────────────────────────────────────────────

function TextEditor({
  block,
  onChange,
}: {
  block: Extract<ContentBlock, { type: "text" }>;
  onChange: (next: ContentBlock) => void;
}) {
  return (
    <HtmlTextarea
      value={block.html}
      onChange={(html) => onChange({ ...block, html })}
      placeholder="Write a paragraph. Strong/highlight/italic via the toolbar above."
      rows={3}
    />
  );
}

// ─── Callout block ─────────────────────────────────────────

const CALLOUT_VARIANTS: { value: "amber" | "blue" | "red" | "purple" | "dark"; label: string }[] = [
  { value: "blue", label: "Blue (info)" },
  { value: "amber", label: "Amber (tip)" },
  { value: "red", label: "Red (warning)" },
  { value: "purple", label: "Purple (highlight)" },
  { value: "dark", label: "Dark (quote)" },
];

function CalloutEditor({
  block,
  onChange,
}: {
  block: Extract<ContentBlock, { type: "callout" }>;
  onChange: (next: ContentBlock) => void;
}) {
  return (
    <div className="space-y-2">
      <select
        value={block.variant || "blue"}
        onChange={(e) =>
          onChange({
            ...block,
            variant: e.target.value as "amber" | "blue" | "red" | "purple" | "dark",
          })
        }
        className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[13px] text-white focus:outline-none focus:border-indigo-500/50"
      >
        {CALLOUT_VARIANTS.map((v) => (
          <option key={v.value} value={v.value}>
            {v.label}
          </option>
        ))}
      </select>
      <HtmlTextarea
        value={block.html}
        onChange={(html) => onChange({ ...block, html })}
        placeholder="Callout content."
      />
    </div>
  );
}

// ─── Analogy block ─────────────────────────────────────────

function AnalogyEditor({
  block,
  onChange,
}: {
  block: Extract<ContentBlock, { type: "analogy" }>;
  onChange: (next: ContentBlock) => void;
}) {
  return (
    <div className="space-y-2">
      <PlainInput
        value={block.label}
        onChange={(label) => onChange({ ...block, label })}
        placeholder="Label (e.g. 'Real-world parallel')"
      />
      <HtmlTextarea
        value={block.html}
        onChange={(html) => onChange({ ...block, html })}
        placeholder="Analogy content — link the new concept to something the student already knows."
      />
    </div>
  );
}

// ─── Image block ───────────────────────────────────────────

function ImageEditor({
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
  password: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

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
      else if (password) headers["x-admin-password"] = password;

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
          <label
            className="text-[11px] text-indigo-400 hover:text-indigo-300 cursor-pointer"
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

// ─── Steps block ───────────────────────────────────────────

function StepsEditor({
  block,
  onChange,
}: {
  block: Extract<ContentBlock, { type: "steps" }>;
  onChange: (next: ContentBlock) => void;
}) {
  function updateItem(i: number, patch: Partial<StepItem>) {
    const next = [...block.items];
    next[i] = { ...next[i], ...patch };
    onChange({ ...block, items: next });
  }
  function add() {
    onChange({
      ...block,
      items: [...block.items, { title: "", description: "" }],
    });
  }
  function remove(i: number) {
    onChange({
      ...block,
      items: block.items.filter((_, idx) => idx !== i),
    });
  }
  function move(i: number, delta: -1 | 1) {
    const j = i + delta;
    if (j < 0 || j >= block.items.length) return;
    const next = [...block.items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange({ ...block, items: next });
  }

  return (
    <div className="space-y-2">
      {block.items.map((item, i) => (
        <div
          key={i}
          className="flex items-start gap-2 p-2 rounded-lg"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <span className="shrink-0 w-6 h-6 rounded bg-white/[0.04] text-[10px] font-bold text-zinc-400 flex items-center justify-center mt-1">
            {i + 1}
          </span>
          <div className="flex-1 space-y-1.5">
            <PlainInput
              value={item.title}
              onChange={(title) => updateItem(i, { title })}
              placeholder="Step title"
            />
            <PlainInput
              value={item.description}
              onChange={(description) => updateItem(i, { description })}
              placeholder="Step description"
            />
          </div>
          <div className="flex flex-col gap-0.5 shrink-0">
            <button
              onClick={() => move(i, -1)}
              disabled={i === 0}
              className="w-6 h-5 text-[10px] text-zinc-500 hover:text-white disabled:opacity-30"
            >
              ↑
            </button>
            <button
              onClick={() => move(i, 1)}
              disabled={i === block.items.length - 1}
              className="w-6 h-5 text-[10px] text-zinc-500 hover:text-white disabled:opacity-30"
            >
              ↓
            </button>
            <button
              onClick={() => remove(i)}
              className="w-6 h-5 text-[10px] text-red-400 hover:text-red-300"
            >
              ×
            </button>
          </div>
        </div>
      ))}
      <button
        onClick={add}
        className="w-full text-[11px] text-indigo-400 hover:text-indigo-300 bg-indigo-500/[0.06] hover:bg-indigo-500/[0.12] rounded-lg py-1.5 transition-colors"
      >
        + Add step
      </button>
    </div>
  );
}

// ─── Table block ───────────────────────────────────────────

function TableEditor({
  block,
  onChange,
}: {
  block: Extract<ContentBlock, { type: "table" }>;
  onChange: (next: ContentBlock) => void;
}) {
  const colCount = block.headers.length;

  function setHeader(i: number, v: string) {
    const headers = [...block.headers];
    headers[i] = v;
    onChange({ ...block, headers });
  }
  function setCell(ri: number, ci: number, v: string) {
    const rows = block.rows.map((row, idx) => {
      if (idx !== ri) return row;
      const cells = [...row.cells];
      cells[ci] = v;
      return { cells };
    });
    onChange({ ...block, rows });
  }
  function addRow() {
    onChange({
      ...block,
      rows: [...block.rows, { cells: Array(colCount).fill("") }],
    });
  }
  function removeRow(ri: number) {
    onChange({ ...block, rows: block.rows.filter((_, idx) => idx !== ri) });
  }
  function addColumn() {
    onChange({
      ...block,
      headers: [...block.headers, `Column ${colCount + 1}`],
      rows: block.rows.map((r) => ({ cells: [...r.cells, ""] })),
    });
  }
  function removeColumn(ci: number) {
    if (colCount <= 1) return;
    onChange({
      ...block,
      headers: block.headers.filter((_, idx) => idx !== ci),
      rows: block.rows.map((r) => ({
        cells: r.cells.filter((_, idx) => idx !== ci),
      })),
    });
  }

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr>
              {block.headers.map((h, i) => (
                <th key={i} className="p-1 text-left align-top">
                  <div className="flex items-center gap-1">
                    <input
                      value={h}
                      onChange={(e) => setHeader(i, e.target.value)}
                      className="w-full px-2 py-1 rounded bg-white/[0.06] border border-white/[0.08] text-white text-[12px] font-semibold focus:outline-none focus:border-indigo-500/50"
                    />
                    <button
                      onClick={() => removeColumn(i)}
                      disabled={colCount <= 1}
                      className="text-[11px] text-red-400 hover:text-red-300 disabled:opacity-30 w-5 h-6"
                      title="Remove column"
                    >
                      ×
                    </button>
                  </div>
                </th>
              ))}
              <th className="p-1 w-8">
                <button
                  onClick={addColumn}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 w-6 h-6 rounded bg-indigo-500/[0.08]"
                  title="Add column"
                >
                  +
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, ri) => (
              <tr key={ri}>
                {row.cells.map((cell, ci) => (
                  <td key={ci} className="p-1 align-top">
                    <input
                      value={cell}
                      onChange={(e) => setCell(ri, ci, e.target.value)}
                      placeholder={`r${ri + 1} c${ci + 1}`}
                      className="w-full px-2 py-1 rounded bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-zinc-600 text-[12px] focus:outline-none focus:border-indigo-500/50"
                    />
                  </td>
                ))}
                <td className="p-1 w-8">
                  <button
                    onClick={() => removeRow(ri)}
                    className="text-[11px] text-red-400 hover:text-red-300 w-6 h-6"
                    title="Remove row"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        onClick={addRow}
        className="w-full text-[11px] text-indigo-400 hover:text-indigo-300 bg-indigo-500/[0.06] hover:bg-indigo-500/[0.12] rounded-lg py-1.5 transition-colors"
      >
        + Add row
      </button>
      <p className="text-[10px] text-zinc-600">
        Cells accept inline HTML (&lt;strong&gt;, &lt;em&gt;, &lt;mark&gt;, &lt;br&gt;).
      </p>
    </div>
  );
}

// ─── Cards grid block ──────────────────────────────────────

function CardsEditor({
  block,
  onChange,
}: {
  block: Extract<ContentBlock, { type: "cards" }>;
  onChange: (next: ContentBlock) => void;
}) {
  function setColumns(n: 2 | 3 | 4) {
    onChange({ ...block, columns: n });
  }
  function updateCard(i: number, patch: Partial<TopicCard>) {
    const items = [...block.items];
    items[i] = { ...items[i], ...patch };
    onChange({ ...block, items });
  }
  function addCard() {
    onChange({
      ...block,
      items: [...block.items, { icon: "✨", title: "", description: "" }],
    });
  }
  function removeCard(i: number) {
    onChange({
      ...block,
      items: block.items.filter((_, idx) => idx !== i),
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-[11px]">
        <span className="text-zinc-500">Columns:</span>
        {([2, 3, 4] as const).map((n) => (
          <button
            key={n}
            onClick={() => setColumns(n)}
            className={`px-2 py-0.5 rounded ${
              block.columns === n
                ? "bg-indigo-500 text-white"
                : "bg-white/[0.04] text-zinc-400 hover:text-white"
            }`}
          >
            {n}
          </button>
        ))}
      </div>

      {block.items.map((card, i) => (
        <div
          key={i}
          className="p-2 rounded-lg space-y-1.5"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <div className="flex items-center gap-2">
            <input
              value={card.icon}
              onChange={(e) => updateCard(i, { icon: e.target.value })}
              placeholder="🧠"
              className="w-14 px-2 py-1 rounded bg-white/[0.04] border border-white/[0.08] text-center text-[14px] focus:outline-none"
            />
            <input
              value={card.title}
              onChange={(e) => updateCard(i, { title: e.target.value })}
              placeholder="Card title"
              className="flex-1 px-2 py-1 rounded bg-white/[0.04] border border-white/[0.08] text-white text-[12px] font-semibold focus:outline-none focus:border-indigo-500/50"
            />
            <button
              onClick={() => removeCard(i)}
              className="w-6 h-6 text-[11px] text-red-400 hover:text-red-300"
            >
              ×
            </button>
          </div>
          <input
            value={card.description}
            onChange={(e) => updateCard(i, { description: e.target.value })}
            placeholder="Card description"
            className="w-full px-2 py-1 rounded bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-zinc-600 text-[12px] focus:outline-none focus:border-indigo-500/50"
          />
          <div className="flex items-center gap-2">
            <input
              value={card.tag || ""}
              onChange={(e) =>
                updateCard(i, { tag: e.target.value || undefined })
              }
              placeholder="Optional tag"
              className="flex-1 px-2 py-1 rounded bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-zinc-600 text-[11px] focus:outline-none focus:border-indigo-500/50"
            />
            <select
              value={card.tagColor || "default"}
              onChange={(e) =>
                updateCard(i, {
                  tagColor:
                    e.target.value === "default" ? undefined : e.target.value,
                })
              }
              className="px-2 py-1 rounded bg-white/[0.04] border border-white/[0.08] text-white text-[11px] focus:outline-none"
            >
              <option value="default">indigo</option>
              <option value="amber">purple</option>
              <option value="blue">blue</option>
              <option value="grn">green</option>
            </select>
          </div>
        </div>
      ))}

      <button
        onClick={addCard}
        className="w-full text-[11px] text-indigo-400 hover:text-indigo-300 bg-indigo-500/[0.06] hover:bg-indigo-500/[0.12] rounded-lg py-1.5 transition-colors"
      >
        + Add card
      </button>
    </div>
  );
}

// Silence unused-import warning — used only inside editors via closures
// but TS doesn't count Extract types as uses.
export type { ContentBlock, TopicCard, TableRow, StepItem };
