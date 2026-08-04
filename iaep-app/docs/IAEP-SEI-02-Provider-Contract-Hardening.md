# IAEP SEI-02 — Provider Contract Hardening

**Document ID:** IAEP-SEI-02-2026-08-03
**Phase:** SEI-02 Provider Contract Hardening
**Date:** 2026-08-03
**Status:** ⚙️ CERTIFIED WITH KNOWN GAPS (until validation passes)
**Change Policy:** Architecture Review Required
**Authority:** IAEP Architecture Review Board

---

## 1. Purpose

SEI-02 hardens the provider layer to close the gaps identified in SEI-01:

- **GAP-01:** Crossref/DataCite used raw fetch paths / mock responses.
- **GAP-02:** Crossref, DataCite, and OpenAIRE lacked formal provider contracts.
- **GAP-07:** Verification services bypassed `ProviderRuntimeManager`.

The objective is to convert these paths into **production-grade, formally contracted providers** that route all external calls through `ProviderRuntimeManager` for **isolation and observability** — without touching the authentication boundaries.

---

## 2. Scope

### 2.1 In Scope (Code + Docs)

| Area | Action |
|------|--------|
| Crossref/DataCite/OpenAIRE provider contracts | Created formal interfaces |
| Crossref/DataCite/OpenAIRE providers | Implemented contracts; removed mock/fake responses; routed via `ProviderRuntimeManager` |
| Zenodo/OpenAIRE verification services | Routed via `ProviderRuntimeManager` (GAP-07) |
| DataCiteMapper | Removed fabricated placeholder URL; uses caller-provided `artifactUrl` |
| Federation services | Updated to consume contract interfaces |
| Documentation | `docs/IAEP-SEI-02-Provider-Contract-Hardening.md` |

### 2.2 Out of Scope

- ❌ Authentication Boundary (FROZEN)
- ❌ `src/proxy.ts`
- ❌ IdentityResolver
- ❌ RBAC implementation
- ❌ Session handling
- ❌ Database migrations
- ❌ Publication Core / article workflow
- ❌ No mock provider, no fake implementation, production-grade only

---

## 3. Environment-Controlled Mode

Providers now honor **explicit environment-driven mode** instead of always mocking:

```
Production:
  - real API only
  - credentials required
  - FAIL-CLOSED (throw) when credentials missing

Development/Test:
  - sandbox allowed only through explicit configuration
```

| Provider | Production Env | Sandbox Env | Credentials |
|----------|----------------|-------------|-------------|
| Crossref | `CROSSREF_MODE=production` | `CROSSREF_MODE=sandbox` | `CROSSREF_API_KEY`, `CROSSREF_LOGIN_ID`, `CROSSREF_PREFIX` |
| DataCite | `DATACITE_MODE=production` | `DATACITE_MODE=sandbox` | `DATACITE_API_TOKEN`, `DATACITE_PREFIX` |
| OpenAIRE | `OPENAIRE_MODE=production` | `OPENAIRE_MODE=sandbox` | — (public read) |

---

## 4. Files Changed

### 4.1 New Files (Contracts)

| File | Purpose |
|------|---------|
| `src/providers/crossref/ICrossrefProvider.ts` | Formal Crossref contract |
| `src/providers/datacite/IDataCiteProvider.ts` | Formal DataCite contract |
| `src/providers/openaire/IOpenAIREProvider.ts` | Formal OpenAIRE contract |

### 4.2 Modified Files (Implementation)

| File | Change |
|------|--------|
| `src/providers/crossref/CrossrefProvider.ts` | Implements `ICrossrefProvider`; real API via `ProviderRuntimeManager`; env-controlled; fail-closed |
| `src/providers/datacite/DataCiteProvider.ts` | Implements `IDataCiteProvider`; real API via `ProviderRuntimeManager`; env-controlled; fail-closed |
| `src/providers/openaire/OpenAIREProvider.ts` | Implements `IOpenAIREProvider`; removed fabricated mock wrapper; returns real response |
| `src/providers/datacite/DataCiteMapper.ts` | Removed placeholder `apasific.com/artifacts/<uuid>` URL; uses `metadata.artifactUrl` |
| `src/services/publication-federation/providers/ZenodoVerificationService.ts` | Routes via `ProviderRuntimeManager` (GAP-07) |
| `src/services/publication-federation/providers/OpenAIREVerificationService.ts` | Routes via `ProviderRuntimeManager` (GAP-07) |
| `src/services/publication-federation/OpenAIREDiscoveryService.ts` | Consumes `IOpenAIREProvider` contract; uses contract adapt method |
| `src/services/publication-federation/CrossrefFederationService.ts` | Consumes `ICrossrefProvider` contract |
| `src/services/publication-federation/DataCiteFederationService.ts` | Consumes `IDataCiteProvider` contract |

