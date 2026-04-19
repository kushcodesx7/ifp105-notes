import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";
import { requireAuth } from "@/lib/verify-google-token";
import { ipFromRequest, rateLimit, rateLimitResponse } from "@/lib/rate-limit";

// POST /api/auth/set-password
// Body: { password: string }
//
// Lets the authenticated student create / change their quick-login
// password. The password gets bcrypt-hashed (cost 10) and bound to
// their student row by email. After this the student can log in via
// /api/auth/login-password using their enrollment number + password
// instead of going through the full Google OAuth flow.
//
// Auth: requires an existing valid session (Google OR previous
// password-session JWT). This means the student must have logged in
// with Google AT LEAST ONCE before opting into the quick-login —
// which is the binding moment between Google identity and the local
// password account.
//
// Rate limit: 5 sets per hour per IP. Stops both casual abuse and
// password-cycling attacks.

const MIN_PASSWORD_LENGTH = 6;
const MAX_PASSWORD_LENGTH = 200;
const BCRYPT_COST = 10;

export async function POST(req: NextRequest) {
  const rl = await rateLimit({
    bucket: "auth:set-password",
    id: ipFromRequest(req),
    limit: 5,
    windowSec: 3600,
  });
  if (!rl.ok) return rateLimitResponse(rl, 5);

  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return Response.json({ error: "JSON body required" }, { status: 400 });
  }
  const password = typeof body.password === "string" ? body.password : "";
  if (password.length < MIN_PASSWORD_LENGTH) {
    return Response.json(
      { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` },
      { status: 400 }
    );
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return Response.json(
      { error: "Password is too long." },
      { status: 400 }
    );
  }

  // Confirm the student row exists. Without it we can't bind the
  // password to anything (and login-with-password would never find a
  // match anyway).
  const { data: student, error: readErr } = await supabase
    .from("students")
    .select("email, enrollment_no")
    .eq("email", auth.user.email)
    .maybeSingle();
  if (readErr) {
    return Response.json({ error: readErr.message }, { status: 500 });
  }
  if (!student) {
    return Response.json(
      { error: "You need to register (pick a batch + enrollment number) before setting a quick-login password." },
      { status: 404 }
    );
  }

  const hash = await bcrypt.hash(password, BCRYPT_COST);
  const { error: writeErr } = await supabase
    .from("students")
    .update({
      password_hash: hash,
      password_set_at: new Date().toISOString(),
    })
    .eq("email", auth.user.email);

  if (writeErr) {
    if (/column.*password_hash.*does not exist/i.test(writeErr.message)) {
      return Response.json(
        {
          error:
            "Quick-login password feature requires a DB migration. Run scripts/migration-add-student-password.sql.",
        },
        { status: 503 }
      );
    }
    return Response.json({ error: writeErr.message }, { status: 500 });
  }

  return Response.json({ ok: true, enrollmentNo: student.enrollment_no });
}
