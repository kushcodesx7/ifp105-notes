// Admin email allowlist — these users see the Admin button in the navbar
// instead of the Register prompt, and bypass the registration flow.
export const ADMIN_EMAILS: string[] = [
  "kushcodesx7@gmail.com",
];

export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}
