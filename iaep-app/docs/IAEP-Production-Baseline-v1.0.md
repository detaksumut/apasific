# IAEP Production Baseline v1.0

* **Version**: v1.0.0-FROZEN
* **Status**: GOLDEN BASELINE
* **Domain**: Production Release Management

---

## 1. Status Baseline Resmi Platform
Seluruh sub-sistem utama dalam platform IAEP v1.0 telah resmi dideklarasikan masuk ke dalam status beku (*Frozen*):

1. **Identity & RBAC:** Supabase session, role permission logic, middleware route guards.
2. **Membership & Journal Profile:** Pendaftaran member, profil jurnal PT Bernas Sumut Jaya.
3. **Peer Review & AI assist:** Double-blind editor/reviewer assignation, skrining awal AI Reviewer.
4. **Scholarly Federation:** DOI automatic minting, Zenodo deposit connector, OAI Dublin Core XML API.

---

## 2. Jaminan Stabilitas
Setiap penambahan fitur di masa mendatang wajib ditarik (*forked*) dari baseline v1.0 ini dan hanya diintegrasikan setelah melalui prosedur *Change Control*.
