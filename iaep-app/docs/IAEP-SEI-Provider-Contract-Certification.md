# IAEP SEI Provider Contract Certification

**Document ID:** IAEP-SEI-01-2026-08-03
**Phase:** SEI-01 Provider Contract Certification
**Date:** 2026-08-03
**Status:** ⚙️ CERTIFIED WITH KNOWN GAPS
**Change Policy:** Architecture Review Required
**Authority:** IAEP Architecture Review Board
**Classification:** Documentation Only — No provider API calls, no credentials, no migration, no auth changes.

---

## 1. Purpose and Scope

This artifact certifies the **existing provider contract layer** of the IAEP Scholarly Ecosystem Integration (SEI). It audits provider interfaces, capability enums, adapter contracts, and mapper contracts against the SEI-00 architecture principles.

**Scope:**
- Contract inventory (interfaces, capability enums, adapters, mappers).
- Capability matrix (provider × capability).
- Provider interface map (contract → implementation traceability).
- Compliance assessment (Provider Isolation, Contract Driven, No Identity Bypass, Observability).
- Known gaps and remediation roadmap.

**Out of scope (later phases):** new external API integrations, credential provisioning, live provider API calls, database changes, authentication changes.

---

## 2. Contract Inventory

### 2.1 Provider Interfaces

| Interface | Path | Methods | Implemented By |
|-----------|------|---------|----------------|
| `ICitationProvider` | `src/providers/contracts/ICitationProvider.ts` | `fetchCitationCount(doi)` | `OpenAlexProvider` |
| `IZenodoDepositProvider` | `src/providers/zenodo/IZenodoDepositProvider.ts` | `getCapabilities()`, `createDeposit()`, `uploadFile()`, `publishRecord()` | `ZenodoProvider` |
| `IOrcidIdentityProvider` | `src/providers/orcid/IOrcidIdentityProvider.ts` | `exchangeAuthorizationCode(code)`, `verifyIdentity(orcidId)` | `ORCIDProvider` |
| `ISintaProvider` | `src/providers/contracts/SintaProviderContract.ts` | `verifyResearcherIdentity()`, `fetchPublications()`, `fetchInstitution()`, `fetchImpactSignals()` | `SintaProvider` (2/4 implemented) |
| `IIndexVerificationProvider` | `src/services/publication-federation/contracts/IIndexVerificationProvider.ts` | `verify(identifier)` | `ZenodoVerificationService`, `OpenAIREVerificationService` |
| `IZenodoRecord` | `src/providers/zenodo/IZenodoRecord.ts` | Data model (recordId, doi, conceptDoi, recordUrl, publishedDate, metadataUrl, filesCount, status) | `ZenodoAdapter`/`ZenodoProvider` (produced records) |

### 2.2 Capability Enums

| Enum | Path | Values |
|------|------|--------|
| `ZenodoCapability` | `src/providers/zenodo/ZenodoCapability.ts` | `CREATE_DEPOSIT`, `UPLOAD_FILE`, `PUBLISH_RECORD`, `FETCH_METADATA`, `VERIFY_DOI` |
| `CrossrefCapability` | `src/providers/crossref/CrossrefCapability.ts` | `REGISTER_PUBLISHER_DOI`, `UPDATE_METADATA`, `FETCH_METADATA` |
| `OpenAIRECapability` | `src/providers/openaire/OpenAIRECapability.ts` | `SEARCH_RESEARCH_GRAPH`, `HARVEST_METADATA`, `VERIFY_PUBLICATION`, `FETCH_RELATIONS` |
| `OpenAlexCapability` | `src/providers/openalex/OpenAlexCapability.ts` | `FETCH_WORK`, `FETCH_AUTHOR`, `FETCH_INSTITUTION`, `FETCH_CITATIONS` |
| `SintaCapability` | `src/providers/sinta/SintaCapability.ts` | `IDENTITY_LOOKUP`, `PROFILE_VERIFICATION`, `PUBLICATION_SYNC`, `INSTITUTION_AFFILIATION`, `IMPACT_SIGNAL_SYNC` |
| `DataCiteCapability` | `src/providers/datacite/DataCiteCapability.ts` | `REGISTER_DOI`, `UPDATE_METADATA`, `FETCH_METADATA` |

