@AGENTS.md

# Branch Workflow

- **main** = production (live site on Vercel). Never commit directly.
- **staging** = test/preview. All feature branches merge here first via PR.
- **feature/*** = day-to-day work. Always branch from `staging`.

## Rules
- Never push directly to `main` or `staging` — always use PRs.
- Flow: `feature/* → PR → staging` (test on Vercel preview URL) → `PR → main` (goes live).
- Delete feature branches after merge (GitHub auto-deletes).

## Deployment
- Vercel auto-deploys `main` to production.
- Vercel gives every other branch a preview URL automatically.
- Hosted at: vercel.com/dr-kuhs-projects/ifp105-notes
