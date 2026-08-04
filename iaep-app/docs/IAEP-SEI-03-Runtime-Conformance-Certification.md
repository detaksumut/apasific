# IAEP SEI-03 — Runtime Conformance Certification

**Document ID:** IAEP-SEI-03-2026-08-03
**Phase:** SEI-03 Runtime Conformance Certification
**Date:** 2026-08-03
**Status:** ⚙️ CERTIFIED WITH FINDINGS
**Change Policy:** Architecture Review Required
**Authority:** IAEP Architecture Review Board
**Classification:** Documentation only — no source-code changes in this phase.

---

## 1. Purpose

SEI-03 certifies the **runtime conformance** of the Scholarly Ecosystem Integration provider layer. It verifies that each provider:

1. Routes all external communication through the `ProviderRuntimeManager` gateway.
2. Satisfies observability requirements (structured logging, request tracking, response status, latency, error classification).
3. Fails closed on missing credentials and never introduces mock/fabricated responses for real data.
4. Is subject to a documented security review with remaining gaps explicitly tracked.

The certification is deliberately **NOT promoted to full `CERTIFIED`**. It is certified **WITH FINDINGS** so the runtime gaps are tracked and remediated in a dedicated phase before the Provider Layer is promoted to production-ready.

---

## 2. ProviderRuntimeManager Enforcement Audit

### 2.1 Conformance Matrix

| Provider | Runtime Gateway | Methods | Conformance |
|----------|-----------------|---------|:---:|
| **Crossref** | ✅ `ProviderRuntimeManager.executeRequest` | `depositXML`, `updateMetadata` | ✅ CONFORMS |
| **DataCite** | ✅ `ProviderRuntimeManager.executeRequest` | `registerArtifactDOI`, `updateMetadata` | ✅ CONFORMS |
| **OpenAIRE** | ✅ `ProviderRuntimeManager.executeRequest` | `searchResearchGraphByDOI` | ✅ CONFORMS |
| **Zenodo** | ✅ `ProviderRuntimeManager.executeRequest` | `createDeposit`, `uploadFile`, `publishRecord` | ✅ CONFORMS |
| **ORCID** | ⚠️ Partial | `exchangeAuthorizationCode`, `verifyIdentity` route ✅; `authorizeIdentity` mock fallback; `pushWorkToProfile` fully mocked | ⚠️ FINDINGS (FIND-01) |
| **OpenAlex** | ⚠️ Partial | `fetchCitationCount` routes ✅; mock fallback on error | ⚠️ FINDINGS (FIND-02) |
| **Sinta** | ❌ Not routed | `verifyResearcherIdentity`, `fetchPublications` return hardcoded data; `fetchInstitution`, `fetchImpactSignals` unimplemented | ❌ FINDINGS (FIND-03) |

### 2.2 Detail

**Crossref** — `depositXML` and `updateMetadata` both call `ProviderRuntimeManager.executeRequest('CROSSREF', ...)`. No direct `fetch`/`axios`. Env-controlled (`CROSSREF_MODE`), fail-closed in production. ✅

**DataCite** — `registerArtifactDOI` and `updateMetadata` call `ProviderRuntimeManager.executeRequest('DATACITE', ...)`. Env-controlled (`DATACITE_MODE`), fail-closed in production. ✅

**OpenAIRE** — `searchResearchGraphByDOI` calls `ProviderRuntimeManager.executeRequest('OPENAIRE', ...)`. Returns real graph response; `isIndexed` derived from real payload. ✅

**Zenodo** — `createDeposit`, `uploadFile`, `publishRecord` all call `ProviderRuntimeManager.executeRequest('ZENODO', ...)`. Sandbox/production via `ZENODO_ENVIRONMENT`. ✅

**ORCID** — `exchangeAuthorizationCode` and `verifyIdentity` route via `ProviderRuntimeManager`. ⚠️ However `authorizeIdentity` has a **mock fallback** on failure, and `pushWorkToProfile` **never calls the real API** (returns a fabricated `put-code`). → FIND-01.

**OpenAlex** — `fetchCitationCount` routes via `ProviderRuntimeManager` and returns real citation data. ⚠️ On error it **falls back to a fabricated response** (fake `citationCount: 42`, random `openAlexId`, `W_mock` cited-by URL). → FIND-02.

**Sinta** — `verifyResearcherIdentity` returns hardcoded `"Dr. Ahmad"` data; `fetchPublications` returns empty fabricated list; `fetchInstitution`/`fetchImpactSignals` throw "not implemented". Never calls `ProviderRuntimeManager` for external HTTP. → FIND-03.

### 2.3 Verification Services

| Service | Runtime Gateway | Conformance |
|---------|-----------------|:---:|
| `ZenodoVerificationService` | ✅ `ProviderRuntimeManager.executeRequest('ZENODO', ...)` | ✅ CONFORMS |
| `OpenAIREVerificationService` | ✅ `ProviderRuntimeManager.executeRequest('OPENAIRE', ...)` | ✅ CONFORMS |

