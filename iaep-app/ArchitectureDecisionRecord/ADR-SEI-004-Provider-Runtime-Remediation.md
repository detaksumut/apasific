# ADR-SEI-004: Provider Runtime Remediation

* **Status:** APPROVED
* **Version:** 1.0
* **Date:** 2026-08-03
* **Phase:** SEI-04 Provider Runtime Remediation

## Decision

Resolve the SEI-03 runtime conformance findings (FIND-01…FIND-06) by enforcing **production-grade, fail-closed provider runtime behavior**. This ADR records the decisions to:

1. **FIND-01 (ORCID mock paths):** Remove all mock/fallback paths from ORCID provider. `authorizeIdentity()` no longer returns a fabricated token on failure — it throws. `pushWorkToProfile()` performs a real ORCID API work-push via `ProviderRuntimeManager`.
2. **FIND-02 (OpenAlex fabricated fallback):** Remove the fabricated citation fallback (`citationCount: 42`, random IDs, `W_mock` URL). Errors propagate (fail-closed). No fake evidence is ever returned.
3. **FIND-03 (Sinta provider decision):** Route Sinta methods through the real `SintaAdapter` (already uses `ProviderRuntimeManager`). Remove hardcoded `"Dr. Ahmad"`/empty datasets. Unsupported methods throw rather than fabricate.
4. **FIND-04 (ORCID encryption fallback key):** Remove the hardcoded fallback key `'apasific-sec-key-32-bytes-fallback'`. Require `ENCRYPTION_KEY`; operations requiring encryption fail-closed when absent.
5. **FIND-05 (Sandbox/mock environment gating):** All sandbox/mock behavior is gated behind explicit environment configuration. Production mode never fabricates, never mocks, fail-closed on missing config.
6. **FIND-06 (Evidence persistence):** Introduce a shared `ExternalEvidenceStore` so that Crossref, DataCite, and OpenAIRE federation services persist `ExternalEvidenceSnapshot` records with payload hashes, preserving auditability.

## Context

SEI-03 certified the provider runtime **WITH FINDINGS**. Fake evidence paths, hardcoded secrets, and unconditional fallbacks contradict the "No mock. No fake. Production-grade only." governance rule and the fail-closed security principle established during Auth Recovery (SEC-03). Before the **SEI Provider Runtime** can be promoted to full `✅ CERTIFIED`, these gaps must be closed.

## Consequences

- **Positive:** Real production-grade provider interactions; auditability preserved via persisted snapshots; no fabricated evidence can enter the evidence trail; credentials are never hardcoded.
- **Negative:** ORCID/Sinta/OpenAlex runtime operations now require credentials/real API reachability; calls fail with errors instead of returning fabricated data. This is the intended fail-closed behavior.

## Compliance

- All external HTTP still routed through `ProviderRuntimeManager`.
- No identity bypass: all provider operations continue to authenticate through the frozen Identity layer; providers cannot create IAEP users.
- Protected boundaries (`src/proxy.ts`, auth, IdentityResolver, RBAC, session handling) remain untouched.

---

*Decision recorded by IAEP Architecture Review Board — SEI-04.*

