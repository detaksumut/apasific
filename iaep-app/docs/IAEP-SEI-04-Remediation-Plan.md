# IAEP SEI-04 — Provider Runtime Remediation Plan

**Document ID:** IAEP-SEI-04-PLAN-2026-08-03
**Phase:** SEI-04 Provider Runtime Remediation
**Date:** 2026-08-03
**Status:** APPROVED (planning)
**Authority:** IAEP Architecture Review Board
**Change Policy:** Architecture Review Required

---

## 1. Objective

Resolve the SEI-03 runtime certification findings (FIND-01 … FIND-06) to move **SEI Provider Runtime** from `⚙️ CERTIFIED WITH FINDINGS` toward full `✅ CERTIFIED`.

## 2. Guiding Priorities

1. **Remove fake evidence paths** — no fabricated citation counts, tokens, or identities.
2. **Remove hardcoded secrets** — no embedded encryption fallback keys.
3. **Enforce production fail-closed behavior** — missing credentials throw, never fabricate.
4. **Complete provider runtime compliance** — all providers route through `ProviderRuntimeManager`.
5. **Preserve auditability** — evidence snapshots persisted with payload hashes.

**Non-negotiable:** No mock. No fake. Production-grade only.

## 3. Findings → Remediation Mapping

| Finding | Root Cause | Remediation Action |
|---------|-----------|--------------------|
| **FIND-01** ORCID mock paths | `authorizeIdentity()` catch returns mock token; `pushWorkToProfile()` returns fabricated `put-code` without calling the API | Replace `authorizeIdentity` mock fallback with fail-closed throw. Implement real ORCID work-push via `ProviderRuntimeManager`. |
| **FIND-02** OpenAlex fabricated fallback | `fetchCitationCount()` catch block returns fake `citationCount: 42`, random `openAlexId`, `W_mock` URL | Remove the catch mock fallback; rethrow the error (fail-closed). Remove `isFound: true` fabrication in `fetchIntelligenceByDOI` on error. |
| **FIND-03** Sinta fully mock-based | `verifyResearcherIdentity`/`fetchPublications` return hardcoded `"Dr. Ahmad"`/empty data; `fetchInstitution`/`fetchImpactSignals` unimplemented | Route through real `SintaAdapter` (via `ProviderRuntimeManager`); remove hardcoded data; implement all 4 contract methods with fail-closed unsupported behavior. |
| **FIND-04** ORCID encryption fallback key | `encryptToken`/`decryptToken` fall back to `'apasific-sec-key-32-bytes-fallback'` | Remove the hardcoded fallback; require `ENCRYPTION_KEY`; throw (fail-closed) when absent. |
| **FIND-05** Sandbox/mock environment gating | OpenAlex/ORCID unconditional fallbacks regardless of environment/mode | Gate all sandbox/mock behavior behind explicit env config; production runs fail-closed; no unconditional fallback. |
| **FIND-06** Evidence persistence | `CrossrefFederationService`, `DataCiteFederationService`, `OpenAIREDiscoveryService` include `TODO: persist snapshot` | Introduce a shared `ExternalEvidenceStore` abstraction; persist `ExternalEvidenceSnapshot` records (with `payloadHash`) for each successful provider interaction. |

## 4. Files to be Modified

| File | Finding | Change |
|------|---------|--------|
| `src/providers/orcid/ORCIDProvider.ts` | FIND-01, FIND-04 | Fail-closed `authorizeIdentity`; real `pushWorkToProfile`; env-only `ENCRYPTION_KEY` |
| `src/providers/openalex/OpenAlexProvider.ts` | FIND-02, FIND-05 | Remove mock fallback; rethrow on error; env-gated |
| `src/providers/sinta/SintaProvider.ts` | FIND-03 | Real adapter routing; remove hardcoded data |
| `src/providers/sinta/SintaAdapter.ts` | FIND-03 | Complete adapter (already routes via `ProviderRuntimeManager`) |
| `src/services/publication-federation/CrossrefFederationService.ts` | FIND-06 | Persist evidence snapshot |
| `src/services/publication-federation/DataCiteFederationService.ts` | FIND-06 | Persist evidence snapshot |
| `src/services/publication-federation/OpenAIREDiscoveryService.ts` | FIND-06 | Persist evidence snapshot |
| `src/domain/external-evidence/ExternalEvidenceStore.ts` | FIND-06 | New shared persistence abstraction |

## 5. Protected Boundaries (NOT modified)

- `src/proxy.ts`
- Authentication system
- Session handling
- `IdentityResolver`
- RBAC implementation

## 6. Validation Plan

- `npx tsc --noEmit` → must pass (zero errors).
- Run existing tests: `tests/providers/orcid-provider-config.test.ts`, `tests/providers/zenodo-provider-config.test.ts`.
- Confirm no `mock`/`fake`/hardcoded secret remains in the four provider files.
- Confirm protected boundaries untouched via git diff.

## 7. Governance

- This plan is approved before implementation.
- ADRs `ADR-SEI-004` (findings remediation) and `ADR-SEI-005` (evidence persistence) recorded.
- After implementation, SEI-04 closure report + registry update.
- SEI Provider Runtime may be promoted to `✅ CERTIFIED` only after remediation is validated and Review Board sign-off.

---

*Planning artifact — IAEP SEI-04 Provider Runtime Remediation Plan.*

