import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/verify-google-token";

// GET /api/broadcasts/active
//
// Admin-side list of broadcasts the teacher might want to cancel or
// audit. Returns every broadcast from the last 24h regardless of
// live/cancelled/expired status — the admin UI renders state badges.
// Separate from the student-facing /api/broadcasts/latest so neither
// payload has to bend to fit both audiences.
//
// Auth: admin only. A student viewing the history of what's been
// announced adds no value and leaks minor info about classroom flow.

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return admin.response;

  const cutoffIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("admin_actions")
    .select("id, actor_email, created_at, details")
    .eq("action", "broadcast")
    .gte("created_at", cutoffIso)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return Response.json(
      { broadcasts: [], migrationPending: true },
      { status: 200 }
    );
  }

  const now = Date.now();
  type Row = {
    id: number;
    actor_email: string;
    created_at: string;
    details: {
      message?: string;
      moduleNumber?: number | null;
      topicId?: number | null;
      expiresAt?: string | null;
      cancelledAt?: string | null;
      ttlMinutes?: number | null;
    } | null;
  };

  const broadcasts = ((data ?? []) as Row[]).map((r) => {
    const d = r.details ?? {};
    const expiresAt = d.expiresAt ?? null;
    const cancelledAt = d.cancelledAt ?? null;
    const expiredMs = expiresAt ? Date.parse(expiresAt) : NaN;
    const isLive =
      !cancelledAt && Number.isFinite(expiredMs) && expiredMs > now;
    return {
      id: r.id,
      actorEmail: r.actor_email,
      createdAt: r.created_at,
      message: d.message ?? "",
      moduleNumber: d.moduleNumber ?? null,
      topicId: d.topicId ?? null,
      expiresAt,
      cancelledAt,
      ttlMinutes: d.ttlMinutes ?? null,
      // UI-friendly status so the admin card doesn't re-derive it.
      status: cancelledAt
        ? ("cancelled" as const)
        : isLive
          ? ("live" as const)
          : ("expired" as const),
    };
  });

  return Response.json(
    { broadcasts },
    {
      headers: {
        // Admin-only; private short cache avoids a burst of polls
        // during the teacher's own rapid clicks.
        "Cache-Control": "private, max-age=5",
      },
    }
  );
}
