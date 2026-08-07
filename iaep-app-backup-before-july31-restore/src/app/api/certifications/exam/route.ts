import { NextRequest, NextResponse } from "next/server";

/**
 * @deprecated
 * Legacy Exam Submission API — FROZEN
 *
 * This endpoint handled exam delivery and auto-grading for the old
 * certification system (based on certification_candidates.exam_questions).
 *
 * It has been replaced by the Exam Session Engine:
 *   - GET  /api/certifications/exam/sessions/[id]/data  → Fetch exam (requires x-access-code)
 *   - PUT  /api/certifications/exam/sessions/[id]/data  → Submit answers (requires x-access-code)
 *
 * This route will be DELETED in Sprint 3 after full migration is verified.
 */

const DEPRECATED_RESPONSE = {
  deprecated: true,
  migrated: true,
  message:
    "Legacy certification exam API has been migrated to the new Exam Session Engine. Candidates should access their exam via the Exam Room URL provided by the administrator. This endpoint will be removed in the next deployment.",
  new_flow: "Admin → Generate Exam Room → Send URL to Candidate → /exam/[sessionId]",
  documentation: "Contact APASIFIC Admin for your Exam Room URL and Candidate Code.",
};

export async function GET(_request: NextRequest) {
  return NextResponse.json(DEPRECATED_RESPONSE, { status: 410 }); // 410 Gone
}

export async function POST(_request: NextRequest) {
  return NextResponse.json(DEPRECATED_RESPONSE, { status: 410 }); // 410 Gone
}
