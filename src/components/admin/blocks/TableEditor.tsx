"use client";

import type { ContentBlock } from "@/types/content";

export function TableEditor({
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
