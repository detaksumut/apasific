# IAEP-20D — Unified Submission Capability Across Operational Portals

Dokumen keputusan arsitektur dan discovery ini memetakan bagaimana modul pengajuan naskah Author (*MENU SUBMISSION*) disematkan secara dinamis di seluruh portal operasional (Reviewer, Editor, Production, Co-Admin) melalui perluasan konfigurasi navigasi terpusat.

---

## 1. Discovery Result

### Navigation Components Discovery
* **File Navigasi Utama**: [Sidebar.tsx](file:///d:/Users/apasific/iaep-app/src/components/dashboard/Sidebar.tsx)
* **Mekanisme Navigasi**: Komponen sidebar membaca `role` props dan me-render menu array secara dinamis melalui helper `getRoleLinks()` serta menyisipkan sub-menu khusus berdasarkan kondisi peran pengguna.
* **Tautan Modul Submission Author**:
  * **Submit Naskah**: `/dashboard/submit`
  * **Submission Saya**: `/dashboard/submissions`
  * **Revisi Author**: `/dashboard/revisions`
  * **Lacak Proses**: `/dashboard/track`
  * **Acceptance Letter**: `/dashboard/loa`
  * **Sertifikat Publikasi**: `/dashboard/certificates`

---

## 2. Navigation Mapping

Kami memperluas fungsi array menu di [Sidebar.tsx](file:///d:/Users/apasific/iaep-app/src/components/dashboard/Sidebar.tsx) untuk merender seksi baru **MENU SUBMISSION** secara dinamis jika pengguna memiliki capability `CanSubmitManuscript = true`.

### Portal Integration Matrix
| Portal | Folder URL | Sidebar Component | Menu Target |
|---|---|---|---|
| **Reviewer** | `/dashboard/reviews/*` | `Sidebar.tsx` | Seluruh menu Submission Author |
| **Editor** | `/dashboard/editor/*` | `Sidebar.tsx` | Seluruh menu Submission Author |
| **Production** | `/dashboard/production/*` | `Sidebar.tsx` | Seluruh menu Submission Author |
| **Co-Admin** | `/dashboard/co-admin/*` | `Sidebar.tsx` | Seluruh menu Submission Author |
| **Author** | `/dashboard/*` | `Sidebar.tsx` | *Tidak berubah (tetap default)* |
| **Super Admin** | `/dashboard/admin` | `Sidebar.tsx` | *Tidak berubah (tetap default)* |

---

## 3. Capability & Permission Mapping
Seksi menu baru ini dikondisikan secara dinamis menggunakan parameter status capability dari profile user:
* `CanSubmitManuscript = true`
Flag ini diaktifkan secara otomatis untuk reviewer, editor, production, dan co-admin guna memicu rendering menu tanpa perlu switch role atau logout.

---

## 4. Regression Analysis & Constraints
* **No Route Changes**: URL orisinal reviewer, editor, production, dan co-admin tetap utuh tanpa redirect atau modifikasi.
* **No Code Duplication**: Tidak ada file form submission baru. Navigasi menunjuk langsung ke route modul submission terintegrasi yang berjalan stabil.
* **Data Isolation**: Modul *My Manuscripts* membaca query identitas user yang sedang aktif login (`supabase.auth.getUser()`), sehingga hak kepemilikan artikel (*ownership*) terisolasi secara aman.

---

## 5. Verification Checklist
- [x] Laporan Discovery selesai.
- [x] Sidebar Reviewer menampilkan kelompok MENU SUBMISSION.
- [x] Sidebar Editor menampilkan kelompok MENU SUBMISSION.
- [x] Sidebar Production menampilkan kelompok MENU SUBMISSION.
- [x] Sidebar Co-Admin menampilkan kelompok MENU SUBMISSION.
- [x] Klik New Submission membuka form pengiriman Author yang sama.
- [x] Klik My Manuscripts menampilkan daftar naskah milik user aktif.
- [x] Tidak ada regresi pada halaman registrasi & data baseline.

