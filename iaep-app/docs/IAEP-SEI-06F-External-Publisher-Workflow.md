# IAEP SEI-06F — External Publisher Workflow

**Document ID:** IAEP-SEI-06F-2026-08-03
**Phase:** SEI-06F External Publisher Workflow
**Date:** 2026-08-03
**Status:** 📘 DOCUMENTED (workflow definition; adapters PLANNED)
**Change Policy:** Architecture Review Required
**Authority:** IAEP Architecture Review Board
**Classification:** Production-grade external publisher interoperability workflow for the **External Publisher Workflow Provider** category (SEI-05 category 6).

---

## 1. Purpose

SEI-06F formalizes IAEP's interoperability with **external publishers** (MDPI, Elsevier, Springer) as **publication destination/workflow endpoints**. After ASIA's own editorial decision and peer review, a validated manuscript may be submitted to an external journal's editorial workflow as a **destination** — never as a replacement for ASIA's authority.

### 1.1 Critical Boundary

```
ASIA  = Publisher + Peer Review Authority
External Publishers = Publication destination / workflow endpoint
RJRAKP = Research Intelligence Layer
```

- **ASIA** owns the editorial decision, acceptance, peer review, and published article state.
- **External Publishers** (MDPI, Elsevier, Springer) receive ASIA-authorized content for their own workflow; they have **no authority** over IAEP identity, acceptance, or peer review.
- **RJRAKP** is the research-intelligence layer that consumes submission evidence.

### 1.2 Provider Status

| Provider | Category | Status (SEI-05 / SEI-06F) |
|----------|----------|:---:|
| MDPI | External Publisher | 🟦 PLANNED |
| Elsevier | External Publisher | 🟦 PLANNED |
| Springer | External Publisher | 🟦 PLANNED |

> All three are **PLANNED** — no adapter is fabricated. Integration proceeds only through the certified contract + adapter + security-review lifecycle (SEI-00 §10). This document defines the target workflow; implementing adapters is a follow-up phase.

---

## 2. Publisher Adapter Model

### 2.1 Contract (`IExternalPublisherWorkflow`)

Per SEI-05 §4.2, each publisher implements a typed contract:

```ts
interface IExternalPublisherWorkflow {
  submitArticle(metadata: SubmissionMetadata, manuscript: ManuscriptPackage): SubmissionReceipt;
  checkStatus(submissionId: string): SubmissionStatus;
  withdraw(submissionId: string): WithdrawalResult;
}
```

### 2.2 Adapter Isolation

```
ASIA Publication Core (validated metadata + manuscript)
        ↓
External Publisher Adapter  (IExternalPublisherWorkflow)
        ↓
ProviderRuntimeManager
        ↓
External Publisher API  (MDPI / Elsevier / Springer)
```

- Adapters translate **internal → external** (mapper) and **external → internal** (status → evidence snapshot).
- All external HTTP flows through `ProviderRuntimeManager` (timeout, retry, trace, logging, hashing) — **no provider bypass**.
- Providers never write to the database; orchestration persists via `ExternalEvidenceStore`.
- Publisher adapters are **asymmetric**: they push ASIA-authorized content outward but never pull identity/authority inward.

### 2.3 Adapter Rules

1. **Destination-only** — publishers receive content; they never create IAEP users, sessions, roles, or editorial authority.
2. **Bidirectional metadata, unidirectional authority** — metadata flows out; status may flow back via `checkStatus`; authority never flows from publisher to ASIA.
3. **Publisher-neutral core** — Publication Core holds no MDPI/Elsevier/Springer specifics; adapters own destination vocabularies.
4. **Credential isolation** — each publisher credential is a dedicated secret; no shared service credential.

---

## 3. Submission Package Generation

### 3.1 Submission Pipeline

```
ASIA Editorial Acceptance
        ↓
Metadata Validation (Publication Core)
        ↓
SEI Submission Orchestrator
        ↓
External Publisher Adapter (SUBMIT_ARTICLE)
        ↓
Submission Receipt (evidence)
        ↓
Status Synchronization (checkStatus)
        ↓
Evidence Persistence (ExternalEvidenceStore)
        ↓
RJRAKP Intelligence Consumption
```

### 3.2 Submission Package

A submission package bundles **metadata + manuscript**:

| Component | Source | Description |
|-----------|--------|-------------|
| **Metadata** | Publication Core | Title, abstract, authors, keywords, affiliations, submission type |
| **Author ORCID mapping** | Identity Core (read-only) | Author ↔ ORCID identifiers (from SEI-06B evidence) |
| **Manuscript package** | Publication Core | Galley PDF / manuscript file(s) + supplementary material |
| **Cover letter** | Publication Core | Optional editorial summary |