### 2.3 Adapters

| Adapter | Path | Purpose |
|---------|------|---------|
| `ZenodoAdapter` | `src/providers/zenodo/ZenodoAdapter.ts` | Deposit response → `ExternalEvidenceSnapshot` |
| `CrossrefAdapter` | `src/providers/crossref/CrossrefAdapter.ts` | XML deposit response → `ExternalEvidenceSnapshot` (PUBLISHER_DOI) |
| `OpenAIREAdapter` | `src/providers/openaire/OpenAIREAdapter.ts` | Raw graph JSON → `DiscoveryEvidenceSnapshot` |
| `OpenAlexAdapter` | `src/providers/openalex/OpenAlexAdapter.ts` | Intelligence metrics → `DiscoveryEvidenceSnapshot` |
| `ORCIDAdapter` | `src/providers/orcid/ORCIDAdapter.ts` | Auth response → identity snapshot; work push → publication snapshot |
| `SintaAdapter` | `src/providers/sinta/SintaAdapter.ts` | Author profile/publications via `ProviderRuntimeManager` |
| `DataCiteAdapter` | `src/providers/datacite/DataCiteAdapter.ts` | Registration response → `ExternalEvidenceSnapshot` |

### 2.4 Mappers

| Mapper | Path | Purpose |
|--------|------|---------|
| `ZenodoMapper` | `src/providers/zenodo/ZenodoMapper.ts` | `ApasificPublicationMetadata` → `ZenodoMetadata` |
| `CrossrefMapper` | `src/providers/crossref/CrossrefMapper.ts` | `CrossrefDepositMetadata` → Crossref DOI batch XML |
| `OpenAIREMapper` | `src/providers/openaire/OpenAIREMapper.ts` | Raw OpenAIRE JSON → `OpenAIREMetadata` |
| `OpenAlexMapper` | `src/providers/openalex/OpenAlexMapper.ts` | Raw Work graph → `OpenAlexIntelligenceMetrics` |
| `ORCIDMapper` | `src/providers/orcid/ORCIDMapper.ts` | Internal publication → `ORCIDWorkMetadata` |
| `SintaIdentityMapper` | `src/providers/sinta/SintaIdentityMapper.ts` | SINTA author → internal IAEP identity (lookup, never creates) |
| `DataCiteMapper` | `src/providers/datacite/DataCiteMapper.ts` | `DataCiteArtifactMetadata` → DataCite JSON payload |

### 2.5 Evidence & Domain Models

| Model | Path | Type |
|-------|------|------|
| `ExternalEvidenceSnapshot` | `src/domain/external-evidence/ExternalEvidenceSnapshot.ts` | Evidence snapshot (IDENTITY/PUBLICATION/CITATION/INSTITUTION/IMPACT_METRIC/PUBLISHER_DOI/DATASET) |
| `DiscoveryEvidenceSnapshot` | `src/domain/external-evidence/DiscoveryEvidenceSnapshot.ts` | Discovery snapshot (DISCOVERED/VERIFIED/PENDING) |
| `FederationResult` | `src/services/publication-federation/models/FederationResult.ts` | Federation verification result |
| `ExternalPublicationLifecycle` | `src/domain/external-evidence/ExternalPublicationLifecycle.ts` | State machine for external publication lifecycle |
| `PublicationFederationEvent` | `src/domain/external-evidence/PublicationFederationEvents.ts` | Federation event types |

---

## 3. Capability Matrix

Provider capabilities declared by enums and/or interface implementations:

