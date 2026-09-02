# APASIFIC / IAEP – Commit Rules

> **MANDATORY RULE:** Before modifying, staging, committing, or pushing changes,
> read this document completely.

## AI / OpenCode Working Rule

Any AI coding agent working in this repository MUST:

1. Read `COMMIT_RULES.md` before proposing Git operations.
2. Never run `git add .`, `git add -A`, or commit automatically.
3. Show `git status` before staging files.
4. Show the exact files proposed for staging.
5. Wait for explicit approval before `git commit` or `git push`.

## 1. Purpose
Dokumen ini adalah SOP wajib sebelum melakukan perubahan, staging, commit, dan push pada repository.

Tujuan utama:
- mencegah file yang salah ikut ter-commit;
- menjaga aplikasi iaep-app tetap stabil;
- mencegah backup, build artifacts, dependency, dan file sementara masuk Git;
- memastikan perubahan sensitif diverifikasi sebelum commit.

## 2. Repository Structure

Current repository structure:

```
iaep-baseline-73c1fe4/
├── iaep-app/                  ← aplikasi Next.js utama / production application
├── iaep-app-backup-before-july31-restore/ ← backup/legacy, jangan diubah sembarangan
├── docs/                      ← dokumentasi (jika ada)
├── public/                    ← legacy/root assets, jangan dipindahkan tanpa audit
├── berbagai file HTML root    ← legacy files, jangan dihapus/migrasikan tanpa verifikasi
└── COMMIT_RULES.md
```

### Application Policy

`iaep-app/` adalah aplikasi Next.js utama dan production application.

Jangan melakukan restrukturisasi besar hanya untuk tujuan kerapian tanpa kebutuhan teknis yang jelas.

## 3. Golden Rule

Sebelum commit WAJIB:

1. Jalankan:
   ```
   git status
   ```

2. Periksa perubahan:
   ```
   git diff --stat
   git diff
   ```

3. Stage file secara spesifik:
   ```
   git add <file-path>
   ```

4. Periksa staged changes:
   ```
   git diff --cached
   ```

5. Baru commit jika seluruh perubahan benar.

## 4. STRICTLY PROHIBITED

Jangan melakukan hal berikut tanpa audit eksplisit:

- `git add .`
- `git add -A`
- `git commit -a`

Jangan commit:

- `node_modules/`
- `.next/`
- `.vercel/`
- build artifacts
- temporary files
- cache
- backup snapshots
- deployment snapshots
- credential
- `.env` files
- private keys
- generated files yang tidak diperlukan

## 5. Sensitive Files

File berikut harus diperlakukan sebagai SENSITIVE:

```
iaep-app/apasific_registered_users.json
```

Sebelum file ini di-stage:

- bandingkan dengan HEAD;
- pastikan jumlah user tidak berubah tanpa alasan;
- periksa apakah field credential berubah;
- jangan menghapus `password`/`password_hash` hanya karena ingin "cleanup";
- pastikan perubahan tidak menyebabkan user kehilangan kemampuan login;
- lakukan pengujian login yang relevan.

Gunakan pemeriksaan:

```
git diff -- iaep-app/apasific_registered_users.json
```

dan verifikasi struktur JSON.

## 6. Authentication Safety Rule

Jangan mengubah sistem login tanpa alasan yang jelas dan pengujian.

Peran login yang harus tetap diperhatikan:

- Author → login melalui ORCID sesuai implementasi aktif;
- Editor;
- Reviewer;
- Staff Editor;
- role administratif lain yang terkait.

Jika perubahan menyentuh authentication, authorization, user data, role, middleware, API auth, atau login page:

WAJIB melakukan pengujian sebelum commit.

Jangan menganggap perubahan auth aman hanya karena aplikasi berhasil build.

## 7. Application Boundary

Perubahan aplikasi utama harus sebisa mungkin berada di:

```
iaep-app/
```

Jika ada file di root repository yang ingin dipindahkan:

STOP.

Jangan langsung Move-Item atau melakukan migrasi massal.

Harus terlebih dahulu:

1. cari seluruh referensi file;
2. pastikan apakah file masih digunakan;
3. buat rencana migrasi;
4. lakukan perubahan kecil;
5. test aplikasi;
6. baru commit.

## 8. Legacy HTML Rule

Repository memiliki sejumlah file HTML di root.

Jangan:

- menghapus;
- memindahkan;
- mengganti nama;
- mengabaikan;

file HTML root hanya karena tidak terlihat sebagai route Next.js.

Sebelum perubahan harus dilakukan pencarian referensi terlebih dahulu.

## 9. Asset Rule

Sebelum memindahkan asset dari root/public atau lokasi lain:

- cari referensi asset di source;
- pastikan lokasi runtime yang digunakan aplikasi;
- pastikan URL asset tetap bekerja;
- lakukan test halaman terkait.

Jangan melakukan mass move asset.

## 10. Backup Rule

Folder backup dan deployment snapshot bukan bagian dari perubahan aplikasi normal.

Jangan:

- mengedit backup;
- melakukan commit snapshot baru tanpa alasan;
- mencampurkan source aktif dengan backup.

Jika backup perlu dipindahkan atau dihapus, lakukan sebagai pekerjaan terpisah dengan verifikasi khusus.

## 11. Before Every Commit Checklist

Gunakan checklist:

- [ ] Saya berada di branch yang benar
- [ ] Saya sudah menjalankan git status
- [ ] Saya tahu alasan setiap file berubah
- [ ] Saya sudah memeriksa git diff
- [ ] Saya tidak menggunakan git add . atau git add -A
- [ ] Saya hanya melakukan git add pada file yang diperlukan
- [ ] Saya sudah menjalankan git diff --cached
- [ ] Tidak ada node_modules atau .next
- [ ] Tidak ada .env atau credential
- [ ] Tidak ada backup/snapshot yang tidak disengaja
- [ ] Perubahan aplikasi telah diuji sesuai dampaknya
- [ ] Jika auth berubah, login telah diuji
- [ ] Jika user JSON berubah, data dan login telah diverifikasi

## 12. Commit Message Standard

Gunakan Conventional Commit sederhana:

```
feat(scope): ...
fix(scope): ...
style(scope): ...
docs(scope): ...
refactor(scope): ...
chore(scope): ...
```

Contoh:

```
fix(login): resolve local authentication route
feat(metadata): add persistent research identifier
docs(repo): add commit safety rules
```

Jangan gunakan pesan seperti:

```
update
fix
changes
test
```

tanpa penjelasan.

## 13. Before Push

Sebelum push:

```
git status
git log --oneline -5
```

Pastikan:

- branch benar;
- commit yang akan dikirim benar;
- tidak ada perubahan penting yang belum ter-commit;
- tidak ada file sensitif ikut commit.

## 14. Emergency Rule

Jika ragu apakah suatu file boleh:

- diubah;
- dipindahkan;
- dihapus;
- di-stage;

maka JANGAN lakukan perubahan.

Lakukan pemeriksaan terlebih dahulu.

Prinsip:

```
WHEN IN DOUBT, DO NOT STAGE.
```

## 15. Current Repository Policy

Saat ini prioritas adalah:

```
STABILITY FIRST.
```

Jangan melakukan refactor atau restrukturisasi besar hanya demi kerapian.

Aplikasi yang sudah stabil lebih penting daripada struktur yang terlihat lebih rapi tetapi berisiko merusak:

- login;
- routing;
- asset loading;
- deployment;
- user data.
