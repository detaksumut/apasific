# IAEP SEI-06E — SINTA National Evaluation Workflow

**Document ID:** IAEP-SEI-06E-2026-08-03
**Phase:** SEI-06E SINTA National Evaluation Workflow
**Date:** 2026-08-03
**Status:** 📘 DOCUMENTED (workflow definition with implementation-gap note)
**Change Policy:** Architecture Review Required
**Authority:** IAEP Architecture Review Board
**Classification:** Production-grade SINTA integration as **National Research Evaluation Provider** (SEI-05 category 5 — National Evaluation).

---

## 1. Purpose

SEI-06E formalizes IAEP's integration of **SINTA** (Science and Technology Index, Kemdikbud) as an **External National Evaluation Signal Provider**. SINTA supplies national-level evaluation signals (journal ranking, author metrics, institutional standing) that IAEP consumes as **evidence** to enrich its own research intelligence — never as domain authority.

### 1.1 Boundary (critical)

```
ASIA    = Publisher + Peer Review Authority
RJRAKP  = Research Intelligence Layer
SINTA   = External National Evaluation Signal Provider
```

- **ASIA** owns the peer-reviewed publication and the authority over acceptance/quality.
- **RJRAKP** is the research-intelligence layer that consumes evaluation signals.
- **SINTA** is an external provider of national evaluation signals; it is a **signal source**, not an authority over IAEP publication decisions, identity, or RBAC.

### 1.2 Built on Existing Components

| Requirement | Used Component |
|-------------|----------------|
| SINTA provider contract | `ISintaProvider` / `SintaProviderContract` |
| SINTA provider | `SintaProvider` (`verifyResearcherIdentity`, `fetchPublications`, `fetchInstitution`, `fetchImpactSignals`) |
| SINTA adapter | `SintaAdapter` (`getAuthorProfile`, `getAuthorPublications`) |
| Capabilities | `SintaCapability` |
| Identity mapping | `SintaIdentityMapper.mapToApasificIdentity` |
| All external API calls | `ProviderRuntimeManager` (timeout/retry/trace, no bypass) |
| Evidence persistence | `ExternalEvidenceStore` |

**Non-negotiable constraints:** No provider bypass. No mock data. No authentication changes. No Identity Core changes. No RBAC changes.

---

## 2. SINTA Capability Model

From `SintaCapability`:

| Capability | Description | Adapter Support (current) |
|------------|-------------|---------------------------|
| **IDENTITY_LOOKUP** | Look up a SINTA author/profile by identifier | ✅ `getAuthorProfile` |
| **PROFILE_VERIFICATION** | Verify a researcher's SINTA profile | ✅ `getAuthorProfile` |
| **PUBLICATION_SYNC** | Fetch a researcher's SINTA publications | ✅ `getAuthorPublications` |
| **INSTITUTION_AFFILIATION** | Resolve institution affiliation/ranking | ⚠️ Declared; `fetchInstitution` throws (fail-closed) |
| **IMPACT_SIGNAL_SYNC** | Sync impact/evaluation signals | ⚠️ Declared; `fetchImpactSignals` throws (fail-closed) |

> Declared capabilities must be honored. Capabilities without adapter support are **fail-closed** — an unimplemented signal is never fabricated (see §9).

---

## 3. Publication Verification Lifecycle

```
Published Article
        ↓
SINTA Author Identity Lookup     (verifyResearcherIdentity)
        ↓
SINTA Publication Sync           (fetchPublications)
        ↓
Evaluation Signal Reconciliation  (match DOI/title/year → SINTA record)
        ↓
Evidence Persistence             (ExternalEvidenceStore)
        ↓
RJRAKP Evaluation Consumption
```

### 3.1 Author Identity Lookup (`verifyResearcherIdentity`)

```
SintaAdapter.getAuthorProfile(sintaId)
  → ProviderRuntimeManager.executeRequest('SINTA', /author/{sintaId})
  → SintaIdentityMapper.mapToApasificIdentity(rawData)
      → existing IAEP UUID (ORCID → email → name+affiliation heuristics)
      → undefined if no match (see §9 gap)
  → ExternalEvidenceSnapshot {
        provider: 'SINTA', evidenceType: 'IDENTITY',
        providerEntityId: sintaId, payloadHash, payload, verifiedAt
      }
```

