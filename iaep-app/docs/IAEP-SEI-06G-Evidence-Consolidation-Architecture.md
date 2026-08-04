# IAEP SEI-06G — Scholarly Evidence Consolidation Architecture

**Document ID:** IAEP-SEI-06G-2026-08-03
**Phase:** SEI-06G Scholarly Evidence Consolidation
**Date:** 2026-08-03
**Status:** 📘 DOCUMENTED (architecture definition)
**Change Policy:** Architecture Review Required
**Authority:** IAEP Architecture Review Board
**Classification:** Documentation only — no authentication, Identity, RBAC, or proxy changes.

---

## 1. Purpose

SEI-06G defines the **unified evidence foundation** consumed by the **RJRAKP Intelligence Layer**. All evidence produced by SEI-06A through SEI-06F (Crossref DOI, ORCID Identity, Zenodo Repository, OpenAIRE Discovery, OpenAlex Citation, SINTA Evaluation, External Publisher Status) is consolidated into a single, immutable, hash-verified evidence repository that is the **only** input for intelligence analysis.

### 1.1 Core Rule

```
RJRAKP never calls providers directly.
Evidence repository is the only input for intelligence analysis.
No mock evidence. No fabricated metrics.
```

### 1.2 Boundary

```
SEI Provider Workflows (06A–06F)
        ↓  (evidence snapshots)
ExternalEvidenceStore  ← unified evidence repository
        ↓
RJRAKP Intelligence Layer  (consumes evidence only)
```

- **ASIA** = Publisher + Peer Review Authority.
- **RJRAKP** = Research Intelligence Layer (consumes consolidated evidence).
- **External providers** = generate evidence; never reach RJRAKP directly.

---

## 2. External Evidence Model

### 2.1 Evidence Snapshot (`ExternalEvidenceSnapshot`)

Primary evidence record for provider interactions (DOI, identity, citation, deposit, evaluation):

```ts
type EvidenceProvider = 'SINTA' | 'ORCID' | 'CROSSREF' | 'OPENALEX' | 'ZENODO' | 'DATACITE';
type EvidenceType = 'IDENTITY' | 'PUBLICATION' | 'CITATION' | 'INSTITUTION'
                  | 'IMPACT_METRIC' | 'PUBLISHER_DOI' | 'DATASET';

interface ExternalEvidenceSnapshot {
  id: string;
  provider: EvidenceProvider;
  providerEntityId: string;      // e.g., SINTA Author ID, Zenodo record ID, DOI
  apasificIdentityId?: string;   // mapped internal IAEP identity (optional)
  evidenceType: EvidenceType;    // classification of the evidence
  payloadHash: string;           // SHA-256 hash of raw payload (immutability)
  payload: any;                  // raw evidence data
  verifiedAt?: Date;             // when provider verified
  sourceTimestamp: Date;         // when evidence was captured
}
```

### 2.2 Discovery Evidence Snapshot (`DiscoveryEvidenceSnapshot`)

Evidence record for discovery / indexing / harvesting:

```ts
type DiscoveryProvider = 'OPENAIRE' | 'OPENALEX' | 'ORCID' | 'DATACITE'
                       | 'CROSSREF' | 'ZENODO' | 'GOOGLE_SCHOLAR';
type DiscoveryStatus = 'DISCOVERED' | 'VERIFIED' | 'PENDING';

interface DiscoveryEvidenceSnapshot {
  id: string;
  publicationId: string;
  provider: DiscoveryProvider;
  externalIdentifier: string;   // OpenAIRE graph ID, DOI, etc.
  status: DiscoveryStatus;
  metadataHash: string;         // SHA-256 hash of evidence payload
  discoveredAt: Date;
  verifiedAt?: Date;
  payload?: any;                // raw research graph data
}
```

### 2.3 Ownership

- **Evidence Model** is owned by the SEI Shared Kernel domain (`src/domain/external-evidence/`).
- **Single write path** is `ExternalEvidenceStore` (providers never write directly).
- **Persistence tables:** `external_publication_records`, `external_evidence_payloads`, `external_discovery_records`, plus `submissions.index_status` aggregation.

---

## 3. Evidence Provenance

Every evidence record carries **provenance** to guarantee it is attributable, traceable, and non-repudiable:

