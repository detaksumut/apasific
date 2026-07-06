import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  try {
    const { sessionId } = await params;
    const { access_code } = await req.json();

    if (!access_code) {
      return NextResponse.json({ error: "Kode akses wajib diisi." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("exam_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Sesi ujian tidak ditemukan." }, { status: 404 });
    }

    if (data.assessor_code === access_code) {
      return NextResponse.json({ role: "assessor" });
    } else if (data.candidate_code === access_code) {
      if (data.status === 'DRAFT') {
        return NextResponse.json({ error: "Soal ujian belum dirilis oleh Asesor. Silakan tunggu." }, { status: 403 });
      }
      return NextResponse.json({ role: "candidate" });
    } else {
      return NextResponse.json({ error: "Kode akses tidak valid." }, { status: 401 });
    }

  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
