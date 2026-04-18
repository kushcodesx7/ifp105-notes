import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/verify-google-token";
import { actorFromAuth, logAdminAction } from "@/lib/admin-audit";

// /api/batches/admin — all admin batch + roster operations.
// GET returns everything per batch: rolls + students (for the Roster page).
// POST takes an `action` field and dispatches.
//
// Phase 2b extensions:
//   - create-batch-full: atomic "wizard finish" — creates the batch plus
//     every section's rolls in one call.
//   - rename-section: updates section name in roll_list + students.
//   - delete-section: deletes every roll AND detaches every student in
//     that section (students stay in DB, their section_id is cleared).
//   - remove-rolls: bulk remove rolls from a section (for mistakes).
//
// All mutations are audit-logged.

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return admin.response;

  const { data: batches, error } = await supabase
    .from("batches")
    .select("id, name, accent, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const result = await Promise.all(
    (batches || []).map(async (batch) => {
      const { data: rolls } = await supabase
        .from("roll_list")
        .select("enrollment_no, section")
        .eq("batch_id", batch.id);

      const { data: students } = await supabase
        .from("students")
        .select("enrollment_no, name, email, section, linkedin_url, added_at")
        .eq("batch_id", batch.id)
        .order("added_at", { ascending: true });

      return {
        id: batch.id,
        name: batch.name,
        accent: batch.accent,
        createdAt: batch.created_at,
        rolls: (rolls || []).map((r) => ({
          enrollmentNo: r.enrollment_no,
          section: (r as { section?: string | null }).section || "Section 1",
        })),
        students: (students || []).map((s) => ({
          enrollmentNo: s.enrollment_no,
          name: s.name,
          email: s.email,
          section: (s as { section?: string | null }).section || "Section 1",
          linkedinUrl: s.linkedin_url,
          addedAt: s.added_at,
        })),
      };
    })
  );

  return Response.json({ batches: result });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return admin.response;

  const body = await req.json();
  const { action } = body;
  const actor = actorFromAuth(admin);

  switch (action) {
    // ── Legacy single-action helpers (kept for compatibility) ──
    case "add-batch": {
      const { id, name, accent } = body;
      if (!id || !name) {
        return Response.json({ error: "Batch id and name required" }, { status: 400 });
      }
      const { error } = await supabase.from("batches").insert({
        id,
        name,
        accent: accent || "#6366F1",
      });
      if (error) {
        if (error.code === "23505") {
          return Response.json({ error: "Batch already exists" }, { status: 400 });
        }
        return Response.json({ error: error.message }, { status: 500 });
      }
      await logAdminAction({
        actorEmail: actor,
        action: "create_batch",
        subjectBatchId: id,
        details: { name, accent: accent || "#6366F1" },
      });
      return Response.json({ success: true });
    }

    case "add-rolls": {
      const { batchId, section, rolls } = body;
      const sec = section || "Section 1";

      // Accept BOTH shapes: plain string[] (legacy upload flow, paste-a-list
      // textarea in the roster UI) AND {enrollment_no, name}[] (new upload
      // script). Normalize to the richer shape internally so the rest of
      // the case is shape-agnostic.
      const rowsInput = Array.isArray(rolls) ? (rolls as unknown[]) : [];
      const newRolls = rowsInput
        .map((r) => {
          if (typeof r === "string") {
            return { enrollment_no: r.trim().toUpperCase(), name: null as string | null };
          }
          if (r && typeof r === "object") {
            const obj = r as { enrollment_no?: unknown; name?: unknown };
            const eno =
              typeof obj.enrollment_no === "string"
                ? obj.enrollment_no.trim().toUpperCase()
                : "";
            const nm = typeof obj.name === "string" ? obj.name.trim() : null;
            return { enrollment_no: eno, name: nm || null };
          }
          return { enrollment_no: "", name: null };
        })
        .filter((r) => r.enrollment_no)
        .map((r) => ({
          batch_id: batchId,
          section: sec,
          enrollment_no: r.enrollment_no,
          name: r.name,
        }));

      // Primary attempt: upsert with names. If the roll_list.name column
      // doesn't exist yet (migration pending), retry without it so add-rolls
      // keeps working — same graceful-degrade pattern as the bloom_stats
      // retry in /api/progress.
      let { error } = await supabase
        .from("roll_list")
        .upsert(newRolls, { onConflict: "batch_id,section,enrollment_no" });

      if (error && /column.*name.*does not exist|PGRST204|roll_list.*name/i.test(error.message)) {
        console.warn(
          "[add-rolls] roll_list.name column missing — retrying without names. Run migration-add-roll-list-name.sql."
        );
        const withoutName = newRolls.map((r) => ({
          batch_id: r.batch_id,
          section: r.section,
          enrollment_no: r.enrollment_no,
        }));
        ({ error } = await supabase
          .from("roll_list")
          .upsert(withoutName, { onConflict: "batch_id,section,enrollment_no" }));
      }

      if (error) {
        return Response.json({ error: error.message }, { status: 500 });
      }
      await logAdminAction({
        actorEmail: actor,
        action: "add_rolls",
        subjectBatchId: batchId,
        subjectSection: sec,
        details: { count: newRolls.length, rolls: newRolls.map((r) => r.enrollment_no) },
      });
      return Response.json({ success: true, count: newRolls.length });
    }

    case "delete-student": {
      const { batchId: bid, enrollmentNo } = body;
      const roll = String(enrollmentNo).toUpperCase();
      // Fetch the victim's email FIRST so we can record it in the audit trail.
      // Without this step the audit log can't answer "who was deleted?".
      const { data: victim } = await supabase
        .from("students")
        .select("email, name, section")
        .eq("batch_id", bid)
        .eq("enrollment_no", roll)
        .maybeSingle();

      const { error } = await supabase
        .from("students")
        .delete()
        .eq("batch_id", bid)
        .eq("enrollment_no", roll);

      if (error) {
        return Response.json({ error: error.message }, { status: 500 });
      }
      await logAdminAction({
        actorEmail: actor,
        action: "delete_student",
        subjectEmail: victim?.email ?? null,
        subjectBatchId: bid,
        subjectSection: victim?.section ?? null,
        details: {
          enrollmentNo: roll,
          name: victim?.name ?? null,
        },
      });
      return Response.json({ success: true });
    }

    case "delete-roll": {
      const { batchId: bid, section, enrollmentNo } = body;
      if (!bid || !enrollmentNo) {
        return Response.json(
          { error: "batchId and enrollmentNo required" },
          { status: 400 }
        );
      }
      let query = supabase
        .from("roll_list")
        .delete()
        .eq("batch_id", bid)
        .eq("enrollment_no", enrollmentNo.toUpperCase());
      if (section) query = query.eq("section", section);
      const { error } = await query;
      if (error) {
        return Response.json({ error: error.message }, { status: 500 });
      }
      await logAdminAction({
        actorEmail: actor,
        action: "remove_rolls",
        subjectBatchId: bid,
        subjectSection: section ?? null,
        details: { rolls: [enrollmentNo.toUpperCase()], count: 1 },
      });
      return Response.json({ success: true });
    }

    // ── Phase 2b: atomic wizard create ────────────────────────
    case "create-batch-full": {
      const { id, name, accent, sections } = body as {
        id: string;
        name: string;
        accent?: string;
        sections: { name: string; rolls: string[] }[];
      };

      if (!id || !name || !Array.isArray(sections)) {
        return Response.json(
          { error: "id, name, and sections[] required" },
          { status: 400 }
        );
      }

      // Create the batch first
      const { error: batchErr } = await supabase.from("batches").insert({
        id,
        name,
        accent: accent || "#6366F1",
      });
      if (batchErr) {
        if (batchErr.code === "23505") {
          return Response.json(
            { error: `Batch '${id}' already exists.` },
            { status: 400 }
          );
        }
        return Response.json({ error: batchErr.message }, { status: 500 });
      }

      // Upsert all rolls
      let totalRolls = 0;
      for (const sec of sections) {
        const secName = (sec.name || "").trim() || "Section 1";
        const rollRows = (sec.rolls || [])
          .map((r) => r.trim().toUpperCase())
          .filter(Boolean)
          .map((enrollment_no) => ({
            batch_id: id,
            section: secName,
            enrollment_no,
          }));
        if (rollRows.length === 0) continue;
        const { error: rollErr } = await supabase
          .from("roll_list")
          .upsert(rollRows, {
            onConflict: "batch_id,section,enrollment_no",
          });
        if (rollErr) {
          return Response.json(
            {
              error: `Batch created but adding rolls failed for ${secName}: ${rollErr.message}`,
            },
            { status: 500 }
          );
        }
        totalRolls += rollRows.length;
      }

      await logAdminAction({
        actorEmail: actor,
        action: "create_batch",
        subjectBatchId: id,
        details: {
          name,
          accent: accent || "#6366F1",
          totalSections: sections.length,
          totalRolls,
          sectionCounts: sections.map((s) => ({
            name: s.name,
            rolls: (s.rolls || []).length,
          })),
        },
      });

      return Response.json({ success: true, totalRolls });
    }

    // ── Phase 2b: bulk remove rolls ──────────────────────────
    case "remove-rolls": {
      const { batchId, section, rolls } = body as {
        batchId: string;
        section: string;
        rolls: string[];
      };
      if (!batchId || !section || !Array.isArray(rolls) || rolls.length === 0) {
        return Response.json(
          { error: "batchId, section, and rolls[] required" },
          { status: 400 }
        );
      }
      const upperRolls = rolls.map((r) => r.toUpperCase().trim()).filter(Boolean);
      const { error } = await supabase
        .from("roll_list")
        .delete()
        .eq("batch_id", batchId)
        .eq("section", section)
        .in("enrollment_no", upperRolls);

      if (error) return Response.json({ error: error.message }, { status: 500 });

      await logAdminAction({
        actorEmail: actor,
        action: "remove_rolls",
        subjectBatchId: batchId,
        subjectSection: section,
        details: { count: upperRolls.length, rolls: upperRolls },
      });
      return Response.json({ success: true, count: upperRolls.length });
    }

    // ── Phase 2b: rename a section ───────────────────────────
    // Updates section name in roll_list AND students so registered
    // students stay linked to the same (renamed) section.
    case "rename-section": {
      const { batchId, oldName, newName } = body as {
        batchId: string;
        oldName: string;
        newName: string;
      };
      if (!batchId || !oldName || !newName) {
        return Response.json(
          { error: "batchId, oldName, and newName required" },
          { status: 400 }
        );
      }
      if (oldName === newName) {
        return Response.json({ error: "Old and new names are identical" }, { status: 400 });
      }

      // Check that newName isn't already in use in this batch
      const { count: clashCount } = await supabase
        .from("roll_list")
        .select("id", { head: true, count: "exact" })
        .eq("batch_id", batchId)
        .eq("section", newName);
      if ((clashCount || 0) > 0) {
        return Response.json(
          { error: `A section named '${newName}' already has roll entries in this batch.` },
          { status: 400 }
        );
      }

      const { error: rErr } = await supabase
        .from("roll_list")
        .update({ section: newName })
        .eq("batch_id", batchId)
        .eq("section", oldName);
      if (rErr) return Response.json({ error: rErr.message }, { status: 500 });

      await supabase
        .from("students")
        .update({ section: newName })
        .eq("batch_id", batchId)
        .eq("section", oldName);

      await logAdminAction({
        actorEmail: actor,
        action: "rename_section",
        subjectBatchId: batchId,
        subjectSection: newName,
        details: { from: oldName, to: newName },
      });
      return Response.json({ success: true });
    }

    // ── Phase 2b: delete a section ──────────────────────────
    // Removes every roll in the section AND detaches every registered
    // student from it (students row stays, section cleared to blank so
    // they become orphans). Teacher can then re-assign or unlink them.
    case "delete-section": {
      const { batchId, section } = body as {
        batchId: string;
        section: string;
      };
      if (!batchId || !section) {
        return Response.json(
          { error: "batchId and section required" },
          { status: 400 }
        );
      }

      // Atomic path: delegate to the admin_delete_section RPC so the
      // roll_list delete + students.section-nulling run inside a
      // single Postgres transaction. Before the RPC the two
      // statements were sequential, so a failure of the second left
      // students stuck in a section that no longer existed in the
      // roll list. Falls back to the legacy sequential path if the
      // migration hasn't been applied yet.
      const { data: rpcResult, error: rpcErr } = await supabase.rpc(
        "admin_delete_section",
        { p_batch_id: batchId, p_section: section }
      );

      let removedRolls: number;
      let detachedStudents: number;

      if (!rpcErr && rpcResult) {
        const r = rpcResult as {
          rolls_removed?: number;
          students_detached?: number;
        };
        removedRolls = r.rolls_removed ?? 0;
        detachedStudents = r.students_detached ?? 0;
      } else {
        const migrationPending =
          rpcErr &&
          /function.*admin_delete_section.*does not exist|PGRST202/i.test(
            rpcErr.message
          );
        if (rpcErr && !migrationPending) {
          return Response.json({ error: rpcErr.message }, { status: 500 });
        }
        if (migrationPending) {
          console.warn(
            "[delete-section] admin_delete_section RPC missing — falling back to non-atomic sequential path. Run migration-admin-atomic-rpcs.sql."
          );
        }

        // Count before delete for audit (legacy path).
        const { count: rollCount } = await supabase
          .from("roll_list")
          .select("id", { head: true, count: "exact" })
          .eq("batch_id", batchId)
          .eq("section", section);

        const { count: studentCount } = await supabase
          .from("students")
          .select("email", { head: true, count: "exact" })
          .eq("batch_id", batchId)
          .eq("section", section);

        const { error: rErr } = await supabase
          .from("roll_list")
          .delete()
          .eq("batch_id", batchId)
          .eq("section", section);
        if (rErr)
          return Response.json({ error: rErr.message }, { status: 500 });

        await supabase
          .from("students")
          .update({ section: null })
          .eq("batch_id", batchId)
          .eq("section", section);

        removedRolls = rollCount || 0;
        detachedStudents = studentCount || 0;
      }

      await logAdminAction({
        actorEmail: actor,
        action: "delete_section",
        subjectBatchId: batchId,
        subjectSection: section,
        details: {
          removedRolls,
          detachedStudents,
        },
      });

      return Response.json({
        success: true,
        removedRolls,
        detachedStudents,
      });
    }

    default:
      return Response.json({ error: "Unknown action" }, { status: 400 });
  }
}
