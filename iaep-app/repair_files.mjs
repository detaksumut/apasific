const SUPABASE_URL = "https://aroasmlrlpjbjokvxlgo.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyb2FzbWxybHBqYmpva3Z4bGdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzE4OTU5MCwiZXhwIjoyMDk4NzY1NTkwfQ.pSVcAi-8EpF9CMVCB7rcM5vhMlsJ9WgYURL2jyJyFfg";

async function repairFiles() {
    console.log("Memulai proses pemulihan (repair) naskah...\n");
    
    try {
        // 1. Fetch orphaned files
        const listRes = await fetch(`${SUPABASE_URL}/storage/v1/object/list/manuscripts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SUPABASE_KEY}`, 'apikey': SUPABASE_KEY },
            body: JSON.stringify({ prefix: 'undefined', limit: 100 })
        });
        const files = await listRes.json();
        
        // Only take anonymous files (those are what reviewers see)
        const anonFiles = files.filter(f => f.name.toLowerCase().includes('anonymous'));

        // 2. Fetch submissions where file_url is null
        const subRes = await fetch(`${SUPABASE_URL}/rest/v1/submissions?file_url=is.null&select=id,title,created_at`, {
            headers: { 'Authorization': `Bearer ${SUPABASE_KEY}`, 'apikey': SUPABASE_KEY }
        });
        const submissions = await subRes.json();
        
        console.log(`Ditemukan ${submissions.length} naskah dengan file_url kosong.`);

        for (const sub of submissions) {
            const subDate = new Date(sub.created_at).getTime();
            
            // Find closest anonymous file (within 5 minutes)
            let bestMatch = null;
            let minDiff = 5 * 60 * 1000; 
            
            for (const file of anonFiles) {
                const fileDate = new Date(file.created_at).getTime();
                const diff = Math.abs(subDate - fileDate);
                if (diff < minDiff) {
                    minDiff = diff;
                    bestMatch = file;
                }
            }
            
            if (bestMatch) {
                console.log(`\nMencocokkan naskah: "${sub.title}"`);
                console.log(`-> Ditemukan file: ${bestMatch.name} (Beda waktu: ${Math.round(minDiff/1000)} detik)`);
                
                const filePublicUrl = `${SUPABASE_URL}/storage/v1/object/public/manuscripts/undefined/${bestMatch.name}`;
                
                // Update Supabase
                const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/submissions?id=eq.${sub.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SUPABASE_KEY}`, 'apikey': SUPABASE_KEY },
                    body: JSON.stringify({ 
                        file_url: filePublicUrl
                    })
                });
                
                if (patchRes.ok) {
                    console.log(`✅ Berhasil diupdate di Supabase!`);
                } else {
                    console.log(`❌ Gagal update Supabase: ${await patchRes.text()}`);
                }
            }
        }
        
        console.log("\nProses selesai!");
    } catch(e) {
        console.error("Error:", e.message);
    }
}

repairFiles();
