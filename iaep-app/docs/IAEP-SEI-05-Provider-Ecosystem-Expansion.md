# IAEP SEI-05 — Provider Ecosystem Expansion Architecture

**Document ID:** IAEP-SEI-05-2026-08-03
**Phase:** SEI-05 Provider Ecosystem Expansion
**Date:** 2026-08-03
**Status:** 📘 DOCUMENTED (architecture definition)
**Change Policy:** Architecture Review Required
**Authority:** IAEP Architecture Review Board
**Classification:** Documentation only — no authentication changes, no Identity Core changes, no mock providers.

---

## 1. Purpose and Scope

SEI-05 extends the **Scholarly Ecosystem Integration Layer** (SEI-00) beyond the core providers into a **full provider ecosystem** — organized into six provider categories. The goal is to give IAEP a governed, contract-driven path to interoperate with every class of scholarly service IAEP touches:

1. **DOI Providers** — permanent identifier registration.
2. **Identity Providers** — researcher identity synchronization.
3. **Repository Providers** — open-access deposit and artifact publication.
4. **Discovery Providers** — indexing verification and discovery.
5. **National Research Evaluation Providers** — national impact/ranking signals.
6. **External Publisher Workflow Providers** — journal submission workflows.

### 1.1 Boundaries

```
ASIA  = Publisher + Peer Review Authority
RJRAKP = Indexing + Ranking + Research Intelligence
External Publishers = Publication destination only
```

