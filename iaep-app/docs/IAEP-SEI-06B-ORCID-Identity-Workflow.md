# IAEP SEI-06B — ORCID Author Identity Workflow

**Document ID:** IAEP-SEI-06B-2026-08-03
**Phase:** SEI-06B ORCID Author Identity Workflow
**Date:** 2026-08-03
**Status:** 📘 DOCUMENTED (workflow definition with implementation-gap note)
**Change Policy:** Architecture Review Required
**Authority:** IAEP Architecture Review Board
**Classification:** Production-grade ORCID identity integration lifecycle for the Identity Provider category (§4.2 ORCID, SEI-05).

---

## 1. Purpose

SEI-06B formalizes the **production-grade ORCID author identity integration** for IAEP's **Identity Provider** (SEI-05 category 2). It defines how an IAEP author links their ORCID iD, how OAuth is verified, how identity evidence is persisted, how publications are associated, and how the ORCID record is synchronized — **without ever letting ORCID become the identity authority.**

The workflow is built on existing, certified components:

| Requirement | Used Component |
|-------------|----------------|
| ORCID identity contract | `IOrcidIdentityProvider` (`src/providers/orcid/IOrcidIdentityProvider.ts`) |
| ORCID provider implementation | `ORCIDProvider` (`src/providers/orcid/ORCIDProvider.ts`) |
| All external API calls | `ProviderRuntimeManager` (`src/providers/core/ProviderRuntimeManager.ts`) |
| ORCID work mapping | `ORCIDMapper.mapToORCIDWork` |
| Identity evidence adaptation | `ORCIDAdapter` (`adaptAuthToIdentitySnapshot`, `adaptWorkPushToPublicationSnapshot`) |
| Evidence persistence | `ExternalEvidenceStore` (`src/domain/external-evidence/ExternalEvidenceStore.ts`) |
| Orchestration | `ORCIDIdentityService` (`src/services/identity-federation/ORCIDIdentityService.ts`) |

**Non-negotiable constraints:** No authentication changes. No IdentityResolver changes. No RBAC changes. No `src/proxy.ts` changes. No mock providers.

---

## 2. Identity Authority Rules

### 2.1 IAEP Remains Identity Authority

- IAEP's **Identity Shared Kernel** (FROZEN) is the sole authority for who a user is, their role, and their session.
- ORCID supplies an **external scholarly identifier** and OAuth attestation — it never authenticates an IAEP session, grants a role, or issues an IAEP credential.

### 2.2 ORCID Cannot

| Prohibited Action | Rationale |
|-------------------|-----------|
| **Create IAEP users** | ORCID OAuth handshake can never auto-register an IAEP account |
| **Replace IAEP identity** | ORCID iD is a linked external identifier, not a substitute for the IAEP principal |
| **Bypass Identity Core** | All provider-triggered identity operations resolve through the existing IAEP identity layer, never a new auth path |

### 2.3 Enforcement

- ORCID operations are invoked **only** against an already-authorized IAEP identity (`apasificIdentityId`).
- The OAuth exchange produces an **identity evidence snapshot** (+ encrypted tokens), stored as external evidence — never used as a session credential.
- Duplicate-link protection prevents an ORCID iD from being hijacked across researcher profiles (Rule 3.3, `ORCIDIdentityService.connectIdentity`).

---

## 3. ORCID Author Identity Lifecycle

```
Author Registration
        ↓
ORCID Identity Linking
        ↓
OAuth Verification
        ↓
Author Identity Evidence
        ↓
Publication Association
        ↓
ORCID Record Synchronization
```

### 3.1 Stage Ownership

| Stage | Owner | Enforced By |
|-------|-------|-------------|
| **Author Registration** | ASIA / Identity Core | Author already has an IAEP identity (RBAC-guarded) |
| **ORCID Identity Linking** | SEI (ORCID adapter) | `ORCIDProvider.getAuthorizationUrl` + `connectIdentity` |
| **OAuth Verification** | SEI (ORCID adapter) | `exchangeAuthorizationCode` via `ProviderRuntimeManager` |
| **Author Identity Evidence** | SEI (`ExternalEvidenceStore`) | Identity evidence snapshot + encrypted tokens |
| **Publication Association** | Publication Core + SEI | Author's ORCID iD attached to accepted publications |
| **ORCID Record Synchronization** | SEI (ORCID adapter) | `pushWorkToProfile` via `ProviderRuntimeManager` |

---

## 4. OAuth Lifecycle

### 4.1 Flow

