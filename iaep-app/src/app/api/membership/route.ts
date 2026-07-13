import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Read directly from env or use fallback (Useful if Vercel env vars are not set yet)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "https://aroasmlrlpjbjokvxlgo.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyb2FzbWxybHBqYmpva3Z4bGdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzE4OTU5MCwiZXhwIjoyMDk4NzY1NTkwfQ.pSVcAi-8EpF9CMVCB7rcM5vhMlsJ9WgYURL2jyJyFfg";

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
    // Auto-generate Membership ID sequentially
    const { count, error: countError } = await supabase
      .from("membership_applications")
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      console.error("Failed to count members:", countError);
      throw new Error("Count Error: " + (countError.message || JSON.stringify(countError)));
    }
    
    // Calculate sequence number (e.g. 0000001, 0000002)
    const finalInternationalId = ((count || 0) + 1).toString().padStart(7, '0');
    
    // Append the user's ORCID/Scopus ID to the university field so it's not lost
    const universityWithOrcid = internationalId ? `${university} (ORCID/Scopus: ${internationalId})` : university;


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
          university: universityWithOrcid,
          bukti_transfer_url: buktiTransfer, // Base64 string
          status: 'Pending'
        }
      ])
      .select();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: "Insert Error: " + (error.message || JSON.stringify(error)) }, { status: 500 });
    }

    // Trigger WhatsApp Notification
    if (phone) {
      const waMessage = `Terima kasih ${fullName} telah melakukan pendaftaran keanggotaan (Membership) di Asia Index & Metric (Association Asia Pacific Academicians).

Detail Pendaftaran:
ID Keanggotaan: ${finalInternationalId}
Level Akademik: ${academicLevel}
Institusi: ${university}

Status aplikasi Anda saat ini adalah Pending. Tim kami akan segera melakukan verifikasi terhadap bukti transfer dan data yang Anda berikan.

Asia Index & Metric
Association Asia Pacific Academicians
https://apasific.org`;

      try {
        const { sendWa } = await import('@/utils/sendWa');
        await sendWa(phone, waMessage);
      } catch (waError) {
        console.error("WhatsApp Notification failed:", waError);
      }
    }

    return NextResponse.json({ success: true, data: insertedData });
  } catch (err: any) {
    console.error("API Error:", err);
    const errorMessage = err?.message || JSON.stringify(err) || "Unknown Internal Server Error";
    return NextResponse.json({ error: "System Error: " + errorMessage }, { status: 500 });
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
