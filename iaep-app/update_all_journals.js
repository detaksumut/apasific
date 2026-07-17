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

const updates = [
  { abbr: 'AJAF', name: 'AJAF - Akuntansi, Audit & Perpajakan' },
  { abbr: 'AJED', name: 'AJED - Ekonomi Pembangunan & Keuangan' },
  { abbr: 'AJEP', name: 'AJEP - Pendidikan Dasar, Menengah & Tinggi' },
  { abbr: 'AJCE', name: 'AJCE - Teknik Sipil, Mesin & Elektro' },
  { abbr: 'AJAFR', name: 'AJAFR - Pertanian, Kehutanan & Perikanan' },
  { abbr: 'AJADM', name: 'AJADM - Seni, Desain & Media Kreatif' },
  { abbr: 'AJIR', name: 'AJIR - Ilmu Politik & Hubungan Internasional' },
  { abbr: 'AJCS', name: 'AJCS - Pengabdian Kepada Masyarakat (PKM)' },
  { abbr: 'AJBA', name: 'AJBA - Manajemen, Bisnis dan Administrasi' },
  { abbr: 'AJLS', name: 'AJLS - Ilmu Hukum & Hak Asasi Manusia' },
  { abbr: 'AJPH', name: 'AJPH - Kedokteran, Kesehatan Masyarakat & Keperawatan' },
  { abbr: 'AJITE', name: 'AJITE - Ilmu Komputer & Teknologi Informasi' },
  { abbr: 'AJSSH', name: 'AJSSH - Sosiologi & Ilmu Pengetahuan Budaya' },
  { abbr: 'AJES', name: 'AJES - Ilmu Lingkungan & Keberlanjutan' },
  { abbr: 'AJTHM', name: 'AJTHM - Pariwisata & Manajemen Perhotelan' },
  { abbr: 'AJIS', name: 'AJIS - Disiplin Ilmu Agama dan Peradaban Islam' }
];

async function updateAllJournals() {
  console.log("Memperbarui semua nama jurnal di Supabase ke bahasa Indonesia...");
  
  for (const journal of updates) {
    try {
      // Menggunakan filter ilike pada kolom 'name' karena kolom 'abbreviation' tidak ada
      const res = await fetch(`${supabaseUrl}/rest/v1/journals?name=ilike.${journal.abbr}*`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ name: journal.name })
      });

      if (!res.ok) {
        console.error(`Gagal update ${journal.abbr}:`, await res.text());
      } else {
        const data = await res.json();
        if (data && data.length > 0) {
          console.log(`Berhasil update: ${journal.name}`);
        } else {
          console.log(`Tidak ditemukan jurnal dengan prefix ${journal.abbr} di database.`);
        }
      }
    } catch (error) {
      console.error(`Fetch failed for ${journal.abbr}:`, error);
    }
  }
  console.log("Selesai!");
}

updateAllJournals();
