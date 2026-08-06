# IAEP AI Reviewer Assistant Architecture

* **Version**: 1.0
* **Status**: FROZEN
* **Domain**: AI Governance & Peer Review Assistance

---

## 1. AI Reviewer Philosophy
Modul AI Reviewer Assistant beroperasi di bawah filosofi **"AI Assists, Human Decides"** (AI membantu, Manusia memutuskan). AI murni bertindak sebagai asisten analitik awal untuk menyusun draf laporan skrining dan tidak memegang kendali keputusan penolakan (*Reject*) maupun penerimaan (*Accept*) naskah.

---

## 2. Double-Blind Anonymization Layer
Untuk menjaga kepatuhan proses peninjauan buta ganda (*double-blind peer review*), naskah disaring terlebih dahulu sebelum dikirim ke API LLM luar:
* **Remove Author Name:** Menyunting nama penulis menjadi `[AUTHOR_REMOVED]`.
* **Remove Email:** Mengganti alamat surel penulis dengan tag `[EMAIL_REMOVED]`.
* **Remove Affiliation:** Menghapus nama universitas/lembaga menjadi `[INSTITUTION_REMOVED]`.
* **Remove Acknowledgement:** Menyembunyikan bagian ucapan terima kasih penulis guna menghindari kebocoran dana sponsor atau afiliasi riset (`[ACK_REMOVED]`).

Status penyaringan ini dicatat secara transparan pada database `raw_ai_response.anonymization_report` untuk keperluan audit privasi.

---

## 3. Multi-AI Provider Adapter
Integrasi LLM dibungkus menggunakan **Adapter Pattern** guna memberikan kebebasan bagi IAEP untuk menukar atau menggabungkan penyedia AI (Gemini Pro, GPT-4, Claude, atau local LLM seperti Ollama) melalui *interface* `IAIProvider`.

---

## 4. Prompt Registry & Versioning
Semua prompt instruksi disimpan secara formal di tabel database `ai_prompt_templates` dengan format:
* `name`: Nama identifikasi prompt template (misal: `'IAEP_INITIAL_SCREENING'`).
* `version`: Nomor versi prompt (misal: `'1.0'`).
* `purpose`: Tujuan spesifik (misal: `'INITIAL_MANUSCRIPT_SCREENING'`).
* `created_by`: UUID akun pembuat template prompt.

Hal ini menjamin bahwa seluruh keluaran analitik AI dapat direproduksi, ditelusuri, dan diaudit di masa mendatang.

---

## 5. AI Assessment Model
Evaluasi awal LLM menghasilkan draf penilaian berformat JSON terstruktur yang langsung divalidasi oleh skema validator sebelum disimpan:
* `novelty_rating` (integer 1-5)
* `methodology_rating` (integer 1-5)
* `clarity_rating` (integer 1-5)
* `confidence_score` (skor kepercayaan AI antara 0.00% - 100.00%)
* `summary_evaluation` (teks evaluasi naskah)
* `suggested_improvements` (teks draf masukan untuk penulis)

---

## 6. Reviewer Recommendation Engine
Membantu editor mencocokkan naskah dengan reviewer manusia yang tepat berdasarkan kata kunci penelitian abstrak artikel dengan riwayat keahlian reviewer (`expertise_overlap`). AI menyodorkan skor persentase kecocokan (`match_score`) dan alasan logis (`match_reason`) tanpa melakukan penugasan otomatis (*suggestive helper only*).

---

## 7. Audit Logging (AI Life Cycle Log)
Setiap siklus eksekusi AI dicatat di tabel `ai_review_audit_log` untuk memantau keamanan aktivitas sistem:
* `AI_ANALYSIS_STARTED`: Pemicuan analitik awal.
* `AI_ANALYSIS_COMPLETED`: Analisa sukses dan hasil tersimpan di registry.
* `AI_ANALYSIS_FAILED`: Analisa gagal (baik karena timeout API, kuota habis, atau kegagalan parsing skema JSON).
* **Non-Blocker Rule:** Kegagalan analitik AI tidak boleh memblokir alur kerja editorial manusia. Proses review manual tetap berjalan mandiri.
