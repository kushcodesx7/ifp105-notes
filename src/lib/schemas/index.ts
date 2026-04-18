import { z } from "zod";

// Shared zod schemas for API route validation. Previously each route
// hand-validated fields with `typeof x === "string"` checks — easy to
// miss a field, easier to accept malformed input. Centralising them
// here gives us:
//   - Type-safe parsed bodies (auto-inferred TS types)
//   - Consistent 400 error messages
//   - One place to tighten (e.g. add max-length) for every call site
//
// Each schema maps to a specific API endpoint shape. Naming follows
// <Verb><Resource>Schema.

// ─── Reusable primitives ────────────────────────────────────

/** Loose email check — enforces `@` and a dot-containing domain. */
const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(3)
  .max(120)
  .email("Invalid email");

/** Course slug — lowercase + digits + hyphens only, 2-40 chars. */
const courseSlug = z
  .string()
  .trim()
  .toLowerCase()
  .regex(
    /^[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?$/,
    "Slug must be 2-40 lowercase letters/digits/hyphens (e.g. 'python-101')"
  );

/** Positive integer within [1, 100]. Covers module #, topic #, question #, batch size, etc. */
const smallPositiveInt = z.number().int().positive().max(100);

/** LinkedIn URL — permissive, allows query/fragments and non-Latin handles. */
const linkedinUrl = z
  .string()
  .trim()
  .regex(
    /^https?:\/\/(www\.)?linkedin\.com\/in\/[^/\s?#]+/i,
    "Invalid LinkedIn URL. Use format: https://linkedin.com/in/yourname"
  )
  .optional()
  .nullable();

// ─── /api/progress POST ────────────────────────────────────

export const ProgressSaveSchema = z.object({
  email,
  name: z.string().trim().min(1).max(200).optional(),
  moduleNumber: z.number().int().positive(),
  topicId: z.number().int().positive(),
  completed: z.boolean().optional(),
  mcqScore: z.number().int().min(0).optional(),
  mcqTotal: z.number().int().min(0).optional(),
  challengeAttempted: z.boolean().optional(),
  // Flexible — each stat is a record of unknown shape we persist as-is
  // into JSONB. Deep schema validation would reject future additions.
  bloomStats: z.record(z.string(), z.unknown()).optional().nullable(),
  confidenceStats: z.record(z.string(), z.unknown()).optional().nullable(),
  courseSlug: z.string().trim().optional(),
});

// ─── /api/batches POST (student registration) ──────────────

export const RegisterStudentSchema = z.object({
  batchId: z.string().trim().min(1).max(50),
  section: z.string().trim().min(1).max(50),
  enrollmentNo: z.string().trim().min(1).max(50),
  name: z.string().trim().min(1).max(200),
  email,
  linkedinUrl,
  photoUrl: z.string().trim().url().optional().nullable(),
});

// ─── /api/students/sync POST ───────────────────────────────

export const SyncStudentSchema = z.object({
  email,
  photoUrl: z.string().trim().url().optional().nullable(),
});

// ─── /api/students/profile POST ────────────────────────────

export const UpdateProfileSchema = z.object({
  email,
  bio: z.string().trim().max(1000).optional().nullable(),
  skills: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
  linkedinUrl,
});

// ─── /api/admin/courses POST (create course) ───────────────

export const CreateCourseSchema = z.object({
  slug: courseSlug,
  code: z.string().trim().min(1).max(40),
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional().nullable(),
  accent: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Accent must be a #RRGGBB hex")
    .optional()
    .nullable(),
  icon: z.string().trim().max(120).optional().nullable(),
  institution: z.string().trim().max(200).optional().nullable(),
});

// ─── /api/admin/courses/[slug] PATCH ───────────────────────

export const UpdateCourseSchema = z.object({
  code: z.string().trim().min(1).max(40).optional(),
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(2000).optional().nullable(),
  accent: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Accent must be a #RRGGBB hex")
    .optional()
    .nullable(),
  icon: z.string().trim().max(120).optional().nullable(),
  institution: z.string().trim().max(200).optional().nullable(),
  active: z.boolean().optional(),
});

// ─── Admin module CRUD ────────────────────────────────────

export const CreateModuleSchema = z.object({
  number: smallPositiveInt.optional(),
  title: z.string().trim().min(1).max(200),
  fullTitle: z.string().trim().max(200).optional().nullable(),
  subtitle: z.string().trim().max(200).optional().nullable(),
  description: z.string().trim().max(2000).optional().nullable(),
  accent: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional()
    .nullable(),
  orderIndex: z.number().int().min(0).max(1000).optional(),
});

export const UpdateModuleSchema = CreateModuleSchema.partial();

// ─── Admin topic CRUD ─────────────────────────────────────

// content_json is unvalidated by zod on purpose — the block editor
// enforces the ContentBlock shape at the TS level and the renderer
// gracefully degrades unknown blocks. A tight zod schema would reject
// the moment a new block type ships.
export const CreateTopicSchema = z.object({
  number: smallPositiveInt.optional(),
  title: z.string().trim().min(1).max(200),
  timeMin: z.number().int().min(0).max(600).optional().nullable(),
  hook: z.string().trim().max(1000).optional().nullable(),
  orderIndex: z.number().int().min(0).max(1000).optional(),
});

export const UpdateTopicSchema = z.object({
  number: smallPositiveInt.optional(),
  title: z.string().trim().min(1).max(200).optional(),
  timeMin: z.number().int().min(0).max(600).optional().nullable(),
  hook: z.string().trim().max(1000).optional().nullable(),
  orderIndex: z.number().int().min(0).max(1000).optional(),
  // Arrays of arbitrary block objects — see comment above.
  contentJson: z.array(z.record(z.string(), z.unknown())).optional(),
});

// ─── Admin question CRUD ─────────────────────────────────

const questionOptions = z
  .array(z.string().trim().min(1).max(500))
  .min(2, "At least 2 non-empty options are required")
  .max(6, "At most 6 options are allowed");

export const CreateQuestionSchema = z
  .object({
    number: smallPositiveInt.optional(),
    question: z.string().trim().min(1).max(1000),
    options: questionOptions,
    correctIndex: z.number().int().min(0).max(5),
    bloom: z.string().trim().max(40).optional().nullable(),
    explanation: z.string().trim().max(2000).optional().nullable(),
    difficulty: z.string().trim().max(40).optional().nullable(),
    orderIndex: z.number().int().min(0).max(1000).optional(),
  })
  .refine(
    (q) => q.correctIndex < q.options.length,
    "correctIndex must point at one of the options"
  );

export const UpdateQuestionSchema = z.object({
  question: z.string().trim().min(1).max(1000).optional(),
  options: questionOptions.optional(),
  correctIndex: z.number().int().min(0).max(5).optional(),
  bloom: z.string().trim().max(40).optional().nullable(),
  explanation: z.string().trim().max(2000).optional().nullable(),
  difficulty: z.string().trim().max(40).optional().nullable(),
  number: smallPositiveInt.optional(),
  orderIndex: z.number().int().min(0).max(1000).optional(),
});

// ─── Helper: parse-or-400 ──────────────────────────────────

/**
 * Parses a request body against a zod schema. Returns `{ ok: true,
 * data }` on success, `{ ok: false, response }` with a pre-built 400
 * Response on failure. Keeps route handlers to two lines:
 *
 *   const parsed = await parseBody(req, MyParserSchema);
 *   if (!parsed.ok) return parsed.response;
 *   // use parsed.data — fully typed.
 */
export async function parseBody<T>(
  req: Request,
  schema: z.ZodType<T>
): Promise<
  | { ok: true; data: T }
  | { ok: false; response: Response }
> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return {
      ok: false,
      response: Response.json({ error: "JSON body required" }, { status: 400 }),
    };
  }
  const result = schema.safeParse(raw);
  if (!result.success) {
    // Surface the first issue so the client has an actionable message
    // without us leaking the full zod error tree (which can be verbose
    // for nested schemas).
    const issue = result.error.issues[0];
    const path = issue?.path.join(".") || "body";
    return {
      ok: false,
      response: Response.json(
        { error: `${path}: ${issue?.message || "invalid input"}` },
        { status: 400 }
      ),
    };
  }
  return { ok: true, data: result.data };
}
