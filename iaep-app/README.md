# ASIA (Association of Asia Pacific Academician) - System Architecture & Documentation

Dokumen ini disusun sebagai panduan teknis dan cetak biru (blueprint) komprehensif dari sistem digital **ASIA (Association of Asia Pacific Academician)**. Dokumen ini dapat diadaptasi menjadi draf buku panduan teknis yang menjelaskan secara mendalam tentang arsitektur Frontend, Backend, hingga modul-modul esensial seperti Sistem Jurnal Ilmiah (Double-Blind Peer Review), Sistem Ujian Sertifikasi, dan Wawancara Online.

---

## DAFTAR ISI
1. [Bab 1: Pendahuluan & Gambaran Umum Sistem](#bab-1-pendahuluan--gambaran-umum-sistem)
2. [Bab 2: Arsitektur Frontend & Backend](#bab-2-arsitektur-frontend--backend)
3. [Bab 3: Sistem Manajemen Struktur Organisasi (Leadership)](#bab-3-sistem-manajemen-struktur-organisasi)
4. [Bab 4: Sistem Jurnal Ilmiah (Double-Blind Peer Review)](#bab-4-sistem-jurnal-ilmiah-double-blind-peer-review)
5. [Bab 5: Sistem Ujian Sertifikasi (CBT)](#bab-5-sistem-ujian-sertifikasi-cbt)
6. [Bab 6: Sistem Wawancara Online (Online Interview)](#bab-6-sistem-wawancara-online)

---

## BAB 1: PENDAHULUAN & GAMBARAN UMUM SISTEM

**ASIA** hadir sebagai wadah pemersatu para akademisi, peneliti, dan profesional di wilayah Asia Pasifik. Untuk mendukung visinya, ASIA membangun sebuah ekosistem digital terpadu yang memfasilitasi administrasi organisasi, publikasi ilmiah berstandar internasional, hingga sertifikasi kompetensi.

Ekosistem digital ini dirancang untuk:
1. **Skalabilitas Tinggi:** Mampu menampung puluhan ribu anggota dan traffic tinggi.
2. **Keamanan Data:** Mematuhi standar privasi data akademik dan personal.
3. **User Experience (UX) Premium:** Antarmuka yang elegan, responsif, dan mudah digunakan (User-Friendly).

---

## BAB 2: ARSITEKTUR FRONTEND & BACKEND

Ekosistem ASIA dibangun dengan tumpukan teknologi (Tech Stack) modern:

### 2.1. Frontend (Antarmuka Pengguna)
- **Framework:** Next.js (React) - Dipilih karena kemampuan Server-Side Rendering (SSR) dan SEO yang sangat baik untuk portal publik.
- **Styling:** Kombinasi Vanilla CSS murni dan fitur modern untuk menghasilkan micro-animations, efek *glassmorphism*, dan desain *dark mode* yang elegan serta premium.
- **State Management:** React Hooks (useState, useEffect) untuk manajemen data dinamis di sisi klien.

### 2.2. Backend (Server & API)
- **Arsitektur:** Serverless Infrastructure menggunakan **Vercel**.
- **API Engine:** Next.js API Routes (Serverless & Edge Functions) yang menjembatani komunikasi antara UI dan Database. Fitur kompresi gambar (Client-Side Compression) diterapkan untuk mencegah error *413 Payload Too Large* saat mengelola file besar.

### 2.3. Database & Storage
- **Database:** Supabase (PostgreSQL) - Memberikan kapabilitas relasional yang kuat, dukungan Real-Time, serta Row Level Security (RLS) untuk keamanan data.
- **Storage:** Pengelolaan aset menggunakan Supabase Storage dan integrasi kompresi gambar berbasis Base64 / Canvas rendering.

---

## BAB 3: SISTEM MANAJEMEN STRUKTUR ORGANISASI

Sebuah sistem dinamis yang memungkinkan Administrator ASIA untuk mengelola jajaran pengurus (Dewan Pakar, Dewan Pengawas, dsb) secara *real-time*.

- **Dashboard Admin:** Modul antarmuka bagi admin untuk mengubah nama, jabatan, dan mengunggah foto profil pengurus.
- **Image Processing Engine:** Fitur kompresi foto otomatis di *browser* sebelum dikirim ke server. Sistem secara otomatis mengecilkan dimensi foto dan menurunkan rasio kualitas (JPEG 70%) demi menjaga kestabilan jaringan dan memori server.
- **Real-Time Render:** Segala perubahan di Dashboard Admin akan langsung merubah tampilan hierarki organisasi di halaman utama (Public Portal) tanpa perlu mengubah kode sumber.

---

## BAB 4: SISTEM JURNAL ILMIAH (DOUBLE-BLIND PEER REVIEW)

Modul ini adalah jantung dari ekosistem akademik ASIA, dirancang khusus untuk memfasilitasi penerbitan jurnal di 14 Divisi Akademik dengan standar etika publikasi internasional.

### 4.1. Double-Blind Protocol
Untuk menjaga objektivitas, sistem dirancang dengan algoritma penyamaran identitas:
- Identitas Penulis (*Author*) disembunyikan dari *Reviewer*.
- Identitas *Reviewer* disembunyikan dari Penulis.
- Sistem secara otomatis menghapus metadata dokumen (seperti nama pembuat file DOCX/PDF) saat naskah diunggah.

### 4.2. Alur Kerja (Workflow) Sistem Jurnal
1. **Submission (Penyerahan):** Author mengunggah naskah (Manuscript) melalui dashboard pribadi.
2. **Desk Review:** Editor in Chief / Managing Editor memeriksa kesesuaian ruang lingkup (scope) dan format awal. Editor juga menjalankan *Plagiarism Check* terintegrasi.
3. **Reviewer Assignment:** Editor menugaskan 2 atau lebih Reviewer pakar.
4. **Peer Review Process:** Reviewer memberikan penilaian melalui matriks rubrik dan memberikan catatan revisi.
5. **Revision:** Author merespons komentar Reviewer.
6. **Copyediting & Layouting:** Proses perapihan tata letak (Galley Proofing).
7. **Publication:** Naskah diterbitkan dengan DOI (Digital Object Identifier) dan diindeks secara otomatis.

---

## BAB 5: SISTEM UJIAN SERTIFIKASI (CBT)

ASIA menyelenggarakan berbagai program sertifikasi untuk akademisi. Modul *Computer Based Test* (CBT) dirancang dengan standar integritas tingkat tinggi.

### 5.1. Modul Registrasi & Validasi
- Peserta mendaftar pada program sertifikasi pilihan.
- Sistem mengintegrasikan validasi pembayaran dan syarat kelayakan secara otomatis.

### 5.2. CBT Engine & Proctoring (Pengawasan)
- **Time-Locked Sessions:** Ujian berjalan dengan pengatur waktu presisi tinggi. Akses akan terkunci otomatis saat waktu habis.
- **Randomized Question Bank:** Soal dan pilihan jawaban diacak (randomized) untuk setiap peserta guna mencegah kecurangan.
- **Auto-Grading:** Jawaban dinilai seketika setelah ujian selesai (untuk tipe soal Pilihan Ganda).
- **Proctoring Anti-Kecurangan:** (Fitur lanjutan) Memonitor perpindahan *tab* browser dan mewajibkan *Full-Screen Mode*. Pelanggaran akan tercatat dalam log ujian.

### 5.3. E-Certificate Issuance
Setelah peserta lulus, sistem langsung men-generate E-Sertifikat berbasis PDF yang dilengkapi dengan QR Code Cryptographic untuk keaslian dokumen.

---

## BAB 6: SISTEM WAWANCARA ONLINE

Sebagai tahap lanjutan dari seleksi penerimaan keanggotaan Fellow (FASIA), penerima dana riset (Grant), maupun penguji sertifikasi, ASIA menggunakan Modul Wawancara Online Terpadu.

### 6.1. Penjadwalan & Room Management
- **Automated Scheduling:** Peserta dapat memilih slot waktu yang tersedia melalui integrasi kalender.
- **Secure Meeting Rooms:** Sistem menghasilkan tautan *Virtual Room* unik yang hanya bisa diakses oleh kandidat dan *Panelist* pada waktu yang ditentukan.

### 6.2. Panelist Dashboard
- Antarmuka khusus bagi pewawancara (Panelist/Asesor).
- Pewawancara dapat melihat *Curriculum Vitae* (CV) dan dokumen portofolio kandidat secara berdampingan (Side-by-Side) dengan layar video.
- Terdapat sistem Rubrik Penilaian (Scoring Rubric) *real-time*. Skor dari berbagai pewawancara akan diagregasi secara otomatis oleh sistem.

### 6.3. Keputusan & Pengumuman
- Berdasarkan hasil agregasi skor, algoritma memberikan rekomendasi akhir (Lulus / Lulus Bersyarat / Tidak Lulus).
- Pengumuman dikirimkan melalui sistem notifikasi *Email* dan ter-update otomatis pada Dashboard kandidat.

---

*Hak Cipta © 2026 ASIA (Association of Asia Pacific Academician). Dokumen ini adalah Properti Intelektual Terdaftar.*