```
IAEP Author (authenticated)
        ↓
GET /authorize (state = anti-CSRF token)
        ↓  ORCID redirects to apasific.org/api/auth/orcid/callback
Exchange authorization code (POST /oauth/token)
        ↓
ORCID returns access_token + refresh_token + orcid iD
        ↓
validateIdentity (verifyIdentity) → IOrcidProfile
        ↓
Persist identity evidence + encrypted tokens
```

### 4.2 Implementation (ORCIDProvider)

- **`getAuthorizationUrl(state)`** — builds the ORCID OAuth authorize URL with scope `/authenticate`.
- **`exchangeAuthorizationCode(code)`** — posts to `/oauth/token` via `ProviderRuntimeManager` (timeout 15s, retry 2); returns `IOrcidProfile` (`orcidId`, `creditName`, `verified`) plus exchange tokens.
- **`verifyIdentity(orcidId)`** — reads the ORCID person record via `ProviderRuntimeManager`; returns verified profile fields.
- **`authorizeIdentity(authCode)`** — backward-compatible wrapper; constructs the payload, returns `{ data, hash }`. **Fail-closed:** on any exchange failure it throws (no mock/fabricated token).

### 4.3 OAuth Scope

- Scope `/authenticate` — basic authentication scope for **ID verification** only.
- No privileged scopes granted by default; work push requires an access token with the appropriate write scope when invoking `pushWorkToProfile`.

### 4.4 Anti-CSRF / State

- Authorization requests carry a `state` parameter (anti-CSRF). The callback must validate the state token before exchanging the code.

---

## 5. Identity Mapping

### 5.1 Mapping Chain

```
IAEP Identity (authoritative)
        ↓
Author Identity (researcher profile / apasificIdentityId)
        ↓
External Identity (ORCID iD)
```

### 5.2 Mapping Rules

1. **IAEP identity is the anchor.** The ORCID iD is linked to an existing `apasificIdentityId`; it never creates a new one.
2. **Link is biocuration, not identity provision.** `IdentityRepository.linkResearcherIdentifier` records the ORCID link as `VERIFIED` / `USER_CONNECTED` with encrypted credentials and a payload hash.
3. **Duplicate protection (Rule 3.3).** `connectIdentity` checks for an existing ORCID link to a *different* researcher profile and throws if found.
4. **Evidence over explicit trust.** The OAuth exchange is captured as an `ExternalEvidenceSnapshot` (IDENTITY evidence type) with provider, external ID, payload, and SHA-256 hash — for audit, never as a session credential.

---

## 6. Evidence Persistence

### 6.1 Identity Evidence (connectIdentity)

`ORCIDIdentityService.connectIdentity` performs:

1. Exchange code → `{ data, hash }` via `authorizeIdentity`.
2. Duplicate protection check.
3. Adapt to identity snapshot via `ORCIDAdapter.adaptAuthToIdentitySnapshot`.
4. Encrypt access + refresh tokens (`ORCIDProvider.encryptToken`, AES-256-CBC, env-only `ENCRYPTION_KEY`).
5. Persist via `IdentityRepository.linkResearcherIdentifier` (identity metadata + encrypted credential + payload hash).
6. Emit audit event (`[AUDIT] ResearcherIdentityLinked`).

### 6.2 Publication Evidence (pushVerifiedWork)

`ORCIDIdentityService.pushVerifiedWork` maps the internal publication to an ORCID Work, pushes via `pushWorkToProfile`, and adapts the response to a publication snapshot.

### 6.3 Expected Persistence via ExternalEvidenceStore

Per the requirement to use `ExternalEvidenceStore`, both identity and publication evidence should be persisted through it:

| Snapshot | Table | Method |
|----------|-------|--------|
| Identity evidence | `external_publication_records` (IDENTITY) + `external_evidence_payloads` | `persistExternalRecord` |
| Publication/work evidence | `external_publication_records` (PUBLICATION) + `external_evidence_payloads` | `persistExternalRecord` |

> **Implementation gap (documented):** `connectIdentity` currently persists identity evidence via `IdentityRepository.linkResearcherIdentifier` (its own validated path), and `pushVerifiedWork` currently creates a publication snapshot but **only logs it** — it does not yet call `ExternalEvidenceStore.persistExternalRecord`. This is a gap relative to the requirement to use `ExternalEvidenceStore` for work-push persistence. See §10.

---

## 7. Security Model

### 7.1 Credential Isolation

- ORCID tokens are **encrypted at rest** (AES-256-CBC) before storage.
- Encryption key is **env-only** (`ENCRYPTION_KEY`). `ORCIDProvider.getEncryptionKey()` throws when absent — no hardcoded fallback key (FIND-04 resolved).
- `ORCID_CLIENT_ID` / `ORCID_CLIENT_SECRET` read from environment; no hardcoded secrets.

### 7.2 Authentication Policy

