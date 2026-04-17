import { OAuth2Client } from "google-auth-library";

// Verifies a Google ID token (JWT) against our configured client ID.
// Returns the verified email if valid, null if not.
//
// How the frontend sends this: the Google Sign-In button gives us a
// `credential` (ID token JWT) in handleGoogleSuccess. We stash it in
// auth context as `idToken` and include it as `x-id-token` on writes.

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
  if (!CLIENT_ID) {
    // No client ID configured → can't verify → fail closed
    console.error("[auth] NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set");
    return null;
  }
  try {
    const ticket = await getClient().verifyIdToken({
      idToken,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email || !payload.sub) return null;
    // Require the email to be verified by Google (not just claimed).
    if (payload.email_verified === false) return null;
    return {
      email: payload.email.toLowerCase(),
      name: payload.name,
      picture: payload.picture,
      sub: payload.sub,
    };
  } catch {
    return null;
  }
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
