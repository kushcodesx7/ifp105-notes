import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";
import { signPasswordSession } from "@/lib/password-session";
import { ipFromRequest, rateLimit, rateLimitResponse } from "@/lib/rate-limit";

// POST /api/auth/login-password
// Body: { enrollmentNo: string, password: string }
//
// The lab-friendly login path. A student walks up to a fresh computer
// in the lab, the Google session isn't cached, and they don't want to
// type their full Gmail address + password + 2FA. Instead:
//
//   "I'm 24-IFS-001, my password is hunter2" → 30-day session token
//
// The student must have:
//   1. Registered through the normal flow (so we have a student row
//      with their email + enrollment_no), and
//   2. Set up a quick-login password via /api/auth/set-password.
//
// Response shape mirrors the implicit Google login result:
//   { token, user: { name, email, enrollmentNo, ... } }
//
// The client stores `token` exactly like a Google ID token (in
// auth-context's idToken ref) and includes it as `x-id-token` on
// every subsequent request. Server-side `verifyGoogleIdToken` knows
// to fall through to the password-session verifier.

const RATE_PER_MIN = 10; // strict — slows brute-force without trapping legit retries

export async function POST(req: NextRequest) {
  const rl = await rateLimit({
    bucket: "auth:login-password",
    id: ipFromRequest(req),
    limit: RATE_PER_MIN,
    windowSec: 60,
  });
  if (!rl.ok) return rateLimitResponse(rl, RATE_PER_MIN);

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return Response.json({ error: "JSON body required" }, { status: 400 });
  }
  const enrollmentNo =
    typeof body.enrollmentNo === "string" ? body.enrollmentNo.trim() : "";
  const password =
    typeof body.password === "string" ? body.password : "";

  if (!enrollmentNo || !password) {
    return Response.json(
      { error: "enrollmentNo and password required" },
      { status: 400 }
    );
  }

  // Pull the student row by enrollment_no. Defensive: enrollment
  // numbers are unique per (batch, section) by constraint, but the
  // login flow doesn't know which batch the student is in. Multiple
  // matches across batches would be ambiguous → treat as auth fail.
  const { data: rows, error } = await supabase
    .from("students")
    .select("email, name, enrollment_no, password_hash")
    .eq("enrollment_no", enrollmentNo);

  if (error) {
    if (/column.*password_hash.*does not exist/i.test(error.message)) {
      return Response.json(
        {
          error:
            "Quick-login feature requires a DB migration. Run scripts/migration-add-student-password.sql.",
        },
        { status: 503 }
      );
    }
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Generic message — never reveal whether the enrollment number
  // exists. Stops attackers from enumerating the roll list.
  const FAIL_MSG = "Wrong enrollment number or password.";

  const matches = (rows || []).filter(
    (r) => (r as { password_hash: string | null }).password_hash
  );
  if (matches.length === 0) {
    return Response.json({ error: FAIL_MSG }, { status: 401 });
  }
  if (matches.length > 1) {
    // Same enrollment number across multiple batches with passwords
    // set — we can't pick. Tell the student to use Google instead.
    return Response.json(
      {
        error:
          "Multiple accounts share that enrollment number. Use Google sign-in instead.",
      },
      { status: 409 }
    );
  }

  const row = matches[0] as {
    email: string;
    name: string | null;
    enrollment_no: string;
    password_hash: string;
  };

  const ok = await bcrypt.compare(password, row.password_hash);
  if (!ok) {
    return Response.json({ error: FAIL_MSG }, { status: 401 });
  }

  let token: string;
  try {
    token = await signPasswordSession({
      email: row.email,
      name: row.name,
      enrollmentNo: row.enrollment_no,
    });
  } catch (e) {
    return Response.json(
      {
        error:
          (e as Error).message ||
          "Quick-login is not configured on this server.",
      },
      { status: 500 }
    );
  }

  return Response.json({
    token,
    user: {
      email: row.email,
      name: row.name || row.email.split("@")[0],
      enrollmentNo: row.enrollment_no,
    },
  });
}
