const SUPABASE_URL = "https://aroasmlrlpjbjokvxlgo.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyb2FzbWxybHBqYmpva3Z4bGdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzE4OTU5MCwiZXhwIjoyMDk4NzY1NTkwfQ.pSVcAi-8EpF9CMVCB7rcM5vhMlsJ9WgYURL2jyJyFfg";

async function investigateEmptyFiles() {
    console.log("Menginvestigasi 22 naskah yang file_url-nya kosong...\n");
    
    try {
        const subRes = await fetch(`${SUPABASE_URL}/rest/v1/submissions?file_url=is.null&select=id,title,created_at,status&order=created_at.desc`, {
            headers: { 'Authorization': `Bearer ${SUPABASE_KEY}`, 'apikey': SUPABASE_KEY }
        });
        const submissions = await subRes.json();
        
        console.log(`Menampilkan 10 naskah terbaru (dari total ${submissions.length}):\n`);
        
        submissions.slice(0, 10).forEach((sub, idx) => {
            console.log(`${idx + 1}. [${new Date(sub.created_at).toLocaleString('id-ID')}] ${sub.title.slice(0, 50)}...`);
            console.log(`   Status: ${sub.status}`);
        });

    } catch(e) {
        console.error("Error:", e.message);
    }
}

investigateEmptyFiles();
