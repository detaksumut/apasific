# IAEP Scholarly Ecosystem Integration — Architecture

**Document ID:** IAEP-SEI-2026-08-03
**Phase:** SEI-00 Architecture Definition
**Date:** 2026-08-03
**Status:** 🟦 DOCUMENTED
**Change Policy:** Architecture Review Required
**Authority:** IAEP Architecture Review Board
**Classification:** Documentation Only — No code, database, or API changes.

---

## 1. Purpose and Scope

### 1.1 Why Scholarly Ecosystem Integration Exists

IAEP operates an editorial and publication system whose certified foundation is the **Identity Shared Kernel** (FROZEN), the **RBAC Boundary** (CERTIFIED), and the **Proxy / Edge Boundary** (CERTIFIED). Publication artifacts are already produced, surfaced, and indexed, but external scholarly connectivity has been **manual and ad hoc** — DOI deposit was performed manually, article metadata was not driven through a governed provider boundary, and scholarly identity (ORCID) had no formal synchronization contract.

**Scholarly Ecosystem Integration (SEI)** exists to make the IAEP publication system interoperate with the external scholarly ecosystem through a **governed, contract-driven provider layer**:

- Automate DOI registration and metadata deposit.
- Synchronize researcher identity with external scholarly identity systems (ORCID).
- Enable repository publication and indexing (Zenodo, OpenAIRE, Google Scholar).
- Provide citation discovery and citation intelligence (OpenAlex, Crossref).
- Support journal submission workflows (MDPI).
- Guarantee that no external provider ever bypasses IAEP identity, authorization, or observability.

### 1.2 Role Inside IAEP

SEI is the **interoperability boundary** between the Publication Core and the external scholarly world. It does not implement business logic itself; it **orchestrates provider capabilities** through standardized adapters and feeds results back into the Publication Core as **evidence snapshots**.

Position within IAEP:

```
IAEP Identity Shared Kernel (FROZEN)
        |
        |
Publication Core
        |
        |
Scholarly Ecosystem Integration Layer   ← THIS DOCUMENT
        |
        |
External Scholarly Providers
```

### 1.3 Relationship with the Publication System

The Publication System owns the authoritative domain state (submissions, peer review, acceptance, metadata, published articles). SEI is a **supporting layer**: it consumes publication events and metadata, translates them into provider calls, and returns verified external evidence (DOI, record IDs, index status, citation counts).

**Ownership rule:** The Publication Core decides *what* is published. SEI decides *how* and *where* external scholarly records are deposited, verified, and synchronized. External provider logic must never enter the Publication Core.

---

## 2. Bounded Context Architecture

```
Publication Core
        |
        ↓
Scholarly Ecosystem Integration Layer
        |
        ↓
External Scholarly Providers
```

### 2.1 Publication Core (Upstream)

- **Domain owner:** submissions, peer review, editorial decisions, accepted metadata, published article state, certificates.
- **Exposed contract:** publication events + validated metadata (title, authors, abstract, ORCID IDs, affiliation, volume/issue, PDF).
- **Does not know** provider specifics, API endpoint vocabularies, or external record formats.
- Reflects existing domain artifacts: `submissions`, `submission_history`, `certificates`, `external_publication_records`, `external_evidence_payloads`, and `submissions.index_status`.

### 2.2 Scholarly Ecosystem Integration Layer (This Context)

- **Domain owner:** provider capability orchestration, adapter translation, evidence capture, index verification, identity synchronization, citation intelligence.
- **Owns** the provider runtime, contracts, adapters, mappers, capability registry, and provider configuration.
- Composes existing services:
  - `PublicationDepositService` — orchestrates Zenodo deposit, DOI verification, and index status refresh.
  - `CrossrefFederationService`, `DataCiteFederationService` — DOI/metadata federation.
  - `OpenAIREDiscoveryService` — research-graph discovery and harvesting.
  - `OpenAlexIntelligenceService` — citation discovery and impact signals.
  - Provider identity sync (ORCID) via `ORCIDProvider`/`ORCIDAdapter`.
- **Does not** define who may publish or whether an article is accepted — that remains in Publication Core.

### 2.3 External Scholarly Providers (Downstream)

