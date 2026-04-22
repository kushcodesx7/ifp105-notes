import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

// GET /api/broadcasts/latest
//
// Student-side poll endpoint. Returns the single most recent LIVE
// broadcast (if any), or null when nothing is active.
//
// "Live" means:
//   · action = 'broadcast'
//   · details.cancelledAt is null (not cancelled)
//   · details.expiresAt > now (not auto-expired)
//
// Shape:
//   { broadcast: null }
//   { broadcast: { id, message, moduleNumber, topicId, createdAt, expiresAt } }
//
// Public (no auth). Broadcasts are, by design, visible to every
// student — they're class-wide announcements, not personalised.
// Cached briefly at the CDN so ~220 students polling every 15s
// doesn't slam the DB; `revalidatePath` on the admin POST+DELETE
// keeps freshness on state changes.

export async function GET(_req: NextRequest) {
  // Pull recent broadcast rows. Order newest-first so the top hit is
  // the latest live one. Filter out cancelled + expired client-side
  // (JSONB filters are awkward in PostgREST; the row count is tiny).
  //
  // `.limit(20)` is a safety net — admin_actions rarely grows more
  // than one broadcast per class, but a runaway script could stack
  // many. Twenty is enough headroom without ever returning a huge
  // payload to a student poll.
  const { data, error } = await supabase
    .from("admin_actions")
    .select("id, created_at, details")
    .eq("action", "broadcast")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    // Migration pending or transient DB outage. Return null so the
    // banner component treats "no broadcast" as the safe default;
    // students don't see a mystery error.
    return Response.json(
      { broadcast: null, migrationPending: true },
      {
        headers: {
          // Short public cache so the next successful write bleeds
          // through fast.
          "Cache-Control": "public, max-age=5, stale-while-revalidate=30",
        },
      }
    );
  }

  const now = Date.now();
  type Row = {
    id: number;
    created_at: string;
    details: {
      message?: string;
      moduleNumber?: number | null;
      topicId?: number | null;
      expiresAt?: string | null;
      cancelledAt?: string | null;
    } | null;
  };

  const live = ((data ?? []) as Row[]).find((r) => {
    const d = r.details;
    if (!d || !d.message) return false;
    if (d.cancelledAt) return false;
    const expiresAt = d.expiresAt ? Date.parse(d.expiresAt) : NaN;
    if (!Number.isFinite(expiresAt)) return false;
    return expiresAt > now;
  });

  if (!live) {
    return Response.json(
      { broadcast: null },
      {
        headers: {
          "Cache-Control": "public, max-age=5, stale-while-revalidate=30",
        },
      }
    );
  }

  return Response.json(
    {
      broadcast: {
        id: live.id,
        message: live.details!.message!,
        moduleNumber: live.details!.moduleNumber ?? null,
        topicId: live.details!.topicId ?? null,
        createdAt: live.created_at,
        expiresAt: live.details!.expiresAt!,
      },
    },
    {
      headers: {
        // 5s public cache + 30s SWR. 220 students polling every 15s
        // hits the CDN, not the DB. revalidatePath on the admin
        // write-side keeps the state fresh on new broadcasts +
        // cancellations.
        "Cache-Control": "public, max-age=5, stale-while-revalidate=30",
      },
    }
  );
}