### 3.2 Publication Sync (`fetchPublications`)

```
SintaAdapter.getAuthorPublications(researcherId)
  → ProviderRuntimeManager.executeRequest('SINTA', /author/{id}/publications)
  → ExternalEvidenceSnapshot { provider: 'SINTA', evidenceType: 'PUBLICATION', payload }
```

### 3.3 Reconciliation

- The SINTA publication payload is reconciled against the IAEP published article by **DOI**, then **title**, then **year**.
- Only matched records are persisted as evaluation evidence.
- Never fabricates a match; an unmatched SINTA record is left unlinked.

---

## 4. Journal Ranking Signal

- **Source:** SINTA journal rankings reflect national journal accreditation tiers (S1–S6).
- **Role:** Input signal to RJRAKP journal-evaluation intelligence.
- **Boundary:** SINTA ranking is an **external signal**; it does not override ASIA's own peer-review authority over a journal's content.
- **Consumption:** RJRAKP incorporates the ranking signal in journal-level evaluation and reporting.
- **Evidence:** Journal-ranking evidence is captured as an evaluation snapshot (provider `SINTA`, `evidenceType` evaluation/journal-ranking) and persisted via `ExternalEvidenceStore`.

---

## 5. Author Evaluation Signal

- **Source:** SINTA author profile metrics (score, publications, citations, affiliation).
- **Role:** Author-level national evaluation signal for RJRAKP research-intelligence.
- **Identity boundary:** SINTA supplies **external identity signal** for an author; `SintaIdentityMapper` links it to an **existing** IAEP identity UUID — it never creates a new IAEP user.
- **Consumption:** RJRAKP uses the signal for author-level evaluation; IAEP Identity Core remains authoritative.
- **Evidence:** `evidenceType: 'IDENTITY'` snapshot persisted via `ExternalEvidenceStore`.

---

## 6. Institution Evaluation Signal

- **Source:** SINTA institution affiliation/standing.
- **Role:** Institution-level national evaluation signal.
- **Current status:** `SintaProvider.fetchInstitution` is **not yet supported** by the adapter and **fails closed** (throws) rather than fabricating institution data.
- **Future:** When the adapter supports institution lookup, evidence is captured and persisted via `ExternalEvidenceStore` before RJRAKP consumption.
- **Boundary:** Institution signal is external evidence; it never mutates IAEP institution records directly.

---

## 7. Evidence Persistence Model

All SINTA evaluation signals are persisted through `ExternalEvidenceStore` as immutable, attributable evidence.

### 7.1 Evidence Snapshot (`ExternalEvidenceSnapshot`)

```ts
{
  id, provider: 'SINTA',
  providerEntityId,          // sintaId or SINTA publication id
  apasificIdentityId?,       // mapped IAEP UUID (author signal)
  evidenceType: 'IDENTITY' | 'PUBLICATION' | 'EVALUATION',
  payloadHash,               // SHA-256 via ProviderRuntimeManager.generatePayloadHash
  payload,                   // real SINTA response
  sourceTimestamp, verifiedAt
}
```

### 7.2 Persistence

- **`external_publication_records`** — lightweight publication/provenance records.
- **`external_evidence_payloads`** — immutable raw SINTA payload + hash (tamper-evident).
- **`external_discovery_records`** — discovery/evaluation snapshots (journal ranking, author evaluation).
- **Identity linkage** — stored as evidence mapping to existing IAEP identity; **never** as a new principal.

### 7.3 Integrity Rules

- No hardcoded/mock SINTA data; `payload` is always the real adapter response.
- Every record carries a payload hash for verification.
- Fail-closed: persistence errors propagate; evidence is only trusted after durable storage.

---

## 8. RJRAKP Consumption Boundary

