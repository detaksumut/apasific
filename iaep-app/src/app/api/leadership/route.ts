import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const body = searchParams.get("body");

  if (!body) {
    return NextResponse.json({ error: "Missing body parameter" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leadership")
    .select("*")
    .eq("body_name", body)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // Record not found, return empty structure
      return NextResponse.json({
        ketuaNama: "", ketuaJabatan: "", ketuaNegara: "", ketuaId: "", ketuaPhoto: null,
        sekNama: "", sekJabatan: "", sekNegara: "", sekId: "", sekretarisPhoto: null
      });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Map database columns to the frontend state structure
  return NextResponse.json({
    ketuaNama: data.ketua_name || "",
    ketuaJabatan: data.ketua_jabatan || "",
    ketuaNegara: data.ketua_negara || "",
    ketuaId: data.ketua_id || "",
    ketuaPhoto: data.ketua_photo || null,
    sekNama: data.sek_name || "",
    sekJabatan: data.sek_jabatan || "",
    sekNegara: data.sek_negara || "",
    sekId: data.sek_id || "",
    sekretarisPhoto: data.sek_photo || null
  });
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json();
    const {
      bodyName,
      ketuaNama, ketuaJabatan, ketuaNegara, ketuaId, ketuaPhoto,
      sekNama, sekJabatan, sekNegara, sekId, sekretarisPhoto
    } = payload;

    if (!bodyName) {
      return NextResponse.json({ error: "Missing bodyName" }, { status: 400 });
    }

    const { error } = await supabase
      .from("leadership")
      .upsert({
        body_name: bodyName,
        ketua_name: ketuaNama,
        ketua_jabatan: ketuaJabatan,
        ketua_negara: ketuaNegara,
        ketua_id: ketuaId,
        ketua_photo: ketuaPhoto,
        sek_name: sekNama,
        sek_jabatan: sekJabatan,
        sek_negara: sekNegara,
        sek_id: sekId,
        sek_photo: sekretarisPhoto,
        updated_at: new Date().toISOString()
      }, {
        onConflict: "body_name"
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
