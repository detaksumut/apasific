import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Read directly from env (Vercel will inject these, or local .env.local)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const {
      fullName,
      email,
      phone,
      country,
      academicLevel,
      internationalId,
      university,
      buktiTransfer
    } = data;

    const { data: insertedData, error } = await supabase
      .from("membership_applications")
      .insert([
        {
          full_name: fullName,
          email: email,
          phone: phone,
          country: country,
          academic_level: academicLevel,
          international_id: internationalId,
          university: university,
          bukti_transfer_url: buktiTransfer, // Base64 string
          status: 'Pending'
        }
      ])
      .select();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: insertedData });
  } catch (err: any) {
    console.error("API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    // Approve / Reject actions
    if (action === "updateStatus") {
      const id = searchParams.get("id");
      const status = searchParams.get("status");
      
      const { error } = await supabase
        .from("membership_applications")
        .update({ status })
        .eq("id", id);
        
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    // Default: GET all applications
    const { data, error } = await supabase
      .from("membership_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ applications: data });
  } catch (err: any) {
    console.error("API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
