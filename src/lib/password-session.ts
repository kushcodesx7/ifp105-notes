// Password-session JWT helper.
//
// When a student logs in with their enrollment + password (the "quick
// login" path that bypasses Google OAuth), the server signs a JWT
// containing { email, name, sub } and hands it to the client. The
// client stores it like a Google ID token; every authenticated
// endpoint then accepts EITHER kind via the existing `requireAuth`
// helper (see verify-google-token.ts which delegates here on failure).
//
// This is a parallel auth path, not a replacement — Google login still
// works the same way for students who haven't opted in.
//
// Security:
//   - Tokens are signed with HS256 using PASSWORD_SESSION_SECRET (set
//     in Vercel env). If the secret leaks, rotate it and all sessions
//     invalidate immediately.
//   - 30-day expiry. Short enough that a stolen token doesn't outlive
//     the semester; long enough that students don't re-auth daily.
//   - The `sub` claim is `pwd:<enrollment_no>` so it can never collide
//     with a Google `sub` (which is a numeric string).

import { SignJWT, jwtVerify } from "jose";

const SECRET = process.env.PASSWORD_SESSION_SECRET || "";
const ISSUER = "ifp105-notes";
const AUDIENCE = "ifp105-notes";

function getKey(): Uint8Array {
  if (!SECRET) {
    throw new Error(
      "PASSWORD_SESSION_SECRET env var is required for password-session JWTs. Set it in Vercel."
    );
  }
  return new TextEncoder().encode(SECRET);
}

export interface PasswordSessionPayload {
  email: string;
  name: string | null;
  enrollmentNo: string;
}

/**
 * Issue a password-session JWT. Called from /api/auth/login-password
 * after a successful enrollment + password match.
 */
export async function signPasswordSession(
  payload: PasswordSessionPayload
): Promise<string> {
  const jwt = await new SignJWT({
    email: payload.email,
    name: payload.name,
    enrollmentNo: payload.enrollmentNo,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(`pwd:${payload.enrollmentNo}`)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getKey());
  return jwt;
}

/**
 * Verify a token. Returns the payload on success, null on any failure
 * (expired, wrong signature, malformed, etc.). Mirrors the
 * verifyGoogleIdToken contract so the verify chain in
 * verify-google-token.ts can short-circuit cleanly.
 */
export async function verifyPasswordSession(
  token: string | null | undefined
): Promise<{
  email: string;
  name: string | undefined;
  picture: undefined;
  sub: string;
} | null> {
  if (!token || typeof token !== "string") return null;
  if (!SECRET) return null;
  try {
    const { payload } = await jwtVerify(token, getKey(), {
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    if (!payload.email || typeof payload.email !== "string") return null;
    if (!payload.sub || typeof payload.sub !== "string") return null;
    return {
      email: payload.email,
      name: typeof payload.name === "string" ? payload.name : undefined,
      picture: undefined,
      sub: payload.sub,
    };
  } catch {
    // Expired, bad signature, malformed — all map to "not a valid
    // session". The caller falls through to other auth paths.
    return null;
  }
}