- All ORCID API calls via `ProviderRuntimeManager` (bearer token for work push; client credentials for token exchange).
- Production vs sandbox via `ORCID_ENVIRONMENT` (`https://orcid.org` vs `https://sandbox.orcid.org`), controlled by env config (FIND-05 resolved).

### 7.3 Access Control

- ORCID linking is only available to an authenticated, authorized IAEP author.
- ORCID operations never reachable anonymously; RBAC-guarded.
- Duplicate-link protection prevents identifier hijacking.

### 7.4 Audit Logging

- Every exchange/connect/push emits structured audit events.
- `ProviderRuntimeManager` logs provider lifecycle events with trace IDs and latency.
- Identity evidence snapshots + payload hashes are persisted for audit.

---

## 8. Failure Handling

| Failure | Behavior |
|---------|----------|
| Missing ORCID credentials | `ProviderRuntimeManager` request fails; `authorizeIdentity` throws (fail-closed) |
| OAuth code exchange failure | `authorizeIdentity` throws — no mock/fabricated token |
| ORCID iD not returned | `connectIdentity` throws |
| ORCID iD already linked to another researcher | `connectIdentity` throws (duplicate protection) |
| Missing `ENCRYPTION_KEY` | `ORCIDProvider.encryptToken`/`decryptToken` throw (fail-closed) |
| Work push missing access token | `pushWorkToProfile` throws |
| Work push provider error | `ProviderRuntimeManager` retries then throws; `pushVerifiedWork` returns false / propagates |

**No mock paths, no fallback tokens, no fabricated put-codes, no hardcoded credentials.**

---

## 9. Validation & Scope Confirmation

### 9.1 Scope Confirmation

| Requirement | Status |
|-------------|--------|
| Uses existing `IOrcidIdentityProvider` | ✅ CONFIRMED |
| Uses existing `ORCIDProvider` | ✅ CONFIRMED |
| Uses `ProviderRuntimeManager` | ✅ CONFIRMED |
| Uses `ExternalEvidenceStore` | ⚠️ PARTIAL — see §10 gap |
| IAEP remains identity authority | ✅ CONFIRMED |
| ORCID cannot create/replace/bypass IAEP identity | ✅ CONFIRMED |

### 9.2 Protected Boundaries

| Component | Status |
|-----------|--------|
| Authentication | ✅ UNTOUCHED (FROZEN) |
| `IdentityResolver` | ✅ UNTOUCHED |
| RBAC | ✅ UNTOUCHED |
| `src/proxy.ts` | ✅ UNTOUCHED |

---

## 10. Implementation Gap (documented, not fixed)

**Gap:** `ORCIDIdentityService.pushVerifiedWork` builds a publication evidence snapshot (`ORCIDAdapter.adaptWorkPushToPublicationSnapshot`) but does **not** persist it via `ExternalEvidenceStore` — it only writes to the console. This diverges from the requirement to use `ExternalEvidenceStore` for work-push evidence.

**Impact:** Work-push evidence is not durably auditable through the shared evidence store.

**Recommended fix (future implementation, not executed here):** In `pushVerifiedWork`, after adapting the snapshot, call `await this.evidenceStore.persistExternalRecord(snapshot)` (mirroring the pattern used in `CrossrefFederationService.publishArticleDOI` and `DataCiteFederationService.registerArtifact`).

> This document is documentation-only. The gap is recorded for a follow-up implementation phase; no source code was changed in SEI-06B.

---

## 11. Closure Statement

```
SEI-06B ORCID AUTHOR IDENTITY WORKFLOW
Status: DOCUMENTED (workflow defined against implemented pipeline)

Lifecycle:  Author Registration → ORCID Identity Linking → OAuth
            Verification → Author Identity Evidence → Publication
            Association → ORCID Record Synchronization
Pipeline:   ORCIDIdentityService (connectIdentity / pushVerifiedWork)
Gateway:    ProviderRuntimeManager (timeout/retry/trace)
Contract:   IOrcidIdentityProvider (exchangeAuthorizationCode / verifyIdentity)
Persistence:IdentityRepository + ExternalEvidenceStore (PARTIAL — see §10)
Security:   AES-256-CBC token encryption, env-only ENCRYPTION_KEY,
            credential isolation, audit logging
Rules:      IAEP remains identity authority; ORCID cannot create,
            replace, or bypass IAEP identity
Gap:        pushVerifiedWork evidence not yet persisted via
            ExternalEvidenceStore (documented for follow-up)
Boundaries: Auth FROZEN, IdentityResolver/RBAC/proxy.ts untouched
```

*Architecture Workflow Artifact — IAEP SEI-06B ORCID Identity Lifecycle.*  
*ORCID remains an Identity Provider only — never the identity authority.*
