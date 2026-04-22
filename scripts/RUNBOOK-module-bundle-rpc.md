# Runbook — apply the `get_module_bundle` RPC

**Why:** halves the cold-path DB cost on every module page load
(~300ms → ~150ms on warm connection, ~1.5s → ~800ms on 4G Tashkent).

**Safety:** additive. Creates a new Postgres function; does NOT modify
any table, index, policy, or row. Safe to apply mid-class. If the
migration isn't applied, the code path automatically falls back to
the previous two-query implementation — so you can deploy the code
BEFORE applying the SQL if you want to.

---

## Steps (2 minutes, 1 copy-paste)

### 1. Apply the SQL

Open Supabase → your project → **SQL Editor** → New query → paste the
contents of:

```
scripts/migration-module-bundle-rpc.sql
```

Click **Run**. Expected result: "Success. No rows returned."

### 2. Verify

In the same SQL editor, run:

```sql
SELECT
  topic_number,
  topic_title,
  jsonb_array_length(questions) AS q_count
FROM get_module_bundle('ict', 1)
ORDER BY topic_order_index;
```

Expected output: **11 rows** (Module 1 has 11 topics), each showing a
`q_count` of around **10** (the new MCQ banks are 10 per topic).

If you see 11 rows → the RPC works. The module-loader will start
using it on the next page render.

If you see 0 rows → the courses/modules/topics tables aren't
populated for ICT yet (i.e. you haven't run the seed). That's fine:
the fallback path in `module-loader.ts` keeps working either way.

### 3. Done

Nothing to do on the code side — the updated `module-loader.ts` is
already deployed on the `perf/module-loader-rpc-20260422-1246`
branch. Next time a student opens `/module/N`, it uses the RPC
automatically. You can see it live by opening DevTools → Network
tab → filtering by `rpc` — you'll see a single `POST /rpc/get_module_bundle`
request per module instead of two queries.

---

## Rollback (if something feels off)

```sql
DROP FUNCTION IF EXISTS get_module_bundle(text, int);
```

Drop the function. The next request falls through to the previous
two-query embed path automatically — nothing in the codebase depends
on the RPC existing. Zero downtime.

---

## Observed numbers (expected, not measured yet)

- Module page cold load (student hits `/module/3` for the first time
  this session):
  - Before any optimisation: ~600ms DB time (4 sequential queries)
  - After embed optimisation (already landed): ~300ms (2 queries)
  - **After this RPC migration: ~150ms (1 call)**
- Admin `/admin/tools → Trash`: was ~450ms (3 sequential queries),
  now ~150ms (already parallelised on the same branch).
- `/api/public/mcq/[N]`: inherits the RPC speedup automatically —
  every MCQ load is a single RPC now.

---

## Who sees this

Every student every time they open a module. No student-visible
behaviour change (same content, same rendering) — just faster.
