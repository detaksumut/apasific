# IAEP Reviewer Certificate Verification & Lifecycle Architecture

* **Version**: 1.0
* **Status**: FROZEN
* **Domain**: Certificate & Integrity Registry

---

## 1. Kode Pengenal Sertifikat (Certificate ID Registry)
Setiap sertifikat penghargaan reviewer diberikan kode penanda unik untuk menghindari pemalsuan:
```
  Format: IAEP-RV-YYYY-XXXXXX
  Contoh: IAEP-RV-2026-000042
```

Tabel database menyimpan:
* `certificate_hash`: Hash SHA-256 untuk memverifikasi kecocokan berkas PDF.
* `verification_url`: Tautan publik untuk validasi orisinalitas sertifikat oleh pihak ketiga (misal universitas pengusul kepangkatan).

---

## 2. Daur Hidup Sertifikat
```
  Review Completed -> Validation check -> Certificate Issued -> Registry Saved -> QR Verification Active
```
* **Verification QR:** Pengguna luar dapat memindai QR Code di sertifikat fisik untuk langsung masuk ke portal validasi online IAEP.
