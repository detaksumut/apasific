# IAEP SEI-06D — Discovery and Citation Intelligence Workflow

**Document ID:** IAEP-SEI-06D-2026-08-03
**Phase:** SEI-06D Discovery and Citation Intelligence Workflow
**Date:** 2026-08-03
**Status:** 📘 DOCUMENTED (workflow definition with implementation-gap note)
**Change Policy:** Architecture Review Required
**Authority:** IAEP Architecture Review Board
**Classification:** Production-grade scholarly discovery and citation lifecycle for the Discovery Provider (OpenAIRE) and Citation Intelligence Provider (OpenAlex) categories (SEI-05 categories 4).

---

## 1. Purpose

SEI-06D formalizes the **production-grade scholarly discovery lifecycle** for IAEP's **Discovery Provider** (OpenAIRE) and **Citation Intelligence Provider** (OpenAlex) categories (SEI-05 category 4). It defines how a published article's DOI is resolved, verified for discovery in OpenAIRE, mined for citations in OpenAlex, and folded into the research graph — **without fabricated citations, fake discovery evidence, or provider bypass.**

### 1.1 Provider Role Separation

| Provider | Category | Role |
|----------|----------|------|
| **OpenAIRE** | Discovery Provider | Verifies discovery/indexing in the OpenAIRE research graph (`DISCOVERED` / `PENDING`), harvests graph metadata |
| **OpenAlex** | Citation Intelligence Provider | Discovers citation counts and cited-by evidence (`CITATION` snapshots), feeds intelligence metrics |

The two roles are **strictly separated**: OpenAIRE owns the discovery/indexing signal; OpenAlex owns the citation-intelligence signal. Neither may impersonate the other, and neither writes domain state directly.

### 1.2 Built on Existing Components

| Requirement | Used Component |
|-------------|----------------|
| Index verification contract | `IIndexVerificationProvider.verify(identifier)` |
| OpenAIRE provider | `OpenAIREProvider` (`searchResearchGraphByDOI`, `adaptToDiscoverySnapshot`) |
| OpenAlex provider | `OpenAlexProvider` (`fetchCitationCount` implements `ICitationProvider`) |
| All external API calls | `ProviderRuntimeManager` (timeout/retry/trace, no bypass) |
| Evidence persistence | `ExternalEvidenceStore` (`persistDiscoveryRecord`, `persistExternalRecord`) |
| OpenAIRE orchestration | `OpenAIREDiscoveryService.discoverPublication` |
| OpenAlex orchestration | `OpenAlexIntelligenceService.fetchIntelligence` |
| Index verification services | `OpenAIREVerificationService`, `ZenodoVerificationService` (via `IIndexVerificationProvider`) |

**Non-negotiable constraints:** No fabricated citation. No fake discovery evidence. No provider bypass. **RJRAKP consumes evidence only** — RJRAKP does not call providers directly. Authentication FROZEN, Identity Core unchanged, RBAC unchanged, `src/proxy.ts` unchanged.

---

## 2. Scholarly Discovery Lifecycle

```
Published Article
        ↓
DOI Resolution
        ↓
OpenAIRE Discovery Verification
        ↓
OpenAlex Citation Discovery
        ↓
Research Graph Update
        ↓
RJRAKP Intelligence Layer
```

### 2.1 Stage Ownership

| Stage | Owner | Enforced By |
|-------|-------|-------------|
| **Published Article** | Publication Core | Editorial publish action; DOI + Zenodo record present |
| **DOI Resolution** | Publication Core / SEI | `doi` field + `index_status` in `submissions` |
| **OpenAIRE Discovery Verification** | SEI (Discovery) | `OpenAIREDiscoveryService` / `OpenAIREVerificationService` via `ProviderRuntimeManager` |
| **OpenAlex Citation Discovery** | SEI (Citation Intelligence) | `OpenAlexService` / `OpenAlexProvider` via `ProviderRuntimeManager` |
| **Research Graph Update** | SEI | `ExternalEvidenceStore` persistence + `submissions.index_status` visibility computation |
| **RJRAKP Intelligence Layer** | RJRAKP (consumer) | Read evidence only; never direct provider calls |