| Provenance Field | Source | Purpose |
|------------------|--------|---------|
| `provider` | `ExternalEvidenceSnapshot.provider` | Which external source produced the evidence |
| `providerEntityId` | Provider response | External identifier (e.g., Zenodo record ID, ORCID iD, DOI) |
| `apasificIdentityId` | Identity mapping | Optional internal IAEP identity linkage |
| `evidenceType` | Classification | Type of evidence (identity, citation, deposit, etc.) |
| `sourceTimestamp` | Capture time | When evidence was captured from provider |
| `verifiedAt` | Verification | When provider confirmed the evidence |
| `payloadHash` | `ProviderRuntimeManager.generatePayloadHash` | SHA-256 integrity fingerprint |
| `publicationId` | Discovery snapshot | Publication this evidence belongs to |

### 3.1 Provenance Rules

- **Attribution mandatory** — every evidence record must name its source provider.
- **No orphan evidence** — every record maps to a publication and/or IAEP identity.
- **No fabricated provenance** — timestamps and provider IDs come from real provider responses/capture time; never synthesized.

---

## 4. Evidence Lifecycle

### 4.1 Publication-Deposit Lifecycle (`ExternalPublicationLifecycle`)

Captures the external publication state machine (Zenodo + Crossref):

```
DRAFT
↓
READY_FOR_DEPOSIT
↓
DEPOSIT_CREATED
↓
FILE_UPLOADED
↓
PUBLISHED_EXTERNAL
↓
DOI_VERIFIED
↓
INDEXING_PENDING
├── OPENAIRE_DISCOVERED → GLOBAL_DISCOVERY_VERIFIED
└── CROSSREF_DEPOSIT_SUBMITTED → CROSSREF_DEPOSIT_ACCEPTED
        → CROSSREF_DOI_REGISTERED → CROSSREF_METADATA_UPDATED
```

- **State machine enforced** via `ExternalPublicationLifecycle.transitionTo()` with an allowed-transition table.
- **Invalid transitions throw** — evidence cannot skip states or fabricate completion.

### 4.2 Evidence Status Lifecycle

```
CAPTURED → VERIFIED → CONSOLIDATED → (re-verified on refresh)
```

- Evidence is captured from a provider interaction.
- Verified when the provider confirms (or a verifier re-checks).
- Consolidated into the evidence repository for RJRAKP consumption.
- Re-verification is **idempotent** (e.g., `verifyAndRefreshIndexStatus`).

### 4.3 Federation Events

`PublicationFederationEvent` records discrete provider milestones (e.g., `ZENODO_DEPOSIT_CREATED`, `ZENODO_FILE_UPLOADED`, `ZENODO_DOI_ASSIGNED`, `ZENODO_RECORD_VERIFIED`) with publication ID, external record ID, and timestamp — providing an event-level audit trail alongside snapshots.

---

## 5. Evidence Confidence Scoring

Confidence represents how trustworthy a piece of evidence is for intelligence analysis. It is **derived from real provenance**, never fabricated.

### 5.1 Confidence Factors

| Factor | Influence | Basis |
|--------|-----------|-------|
| **Provider verification** | High | `verifiedAt` present / `verified` status |
| **Evidence type** | Medium | `PUBLISHER_DOI`/`CITATION` vs inferred signals |
| **Provider maturity** | Medium | Adapter certification state (SEI-00 §10) |
| **Cross-provider corroboration** | High | Same DOI/publication found by ≥2 providers |
| **Recency** | Low | Freshness of `sourceTimestamp`/`verifiedAt` |
| **Hash integrity** | Gate | `payloadHash` matches stored payload |

### 5.2 Confidence Levels

| Level | Meaning | Use |
|-------|---------|-----|
| **HIGH** | Provider-verified + hash-verified + corroborated | Confident intelligence |
| **MEDIUM** | Provider-verified, single source | Standard intelligence |
| **LOW** | Discovered but not yet verified | Provisional / pending |
| **NONE** | No evidence / not applicable | Excluded from analysis |

### 5.3 Rules

- Confidence is **computed from evidence attributes**, never hardcoded.
- A hash mismatch **zeroes** confidence (integrity gate).
- No fabricated metrics — confidence must be traceable to evidence fields.

---

## 6. Immutable Snapshot Strategy

### 6.1 Immutability Principle

