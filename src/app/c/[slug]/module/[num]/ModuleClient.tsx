"use client";

import dynamic from "next/dynamic";
import ModulePage from "@/components/module/ModulePage";
import { useInlineEditMode } from "@/lib/use-inline-edit";
import type { Topic } from "@/types/content";

// Dynamic-import the inline editor so its JS doesn't ship on the
// student bundle. Same pattern as the per-module ICT client wrappers.
const InlineModuleEditor = dynamic(
  () => import("@/components/admin/InlineModuleEditor"),
  { ssr: false }
);

// Student-facing module view for NON-ICT courses. Generic: no
// per-module widgets (Excel simulator, HTML editor, etc.) — those are
// ICT-specific and live in the legacy /module/N routes. Python / Data
// Science / etc. render with just the topic content + MCQs, which is
// what their curriculum needs anyway.

interface Stat {
  n: string;
  l: string;
}

interface ModuleClientProps {
  courseSlug: string;
  courseCode: string;
  moduleNumber: number;
  moduleTitle: string;
  moduleSubtitle: string;
  moduleDescription: string;
  accent: string;
  topics: Topic[];
}

function pickOrbColors(hex: string): { c1: string; c2: string } {
  // Derive orb colors from the module accent by lowering alpha. Keeps
  // the hero visually coherent with each course's brand.
  const short = hex.startsWith("#") ? hex.slice(1) : hex;
  if (short.length !== 6) {
    return {
      c1: "rgba(99,102,241,0.15)",
      c2: "rgba(124,58,237,0.10)",
    };
  }
  const r = parseInt(short.slice(0, 2), 16);
  const g = parseInt(short.slice(2, 4), 16);
  const b = parseInt(short.slice(4, 6), 16);
  return {
    c1: `rgba(${r},${g},${b},0.15)`,
    c2: `rgba(${r},${g},${b},0.08)`,
  };
}

export default function ModuleClient({
  courseSlug,
  moduleNumber,
  moduleTitle,
  moduleSubtitle,
  moduleDescription,
  accent,
  topics,
}: ModuleClientProps) {
  const isEditing = useInlineEditMode();
  if (isEditing) {
    return (
      <InlineModuleEditor slug={courseSlug} moduleNumber={moduleNumber} />
    );
  }

  const { c1, c2 } = pickOrbColors(accent);
  const topicCount = topics.length;
  const stats: Stat[] = [
    { n: String(topicCount), l: "Topics" },
    { n: `~${topicCount * 5}`, l: "Minutes" },
    { n: String(topicCount * 7), l: "Practice Qs" },
  ];

  return (
    <ModulePage
      courseSlug={courseSlug}
      moduleNumber={moduleNumber}
      moduleTitle={moduleTitle}
      moduleSubtitle={moduleSubtitle}
      moduleDescription={moduleDescription}
      accentFrom={accent}
      accentTo="#7C3AED"
      orbColor1={c1}
      orbColor2={c2}
      topics={topics}
      stats={stats}
    />
  );
}