### 3.3 Rules

- **No fake submission.** A submission package is assembled only from validated, ASIA-accepted publication metadata and real manuscript artifacts.
- **Post-acceptance only.** No manuscript leaves IAEP before editorial acceptance.
- **Idempotency.** Submission receipts are stored; retries reuse the same external submission ID to avoid duplicates.

---

## 4. Metadata Mapping

### 4.1 Core Metadata

| Field | Publication Core | Publisher (varies) |
|-------|------------------|--------------------|
| Title | `title` | publisher title field |
| Abstract | `abstract` | publisher abstract field |
| Authors | `authors[]` | publisher author list |
| Author ORCID | `authors[].orcid` | publisher ORCID field (via Identity mapping) |
| Affiliations | `authors[].affiliation` | publisher affiliation field |
| Keywords | `keywords[]` | publisher keyword/classification |
| Submission type | `submissionType` | publisher article type |
| DOI | `doi` (optional pre-assigned) | publisher DOI field |
| Manuscript | galley PDF | publisher file upload |

### 4.2 Mapping Rules

- Validated inside Publication Core **before** any external call.
- Each publisher adapter owns its destination vocabulary via a mapper.
- Missing/optional metadata is handled by the adapter; never fabricated.

---

## 5. Author ORCID Mapping

- **Source:** Author ORCID identifiers from SEI-06B evidence (existing IAEP identity ↔ ORCID linkage).
- **Boundary:** ORCID mapping is **identity evidence only** — it links an existing IAEP author to an ORCID identifier; it never creates a new IAEP user or bypasses Identity Core.
- **Flow:** `Author Identity (IAEP) → ORCID (external scholarly identity)` carried into the submission package.
- **No identity bypass:** publisher submission never authenticates as an IAEP user or grants roles.

---

## 6. Manuscript Package

- **Content:** The accepted galley PDF/manuscript plus optional supplementary files.
- **Integrity:** Real artifacts only; no placeholder/mock manuscript.
- **Transmission:** Uploaded through the publisher adapter → `ProviderRuntimeManager` (with file handling + timeout).
- **Evidence:** The submitted artifact is referenced by the submission receipt; the receipt is persisted as evidence.

---

## 7. Status Synchronization

- **Mechanism:** `IExternalPublisherWorkflow.checkStatus(submissionId)`.
- **Frequency:** Scheduled/idempotent; each poll returns the publisher's status.
- **Mapping:** Publisher status → normalized `SubmissionStatus` → evidence snapshot.
- **Boundary:** External editorial status is **evidence**; it is surfaced to ASIA/RJRAKP but never overrides ASIA's own editorial decision or peer review outcome.
- **Fail-closed:** A failed status check is recorded; it never fabricates a status.

---

## 8. Evidence Persistence Model

All publisher interactions are persisted via `ExternalEvidenceStore`:

| Evidence | Store | Description |
|----------|-------|-------------|
| Submission receipt | `external_publication_records` + `external_evidence_payloads` | External submission ID, provider, status, payload hash |
| Status snapshot | `external_discovery_records` | Status/evidence snapshot per publisher |
| Manuscript reference | `external_evidence_payloads` | Payload hash of submitted artifact/metadata |

### 8.1 Persistence Rules

- **Single auditable write path** — providers never write directly; orchestration uses `ExternalEvidenceStore`.
- **Fail-closed** — if persistence fails, the error propagates so the caller knows evidence was not durably recorded.
- **Hash-verified** — every payload carries a SHA-256 hash (`ProviderRuntimeManager.generatePayloadHash`).
- **No fake submission** — only real submission receipts are persisted.

---

## 9. MDPI Workflow

- **Role:** Destination journal submission workflow.
- **Contract:** `IExternalPublisherWorkflow.submitArticle` / `checkStatus` / `withdraw`.
- **Flow:** ASIA-accepted manuscript → MDPI submission channel → submission receipt → status sync → evidence.
- **Credentials:** MDPI credentials TBD (governed at contract certification).
- **Boundary:** MDPI receives ASIA-authorized content; it has no authority over IAEP identity/acceptance.
- **Status:** 🟦 PLANNED — adapter to be built via contract + security-review lifecycle.

---

## 10. Elsevier Editorial Manager Workflow

