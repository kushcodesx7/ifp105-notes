"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CellData {
  value: string;
  display: string;
  isFormula: boolean;
}

interface ExcelChallenge {
  title: string;
  description: string;
  hint: string;
  initialData: Record<string, string>; // e.g. { "A1": "10", "A2": "20" }
  targetCell: string; // e.g. "B1"
  expectedFormula: string[]; // e.g. ["=SUM(A1:A3)", "=sum(a1:a3)"]
  expectedResult: string;
}

interface ExcelSimulatorProps {
  challenges: ExcelChallenge[];
}

const COLS = ["A", "B", "C", "D"];
const ROWS = [1, 2, 3, 4, 5, 6];

function evaluateFormula(formula: string, cells: Record<string, CellData>): string {
  if (!formula.startsWith("=")) return formula;

  const expr = formula.substring(1).toUpperCase();

  // Parse range like A1:A5
  const rangeMatch = expr.match(/(SUM|AVERAGE|COUNT|MAX|MIN)\(([A-Z]\d+):([A-Z]\d+)\)/i);
  if (rangeMatch) {
    const fn = rangeMatch[1].toUpperCase();
    const start = rangeMatch[2];
    const end = rangeMatch[3];
    const col = start[0];
    const startRow = parseInt(start.substring(1));
    const endRow = parseInt(end.substring(1));
    const values: number[] = [];

    for (let r = startRow; r <= endRow; r++) {
      const ref = `${col}${r}`;
      const val = parseFloat(cells[ref]?.display || "0");
      if (!isNaN(val)) values.push(val);
    }

    if (values.length === 0) return "0";

    switch (fn) {
      case "SUM": return String(values.reduce((a, b) => a + b, 0));
      case "AVERAGE": return String(Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100);
      case "COUNT": return String(values.length);
      case "MAX": return String(Math.max(...values));
      case "MIN": return String(Math.min(...values));
    }
  }

  // Simple arithmetic: =A1+A2, =A1*B1
  const simpleMatch = expr.match(/([A-Z]\d+)\s*([+\-*/])\s*([A-Z]\d+)/i);
  if (simpleMatch) {
    const left = parseFloat(cells[simpleMatch[1].toUpperCase()]?.display || "0");
    const right = parseFloat(cells[simpleMatch[3].toUpperCase()]?.display || "0");
    const op = simpleMatch[2];
    switch (op) {
      case "+": return String(left + right);
      case "-": return String(left - right);
      case "*": return String(left * right);
      case "/": return right !== 0 ? String(Math.round((left / right) * 100) / 100) : "#DIV/0!";
    }
  }

  // Single cell reference: =A1
  const cellRef = expr.match(/^([A-Z]\d+)$/i);
  if (cellRef) {
    return cells[cellRef[1].toUpperCase()]?.display || "0";
  }

  return "#ERROR";
}