Both verification services were hardened in SEI-02 (GAP-07 closed) and now route through the runtime gateway.

---

## 3. Observability Compliance

`ProviderRuntimeManager` provides observability by default for every routed call.

| Requirement | Implementation | Status |
|-------------|----------------|:---:|
| **Structured logging** | `logger.info/warn/error` with `event` field: `PROVIDER_REQUEST_INITIATED`, `PROVIDER_REQUEST_RETRY`, `PROVIDER_REQUEST_SUCCESS`, `PROVIDER_REQUEST_FAILED` | ✅ |
| **Request tracking** | `X-Trace-Id` correlation header (UUID) per request | ✅ |
| **Response status** | Success/failure logged with HTTP status; non-2xx handled | ✅ |
| **Latency tracking** | `latencyMs` captured per attempt and logged | ✅ |
| **Error classification** | Retryable (408/429/5xx/abort/timeout) vs non-retryable; error message logged | ✅ |

**Coverage limitation:** All four batching-provider paths (Crossref, DataCite, OpenAIRE, Zenodo) and both verification services inherit these guarantees. ORCID, OpenAlex, and Sinta paths that **bypass** the runtime (mock/fallback paths) do **not** provide observability — a consequence of FIND-01/02/03.

---

## 4. Failure Handling

### 4.1 Fail-Closed on Missing Credentials

| Provider | Fail-Closed Behavior | Status |
|----------|----------------------|:---:|
| Crossref | Production requires `CROSSREF_PREFIX` (constructor) + `CROSSREF_API_KEY`/`CROSSREF_LOGIN_ID` (`assertCredentials`); throws if missing | ✅ |
| DataCite | Production requires `DATACITE_PREFIX` (constructor) + `DATACITE_API_TOKEN` (`assertCredentials`); throws if missing | ✅ |
| OpenAIRE | Public read; no credentials required | ✅ |
| Zenodo | Throws `ZENODO_API_TOKEN is not configured` when token absent | ✅ |
| ORCID | `exchangeAuthorizationCode` relies on runtime; **but** `authorizeIdentity` mock fallback masks missing credentials | ⚠️ FIND-01 |
| OpenAlex | Public read; **but** error path returns mock fallback | ⚠️ FIND-02 |
| Sinta | **No fail-closed** — returns hardcoded data regardless of credentials | ❌ FIND-03 |

### 4.2 No Mock Fallback / No Fake Response

| Provider | Mock/Fake Present? | Conformance |
|----------|--------------------|:---:|
| Crossref | ✅ No (real API only) | ✅ |
| DataCite | ✅ No (real API only) | ✅ |
| OpenAIRE | ✅ No (real graph response) | ✅ |
| Zenodo | ✅ No (real API only) | ✅ |
| ORCID | ❌ `authorizeIdentity` mock fallback; `pushWorkToProfile` fully mocked | ❌ FIND-01 |
| OpenAlex | ❌ fabricated fallback (`citationCount: 42`, random IDs) | ❌ FIND-02 |
| Sinta | ❌ fully mock-based (hardcoded `"Dr. Ahmad"`) | ❌ FIND-03 |

---

## 5. Security Review — Findings Register

The following findings are **tracked but NOT remediated in this phase** (per certification scope). They form the **SEI-04 Remediation Backlog**.

| ID | Finding | Severity | Location | Impact |
|----|---------|:---:|----------|--------|
| **FIND-01** | ORCID mock fallback paths | HIGH | `ORCIDProvider.authorizeIdentity` (mock token exchange), `ORCIDProvider.pushWorkToProfile` (never connects to real API) | Fabricated identity/work evidence; ORCID publication workflow not connected to production |
| **FIND-02** | OpenAlex fabricated fallback response | HIGH | `OpenAlexProvider.fetchCitationCount` catch block | Fake citation count (`42`) and fake IDs returned on error; corrupts citation intelligence |
| **FIND-03** | Sinta provider fully mock-based | HIGH | `SintaProvider.verifyResearcherIdentity`, `fetchPublications`; `fetchInstitution`/`fetchImpactSignals` unimplemented | Hardcoded identity; no ProviderRuntimeManager routing; incomplete conformance |
| **FIND-04** | ORCID hardcoded encryption fallback key | HIGH | `ORCIDProvider.encryptToken`/`decryptToken` (`'apasific-sec-key-32-bytes-fallback'`) | Hardcoded secret fallback weakens token encryption; must be env-only |
| **FIND-05** | Sandbox/mock fallback configuration | MEDIUM | OpenAlex catch fallback; ORCID `authorizeIdentity` catch; Sinta hardcoded data | Sandbox behavior not gated behind explicit env/config; can emit fabricated data in non-dev contexts |
| **FIND-06** | Evidence persistence TODO gaps | MEDIUM | `CrossrefFederationService`, `DataCiteFederationService`, `OpenAIREDiscoveryService` (TODO: persist snapshot to Supabase) | Evidence not persisted; audit trail incomplete for these providers |