- Every evidence snapshot is **write-once**: the raw payload and its hash are stored immutably.
- Raw payloads land in `external_evidence_payloads` (immutable, hash-verified).
- Lightweight records in `external_publication_records` / `external_discovery_records` may be **upserted** (status/verification refresh) but the **immutable payload** is never overwritten — a new snapshot is appended for re-verification.

### 6.2 Why Immutable

- **Auditability** — a tamper-evident, irreversible record of what each provider reported.
- **Non-repudiation** — evidence cannot be silently altered after capture.
- **Reconciliation** — historical evidence can be compared against current state.
- **Intelligence integrity** — RJRAKP analysis is based on fixed, verifiable snapshots.

### 6.3 Strategy

| Layer | Mutable? | Storage |
|-------|:---:|--------|
| Raw payload | ❌ Immutable | `external_evidence_payloads` |
| Payload hash | ❌ Immutable | `external_evidence_payloads.payload_hash` |
| Lightweight record | ✅ Mutable (upsert) | `external_publication_records` / `external_discovery_records` |
| Index status | ✅ Mutable (refresh) | `submissions.index_status` |
| Event log | ❌ Append-only | `PublicationFederationEvent` |

---

## 7. Hash Verification

### 7.1 Hash Generation

- All external payloads are hashed with **SHA-256** via `ProviderRuntimeManager.generatePayloadHash(payload)`.
- The hash is stored on the snapshot (`payloadHash`) and on the immutable payload row (`payload_hash`).

### 7.2 Verification Flow

```
ExternalEvidenceStore
  ├─ persistExternalRecord(snapshot)
  │     store record + payload + payload_hash
  └─ persistDiscoveryRecord(snapshot)
        store discovery record + metadata_hash + payload
```

- **Integrity gate:** before RJRAKP consumes evidence, the stored payload is re-hashed and compared to the recorded hash.
- **Mismatch → reject:** evidence with a hash mismatch is excluded from intelligence and flagged for audit.

### 7.3 Rules

- **No mock evidence** — hash verification is a hard gate; fabricated payloads cannot pass.
- **No fabricated metrics** — hash integrity ties every metric to a real, verifiable payload.

---

## 8. Provider Evidence Aggregation

### 8.1 Aggregation Model

Evidence from all SEI-06 workflows is aggregated into a unified, per-publication evidence view:

| Provider | Source Workflow | Evidence Snapshot | Evidence Type |
|----------|-----------------|-------------------|---------------|
| Crossref | SEI-06A | DOI registration/update | `PUBLISHER_DOI` |
| ORCID | SEI-06B | Identity linkage/verification | `IDENTITY` |
| Zenodo | SEI-06C | Deposit/record/DOI | `PUBLICATION` / `DATASET` |
| OpenAIRE | SEI-06D | Discovery verification | `DiscoveryEvidenceSnapshot` |
| OpenAlex | SEI-06D | Citation discovery | `CITATION` |
| SINTA | SEI-06E | Evaluation signals | `IDENTITY` / `INSTITUTION` / `IMPACT_METRIC` |
| External Publisher | SEI-06F | Submission status | `PUBLISHER_DOI` / status evidence |

### 8.2 Aggregation Rules

1. **Per-publication consolidation** — all evidence for a publication is gathered under its `publicationId` / `apasificIdentityId`.
2. **Provider attribution preserved** — each datum keeps its source provider; never merged anonymously.
3. **Corroboration** — cross-provider agreement (e.g., DOI found in Zenodo + OpenAIRE + Crossref) raises confidence.
4. **No fabricated metrics** — aggregation is a **projection** of real evidence; it never synthesizes values the providers did not report.
5. **Index status** — `submissions.index_status` aggregates visibility (`VISIBLE` / `PARTIAL` / `PROCESSING` / `NOT_STARTED`) from verified Zenodo + OpenAIRE discovery.

### 8.3 Aggregation Output

```
Evidence Repository (per publication)
  ├── DOIs/intent (Crossref, Zenodo)
  ├── Identity (ORCID, SINTA)
  ├── Repository records (Zenodo)
  ├── Discovery (OpenAIRE)
  ├── Citations (OpenAlex)
  ├── Evaluation signals (SINTA)
  └── Publisher status (MDPI/Elsevier/Springer)
        ↓
RJRAKP Intelligence Layer (aggregated, confidence-scored, hash-verified)
```

---

## 9. RJRAKP Consumption Boundary

### 9.1 Boundary

