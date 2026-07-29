import { NextRequest, NextResponse } from "next/server";
import { publishArticleToZenodo, ZenodoMetadata } from "@/utils/zenodo";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { metadata, fileUrl, fileName, coverUrl } = body as {
      metadata: ZenodoMetadata;
      fileUrl: string;
      fileName: string;
      coverUrl?: string;
    };

    if (!metadata || !fileUrl) {
      return NextResponse.json({ success: false, error: "Missing metadata or fileUrl" }, { status: 400 });
    }

    const result = await publishArticleToZenodo(metadata, fileUrl, fileName, coverUrl);
    return NextResponse.json(result);
  } catch (e: any) {
    console.error("publish-zenodo route error:", e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