- Outside IAEP trust boundary.
- Each provider is reached **only** through its dedicated adapter, and **only** through `ProviderRuntimeManager`.
- Providers:
  - **Crossref** — DOI registration, DOI metadata, citation discovery.
  - **ORCID** — researcher identity registration/synchronization.
  - **Zenodo** — repository deposit, DOI assignment, record publication.
  - **OpenAIRE** — research graph discovery, indexing verification, harvesting.
  - **OpenAlex** — citation discovery, author/institution intelligence.
  - **MDPI** — journal submission workflow (planned).

### 2.4 Ownership Boundaries Summary

| Capability | Owner | Notes |
|------------|-------|-------|
| Editorial decision & acceptance | Publication Core | No provider influence |
| Validated publication metadata | Publication Core | Single authoritative source |
| Provider capability selection | SEI Layer | Capability registry |
| API credential handling | SEI Layer | Secret isolation per provider |
| External record/deposit state | SEI Layer | Evidence snapshots + payload hashes |
| External identity mapping | SEI Layer | Never creates IAEP users |
| Index status / citation signals | SEI Layer | Consumed by Publication Core |

---

## 3. Architecture Principles

### 3.1 Provider Isolation

Each external provider API lives behind its own boundary:

```
src/providers/<provider>/
  <Provider>Provider.ts     (API communication)
  <Provider>Adapter.ts      (external → internal adaptation)
  <Provider>Mapper.ts       (internal → external mapping)
  <Provider>Capability.ts   (declared capabilities)
  I<Provider>*.ts           (typed interfaces)
```

- No direct provider API calls from frontends, routes, or database triggers.
- All calls pass through `ProviderRuntimeManager`.

### 3.2 Contract Driven Architecture

- All providers implement shared contracts for their capability type (deposit, verify, sync, discover, cite).
- Contract examples already present:
  - `ICitationProvider` (`fetchCitationCount(doi)`)
  - `IZenodoDepositProvider` (deposit interface)
  - `IOrcidIdentityProvider` (identity interface)
  - `SintaProviderContract`
- Contracts are the **only** dependency Publication Core-facing services hold.

### 3.3 No Identity Bypass

- All provider operations authenticate through the frozen Identity layer.
- Providers **cannot** create IAEP users, sessions, or roles.
- IAEP remains the identity authority (see §7).

### 3.4 Observability by Default

- Every provider call goes through `ProviderRuntimeManager` with:
  - Request correlation (`X-Trace-Id`), timeout, retry policy.
  - Structured logging: `PROVIDER_REQUEST_INITIATED`, `PROVIDER_REQUEST_RETRY`, `PROVIDER_REQUEST_SUCCESS`, `PROVIDER_REQUEST_FAILED`.
  - Latency capture per attempt.
  - Payload hashing for tamper-evident evidence.

### 3.5 Auditability

- Every provider interaction produces a durable, verifiable evidence trail:
  - `external_publication_records` — lightweight snapshot per provider/publication.
  - `external_evidence_payloads` — immutable raw payload + SHA-256 hash.
  - Publication federation events emitted with timestamp, publication ID, external record ID.
- No external mutation occurs without a corresponding audit record.

### 3.6 Governance Artifact per Provider

- Each provider requires:
  1. ADR recording the decision.
  2. Contract + capability registration.
  3. Certification evidence before promotion to production.
- No adapter may be promoted without an entry in the provider registry.

---

## 4. Provider Capability Model

A **capability** is the smallest contract-level unit of provider functionality. Providers declare supported capabilities via capability enums (already present: `ZenodoCapability`, `CrossrefCapability`, `OpenAIRECapability`, `OpenAlexCapability`, `SintaCapability`).

### 4.1 Canonical Capability Set