### 5.1 Observations (Non-Blocking)

- **Fail-closed principle exists** and is correctly applied to Crossref, DataCite, Zenodo, and OpenAIRE.
- **ProviderRuntimeManager pattern is proven** and works for the four conforming providers.
- The findings are **isolated to ORCID, OpenAlex, and Sinta** — the providers that have not yet completed credential provisioning / real-API integration.

---

## 6. Build Validation

| Check | Command | Result |
|-------|---------|:---:|
| Type-check | `npx tsc --noEmit` | ✅ PASS (DONE 0 — zero errors) |
| Build validation | `npx tsc --noEmit` (compile gate) | ✅ PASS |

> Note: This is a **documentation-only** certification. No source files were modified in SEI-03. The build/type-check reflects the existing codebase state and confirms the environment is green.

---

## 7. Certification Statement

```
SEI PROVIDER RUNTIME
Version:   v1.0
Status:    ⚙️ CERTIFIED WITH FINDINGS
```

### 7.1 Certified (Runtime Architecture)

- ProviderRuntimeManager pattern exists and works.
- Crossref, DataCite, OpenAIRE, Zenodo fully conform (all external calls via runtime gateway).
- Zenodo/OpenAIRE verification services conform.
- Fail-closed principle exists and is applied to Crossref, DataCite, OpenAIRE, Zenodo.
- Observability (structured logging, request tracking, response status, latency, error classification) is provided by the runtime for all conforming paths.

### 7.2 Findings (Tracked, Not Remediated)

- FIND-01: ORCID mock fallback paths.
- FIND-02: OpenAlex fabricated fallback response.
- FIND-03: Sinta provider fully mock-based.
- FIND-04: ORCID hardcoded encryption fallback key.
- FIND-05: Sandbox/mock fallback configuration.
- FIND-06: Evidence persistence TODO gaps.

### 7.3 Promotion Gate

**This is NOT full `CERTIFIED`.** Promotion to `CERTIFIED` requires SEI-04 Remediation to close FIND-01 through FIND-06 (ORCID real-API work push, OpenAlex fail-closed error handling, Sinta real integration or explicit de-scoping, encryption-key removal, env-gated sandbox, and evidence persistence).

---

## 8. Protected Boundaries Validation

| Protected Component | Status |
|---------------------|--------|
| `src/proxy.ts` | ✅ UNTOUCHED |
| Authentication system | ✅ UNTOUCHED (FROZEN) |
| `IdentityResolver` | ✅ UNTOUCHED |
| RBAC implementation | ✅ UNTOUCHED |
| Session handling | ✅ UNTOUCHED |

### Scope Integrity

- Documentation only in this phase.
- No source-code changes.
- No database migration.
- No API route changes.
- No mock provider added.

---

## 9. Remediation Backlog (Next Phase — SEI-04)

| ID | Action | Priority |
|----|--------|:---:|
| FIND-01 | Replace ORCID `authorizeIdentity` mock fallback with fail-closed; connect `pushWorkToProfile` to real ORCID API | HIGH |
| FIND-02 | Replace OpenAlex catch mock fallback with throw (fail-closed) | HIGH |
| FIND-03 | Implement Sinta real integration or explicitly de-scope Sinta; remove hardcoded data; route via `ProviderRuntimeManager` | HIGH |
| FIND-04 | Remove ORCID hardcoded encryption fallback key; env-only `ENCRYPTION_KEY` | HIGH |
| FIND-05 | Gate all sandbox/mock behavior behind explicit env/config; remove unconditional fallbacks | MEDIUM |
| FIND-06 | Persist evidence snapshots in Crossref/DataCite/OpenAIRE federation services | MEDIUM |

---

## 10. Closure Statement

```
SEI-03 RUNTIME CONFORMANCE CERTIFICATION
Status: ⚙️ CERTIFIED WITH FINDINGS

Runtime gateway:     ProviderRuntimeManager (operational)
Conforming:          Crossref, DataCite, OpenAIRE, Zenodo + verification services
Fail-closed:         Present for Crossref, DataCite, OpenAIRE, Zenodo
Findings:            FIND-01..FIND-06 (tracked, NOT remediated)
Auth boundary:       UNTOUCHED (FROZEN)
src/proxy.ts:        UNTOUCHED
IdentityResolver:    UNTOUCHED
RBAC:                UNTOUCHED

NOT promoted to CERTIFIED. Promotion requires SEI-04 remediation.
```

*Architecture Certification Artifact — IAEP SEI-03 Runtime Conformance Certification.*  
*Next phase: SEI-04 Runtime Gap Remediation → SEI Provider Runtime ✅ CERTIFIED.*
