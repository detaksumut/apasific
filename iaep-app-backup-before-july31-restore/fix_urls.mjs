const SUPABASE_URL = "https://aroasmlrlpjbjokvxlgo.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyb2FzbWxybHBqYmpva3Z4bGdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzE4OTU5MCwiZXhwIjoyMDk4NzY1NTkwfQ.pSVcAi-8EpF9CMVCB7rcM5vhMlsJ9WgYURL2jyJyFfg";

async function fixUrls() {
    console.log("Memperbaiki semua URL file di database agar kompatibel dengan Signed URL...");
    
    try {
        const subRes = await fetch(`${SUPABASE_URL}/rest/v1/submissions?select=id,file_url&file_url=like.https://*`, {
            headers: { 'Authorization': `Bearer ${SUPABASE_KEY}`, 'apikey': SUPABASE_KEY }
        });
        const submissions = await subRes.json();
        
        let fixedCount = 0;
        
        for (const sub of submissions) {
            if (sub.file_url.includes('/storage/v1/object/public/manuscripts/')) {
                // Extract just the path (e.g., undefined/xxx.docx or 1234/xxx.pdf)
                const rawPath = sub.file_url.split('/storage/v1/object/public/manuscripts/')[1];
                
                if (rawPath) {
                    const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/submissions?id=eq.${sub.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SUPABASE_KEY}`, 'apikey': SUPABASE_KEY },
                        body: JSON.stringify({ file_url: decodeURIComponent(rawPath) })
                    });
                    if (patchRes.ok) fixedCount++;
                }
            }
        }
        
        console.log(`✅ Selesai! Berhasil memperbaiki format URL untuk ${fixedCount} naskah.`);
    } catch(e) {
        console.error("Error:", e.message);
    }
}

fixUrls();