---

## 3. Discovery Lifecycle (OpenAIRE)

### 3.1 Verification Path (`IIndexVerificationProvider`)

`OpenAIREVerificationService.verify(doi)`:

```
GET {OPENAIRE_API_URL}?doi={doi}&format=json
  → ProviderRuntimeManager.executeRequest('OPENAIRE', ...)
  → size > 0 ? DISCOVERED : PENDING
  → Provider failure ? FAILED (no fabricated result)
```

Returns `FederationResult`:
```ts
{ provider: 'openaire', identifier: doi, status: 'DISCOVERED'|'PENDING'|'FAILED', checkedAt: ISO }
```

### 3.2 Harvest Path (`OpenAIREDiscoveryService.discoverPublication`)

```
1. searchResearchGraphByDOI(doi)
      → ProviderRuntimeManager (GET /search/publications?doi=&format=json)
      → { data, hash, isIndexed }  (real response only; isIndexed from actual graph size)
  ↓ if !isIndexed → return false (no evidence persisted)
2. adaptToDiscoverySnapshot(publicationId, data, hash)
      → DiscoveryEvidenceSnapshot (provider OPENAIRE, externalIdentifier, status VERIFIED/PENDING)
3. evidenceStore.persistDiscoveryRecord(snapshot)
      → external_discovery_records (fail-closed on error)
4. lifecycle transition → OPENAIRE_DISCOVERED / GLOBAL_DISCOVERY_VERIFIED
```

### 3.3 OpenAIRE Mode

- `OPENAIRE_MODE=production` → real API only; fail-closed on missing config.
- `OPENAIRE_MODE=sandbox` → explicit sandbox/test endpoint allowed.
- No fabricated records; `isIndexed` reflects the actual graph query.

---

## 4. Citation Lifecycle (OpenAlex)

### 4.1 Citation Contracts

- `OpenAlexProvider` implements **`ICitationProvider.fetchCitationCount(doi)`** → returns `ExternalEvidenceSnapshot`.
- OpenAlex capability: `FETCH_CITATIONS` (OpenAlexCapability).

### 4.2 Citation Path (`OpenAlexProvider.fetchCitationCount`)

```
GET https://api.openalex.org/works/https://doi.org/{doi}
  → ProviderRuntimeManager.executeRequest('OPENALEX',
        headers: User-Agent "APASIFIC/1.0 (mailto:{polite_email})")
  → citationCount = data.cited_by_count ?? 0
  → payload = { doi, citationCount, openAlexId, citedByUrl, sourceProvider: 'OPENALEX' }
  → hash = sha256(payload)
  → ExternalEvidenceSnapshot {
        provider: 'OPENALEX',
        evidenceType: 'CITATION',
        payload, payloadHash, verifiedAt
      }
```

### 4.3 Intelligence Orchestration (`OpenAlexIntelligenceService.fetchIntelligence`)

```
1. fetchIntelligenceByDOI(doi)  → { data, hash, isFound }  (fail-closed)
  ↓ if !isFound → return false
2. OpenAlexMapper.mapWorkToIntelligence(data) → intelligence metrics
3. OpenAlexAdapter.adaptIntelligenceToSnapshot(publicationId, metrics, data, hash)
      → DiscoveryEvidenceSnapshot (provider OPENALEX, status)
4. Persist via ExternalEvidenceStore (see §7 gap)
```

### 4.4 No Fabricated Citation

- `fetchCitationCount` throws on any API failure (fail-closed).
- A real API failure must propagate so **no fake citation count** can enter the evidence trail.
- `fetchIntelligenceByDOI` propagates any error from `fetchCitationCount`.

---

## 5. Evidence Model

### 5.1 Discovery Evidence (`DiscoveryEvidenceSnapshot`)

