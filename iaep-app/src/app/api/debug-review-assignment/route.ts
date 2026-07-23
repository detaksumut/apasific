import { NextResponse } from "next/server";
import { getAssignmentDetails } from "@/app/actions/reviewer";

export async function GET(req: Request) {
  try {
    const assignmentId = "5c82c156-f9f6-4415-a1cf-b9f1642a063a";
    const data = await getAssignmentDetails(assignmentId);

    return NextResponse.json({
      assignmentId,
      result: data
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