---

## 5. Architecture Impact

### 5.1 Provider Isolation

All external provider communication now flows through `ProviderRuntimeManager`:

- Crossref ✔
- DataCite ✔
- OpenAIRE ✔
- Zenodo verification ✔
- OpenAIRE verification ✔

No direct `fetch()` / `axios()` / external HTTP calls remain in the hardened paths.

### 5.2 Contract-Driven Architecture

Formal contracts now exist for the previously gap providers:

- `ICrossrefProvider` (GAP-02 closed)
- `IDataCiteProvider` (GAP-02 closed)
- `IOpenAIREProvider` (GAP-02 closed)

Service layer depends on contract interfaces, not concrete implementations.

### 5.3 No Identity Bypass

- No provider creates IAEP users, sessions, or roles.
- No new auth path introduced.
- Authentication Boundary remains FROZEN.

### 5.4 Observability by Default

- Every provider call inherits timeout, retry, `X-Trace-Id` correlation, and structured logging from `ProviderRuntimeManager`.
- Payload hashing (SHA-256) retained for evidence integrity.

---

## 6. Security Notes

- **Credential isolation:** each provider owns its own secret; no shared service credential.
- **Fail-closed:** production mode throws when required credentials are absent.
- **No hardcoded tokens:** all secrets from environment variables.
- **Sandbox gating:** sandbox/dev endpoints only reachable via explicit mode/config.

---

## 7. Certification Status

Per governance, **SEI Provider Contracts** remains:

```
⚙️ CERTIFIED WITH KNOWN GAPS
```

until validation confirms:
- [ ] contracts complete (`ICrossrefProvider`, `IDataCiteProvider`, `IOpenAIREProvider`)
- [ ] runtime routing complete (all external calls via `ProviderRuntimeManager`)
- [ ] no production mock paths remain

This document does **not** promote the layer to full `CERTIFIED`; promotion requires a separate runtime conformance certification (SEI-03).

---

## 8. Validation

### 8.1 Protected Boundaries (must remain untouched)

- `src/proxy.ts` — UNTOUCHED
- Authentication system — UNTOUCHED (FROZEN)
- Session handling — UNTOUCHED
- IdentityResolver — UNTOUCHED
- RBAC implementation — UNTOUCHED

### 8.2 Scope Integrity

- No mock provider introduced.
- No fake implementation introduced.
- Production-grade implementation only.
- No database migration.
- No API route changes.

### 8.3 Build Validation

- Type-check: `npx tsc --noEmit` → **DONE 0 (zero errors)** PASS.
- Modified files compile cleanly with the new contracts and runtime routing.

---

## 9. Remaining Gaps (acknowledged, deferred)

| Gap | Status | Notes |
|-----|--------|-------|
| TODO evidence persistence in 4 federation services | Deferred | Requires Supabase persistence, out of SEI-02 scope |
| Hardcoded encryption fallback key in ORCIDProvider | Deferred | Identified in SEI-01; separate security remediation |
| Sandbox fallbacks in OpenAlex/OpenAIRE | Deferred | Env-controlled modes added; live credential provisioning pending |
| 2 unimplemented Sinta methods | Deferred | Sinta provider incomplete; separate phase |

---

## 10. Closure Statement

```
SEI-02 PROVIDER CONTRACT HARDENING
Status: ⚙️ CERTIFIED WITH KNOWN GAPS (pending validation)

Formal contracts:   ICrossrefProvider, IDataCiteProvider, IOpenAIREProvider
Runtime routing:    Crossref, DataCite, OpenAIRE, ZenodoVerify, OpenAIREVerify
Mock removal:       Crossref (removed), DataCite (removed), OpenAIRE (removed wrapper)
Env-controlled:     production (real, fail-closed) / sandbox (explicit config)
Auth boundary:      UNTOUCHED (FROZEN)
src/proxy.ts:       UNTOUCHED
IdentityResolver:   UNTOUCHED
RBAC:               UNTOUCHED
```

*Architecture Certification Artifact — IAEP SEI-02 Provider Contract Hardening.*  
*Next phase: SEI-03 Runtime Conformance Certification → Provider Layer ✅ CERTIFIED.*
