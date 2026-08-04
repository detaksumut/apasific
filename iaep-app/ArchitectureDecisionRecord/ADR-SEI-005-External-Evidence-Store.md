# ADR-SEI-005: External Evidence Store

* **Status:** APPROVED
* **Version:** 1.0
* **Date:** 2026-08-03
* **Phase:** SEI-04 Provider Runtime Remediation

## Decision

Introduce a shared **`ExternalEvidenceStore`** abstraction under `src/domain/external-evidence/ExternalEvidenceStore.ts` that centralizes persistence of `ExternalEvidenceSnapshot` records for external provider interactions.

Responsibilities:
- Persist evidence snapshots (external record + immutable raw payload + SHA-256 payload hash) for each successful provider interaction.
- Provide a single, auditable write path that matches the existing schema pattern (`external_publication_records` + `external_evidence_payloads`).
- Ensure no provider writes to the database directly — only orchestration services via the evidence store.

## Context

SEI-03 FIND-06 identified that `CrossrefFederationService`, `DataCiteFederationService`, and `OpenAIREDiscoveryService` leave `TODO: persist snapshot` without persisting evidence. This breaks auditability: successful external interactions would have no durable evidence record. A shared store avoids duplicating persistence logic across three services and enforces the existing `PublicationDepositService` evidence pattern.

## Consequences

- **Positive:** One consistent evidence persistence path; auditability restored for all SEI provider interactions; no duplication.
- **Negative:** Federation services now depend on the evidence store and require a Supabase client — consistent with existing `PublicationDepositService` behavior.
- Existing `PublicationDepositService` evidence logic may later converge on the same store (out of scope for this phase to avoid regression).

## Compliance

- Evidence persists only after provider success (fail-closed: no partial evidence on error).
- Payload hashes (SHA-256) preserve immutability and tamper-evidence.
- No database writes from within provider adapters — orchestration services only.

---

*Decision recorded by IAEP Architecture Review Board — SEI-04.*

