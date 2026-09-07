# APASIFIC / IAEP – Commit Rules & Repository Safety Guide

> **MANDATORY RULE:** Sebelum melakukan perubahan, staging, committing, atau pushing kode pada repository ini,
> baca dan patuhi dokumen ini sepenuhnya.

---

## AI / Developer Working Rules

Setiap agen AI atau pengembang yang bekerja di repository ini WAJIB:

1. Membaca `COMMIT_RULES.md` sebelum mengusulkan atau menjalankan operasi Git.
2. **DILARANG** menjalankan `git add .`, `git add -A`, atau `git commit -a` secara otomatis/membabi buta.
3. Selalu tampilkan `git status` sebelum men-stage file.
4. Tampilkan daftar file spesifik yang akan di-stage beserta alasan perubahannya (`git diff --stat`).
5. Tunggu konfirmasi eksplisit dari pengguna sebelum menjalankan `git commit` atau `git push`.

---

## 1. Purpose (Tujuan)

Dokumen ini adalah Standard Operating Procedure (SOP) resmi untuk menjaga stabilitas repository:
- Mencegah file cache, temporary files, worktree, atau file yang salah ikut ter-commit ke GitHub.
- Menjaga aplikasi `iaep-app` tetap stabil dan selalu sinkron dengan standar production.
- Mencegah kebocoran secret / credentials (`.env`, private keys, token).
- Memastikan setiap perubahan terverifikasi dan terdokumentasi dengan baik.

---

## 2. Repository Structure (Struktur Terkini)

Repository ini memiliki struktur kerja sebagai berikut:

```
D:\Users\apasific/                         ← ROOT REPOSITORY (Branch: main)
├── iaep-app/                              ← APLIKASI UTAMA (Next.js App Router, Port 3000 & Production)
│   ├── src/                               ← Source code aktif (App Router, components, lib, services)
│   ├── public/                            ← Assets aktif aplikasi web (images, logos, official PDFs)
│   └── package.json                       ← Script & dependencies aplikasi
│
├── public/                                ← Shared / Legacy assets di level root
├── *.html (misal academy.html, boc.html)  ← Halaman HTML statis ASIA (jangan dihapus sembarangan)
│
├── [PROTECTED WORKTREES - JANGAN DIGANGGU]:
│   ├── iaep-baseline-6811484/             ← Git worktree referensi baseline lama
│   └── iaep-baseline-73c1fe4/             ← Git worktree referensi baseline
│
├── .gitignore
└── COMMIT_RULES.md                        ← Dokumen panduan ini
```

