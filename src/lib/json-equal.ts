// Normalised deep-equality for JSON-shaped data.
//
// Why: the per-topic diff classifier compares DB content_json against
// TS content via JSON.stringify. That comparison is over-strict —
// JSON.stringify preserves key insertion order and serialises
// `undefined` as missing, so two semantically-identical objects can
// produce different strings:
//
//   {a:1, b:2}        -> '{"a":1,"b":2}'
//   {b:2, a:1}        -> '{"b":2,"a":1}'   ← string differs, value identical
//   {a:1, b:undefined}-> '{"a":1}'
//   {a:1}             -> '{"a":1}'         ← these ARE equal but only after normalising
//
// Postgres JSONB roundtrip can re-order keys, and Supabase JS
// occasionally adds optional fields with undefined. Result: every
// admin diff page lit up "EDITED" even when the rendered topic was
// byte-for-byte identical to the TS source.
//
// jsonEqualNormalised: recursive deep-equal that
//   · sorts object keys before comparing
//   · drops undefined values (treat as missing)
//   · compares primitives directly
//   · arrays compared in order (order is meaningful for content_json)

function normalise(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalise);
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj).sort();
    const out: Record<string, unknown> = {};
    for (const k of keys) {
      const v = obj[k];
      if (v === undefined) continue;
      out[k] = normalise(v);
    }
    return out;
  }
  return value;
}

export function jsonEqualNormalised(a: unknown, b: unknown): boolean {
  return JSON.stringify(normalise(a)) === JSON.stringify(normalise(b));
}
