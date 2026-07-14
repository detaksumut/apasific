# ASIA (Association of Asia Pacific Academician) - Master Engineering Blueprint

Dokumen ini adalah **Engineering Blueprint** tunggal dan komprehensif yang mendokumentasikan arsitektur teknis, proses bisnis, pedoman kode, serta seluruh keputusan arsitektur sistem digital ASIA. Blueprint ini ditujukan untuk memandu para insinyur (*developer*) dalam merawat, memperluas, dan memahami platform dari hulu ke hilir tanpa keraguan.

---

## 1. Executive Summary

- **Vision**  
  Menjadi ekosistem digital terpusat yang mewadahi para akademisi, peneliti, dan profesional di kawasan Asia Pasifik untuk berkolaborasi dan berkontribusi secara global.
- **Mission**  
  Menyediakan platform terintegrasi (End-to-End) untuk publikasi ilmiah berstandar internasional, sertifikasi kompetensi (CBT), dan manajemen keanggotaan akademik yang efisien.
- **Objectives**  
  Membangun sistem berskala tinggi (*highly scalable*), sangat aman (*secure by design*), dan mudah digunakan (*user-friendly*) bagi puluhan ribu anggota, editor, reviewer, dan asesor.
- **Scope**  
  Sistem meliputi Portal Publik, Dashboard Manajemen (Admin, Editor, Reviewer, Member), Sistem Manajemen Publikasi (Double-Blind Peer Review), Sistem Sertifikasi (Ujian Online & Wawancara), serta Pengelolaan Keanggotaan dan Penagihan.
- **Business Goals**  
  Mempercepat dan merampingkan proses *peer-review* jurnal hingga 50%, mendigitalisasi 100% proses sertifikasi, dan memastikan perlindungan Hak Kekayaan Intelektual (HKI) Penulis.
- **Success Criteria**  
  Sistem stabil (*uptime* 99.9%), durasi muat API cepat (< 300ms), skalabilitas terjamin (tanpa hambatan/bottleneck), dan tercapainya standar 0 insiden kebocoran data (*zero data breach*).

---

## 2. Business Architecture

Platform digital ASIA mengotomatisasi serangkaian proses bisnis inti organisasi:

- **Membership**  
  Pendaftaran anggota baru, validasi identitas dan jenjang akademik, persetujuan level keanggotaan (seperti Fellow FASIA), dan penagihan perpanjangan keanggotaan rutin.
- **Publication**  
  Penerimaan naskah artikel ilmiah (*submission*) ke dalam **16 Divisi Akademik**, penyaringan format, pendistribusian ke panel Editor, penugasan *Reviewer* secara rahasia (Double-Blind), hingga publikasi jurnal (*Publishing*).
- **Certification**  
  Pendaftaran ujian sertifikasi (kompetensi & profesi), sistem pembayaran, pelaksanaan Ujian Berbasis Komputer (CBT), dan penerbitan E-Certificate resmi ASIA.
- **Conference**  
  Manajemen acara berskala internasional, reservasi tiket partisipan, pengumpulan materi *Call for Papers*, dan manajemen jadwal simposium.
- **Research**  
  Aplikasi dan pencairan dana hibah penelitian (*Grant*), pengumpulan laporan berkala, pelacakan progres akademik, dan evaluasi hasil riset oleh dewan kurator.
- **Awards**  
  Portal nominasi penghargaan akademik bergengsi, mekanisme evaluasi panelist, hingga pengumuman pemenang penganugerahan.
- **Community**  
  Forum komunikasi antar-anggota terdaftar, kelompok riset terfokus (SIGs), dan sistem penawaran bursa kolaborasi proyek.
- **Corporate**  
  Manajemen kerja sama Business-to-Business (B2B), perjanjian MoU antar universitas, serta dokumentasi legal kemitraan institusi.

---

## 3. Enterprise Architecture

- **Architecture Principles**  
  - *Cloud-Native & Serverless*: Tidak mengelola *Virtual Machine* secara manual; semua layanan di-hosting secara serverless agar berskala otomatis.
  - *Secure by Design*: Semua data dilindungi dengan kontrol hak akses granular (RLS).
  - *Single Source of Truth*: Data terpusat dalam satu relational database.
