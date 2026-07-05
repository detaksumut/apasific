import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("certification_candidates")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Map DB columns to Frontend states
    const mapped = data.map(c => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone || "",
      academicField: c.academic_field || "",
      cert: c.cert,
      method: c.method,
      schedule: new Date(c.schedule).toLocaleString("en-GB", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      status: c.status,
      zoomLink: c.zoom_link,
      assessorAccessCode: c.assessor_access_code || "",
      examScore: c.exam_score
    }));

    return NextResponse.json(mapped);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const payload = await request.json();
    const { id, name, email, phone, academicField, cert, method, schedule, status, zoomLink, assessorAccessCode } = payload;

    if (!name || !email || !cert) {
      return NextResponse.json({ error: "Missing required candidate info" }, { status: 400 });
    }

    const dbPayload: any = {
      name,
      email,
      phone: phone || null,
      academic_field: academicField || null,
      cert,
      method,
      schedule: new Date(schedule).toISOString(),
      status: status || "Awaiting Zoom Link",
      zoom_link: zoomLink || null
    };

    if (id) {
      dbPayload.id = id;
      if (assessorAccessCode) dbPayload.assessor_access_code = assessorAccessCode;
    } else {
      dbPayload.id = `C-${Date.now().toString().slice(-4)}`;
      // Generate assessor code only for Multiple Choice Exams
      if (method?.includes("Multiple Choice")) {
        dbPayload.assessor_access_code = `AX-${Math.floor(1000 + Math.random() * 9000)}`;
        dbPayload.status = "Awaiting Exam Generation";
      }
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