| Capability | Crossref | ORCID | Zenodo | OpenAIRE | OpenAlex | Sinta | DataCite |
|------------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| DOI Registration | ✅ | — | ✅ | — | — | — | ✅ |
| Metadata Deposit | ✅ | — | ✅ | — | — | — | ✅ |
| Researcher Identity Synchronization | — | ✅ | — | — | — | ✅ | — |
| Repository Publication | — | — | ✅ | — | — | — | — |
| Citation Discovery | — | — | — | ✅ | ✅ | — | — |
| Indexing Synchronization | — | — | ✅ | ✅ | — | — | — |
| Journal Submission Workflow | — | — | — | — | — | — | — |

> **Note:** Capability declaration ≠ production readiness. Crossref and DataCite currently operate with sandbox/mock paths; see Known Gaps (§6).

---

## 4. Provider Interface Map

### 4.1 Contract Traceability

```
ICitationProvider ────────────────► OpenAlexProvider ──► ProviderRuntimeManager ──► api.openalex.org
IZenodoDepositProvider ──────────► ZenodoProvider ─────► ProviderRuntimeManager ──► zenodo.org/api
IOrcidIdentityProvider ──────────► ORCIDProvider ──────► ProviderRuntimeManager ──► api.orcid.org
ISintaProvider ──────────────────► SintaProvider ──────► ProviderRuntimeManager ──► sinta.kemdikbud.go.id
IIndexVerificationProvider ──────► ZenodoVerificationService ──► fetch (raw) ──► zenodo.org/api
IIndexVerificationProvider ──────► OpenAIREVerificationService ► fetch (raw) ──► api.openaire.eu
(no formal contract) ───────────► CrossrefProvider ───► mock/raw ──► test.crossref.org
(no formal contract) ───────────► DataCiteProvider ───► mock/raw ──► api.test.datacite.org
(no formal contract) ───────────► OpenAIREProvider ───► ProviderRuntimeManager ──► api.openaire.eu
```

### 4.2 Orchestration Services

| Service | Path | Role | Uses Contracts |
|---------|------|------|:---:|
| `PublicationDepositService` | `src/services/publication-federation/PublicationDepositService.ts` | Zenodo deposit, DOI verification, index status refresh | ✅ (IZenodoDepositProvider + verifiers) |
| `CrossrefFederationService` | `src/services/publication-federation/CrossrefFederationService.ts` | Crossref XML deposit orchestration | ⚠️ (no formal Crossref contract) |
| `DataCiteFederationService` | `src/services/publication-federation/DataCiteFederationService.ts` | DataCite artifact DOI registration | ⚠️ (no formal DataCite contract) |
| `OpenAIREDiscoveryService` | `src/services/publication-federation/OpenAIREDiscoveryService.ts` | OpenAIRE graph discovery | ⚠️ (no formal OpenAIRE contract) |
| `OpenAlexIntelligenceService` | `src/services/publication-federation/OpenAlexIntelligenceService.ts` | OpenAlex citation intelligence | ✅ (ICitationProvider) |

---

## 5. Compliance Assessment

### 5.1 Provider Isolation

**Assessment: PASS (with caveats)**

- ✅ All provider API calls intended to pass through `ProviderRuntimeManager` (timeout, retry, structured logging, payload hashing).
- ✅ Providers that comply: OpenAlex, OpenAIRE, Zenodo, ORCID, Sinta.
- ✅ Adapters translate external responses; domain code never calls provider APIs directly.
- ⚠️ **Caveats:**
  - `CrossrefProvider.depositXML` and `DataCiteProvider.registerArtifactDOI` use **mock paths / raw fetch** — they do not route through `ProviderRuntimeManager`.
  - `ZenodoVerificationService` and `OpenAIREVerificationService` use **raw `fetch()`** without `ProviderRuntimeManager` (no structured logging/retry).
  - `ORCIDProvider.encryptToken`/`decryptToken` contain a **hardcoded encryption fallback key**.

