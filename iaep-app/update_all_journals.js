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

// PENTING: Filter menggunakan slug (exact match) agar AJAFR tidak tertimpa filter AJAF
// Bug sebelumnya: ilike.AJAF* juga mencocokkan AJAFR -> nama AJAFR jadi sama dengan AJAF
const updates = [
  { abbr: 'AJAFR', slug: 'ajafr', name: 'AJAFR - Pertanian, Kehutanan & Perikanan' },
  { abbr: 'AJSSH', slug: 'ajssh', name: 'AJSSH - Sosiologi & Ilmu Pengetahuan Budaya' },
  { abbr: 'AJTHM', slug: 'ajthm', name: 'AJTHM - Pariwisata & Manajemen Perhotelan' },
  { abbr: 'AJITE', slug: 'ajite', name: 'AJITE - Ilmu Komputer & Teknologi Informasi' },
  { abbr: 'AJADM', slug: 'ajadm', name: 'AJADM - Seni, Desain & Media Kreatif' },
  { abbr: 'AJAF',  slug: 'ajaf',  name: 'AJAF - Akuntansi, Audit & Perpajakan' },
  { abbr: 'AJED',  slug: 'ajed',  name: 'AJED - Ekonomi Pembangunan & Keuangan' },
  { abbr: 'AJEP',  slug: 'ajep',  name: 'AJEP - Jurnal Pendidikan' },
  { abbr: 'AJCE',  slug: 'ajce',  name: 'AJCE - Teknik Sipil, Mesin & Elektro' },
  { abbr: 'AJIR',  slug: 'ajir',  name: 'AJIR - Ilmu Politik & Hubungan Internasional' },
  { abbr: 'AJCS',  slug: 'ajcs',  name: 'AJCS - Pengabdian Kepada Masyarakat (PKM)' },
  { abbr: 'AJBA',  slug: 'ajba',  name: 'AJBA - Manajemen, Bisnis dan Administrasi' },
  { abbr: 'AJLS',  slug: 'ajls',  name: 'AJLS - Ilmu Hukum & Hak Asasi Manusia' },
  { abbr: 'AJPH',  slug: 'ajph',  name: 'AJPH - Kedokteran, Kesehatan Masyarakat & Keperawatan' },
  { abbr: 'AJES',  slug: 'ajes',  name: 'AJES - Ilmu Lingkungan & Keberlanjutan' },
  { abbr: 'AJIS',  slug: 'ajis',  name: 'AJIS - Disiplin Ilmu Agama dan Peradaban Islam' }
];

async function updateAllJournals() {
  console.log("Memperbarui semua nama jurnal di Supabase ke bahasa Indonesia...");
  
  for (const journal of updates) {
    try {
      // Gunakan slug (exact match) agar tidak overlap antar prefix (misal: AJAF vs AJAFR)
      const res = await fetch(`${supabaseUrl}/rest/v1/journals?slug=eq.${journal.slug}`, {
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
