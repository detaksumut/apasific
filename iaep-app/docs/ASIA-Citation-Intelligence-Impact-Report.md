# ASIA Citation Intelligence Integration Impact Report

Laporan audit awal ini memetakan arsitektur metrik sitasi eksistensial, pelacakan DOI, penjadwalan latar belakang, dan berkas penyedia (*provider stubs*) yang tersedia di repositori **ASIA** untuk mempersiapkan sprint pengembangan **ASIA Citation Intelligence Layer v1.0**.

---

## 1. Model Sitasi & Metrik Publikasi Eksistensial (Existing Citation Model)
* **Tabel Profil Dampak:** `public.researcher_impact_profiles`
  * Menyimpan metrik agregat per peneliti: `citation_count` (jumlah kutipan), `h_index`, `i10_index`, `publication_count`.
  * Penyedia Sumber Data: `source_provider` (e.g., `'SCOPUS'`, `'OPENALEX'`).
* **Tabel Histori Metrik:** `public.research_metrics`
  * Mencatat timeline histori perkembangan metrik: `metric_type` (e.g., `'CITATIONS'`), `value`, `provider`, dan `captured_at`.
* **Kolom Sitasi pada Submissions:** Kolom `submissions.scopus_citations` dan `submissions.wos_citations` sudah tersedia secara aditif dari migrasi sebelumnya untuk menyimpan angka sitasi langsung pada entitas publikasi.

## 2. Alur Pelacakan DOI Eksistensial (Existing DOI Flow)
* **Penyimpanan DOI:** DOI disimpan di kolom `submissions.doi` (setelah dideposit via Zenodo).
* **Resolver Layanan:** Tautan penyelesaian DOI saat ini diarahkan ke resolver global `https://doi.org/{doi}`.
* **Status Verifikasi:** Melalui `verifyAndRefreshIndexStatus` di `PublicationDepositService` yang secara berkala memeriksa status publikasi eksternal.

## 3. Arsitektur Penjadwalan & Latar Belakang (Existing Metrics Architecture)
* **Status Penjadwalan Latar Belakang:** Belum ada scheduler cron otomatis di sisi Next.js server.
* **Pola Integrasi:** Kita akan menggunakan rute API latar belakang (`/api/cron/metrics-sync`) yang diamankan dengan otorisasi Bearer Token untuk dipicu oleh Supabase pg_cron atau perayap eksternal guna meminimalkan beban runtime server utama.

## 4. Registrasi Penyedia Eksistensial (Existing Provider Registry)
* **Crossref Boundary:** Berkas [CrossrefProvider.ts](file:///d:/Users/apasific/iaep-app/src/providers/crossref/CrossrefProvider.ts) sudah terdaftar dengan status tiruan (*mock sandbox environment*).
* **OpenAlex Boundary:** Berkas [OpenAlexProvider.ts](file:///d:/Users/apasific/iaep-app/src/providers/openalex/OpenAlexProvider.ts) telah tersedia sebagai *stub/placeholder* untuk mengambil informasi metrik sitasi berdasarkan DOI.

---

## 5. Rencana Titik Integrasi & Dampak (Integration Points & Risk Assessment)
* **Titik Pemicuan:** Sinkronisasi metrik di dasbor penulis dan editor dipicu saat memuat statistik profil dampak peneliti.
* **Risiko Akses API Quota:** Sedang (Akses ke API OpenAlex publik akan menggunakan skema *Polite Pool API* dengan menyertakan alamat email resmi ASIA di header permintaan untuk mencegah pembatasan rate limit).
* **Risiko Modifikasi Database:** Rendah (Pembaruan metrik hanya memodifikasi tabel `researcher_impact_profiles` dan kolom sitasi di `submissions` secara aditif).
