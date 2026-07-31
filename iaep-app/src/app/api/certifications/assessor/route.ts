import { NextRequest, NextResponse } from "next/server";

/**
 * @deprecated
 * Legacy Assessor Portal API — FROZEN
 *
 * This endpoint has been migrated to the new Certification Exam Workspace.
 * All assessor operations are now handled via:
 *   - POST /api/certifications/exam/sessions       → Create exam session
 *   - GET  /api/certifications/exam/sessions/[id]/data  → Get session data (requires x-access-code)
 *   - PUT  /api/certifications/exam/sessions/[id]/data  → Update session (requires x-access-code)
 *
 * This route will be DELETED in Sprint 3 after full migration is verified.
 */

const DEPRECATED_RESPONSE = {
  deprecated: true,
  migrated: true,
  message:
    "Legacy certification assessor API has been migrated. Please use the new Certification Exam Workspace via /exam/[sessionId]/assessor. This endpoint will be removed in the next deployment.",
  new_endpoint: "/api/certifications/exam/sessions/[sessionId]/data",
  documentation: "Contact APASIFIC Admin for your new Exam Room URL and Assessor Code.",
};

export async function GET(_request: NextRequest) {
  return NextResponse.json(DEPRECATED_RESPONSE, { status: 410 }); // 410 Gone
}

export async function POST(_request: NextRequest) {
  return NextResponse.json(DEPRECATED_RESPONSE, { status: 410 }); // 410 Gone
}
