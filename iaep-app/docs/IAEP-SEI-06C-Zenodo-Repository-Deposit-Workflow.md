# IAEP SEI-06C — Zenodo Repository Deposit Workflow

**Document ID:** IAEP-SEI-06C-2026-08-03
**Phase:** SEI-06C Zenodo Repository Deposit Workflow
**Date:** 2026-08-03
**Status:** 📘 DOCUMENTED (workflow definition with implementation-gap note)
**Change Policy:** Architecture Review Required
**Authority:** IAEP Architecture Review Board
**Classification:** Production-grade Zenodo repository deposit lifecycle for the Repository Provider category (§4.2 Zenodo, SEI-05).

---

## 1. Purpose

SEI-06C formalizes the **production-grade Zenodo repository deposit workflow** for IAEP's **Repository Provider** (SEI-05 category 3). It defines how an accepted, validated publication is prepared, deposited to Zenodo, published as a repository record, and verified for discovery — **without any mock deposit or fabricated repository record.**

The workflow is built on existing, certified components:

| Requirement | Used Component |
|-------------|----------------|
| Zenodo deposit contract | `IZenodoDepositProvider` (`src/providers/zenodo/IZenodoDepositProvider.ts`) |
| Zenodo provider implementation | `ZenodoProvider` (`src/providers/zenodo/ZenodoProvider.ts`) |
| All external API calls | `ProviderRuntimeManager` (`src/providers/core/ProviderRuntimeManager.ts`) |
| Metadata mapping | `ZenodoMapper.mapToZenodoMetadata` (`src/providers/zenodo/ZenodoMapper.ts`) |
| Response adaptation | `ZenodoAdapter.adaptResponseToSnapshot` (`src/providers/zenodo/ZenodoAdapter.ts`) |
| Orchestration | `PublicationDepositService.depositToZenodo` (`src/services/publication-federation/PublicationDepositService.ts`) |
| Evidence persistence | `ExternalEvidenceStore` (`src/domain/external-evidence/ExternalEvidenceStore.ts`) |
| Index verification | `ZenodoVerificationService` (`src/services/publication-federation/providers/ZenodoVerificationService.ts`) |

**Non-negotiable constraints:** No mock deposit. No fake repository record. No bypass of `ProviderRuntimeManager`. Authentication Boundary FROZEN, Identity Core unchanged, RBAC unchanged, `src/proxy.ts` unchanged.

---

## 2. Zenodo Repository Deposit Lifecycle

```
Accepted Publication
        ↓
Artifact Preparation
        ↓
Zenodo Deposit Creation
        ↓
File Upload
        ↓
Metadata Validation
        ↓
Record Publication
        ↓
Repository Evidence Persistence
        ↓
Discovery Ready
```

### 2.1 Stage Ownership

| Stage | Owner | Enforced By |
|-------|-------|-------------|
| **Accepted Publication** | Publication Core | Editorial acceptance; validated metadata |
| **Artifact Preparation** | SEI | Galley PDF/resolution from Publication Core; `ZenodoMapper.mapToZenodoMetadata` |
| **Zenodo Deposit Creation** | SEI (Zenodo adapter) | `ZenodoProvider.createDeposit` via `ProviderRuntimeManager` |
| **File Upload** | SEI (Zenodo adapter) | `ZenodoProvider.uploadFile` via `ProviderRuntimeManager` |
| **Metadata Validation** | SEI / Publication Core | Metadata completeness before publish |
| **Record Publication** | SEI (Zenodo adapter) | `ZenodoProvider.publishRecord` via `ProviderRuntimeManager` |
| **Repository Evidence Persistence** | SEI (`ExternalEvidenceStore`) | Evidence snapshot + payload hash persisted |
| **Discovery Ready** | SEI (verification) | `ZenodoVerificationService.verify` → DISCOVERED |

---

## 3. Deposit Lifecycle (Detailed)

### 3.1 Orchestration — `PublicationDepositService.depositToZenodo`

```
lifecycle = READY_FOR_DEPOSIT
  ↓
1. createDeposit(ZenodoMetadata)
      → ProviderRuntimeManager (POST /deposit/depositions)
      → depositId = data.id
      → state = DEPOSIT_CREATED
      → emit ZENODO_DEPOSIT_CREATED
  ↓
2. uploadFile(depositId, filename, fileBuffer)
      → ProviderRuntimeManager (POST /deposit/depositions/{id}/files)
      → state = FILE_UPLOADED
      → emit ZENODO_FILE_UPLOADED
  ↓
3. publishRecord(depositId)
      → ProviderRuntimeManager (POST /deposit/depositions/{id}/actions/publish)
      → state = PUBLISHED_EXTERNAL
  ↓
4. adaptResponseToSnapshot(publicationId, publishResult.data, hash)
      → if snapshot.doi → state = DOI_VERIFIED → emit ZENODO_DOI_ASSIGNED
  ↓
5. storeEvidence(publicationId, snapshot, publishResult.data, hash, state)
      → persist to external_publication_records + external_evidence_payloads
  ↓
return snapshot.doi
```

