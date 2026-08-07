import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * GET /api/certifications/credentials/[id]/pdf
 *
 * Generate and stream a PDF certificate for a given credential.
 * Requires: @react-pdf/renderer and qrcode packages.
 *
 * Install (run once):
 *   npm install @react-pdf/renderer qrcode @types/qrcode
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch credential with candidate info
    const { data: credential, error } = await supabase
      .from("credentials")
      .select(`
        *,
        certification_candidates!inner(name, email)
      `)
      .eq("id", id)
      .single();

    if (error || !credential) {
      return NextResponse.json({ error: "Credential tidak ditemukan." }, { status: 404 });
    }

    if (credential.status === "REVOKED") {
      return NextResponse.json({ error: "Credential ini telah dicabut dan tidak dapat dicetak." }, { status: 403 });
    }

    // Dynamically import to avoid build errors if package not yet installed
    let renderToBuffer: any;
    let QRCode: any;
    try {
      const pdfLib = await import("@react-pdf/renderer");
      renderToBuffer = pdfLib.renderToBuffer;
      QRCode = (await import("qrcode")).default;
    } catch {
      return NextResponse.json(
        {
          error: "PDF library belum terinstall.",
          instruction: "Jalankan: npm install @react-pdf/renderer qrcode @types/qrcode",
          credential_data: {
            id: credential.id,
            credential_number: credential.credential_number,
            holder_name: (credential as any).certification_candidates?.name,
            certification_type: credential.certification_type,
            issued_at: credential.issued_at,
            expired_at: credential.expired_at,
            verification_url: credential.verification_url,
          },
        },
        { status: 501 }
      );
    }

    // Generate QR code as base64 data URL
    const qrCodeDataUrl = await QRCode.toDataURL(credential.verification_url, {
      width: 150,
      margin: 1,
      color: { dark: "#0d0d1a", light: "#ffffff" },
    });

    // Import PDF component
    const { CertificatePDF } = await import("@/components/certification/CertificatePDF");
    const React = await import("react");

    const pdfElement = React.createElement(CertificatePDF, {
      holderName: (credential as any).certification_candidates?.name || "Unknown",
      certificationField: credential.certification_type,
      credentialNumber: credential.credential_number,
      issuedAt: credential.issued_at,
      expiredAt: credential.expired_at,
      issuedBy: credential.issued_by || "APASIFIC Secretariat",
      verificationUrl: credential.verification_url,
      qrCodeDataUrl,
    });

    const pdfBuffer = await renderToBuffer(pdfElement);

    const fileName = `APASIFIC_Certificate_${credential.credential_number}.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
