# IAEP v1.1 Known Limitations

* **Version**: v1.1.0-FROZEN
* **Status**: APPROVED

---

## 1. Batasan Fungsionalitas Modul Monitoring
* **Kueri Data Terjadwal (Poll Limit):** Evaluasi kesiapan Google Scholar & OpenAIRE membaca meta tags pada halaman artikel secara berkala. Perubahan dinamis pada sitemap memerlukan waktu perayapan cache ~24 jam untuk diperbarui pada radar score dasbor.
* **Integrasi API ORCID:** OAuth ORCID untuk reviewer memerlukan status publik profil masing-masing reviewer agar penilai diversity dapat dihitung 100% akurat.
