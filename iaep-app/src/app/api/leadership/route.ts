import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const HOME_BODY = "Struktur Organisasi ASIA (Home)";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const body = searchParams.get("body");

  if (!body) {
    return NextResponse.json({ error: "Missing body parameter" }, { status: 400 });
  }

  const supabase = await createClient();

  if (body === "all") {
    const { data, error } = await supabase.from("leadership").select("*");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  const { data, error } = await supabase
    .from("leadership")
    .select("*")
    .eq("body_name", body)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // Record not found — return empty
      if (body === HOME_BODY || body.startsWith("Editorial Board -")) {
        return NextResponse.json({ members: [] });
      }
      return NextResponse.json({
        ketuaNama: "", ketuaJabatan: "", ketuaNegara: "", ketuaId: "", ketuaPhoto: null,
        sekNama: "", sekJabatan: "", sekNegara: "", sekId: "", sekretarisPhoto: null
      });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Home org structure & Editorial Boards — return members array
  if (body === HOME_BODY || body.startsWith("Editorial Board -")) {
    let members = [];
    try {
      if (typeof data.members_json === 'string') {
        members = JSON.parse(data.members_json);
      } else if (data.members_json) {
        members = data.members_json;
      }
    } catch (e) { 
      console.error("Error parsing members_json:", e);
      members = []; 
    }
    return NextResponse.json({ members, debug_data: data, debug_error: error });
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

    const payload = await request.json();
    const { bodyName, members } = payload;

    if (!bodyName) {
      return NextResponse.json({ error: "Missing bodyName" }, { status: 400 });
    }

    let upsertPayload: any = {
      body_name: bodyName,
      updated_at: new Date().toISOString()
    };

    if (bodyName === HOME_BODY || bodyName.startsWith("Editorial Board -")) {
      // Save as JSON
      upsertPayload.members_json = JSON.stringify(members || []);
    } else {
      const {
        ketuaNama, ketuaJabatan, ketuaNegara, ketuaId, ketuaPhoto,
        sekNama, sekJabatan, sekNegara, sekId, sekretarisPhoto
      } = payload;

      upsertPayload = {
        ...upsertPayload,
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
      };
    }

    const { error } = await supabase
      .from("leadership")
      .upsert(upsertPayload, { onConflict: "body_name" });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
