# ASIA Research Impact Analytics Integration Impact Report

Laporan audit ini memetakan arsitektur dasbor visualisasi eksistensial, komponen analisis profil peneliti, dan visualisasi grafik yang tersedia di repositori **ASIA** untuk mempersiapkan sprint pengembangan **ASIA Research Impact Analytics Layer v1.0**.

---

## 1. Arsitektur Dasbor & Visualisasi Eksistensial (Existing Dashboard Architecture)
* **Kebutuhan Library Charting:** Berdasarkan pemeriksaan berkas `package.json`, tidak ada pustaka bagan/grafik eksternal (seperti Chart.js atau Recharts) yang terpasang di sistem.
* **Pilihan Visualisasi:** Untuk menjaga performa dan kesesuaian dengan arsitektur *Vanilla CSS & CSS Modules*, kita akan merancang grafik visualisasi dinamis menggunakan elemen **SVG murni** dan transisi CSS halus. Ini meminimalkan penambahan dependensi pihak ketiga baru dan menjaga ukuran berkas bundel tetap kecil.

## 2. Komponen Analisis Profil Peneliti (Existing Analytics Components)
* **Temuan Audit:** Berkas [ResearchProfile.tsx (src/components/dashboard/author/ResearchProfile.tsx)](file:///d:/Users/apasific/iaep-app/src/components/dashboard/author/ResearchProfile.tsx) saat ini masih sepenuhnya menggunakan data dummy manual dan bertindak sebagai *static placeholder*.
* **Titik Konektivitas:** Komponen ini akan dimodifikasi agar secara dinamis memanggil Supabase database untuk memuat:
  * Agregasi sitasi eksistensial dari `researcher_impact_profiles`.
  * Rincian histori tren sitasi bulanan/tahunan dari `research_metrics`.
  * Tautan identitas terverifikasi dari `researcher_identifiers` (ORCID URL).

## 3. Struktur Relasi Institusional & Keamanan (Role Access Model)
* **Akses Pengguna:** Halaman profil dampak riset akan dapat diakses oleh peneliti itu sendiri (dasbor penulis/author) dan juga dapat disematkan di portal publik untuk memamerkan keaslian publikasi ilmiah ASIA.
* **Pemisahan Data:** Skema Keamanan RLS di Supabase (sebagaimana didefinisikan pada migrasi `researcher_impact_profiles` dan `research_metrics`) telah mendukung kebijakan akses global `FOR SELECT USING (true)` sehingga data profil dampak riset bersifat publik dan dapat dirayap oleh mesin pencari ilmiah.

## 4. Rencana Kerja Sprint Selanjutnya (Next Phase Implementation Strategy)
* **Modifikasi Kode:**
  * Mengintegrasikan [ResearchIntelligenceService.ts](file:///d:/Users/apasific/iaep-app/src/services/research-intelligence/ResearchIntelligenceService.ts) untuk mengotomatiskan query database dan memanggil provider.
  * Memperbarui halaman profil riset penulis di dasbor agar dinamis dan responsif terhadap perubahan data sitasi riil.