- **Layer Architecture**  
  - **Presentation Layer (UI)**: Halaman aplikasi interaktif (Next.js App Router).
  - **Application/Service Layer**: *Server Actions* dan *API Routes* yang mengelola logika bisnis (Next.js Node.js Runtime).
  - **Data Layer**: Penyimpanan data persisten dan *Storage* file (PostgreSQL via Supabase).
- **Component Architecture**  
  Sistem dipilah secara logis (Domain-Driven) ke dalam modul-modul independen yang dapat diperluas: Modul Auth, Modul Jurnal (OJS), Modul CBT, dan Modul Dashboard.
- **Integration Architecture**  
  Komunikasi internal berjalan secara *stateless*. Integrasi dengan entitas eksternal (misal: Gateway Pembayaran) dilakukan via mekanisme Webhook tersinkronisasi.

---

## 4. Domain Model

Definisi *Bounded Context* di dalam arsitektur perangkat lunak:

### Membership
- **Responsibility**: Mengelola data demografi dan akses akun pendaftar.
- **Entity**: `profiles`, `leadership_members`.
- **Service**: Registrasi, Upgrade Tier Keanggotaan, Edit Profil.
- **Dependency**: Auth, Finance (Penagihan).

### Publication
- **Responsibility**: Siklus hidup naskah artikel ilmiah.
- **Entity**: `journals`, `submissions`, `submission_files`, `review_assignments`.
- **Service**: Pengunggahan PDF/Docx, *Routing* ke Editor, Input Rubrik Reviewer.
- **Dependency**: Workflow, Document, Notification.

### Certification
- **Responsibility**: Standarisasi akademik via ujian komprehensif.
- **Entity**: `certifications`, `certification_candidates`, `cbt_sessions`.
- **Service**: Pembuatan soal acak, *Timer* ujian, *Auto-Grading*.
- **Dependency**: Finance, Certificate, Audit.

### Conference, Research, Awards, Community
- **Responsibility**: Kelola acara, pengajuan hibah, nominasi penganugerahan, forum internal.
- **Entity**: Tabel `events`, `grants`, `awards`, `discussions`.
- **Dependency**: Media, Notification, Auth.

### Finance
- **Responsibility**: Arus kas, rekonsiliasi pembayaran.
- **Entity**: `transactions`, `invoices`.
- **Dependency**: Layanan Payment Gateway Eksternal.

### Document & Media
- **Responsibility**: Penyimpanan aset digital (PDF, Word, Gambar) dan kompresi media.
- **Entity**: `submission_files`, Supabase Storage Buckets.

### Notification & Workflow
- **Responsibility**: Meneruskan pesan dan memandu alur statis.
- **Entity**: `submission_history`, (Webhook / Email Trigger).

### Search & Audit
- **Responsibility**: Mesin pencarian repositori naskah (*Full-Text*) dan pencatatan riwayat sistem demi transparansi.
- **Entity**: `audit_logs`, `submission_history`.

---

## 5. Shared Core Services

- **Authentication**: JWT (JSON Web Token) dan OAuth terkelola secara sentralisasi oleh Supabase Auth.
- **Authorization**: Role-Based Access Control (RBAC) diterapkan di lapis Middleware (contoh: hanya entitas *Editor* yang dapat mengakses `/dashboard/editor`).
- **Identity**: Pemisahan akun *User* dan hak kepanitiaan organisasi secara spesifik.
- **Workflow**: Mesin mutasi *State* (misal: Status naskah berpindah dari *Queued* -> *Awaiting Reviewers* -> *Under Review*).
- **Notification**: Notifikasi asinkronus (Email/Real-Time Push).
- **Payment**: Layanan terisolasi penghasil *Virtual Account*/Invoice.
- **Document**: Supabase Storage untuk *hosting* Naskah dan CV.
- **Search**: *Full-Text Search* menggunakan fitur indeks PostgreSQL.
- **Logging & Audit**: Tabel agregasi untuk melacak siapa yang melakukan aksi apa (penting untuk jejak rekam perombakan keputusan Reviewer).
- **QR & Certificate**: Modul penghasil dokumen PDF otomatis lengkap dengan stempel kriptografi *QR Code*.
- **Media**: Mekanisme kompresi aset gambar secara instan di sisi klien sebelum diunggah ke server (memangkas biaya *bandwidth*).