| Capability | Description | Representative Providers |
|------------|-------------|--------------------------|
| **DOI Registration** | Register, update, and verify DOIs for IAEP publications | Crossref, Zenodo, DataCite |
| **Metadata Deposit** | Deposit validated article metadata to external repositories | Crossref, Zenodo, DataCite, OpenAIRE |
| **Researcher Identity Synchronization** | Link/verify IAEP author identity against external scholarly identity | ORCID, Sinta |
| **Repository Publication** | Create, upload, and publish repository records (with file artifacts) | Zenodo |
| **Citation Discovery** | Discover citation counts and cited-by evidence | OpenAlex, Crossref, OpenAIRE |
| **Indexing Synchronization** | Verify and refresh external indexing/discovery status | OpenAIRE, Zenodo, Google Scholar |
| **Journal Submission Workflow** | Submit manuscripts/abstracts to external journals | MDPI (planned) |

### 4.2 Capability-to-Code Mapping

| Capability Enum | Provider | Values |
|-----------------|----------|--------|
| `ZenodoCapability` | Zenodo | `CREATE_DEPOSIT`, `UPLOAD_FILE`, `PUBLISH_RECORD`, `FETCH_METADATA`, `VERIFY_DOI` |
| `CrossrefCapability` | Crossref | `REGISTER_PUBLISHER_DOI`, `UPDATE_METADATA`, `FETCH_METADATA` |
| `OpenAIRECapability` | OpenAIRE | `SEARCH_RESEARCH_GRAPH`, `HARVEST_METADATA`, `VERIFY_PUBLICATION`, `FETCH_RELATIONS` |
| `OpenAlexCapability` | OpenAlex | `FETCH_WORK`, `FETCH_AUTHOR`, `FETCH_INSTITUTION`, `FETCH_CITATIONS` |
| `SintaCapability` | Sinta | `IDENTITY_LOOKUP`, `PROFILE_VERIFICATION`, `PUBLICATION_SYNC`, `INSTITUTION_AFFILIATION`, `IMPACT_SIGNAL_SYNC` |

### 4.3 Capability Registry Rules

- Capabilities are **declared**, never assumed; a provider must report its capability set.
- Orchestration routes a request only to providers that declare the required capability.
- A provider without a required capability is skipped, not bypassed.

---

## 5. External Provider Registry Model

### 5.1 Conceptual Entity: `scholarly_providers`

```
scholarly_providers
  ├─ provider_id           (stable internal identifier, e.g., 'zenodo', 'crossref')
  ├─ provider_name         (display name, e.g., 'Zenodo')
  ├─ provider_type         (depository | registry | discovery | citation | submission)
  ├─ capabilities          (reference to capability model, e.g., ['CREATE_DEPOSIT','VERIFY_DOI'])
  ├─ authentication_method (bearer_token | oauth2 | api_key | public | none)
  ├─ endpoint_policy       (allowed endpoints, base URLs, sandbox/production policy)
  ├─ status                (planned | contract_certified | adapter_certified | security_reviewed | production_ready)
  └─ audit_policy          (retention, hashing, evidence requirements)
```

### 5.2 Initial Provider Set

| provider_id | provider_name | provider_type | Capabilities (initial) | authentication_method | status |
|-------------|---------------|---------------|------------------------|------------------------|--------|
| `crossref` | Crossref | registry | DOI Registration, Metadata Deposit, Citation Discovery | `api_key` | PLANNED |
| `orcid` | ORCID | registry | Researcher Identity Synchronization | `oauth2` | PLANNED |
| `zenodo` | Zenodo | depository | DOI Registration, Metadata Deposit, Repository Publication, Indexing Synchronization | `bearer_token` | ADAPTER CERTIFIED |
| `openaire` | OpenAIRE | discovery | Indexing Synchronization, Citation Discovery | `public` | ADAPTER CERTIFIED |
| `openalex` | OpenAlex | discovery | Citation Discovery | `public` | ADAPTER CERTIFIED |
| `mdpi` | MDPI | submission | Journal Submission Workflow | `to_be_defined` | PLANNED |

> Status values align with the §10 certification lifecycle. Adapter-level certification for Zenodo/OpenAIRE/OpenAlex reflects existing implemented `src/providers/*` adapters and the Publication Visibility Certificate; **Production Ready** is earned only after security review and registry sign-off.

---

## 6. Provider Adapter Architecture

```
Publication Core
        |
Provider Contract
        |
Provider Adapter
        |
External Provider API
```

### 6.1 Layering

