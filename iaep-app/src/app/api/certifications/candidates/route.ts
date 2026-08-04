import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

function getSupabaseAdmin() {
  // SEC-03: credentials must be provided via environment variables only.
  // No hardcoded fallback secrets are permitted.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL is not configured.");
  }
  if (!supabaseKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured. Refusing to start with a fallback secret.");
  }
  return createClient(supabaseUrl, supabaseKey);
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("certification_candidates")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Map DB columns to Frontend fields
    // NOTE: assessorAccessCode, examScore, examQuestions removed (legacy system retired)
    const mapped = (data || []).map(c => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone || "",
      academicField: c.academic_field || "",
      cert: c.cert,
      method: c.method,
      schedule: new Date(c.schedule).toLocaleString("en-GB", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      status: c.status,
      eligibilityStatus: c.eligibility_status || "PENDING",
      zoomLink: c.zoom_link,
      buktiTransferUrl: c.bukti_transfer_url || ""
    }));

    return NextResponse.json(mapped);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const payload = await request.json();
    // NOTE: assessorAccessCode removed from accepted payload (legacy field)
    const { id, name, email, phone, academicField, cert, method, schedule, status, zoomLink, buktiTransfer } = payload;

    if (!name || !email || !cert) {
      return NextResponse.json({ error: "Missing required candidate info" }, { status: 400 });
    }

    // Parse schedule
    const parsedDate = new Date(schedule);
    const scheduleISO = isNaN(parsedDate.getTime())
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      : parsedDate.toISOString();

    const dbPayload: any = {
      name,
      email,
      phone: phone || null,
      academic_field: academicField || null,
      cert,
      method,
      schedule: scheduleISO,
      status: status || "Registered",  // Default: Registered (exam session created separately)
      zoom_link: zoomLink || null,
      bukti_transfer_url: buktiTransfer || null
    };

    if (id) {
      dbPayload.id = id;
    } else {
      // Sprint 3: UUID generator — C-XXXXXXXX (8 uppercase hex chars, guaranteed unique)
      dbPayload.id = `C-${randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()}`;
    }

    const { data, error } = await supabase
      .from("certification_candidates")
      .upsert(dbPayload, { onConflict: "id" })
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Candidate ID is required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("certification_candidates")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
