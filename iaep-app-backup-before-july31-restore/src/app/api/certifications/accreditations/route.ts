import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/** GET /api/certifications/accreditations
 * List accreditations. Optional: ?code=HR&region=ASEAN&active_only=true
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const region = searchParams.get("region");
  const activeOnly = searchParams.get("active_only") !== "false";

  let query = supabase
    .from("certification_accreditations")
    .select("*")
    .order("certification_code", { nullsFirst: true })
    .order("region");

  if (activeOnly) query = query.eq("is_active", true);
  if (code) query = query.eq("certification_code", code.toUpperCase());
  if (region) query = query.ilike("region", `%${region}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

/** POST /api/certifications/accreditations — create new accreditation record */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      certification_code, accreditation_body, region, country,
      recognition_type, recognition_level, accreditation_number,
      valid_from, valid_until, document_url, notes,
    } = body;

    if (!accreditation_body || !region || !recognition_type) {
      return NextResponse.json(
        { error: "accreditation_body, region, dan recognition_type wajib diisi." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("certification_accreditations")
      .insert({
        certification_code: certification_code?.toUpperCase() || null,
        accreditation_body,
        region,
        country: country || null,
        recognition_type,
        recognition_level: recognition_level || null,
        accreditation_number: accreditation_number || null,
        valid_from: valid_from || null,
        valid_until: valid_until || null,
        document_url: document_url || null,
        notes: notes || null,
        is_active: true,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await supabase.from("certification_audit_logs").insert({
      entity_type: "accreditation",
      entity_id: data.id,
      action: "ACCREDITATION_CREATED",
      performed_by: "Admin",
      new_value: { accreditation_body, region, recognition_type, certification_code },
    });

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/** PATCH /api/certifications/accreditations?id=UUID */
export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id wajib disertakan." }, { status: 400 });

    const body = await req.json();
    const { data, error } = await supabase
      .from("certification_accreditations")
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/** DELETE /api/certifications/accreditations?id=UUID — soft delete */
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id wajib disertakan." }, { status: 400 });

  const { error } = await supabase
    .from("certification_accreditations")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
