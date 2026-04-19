import { OAuth2Client } from "google-auth-library";
import { verifyPasswordSession } from "@/lib/password-session";

// Verifies a Google ID token (JWT) against our configured client ID,
// OR a password-session JWT issued by /api/auth/login-password. Both
// paths land here and resolve to the same VerifiedUser shape so every
// downstream auth gate (`requireAuth`, `requireSelf`, `requireAdmin`)
// works identically regardless of which login the student used.
//
// How the frontend sends this: the Google Sign-In button gives us a
// `credential` (ID token JWT) in handleGoogleSuccess. We stash it in
// auth context as `idToken` and include it as `x-id-token` on writes.
// Password-session tokens use the same header — the client doesn't
// need to know which kind it has.

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

let client: OAuth2Client | null = null;
function getClient() {
  if (!client) client = new OAuth2Client(CLIENT_ID);
  return client;
}

export interface VerifiedUser {
  email: string;
  name: string | undefined;
  picture: string | undefined;
  sub: string; // stable Google user id
}

/**
 * Verify an ID token. Returns the verified user on success, null on failure.
 * Failure modes include: wrong audience, expired token, invalid signature,
 * or malformed input.
 */
export async function verifyGoogleIdToken(
  idToken: string | null | undefined
): Promise<VerifiedUser | null> {
  if (!idToken || typeof idToken !== "string") return null;

  // Two verifier paths, tried in order. Both produce the same
  // VerifiedUser shape so the rest of the codebase doesn't care which
  // one matched.
  //
  // 1. Google ID token (the historical path — every Google sign-in)
  // 2. Password-session JWT (issued by /api/auth/login-password for
  //    students who set up a quick-login password)
  //
  // Order matters for performance: Google's JWKS verify involves an
  // outbound HTTP call (cached internally by google-auth-library) so
  // it's slightly more expensive than the local HMAC check. But the
  // overwhelming majority of tokens in flight are Google's, so trying
  // it first avoids a wasted password-session check on every request.

  if (CLIENT_ID) {
    try {
      const ticket = await getClient().verifyIdToken({
        idToken,
        audience: CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (payload && payload.email && payload.sub) {
        // Belt-and-braces: google-auth-library verifies the JWKS signature
        // but doesn't explicitly enforce the issuer claim. Pin it to avoid
        // accepting any other identity provider that happened to sign a
        // JWT with a matching audience.
        if (
          (payload.iss === "https://accounts.google.com" ||
            payload.iss === "accounts.google.com") &&
          payload.email_verified !== false
        ) {
          return {
            email: payload.email.toLowerCase(),
            name: payload.name,
            picture: payload.picture,
            sub: payload.sub,
          };
        }
      }
    } catch {
      // Not a valid Google token — fall through to the password
      // session path below. The fall-through is the whole point of
      // having two verifiers.
    }
  } else {
    console.error("[auth] NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set");
  }

  // Password-session fallback. Pure-local HMAC check — no network.
  const pwd = await verifyPasswordSession(idToken);
  if (pwd && pwd.email) {
    return {
      email: pwd.email.toLowerCase(),
      name: pwd.name,
      picture: pwd.picture,
      sub: pwd.sub,
    };
  }

  return null;
}

/**
 * Verify that the caller's token matches the email they claim to own.
 * Use on any endpoint that mutates a specific user's data (e.g. profile edit).
 *
 * Returns the verified email on success, a Response with 401/403 on failure
 * that the route can return directly.
 */
export async function requireSelf(
  req: Request,
  claimedEmail: string | undefined | null
): Promise<{ ok: true; email: string } | { ok: false; response: Response }> {
  const idToken = req.headers.get("x-id-token");
  const verified = await verifyGoogleIdToken(idToken);
  if (!verified) {
    return {
      ok: false,
      response: Response.json(
        { error: "Not signed in or token expired" },
        { status: 401 }
      ),
    };
  }
  if (
    !claimedEmail ||
    typeof claimedEmail !== "string" ||
    claimedEmail.toLowerCase() !== verified.email
  ) {
    return {
      ok: false,
      response: Response.json(
        { error: "You can only update your own profile" },
        { status: 403 }
      ),
    };
  }
  return { ok: true, email: verified.email };
}

/**
 * Like requireSelf but for endpoints that don't take an email in the body —
 * they just need to know who the caller is (e.g. "my progress").
 */
export async function requireAuth(
  req: Request
): Promise<{ ok: true; user: VerifiedUser } | { ok: false; response: Response }> {
  const idToken = req.headers.get("x-id-token");
  const verified = await verifyGoogleIdToken(idToken);
  if (!verified) {
    return {
      ok: false,
      response: Response.json(
        { error: "Not signed in or token expired" },
        { status: 401 }
      ),
    };
  }
  return { ok: true, user: verified };
}

/**
 * Admin auth — accepts EITHER:
 *  - a valid Google ID token whose email is in the admin allowlist
 *  - the legacy admin password header (x-admin-password)
 *
 * On success returns the admin identity so endpoints can log actions
 * with attribution. When auth came via password we report viaPassword=true
 * and email=null; audit code turns that into a "password-admin" label.
 *
 * The allowlist is imported lazily to avoid a circular dep with src/lib/admins.
 */
export async function requireAdmin(
  req: Request
): Promise<
  | { ok: true; email: string | null; viaPassword: boolean }
  | { ok: false; response: Response }
> {
  // 1. Try Google ID token first
  const idToken = req.headers.get("x-id-token");
  if (idToken) {
    const verified = await verifyGoogleIdToken(idToken);
    if (verified) {
      const { isAdminEmail } = await import("./admins");
      if (isAdminEmail(verified.email)) {
        return { ok: true, email: verified.email, viaPassword: false };
      }
    }
  }

  // 2. Fall back to the shared admin password (legacy)
  const pw = req.headers.get("x-admin-password");
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminPassword && pw === adminPassword) {
    return { ok: true, email: null, viaPassword: true };
  }

  return {
    ok: false,
    response: Response.json({ error: "Unauthorized" }, { status: 401 }),
  };
}
