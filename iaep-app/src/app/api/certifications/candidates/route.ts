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
      cert: c.cert,
      method: c.method,
      schedule: new Date(c.schedule).toLocaleString("en-GB", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      status: c.status,
      zoomLink: c.zoom_link
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
    const { id, name, email, phone, cert, method, schedule, status, zoomLink } = payload;

    if (!name || !email || !cert) {
      return NextResponse.json({ error: "Missing required candidate info" }, { status: 400 });
    }

    const dbPayload: any = {
      name,
      email,
      phone: phone || null,
      cert,
      method,
      schedule: new Date(schedule).toISOString(),
      status: status || "Awaiting Zoom Link",
      zoom_link: zoomLink || null
    };

    if (id) {
      dbPayload.id = id;
    } else {
      dbPayload.id = `C-${Date.now().toString().slice(-4)}`;
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