---

## 6. Data Architecture

- **ERD & Entity Relationship**  
  Database utama berbasis relasional ketat (PostgreSQL). Contoh: Satu *Journal* (1) memiliki Banyak *Submissions* (N); Satu *Submission* (1) memiliki Banyak *Review Assignments* (N).
- **UUID Strategy**  
  Setiap *Primary Key* wajib menggunakan **UUID (Universally Unique Identifier)** generasi V4. Hal ini mencegah peretas menebak ID data (seperti Naskah ke-`4` atau ke-`5`), menghindari tabrakan entitas, dan menyembunyikan ukuran basis data asli.
- **Database Schema**  
  Dikumpulkan di dalam skema `public` PostgreSQL, diamankan dengan filter `Row Level Security` (RLS).
- **Migration Strategy**  
  Perubahan struktur basis data ditulis dalam format file SQL terpisah (misal: `supabase/migrations/...`) dan dieksekusi secara kronologis.
- **Backup Strategy**  
  Point-in-Time Recovery (PITR) harian yang di-*hosting* otomatis oleh penyedia layanan (Supabase).
- **Recovery Strategy**  
  Replika data *Cloud-based*. RTO (Recovery Time Objective) ditetapkan di bawah 4 jam saat insiden fatal.

---

## 7. Frontend Architecture

- **Folder Structure**  
  Menggunakan kerangka standar *Next.js App Router*:
  - `/src/app/` (Halaman & Routing)
  - `/src/components/` (Elemen Visual)
  - `/public/` (Aset statis dan File HTML)
- **Routing**  
  Berbasis *File-System Routing* dengan pencegatan akses (Intercept) di `middleware.ts`.
- **Component**  
  *Atomic Design*. Komponen modular yang menggunakan Vanilla CSS untuk efisiensi ruang muat tinggi dan minim *layout shift*.
- **State Management**  
  Hanya menggunakan React Hooks bawaan (`useState`, `useEffect`, `useContext`) tanpa pustaka eksternal raksasa untuk menjaga ukuran *bundle* tetap kecil.
- **Responsive Design**  
  *Mobile-First Approach*. Seluruh desain (termasuk *Glassmorphism* & animasi CSS) wajib adaptif dari layar ponsel hingga Desktop.
- **SEO & Static Synchronization**  
  Banyaknya profil divisi yang dimuat statis (`.html` di `/public`) diselaraskan massal secara berkala menggunakan skrip *Mass HTML Synchronization* agar struktur menunya (seperti **16 Divisi Akademik**) 100% kongruen dengan versi dinamis Next.js.
- **Performance**  
  Pemuatan asinkron (*Lazy Loading*), optimasi gambar format WebP, serta pemanfaatan kompresi otomatis di Vercel CDN.

---

## 8. Backend Architecture

- **API Layer**  
  Dibangun dengan arsitektur *Next.js API Routes* dan *Server Actions* (`"use server"`).
- **Service Layer**  
  Fungsi-fungsi logis yang memisahkan pengolahan bisnis (seperti penugasan *Reviewer*) dari kode *controller* presentasi.
- **Repository Layer**  
  Supabase JS SDK (PostgREST API) yang memfasilitasi injeksi ke *Database PostgreSQL*.
- **Database Layer**  
  Tidak ada *query* mentah (Raw SQL) di sisi klien. Semua dikunci di balik lapisan *Row-Level Security* (RLS).
- **Validation**  
  *Payload* data wajib divalidasi keutuhan dan tipe-nya sebelum menyentuh lapisan database.
- **Error Handling**  
  Format *Response* JSON seragam (`{ success: boolean, message: string, data?: any, error?: string }`).

---

## 9. API Specification

Dokumentasi garis besar spesifikasi *Endpoint* yang diakses melalui `/api/...`:

