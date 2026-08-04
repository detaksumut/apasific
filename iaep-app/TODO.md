# TODO — IAEP Scholarly Ecosystem Integration (SEI) Phases

## Current: SEI-07C RJRAKP Explainability and Audit Architecture

## Constraints
- No authentication changes. No IdentityResolver changes. No RBAC changes. No src/proxy.ts changes.
- RJRAKP never calls providers directly. Evidence repository is the only input for intelligence analysis.
- No mock evidence. No fabricated metrics.
- RJRAKP scores are analytical insights only — never decide acceptance, never override peer review, never replace SINTA/Scopus/Web of Science, never modify provider evidence.
- Documentation only.

## SEI-07C Steps

- [x] 1. Review SEI-07A RJRAKP Intelligence Architecture, SEI-07B Scoring & Metrics Governance, and SEI-06G evidence foundation.
- [x] 2. Create `docs/IAEP-SEI-07C-RJRAKP-Explainability-Audit-Architecture.md` defining:
      - Explainability framework (ExplainabilityEnvelope; no output without envelope, evidence, and audit record)
      - Score factor decomposition model (Score = Σ weight × normalizedValue × confidence; AQS/RIS/AIS/IRS factor schemas bound to SEI-07B v1.0 weights)
      - Evidence attribution model (EvidenceReference binding to SEI-06G snapshots; hash mismatch invalidates; attribution never anonymized)
      - Confidence model (VERIFIED_HIGH..HASH_MISMATCH levels; corroboration, conflict, recency decay; disclosure)
      - Audit trail architecture (immutable append-only AuditRecord; single write path; reproducibility guarantee)
      - Bias audit architecture (detection signals; remediation workflow; prohibited-behavior detection)
      - Ranking governance workflow (trigger → candidate → diff → classify → review → publish/deny; read-only change log)
      - RJRAKP runtime boundary contract (RJRAKPEvidenceReader as only input port; scoring/ranking/audit service contracts; known conformance gap recorded)
      - Future AI intelligence readiness (SEI-07A §10.3 entry criteria; readiness gates)
      - Input source: ExternalEvidenceRepository only; no direct provider access
      - Rules: scores are analytical insights only; cannot decide acceptance, override peer review, replace SINTA/Scopus/Web of Science, or modify provider evidence
- [x] 3. Update `docs/IAEP-Architecture-Certification-Registry.md`:
      - Added `SEI-07C RJRAKP Explainability & Audit Architecture` v1.0 → 📘 DOCUMENTED (table + entries detail #20)
- [x] 4. Update `TODO.md`.
- [x] 5. Validate: documentation-only changes; protected boundaries untouched (src/proxy.ts, auth, IdentityResolver, RBAC).

## Prior Completed: SEI-07B RJRAKP Scoring and Metrics Governance
- [x] SEI-07B documented (AQS/RIS/AIS/IRS models, weights, versioning, explainability, audit, bias prevention, ranking change governance) + registry updated.

## Prior Completed: SEI-07A RJRAKP Research Intelligence
- [x] SEI-06F documented (MDPI/Elsevier/Springer external publisher workflows) + registry updated.

## Prior Completed: SEI-06E SINTA National Evaluation Workflow
- [x] SEI-06E documented (SINTA evaluation signals) + registry updated.

## Prior Completed: SEI-06D Discovery & Citation Intelligence Workflow
- [x] SEI-06D documented (OpenAIRE discovery + OpenAlex citation) + registry updated.

## Prior Completed: SEI-06C Zenodo Repository Deposit Workflow
- [x] SEI-06C documented (Zenodo deposit lifecycle) + registry updated.

## Prior Completed: SEI-06B ORCID Author Identity Workflow
- [x] SEI-06B documented (ORCID identity lifecycle) + registry updated.

## Prior Completed: SEI-06A Crossref Production DOI Workflow
- [x] SEI-06A documented (Crossref DOI lifecycle) + registry updated.

## Prior Completed: SEI-05 Provider Ecosystem Expansion
- [x] SEI-05 documented (6 provider categories) + registry updated.

## Prior Completed: SEI-04 Provider Runtime Remediation
- [x] All FIND-01..FIND-06 resolved. SEI Provider Runtime → ✅ CERTIFIED (v1.1).

## Status: ✅ SEI-07C DOCUMENTED (RJRAKP Explainability & Audit Architecture)