### 5.2 Contract Driven

**Assessment: PASS (with caveats)**

- ✅ Formal contracts exist for: Citation (`ICitationProvider`), Zenodo deposit (`IZenodoDepositProvider`), ORCID identity (`IOrcidIdentityProvider`), Sinta (`ISintaProvider`), Index verification (`IIndexVerificationProvider`).
- ✅ Adapter/mapper separation exists consistently across all providers.
- ✅ Evidence snapshots use standardized domain models (`ExternalEvidenceSnapshot`, `DiscoveryEvidenceSnapshot`).
- ⚠️ **Caveats:**
  - Crossref, DataCite, and OpenAIRE providers have **no formal provider interface** — only capability enums.
  - `CrossrefProvider` and `DataCiteProvider` implement methods that do not conform to a shared interface.
  - `ZenodoVerificationService`/`OpenAIREVerificationService` implement `IIndexVerificationProvider` but bypass runtime.

### 5.3 No Identity Bypass

**Assessment: PASS**

- ✅ ORCID identity flow is **evidence-only**: OAuth responses captured via `ORCIDAdapter.adaptAuthToIdentitySnapshot` as identity evidence snapshots, never as session credentials.
- ✅ `SintaIdentityMapper.mapToApasificIdentity` performs **lookup only** and returns `undefined` when no match — it never creates an IAEP user.
- ✅ No provider code touches the authentication boundary, session cookies, `IdentityResolver`, or RBAC.
- ✅ `src/proxy.ts` unchanged; no new auth fallback introduced.

### 5.4 Observability

**Assessment: PASS (with caveats)**

- ✅ `ProviderRuntimeManager` emits structured events: `PROVIDER_REQUEST_INITIATED`, `PROVIDER_REQUEST_RETRY`, `PROVIDER_REQUEST_SUCCESS`, `PROVIDER_REQUEST_FAILED`, with trace ID, provider, endpoint, attempt, latency.
- ✅ Evidence payloads are SHA-256 hashed for tamper-evident auditability.
- ⚠️ **Caveats:**
  - Crossref, DataCite, and verification services bypass `ProviderRuntimeManager`, so they lack the standardized observability envelope.
  - Federation services log to `console` with `TODO: store snapshot` placeholders — evidence persistence to Supabase is incomplete.

---

## 6. Known Gaps

| ID | Gap | Location | Impact | Severity |
|----|-----|----------|--------|:---:|
| GAP-01 | Crossref/DataCite operate on **mock/sandbox paths**, not real provider APIs | `CrossrefProvider`, `DataCiteProvider` | DOI/metadata deposit not production-ready | HIGH |
| GAP-02 | **No formal provider contract** for Crossref, DataCite, OpenAIRE providers | `src/providers/crossref/`, `datacite/`, `openaire/` | Contract-driven principle incomplete | MEDIUM |
| GAP-03 | **Hardcoded encryption fallback key** in ORCID token encryption | `ORCIDProvider.encryptToken/decryptToken` | Credential isolation risk | HIGH |
| GAP-04 | **Sandbox fallback paths** in OpenAlex/OpenAIRE providers return mock data when API fails | `OpenAlexProvider`, `OpenAIREProvider` | Silent degradation to mock data in production risk | MEDIUM |
| GAP-05 | **Sinta methods unimplemented**: `fetchInstitution`, `fetchImpactSignals` throw "not implemented" | `SintaProvider` | Sinta contract incomplete (2/4 methods) | MEDIUM |
| GAP-06 | **Evidence persistence TODOs** — snapshots logged to console but not stored | `CrossrefFederationService`, `DataCiteFederationService`, `OpenAIREDiscoveryService`, `OpenAlexIntelligenceService` | Auditability gap: evidence not durable | HIGH |
| GAP-07 | Verification services use **raw `fetch()`** without `ProviderRuntimeManager` | `ZenodoVerificationService`, `OpenAIREVerificationService` | Observability/retry gap | LOW |

