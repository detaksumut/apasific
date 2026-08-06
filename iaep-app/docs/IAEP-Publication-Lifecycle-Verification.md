# IAEP Publication Lifecycle Verification

* **Version**: 1.0 (RC-1 Verified)
* **Status**: VERIFIED PASS
* **Domain**: Editorial Workflow & Publishing

---

## 1. Editorial Workflow State Transitions

Verifikasi transisi status naskah dari hulu ke hilir telah teruji:

```
  [Submission] ──> [Editor Screening] ──> [AI & Peer Review] 
        │
        └───> [Decision (Accept/Reject)] ──> [Production (Layout/Cover)] 
                    │
                    └───> [Zenodo Deposit & DOI Minting] ──> [OAI-PMH Indexing]
```

---

## 2. Status Modul Integritas
* **DOI Minting:** Pemetaan XML DOI berhasil digenerasikan secara valid di sisi metadata naskah.
* **Zenodo Export:** Deposit biner artikel terintegrasi melalui API Zenodo dengan status pengiriman teruji aman.
