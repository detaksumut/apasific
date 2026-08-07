import { NextRequest, NextResponse } from "next/server";
import { publishArticleToZenodo, ZenodoMetadata } from "@/utils/zenodo";
import { createClient } from "@/utils/supabase/server";
import { isCoAdmin } from "@/lib/permissions";

export async function POST(req: NextRequest) {
  try {
    // ── SERVER-SIDE AUTHORIZATION: Co-Admin cannot publish to Zenodo ──
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', user.id).single();
      if (profile?.role && isCoAdmin(profile.role)) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized: Co-Admin tidak memiliki izin untuk menerbitkan ke Zenodo.' },
          { status: 403 }
        );
      }
    }

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

