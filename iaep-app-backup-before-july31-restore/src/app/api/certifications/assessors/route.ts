import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/** GET /api/certifications/assessors — list with filters */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const qualification_status = searchParams.get("qualification_status");
  const scope = searchParams.get("scope"); // filter by certification_scope

  let query = supabase
    .from("assessors")
    .select("*")
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);
  if (qualification_status) query = query.eq("qualification_status", qualification_status);
  if (scope) query = query.contains("certification_scope", [scope]);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

/** POST /api/certifications/assessors — create new assessor */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, country, institution, expertise, certification_scope, assessor_code } = body;

    if (!name) return NextResponse.json({ error: "name wajib diisi." }, { status: 400 });

    const { data, error } = await supabase
      .from("assessors")
      .insert({
        name,
        email: email || null,
        country: country || "Unknown",
        institution: institution || null,
        expertise: expertise || [],
        certification_scope: certification_scope || [],
        assessor_code: assessor_code || null,
        qualification_status: "PENDING",
        status: "ACTIVE",
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await supabase.from("certification_audit_logs").insert({
      entity_type: "assessor",
      entity_id: data.id,
      action: "ASSESSOR_REGISTERED",
      performed_by: "Admin",
      new_value: { name, country, certification_scope },
    });

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/** PATCH /api/certifications/assessors?id=UUID — update qualification or scope */
export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id wajib disertakan." }, { status: 400 });

    const body = await req.json();
    const { qualification_status, status, expertise, certification_scope, qualification_notes, qualification_date, updated_by } = body;

    const updates: any = {};
    if (qualification_status) updates.qualification_status = qualification_status;
    if (status) updates.status = status;
    if (expertise) updates.expertise = expertise;
    if (certification_scope) updates.certification_scope = certification_scope;
    if (qualification_notes) updates.qualification_notes = qualification_notes;
    if (qualification_date) updates.qualification_date = qualification_date;
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("assessors")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (qualification_status) {
      await supabase.from("certification_audit_logs").insert({
        entity_type: "assessor",
        entity_id: id,
        action: `ASSESSOR_QUALIFICATION_${qualification_status}`,
        performed_by: `Admin:${updated_by || "Unknown"}`,
        new_value: { qualification_status, qualification_notes },
      });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
