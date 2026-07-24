const SUPABASE_URL = "https://aroasmlrlpjbjokvxlgo.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyb2FzbWxybHBqYmpva3Z4bGdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzE4OTU5MCwiZXhwIjoyMDk4NzY1NTkwfQ.pSVcAi-8EpF9CMVCB7rcM5vhMlsJ9WgYURL2jyJyFfg";

async function checkFiles() {
    console.log("Mencari file-file PDF/DOCX yang tersesat (orphaned) di folder 'undefined/'...\n");
    
    try {
        const response = await fetch(`${SUPABASE_URL}/storage/v1/object/list/manuscripts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'apikey': SUPABASE_KEY
            },
            body: JSON.stringify({
                prefix: 'undefined',
                limit: 100,
                offset: 0,
                sortBy: { column: 'created_at', order: 'desc' }
            })
        });

        if (!response.ok) {
            const err = await response.text();
            console.error("Gagal membaca folder Storage:", err);
            return;
        }

        const files = await response.json();

        const validFiles = files.filter(f => 
            f.name.toLowerCase().endsWith('.pdf') || 
            f.name.toLowerCase().endsWith('.docx') ||
            f.name.toLowerCase().endsWith('.doc')
        );

        if (validFiles.length === 0) {
            console.log("✅ Tidak ditemukan file PDF/DOCX yang tersesat!");
        } else {
            console.log(`⚠️ Ditemukan ${validFiles.length} file yang tidak terhubung dengan naskah:\n`);
            validFiles.forEach((f, idx) => {
                const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/manuscripts/undefined/${f.name}`;
                console.log(`${idx + 1}. Nama: ${f.name}`);
                console.log(`   Dibuat: ${new Date(f.created_at).toLocaleString('id-ID')}`);
                console.log(`   URL: ${publicUrl}`);
                console.log("--------------------------------------------------");
            });
        }
        
    } catch(e) {
        console.error("Terjadi kesalahan:", e.message);
    }
}

checkFiles();
