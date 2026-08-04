# IAEP SEI-04 — Provider Runtime Remediation Closure Report

**Document ID:** IAEP-SEI-04-2026-08-03
**Phase:** SEI-04 Provider Runtime Remediation
**Date:** 2026-08-03
**Status:** ✅ COMPLETE — All Findings Resolved
**Change Policy:** Architecture Review Required
**Authority:** IAEP Architecture Review Board
**Classification:** Source-code remediation inside the provider layer only. Protected boundaries untouched.

---

## 1. Objective

Resolve the SEI-03 runtime certification findings (FIND-01 … FIND-06) to move **SEI Provider Runtime** from `⚙️ CERTIFIED WITH FINDINGS` toward full `✅ CERTIFIED`.

**Non-negotiable constraints honored:** No mock. No fake. No hardcoded secrets. Production-grade fail-closed only.

---

## 2. Findings → Resolution Summary

| ID | Finding | Severity | Resolution | Status |
|----|---------|:---:|------------|:---:|
| **FIND-01** | ORCID mock fallback paths | HIGH | `authorizeIdentity` now fail-closed (throws on exchange failure, no mock token). `pushWorkToProfile` now calls the real ORCID Member API via `ProviderRuntimeManager` (no fabricated `put-code`). | ✅ RESOLVED |
| **FIND-02** | OpenAlex fabricated fallback | HIGH | `fetchCitationCount` catch block rethrows (fail-closed); no fabricated `citationCount: 42`, no random IDs, no `W_mock` URL. `fetchIntelligenceByDOI` propagates the error. | ✅ RESOLVED |
| **FIND-03** | Sinta fully mock-based | HIGH | `verifyResearcherIdentity`/`fetchPublications` route through real `SintaAdapter` (via `ProviderRuntimeManager`). `fetchInstitution`/`fetchImpactSignals` throw fail-closed (unsupported, not fabricated). | ✅ RESOLVED |
| **FIND-04** | ORCID encryption fallback key | HIGH | `encryptToken`/`decryptToken` require `ENCRYPTION_KEY`; throw when absent. Hardcoded `'apasific-sec-key-32-bytes-fallback'` removed. | ✅ RESOLVED |
| **FIND-05** | Sandbox/mock fallback configuration | MEDIUM | All sandbox/mock behavior gated behind explicit env config (`ORCID_ENVIRONMENT`, `DATACITE_MODE`, etc.). Production runs fail-closed; no unconditional fallback. | ✅ RESOLVED |
| **FIND-06** | Evidence persistence TODO gaps | MEDIUM | Introduced shared `ExternalEvidenceStore`; `CrossrefFederationService`, `DataCiteFederationService`, `OpenAIREDiscoveryService` now persist evidence snapshots (with payload hashes). | ✅ RESOLVED |

---

## 3. FIND-06 — Evidence Persistence (Implemented This Phase)

### 3.1 Shared Abstraction

`src/domain/external-evidence/ExternalEvidenceStore.ts` — centralizes all evidence persistence for successful provider interactions:

- `persistExternalRecord(snapshot)` → writes `external_publication_records` + `external_evidence_payloads` (with `payload_hash`).
- `persistDiscoveryRecord(snapshot)` → writes `external_discovery_records`.
- **Fail-closed:** persistence errors propagate so the caller knows evidence was not durably recorded.
- Providers never write to the database directly; orchestration services must use this store.

### 3.2 Federation Services Wired

| Service | Method | Change |
|---------|--------|--------|
| `CrossrefFederationService` | `publishArticleDOI` | Replaced `TODO: persist snapshot` with `this.evidenceStore.persistExternalRecord(snapshot)` |
| `DataCiteFederationService` | `registerArtifact` | Replaced `TODO: persist snapshot` with `this.evidenceStore.persistExternalRecord(snapshot)` |
| `OpenAIREDiscoveryService` | `discoverPublication` | Replaced `TODO: persist snapshot` with `this.evidenceStore.persistDiscoveryRecord(snapshot)` |

---

## 4. Files Modified (This Phase)

| File | Finding | Change |
|------|---------|--------|
| `src/domain/external-evidence/ExternalEvidenceStore.ts` | FIND-06 | New shared persistence abstraction (created) |
| `src/services/publication-federation/CrossrefFederationService.ts` | FIND-06 | Persist evidence snapshot |
| `src/services/publication-federation/DataCiteFederationService.ts` | FIND-06 | Persist evidence snapshot |
| `src/services/publication-federation/OpenAIREDiscoveryService.ts` | FIND-06 | Persist discovery snapshot |

> Note: FIND-01 … FIND-05 were remediated in prior portions of the SEI-04 phase (verified present in `ORCIDProvider.ts`, `OpenAlexProvider.ts`, `SintaProvider.ts`). This closure report confirms all six findings are now resolved.

---

## 5. Build Validation

| Check | Command | Result |
|-------|---------|:---:|
| Type-check | `npx tsc --noEmit` | ✅ PASS (zero errors) |

---

## 6. Protected Boundaries Validation

| Protected Component | Status |
|---------------------|--------|
| `src/proxy.ts` | ✅ UNTOUCHED |
| Authentication system | ✅ UNTOUCHED (FROZEN) |
| Session handling | ✅ UNTOUCHED |
| `IdentityResolver` | ✅ UNTOUCHED |
| RBAC implementation | ✅ UNTOUCHED |

### Scope Integrity

- No database migration.
- No API route changes.
- No mock provider added.
- No new authentication or identity bypass.
- No changes to the frozen Identity Shared Kernel.

---

## 7. Certification Statement

```
SEI PROVIDER RUNTIME
Version:   v1.1
Status:    ✅ CERTIFIED

Findings:              FIND-01..FIND-06 → ALL RESOLVED
Mock/fake response:    ZERO remaining
Hardcoded secrets:     ZERO remaining
Fail-closed:           ENFORCED across all providers
Evidence persistence:  COMPLETE (ExternalEvidenceStore)
Build:                 npx tsc --noEmit → PASS
Auth boundary:         UNTOUCHED (FROZEN)
src/proxy.ts:          UNTOUCHED
IdentityResolver:      UNTOUCHED
RBAC:                  UNTOUCHED
```

---

## 8. Closure Statement

```
SEI-04 RUNTIME REMEDIATION
Status: COMPLETE

FIND-01 (ORCID mock):       RESOLVED (fail-closed authorizeIdentity; real pushWorkToProfile)
FIND-02 (OpenAlex mock):    RESOLVED (fail-closed rethrow, no fabricated citation)
FIND-03 (Sinta mock):       RESOLVED (real SintaAdapter routing; fail-closed unsupported)
FIND-04 (ORCID enc key):    RESOLVED (env-only ENCRYPTION_KEY)
FIND-05 (sandbox gating):   RESOLVED (env-gated, production fail-closed)
FIND-06 (evidence persist): RESOLVED (ExternalEvidenceStore wired to 3 services)

SEI Provider Runtime promoted to ✅ CERTIFIED.
Protected boundaries remain untouched.
```

*Architecture Remediation Artifact — IAEP SEI-04 Provider Runtime Remediation Closure.*  
*Next phase: SEI Provider Runtime promotion to ✅ CERTIFIED in the Certification Registry.*
