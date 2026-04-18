# IFP105 Launch Checklist

Last pre-launch pass for 218-student rollout. Code-side fixes are on branch
`feature/launch-audit-fixes` (PR #75). These are the steps that **must be
done by hand** — no agent can execute them — before Monday.

---

## 1. Merge the audit-fixes PR

PR: https://github.com/kushcodesx7/ifp105-notes/pull/75

- [ ] Open the Vercel preview deployment from the PR
- [ ] Smoke test: home → module 1 → complete a quiz → check Bloom's profile
- [ ] Sign out, then in DevTools hit `/api/progress?email=someone@example.com&module=1` — expect 401
- [ ] Sign out, hit `/api/students/check?email=test@x.com` — expect 401
- [ ] Admin People → keyboard-Tab to a row → press Enter → drawer opens
- [ ] Admin People → delete a student → audit log (under Tools) shows the entry
- [ ] Merge `feature/launch-audit-fixes → staging`, verify on staging preview
- [ ] Merge `staging → main` for production

---

## 2. Apply the RLS migration

File: `scripts/migration-enable-rls.sql`

This is **defence in depth**: the Next.js API routes use the Supabase
service-role key and bypass RLS, so nothing in the app changes. But if an
anon-key path ever leaks into the browser, RLS blocks it silently instead of
exposing student data.

- [ ] Open the Supabase SQL editor for the production project
- [ ] Paste the file contents → Run
- [ ] Run the verification query at the bottom of the file:
  ```sql
  SELECT tablename, rowsecurity
  FROM pg_tables
  WHERE schemaname = 'public';
  ```
- [ ] Confirm `rowsecurity = true` for: `students`, `student_progress`,
      `student_sessions`, `roll_list`, `batches`, `student_profiles`,
      `admin_actions`
- [ ] Regression check: sign in, view /connect, open a module, complete a quiz —
      all should work identically (service-role bypasses RLS)

If any table reports `rowsecurity = false` after running, that table
probably doesn't exist yet — safe to ignore (RLS is a no-op on missing
tables due to `IF EXISTS`).

---

## 3. Rotate the shared secrets

Both are currently known to too many people:

### `ADMIN_PASSWORD`

- [ ] Generate a fresh 24+ char random string (1Password / `openssl rand -base64 24`)
- [ ] Vercel → project → Settings → Environment Variables → `ADMIN_PASSWORD`
      → Edit → paste new value → Save
- [ ] Redeploy production (Vercel auto-redeploys on env change, but confirm)
- [ ] Sign in at `/admin/people` with the new password to verify
- [ ] Store the new value in 1Password or similar — do NOT paste it into
      chat / Slack / email

### `CRON_SECRET`

- [ ] Generate a fresh 32+ char random string
- [ ] Vercel → project → Settings → Environment Variables → `CRON_SECRET`
      → Edit → paste new value → Save
- [ ] `vercel.json` references this in the weekly-digest cron job — the cron
      will pick up the new value on the next schedule
- [ ] Optional: hit `/api/cron/weekly-digest` manually with the new
      `authorization: Bearer <new-secret>` header to verify it still works

---

## 4. Roll list sanity check

The audit flagged a "registration fall-through" behaviour: if a section's
roll list is empty, the registration endpoint lets any student through.
Safe for the initial rollout *only if every section has its roll list
loaded before students show up Monday*.

- [ ] `/admin/roster` — open each of the 6 sections
- [ ] Confirm every section shows the expected roll count (no zeros)
- [ ] If any section is empty, run `scripts/upload-rolls.mjs` for it now

---

## 5. Monday-morning smoke test

First 15 minutes of live traffic:

- [ ] Watch Vercel function logs for spikes of 500s (especially
      `/api/batches`, `/api/progress`, `/api/connect`)
- [ ] Check `/admin` KPI cards — Total = 218, Active growing through the day
- [ ] One real student registers end-to-end with you watching
- [ ] Bloom's radar appears on home after they complete a quiz

---

## 6. Nice-to-haves for the week after

Not blocking, but worth queueing:

- Per-batch archive flow (July, when this cohort graduates)
- Class-wide Bloom's dashboard for the teacher view
- OG cover image at `public/og-cover.png` (layout.tsx now references it;
  LinkedIn cards are blank until this exists)
- Preflight for next cohort: rotate both secrets again, roll-list upload
  from scratch

---

## What's already done (code)

Merged in PR #75:

- Auth-gated: `POST /api/profiles`, `/api/profiles/upload`, `GET /api/students/check`, `GET /api/progress`
- Stripped emails from public `GET /api/batches`
- Audit-logged delete-student; blocked silent batch/section re-registration
- Service worker skips auth-sensitive URLs; stale-while-revalidate elsewhere
- Lazy-loaded `CheatSheet` / `Flashcards` / `Confetti` (~60KB off main bundle)
- Google avatars sized via `=s64-c` helper
- Sign-in modal: dialog role + focus + Esc; admin table rows keyboard-navigable
- WCAG AA contrast bump; decorative emoji aria-hidden
- Content: ChatGPT vendor fix, Twitter→X, confidence emojis reframed,
  blockchain 51% wording, reply-all math, HTML skeleton answers wrap
- `metadataBase` + OG image + `robots.ts` + `sitemap.ts`
- `PeoplePage` wrapped in Suspense for Next 16 CSR bailout
- `auth-context`, `ShortcutTrainer`, `profile/edit` migrated off
  setState-in-effect patterns (React 19 purity compliance)
