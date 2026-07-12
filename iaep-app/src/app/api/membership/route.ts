import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Read directly from env or use fallback (Useful if Vercel env vars are not set yet)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "https://aroasmlrlpjbjokvxlgo.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFibWppZXFjdW1sc2thbm5ma2RsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDQyMjEyNywiZXhwIjoyMDk1OTk4MTI3fQ.imJyFIR09I6EZtUHiBN3KaPz3tzxmQkGjbMUGqphR5U";

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
    // Auto-generate International ID if not provided
    let finalInternationalId = internationalId;
    if (!finalInternationalId || finalInternationalId.trim() === "") {
      const getCountryCode = (c: string) => {
        const map: Record<string, string> = {
          "Indonesia": "ID", "Malaysia": "MY", "Singapore": "SG", "Thailand": "TH", 
          "Vietnam": "VN", "Philippines": "PH", "Japan": "JP", "South Korea": "KR", 
          "China": "CN", "India": "IN", "Australia": "AU"
        };
        return map[c] || "XX";
      };
      
      const getLevelCode = (lvl: string) => {
        if (lvl === "Institusi") return "INS";
        return lvl || "XX";
      };

      const currentYear = new Date().getFullYear().toString().slice(2);
      const cCode = getCountryCode(country || "Indonesia");
      const lCode = getLevelCode(academicLevel || "S2");

      // Count existing rows to generate sequence number
      const { count, error: countError } = await supabase
        .from("membership_applications")
        .select('*', { count: 'exact', head: true });
        
      if (countError) {
        console.error("Failed to count members:", countError);
        throw countError;
      }
      
      // Calculate sequence number (e.g. 001, 002)
      const sequenceNum = ((count || 0) + 1).toString().padStart(3, '0');
      finalInternationalId = `ASIA-${cCode}${currentYear}-${lCode}${sequenceNum}`;
    }

    const { data: insertedData, error } = await supabase
      .from("membership_applications")
      .insert([
        {
          full_name: fullName,
          email: email,
          phone: phone,
          country: country,
          academic_level: academicLevel,
          international_id: finalInternationalId,
          university: university,
          bukti_transfer_url: buktiTransfer, // Base64 string
          status: 'Pending'
        }
      ])
      .select();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message || "Failed to insert into database. Did you run the SQL script?" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: insertedData });
  } catch (err: any) {
    console.error("API Error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
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

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("membership_applications")
      .delete()
      .eq("id", id);

    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
