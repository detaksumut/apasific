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
      return false;
    }
    return true;
  } catch (e) {
    console.error("Fonnte API error:", e);
    return false;
  }
}
