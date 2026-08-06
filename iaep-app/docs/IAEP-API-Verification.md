# IAEP API Endpoints Verification

* **Version**: 1.0 (RC-1 Verified)
* **Status**: VERIFIED PASS
* **Domain**: API Security & Reliability

---

## 1. Keamanan & Otorisasi API
Seluruh endpoint di bawah `/api/admin/*` dan `/api/editor/*` dilindungi middleware pemeriksaan otorisasi token sesi:
- Request tanpa header token atau cookie valid mengembalikan `401 Unauthorized` dengan tepat.
- Request dengan token tetapi memiliki peran user yang tidak sesuai (e.g. Author memanggil API Admin) mengembalikan `403 Forbidden` dengan tepat.

---

## 2. Struktur Payload & Error Handling
Seluruh API mengembalikan format JSON konsisten. Kode status HTTP standard (`200 OK`, `201 Created`, `400 Bad Request`, `500 Server Error`) terpetakan secara presisi dan informatif.