### 3.2 Provider Capabilities (`IZenodoDepositProvider`)

| Method | Zenodo API | Through |
|--------|-----------|---------|
| `getCapabilities()` | `CREATE_DEPOSIT`, `UPLOAD_FILE`, `PUBLISH_RECORD`, `FETCH_METADATA`, `VERIFY_DOI` | — |
| `createDeposit(metadata)` | POST `/deposit/depositions` | `ProviderRuntimeManager` |
| `uploadFile(depositId, filename, fileBuffer)` | POST `/deposit/depositions/{id}/files` | `ProviderRuntimeManager` |
| `publishRecord(depositId)` | POST `/deposit/depositions/{id}/actions/publish` | `ProviderRuntimeManager` |

### 3.3 Environment Policy

- `ZENODO_ENVIRONMENT` selects sandbox (`https://sandbox.zenodo.org`) vs production (`https://zenodo.org`).
- `ZENODO_API_TOKEN` (env) required for all operations; **fail-closed** if absent.
- No hardcoded tokens; no fallback to a mock sandbox record.

---

## 4. Metadata Mapping

### 4.1 Internal → Zenodo (`ZenodoMapper.mapToZenodoMetadata`)

`ApasificPublicationMetadata` → `ZenodoMetadata`:

| Internal field | Zenodo field | Notes |
|----------------|--------------|-------|
| `title` | `metadata.title` | |
| `authors[].name` | `metadata.creators[].name` | |
| `authors[].affiliation` | `metadata.creators[].affiliation` | |
| `authors[].orcid` | `metadata.creators[].orcid` | ORCID federation (O.4) |
| `abstract` | `metadata.description` | |
| `keywords` | `metadata.keywords` | |
| `license` | `metadata.license` | Default `CC-BY-4.0` |
| `publicationDate` | `metadata.publication_date` | |
| `journalName` / `volume` / `issue` | `metadata.journal_title` / `journal_volume` / `journal_issue` | |
| `relatedWorks[].identifier` | `metadata.related_identifiers[].identifier` | |
| `relatedWorks[].relationType` | `metadata.related_identifiers[].relation` | |

Fixed: `upload_type: 'publication'`, `publication_type: 'article'`.

### 4.2 Metadata Validation

Before any deposit, validate:
- Non-empty `title`, `abstract`, `authors`, `publicationDate`.
- Each author has a resolvable `name`; ORCID present when federated.
- `license` is one of the governed licenses (default `CC-BY-4.0`).
- `journal` metadata present for an article.

**Fail-closed:** incomplete metadata aborts the deposit before any Zenodo call.

---

## 5. Artifact Policy

- **Artifact type:** Galley PDF (the publishable manuscript) addressed via the Publication Core's signed-URL resolver.
- **File policy:** the artifact must be the production galley PDF; no intermediate/editorial versions.
- **Format:** `application/pdf` (Zenodo `application/octet-stream` upload).
- **Naming:** stable filename derived from the publication identifier; no collisions across deposits.
- **Access:** artifact is uploaded to Zenodo as a public record (consistent with the Publication Visibility certification).
- **No fabricated artifact:** the exact production file is uploaded; no placeholder or mock file is ever deposited.

---

## 6. Security Model

### 6.1 Credential Isolation

- Zenodo API token is env-only (`ZENODO_API_TOKEN` / `NEXT_PUBLIC_ZENODO_API_TOKEN`); no hardcoded token.
- Token consumed only inside `ZenodoProvider` / `ZenodoVerificationService`; never exported to frontends or routes.

### 6.2 Authentication Policy

- All Zenodo API calls via `ProviderRuntimeManager`:
  - Bearer token (`Authorization: Bearer <token>`).
  - Timeout (15–30s), retry (2 attempts, exponential delay), trace ID.
- Sandbox vs production controlled by `ZENODO_ENVIRONMENT` (FIND-05 resolved).

### 6.3 Access Control

- Deposit is triggered only by authorized Publication Core contexts (RBAC-guarded editorial publish action).
- No Zenodo deposit route/API endpoint reachable anonymously.

### 6.4 Audit Logging

- `ProviderRuntimeManager` logs provider lifecycle events with trace IDs and latency.
- Federation events emitted: `ZENODO_DEPOSIT_CREATED`, `ZENODO_FILE_UPLOADED`, `ZENODO_DOI_ASSIGNED`.
- Evidence snapshot + payload hash persisted for audit.

---

## 7. Evidence Persistence

### 7.1 Expected path via `ExternalEvidenceStore`

Per the requirement to use `ExternalEvidenceStore`, the deposit evidence should be persisted through its single auditable write path (`persistExternalRecord`):

| Table | Content |
|-------|---------|
| `external_publication_records` | snapshot: provider `ZENODO`, external_id, doi, url, status `VERIFIED`/`PENDING`, verified_at |
| `external_evidence_payloads` | immutable raw Zenodo payload + SHA-256 payload hash |

### 7.2 Discovery evidence

`ZenodoVerificationService.verify(recordId)` returns a `FederationResult` (`DISCOVERED`/`PENDING`/`FAILED`); discovery/indexing evidence is expected via `ExternalEvidenceStore.persistDiscoveryRecord` (`external_discovery_records`).