```ts
interface DiscoveryEvidenceSnapshot {
  id: string;
  publicationId: string;
  provider: 'OPENAIRE'|'OPENALEX'|...;
  externalIdentifier: string;   // OpenAIRE graph ID or DOI
  status: 'DISCOVERED'|'VERIFIED'|'PENDING';
  metadataHash: string;         // SHA-256 of evidence payload
  discoveredAt: Date;
  verifiedAt?: Date;
  payload?: any;                // raw graph data
}
```

Persisted via `ExternalEvidenceStore.persistDiscoveryRecord` → `external_discovery_records`.

### 5.2 Citation Evidence (`ExternalEvidenceSnapshot`, CITATION)

```ts
{
  id, provider: 'OPENALEX', providerEntityId: openAlexId,
  evidenceType: 'CITATION',
  payload: { doi, citationCount, citedByUrl, sourceProvider },
  payloadHash, sourceTimestamp, verifiedAt
}
```

Persisted via `ExternalEvidenceStore.persistExternalRecord` → `external_publication_records` + `external_evidence_payloads`.

### 5.3 Index Status (`submissions.index_status`)

`PublicationDepositService.verifyAndRefreshIndexStatus` aggregates verifiers (Zenodo + OpenAIRE) into `overall.visibility`:

- `VISIBLE` = Zenodo `indexed` **AND** OpenAIRE `discovered`
- `PARTIAL` = one of them
- `PROCESSING` / `NOT_STARTED` otherwise

---

## 6. OpenAIRE / OpenAlex Role Separation

| Concern | OpenAIRE (Discovery) | OpenAlex (Citation Intelligence) |
|---------|----------------------|----------------------------------|
| Contract | `IIndexVerificationProvider`, `IOpenAIREProvider` | `ICitationProvider` |
| Capability | `SEARCH_RESEARCH_GRAPH`, `VERIFY_PUBLICATION`, `HARVEST_METADATA`, `FETCH_RELATIONS` | `FETCH_WORK`, `FETCH_AUTHOR`, `FETCH_CITATIONS` |
| Signal | Discovery/indexing status (`DISCOVERED`/`PENDING`) | Citation count + cited-by URL |
| Evidence | `DiscoveryEvidenceSnapshot` (discovery) | `ExternalEvidenceSnapshot` (CITATION) + discovery snapshot |
| Orchestration | `OpenAIREDiscoveryService` | `OpenAlexIntelligenceService` |
| Persistence | `persistDiscoveryRecord` | `persistExternalRecord` (+ discovery snapshot) |
| Failure | Returns `FAILED` status, no fabricated evidence | Throws (fail-closed), no fabricated citation |

**Rule:** OpenAIRE never reports citation counts; OpenAlex never claims discovery-index status. Each provider stays within its capability contract.

---

## 7. RJRAKP Integration Boundary

```
RJRAKP Intelligence Layer
        ↑  (consumes evidence only)
Research Graph Update  (ExternalEvidenceStore records + index_status)
        ↑
SEI Discovery/Citation orchestration
        ↑
ProviderRuntimeManager → OpenAIRE/OpenAlex
```

### 7.1 Rules

1. **RJRAKP consumes evidence only.** RJRAKP reads `external_discovery_records`, `external_publication_records`, `external_evidence_payloads`, and `submissions.index_status`.
2. **RJRAKP does not call providers directly.** No `fetch()` to OpenAIRE/OpenAlex/Zenodo from RJRAKP; all external access flows through SEI providers + `ProviderRuntimeManager`.
3. **No fabricated inputs.** RJRAKP intelligence is only as valid as the evidence trail; no mock/fake discovery or citation data can be consumed.
4. **Read-only consumer.** RJRAKP does not mutate provider evidence; it consumes it for ranking/indexing and research intelligence.

---

## 8. Failure Handling

