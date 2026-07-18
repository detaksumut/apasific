export async function sendWa(target: string, message: string): Promise<boolean> {
  const token = process.env.FONNTE_TOKEN;
  
  if (!token) {
    console.warn("[Apasific WA System] FONNTE_TOKEN is not set in environment variables. Message simulated:");
    console.log(`To: ${target}\nMessage: ${message}`);
    return false; // Simulated success but not actually sent
  }

  try {
    const cleanTarget = target.replace(/[^0-9]/g, '');
    const res = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        "Authorization": token,
      },
      body: new URLSearchParams({
        target: cleanTarget,
        message: message,
      }),
    });
    
    const data = await res.json();
    if (!data.status) {
      console.error("Fonnte failed to send:", data);
      throw new Error(`Fonnte API Error: ${data.reason || JSON.stringify(data)}`);
    }
    return true;
  } catch (e: any) {
    console.error("Fonnte API error:", e);
    throw new Error(e.message || "Unknown error connecting to Fonnte");
  }
}
