import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

const JOURNALS = [
  {
    id: 1,
    name: 'AJAF - Journal of Accounting and Finance',
    abbreviation: 'AJAF',
    scopes: ['Akuntansi', 'Audit', 'Perpajakan', 'Keuangan', 'Tata Kelola Perusahaan', 'Sistem Informasi Akuntansi']
  },
  {
    id: 2,
    name: 'AJED - Journal of Economics and Development',
    abbreviation: 'AJED',
    scopes: ['Ekonomi Pembangunan', 'Ekonomi Regional', 'Kebijakan Publik', 'Ekonomi Internasional', 'Ketenagakerjaan']
  },
  {
    id: 3,
    name: 'AJEP - Journal of Education and Pedagogy',
    abbreviation: 'AJEP',
    scopes: ['Pendidikan Dasar', 'Pendidikan Menengah', 'Pendidikan Tinggi', 'Kurikulum', 'Teknologi Pendidikan', 'Evaluasi Pembelajaran']
  },
  {
    id: 4,
    name: 'AJCE - Journal of Civil and Mechanical Engineering',
    abbreviation: 'AJCE',
    scopes: ['Teknik Sipil', 'Teknik Mesin', 'Teknik Elektro', 'Infrastruktur', 'Ilmu Material', 'Energi Terbarukan']
  },
  {
    id: 5,
    name: 'AJAFR - Journal of Agriculture, Forestry and Fisheries',
    abbreviation: 'AJAFR',
    scopes: ['Agroteknologi', 'Agribisnis', 'Kehutanan', 'Perikanan', 'Ketahanan Pangan', 'Lingkungan Pertanian']
  },
  {
    id: 6,
    name: 'AJADM - Journal of Art, Design and Creative Media',
    abbreviation: 'AJADM',
    scopes: ['Seni Rupa', 'Desain Komunikasi Visual', 'Media Kreatif', 'Seni Pertunjukan', 'Kajian Budaya']
  },
  {
    id: 7,
    name: 'AJIR - Journal of International Relations and Politics',
    abbreviation: 'AJIR',
    scopes: ['Ilmu Politik', 'Hubungan Internasional', 'Kebijakan Luar Negeri', 'Studi Keamanan', 'Demokrasi']
  },
  {
    id: 8,
    name: 'AJCS - Journal of Community Service',
    abbreviation: 'AJCS',
    scopes: ['Pemberdayaan Masyarakat', 'Inovasi Sosial', 'Penerapan Teknologi Tepat Guna', 'Pelatihan dan Pendampingan']
  },
  {
    id: 9,
    name: 'AJBA - Journal of Business Administration',
    abbreviation: 'AJBA',
    scopes: ['Manajemen Bisnis', 'Administrasi Bisnis', 'Pemasaran', 'Sumber Daya Manusia', 'Kewirausahaan', 'Perilaku Organisasi']
  },
  {
    id: 10,
    name: 'AJLS - Journal of Law and Society',
    abbreviation: 'AJLS',
    scopes: ['Hukum Perdata', 'Hukum Pidana', 'Hukum Tata Negara', 'Hukum Internasional', 'Sosiologi Hukum', 'Hak Asasi Manusia']
  },
  {
    id: 11,
    name: 'AJPH - Journal of Public Health and Medicine',
    abbreviation: 'AJPH',
    scopes: ['Kedokteran', 'Kesehatan Masyarakat', 'Keperawatan', 'Epidemiologi', 'Kebijakan Kesehatan']
  },
  {
    id: 12,
    name: 'AJITE - Journal of IT & Engineering',
    abbreviation: 'AJITE',
    scopes: ['Ilmu Komputer', 'Teknologi Informasi', 'Kecerdasan Buatan', 'Rekayasa Perangkat Lunak', 'Sistem Informasi', 'Keamanan Siber']
  },
  {
    id: 13,
    name: 'AJSSH - Journal of Social Sciences & Humanities',
    abbreviation: 'AJSSH',
    scopes: ['Sosiologi', 'Antropologi', 'Sejarah', 'Ilmu Komunikasi', 'Filsafat', 'Ilmu Pengetahuan Budaya']
  },
  {
    id: 14,
    name: 'AJES - Journal of Environmental and Sustainability',
    abbreviation: 'AJES',
    scopes: ['Ilmu Lingkungan', 'Keberlanjutan', 'Mitigasi Perubahan Iklim', 'Konservasi Alam', 'AMDAL']
  },
  {
    id: 15,
    name: 'AJTHM - Journal of Tourism and Hospitality Management',
    abbreviation: 'AJTHM',
    scopes: ['Pariwisata', 'Manajemen Perhotelan', 'Ekowisata', 'Pemasaran Pariwisata', 'Gastronomi']
  },
  {
    id: 16,
    name: 'AJIS - Journal of Islamic Studies',
    abbreviation: 'AJIS',
    scopes: ['Studi Islam', 'Peradaban Islam', 'Pendidikan Islam', 'Hukum Keluarga Islam', 'Tafsir dan Hadis', 'Ekonomi Syariah']
  }
];

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Delete existing scopes
    await supabase.from('journal_scopes').delete().neq('name', 'non_existent');
    
    // Delete existing journals
    await supabase.from('journals').delete().neq('name', 'non_existent');

    const results = [];
    
    for (const journal of JOURNALS) {
      const { data: insertedJournal, error: insertError } = await supabase.from('journals').insert({
        name: journal.name,
        slug: journal.abbreviation.toLowerCase(),
        description: 'Official ASIA Journal for ' + journal.abbreviation
      }).select('id').single();

      if (insertError) {
        results.push({ journal: journal.name, error: insertError });
        continue;
      }

      const scopesToInsert = journal.scopes.map(scope => ({
        journal_id: insertedJournal.id,
        name: scope
      }));

      const { error: scopeError } = await supabase.from('journal_scopes').insert(scopesToInsert);
      
      results.push({ 
        journal: journal.name, 
        success: true,
        scopeError: scopeError || null
      });
    }

    return NextResponse.json({ success: true, message: "Database seeded", results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