### Kebijakan Aplikasi:
- `iaep-app/` adalah satu-satunya aplikasi web aktif yang dideploy ke production (https://www.apasific.org) dan dijalankan di localhost (`npm run dev`).
- Folder `iaep-baseline-*` adalah **Git worktree terproteksi**. Jangan pernah memodifikasi, menghapus, atau men-stage folder baseline ini ke branch `main`.

---

## 3. Golden Rule (Alur Kerja Staging & Commit)

Sebelum membuat commit, ikuti 5 langkah wajib:

1. **Periksa status kerja saat ini:**
   ```bash
   git status
   ```
2. **Periksa ringkasan dan detail diff:**
   ```bash
   git diff --stat
   git diff <file-path>
   ```
3. **Stage HANYA file yang benar-benar diubah:**
   ```bash
   git add <file-path-spesifik>
   ```
4. **Verifikasi file yang telah di-stage:**
   ```bash
   git diff --cached --stat
   ```
5. **Buat commit terstruktur setelah verifikasi aman.**

---

## 4. STRICTLY PROHIBITED (Larangan Mutlak)

Dilarang keras melakukan hal-hal berikut:

- `git add .`
- `git add -A`
- `git commit -a`
- Men-stage folder worktree (`iaep-baseline-*`).

**Dilarang men-commit:**
- `node_modules/`
- `.next/` (build cache)
- `.vercel/`
- Build artifacts & temporary files (*.log, *.tmp)
- Credentials, private keys, dan file environment (`.env`, `.env.local`, `.env.production`)
- File backup snapshot darurat (`*.bak`, `*.before-*`)

---

## 5. Status File Sensitif & Auth Registry

```
iaep-app/apasific_registered_users.json
```

**Konteks & Aturan Terkini:**
- Pada commit `3d87d1e2`, ketergantungan runtime autentikasi terhadap file JSON lokal ini **telah diputus** demi keamanan, beralih ke database Supabase terpusat dan OAuth ORCID resmi.
- Walaupun tidak lagi menjadi penentu utama runtime login, file ini **tetap berstatus sensitif** sebagai cadangan data / seed awal.
- Jangan mengubah, menimpa, atau menghapus file ini tanpa verifikasi eksplisit struktur datanya.

---

## 6. Authentication & Ecosystem Safety Rule

Aplikasi APASIFIC mengoperasikan ekosistem autentikasi multi-peran:
- **Peneliti / Author:** Wajib menggunakan autentikasi ORCID iD resmi (`/api/auth/orcid`).
- **Reviewer (Mitra Bestari):** Menggunakan portal telaah independen terverifikasi.
- **Editorial & Staf:** Menggunakan panel redaksi internal.

Jika ada perubahan yang menyentuh logika autentikasi, middleware, context identitas (`IdentityContext`), atau halaman `/auth/login`:
1. **Wajib diuji di browser secara menyeluruh** sebelum di-commit.
2. Jangan menganggap perubahan aman hanya karena perintah `build` sukses.

---

## 7. Asset & Legacy HTML Rules

1. **Asset Gambar & Dokumen Resmi:**
   - Semua logo resmi (`logoapasificbaru.png`, `APASIFIC.png`, dll.) dan dokumen panduan resmi (`APASIFIC_Author_...pdf`) di `iaep-app/public/` adalah bagian dari identitas publikasi.
   - Jangan menghapus atau memindahkan asset tanpa memastikan tidak ada tautan atau komponen yang merujuknya.
2. **File HTML Statis di Root:**
   - Puluhan file `*.html` di root repository masih melayani halaman profil divisi akademik ASIA. Jangan menghapus atau mengubah namanya tanpa audit referensi.

---

## 8. Commit Message Standard

Gunakan standar **Conventional Commits**:

```
<type>(<scope>): <deskripsi singkat perubahan>
```

Tipe yang diizinkan:
- `feat`: Menambah fitur baru
- `fix`: Memperbaiki bug atau kesalahan fungsi
- `style`: Perubahan tampilan visual, styling, logo, atau CSS tanpa mengubah logika
- `refactor`: Restrukturisasi kode tanpa mengubah fungsionalitas
- `chore`: Pemeliharaan file konfigurasi, asset, gitignore, atau rules
- `docs`: Pembaruan dokumentasi

Contoh yang benar:
- `style(home): update hero section logo to logoapasificbaru.png`
- `fix(auth): resolve session handling on reviewer portal`
- `chore(repo): update commit rules to match current architecture`

*Hindari pesan tidak bermakna seperti: "update", "fix", "test", atau "perubahan".*

---

## 9. Checklist Sebelum Push ke Remote (GitHub)

Sebelum menjalankan `git push`:

- [ ] Berada di branch yang benar (`main`).
- [ ] Menjalankan `git status` dan memastikan working tree bersih dari perubahan tak disengaja.
- [ ] Menjalankan `git log -n 5 --oneline` untuk memverifikasi commit yang akan terkirim.
- [ ] Tidak ada file `.env` atau credential rahasia yang terbawa.
- [ ] Localhost sudah diuji dan berjalan normal tanpa error.
- [ ] Mendapatkan konfirmasi eksplisit dari pengguna.

---

## 10. Prinsip Utama: STABILITY FIRST

Kaidah utama dalam pemeliharaan repository APASIFIC:
> **Aplikasi yang stabil dan terverifikasi jauh lebih berharga daripada restrukturisasi yang terburu-buru.**
> Jika ragu (*When in doubt*): **JANGAN STAGE, JANGAN COMMIT, PERIKSA DAHULU.**