- **ASIA** owns the editorial authority: it decides what is accepted, peer-reviewed, and published. It remains the publisher of record.
- **RJRAKP** (the journal's research intelligence / ranking service) owns indexing, ranking, and research intelligence — consuming provider evidence to produce impact signals. It never decides editorial acceptance.
- **External Publishers** (MDPI, Elsevier, Springer) are **publication destinations only**. They receive submissions/content after ASIA's editorial process; they have **no authority** over IAEP identity, acceptance, or peer review.

**Non-negotiable constraints:** No authentication changes. No Identity Core changes. No mock providers.

---

## 2. Provider Categories

### 2.1 Category Definitions

| # | Category | Role | Providers |
|---|----------|------|-----------|
| 1 | **DOI Providers** | Register, update, and verify permanent DOIs for IAEP publications | Crossref |
| 2 | **Identity Providers** | Synchronize and verify researcher identity against external scholarly identity systems | ORCID |
| 3 | **Repository Providers** | Deposit, store, and publish open-access research artifacts (records, files, metadata) | Zenodo |
| 4 | **Discovery Providers** | Verify indexing, harvest metadata, and discover citations across the research graph | OpenAIRE, OpenAlex |
| 5 | **National Research Evaluation Providers** | Provide national ranking/impact signals tied to country-level evaluation frameworks | SINTA |
| 6 | **External Publisher Workflow Providers** | Provide submission/deposit workflows to external journals | MDPI, Elsevier, Springer |

### 2.2 Category-to-Provider Matrix

| Provider | Category | Primary Role | Status (SEI-05) |
|----------|----------|--------------|:---:|
| Crossref | DOI | DOI registration & metadata | ADAPTER PRESENT |
| ORCID | Identity | Identity synchronization | ADAPTER PRESENT |
| Zenodo | Repository | Deposit & publish records | ADAPTER CERTIFIED (Phase 1) |
| OpenAIRE | Discovery | Research-graph discovery | ADAPTER CERTIFIED (Phase 1) |
| OpenAlex | Discovery | Citation discovery & intelligence | ADAPTER PRESENT |
| SINTA | National Evaluation | Ranking/impact signals | ADAPTER PRESENT |
| MDPI | External Publisher | Journal submission workflow | PLANNED |
| Elsevier | External Publisher | Journal submission workflow | PLANNED |
| Springer | External Publisher | Journal submission workflow | PLANNED |

---

## 3. Capability Model

### 3.1 Capability Primitives

The SEI capability model organizes provider functionality into **primitives** that map 1:1 to contracts.

| Primitive | Description |
|-----------|-------------|
| `DOI_REGISTER` | Register a permanent DOI for a publication/artifact |
| `DOI_UPDATE` | Update DOI metadata post-registration |
| `DOI_VERIFY` | Verify DOI resolvability and metadata |
| `IDENTITY_LINK` | Link/verify IAEP author ↔ external scholarly identity |
| `IDENTITY_VERIFY` | Verify an external researcher profile |
| `DEPOSIT_CREATE` | Create an external repository deposit |
| `FILE_UPLOAD` | Upload publication artifacts/files |
| `RECORD_PUBLISH` | Publish a repository record externally |
| `INDEX_VERIFY` | Verify indexing/discovery presence |
| `HARVEST_METADATA` | Harvest metadata from an external research graph |
| `CITATION_DISCOVER` | Discover citation counts and cited-by evidence |
| `RANKING_SIGNAL` | Fetch national research-evaluation ranking signals |
| `SUBMIT_ARTICLE` | Submit a manuscript/abstract to an external journal workflow |

### 3.2 Category → Primitive Mapping

| Category | Mandatory Primitives | Optional Primitives |
|----------|----------------------|---------------------|
| DOI Providers | `DOI_REGISTER`, `DOI_UPDATE`, `DOI_VERIFY` | `CITATION_DISCOVER` |
| Identity Providers | `IDENTITY_LINK`, `IDENTITY_VERIFY` | — |
| Repository Providers | `DEPOSIT_CREATE`, `FILE_UPLOAD`, `RECORD_PUBLISH`, `DOI_VERIFY` | `INDEX_VERIFY`, `CITATION_DISCOVER` |
| Discovery Providers | `INDEX_VERIFY`, `HARVEST_METADATA`, `CITATION_DISCOVER` | — |
| National Evaluation Providers | `RANKING_SIGNAL`, `IDENTITY_VERIFY`, `CITATION_DISCOVER` | — |
| External Publisher Workflow Providers | `SUBMIT_ARTICLE` | `DOI_REGISTER` (publisher-side) |

### 3.3 Existing Capability Enums

Already present in `src/providers/*/` (conforming to this model):

- `CrossrefCapability`: `REGISTER_PUBLISHER_DOI`, `UPDATE_METADATA`, `FETCH_METADATA`
- `ZenodoCapability`: `CREATE_DEPOSIT`, `UPLOAD_FILE`, `PUBLISH_RECORD`, `FETCH_METADATA`, `VERIFY_DOI`
- `OpenAIRECapability`: `SEARCH_RESEARCH_GRAPH`, `HARVEST_METADATA`, `VERIFY_PUBLICATION`, `FETCH_RELATIONS`
- `OpenAlexCapability`: `FETCH_WORK`, `FETCH_AUTHOR`, `FETCH_INSTITUTION`, `FETCH_CITATIONS`
- `SintaCapability`: `IDENTITY_LOOKUP`, `PROFILE_VERIFICATION`, `PUBLICATION_SYNC`, `INSTITUTION_AFFILIATION`, `IMPACT_SIGNAL_SYNC`

These map to the SEI-05 primitives as follows:

| SEI-05 Primitive | Existing Enum Mapping |
|------------------|------------------------|
| `DOI_REGISTER` | `CrossrefCapability.REGISTER_PUBLISHER_DOI`, `ZenodoCapability.CREATE_DEPOSIT` |
| `DOI_UPDATE` | `CrossrefCapability.UPDATE_METADATA`, `ZenodoCapability.PUBLISH_RECORD` |
| `DOI_VERIFY` | `ZenodoCapability.VERIFY_DOI` |
| `IDENTITY_LINK` | `SintaCapability.IDENTITY_LOOKUP`, `ORCID` |
| `IDENTITY_VERIFY` | `OpenAlexCapability.FETCH_AUTHOR`, `SintaCapability.PROFILE_VERIFICATION` |
| `DEPOSIT_CREATE` | `ZenodoCapability.CREATE_DEPOSIT` |
| `FILE_UPLOAD` | `ZenodoCapability.UPLOAD_FILE` |
| `RECORD_PUBLISH` | `ZenodoCapability.PUBLISH_RECORD` |
| `INDEX_VERIFY` | `OpenAIRECapability.VERIFY_PUBLICATION`, `SEARCH_RESEARCH_GRAPH` |
| `HARVEST_METADATA` | `OpenAIRECapability.HARVEST_METADATA` |
| `CITATION_DISCOVER` | `OpenAlexCapability.FETCH_CITATIONS`, `OpenAIRECapability.FETCH_RELATIONS` |
| `RANKING_SIGNAL` | `SintaCapability.IMPACT_SIGNAL_SYNC`, `PUBLICATION_SYNC` |
| `SUBMIT_ARTICLE` | *New* — external publisher workflow primitive |

---

## 4. Adapter Contracts

### 4.1 Contract Driven Architecture

Every provider implements a **typed contract interface** behind its adapter. Applied patterns (already present):

- `ICrossrefProvider` — Crossref deposit/update contract.
- `IDataCiteProvider` — DataCite DOI registration contract.
- `IOpenAIREProvider` — OpenAIRE discovery contract.
- `IOrcidIdentityProvider` — ORCID identity contract.
- `ICitationProvider` — citation discovery contract (`fetchCitationCount(doi)`).
- `ISintaProvider` — SINTA identity/impact contract.

### 4.2 Category Contract Interfaces

| Category | Suggested Contract | Methods |
|----------|--------------------|---------|
| DOI Providers | `IDoiRegistryProvider` | `registerDoi(metadata): EvidenceSnapshot`, `updateDoi(doi, metadata): EvidenceSnapshot`, `verifyDoi(doi): EvidenceSnapshot` |
| Identity Providers | `IIdentityProvider` | `authorizeIdentity(code): EvidenceSnapshot`, `verifyIdentity(extId): EvidenceSnapshot`, `pushWork(extId, token, work): EvidenceSnapshot` |
| Repository Providers | `IRepositoryProvider` | `createDeposit(metadata): DepositId`, `uploadFile(depositId, filename, buf)`, `publishRecord(depositId): EvidenceSnapshot` |
| Discovery Providers | `IDiscoveryProvider` | `verifyIndexed(doi): DiscoverySnapshot`, `harvest(doi): DiscoverySnapshot`, `fetchCitations(doi): EvidenceSnapshot` |
| National Evaluation Providers | `INationalEvaluationProvider` | `verifyResearcherIdentity(id): EvidenceSnapshot`, `fetchRankingSignals(id): EvidenceSnapshot`, `fetchPublications(id): EvidenceSnapshot` |
| External Publisher Workflow Providers | `IExternalPublisherWorkflow` | `submitArticle(metadata, manuscript): SubmissionReceipt`, `checkStatus(submissionId): SubmissionStatus`, `withdraw(submissionId)` |

### 4.3 Adapter Isolation Rules

1. Adapters translate **external → internal** (`ExternalEvidenceSnapshot`) and **internal → external** (mapper).
2. All external HTTP flows through `ProviderRuntimeManager` (timeout, retry, trace, logging, hashing).
3. Providers never write to the database; orchestration services use `ExternalEvidenceStore`.
4. Publisher-workflow adapters (`SUBMIT_ARTICLE`) are **asymmetric**: they push ASIA-authorized content outward but can never pull identity/authority inward.

---

## 5. Submission Workflow

### 5.1 Internal → External Submission Pipeline

```
ASIA Editorial (acceptance)
        ↓
Publication Core (validated metadata + manuscript)
        ↓
SEI Submission Orchestrator
        ↓
[Category-aware routing]
  ├─ DOI Provider       → Crossref deposit (DOI_REGISTER)
  ├─ Repository         → Zenodo deposit (DEPOSIT_CREATE → FILE_UPLOAD → RECORD_PUBLISH)
  ├─ Discovery          → OpenAIRE/OpenAlex verify + harvest (INDEX_VERIFY, HARVEST_METADATA)
  ├─ Identity           → ORCID work push (IDENTITY_LINK + pushWork)
  ├─ National Evaluation→ SINTA ranking/impact sync (RANKING_SIGNAL)
  └─ External Publisher → MDPI/Elsevier/Springer (SUBMIT_ARTICLE)
        ↓
Evidence persistence (ExternalEvidenceStore)
        ↓
Publication Intelligence (RJRAKP)
```

### 5.2 Workflow Steps

| Step | Owner | Description |
|------|-------|-------------|
| **Acceptance** | ASIA | Editorial decision; peer review complete |
| **Metadata Validation** | Publication Core | Validate metadata completeness (title, authors, ORCID, affiliations, abstract, PDF) |
| **DOI Registration** | DOI Provider | Crossref registers publisher DOI; DOI persisted to Submission Core |
| **Repository Deposit** | Repository Provider | Zenodo create/upload/publish; external record + payload persisted |
| **External Publisher Submission** | External Publisher | Submit manuscript/metadata to MDPI/Elsevier/Springer as **destination** |
| **Identity Sync** | Identity Provider | Push accepted work to author ORCID profile |
| **Discovery/Indexing** | Discovery Provider | Verify OpenAIRE/OpenAlex discovery; refresh `submissions.index_status` |
| **Ranking/Impact** | National Evaluation | SINTA signals ingested for national evaluation |
| **Intelligence** | RJRAKP | Aggregate evidence into research-intelligence dashboards |

### 5.3 Submission Workflow Rules

- **External submission is a post-acceptance action only.** No manuscript leaves IAEP before editorial acceptance.
- **Publisher destination-only principle:** MDPI/Elsevier/Springer receive content for their workflow; they cannot alter ASIA editorial state, IAEP identity, or peer review outcome.
- **Fail-closed:** if any external destination rejects or fails, IAEP publication state is not rolled back — the failure is recorded as evidence and surfaced for retry/notification.
- **Idempotency:** submission receipts are stored; retries use the same external submission ID to avoid duplicates.

---

## 6. Ranking / Indexing Workflow

### 6.1 Indexing Verification (Discovery Providers)

```
Published DOI
    ↓
OpenAIREVerificationService (INDEX_VERIFY)  → status: DISCOVERED | PENDING
ZenodoVerificationService    (INDEX_VERIFY)  → status: INDEXED | PENDING
OpenAlex/Crossref            (CITATION_DISCOVER)
    ↓
submissions.index_status aggregated:
  VISIBLE  = Zenodo indexed AND OpenAIRE discovered
  PARTIAL  = one of them present
  PROCESSING / NOT_STARTED otherwise
```

### 6.2 Ranking Signals (National Evaluation)

SINTA provides national research-evaluation signals:

- Researcher profile verification (`IDENTITY_VERIFY`)
- Publication synchronization (`PUBLICATION_SYNC`)
- Institution affiliation (`INSTITUTION_AFFILIATION`)
- Impact signal sync (`IMPACT_SIGNAL_SYNC`)

SINTA signals feed the **RJRAKP Intelligence Layer** as evidence; they are **never** used to alter editorial decisions.

### 6.3 Ranking/Indexing Workflow Rules

- Indexing status is **evidence-driven** (real provider responses) — never fabricated.
- Citation/ranking metrics are **attributed to their source provider** in evidence snapshots.
- **No provider can rank IAEP content unilaterally** — RJRAKP aggregates provider signals into the official IAEP ranking representation.
- Re-verification is scheduled/idempotent via `verifyAndRefreshIndexStatus`.

---

## 7. Publisher Interoperability Model

### 7.1 Interoperability Boundary

```
┌──────────────────────────────────────────────────────────────┐
│ ASIA — Publisher + Peer Review Authority                      │
│   - editorial decision, acceptance, peer review               │
│   - authoritative published article state                     │
└────────────────────────────┬─────────────────────────────────┘
                             │ (validated metadata + manuscript)
                             ▼
┌──────────────────────────────────────────────────────────────┐
│ SEI Publisher Interoperability Layer                          │
│   - publisher-provider adapters (category 6)                  │
│   - submission orchestrator, evidence capture                 │
│   - route to destination publishers ONLY post-acceptance      │
└────────────────────────────┬─────────────────────────────────┘
                             │
       ┌──────────┬──────────┼──────────┐
       ▼          ▼          ▼          ▼
    MDPI      Elsevier   Springer   (future
    (destination) (destination) (destination)  publishers)
```

### 7.2 Interoperability Rules

1. **Publisher as destination only** — MDPI/Elsevier/Springer receive ASIA-authorized publications; they do not create IAEP users, sessions, roles, or editorial authority.
2. **Bidirectional metadata, unidirectional authority** — metadata flows out (and status may flow back via submission check), but authority (accept/reject) never flows from the publisher to ASIA.
3. **Contract-driven** — each publisher gets a `IExternalPublisherWorkflow` adapter behind `ProviderRuntimeManager`.
4. **Publisher-neutral core** — Publication Core holds no Elsevier/MDPI/Springer specifics; adapters own destination vocabularies.
5. **Evidence capture** — every submission/receipt/status change is recorded in `ExternalEvidenceStore` for auditability.

### 7.3 Per-Publisher Notes

| Publisher | Role | Interop Detail |
|-----------|------|----------------|
| MDPI | Destination | Submission workflow via MDPI journal submission channels; requires credentials TBD |
| Elsevier | Destination | Submission via Elsevier APIs/portal (e.g., Editorial Manager); requires credentials TBD |
| Springer | Destination | Submission via Springer Nature systems; requires credentials TBD |

> All three are **PLANNED** in the SEI-05 provider registry. No adapter is fabricated; integration proceeds only through certified contract + adapter + security-review lifecycle (SEI-00 §10).

---

## 8. RJRAKP Intelligence Layer Integration

### 8.1 Role of RJRAKP

RJRAKP is the **research intelligence, indexing, and ranking** owner. It consumes provider evidence to produce:

- Citation intelligence (OpenAlex/Crossref/CitationIndex).
- Research impact analytics (researcher profiles, trends, metrics).
- National evaluation signals (SINTA ranking signals).
- Indexing status dashboards (Zenodo/OpenAIRE/Google Scholar visibility).

Integration evidence already present:
- `OpenAlexIntelligenceService` — citation discovery.
- `ResearchIntelligenceService` (research-impact analytics layer).
- `verifyAndRefreshIndexStatus` — index-status aggregation.

### 8.2 Data Flow

```
SEI Provider Layer (evidence snapshots)
        ↓
ExternalEvidenceStore (external_publication_records,
                       external_evidence_payloads,
                       external_discovery_records,
                       submissions.index_status)
        ↓
RJRAKP Intelligence Layer
  - ResearchIntelligenceService
  - OpenAlexIntelligenceService
  - ResearchImpact Analytics dashboards
  - SINTA national evaluation signals
        ↓
ASIA Publication Context (read-only consumption)
```

### 8.3 Integration Rules

- RJRAKP reads **evidence snapshots**; it never calls providers directly (provider calls remain in SEI adapters).
- Ranking and impact metrics are **aggregations** of provider evidence attributed to source.
- ASIA consumes RJRAKP outputs as **read-only insights** — they inform editorial/outreach decisions but never replace peer review or editorial authority.
- **Identity boundary preserved:** RJRAKP never creates IAEP users or roles; ORCID/SINTA identities remain external evidence linked to existing IAEP identities.

---

## 9. Provider Ecosystem Registry (Extended)

The SEI-00 `scholarly_providers` conceptual entity is extended with the category field:

### 9.1 Extended Registry

| provider_id | category | capabilities (SEI-05 primitives) | authentication | lifecycle state |
|-------------|----------|----------------------------------|----------------|-----------------|
| `crossref` | DOI | `DOI_REGISTER`, `DOI_UPDATE`, `DOI_VERIFY`, `CITATION_DISCOVER` | api_key | ADAPTER CERTIFIED* |
| `orcid` | Identity | `IDENTITY_LINK`, `IDENTITY_VERIFY`, `pushWork` | oauth2 | ADAPTER CERTIFIED* |
| `zenodo` | Repository | `DEPOSIT_CREATE`, `FILE_UPLOAD`, `RECORD_PUBLISH`, `DOI_VERIFY` | bearer_token | ADAPTER CERTIFIED |
| `openaire` | Discovery | `INDEX_VERIFY`, `HARVEST_METADATA`, `CITATION_DISCOVER` | public | ADAPTER CERTIFIED |
| `openalex` | Discovery | `INDEX_VERIFY`, `CITATION_DISCOVER` | public | ADAPTER CERTIFIED* |
| `sinta` | National Evaluation | `RANKING_SIGNAL`, `IDENTITY_VERIFY`, `PUBLICATION_SYNC` | api_key/oauth | ADAPTER PRESENT |
| `mdpi` | External Publisher | `SUBMIT_ARTICLE` | TBD | PLANNED |
| `elsevier` | External Publisher | `SUBMIT_ARTICLE` | TBD | PLANNED |
| `springer` | External Publisher | `SUBMIT_ARTICLE` | TBD | PLANNED |

\* Adapter present/certified at runtime layer; full production-ready requires security review (SEI-00 §10 lifecycle: ADAPTER CERTIFIED → SECURITY REVIEWED → PRODUCTION READY).

### 9.2 Registry Rules

- Every provider declares its category and capabilities.
- Orchestration routes a requested primitive only to providers declaring it.
- Publishers (category 6) are destination-only; they never gain category-1..5 authority.

---

## 10. Validation & Scope Confirmation

| Requirement | Status |
|-------------|--------|
| Documentation only | ✅ CONFIRMED |
| No authentication changes | ✅ CONFIRMED |
| No Identity Core changes | ✅ CONFIRMED |
| No mock providers | ✅ CONFIRMED |
| No database migration | ✅ CONFIRMED |
| No API implementation | ✅ CONFIRMED |

### Protected Boundaries

| Component | Status |
|-----------|--------|
| `src/proxy.ts` | ✅ UNTOUCHED |
| Authentication system | ✅ UNTOUCHED (FROZEN) |
| Session handling | ✅ UNTOUCHED |
| `IdentityResolver` | ✅ UNTOUCHED |
| RBAC implementation | ✅ UNTOUCHED |

---

## 11. Closure Statement

```
SEI-05 PROVIDER ECOSYSTEM EXPANSION
Status: DOCUMENTED

Provider categories:   6 (DOI, Identity, Repository, Discovery,
                          National Evaluation, External Publisher)
Providers:             Crossref, ORCID, Zenodo, OpenAIRE, OpenAlex,
                          SINTA, MDPI, Elsevier, Springer
Boundary:              ASIA = Publisher + Peer Review Authority
                       RJRAKP = Indexing + Ranking + Intelligence
                       External Publishers = Publication destination only

No authentication changes.
No Identity Core changes.
No mock providers.
```

*Architecture Definition Artifact — IAEP SEI-05 Provider Ecosystem Expansion.*  
*Next phase: per-publisher contract + adapter certification for External Publisher Workflow Providers.*
