// Client-side JWT payload decoder.
//
// Google's ID tokens are JWTs whose middle segment is a base64url-encoded
// JSON object containing `email`, `name`, `picture`, etc. On the CLIENT
// we only need these fields for display and optimistic UI — we never
// trust a locally-decoded JWT for authorization. The server always
// re-verifies via `verifyGoogleIdToken()` in lib/verify-google-token.ts
// before accepting anything the client sends.
//
// Previously duplicated inline in 5 files: Navbar.tsx, RegistrationModal.tsx,
// LoginPrompt.tsx, profile/edit/page.tsx, batches/[batchId]/page.tsx.
// Now one import.

export interface GoogleJwtPayload {
  email?: string;
  name?: string;
  picture?: string;
  sub?: string;
  iss?: string;
  aud?: string;
  iat?: number;
  exp?: number;
  email_verified?: boolean;
  // Google also sends given_name / family_name / locale — rarely needed.
  [key: string]: unknown;
}

/**
 * Decode a Google ID token's payload WITHOUT verifying the signature.
 * Returns null if the token is malformed. Do NOT use for auth decisions;
 * server-side verification is mandatory.
 */
export function decodeJwt(token: string): GoogleJwtPayload | null {
  try {
    const segments = token.split(".");
    if (segments.length < 2) return null;
    const base64 = segments[1];
    const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as GoogleJwtPayload;
  } catch {
    return null;
  }
}