1. **Publication Core** consumes only contract interfaces and orchestration services.
2. **Provider Contract** — shared typed interface a provider must satisfy (`ICitationProvider`, `IZenodoDepositProvider`, `IOrcidIdentityProvider`, `SintaProviderContract`).
3. **Provider Adapter** — translates external provider responses into internal `ExternalEvidenceSnapshot` objects and maps internal metadata into provider formats.
   - Patterns present: `ZenodoAdapter.adaptResponseToSnapshot`, `ORCIDAdapter.adaptAuthToIdentitySnapshot`, `ORCIDAdapter.adaptWorkPushToPublicationSnapshot`.
4. **Provider Mapper** — maps validated IAEP article metadata to provider-specific metadata payloads (e.g., `ApasificPublicationMetadata → ZenodoMetadata` via `ZenodoMapper`).
5. **External Provider API** — reached exclusively through `ProviderRuntimeManager`.

### 6.2 Runtime Enforcement (`ProviderRuntimeManager`)

`ProviderRuntimeManager` is the single gateway for ALL external academic API calls:

- Central timeout (default 15s, per-call override) and retry policy (default 3 attempts, exponential delay, retry on 408/429/5xx/abort).
- `X-Trace-Id` correlation per request.
- Structured logging for init/retry/success/failure with latency.
- SHA-256 payload hashing (`generatePayloadHash`) for evidence integrity.
- Domain logic is **not allowed** to bypass this manager to reach external providers.

### 6.3 Orchestration (`PublicationDepositService`)

`PublicationDepositService` composes provider capabilities into a governed workflow:

```
createDeposit → uploadFile → publishRecord → adaptResponseToSnapshot
        → verify DOI → storeEvidence (external_publication_records + external_evidence_payloads)
        → verifyAndRefreshIndexStatus (ZenodoVerificationService + OpenAIREVerificationService)
```

- Provider calls emit typed federation events (`PublicationFederationEventType`) — the subscriber/integration point for OpenAIRE/OpenAlex intelligence.
- DB writes happen **only** in the orchestration service after provider success, never inside providers.

### 6.4 Isolation Rule

**External provider logic must never enter Publication Core.** Adapters and mappers may know provider vocabularies; core domain code must not. This is enforced by:
- Contract boundaries (core references interfaces, not concrete providers).
- Runtime gateway (all HTTP goes through `ProviderRuntimeManager`).
- Evidence-only hand-back (providers return snapshots + hashes, never mutate domain state directly).

---

## 7. Identity Mapping Rules

```
IAEP Identity
        |
Author Identity
        |
External Identity (ORCID)
```

### 7.1 Mappings

- **IAEP Identity** — the authoritative account in the Identity Shared Kernel (frozen). Source of truth for who a user is and their role.
- **Author Identity** — the domain identity of a contributor on an article (name, affiliation, ORCID link, email) as recorded in the Publication Core.
- **External Identity (ORCID)** — the external scholarly identifier used for synchronization, verification, and scholarly attestation.

### 7.2 Rules

1. **IAEP remains identity authority.** External providers supply identifiers and attestations; they never create, authenticate, or authorize IAEP accounts.
2. **External providers cannot create user identity.** An ORCID handshake cannot register a new IAEP user, grant a role, or issue a session.
3. **No Identity bypass.** All provider-triggered operations authenticate through `getCurrentUser()` → `IdentityResolver`. No alternative auth mechanism, cookie, or fallback may be introduced for provider contexts.
4. **Link is biocuration, not identity provision.** Author ↔ ORCID linkage is reconciled against already-authorized IAEP identities.
5. **Evidence over explicit trust.** ORCID/OAuth responses are captured via `ORCIDAdapter.adaptAuthToIdentitySnapshot` as identity evidence snapshots (provider, external ID, payload, payload hash, verifiedAt) — stored for audit, never used as a session credential.

### 7.3 Prohibited Actions

- ORCID (or any provider) returning a user that auto-creates an IAEP user.
- Provider calls that mutate IAEP roles/permissions.
- Circumventing IdentityResolver to resolve a provider identity as an IAEP principal.
- Any new auth fallback motivated by provider integration (falls under the FROZEN Authentication Boundary).

---

## 8. Article Lifecycle Integration