> **Implementation gap (documented):** `PublicationDepositService.depositToZenodo` currently persists deposit evidence via its private `storeEvidence()` (direct Supabase writes to `external_publication_records` + `external_evidence_payloads`) rather than through `ExternalEvidenceStore.persistExternalRecord`. This is a divergence from the requirement to centralize persistence in `ExternalEvidenceStore`. See §9.

---

## 8. Failure Handling

| Failure | Behavior |
|---------|----------|
| Missing `ZENODO_API_TOKEN` | `ZenodoProvider` throws (`"ZENODO_API_TOKEN is not configured"`) — fail-closed |
| Metadata incomplete | Deposit aborts before any Zenodo call |
| `createDeposit` failure | `ProviderRuntimeManager` retries then throws; `depositToZenodo` propagates |
| `uploadFile` failure | `ProviderRuntimeManager` retries then throws; lifecycle state remains `FILE_UPLOADED` context |
| `publishRecord` failure | `ProviderRuntimeManager` retries then throws; no published record is assumed |
| Evidence persistence failure | `ExternalEvidenceStore` throws (fail-closed) — caller knows evidence was not durably recorded |
| Verification failure (`ZenodoVerificationService`) | Returns `FAILED` status; index refresh records it, no fabricated `DISCOVERED` |

**No mock deposit, no fake repository record, no bypass of `ProviderRuntimeManager`.**

---

## 9. Implementation Gap (documented, not fixed)

**Gap:** `PublicationDepositService.depositToZenodo` persists evidence via its private `storeEvidence()` method (direct Supabase writes) rather than through `ExternalEvidenceStore.persistExternalRecord`. This diverges from the requirement to "use existing `ExternalEvidenceStore`" as the single auditable write path, and from the SEI-04 evidence-persistence pattern.

**Impact:** Deposit evidence is persisted, but not through the centralized `ExternalEvidenceStore` abstraction; the write path is not consistent with Crossref/DataCite/OpenAIRE services.

**Recommended fix (future implementation, not executed here):** Refactor `PublicationDepositService.depositToZenodo` to call `ExternalEvidenceStore.persistExternalRecord(snapshot)` (and `persistDiscoveryRecord` for verification) instead of its private `storeEvidence()`, mirroring the Crossref/DataCite pattern.

> This document is documentation-only. The gap is recorded for a follow-up implementation phase; no source code was changed in SEI-06C.

---

## 10. Validation & Scope Confirmation

### 10.1 Scope Confirmation

| Requirement | Status |
|-------------|--------|
| Uses existing `IZenodoDepositProvider` | ✅ CONFIRMED |
| Uses existing `ZenodoProvider` | ✅ CONFIRMED |
| Uses `ProviderRuntimeManager` | ✅ CONFIRMED |
| Uses `ZenodoMapper` | ✅ CONFIRMED |
| Uses `ZenodoAdapter` | ✅ CONFIRMED |
| Uses `ExternalEvidenceStore` | ⚠️ PARTIAL — see §9 gap |
| No mock deposit / no fake repository record | ✅ CONFIRMED |
| No bypass of `ProviderRuntimeManager` | ✅ CONFIRMED |

### 10.2 Protected Boundaries

| Component | Status |
|-----------|--------|
| Authentication Boundary | ✅ UNTOUCHED (FROZEN) |
| Identity Core | ✅ UNTOUCHED |
| RBAC | ✅ UNTOUCHED |
| `src/proxy.ts` | ✅ UNTOUCHED |

---

## 11. Closure Statement

```
SEI-06C ZENODO REPOSITORY DEPOSIT WORKFLOW
Status: DOCUMENTED (workflow defined against implemented pipeline)

Lifecycle:  Accepted Publication → Artifact Preparation → Zenodo Deposit
            Creation → File Upload → Metadata Validation → Record
            Publication → Repository Evidence Persistence → Discovery Ready
Pipeline:   PublicationDepositService.depositToZenodo
            (createDeposit → uploadFile → publishRecord → adapt → persist)
Gateway:    ProviderRuntimeManager (timeout/retry/trace, fail-closed)
Contract:   IZenodoDepositProvider (createDeposit / uploadFile / publishRecord)
Mapping:    ZenodoMapper.mapToZenodoMetadata
Adapter:    ZenodoAdapter.adaptResponseToSnapshot
Persistence:ExternalEvidenceStore (PARTIAL — see §9)
Verify:     ZenodoVerificationService (DISCOVERED / PENDING / FAILED)
Security:   Credential isolation, env-only token, audit logging,
            fail-closed on missing credentials
Gap:        depositToZenodo persists via private storeEvidence() not
            ExternalEvidenceStore (documented for follow-up)
Boundaries: Auth FROZEN, Identity Core/RBAC/proxy.ts untouched
```

*Architecture Workflow Artifact — IAEP SEI-06C Zenodo Repository Deposit Lifecycle.*  
*Zenodo remains a Repository Provider only — no identity, no authority changes.*
