import { NextResponse } from "next/server";
import { sendWa } from "@/utils/sendWa";

export async function POST(request: Request) {
  try {
    const { message, users } = await request.json();

    if (!message || !users || !Array.isArray(users)) {
      return NextResponse.json({ success: false, error: "Data tidak valid" }, { status: 400 });
    }

    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // Helper to wait to avoid rate limits
    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    for (const user of users) {
      if (!user.phone) {
        failedCount++;
        errors.push(`Tidak ada nomor HP untuk ${user.name}`);
        continue;
      }

      try {
        // Replace variables if we want to allow personalization
        const personalizedMessage = message.replace(/{{name}}/g, user.name);
        
        await sendWa(user.phone, personalizedMessage);
        successCount++;
        
        // Wait 1 second between sends to avoid rate limit bans on WhatsApp APIs
        await delay(1000);
      } catch (err: any) {
        failedCount++;
        errors.push(`Gagal mengirim ke ${user.name}: ${err.message}`);
      }
    }

    return NextResponse.json({ 
      success: true, 
      successCount, 
      failedCount, 
      errors,
      message: `Berhasil mengirim ke ${successCount} orang. Gagal: ${failedCount} orang.`
    });
  } catch (error: any) {
    console.error("Bulk WA Send Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