- **Role:** Destination journal submission workflow via Elsevier Editorial Manager (EM).
- **Contract:** `IExternalPublisherWorkflow.submitArticle` / `checkStatus` / `withdraw`.
- **Flow:** ASIA-accepted manuscript → EM submission/portal API → submission receipt → status sync → evidence.
- **Credentials:** Elsevier EM credentials TBD (governed at contract certification).
- **Boundary:** Elsevier receives ASIA-authorized content; no authority over IAEP identity/acceptance.
- **Status:** 🟦 PLANNED — adapter to be built via contract + security-review lifecycle.

---

## 11. Springer Workflow

- **Role:** Destination journal submission workflow via Springer Nature systems.
- **Contract:** `IExternalPublisherWorkflow.submitArticle` / `checkStatus` / `withdraw`.
- **Flow:** ASIA-accepted manuscript → Springer submission channel → submission receipt → status sync → evidence.
- **Credentials:** Springer credentials TBD (governed at contract certification).
- **Boundary:** Springer receives ASIA-authorized content; no authority over IAEP identity/acceptance.
- **Status:** 🟦 PLANNED — adapter to be built via contract + security-review lifecycle.

---

## 12. RJRAKP Consumption Boundary

```
RJRAKP Research Intelligence Layer
        ↑  (consumes submission evidence only)
ExternalEvidenceStore  (submission receipts + status snapshots)
        ↑
SEI External Publisher orchestration  (IExternalPublisherWorkflow → ProviderRuntimeManager)
        ↑
External Publisher API  (MDPI / Elsevier / Springer)
```

### 12.1 Rules

1. **RJRAKP consumes evidence only** — submission receipts and status snapshots from `ExternalEvidenceStore`.
2. **No provider bypass** — all publisher calls flow through adapters → `ProviderRuntimeManager`.
3. **No identity bypass** — RJRAKP never creates IAEP users/roles; publisher/ORCID data remains external evidence linked to existing IAEP identities.
4. **No editorial override** — external publisher status is evidence; it never replaces ASIA's peer-review or editorial authority.

---

## 13. Rules Compliance

| Rule | Status |
|------|--------|
| No fake submission | ✅ CONFIRMED (post-acceptance, real artifacts only) |
| No automatic bypass of external editorial systems | ✅ CONFIRMED (destination-only; no authority override) |
| No identity bypass | ✅ CONFIRMED (Identity Core authority preserved) |
| No provider bypass | ✅ CONFIRMED (all calls via ProviderRuntimeManager) |

---

## 14. Validation & Scope Confirmation

### 14.1 Protected Boundaries

| Component | Status |
|-----------|--------|
| Authentication Boundary | ✅ UNTOUCHED (FROZEN) |
| Identity Core | ✅ UNTOUCHED |
| RBAC | ✅ UNTOUCHED |
| `src/proxy.ts` | ✅ UNTOUCHED |

### 14.2 Scope

| Requirement | Status |
|-------------|--------|
| Publisher adapter model | ✅ CONFIRMED (§2) |
| Submission package generation | ✅ CONFIRMED (§3) |
| Metadata mapping | ✅ CONFIRMED (§4) |
| Author ORCID mapping | ✅ CONFIRMED (§5) |
| Manuscript package | ✅ CONFIRMED (§6) |
| Status synchronization | ✅ CONFIRMED (§7) |
| Evidence persistence | ✅ CONFIRMED (§8) |
| MDPI / Elsevier / Springer workflows | ✅ CONFIRMED (§9–11) |

---

## 15. Closure Statement

```
SEI-06F EXTERNAL PUBLISHER WORKFLOW
Status: DOCUMENTED (adapters PLANNED)

Boundary: ASIA = Publisher + Peer Review Authority
          External Publishers = Publication destination / workflow endpoint
          RJRAKP = Research Intelligence Layer

Contract: IExternalPublisherWorkflow (submitArticle / checkStatus / withdraw)
Gateway:  ProviderRuntimeManager (no bypass)
Evidence: ExternalEvidenceStore (submission receipts + status snapshots)
Publishers: MDPI, Elsevier, Springer — all PLANNED; no fake adapter
Rules:    No fake submission; no automatic bypass of external editorial
          systems; no identity bypass; no provider bypass
Boundaries: Auth FROZEN, Identity Core/RBAC/proxy.ts untouched
```

*Architecture Workflow Artifact — IAEP SEI-06F External Publisher Interoperability.*  
*External publishers are publication destinations only; ASIA remains publisher + peer-review authority.*
