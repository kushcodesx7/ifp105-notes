// Small helper: resize Google profile photo URLs to a specific pixel size.
//
// Google avatar URLs look like:
//   https://lh3.googleusercontent.com/a/ACg8oc...=s96-c
// The `=sNN-c` suffix is a documented param that returns an NN×NN square
// crop. Without it, the CDN defaults to ~400px — way more than we need
// for 32/48/64px chips and wastes 10-100× the bytes on every page that
// renders a list of students.
//
// Usage:
//   <img src={sizedAvatar(user.photo, 64)} width={64} height={64} ... />
//
// Non-Google URLs (our Supabase storage, arbitrary CDNs) pass through
// unchanged — we can't safely rewrite those.
export function sizedAvatar(
  url: string | null | undefined,
  pixels: number
): string {
  if (!url) return "";
  // Only rewrite known Google avatar hosts.
  if (!/(^|\.)googleusercontent\.com\//i.test(url)) return url;
  const size = Math.max(32, Math.min(512, Math.round(pixels)));
  // Strip any existing =sNN-... suffix, then append ours.
  const cleaned = url.replace(/=s\d+(-[a-z]+)?$/i, "");
  return `${cleaned}=s${size}-c`;
}
