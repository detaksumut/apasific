import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * PATCH /api/certifications/candidates/[id]/eligibility
 *
 * Admin updates the eligibility status of a candidate.
 *
 * Body: { eligibility_status: "ELIGIBLE" | "REJECTED", notes?: string, verified_by?: string }
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { eligibility_status, notes, verified_by } = body;

    if (!eligibility_status || !['PENDING', 'ELIGIBLE', 'REJECTED'].includes(eligibility_status)) {
      return NextResponse.json(
        { error: "eligibility_status wajib diisi: PENDING | ELIGIBLE | REJECTED" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("certification_candidates")
      .update({
        eligibility_status,
        eligibility_notes: notes || null,
        eligibility_verified_by: verified_by || null,
        eligibility_verified_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Audit log
    await supabase.from("certification_audit_logs").insert({
      entity_type: "candidate",
      entity_id: id,
      action: eligibility_status === 'ELIGIBLE' ? 'ELIGIBILITY_APPROVED' : eligibility_status === 'REJECTED' ? 'ELIGIBILITY_REJECTED' : 'ELIGIBILITY_RESET',
      performed_by: `Admin:${verified_by || "Unknown"}`,
      new_value: { eligibility_status, notes },
    });

    return NextResponse.json({
      success: true,
      message: `Eligibility kandidat berhasil diubah ke ${eligibility_status}`,
      data,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * GET /api/certifications/candidates/[id]/eligibility
 * Returns current eligibility status for a candidate.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { data, error } = await supabase
    .from("certification_candidates")
    .select("id, name, eligibility_status, eligibility_notes, eligibility_verified_by, eligibility_verified_at")
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