- **Authentication**: (Dikelola oleh Supabase via SDK otentikasi)
- **Membership**: Integrasi verifikasi pendaftaran dan pengambilan profil `GET /api/members`, `PUT /api/members`.
- **Publication**: `POST /api/submit` (Untuk pengunggahan *Multipart Form Data*, Metadata Abstrak JSON, dan ID UUID Jurnal).
- **Certification**: Pengambilan butir soal CBT dan perekaman sesi waktu nyata.
- **Conference & Payment**: Interkoneksi validasi kupon dan respon mutasi bank (Webhook).
- **Search & Notification**: Parameter kueri mesin pencari repositori Naskah.

---

## 10. Security Architecture

- **JWT & Session**  
  Otentikasi *Stateless* sepenuhnya, token JWT tersimpan aman sebagai parameter *HttpOnly Cookies*.
- **RBAC (Role-Based Access Control)**  
  Tingkatan privilese dikunci. Admin, Editor, Reviewer, dan Author dilarang keras saling silang layar (*cross-access*).
- **Encryption**  
  HTTPS (TLS/SSL) untuk seluruh pergerakan data. Password di-*hash* kuat di basis data.
- **Audit Trail**  
  Aktivitas mutasi status dikomitmen secara permanen pada tabel `submission_history` guna melacak jejak audit investigasi manakala terjadi sengketa editorial.
- **File Validation**  
  *MIME type filtering* mutlak: formulir *Submission* hanya menerima `application/pdf` atau `.docx/doc`.
- **Upload Security**  
  Penyimpanan *Storage* terisolasi. Penulis tidak berhak menghapus berkas yang telah dikunci dalam *stage* evaluasi Editor.

---

## 11. Workflow (Alur Sistem Kunci)

### A. Alur Publikasi Naskah (*Double-Blind Peer Review*)
Member Registration ↓
Membership Approval ↓
Journal Submission ↓
Editor Assignment ↓
Reviewer Assignment ↓
Peer Review ↓
Revision ↓
Publication

### B. Alur Sertifikasi (CBT)
Registration ↓
Payment ↓
CBT Execution ↓
Interview ↓
Approval ↓
Certificate

---

## 12. Deployment Architecture

- **Next.js & Vercel**: Seluruh lapisan *Frontend* dan *Backend (API)* dirilis di atas *Vercel Edge Network*.
- **Supabase & PostgreSQL**: Basis data beroperasi di kluster Cloud yang sepenuhnya berwujud Database-as-a-Service (DBaaS).
- **Storage**: Penempatan aset gambar dan naskah berskala massal langsung pada *Object Storage* Supabase (Amazon S3 compatible).
- **CDN**: Jaringan pengantaran konten global (CDN) menjamin kecepatan muat yang konstan bagi pendaftar dari berbagai benua (Asia Pasifik).

---

## 13. Scalability

- **Serverless Paradigm**: Pendekatan ini melepaskan beban penyewaan OS (Virtual Machine). Beban ribuan interaksi saat acara *Conference* puncak dapat diresap secara elastis (Auto-Scaling).
- **Horizontal Scaling**: Supabase disetel agar dapat membelah koneksi melalui *Connection Pooling* (PgBouncer) dan *Read-Replicas*.
- **Cache Optimization**: Data halaman (seperti Daftar Susunan Pengurus, Kategori Jurnal) di-cache secara agresif (ISR - Incremental Static Regeneration) tanpa harus membebani basis data berkali-kali.

---

## 14. Coding Standards

- **Folder & File Naming**: Menggunakan standar `kebab-case` untuk struktur *route* (contoh: `/dashboard/submit-artikel`) dan `PascalCase` untuk penyebutan fungsional *React Components*.
- **API Naming**: Praktik standar *RESTful* (Menggunakan Kata Benda: `/api/submissions`, bukan kata kerja `/api/submitNaskah`).
- **Database Naming**: Penamaan tabel relasional menggunakan huruf kecil jamak dan spasi pemisah garis bawah `snake_case` (contoh: `review_assignments`, `author_id`).
- **Git Convention**: Pembaruan repositori wajib menggunakan metode *Conventional Commits* (seperti `feat: tambah module submission`, `fix: sinkronisasi UUID dropdown`).

