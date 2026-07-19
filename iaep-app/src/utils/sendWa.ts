export async function sendWa(target: string, message: string, imageUrl?: string): Promise<boolean> {
  const token = "NuENajiEsZG5UWxZsAyE"; // Memaksa menggunakan token baru, mengabaikan token lama di Vercel
  
  if (!token) {
    console.warn("[Apasific WA System] FONNTE_TOKEN is not set in environment variables. Message simulated:");
    console.log(`To: ${target}\nMessage: ${message}`);
    return false; // Simulated success but not actually sent
  }

  try {
    const cleanTarget = target.replace(/[^0-9]/g, '');
    const params: any = {
      target: cleanTarget,
      message: message,
    };
    if (imageUrl) {
      params.url = imageUrl;
    }
    const postData = new URLSearchParams(params).toString();

    const https = require('https');
    const options = {
      hostname: 'api.fonnte.com',
      port: 443,
      path: '/send',
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res: any) => {
        let data = '';
        res.on('data', (chunk: any) => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (!parsed.status) {
              console.error("Fonnte failed to send:", parsed);
              reject(new Error(`Fonnte API Error: ${parsed.reason || JSON.stringify(parsed)}`));
            } else {
              resolve(true);
            }
          } catch(e) {
            reject(new Error("Invalid JSON from Fonnte"));
          }
        });
      });

      req.on('error', (e: any) => {
        reject(new Error(`Network Error: ${e.message}`));
      });

      req.write(postData);
      req.end();
    });
  } catch (e: any) {
    console.error("Fonnte API error:", e);
    throw new Error(e.message || "Unknown error connecting to Fonnte");
  }
}
