# Git Workflow — Multi-Computer Setup

## Setup on any new computer (one time)

```bash
git clone https://github.com/kushcodesx7/ifp105-notes.git
cd ifp105-notes
npm install
```

## Before starting work (every time)

```bash
git checkout staging
git pull origin staging
git checkout -b feature/your-task-name
```

## While working

```bash
git add .
git commit -m "feat: what you did"
git push -u origin feature/your-task-name
```

## When done on that computer

```bash
# Go to GitHub → create PR: feature/your-task-name → staging
# Test on Vercel preview URL
# If good → merge PR
```

## When staging is fully tested and ready to go live

```bash
# Go to GitHub → create PR: staging → main
# Merge → site goes live
```

## Switch to another computer

```bash
cd ifp105-notes
git fetch --all
git checkout staging
git pull
git checkout -b feature/next-task-name
```

## Rules

1. **NEVER** push directly to `main` or `staging`
2. **ALWAYS** branch from `staging`
3. **ALWAYS** pull before creating a new branch
4. One feature branch per task — keep them small
5. Name branches clearly: `feature/add-module6`, `fix/navbar-bug`, etc.
6. Don't work on the same branch from 2 computers — one branch per computer at a time

## Branch Structure

```
main        → production (live site)
staging     → test/preview (Vercel preview URL)
feature/*   → your day-to-day work
```

## Deployment

- Push to `main` → Vercel deploys to production (live)
- Push to `staging` or any branch → Vercel gives a preview URL automatically