---

## 15. Architecture Decision Record (ADR)

- **Mengapa Next.js?**  
  Memberikan pengalaman muat instan untuk Portal Utama yang ramah mesin pencari (SEO), sekaligus mampu menangani perutean antarmuka kompleks untuk Dashboard Administrasi dengan *Server Actions* modern.
- **Mengapa PostgreSQL?**  
  Struktur jurnal ilmiah mengharuskan *Constraint* yang ketat (seperti menolak duplikasi). Tipe data JSONB miliknya sangat ideal menampung metadata rubrik *reviewer* yang panjang dan fleksibel.
- **Mengapa Supabase?**  
  Menyingkat durasi pengkodean otentikasi. Integrasinya yang padu antara Database, Autentikasi, dan Penyimpanan Berkas (*Storage*) sangat cocok mempercepat perilisan tanpa perlu merangkai layanan *microservice* terpisah-pisah.
- **Mengapa UUID?**  
  Bila sistem menggunakan angka ID biasa (Contoh: Jurnal ID 1, Naskah ID 50), peretas dapat menduga dokumen berurutan. Format UUID (`5f6bca5a-...`) menjamin kerahasiaan dokumen rahasia di dalam proses *Peer-Review*.
- **Mengapa Serverless?**  
  Skema efisiensi operasional. Biaya (Billing) hanya berjalan seiring lalu lintas pendaftar. Tidak ada OS (*Linux*) atau *Nginx* yang harus diurus (*maintain*) atau ditambal (*patch*) peretasan tiap bulannya secara manual.

---

## 16. Roadmap

- **Sprint 0**  
  Inisialisasi Blueprint, perancangan skema relasional Supabase, instalasi Repositori Next.js, dan pengaturan modul Otentikasi.
- **Sprint 1**  
  Pembangunan Portal Publik, integrasi blok menu 16 Divisi Statis, dan sistem Formulir Keanggotaan.
- **Sprint 2**  
  Rilis Modul Inti OJS (Submission Naskah Nirkabel, Dashboard Editor, Modul Penugasan Double-Blind, dan Logika Validasi File).
- **Sprint 3**  
  Desain dan Pengembangan mesin CBT (Bank Soal Acak, Timer Interaktif) beserta Penerbitan Sertifikat Digital.
- **Release 1.0 (MVP)**  
  Sistem stabil terverifikasi komprehensif (*Clean and Clear Architecture*). Portal dibuka untuk *Call for Papers* dan uji sertifikasi massal.

---

## 17. Risks

| Aspek Risiko | Deskripsi Potensi Bencana | Rencana Mitigasi Terstruktur |
| :--- | :--- | :--- |
| **Technical** | Pemadaman mendadak *provider* Serverless (Vercel/Supabase). | Penggunaan arsitektur asinkron; pencadangan data periodik harian; fitur tampilan "*Site Under Maintenance*". |
| **Operational** | Kesalahan Editor saat mendistribusikan berkas (Membocorkan identitas rahasia *Author*). | Algoritma *Scrubbing* otomatis membuang metadata PDF/Docx sebelum diteruskan ke meja *Reviewer*. |
| **Security** | Injeksi Skrip Berbahaya / *Malware* lewat pendaftaran Jurnal. | Pembatasan lapisan tipe berkas (MIME Validation), ukuran beban dikunci, serta URL file berdurasi terbatas. |

---

## 18. Appendix

- **Glossary**  
  - **ASIA**: Association of Asia Pacific Academician.  
  - **FASIA**: Jenjang kepangkatan *Fellow of ASIA*.  
  - **OJS**: *Open Journal Systems* (di sini dibangun secara kustom).  
  - **CBT**: *Computer Based Test* / Ujian Daring.  
  - **RLS**: *Row Level Security* (pengunci tabel per-pengguna).
- **Acronym**  
  UUID, ERD, RBAC, JWT, SEO, SSR, CDN.
- **Diagrams**  
  *(Akan disimpan terpisah sebagai referensi visual pada sub-direktori docs/)*

---
*Dokumen ini merupakan kerahasiaan kekayaan intelektual teknis dari Association of Asia Pacific Academician.*
