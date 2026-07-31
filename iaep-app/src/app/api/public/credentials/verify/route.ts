import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * GET /api/public/credentials/verify
 *
 * Public credential verification endpoint — no authentication required.
 * Can be used by partner institutions, universities, and HR departments.
 *
 * Query params:
 *   ?token=VERIFICATION_TOKEN
 *   ?credential_number=APASIFIC-CERT-2026-XXXXXX
 *
 * Response schema:
 * {
 *   valid: boolean,
 *   status: "ACTIVE" | "EXPIRED" | "REVOKED" | "NOT_FOUND",
 *   credential_number: string,
 *   certification_type: string,
 *   holder_name: string,
 *   issued_at: string,
 *   expired_at: string,
 *   verified_at: string   <- timestamp of this verification query
 * }
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const credential_number = searchParams.get("credential_number");

  if (!token && !credential_number) {
    return NextResponse.json(
      { error: "Sertakan ?token= atau ?credential_number= untuk verifikasi." },
      { status: 400 }
    );
  }

  try {
    // Build query
    let query = supabase
      .from("credentials")
      .select(`
        id,
        credential_number,
        certification_type,
        status,
        issued_at,
        expired_at,
        revoked_at,
        revoked_reason,
        issued_by,
        candidate_id,
        certification_candidates!inner(name)
      `);

    if (token) {
      query = query.eq("verification_token", token);
    } else {
      query = query.eq("credential_number", credential_number!);
    }

    const { data, error } = await query.single();

    if (error || !data) {
      return NextResponse.json(
        {
          valid: false,
          status: "NOT_FOUND",
          message: "Credential tidak ditemukan. Pastikan nomor sertifikat atau token verifikasi benar.",
          verified_at: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // Auto-check expiry
    const isExpired = new Date(data.expired_at) < new Date();
    const effectiveStatus = data.status === "ACTIVE" && isExpired ? "EXPIRED" : data.status;

    // If newly expired, update DB silently
    if (data.status === "ACTIVE" && isExpired) {
      await supabase
        .from("credentials")
        .update({ status: "EXPIRED", updated_at: new Date().toISOString() })
        .eq("id", data.id);
    }

    const isValid = effectiveStatus === "ACTIVE";
    const holderName = (data as any).certification_candidates?.name || "Nama tidak tersedia";

    // ── Phase 6.5: Fetch Accreditation Metadata ──
    // Find the policy code for this certification type
    const certType = data.certification_type;
    const { data: policy } = await supabase
      .from("certification_policies")
      .select("code")
      .eq("is_active", true)
      .or(`name.ilike.%${certType}%,code.ilike.%${certType}%`)
      .limit(1)
      .maybeSingle();

    let accreditations: any[] = [];
    if (policy?.code) {
      // Fetch specific accreditations OR global accreditations (NULL certification_code)
      const { data: accData } = await supabase
        .from("certification_accreditations")
        .select("region, country, recognition_type, accreditation_body, recognition_level")
        .eq("is_active", true)
        .or(`certification_code.eq.${policy.code},certification_code.is.null`);
      accreditations = accData || [];
    } else {
      // Fetch only global accreditations if policy not matched
      const { data: accData } = await supabase
        .from("certification_accreditations")
        .select("region, country, recognition_type, accreditation_body, recognition_level")
        .eq("is_active", true)
        .is("certification_code", null);
      accreditations = accData || [];
    }

    const recognizedIn = accreditations.map(a => ({
      region: a.region,
      country: a.country || "All",
      recognition: a.recognition_type,
      body: a.accreditation_body,
      level: a.recognition_level || undefined,
    }));

    return NextResponse.json({
      valid: isValid,
      status: effectiveStatus,
      credential_number: data.credential_number,
      certification_type: data.certification_type,
      holder_name: holderName,
      issued_at: data.issued_at,
      expired_at: data.expired_at,
      issued_by: data.issued_by,
      ...(effectiveStatus === "REVOKED" && {
        revoked_at: data.revoked_at,
        revoked_reason: data.revoked_reason,
      }),
      recognized_in: recognizedIn,
      verified_at: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
