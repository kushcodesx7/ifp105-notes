// Display-name helpers shared across Connect, the Home widgets, and
// the Admin drawer.
//
// Why here: these were duplicated in 5+ places (connect page,
// HomeConnectGlimpse, HomeActivityStrip, admin/people, StudentDrawer,
// batches/[batchId]). Each had subtle differences in how they parsed
// roll-prefixed names like "248_Oysha" and whether they handled
// "IFS4_221_Sherzodbek" correctly. Consolidating here prevents drift.

/**
 * Strip the legacy roll-number prefix from a student's display name.
 *
 * Names are often stored as `${last3OfRoll}_${firstName}` (the format
 * the RegistrationModal auto-builds), e.g. "248_Oysha". Older records
 * can also include institution tokens like "IFS4_221_Sherzodbek".
 *
 * Returns the first non-numeric, non-institution segment joined back
 * together. Falls back to the raw input if parsing yields nothing.
 */
export function prettyName(raw: string | null | undefined): string {
  if (!raw) return "Unknown";
  const parts = raw.split("_").filter(Boolean);
  // Drop purely-numeric tokens ("248") and institution markers ("IFS", "IFS4").
  const nameParts = parts.filter(
    (p) => !/^\d+$/.test(p) && !/^IFS\d*$/i.test(p)
  );
  return nameParts.length > 0 ? nameParts.join(" ") : raw;
}

/**
 * Generate up-to-2-character initials for avatar fallbacks. Runs
 * `prettyName` first so "248_Oysha Karimova" returns "OK", not "2K".
 */
export function initials(name: string | null | undefined): string {
  const pretty = prettyName(name);
  return pretty
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");
}

/**
 * Extract just the first token after prettyName — useful for casual
 * greetings ("Hi Oysha!" rather than "Hi Oysha Karimova!").
 */
export function firstName(raw: string | null | undefined): string {
  const pretty = prettyName(raw);
  const [first] = pretty.split(/\s+/).filter(Boolean);
  return first || pretty;
}