### 8.1 Lifecycle Pipeline

```
Article Submission
        ↓
Peer Review
        ↓
Acceptance
        ↓
Metadata Validation
        ↓
DOI Registration
        ↓
Repository Deposit
        ↓
Indexing
        ↓
Citation Intelligence
```

### 8.2 Stage Responsibilities

| Stage | Owner | SEI Involvement |
|-------|-------|-----------------|
| **Article Submission** | Publication Core | None (collection only) |
| **Peer Review** | Publication Core | None |
| **Acceptance** | Publication Core | Emits acceptance event with validated metadata |
| **Metadata Validation** | Publication Core / SEI | Validate metadata completeness (authors, ORCID, affiliation, abstract, PDF) before any external call |
| **DOI Registration** | SEI | Crossref/Zenodo DOI registration via adapters; DOI persisted back to Publication Core |
| **Repository Deposit** | SEI | `PublicationDepositService` create/upload/publish to Zenodo; evidence stored |
| **Indexing** | SEI | `verifyAndRefreshIndexStatus` (Zenodo + OpenAIRE verifiers); `submissions.index_status` updated |
| **Citation Intelligence** | SEI | OpenAlex/Crossref citation discovery; impact signals surfaced to Publication Core |

### 8.3 Current Standing (Phase 1 Foundation)

From existing certification evidence:

- **Zenodo Deposit** — flow implemented and verified (`depositToZenodo` pipeline, DOI resolution PASS).
- **OpenAIRE Discovery** — search endpoint verification PASS.
- **Google Scholar** — Dublin Core + JSON-LD metadata, sitemap, robots policy PASS.
- **Crossref DOI Automation** — NEXT.
- **ORCID Sync** — NEXT (credentials pending).
- **MDPI Submission Workflow** — NEXT.

---

## 9. Security Architecture

### 9.1 Credential Isolation

- Each provider owns its own secret; no shared service credential for external scholarly APIs.
- Provider credentials are consumed only inside the corresponding adapter/provider and never exported.
- No hardcoded tokens. All secrets from environment variables with fail-safe deny when absent (mirrors SEC-03 remediation pattern).

### 9.2 Secret Management

- Secrets referenced by name only in code (e.g., `process.env.ZENODO_API_TOKEN`, `process.env.ORCID_CLIENT_ID/SECRET`, `process.env.CROSSREF_API_KEY`).
- Distinguish `*_ENVIRONMENT` (sandbox vs production) boundaries per provider (e.g., `ZENODO_ENVIRONMENT`).
- Production secrets held in the platform secret store; developer environments use sandbox credentials.

### 9.3 API Authentication Policy

- **Zenodo** — bearer token via `Authorization: Bearer <token>`.
- **ORCID** — OAuth 2.0 (member API); public API may be anonymous with rate limits.
- **Crossref** — API key for deposition; metadata/citation endpoints may be public read.
- **OpenAIRE / OpenAlex** — public read with polite-pool rate limiting and proper `mailto`/contact identity.
- **MDPI** — credentials/policy TBD at contract certification.
- All requests carry `X-Trace-Id` and are subject to retry/timeout policy in `ProviderRuntimeManager`.

### 9.4 Audit Logging

- Every provider request logged with event type, provider, endpoint, attempt, latency, status (init/retry/success/failure).
- Evidence snapshots and raw payload hashes persisted (`external_publication_records`, `external_evidence_payloads`).
- Federation events emitted for deposit created, file uploaded, DOI assigned, etc., with immutable timestamps.

### 9.5 Provider Access Control

- Provider operations are triggered only by authorized Publication Core contexts (RBAC-guarded actions).
- No provider route or API endpoint may be reachable anonymously.
- Registry status gates: an adapter not `SECURITY REVIEWED` cannot be invoked from production workflows.
- Administrative provider management (credentials, endpoints, status) restricted to authorized operators.

---

## 10. Provider Certification Lifecycle

### 10.1 Lifecycle States

```
PLANNED
   ↓
CONTRACT CERTIFIED
   ↓
ADAPTER CERTIFIED
   ↓
SECURITY REVIEWED
   ↓
PRODUCTION READY
```

