export async function sendWa(target: string, message: string): Promise<boolean> {
  // Menggunakan kredensial Green API dari gambar yang Bapak kirimkan
  const idInstance = process.env.GREEN_API_ID || "710722686671";
  const apiToken = process.env.GREEN_API_TOKEN || "ffb8b974964a4331899e8c7db8ce40f17d5987ac70ca47c8b2";
  
  // URL Green API berdasarkan konfigurasi instance 7107
  const apiUrl = `https://7107.api.greenapi.com/waInstance${idInstance}/sendMessage/${apiToken}`;

  try {
    // Bersihkan karakter non-angka pada nomor tujuan (misal +62 jadi 62)
    const cleanTarget = target.replace(/[^0-9]/g, '');
    
    // Green API mewajibkan penambahan "@c.us" di akhir nomor tujuan WhatsApp standar
    const chatId = `${cleanTarget}@c.us`;

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chatId: chatId,
        message: message,
      }),
    });
    
    const data = await res.json();
    
    // Green API merespons dengan properti "idMessage" jika pengiriman sukses
    if (res.ok && data.idMessage) {
      return true;
    } else {
      console.error("Green API failed to send:", data);
      throw new Error(`Green API Error: ${JSON.stringify(data)}`);
    }
  } catch (e: any) {
    console.error("WhatsApp API error:", e);
    throw new Error(e.message || "Gagal terhubung ke server WhatsApp API");
  }
}
