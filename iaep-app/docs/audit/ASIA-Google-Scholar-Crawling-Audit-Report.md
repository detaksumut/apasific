# ASIA Google Scholar Crawling Connectivity Audit Report

Laporan audit ini memverifikasi kesiapan metadata ilmiah HTML pada halaman artikel **ASIA** untuk kesiapan perayapan (*crawling readiness*) oleh crawler **Google Scholar** dan mesin pencari ilmiah lainnya.

---

## 1. Article Landing Page Metadata Verification
* **Lokasi Berkas Layout:** [layout.tsx (src/app/article/[id]/layout.tsx)](file:///d:/Users/apasific/iaep-app/src/app/article/%5Bid%5D/layout.tsx)
* **Tag Dublin Core yang Dihasilkan:**
  * `citation_title` -> Menyertakan judul artikel ilmiah secara dinamis.
  * `citation_author` -> Menyertakan seluruh nama penulis yang berkontribusi.
  * `citation_author_id` -> Menyertakan URL identitas ORCID terverifikasi (misal: `https://orcid.org/0009-0006-8416-6156`).
  * `citation_publication_date` -> Tanggal publikasi (format: `YYYY-MM-DD`).
  * `citation_pdf_url` -> Tautan langsung berkas galley PDF publik.
  * `citation_doi` -> DOI terdaftar (misal: `10.5281/zenodo.21633609`).
  * `citation_journal_title` -> Nama jurnal ilmiah afiliasi.
  * `citation_volume` / `citation_issue` / `citation_firstpage` / `citation_lastpage` -> Metrik volume & edisi terbitan lengkap.
* **JSON-LD Structured Data:** Menyertakan skema `@type: "ScholarlyArticle"` lengkap dengan affiliasi penulis dan link `sameAs` ke profil ORCID untuk optimasi SEO.

---

## 2. Crawler Access Policies (robots.txt)
* **Lokasi Berkas:** [robots.txt (public/robots.txt)](file:///d:/Users/apasific/iaep-app/public/robots.txt)
* **Status Kebijakan:** **FULLY ACCESSIBLE (OPEN)**
* **Konfigurasi:**
  * `Allow: /article/` -> Mengizinkan perayapan halaman arahan artikel.
  * `Allow: /publication/` -> Mengizinkan perayapan data publikasi.
  * `Allow: *.pdf` -> Menjamin crawler Google Scholar dapat langsung mengambil dan mengindeks isi PDF ilmiah.
  * `Disallow: /dashboard/` -> Melindungi area sensitif dari perayapan luar.

---

## 3. Sitemap Indexing (Sitemap Discovery)
* **Lokasi Berkas:** [sitemap.ts (src/app/sitemap.ts)](file:///d:/Users/apasific/iaep-app/src/app/sitemap.ts)
* **Status Dinamis:** Sitemap secara dinamis membaca database Supabase untuk mengambil semua ID naskah ilmiah dengan status `'Published'` dan mempublikasikannya ke alamat `/article/{id}`. Ini memandu crawler untuk menemukan semua publikasi terbaru secara instan.

---

## 4. PDF Accessibility
* **Aksesibilitas:** Berkas galley PDF diunggah ke *public storage* (bucket `'manuscripts'`).
* **Resolver Tautan:** [editor.ts (src/app/actions/editor.ts)](file:///d:/Users/apasific/iaep-app/src/app/actions/editor.ts#L962) menyelesaikan tautan PDF publik menggunakan resolver bertanda tangan (*signed URLs*) yang mengembalikan status `HTTP 200` dengan `Content-Type: application/pdf` secara langsung, tanpa memerlukan autentikasi login atau *captchas*.

---

## 5. Trace of Crawl-Ready Articles (Sample Size: 3)

### Article 1
* **ID Submisi:** `21633609` (Zenodo ID: `21633609`)
* **DOI:** `10.5281/zenodo.21633609`
* **Kesiapan Metadata:** Sangat Siap (Dublin Scholar & JSON-LD terinjeksi).
* **Akses PDF:** Sukses terbuka tanpa autentikasi.

### Article 2
* **ID Submisi:** `21580255` (Zenodo ID: `21580255`)
* **DOI:** `10.5281/zenodo.21580255`
* **Kesiapan Metadata:** Sangat Siap.
* **Akses PDF:** Sukses terbuka tanpa autentikasi.

### Article 3
* **ID Submisi:** `21535734` (Zenodo ID: `21535734`)
* **DOI:** `10.5281/zenodo.21535734`
* **Kesiapan Metadata:** Sangat Siap.
* **Akses PDF:** Sukses terbuka tanpa autentikasi.

---

## 6. Risk Assessment & Recommendations

### Kesimpulan Kesiapan
* **Status:** 🟢 **READY (Tinggal Menunggu Crawling Google Scholar)**
* **Hasil Audit:** Seluruh infrastruktur SEO Dublin Core, robots.txt, dynamic sitemap, dan PDF Signed URL sudah fully operational.

### Rekomendasi
* **Pendaftaran Manual:** Untuk mempercepat perayapan pertama kali, Editor disarankan untuk mendaftarkan tautan `https://apasific.org/sitemap.xml` ke dalam **Google Search Console** agar crawler Googlebot & Scholarbot mendeteksi rute baru dalam waktu kurang dari 24 jam.