| Failure | Behavior |
|---------|----------|
| OpenAIRE API failure (`verify`) | Returns `FAILED` status; no fabricated discovery evidence |
| OpenAIRE not indexed (`isIndexed=false`) | `discoverPublication` returns `false`; no evidence persisted |
| OpenAIRE discovery persistence error | `ExternalEvidenceStore` throws (fail-closed) |
| OpenAlex citation API failure | `fetchCitationCount` throws (fail-closed); no fake citation count |
| OpenAlex not found (`isFound=false`) | `fetchIntelligence` returns `false`; no evidence persisted |
| OpenAlex snapshot persistence (current gap) | See §9 — snapshot currently only logged |
| Missing `OPENAIRE_MODE` / OpenAlex config | Provider fail-closed on missing production config |

**No fabricated citation. No fake discovery evidence. No provider bypass.**

---

## 9. Implementation Gap (documented, not fixed)

**Gap:** `OpenAlexIntelligenceService.fetchIntelligence` builds an OpenAlex discovery snapshot and **only logs it** (`console.log('Stored OpenAlex Discovery Snapshot:', snapshot)`) — the code comment `// TODO: Store the snapshot into external_discovery_records in Supabase` confirms persistence is not yet wired to `ExternalEvidenceStore.persistDiscoveryRecord`.

**Impact:** OpenAlex citation/discovery evidence is not durably persisted through the centralized evidence store, so the RJRAKP Intelligence Layer cannot yet consume OpenAlex evidence from the evidence trail.

**Recommended fix (future implementation, not executed here):** In `OpenAlexIntelligenceService.fetchIntelligence`, persist the adapted snapshot via `ExternalEvidenceStore.persistDiscoveryRecord(snapshot)` (and, for the CITATION snapshot, via `persistExternalRecord`), mirroring the OpenAIRE pattern in `OpenAIREDiscoveryService.discoverPublication`.

> This document is documentation-only. The gap is recorded for a follow-up implementation phase; no source code was changed in SEI-06D.

---

## 10. Validation & Scope Confirmation

### 10.1 Scope Confirmation

| Requirement | Status |
|-------------|--------|
| Uses existing `IIndexVerificationProvider` | ✅ CONFIRMED |
| Uses existing `OpenAIREProvider` | ✅ CONFIRMED |
| Uses existing `OpenAlexProvider` | ✅ CONFIRMED |
| Uses `ProviderRuntimeManager` | ✅ CONFIRMED |
| Uses `ExternalEvidenceStore` | ⚠️ PARTIAL — OpenAIRE ✅; OpenAlex gap (§9) |
| No fabricated citation / no fake discovery evidence | ✅ CONFIRMED |
| No provider bypass | ✅ CONFIRMED |
| RJRAKP consumes evidence only | ✅ CONFIRMED (boundary defined) |
| RJRAKP does not call providers directly | ✅ CONFIRMED (boundary defined) |

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
SEI-06D DISCOVERY & CITATION INTELLIGENCE WORKFLOW
Status: DOCUMENTED (workflow defined against implemented pipeline)

Lifecycle:  Published Article → DOI Resolution → OpenAIRE Discovery
            Verification → OpenAlex Citation Discovery → Research Graph
            Update → RJRAKP Intelligence Layer
Discovery:  OpenAIREProvider.searchResearchGraphByDOI + OpenAIREVerificationService
            (IIndexVerificationProvider) → DiscoveryEvidenceSnapshot →
            ExternalEvidenceStore.persistDiscoveryRecord
Citation:   OpenAlexProvider.fetchCitationCount (ICitationProvider) →
            ExternalEvidenceSnapshot (CITATION) → intelligence metrics
Gateway:    ProviderRuntimeManager (timeout/retry/trace, no bypass)
RJRAKP:     Consumes evidence only; never calls providers directly
Gap:        OpenAlexIntelligenceService persists via console.log/TODO — not
            yet wired to ExternalEvidenceStore (documented for follow-up)
Boundaries: Auth FROZEN, Identity Core/RBAC/proxy.ts untouched
```

*Architecture Workflow Artifact — IAEP SEI-06D Discovery & Citation Intelligence Lifecycle.*  
*OpenAIRE = Discovery Provider; OpenAlex = Citation Intelligence Provider. Both feed evidence to RJRAKP — never domain state.*
