const fs = require('fs');
try {
  const envConfig = fs.readFileSync('.env.local', 'utf8');
  envConfig.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) process.env[match[1]] = match[2].trim();
  });
} catch(e) {}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function checkAndCleanDB() {
  console.log("Mengecek duplikasi jurnal di Supabase...");
  
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/journals?select=*`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    if (!res.ok) {
      console.error("Gagal mengambil data jurnal:", await res.text());
      return;
    }
    
    const journals = await res.json();
    console.log(`Ditemukan total ${journals.length} entri jurnal.`);

    const seen = new Set();
    const duplicates = [];

    for (const j of journals) {
      // Kita cek berdasarkan nama
      if (seen.has(j.name)) {
        duplicates.push(j.id);
        console.log(`Duplikat terdeteksi: ${j.name} (ID: ${j.id})`);
      } else {
        seen.add(j.name);
      }
    }

    if (duplicates.length > 0) {
      console.log(`Menghapus ${duplicates.length} entri duplikat...`);
      for (const id of duplicates) {
        await fetch(`${supabaseUrl}/rest/v1/journals?id=eq.${id}`, {
          method: 'DELETE',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        });
        console.log(`Berhasil menghapus ID: ${id}`);
      }
    } else {
      console.log("Tidak ada duplikat yang ditemukan. Database aman!");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

checkAndCleanDB();
