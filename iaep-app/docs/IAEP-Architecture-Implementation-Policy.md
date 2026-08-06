# IAEP Architecture Implementation Policy

* **Version**: 1.2 (Certified Policy Rule)
* **Status**: FROZEN
* **Domain**: Engineering Policy & Governance

---

## 1. Golden Rule: Architecture First Principle
Setiap pembuatan modul, penambahan fitur, atau modifikasi daur hidup naskah wajib melalui 6 fase pemeriksaan sebelum penulisan kode dimulai:

```
  AUDIT -> GAP ANALYSIS -> DESIGN -> IMPLEMENTATION -> VERIFICATION -> DOCUMENTATION
```

---

## 2. Pre-Implementation Audit (MANDATORY)
Sebelum membuat berkas baru apa pun, developer **WAJIB** menjawab dan mendokumentasikan checklist evaluasi berikut di berkas rencana implementasi. Jika salah satu jawabannya **YA**, maka **DILARANG MEMBUAT FILE BARU** melainkan harus memperluas file yang sudah ada:

* `[ ]` **Route sudah ada?**
* `[ ]` **Page sudah ada?**
* `[ ]` **Layout sudah ada?**
* `[ ]` **Dashboard sudah ada?**
* `[ ]` **Menu sudah ada?**
* `[ ]` **Sidebar sudah ada?**
* `[ ]` **Service sudah ada?**
* `[ ]` **Repository sudah ada?**
* `[ ]` **Database sudah ada?**
* `[ ]` **API sudah ada?**
* `[ ]` **Documentation sudah ada?**

---

## 3. Prioritas Perpanjangan Elemen (Extend Before Create)
Urutan prioritas penulisan kode wajib dimulai dari yang terkecil:
1. **Extend Component** (Tab / Section / Accordion / Modal / Drawer / Widget)
2. **Extend Page** (Menambahkan konten/sub-tab ke halaman yang ada)
3. **Extend Service** (Menambahkan metode ke kelas service terdaftar)
4. **Extend Module** (Menambah sub-fungsionalitas)
5. **Baru Create** (Hanya jika tidak ada rute/service paralel yang menampung)

---

## 4. Aturan Hirarki Visual Dasbor (Dashboard Hierarchy Rule)
Setiap dashboard dibatasi secara ketat maksimal hanya mempunyai kedalaman:
```
  Dashboard -> Overview -> Tab -> Card -> Widget
```
* **No Parallel Architecture:** Dilarang keras membuat modul paralel terpisah yang mengerjakan fungsionalitas visual serupa (e.g. dilarang membuat `PublicationDashboard`, `JournalDashboard`, dan `PublisherDashboard` secara mandiri. Semuanya harus digabung ke dalam sub-tab di bawah halaman *Analytics*).

---

## 5. Aturan Basis Data (Database Rule)
Prioritas perubahan skema tabel mengikuti urutan:
```
  Tambah kolom -> Tambah relasi -> Tambah index -> Baru buat tabel
```

---

## 6. Checklist Verifikasi Akhir (Verification Checklist)
1. Apakah Next.js build-worker sukses recompile tanpa error?
2. Apakah tautan navigasi global (header/sidebar/footer) konsisten mengarah ke target valid?
3. Apakah modifikasi memenuhi prinsip perubahan sekecil mungkin (*Minimal Change Principle*)?