export default function ExcelSimulator({ challenges }: ExcelSimulatorProps) {
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [cells, setCells] = useState<Record<string, CellData>>({});
  const [activeCell, setActiveCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [solved, setSolved] = useState<Set<number>>(new Set());
  const [showSuccess, setShowSuccess] = useState(false);

  const challenge = challenges[currentChallenge];

  // Initialize cells with challenge data
  const initCells = useCallback((ch: ExcelChallenge) => {
    const initial: Record<string, CellData> = {};
    for (const col of COLS) {
      for (const row of ROWS) {
        const ref = `${col}${row}`;
        const val = ch.initialData[ref] || "";
        initial[ref] = { value: val, display: val, isFormula: false };
      }
    }
    setCells(initial);
    setActiveCell(null);
    setEditValue("");
    setShowSuccess(false);
  }, []);

  // Init on first render and challenge change
  useState(() => { initCells(challenge); });

  function handleCellClick(ref: string) {
    // Don't edit pre-filled cells
    if (challenge.initialData[ref]) return;
    setActiveCell(ref);
    setEditValue(cells[ref]?.value || "");
  }

  function handleCellSubmit() {
    if (!activeCell) return;

    const newCells = { ...cells };
    const isFormula = editValue.startsWith("=");
    const display = isFormula ? evaluateFormula(editValue, newCells) : editValue;

    newCells[activeCell] = { value: editValue, display, isFormula };
    setCells(newCells);

    // Check if challenge is solved
    const targetDisplay = newCells[challenge.targetCell]?.display;
    const targetValue = newCells[challenge.targetCell]?.value?.toUpperCase().replace(/\s/g, "");

    const isCorrectFormula = challenge.expectedFormula.some(
      f => targetValue === f.toUpperCase().replace(/\s/g, "")
    );
    const isCorrectResult = targetDisplay === challenge.expectedResult;

    if (isCorrectFormula || isCorrectResult) {
      setSolved(prev => new Set([...prev, currentChallenge]));
      setShowSuccess(true);
    }

    setActiveCell(null);
  }

  function nextChallenge() {
    const next = currentChallenge + 1;
    if (next < challenges.length) {
      setCurrentChallenge(next);
      initCells(challenges[next]);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-6 rounded-2xl overflow-hidden"
      style={{ background: "#0d1117", border: "1px solid #2a2a33" }}
    >
      {/* Header */}
      <div className="px-5 py-3 flex items-center gap-3" style={{ background: "#161b22", borderBottom: "1px solid #2a2a33" }}>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ background: "#3fb950" }} />
          <div className="w-3 h-3 rounded-full" style={{ background: "#d29922" }} />
          <div className="w-3 h-3 rounded-full" style={{ background: "#f85149" }} />
        </div>
        <span className="text-[11px] font-bold text-zinc-500 tracking-wider">EXCEL PRACTICE</span>
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full ml-auto" style={{ background: "rgba(16,185,129,0.12)", color: "#10B981" }}>
          {solved.size}/{challenges.length} solved
        </span>
      </div>

      {/* Challenge info */}
      <div className="px-5 py-3" style={{ borderBottom: "1px solid #1e1e28" }}>
        <div className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase mb-1">
          Challenge {currentChallenge + 1} of {challenges.length}
        </div>
        <h4 className="text-sm font-bold text-zinc-200 mb-1">{challenge.title}</h4>
        <p className="text-[12px] text-zinc-400 leading-relaxed">{challenge.description}</p>
        <div className="mt-2 text-[11px] text-amber-400/80 flex items-center gap-1">
          <span>💡</span> {challenge.hint}
        </div>
      </div>

      {/* Spreadsheet grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#1a1a22" }}>
              <th className="w-10 py-1.5 text-center text-zinc-600 font-medium" style={{ borderBottom: "1px solid #2a2a33", borderRight: "1px solid #2a2a33" }}></th>
              {COLS.map(col => (
                <th key={col} className="py-1.5 px-3 text-center text-zinc-500 font-bold" style={{ borderBottom: "1px solid #2a2a33", borderRight: "1px solid #2a2a33", minWidth: "80px" }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map(row => (
              <tr key={row}>
                <td className="py-1.5 text-center text-zinc-600 font-medium" style={{ background: "#1a1a22", borderBottom: "1px solid #1e1e28", borderRight: "1px solid #2a2a33" }}>
                  {row}
                </td>
                {COLS.map(col => {
                  const ref = `${col}${row}`;
                  const cell = cells[ref];
                  const isTarget = ref === challenge.targetCell;
                  const isActive = ref === activeCell;
                  const isPrefilled = !!challenge.initialData[ref];

                  return (
                    <td
                      key={ref}
                      onClick={() => handleCellClick(ref)}
                      className={`py-1.5 px-2 transition-all ${isPrefilled ? "cursor-default" : "cursor-pointer hover:bg-white/[0.02]"}`}
                      style={{
                        borderBottom: "1px solid #1e1e28",
                        borderRight: "1px solid #1e1e28",
                        background: isActive ? "rgba(99,102,241,0.1)" : isTarget ? "rgba(16,185,129,0.05)" : "transparent",
                        outline: isActive ? "2px solid #6366F1" : isTarget && !showSuccess ? "1px dashed rgba(16,185,129,0.3)" : "none",
                        outlineOffset: "-1px",
                      }}
                    >
                      {isActive ? (
                        <input
                          autoFocus
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") handleCellSubmit(); if (e.key === "Escape") setActiveCell(null); }}
                          onBlur={handleCellSubmit}
                          className="w-full bg-transparent outline-none text-indigo-300 font-mono text-[12px]"
                          style={{ caretColor: "#6366F1" }}
                        />
                      ) : (
                        <span className={`font-mono text-[12px] ${
                          cell?.isFormula ? "text-emerald-400" : isPrefilled ? "text-zinc-300" : "text-zinc-500"
                        }`}>
                          {cell?.display || ""}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Formula bar */}
      {activeCell && (
        <div className="px-4 py-2 flex items-center gap-2 text-[11px]" style={{ background: "#1a1a22", borderTop: "1px solid #2a2a33" }}>
          <span className="font-bold text-zinc-500">{activeCell}</span>
          <span className="text-zinc-600">=</span>
          <span className="text-indigo-300 font-mono">{editValue}</span>
        </div>
      )}

      {/* Success message */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-5 py-4 text-center" style={{ background: "rgba(16,185,129,0.08)", borderTop: "1px solid rgba(16,185,129,0.2)" }}
          >
            <div className="text-lg mb-1">🎉</div>
            <p className="text-sm font-bold text-emerald-400 mb-1">Correct!</p>
            <p className="text-[11px] text-zinc-500 mb-3">Your formula <code className="text-emerald-300 bg-emerald-500/10 px-1 rounded">{cells[challenge.targetCell]?.value}</code> = {cells[challenge.targetCell]?.display}</p>
            {currentChallenge < challenges.length - 1 && (
              <button
                onClick={nextChallenge}
                className="px-5 py-2 rounded-full text-[12px] font-bold text-white"
                style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}
              >
                Next Challenge →
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
