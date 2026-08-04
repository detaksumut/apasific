# IAEP SEI-06A — Crossref Production DOI Lifecycle Workflow

**Document ID:** IAEP-SEI-06A-2026-08-03
**Phase:** SEI-06A Crossref Production DOI Workflow
**Date:** 2026-08-03
**Status:** 📘 DOCUMENTED (workflow definition mapped to implemented pipeline)
**Change Policy:** Architecture Review Required
**Authority:** IAEP Architecture Review Board
**Classification:** Production-grade DOI lifecycle workflow for the DOI Provider category (§4.1 Crossref, SEI-05).

---

## 1. Purpose

SEI-06A formalizes the **production-grade DOI lifecycle workflow** for Crossref — IAEP's **DOI Provider** (SEI-05 category 1). It specifies how an accepted article progresses from editorial acceptance to a fully registered, persisted, citation-intelligence-ready Crossref DOI.

The workflow is built **entirely on existing, certified components**:

| Requirement | Used Component |
|-------------|----------------|
| All external API calls | `ProviderRuntimeManager` (`src/providers/core/ProviderRuntimeManager.ts`) |
| Crossref integration contract | `ICrossrefProvider` (`src/providers/crossref/ICrossrefProvider.ts`) |
| Crossref provider implementation | `CrossrefProvider` (`src/providers/crossref/CrossrefProvider.ts`) |
| Crossref deposit mapping | `CrossrefMapper` (`CrossrefMapper.mapToCrossrefXML`) |
| Crossref response adaptation | `CrossrefAdapter` (`CrossrefAdapter.adaptDepositToSnapshot`) |
| Evidence persistence | `ExternalEvidenceStore` (`persistExternalRecord`) |
| Workflow orchestration | `CrossrefFederationService` (`publishArticleDOI`) |

**Non-negotiable constraints:** No mock DOI. No fake metadata. Fail-closed on missing credentials. No authentication / IdentityResolver / RBAC / `src/proxy.ts` changes.

---

## 2. DOI Lifecycle Workflow

```
Article Acceptance
        ↓
Metadata Validation
        ↓
Crossref DOI Registration
        ↓
Deposit Confirmation
        ↓
Evidence Persistence
        ↓
Citation Intelligence Ready
```

### 2.1 Stage Ownership

| Stage | Owner | Enforced By |
|-------|-------|-------------|
| **Article Acceptance** | ASIA (Publisher + Peer Review Authority) | Publication Core editorial decision |
| **Metadata Validation** | Publication Core + SEI | Metadata completeness check before any external call |
| **Crossref DOI Registration** | SEI (Crossref adapter) | `CrossrefProvider.depositXML` via `ProviderRuntimeManager` |
| **Deposit Confirmation** | SEI (Crossref adapter) | Deposit response status `success` + Crossref async queue acknowledgment |
| **Evidence Persistence** | SEI (`ExternalEvidenceStore`) | `persistExternalRecord` — fail-closed |
| **Citation Intelligence Ready** | SEI + RJRAKP Intelligence | DOI resolvable; OpenAlex/Crossref citation discovery enabled |

---

## 3. Stage Details

### 3.1 Article Acceptance

- **Owner:** ASIA editorial workflow (`publishArticle` in Publication Core).
- **Input:** Peer-review-completed submission with `Accepted` status.
- **Precondition:** Article has validated bibliographic metadata and a live landing URL.
- **SEI involvement:** None at this stage; SEI subscribes to the accepted-publication event carrying `publicationId`.

### 3.2 Metadata Validation

- **Owner:** Publication Core + SEI boundary.
- **Validated fields** (must be present and non-empty before deposit):

| Field | Crossref Mapper (`CrossrefDepositMetadata`) |
|-------|---------------------------------------------|
| Journal title | `journalTitle` |
| ISSN | `issn` |
| Volume / Issue | `volume` / `issue` |
| Article title | `articleTitle` |
| Publication year | `publicationYear` |
| DOI | `doi` (constructed from `CrossrefProvider.getPrefix()` + local identifier) |
| Landing URL | `url` (APASIFIC article page) |
| Authors | `authors[]` — `givenName`, `surname`, optional `orcid` |

