import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/** GET /api/certifications/policies
 * List active policies. Optional filter: ?category=Professional&code=HR
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const code = searchParams.get("code");
  const includeInactive = searchParams.get("include_inactive") === "true";

  let query = supabase
    .from("certification_policies")
    .select("*")
    .order("category")
    .order("name");

  if (!includeInactive) query = query.eq("is_active", true);
  if (category) query = query.eq("category", category);
  if (code) query = query.eq("code", code.toUpperCase());

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

/** POST /api/certifications/policies
 * Create a new certification policy.
 * Validates: code uniqueness, weight sum = 1.00
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name, code, category, level, passing_grade, validity_years,
      assessment_method, mcq_weight, essay_weight, interview_weight,
      interview_required, reviewer_count, certificate_template, description,
    } = body;

    if (!name || !code) {
      return NextResponse.json({ error: "name dan code wajib diisi." }, { status: 400 });
    }

    // Validate weight sum
    const mcq = Number(mcq_weight) || 0;
    const essay = Number(essay_weight) || 0;
    const interview = Number(interview_weight) || 0;
    const total = Math.round((mcq + essay + interview) * 100) / 100;

    if (Math.abs(total - 1.00) > 0.01) {
      return NextResponse.json(
        { error: `Total bobot scoring harus = 1.00. Saat ini: ${total.toFixed(2)} (MCQ: ${mcq} + Essay: ${essay} + Interview: ${interview})` },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("certification_policies")
      .insert({
        name,
        code: code.toUpperCase(),
        category: category || "Professional",
        level: level || null,
        passing_grade: Number(passing_grade) || 70,
        validity_years: Number(validity_years) || 3,
        assessment_method: assessment_method || ["MCQ", "ESSAY"],
        mcq_weight: mcq,
        essay_weight: essay,
        interview_weight: interview,
        interview_required: Boolean(interview_required),
        reviewer_count: Number(reviewer_count) || 1,
        certificate_template: certificate_template || "STANDARD",
        description: description || null,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: `Code '${code.toUpperCase()}' sudah digunakan.` }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Audit log
    await supabase.from("certification_audit_logs").insert({
      entity_type: "certification_policy",
      entity_id: data.id,
      action: "POLICY_CREATED",
      performed_by: "Admin",
      new_value: { name, code: code.toUpperCase(), passing_grade, validity_years },
    });

    return NextResponse.json({ success: true, message: `Policy '${name}' berhasil dibuat.`, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/** PATCH /api/certifications/policies?id=UUID
 * Update an existing policy. Weight sum validated.
 */
export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id wajib disertakan." }, { status: 400 });

    const body = await req.json();

    // Re-validate weight sum if any weight is being updated
    if (body.mcq_weight !== undefined || body.essay_weight !== undefined || body.interview_weight !== undefined) {
      // Fetch current values for fields not being updated
      const { data: current } = await supabase
        .from("certification_policies")
        .select("mcq_weight, essay_weight, interview_weight")
        .eq("id", id)
        .single();

      if (current) {
        const mcq = Number(body.mcq_weight ?? current.mcq_weight);
        const essay = Number(body.essay_weight ?? current.essay_weight);
        const interview = Number(body.interview_weight ?? current.interview_weight);
        const total = Math.round((mcq + essay + interview) * 100) / 100;

        if (Math.abs(total - 1.00) > 0.01) {
          return NextResponse.json(
            { error: `Total bobot harus = 1.00. Hasil: ${total.toFixed(2)}` },
            { status: 400 }
          );
        }
      }
    }

    const updates = { ...body, updated_at: new Date().toISOString() };
    if (updates.code) updates.code = updates.code.toUpperCase();
    delete updates.id; // don't allow id override

    const { data, error } = await supabase
      .from("certification_policies")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/** DELETE /api/certifications/policies?id=UUID
 * Soft delete — set is_active=false. Does not delete rows.
 */
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id wajib disertakan." }, { status: 400 });

  const { data, error } = await supabase
    .from("certification_policies")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id, code, name")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("certification_audit_logs").insert({
    entity_type: "certification_policy",
    entity_id: id,
    action: "POLICY_DEACTIVATED",
    performed_by: "Admin",
    new_value: { is_active: false },
  });

  return NextResponse.json({ success: true, message: `Policy '${data.name}' (${data.code}) dinonaktifkan.` });
}