```
ExternalEvidenceStore (evidence repository)  ← ONLY input
        ↓
RJRAKP Intelligence Layer
        ↓
ASIA Publication Context (read-only insights)
```

### 9.2 Rules

1. **RJRAKP never calls providers directly.** All provider interactions live in SEI adapters behind `ProviderRuntimeManager`; RJRAKP reads only from `ExternalEvidenceStore`.
2. **Evidence repository is the only input** for intelligence analysis — no direct provider fetch, no ad-hoc external calls.
3. **No mock evidence / no fabricated metrics** — RJRAKP consumes only hash-verified, real snapshots.
4. **Read-only consumption** — RJRAKP produces insights; it never mutates provider evidence or domain state.
5. **Identity boundary preserved** — RJRAKP never creates IAEP users/roles; ORCID/SINTA identities remain external evidence linked to existing IAEP identities.
6. **Editorial authority preserved** — RJRAKP insights inform ASIA decisions but never replace peer review or editorial authority.

---

## 10. Sources — Provider Evidence Matrix

| Source | Evidence Produced | Confidence Basis | Immutable Payload |
|--------|-------------------|------------------|:---:|
| Crossref DOI Evidence | `PUBLISHER_DOI` | Verified DOI | ✅ |
| ORCID Identity Evidence | `IDENTITY` | OAuth/verified profile | ✅ |
| Zenodo Repository Evidence | `PUBLICATION` / `DATASET` | Verified record | ✅ |
| OpenAIRE Discovery Evidence | `DiscoveryEvidenceSnapshot` | Discovered/verified | ✅ |
| OpenAlex Citation Evidence | `CITATION` | Citation count | ✅ |
| SINTA Evaluation Evidence | `IDENTITY` / `INSTITUTION` / `IMPACT_METRIC` | Evaluation signals | ✅ |
| External Publisher Status Evidence | `PUBLISHER_DOI` / status | Submission receipt/status | ✅ |

---

## 11. Rules Compliance

| Rule | Status |
|------|--------|
| RJRAKP never calls providers directly | ✅ CONFIRMED |
| Evidence repository is the only input for intelligence analysis | ✅ CONFIRMED |
| No mock evidence | ✅ CONFIRMED (hash-verified, real snapshots) |
| No fabricated metrics | ✅ CONFIRMED (aggregation is a projection of real evidence) |

---

## 12. Validation & Scope Confirmation

### 12.1 Protected Boundaries

| Component | Status |
|-----------|--------|
| Authentication Boundary | ✅ UNTOUCHED (FROZEN) |
| Identity Core | ✅ UNTOUCHED |
| RBAC | ✅ UNTOUCHED |
| `src/proxy.ts` | ✅ UNTOUCHED |

### 12.2 Scope

| Requirement | Status |
|-------------|--------|
| External Evidence Model | ✅ CONFIRMED (§2) |
| Evidence provenance | ✅ CONFIRMED (§3) |
| Evidence lifecycle | ✅ CONFIRMED (§4) |
| Evidence confidence scoring | ✅ CONFIRMED (§5) |
| Immutable snapshot strategy | ✅ CONFIRMED (§6) |
| Hash verification | ✅ CONFIRMED (§7) |
| Provider evidence aggregation | ✅ CONFIRMED (§8) |
| RJRAKP consumption boundary | ✅ CONFIRMED (§9) |

---

## 13. Closure Statement

```
SEI-06G SCHOLARLY EVIDENCE CONSOLIDATION
Status: DOCUMENTED

Evidence model: ExternalEvidenceSnapshot + DiscoveryEvidenceSnapshot
Immutable:      raw payloads + SHA-256 hashes (ExternalEvidenceStore)
Lifecycle:      ExternalPublicationLifecycle state machine (enforced)
Confidence:     derived from real provenance; hash mismatch = zero
Aggregation:    per-publication, provider-attributed, corroborated
Boundary:       RJRAKP consumes evidence repository ONLY
                RJRAKP never calls providers directly
Rules:          No mock evidence. No fabricated metrics.
Boundaries:     Auth FROZEN, Identity Core/RBAC/proxy.ts untouched
```

*Architecture Consolidation Artifact — IAEP SEI-06G Scholarly Evidence Foundation.*  
*The unified, immutable, hash-verified evidence repository is the only input for RJRAKP intelligence analysis.*
