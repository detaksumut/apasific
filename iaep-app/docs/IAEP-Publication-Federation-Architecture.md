# IAEP Publication Federation Architecture

* **Version**: 1.0
* **Status**: FROZEN
* **Domain**: Publication Distribution Infrastructure

---

## 1. Daur Hidup Artikel (Publication Lifecycle)
Setiap naskah ilmiah di platform IAEP bergerak melalui lima tahap utama sebelum metadata didistribusikan ke jaringan ilmiah global:

```
Submitted -> Review -> Accepted -> Published -> Federated (Distributed)
```

---

## 2. Kebijakan & Resolusi Tanggal Terbit (published_at)
* **Tanggal Submit (`created_at`):** Diperlakukan secara permanen sebagai sejarah naskah diterima pertama kali (*Received Date*).
* **Tanggal Terbit Resmi (`published_at`):** Diisi satu kali ketika Editor merilis naskah ke publik. Pengeditan metadata setelah rilis dilarang mengubah nilai kolom ini.
* **Fallback & Future Guard (`PublicationDateResolver`):** 
  * Resolusi tanggal menggunakan formula: `published_at ?? created_at`.
  * Mencegah tanggal masa depan: Jika `published_at` diatur melampaui hari ini, resolver otomatis kembali ke fallback aman `created_at`.

---

## 3. Integrasi Federasi Eksternal
Distribusi metadata dan deposit file dilakukan secara konsisten ke jaringan luar:
* **Zenodo Repository:** Penyimpanan berkas galley PDF dan pencatatan nomor deposit unik (*Zenodo Record ID*).
* **Crossref DOI:** Pendaftaran pengenal DOI unik menggunakan format XML Crossref terstruktur (tahun, bulan, dan hari rilis lengkap).
* **OAI-PMH Feed:** Penyajian feed metadata XML Dublin Core lokal untuk pemanenan data ilmiah pihak luar.

---

## 4. Pelacakan Status & Audit Trail
* **Provider Registry (`publication_provider_registry`):** Mencatat status sinkronisasi dinamis per-provider (`PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`, `FAILED_PERMANENT`, `SKIPPED`) lengkap dengan data detail `attempt_count`, `last_attempt_at`, dan `error_message`.
* **Audit Trail (`federation_audit_trail`):** Merekam riwayat seluruh run federasi yang dijalankan (`INITIAL_PUBLICATION`, `METADATA_UPDATE`, `RETRY_FAILED`, `LOCK_TIMEOUT_RECOVERY`) untuk keperluan pembukuan log kepatuhan.

---

## 5. Mesin Coba Ulang & Idempotensi (Retry & Idempotency Rules)
* **Batas Maksimum Retry:** Percobaan sinkronisasi otomatis dibatasi maksimal **5 kali**. Setelah batas dilewati, status dikunci menjadi `FAILED_PERMANENT` dan hanya dapat diproses ulang melalui tindakan paksa (*force retry override*) oleh Administrator.
* **Aturan Idempotensi:** Provider yang sudah berstatus `'COMPLETED'` dilarang keras dieksekusi ulang. Pipa coba ulang wajib menggunakan pengenal DOI/Zenodo lama yang sudah tersimpan di registry daripada membuat rekaman baru untuk menghindari ID ganda.

---

## 6. Concurrency Lock (Pencegahan Eksekusi Ganda)
Untuk menghindari balapan eksekusi (*race condition*) ketika dua editor menekan tombol publikasi secara bersamaan:
* Kolom `federation_lock_at` dan `federation_lock_owner` dipasang di tabel `submissions`.
* Kunci otomatis kadaluarsa setelah **5 menit** (*stale lock recovery*) untuk memulihkan proses jika terjadi kegagalan jaringan atau server mati secara mendadak.
