import { NextResponse } from "next/server";
import { sendWa } from "@/utils/sendWa";

export async function POST(request: Request) {
  try {
    const { name, phone } = await request.json();

    if (!phone) {
      return NextResponse.json({ success: false, error: "Nomor WhatsApp tidak ditemukan untuk user ini." }, { status: 400 });
    }

    const message = `Halo, Yth. ${name}! 👋

Selamat datang di keluarga besar Asia Index & Metric (Association Asia Pacific Academicians)! 🎉

Kami mengucapkan terima kasih yang sebesar-besarnya atas kesediaan Anda untuk bergabung di sistem publikasi akademik kami. Keahlian dan pengalaman Anda akan sangat berarti dalam menjaga kualitas serta standar integritas ilmiah jurnal-jurnal di bawah naungan APASIFIC. 

Salam Hormat,
Redaksi Asia Index & Metric Association Asia Pacific Academicians 🌐 https://apasific.org`;

    // Kirim via WA (Apasific Fonnte Token)
    const waResponse = await sendWa(phone, message);

    return NextResponse.json({ success: true, response: waResponse });
  } catch (error: any) {
    console.error("WA Send Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