- **Fail-closed:** if metadata is incomplete, deposit is **not** attempted. No default/fake metadata is ever substituted.

### 3.3 Crossref DOI Registration

**Implementation mapped to `CrossrefFederationService.publishArticleDOI`:**

```ts
// 1. Generate Crossref DOI batch XML (CrossrefMapper)
const xmlPayload = CrossrefMapper.mapToCrossrefXML(metadata);

// 2. Deposit via CrossrefProvider → ProviderRuntimeManager
const { data, hash } = await this.crossrefProvider.depositXML(xmlPayload, metadata.doi);

// 3. Validate deposit response
if (data.status !== 'success') {
  throw new Error('Crossref XML Deposit failed to queue');
}
```

**CrossrefProvider responsibilities (already implemented):**

- Reads `CROSSREF_MODE` — `production` forces `doi.crossref.org` + requires `CROSSREF_PREFIX`, `CROSSREF_API_KEY`, `CROSSREF_LOGIN_ID`.
- All HTTP via `ProviderRuntimeManager.executeRequest` (timeout 30s, retry 2, trace, structured logging, SHA-256 payload hash).
- **Fail-closed:** production mode throws when credentials are missing (`assertCredentials`).

### 3.4 Deposit Confirmation

- Crossref deposits are **asynchronous** (batch queue). The synchronous confirmations are:

| Check | Mechanism | State |
|-------|-----------|-------|
| Deposit queued | `depositXML` returns `status: 'success'` | ✅ CONFIRMED (synchronous) |
| Batch acknowledged | Crossref returns batch id + queued confirmation | ✅ CONFIRMED (synchronous) |
| DOI resolvable | Crossref metadata registration processed (async) | ⏳ VERIFIED (post-deposit verification) |

- **Deposit confirmation rule:** a DOI is considered **registered** (queued) when `status === 'success'`. Full **resolvability confirmation** requires the async Crossref processing window, tracked through the evidence record status (`PENDING` → `VERIFIED`).
- **No fabricated confirmations.** If Crossref reports failure, the error propagates; IAEP treats the DOI as **not registered**.

### 3.5 Evidence Persistence

Implemented in `CrossrefFederationService.publishArticleDOI`:

```ts
// 4. Adapt to ExternalEvidenceSnapshot (PUBLISHER_DOI)
const snapshot = CrossrefAdapter.adaptDepositToSnapshot(
  publicationId,
  metadata.doi,
  data,
  hash
);

// 5. Persist evidence (fail-closed: propagates on persistence error)
await this.evidenceStore.persistExternalRecord(snapshot);
```

**Persisted evidence:**

| Table | Content |
|-------|---------|
| `external_publication_records` | `publication_id`, `provider='CROSSREF'`, `external_id=DOI`, `doi`, `url`, `status` (`VERIFIED`/`PENDING`), `verified_at` |
| `external_evidence_payloads` | `external_record_id`, `payload_json` (full Crossref response), `payload_hash` (SHA-256) |

**Audit trail guarantees:**

- Every successful Crossref deposit produces a durable, hash-protected evidence pair.
- `ProviderRuntimeManager` records structured lifecycle logs (`PROVIDER_REQUEST_INITIATED/RETRY/SUCCESS/FAILED`) with request trace IDs and latency.
- No database write happens inside the provider; orchestration persists only after provider success.

### 3.6 Citation Intelligence Ready

Once the Crossref DOI is registered and persisted, the article is **citation-intelligence ready**:

- The DOI is stored on the submission (`submissions.doi`) via the evidence record link.
- Citation discovery can consume the DOI:
  - `OpenAlexIntelligenceService.fetchIntelligence` (OpenAlex `FETCH_CITATIONS`).
  - `CitationIntelligenceService.syncPublicationCitations` (OpenAlex citation count → `scopus_citations`, `research_metrics`, impact profiles).
  - OpenAIRE discovery via DOI (`searchResearchGraphByDOI`).