### 10.2 State Definitions

| State | Meaning | Exit Criteria |
|-------|---------|---------------|
| **PLANNED** | Provider identified; capabilities and integration scope defined; no adapter. | ADR approved; contract signed |
| **CONTRACT CERTIFIED** | Provider contract + capability registration verified; interface conformance tests pass. | Contract tests green |
| **ADAPTER CERTIFIED** | Adapter/mapper implemented behind `ProviderRuntimeManager`; evidence snapshots verified. | Adapter conformance + build PASS |
| **SECURITY REVIEWED** | Credential isolation, secret handling, rate/retry policy, audit logging, access control reviewed. | Security review sign-off |
| **PRODUCTION READY** | Provider enabled in production registry; supported by live verification evidence. | Registry update + Review Board sign-off |

### 10.3 Current Provider Lifecycle Standing

| Provider | Lifecycle State | Evidence |
|----------|-----------------|----------|
| Zenodo | ADAPTER CERTIFIED | `docs/audit/ASIA-Publication-Zenodo-Flow-Audit-Report.md`, Publication Visibility Certificate v1.0 |
| OpenAIRE | ADAPTER CERTIFIED | OpenAIRE discovery verification PASS |
| OpenAlex | ADAPTER CERTIFIED | OpenAlex intelligence service implemented |
| Crossref | PLANNED → CONTRACT (pending) | `CrossrefProvider`/adapter present; production certification pending |
| ORCID | PLANNED → CONTRACT (pending) | `ORCIDProvider`/adapter present; credentials pending |
| MDPI | PLANNED | No adapter; submission workflow next |

> Security review and production-ready status for each provider will be recorded in the registry when achieved. This architecture document certifies the **design and boundaries**, not production readiness of un-certified adapters.

---

## 11. Validation & Completion

### 11.1 Scope Confirmation

| Requirement | Status |
|-------------|--------|
| Documentation only | ✅ CONFIRMED |
| No application code changes | ✅ CONFIRMED |
| No database migration | ✅ CONFIRMED |
| No API implementation | ✅ CONFIRMED |
| No mock provider | ✅ CONFIRMED |

### 11.2 Protected Boundaries

| Protected Component | Status |
|---------------------|--------|
| `src/proxy.ts` | ✅ UNTOUCHED |
| Authentication system | ✅ UNTOUCHED (FROZEN) |
| Session handling | ✅ UNTOUCHED |
| `IdentityResolver` | ✅ UNTOUCHED |
| RBAC implementation | ✅ UNTOUCHED |

### 11.3 Files Changed in This Phase

| File | Action |
|------|--------|
| `docs/IAEP-Scholarly-Ecosystem-Integration-Architecture.md` | CREATED (this document) |
| `docs/IAEP-Architecture-Certification-Registry.md` | UPDATED (registry entries only) |

### 11.4 Registry Update

```
Scholarly Ecosystem Integration:
  Status: 🟦 DOCUMENTED

Publication Provider Layer:
  Status: 🟦 PLANNED
```

### 11.5 Explicitly Out of Scope (Later Phases)

- Crossref DOI automation implementation.
- ORCID OAuth credential provisioning and live sync.
- MDPI submission adapter.
- OpenAIRE harvesting automation.
- Publication Intelligence Layer rollout.
- Provider promotion to `PRODUCTION READY` (requires security review + Review Board sign-off).

---

## Closure Statement

```
SCHOLARLY ECOSYSTEM INTEGRATION
Phase: SEI-00 Architecture Definition
Status: DOCUMENTED
Document: docs/IAEP-Scholarly-Ecosystem-Integration-Architecture.md

Publication Provider Layer:
Status: PLANNED
Boundaries: Provider isolation enforced via ProviderRuntimeManager
Identity: No identity bypass — IAEP remains identity authority
Security: Credential isolation, secret management, audit logging defined

Only documentation changed.
Authentication boundary untouched. src/proxy.ts untouched.
IdentityResolver untouched. RBAC untouched.
```

*Architecture Certification Artifact — IAEP Scholarly Ecosystem Integration (SEI-00).*  
*Documentation only. Next phase: ADR + credential provisioning + per-provider certification.*

