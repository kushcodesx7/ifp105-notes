"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Minimal toast primitive for admin mutations.
// Usage:
//   const { toast } = useToast();
//   toast({ kind: "success", message: "Student updated" });
//
// Stacks in the top-right. Each toast auto-dismisses after 3s (configurable).
// No new dependencies — framer-motion is already in the bundle.

export type ToastKind = "success" | "error" | "info";

interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
  duration: number;
}

interface ToastContextValue {
  toast: (t: { kind?: ToastKind; message: string; duration?: number }) => void;
}

const ToastContext = createContext<ToastContextValue>({
  toast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback(
    ({
      kind = "info",
      message,
      duration = 3000,
    }: {
      kind?: ToastKind;
      message: string;
      duration?: number;
    }) => {
      const id = Date.now() + Math.random();
      setItems((prev) => [...prev, { id, kind, message, duration }]);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none max-w-[calc(100vw-2rem)]">
        <AnimatePresence>
          {items.map((t) => (
            <ToastCard
              key={t.id}
              item={t}
              onDone={() =>
                setItems((prev) => prev.filter((x) => x.id !== t.id))
              }
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({
  item,
  onDone,
}: {
  item: ToastItem;
  onDone: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onDone, item.duration);
    return () => clearTimeout(timer);
  }, [item.duration, onDone]);

  const styles = {
    success: {
      bg: "rgba(16,185,129,0.12)",
      border: "rgba(16,185,129,0.4)",
      color: "#6ee7b7",
      icon: "✓",
    },
    error: {
      bg: "rgba(239,68,68,0.12)",
      border: "rgba(239,68,68,0.4)",
      color: "#fca5a5",
      icon: "✗",
    },
    info: {
      bg: "rgba(99,102,241,0.12)",
      border: "rgba(99,102,241,0.4)",
      color: "#a5b4fc",
      icon: "i",
    },
  }[item.kind];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="pointer-events-auto min-w-[240px] max-w-sm rounded-xl px-4 py-3 backdrop-blur-xl"
      style={{
        background: styles.bg,
        border: `1px solid ${styles.border}`,
        color: styles.color,
        boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
      }}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-2.5 text-sm">
        <span
          className="shrink-0 font-bold inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px]"
          style={{ background: styles.border, color: "white" }}
        >
          {styles.icon}
        </span>
        <span className="leading-relaxed">{item.message}</span>
      </div>
    </motion.div>
  );
}
