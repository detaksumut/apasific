# ASIA Integration & Connection Status Report

Laporan ini memetakan status konektivitas, ketersediaan API, dan status integrasi terkini dari setiap lembaga/organisasi penindeks eksternal dengan platform **ASIA**.

---

## Status Konektivitas Lembaga Eksternal

| Lembaga / Provider | Kategori Integrasi | Status Saat Ini | Detail Konektivitas & Metode |
| :--- | :--- | :--- | :--- |
| **Zenodo** | DOI & Record Registry | 🟢 **ACTIVE** (Phase 1) | Melalui `ZenodoProvider` (Sandbox/Production API) dan verifikasi status aktif melalui `ZenodoVerificationService`. |
| **OpenAIRE** | Discovery Graph Federation | 🟢 **ACTIVE** (Phase 1) | Melalui `OpenAIREVerificationService` menggunakan pencarian REST API publik berdasarkan DOI. |
| **Google Scholar** | Scholarly Search Engine | 🟢 **ACTIVE** (Phase 1) | Melalui perayapan metadata Dublin Core & Citation Tags (Server-side rendered via Layout) dan dynamic `sitemap.xml`. |
| **Crossref** | DOI Registry (Future Primary) | 🟡 **MOCKED** (Planned Phase 2) | Masih bersifat tiruan (mock) menunggu registrasi keanggotaan institusi resmi ASIA. |
| **ORCID** | Researcher Research Identity | ⚪ **NOT STARTED** (Planned Phase 2) | Peta integrasi berikutnya untuk memetakan profil penulis langsung ke identitas peneliti ORCID mereka. |
| **Scopus** | Citation Indexer Database | ⚪ **NOT STARTED** (Planned Phase 3) | Kolom database (`scopus_citations`) sudah siap, integrasi pengambilan metrik kutipan dari Scopus API akan dibangun berikutnya. |
| **Web of Science (WoS)** | Citation Indexer Database | ⚪ **NOT STARTED** (Planned Phase 3) | Kolom database (`wos_citations`) sudah siap, integrasi pengambilan metrik kutipan dari WoS API akan dibangun berikutnya. |

---

## Daftar Tugas Integrasi Lanjutan (Task List)

### 🟩 Tahap 1: Zenodo, OpenAIRE, & Google Scholar (Selesai & Aktif)
* **Zenodo:** Pemicuan deposit otomatis setelah status artikel diubah menjadi `Published`.
* **OpenAIRE:** Pengujian perayapan berkala melalui mekanisme penjadwalan latar belakang.
* **Google Scholar:** Pengujian perayap Google (crawler) menggunakan Google Search Console untuk mendaftarkan `sitemap.xml` baru.

### 🟨 Tahap 2: Publication Identity Layer & ORCID (Target Berikutnya)
- [ ] **Desain Skema Identitas Peneliti:** Hubungkan tabel `article_authors` dan `profiles` dengan ORCID ID terverifikasi.
- [ ] **Integrasi ORCID OAuth API:** Hubungkan tombol "Link ORCID" di dasbor penulis untuk otentikasi identitas penulis.
- [ ] **Sinkronisasi Otomatis:** Saat naskah diterbitkan, dorong metadata publikasi langsung ke catatan profil ORCID penulis melalui ORCID Member API.

### 🟥 Tahap 3: Citation Intelligence Layer (Scopus & Web of Science)
- [ ] **Pengambilan Metrik API:** Hubungkan scheduler bulanan ke Elsevier Scopus API dan Clarivate Web of Science Starter API untuk mengambil jumlah kutipan terbaru.
- [ ] **Pemberbaruan Database:** Perbarui kolom `scopus_citations` dan `wos_citations` pada tabel `submissions` berdasarkan hasil verifikasi DOI.