---

## 7. Remediation Roadmap

| Phase | Action | Gaps Addressed |
|-------|--------|:---:|
| SEI-02 | Define formal provider contracts for Crossref, DataCite, OpenAIRE (interface + conformance tests) | GAP-02 |
| SEI-02 | Route Crossref/DataCite/verification calls through `ProviderRuntimeManager` | GAP-01, GAP-07 |
| SEI-03 | Remove hardcoded ORCID encryption fallback key; env-only secret with fail-safe deny | GAP-03 |
| SEI-03 | Remove sandbox mock fallbacks from OpenAlex/OpenAIRE; fail closed instead | GAP-04 |
| SEI-03 | Implement remaining Sinta contract methods (`fetchInstitution`, `fetchImpactSignals`) | GAP-05 |
| SEI-04 | Wire evidence snapshot persistence to `external_publication_records` / `external_evidence_payloads` / discovery records | GAP-06 |
| SEI-04 | Provider certification lifecycle promotion (CONTRACT → ADAPTER → SECURITY → PRODUCTION READY) | All gaps closed + security review |

---

## 8. Certified / Known Gaps Summary

### 8.1 Certified (Contract Architecture)

- ✅ Contract structure exists (interfaces, capability enums, adapters, mappers).
- ✅ Provider isolation pattern exists (`ProviderRuntimeManager` gateway).
- ✅ Adapter and mapper separation exists across all providers.
- ✅ Identity boundary preserved (evidence-only, no user creation, no bypass).
- ✅ Capability model exists (per-provider capability enums).

### 8.2 Known Gaps (Implementation Readiness)

- ⚠️ Crossref/DataCite raw fetch or mock paths.
- ⚠️ Missing formal contracts for some providers (Crossref, DataCite, OpenAIRE).
- ⚠️ ORCID hardcoded encryption fallback key.
- ⚠️ Sandbox fallback paths (OpenAlex, OpenAIRE).
- ⚠️ Sinta incomplete methods.
- ⚠️ Evidence persistence TODO (4 federation services).

---

## 9. Validation

| Requirement | Status |
|-------------|--------|
| Documentation only | ✅ CONFIRMED |
| No provider API calls | ✅ CONFIRMED |
| No credentials added | ✅ CONFIRMED |
| No migration | ✅ CONFIRMED |
| No authentication changes | ✅ CONFIRMED |
| `src/proxy.ts` untouched | ✅ CONFIRMED |
| Authentication Boundary untouched (FROZEN) | ✅ CONFIRMED |
| `IdentityResolver` untouched | ✅ CONFIRMED |
| RBAC untouched | ✅ CONFIRMED |
| Session handling untouched | ✅ CONFIRMED |

---

## Closure Statement

```
SEI PROVIDER CONTRACTS
Phase: SEI-01 Provider Contract Certification
Version: v1.0
Status: CERTIFIED WITH KNOWN GAPS

Certified:
  Contract structure ..................... PASS
  Provider isolation pattern ............ PASS
  Adapter/mapper separation ............. PASS
  Identity boundary preserved ........... PASS
  Capability model ...................... PASS

Known gaps (documented):
  Crossref/DataCite mock/raw paths ....... GAP-01, GAP-07
  Missing formal contracts ............... GAP-02
  ORCID hardcoded fallback key ........... GAP-03
  Sandbox fallback paths ................. GAP-04
  Sinta incomplete methods ............... GAP-05
  Evidence persistence TODO .............. GAP-06

Only documentation changed.
No provider API calls. No credentials. No migration. No auth changes.
```

*Architecture Certification Artifact — IAEP Scholarly Ecosystem Integration (SEI-01).*  
*Documentation only. Next phase: SEI-02 formal provider contracts + runtime conformance.*

