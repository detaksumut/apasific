# IAEP Architecture Implementation Policy

* **Version**: 1.0
* **Status**: FROZEN
* **Domain**: Engineering Policy & Governance

---

## 1. Golden Rule: Architecture First Principle
Setiap pembuatan modul, penambahan fitur, atau modifikasi daur hidup naskah wajib melalui 6 fase pemeriksaan sebelum penulisan kode dimulai:

```
  AUDIT -> GAP ANALYSIS -> DESIGN -> IMPLEMENTATION -> VERIFICATION -> DOCUMENTATION
```

---

## 2. Audit Sebelum Membangun (Audit Before Build)
Sebelum melakukan coding, pengembang wajib menjawab checklist evaluasi penempatan komponen:

* `[ ]` **Route sudah ada?** Jika YA, perluas rute yang ada. Jangan buat rute baru.
* `[ ]` **Halaman sudah ada?** Jika YA, satukan ke dalam halaman yang ada.
* `[ ]` **Service sudah ada?** Jika YA, gunakan/perluas service yang ada.
* `[ ]` **Database sudah ada?** Jika YA, lakukan ALTER TABLE/tambah kolom daripada membuat tabel baru.
* `[ ]` **Dashboard sudah ada?** Jika YA, tambahkan tab/section baru ke dashboard tersebut.
* `[ ]` **Menu sudah ada?** Jika YA, jadikan sebagai submenu.

---

## 3. Kebijakan Ekstensi (Extend Before Create)
* **No Duplicate Route:** Dilarang keras membuat file `page.tsx` baru jika modul dapat diintegrasikan dalam rute sub-tab yang sudah ada.
* **No Duplicate Dashboard:** Modul analitik, kesehatan jurnal, dan kesiapan indeksasi tidak boleh memiliki URL dashboard utama mandiri baru. Semuanya wajib menginduk pada `/dashboard/admin` atau `/dashboard/editor`.
* **No Duplicate Service:** Modul baru wajib berbagi logika dengan core services yang sudah terdaftar.
* **No Duplicate Database:** Dilarang keras meregistrasikan skema tabel ganda yang memuat data serupa (e.g. data profil dewan redaksi vs metadata profil user).

---

## 4. Checklist Verifikasi Akhir (Verification Checklist)
1. Apakah Next.js build-worker sukses recompile tanpa error?
2. Apakah tautan navigasi global (header/sidebar/footer) konsisten mengarah ke target valid?
3. Apakah modifikasi memenuhi prinsip perubahan sekecil mungkin (*Minimal Change Principle*)?
