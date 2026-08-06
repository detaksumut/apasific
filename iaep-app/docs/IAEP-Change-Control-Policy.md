# IAEP Change Control Policy

* **Version**: 1.0 (Governance Policy)
* **Status**: FROZEN
* **Domain**: Software Configuration Management

---

## 1. Alur Pengajuan Perubahan (Change Request Workflow)
Semua modifikasi terhadap Production Baseline v1.0 **WAJIB** melalui tahapan formal berikut:

```
  [Issue Registry] ──> [Architecture Review] ──> [Impact Analysis] 
                                                        │
  [Regression Test] <── [Implementation] <── [Approval Board Check]
         │
         └───> [Release Notes Generation] ──> [Main Branch Merge]
```

---

## 2. Kebijakan Perlindungan Cabang Git (Branch Protection Rules)
- Dilarang keras melakukan commit atau push langsung ke branch `main`/`production` yang mengubah logika orisinal.
- Setiap perubahan wajib diajukan melalui *Pull Request* terisolasi pasca persetujuan tertulis dari komite teknis redaksi.
- Semua pengujian regresi (*Regression Testing*) wajib berstatus `PASS` sebelum merge disetujui.
