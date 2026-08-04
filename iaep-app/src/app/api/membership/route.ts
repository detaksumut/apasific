import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// SEC-03: Service role key must be provided via environment variables only.
// No hardcoded fallback secrets are permitted.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL is not configured.");
}
if (!supabaseKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured. Refusing to start with a fallback secret.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// RBAC: helper to determine if the request is from an authenticated admin.
// Only admin / superadmin / super_admin roles may mutate membership status.
async function isAdminRequest(): Promise<boolean> {
  try {
    const { getCurrentUserRole } = await import("@/app/actions/user");
    const profile = await getCurrentUserRole();
    if (!profile) return false;
    const role = (profile.role || "").toLowerCase();
    return ["admin", "superadmin", "super_admin"].includes(role);
  } catch {
    return false;
  }
}

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
      discipline,
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
    
    // Calculate sequence number (e.g. ASIA-VII-000001)
    const romanMonths = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    const currentMonthRoman = romanMonths[new Date().getMonth()];
    const finalInternationalId = `ASIA-${currentMonthRoman}-` + ((count || 0) + 1).toString().padStart(6, '0');
    
    // Append the user's ORCID/Scopus ID and Discipline to the university field so it's not lost
    const universityCombined = `${university}${internationalId ? ` (ORCID/Scopus: ${internationalId})` : ''}${discipline ? ` | Disiplin: ${discipline}` : ''}`;

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
          university: universityCombined,
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
      const waMessage = `Terimakasih telah Submit pendaftaran member di ASIA.
Nama: ${fullName}
Institusi: ${university}

Tim kami akan segera memproses pendaftaran Anda.`;

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
      // RBAC: only authenticated admins may change membership status.
      const isAdmin = await isAdminRequest();
      if (!isAdmin) {
        return NextResponse.json({ success: false, error: "Unauthorized: admin role required." }, { status: 403 });
      }

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
    // RBAC: only authenticated admins may delete membership applications.
    const isAdmin = await isAdminRequest();
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: "Unauthorized: admin role required." }, { status: 403 });
    }

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
