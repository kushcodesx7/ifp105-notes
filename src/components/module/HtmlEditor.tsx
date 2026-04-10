"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";

interface HtmlEditorProps {
  initialCode?: string;
  placeholder?: string;
}

export default function HtmlEditor({
  initialCode = "<!DOCTYPE html>\n<html>\n<head>\n  <title>My Page</title>\n</head>\n<body>\n  <h1>Hello World!</h1>\n  <p>Start coding here...</p>\n</body>\n</html>",
  placeholder = "Type your HTML here..."
}: HtmlEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [previewHtml, setPreviewHtml] = useState(initialCode);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [lineCount, setLineCount] = useState(1);
  const [mobileView, setMobileView] = useState<"code" | "preview">("code");

  const updatePreview = useCallback(() => {
    setPreviewHtml(code);
  }, [code]);

  // Auto-run on code change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => setPreviewHtml(code), 500);
    return () => clearTimeout(timer);
  }, [code]);

  // Update line numbers
  useEffect(() => {
    setLineCount(code.split("\n").length);
  }, [code]);

  function handleClear() {
    setCode("");
    setPreviewHtml("");
  }

  function handleReset() {
    setCode(initialCode);
    setPreviewHtml(initialCode);
  }

  // Handle tab key in textarea
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newCode = code.substring(0, start) + "  " + code.substring(end);
      setCode(newCode);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="my-6 rounded-2xl overflow-hidden"
      style={{ border: "1px solid #2a2a33", background: "#0d1117" }}
    >
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5" style={{ background: "#161b22", borderBottom: "1px solid #2a2a33" }}>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full" style={{ background: "#f85149" }} />
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full" style={{ background: "#d29922" }} />
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full" style={{ background: "#3fb950" }} />
        </div>
        <span className="text-[10px] sm:text-[11px] font-bold text-zinc-500 tracking-wider ml-1 sm:ml-2">HTML EDITOR</span>
        <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
          {/* Mobile view toggle */}
          <div className="flex md:hidden items-center rounded-md overflow-hidden" style={{ border: "1px solid #2a2a33" }}>
            <button
              onClick={() => setMobileView("code")}
              className="px-2 py-1 text-[10px] font-bold transition-all"
              style={{
                background: mobileView === "code" ? "#238636" : "transparent",
                color: mobileView === "code" ? "white" : "#8b949e",
              }}
            >
              Code
            </button>
            <button
              onClick={() => { setMobileView("preview"); updatePreview(); }}
              className="px-2 py-1 text-[10px] font-bold transition-all"
              style={{
                background: mobileView === "preview" ? "#238636" : "transparent",
                color: mobileView === "preview" ? "white" : "#8b949e",
              }}
            >
              Preview
            </button>
          </div>
          <button
            onClick={updatePreview}
            className="hidden sm:block px-3 py-1 rounded-md text-[11px] font-bold text-white transition-all hover:opacity-80"
            style={{ background: "linear-gradient(135deg, #238636, #2ea043)" }}
          >
            ▶ Run
          </button>
          <button
            onClick={handleClear}
            className="px-2 sm:px-3 py-1 rounded-md text-[10px] sm:text-[11px] font-bold transition-all hover:border-orange-500 hover:text-orange-400"
            style={{ background: "transparent", border: "1px solid #2a2a33", color: "#8b949e" }}
          >
            Clear
          </button>
          <button
            onClick={handleReset}
            className="px-2 sm:px-3 py-1 rounded-md text-[10px] sm:text-[11px] font-bold transition-all hover:border-cyan-500 hover:text-cyan-400"
            style={{ background: "transparent", border: "1px solid #2a2a33", color: "#8b949e" }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Split panes — desktop: side-by-side, mobile: tabbed */}
      <div className="flex flex-col md:flex-row" style={{ minHeight: "300px" }}>
        {/* Editor — always visible on desktop, toggled on mobile */}
        <div
          className={`flex-1 flex ${mobileView === "preview" ? "hidden md:flex" : "flex"}`}
          style={{ borderRight: "1px solid #2a2a33" }}
        >
          {/* Line numbers */}
          <div
            className="py-3 px-2 text-right select-none shrink-0 overflow-hidden"
            style={{ background: "#0d1117", color: "#484f58", fontSize: "12px", fontFamily: "'Fira Code', 'Menlo', monospace", lineHeight: "1.6", minWidth: "36px" }}
          >
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            spellCheck={false}
            className="flex-1 resize-none outline-none py-3 px-2"
            style={{
              background: "#0d1117",
              color: "#e6edf3",
              fontSize: "13px",
              fontFamily: "'Fira Code', 'Menlo', 'Courier New', monospace",
              lineHeight: "1.6",
              tabSize: 2,
              caretColor: "#58a6ff",
              border: "none",
              minHeight: "250px",
            }}
          />
        </div>

        {/* Preview — always visible on desktop, toggled on mobile */}
        <div
          className={`flex-1 flex flex-col ${mobileView === "code" ? "hidden md:flex" : "flex"}`}
          style={{ background: "#ffffff", minHeight: "250px" }}
        >
          <div className="px-3 py-1.5 flex items-center gap-2 shrink-0" style={{ background: "#161b22", borderBottom: "1px solid #2a2a33" }}>
            <span className="text-[10px] font-bold text-zinc-500 tracking-wider">PREVIEW</span>
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse ml-1" />
            <span className="text-[9px] text-zinc-600">Live</span>
          </div>
          <iframe
            ref={iframeRef}
            srcDoc={previewHtml}
            title="HTML Preview"
            className="flex-1 w-full"
            style={{ border: "none", background: "white", minHeight: "250px" }}
            sandbox=""
          />
        </div>
      </div>
    </motion.div>
  );
}
