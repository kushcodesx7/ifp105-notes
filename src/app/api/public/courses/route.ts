import { NextRequest } from "next/server";
import { listActiveCourses } from "@/lib/active-courses";
import { ipFromRequest, rateLimit, rateLimitResponse } from "@/lib/rate-limit";

// GET /api/public/courses
// Public list of active courses for the home-page course picker.
// Cached aggressively — courses list changes maybe once per semester.
//
// Rate-limited to bound scrapers even though the payload is tiny.

export async function GET(req: NextRequest) {
  const rl = await rateLimit({
    bucket: "public:courses",
    id: ipFromRequest(req),
    limit: 60,
    windowSec: 60,
  });
  if (!rl.ok) return rateLimitResponse(rl, 60);

  const courses = await listActiveCourses();
  return Response.json(
    { courses },
    {
      headers: {
        // 5 min fresh + 30 min SWR. A course going from draft to
        // published propagates within 5 minutes.
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=1800",
      },
    }
  );
}
