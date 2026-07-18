import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const token = process.env.FONNTE_TOKEN;
    if (!token) return NextResponse.json({ error: "No token" });

    // 1. Check device status
    const devRes = await fetch("https://api.fonnte.com/device", {
      method: "POST",
      headers: { "Authorization": token }
    });
    const deviceData = await devRes.json();

    // 2. Test sending a message to the target number
    const target = "62811665212";
    const sendRes = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: { "Authorization": token },
      body: new URLSearchParams({
        target: target,
        message: "Tes pesan dari sistem APASIFIC",
      })
    });
    const sendData = await sendRes.json();

    return NextResponse.json({ 
      deviceInfo: deviceData,
      sendTestResult: sendData
    });
  } catch(e: any) {
    return NextResponse.json({ error: e.message });
  }
}
