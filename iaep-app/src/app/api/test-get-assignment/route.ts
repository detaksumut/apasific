import { NextResponse } from "next/server";
import { getAssignmentDetails } from "@/app/actions/reviewer";

export async function GET() {
  try {
    const assignmentId = "5c82c156-f9f6-4415-a1cf-b9f1642a063a";
    const details = await getAssignmentDetails(assignmentId);
    return NextResponse.json({ assignmentId, details });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