- **Ready rule:** citation intelligence may only run against **real, registered DOIs** (never mock DOIs). If a DOI is `PENDING`, citation sync is deferred until the record is `VERIFIED`.

---

## 4. Failure & Fail-Closed Policy

| Failure | Behavior |
|---------|----------|
| Missing `CROSSREF_API_KEY` / `CROSSREF_LOGIN_ID` / `CROSSREF_PREFIX` (production) | `CrossrefProvider.assertCredentials` throws — no deposit attempted |
| Crossref deposit HTTP error | `ProviderRuntimeManager` retries (2), then throws — no fallback, no fabricated DOI |
| Deposit returns non-`success` status | `CrossrefFederationService` throws — DOI treated as not registered |
| Evidence persistence failure | `ExternalEvidenceStore` propagates — caller knows evidence was not durably recorded |
| Incomplete article metadata | Deposit not attempted (metadata validation fail-closed) |

**No mock paths, no fallback DOIs, no hardcoded credentials anywhere in the pipeline.**

---

## 5. Related CI/CD & Runtime Requirements

| Requirement | Source |
|-------------|--------|
| Crossref production mode | `CROSSREF_MODE=production` |
| Crossref deposit URL | `CROSSREF_DEPOSIT_URL` (default `https://doi.crossref.org/servlet/deposit`) |
| Crossref prefix | `CROSSREF_PREFIX` (required in production) |
| Crossref credentials | `CROSSREF_API_KEY`, `CROSSREF_LOGIN_ID` (required in production) |
| Supabase (evidence store) | `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| Runtime gateway | `ProviderRuntimeManager` (enforced for every Crossref call) |

---

## 6. Validation & Audit Trail

### 6.1 Scope Confirmation

| Requirement | Status |
|-------------|--------|
| Uses existing `ProviderRuntimeManager` | ✅ CONFIRMED |
| Uses existing Crossref contract (`ICrossrefProvider`) | ✅ CONFIRMED |
| Uses `ExternalEvidenceStore` | ✅ CONFIRMED |
| No mock DOI | ✅ CONFIRMED |
| No fake metadata | ✅ CONFIRMED |
| Fail-closed on missing credentials | ✅ CONFIRMED (production `assertCredentials`) |

### 6.2 Protected Boundaries

| Component | Status |
|-----------|--------|
| Authentication | ✅ UNTOUCHED (FROZEN) |
| `IdentityResolver` | ✅ UNTOUCHED |
| RBAC | ✅ UNTOUCHED |
| `src/proxy.ts` | ✅ UNTOUCHED |

### 6.3 Validation Commands

| Check | Command | Result |
|-------|---------|:---:|
| Type-check | `npx tsc --noEmit` | ✅ PASS (zero errors) |
| Build | `npm run build` | ✅ PASS |
| Audit trail | Evidence persisted as `external_publication_records` + hashed `external_evidence_payloads` | ✅ CONFIRMED |

---

## 7. Closure Statement

```
SEI-06A CROSSREF PRODUCTION DOI WORKFLOW
Status: DOCUMENTED (workflow defined against implemented pipeline)

Lifecycle:  Acceptance → Metadata Validation → Crossref DOI
            Registration → Deposit Confirmation → Evidence
            Persistence → Citation Intelligence Ready
Pipeline:   CrossrefFederationService.publishArticleDOI
Gateway:    ProviderRuntimeManager (timeout/retry/trace/hash)
Contract:   ICrossrefProvider (depositXML / updateMetadata / getPrefix)
Persistence:ExternalEvidenceStore (PUBLISHER_DOI evidence + SHA-256)
Integrity:  No mock DOI, no fake metadata, fail-closed credentials
Boundaries: Auth FROZEN, IdentityResolver/RBAC/proxy.ts untouched
```

*Architecture Workflow Artifact — IAEP SEI-06A Crossref DOI Lifecycle.*  
*Crossref remains a DOI Provider only — no identity, no authority changes.*