```
RJRAKP Research Intelligence Layer
        ↑  (consumes evaluation evidence only)
ExternalEvidenceStore  (SINTA evaluation snapshots + index_status)
        ↑
SEI SINTA orchestration   (SintaProvider → ProviderRuntimeManager)
        ↑
SINTA External API
```

### 8.1 Rules

1. **RJRAKP consumes evidence only.** RJRAKP reads SINTA evaluation records from `ExternalEvidenceStore`; it does not call SINTA directly.
2. **No provider bypass.** All SINTA calls flow through `SintaProvider`/`SintaAdapter` → `ProviderRuntimeManager`.
3. **No mock data.** Evaluation signals are the real SINTA payloads; no fabricated scores, rankings, or affiliations.
4. **No domain override.** SINTA signals inform evaluation; they do not override ASIA's peer-review authority or IAEP Identity/Core decisions.
5. **Read-only consumer.** RJRAKP does not mutate evidence; it composes signals into research intelligence.

---

## 9. Implementation Gaps (documented, not fixed)

| Gap | Evidence | Recommended Fix (future) |
|-----|----------|--------------------------|
| **Institution signal unsupported** | `SintaProvider.fetchInstitution` throws ("not yet supported by the adapter") | Add `SintaAdapter.getInstitution` routed via `ProviderRuntimeManager`; persist evaluation snapshot |
| **Impact-signal sync unsupported** | `SintaProvider.fetchImpactSignals` throws ("not yet supported by the adapter") | Implement impact/evaluation signal sync through adapter + evidence store |
| **Identity mapping placeholder** | `SintaIdentityMapper.mapToApasificIdentity` returns `undefined` (ORCID/email/name+affiliation heuristics not yet implemented) | Implement matching so SINTA author links to an existing IAEP UUID |

> This document is documentation-only. Gaps are recorded for a follow-up implementation phase; no source code was changed in SEI-06E.

---

## 10. Validation & Scope Confirmation

### 10.1 Scope Confirmation

| Requirement | Status |
|-------------|--------|
| SINTA capability model | ✅ CONFIRMED (§2) |
| Publication verification lifecycle | ✅ CONFIRMED (§3) |
| Journal ranking signal | ✅ CONFIRMED (§4) |
| Author evaluation signal | ✅ CONFIRMED (§5) |
| Institution evaluation signal | ✅ CONFIRMED (§6; fail-closed gap) |
| Evidence persistence model | ✅ CONFIRMED (§7) |
| RJRAKP consumption boundary | ✅ CONFIRMED (§8) |
| No provider bypass / no mock data | ✅ CONFIRMED |

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
SEI-06E SINTA NATIONAL EVALUATION WORKFLOW
Status: DOCUMENTED (workflow defined against implemented pipeline)

Boundary: ASIA = Publisher + Peer Review Authority
          RJRAKP = Research Intelligence Layer
          SINTA = External National Evaluation Signal Provider

Capabilities: IDENTITY_LOOKUP / PROFILE_VERIFICATION / PUBLICATION_SYNC
              (INSTITUTION_AFFILIATION / IMPACT_SIGNAL_SYNC declared;
               adapter support pending — fail-closed)
Lifecycle: Published Article → Author Identity Lookup → Publication Sync
           → Evaluation Signal Reconciliation → Evidence Persistence →
           RJRAKP Evaluation Consumption
Gateway:   ProviderRuntimeManager (timeout/retry/trace, no bypass)
Evidence:  ExternalEvidenceStore (external_publication_records +
           external_evidence_payloads + external_discovery_records)
RJRAKP:    Consumes evidence only; never calls providers directly
Gaps:      fetchInstitution/fetchImpactSignals throw (adapter pending);
           mapToApasificIdentity returns undefined (matching pending)
Boundaries: Auth FROZEN, Identity Core/RBAC/proxy.ts untouched
```

*Architecture Workflow Artifact — IAEP SEI-06E SINTA National Evaluation Lifecycle.*  
*SINTA is an external national evaluation signal provider; ASIA remains publisher + peer-review authority. No identity bypass, no RBAC change.*
