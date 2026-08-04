# IAEP Architecture Certification Registry

**Purpose:** Single source of truth for the architecture certification status of every IAEP subsystem. Each subsystem has its own architecture certification artifact, mirroring the governance pattern used in Campus OS.

**Registry Version:** 1.0  
**Last Updated:** 2026-08-04  
**Authority:** Architecture Review Board

---

## Certification Registry

| Subsystem / Boundary | Version | Status | Certification Artifact | Change Policy |
|----------------------|:---:|:---:|----------------------|---------------|
| **Identity Shared Kernel** | v1.0 | ✅ CERTIFIED | `docs/IAEP-Auth-Recovery-Closure-Report.md` | Architecture Review Required |
| **Authentication Boundary** | v1.0 | ❄️ FROZEN | `docs/IAEP-Auth-Recovery-Closure-Report.md` §10 | Architecture Review Required |
| **RBAC Boundary** | v1.0 | ✅ CERTIFIED | `docs/IAEP-Auth-Recovery-Closure-Report.md` §6–7 | Architecture Review Required |
| **Proxy / Edge Boundary** | v1.0 | ✅ CERTIFIED | `docs/IAEP-Auth-Recovery-Closure-Report.md` §4 | Architecture Review Required |
| **Security Remediation** | v1.0 | ✅ COMPLETE | `docs/IAEP-Auth-Recovery-Closure-Report.md` §5 | Security Review Required |
| **Publication Provider Layer** | v0.1 | 📘 DOCUMENTED | `docs/IAEP-Scholarly-Ecosystem-Integration-Architecture.md` §5 | Architecture Review Required |
| **Scholarly Ecosystem Integration** | v1.0 | 📘 DOCUMENTED | `docs/IAEP-Scholarly-Ecosystem-Integration-Architecture.md` | Architecture Review Required |
| **SEI Provider Contracts** | v1.1 | ⚙️ CERTIFIED WITH KNOWN GAPS | `docs/IAEP-SEI-02-Provider-Contract-Hardening.md` | Architecture Review Required |
| **SEI Provider Runtime** | v1.1 | ✅ CERTIFIED | `docs/IAEP-SEI-04-Closure-Report.md` | Architecture Review Required |
| **SEI Provider Ecosystem Expansion** | v1.0 | 📘 DOCUMENTED | `docs/IAEP-SEI-05-Provider-Ecosystem-Expansion.md` | Architecture Review Required |
| **SEI-06A Crossref Production DOI Workflow** | v1.0 | 📘 DOCUMENTED | `docs/IAEP-SEI-06A-Crossref-DOI-Workflow.md` | Architecture Review Required |
| **SEI-06B ORCID Author Identity Workflow** | v1.0 | 📘 DOCUMENTED | `docs/IAEP-SEI-06B-ORCID-Identity-Workflow.md` | Architecture Review Required |
| **SEI-06C Zenodo Repository Deposit Workflow** | v1.0 | 📘 DOCUMENTED | `docs/IAEP-SEI-06C-Zenodo-Repository-Deposit-Workflow.md` | Architecture Review Required |
| **SEI-06D Discovery & Citation Intelligence Workflow** | v1.0 | 📘 DOCUMENTED | `docs/IAEP-SEI-06D-Discovery-Citation-Intelligence-Workflow.md` | Architecture Review Required |
| **SEI-06E SINTA National Evaluation Workflow** | v1.0 | 📘 DOCUMENTED | `docs/IAEP-SEI-06E-SINTA-Evaluation-Workflow.md` | Architecture Review Required |
| **SEI-06F External Publisher Workflow** | v1.0 | 📘 DOCUMENTED | `docs/IAEP-SEI-06F-External-Publisher-Workflow.md` | Architecture Review Required |
| **SEI-06G Scholarly Evidence Consolidation** | v1.0 | 📘 DOCUMENTED | `docs/IAEP-SEI-06G-Evidence-Consolidation-Architecture.md` | Architecture Review Required |
| **SEI-07A RJRAKP Research Intelligence** | v1.0 | 📘 DOCUMENTED | `docs/IAEP-SEI-07A-RJRAKP-Intelligence-Architecture.md` | Architecture Review Required |
| **SEI-07B RJRAKP Scoring & Metrics Governance** | v1.0 | 📘 DOCUMENTED | `docs/IAEP-SEI-07B-RJRAKP-Scoring-Metrics-Governance.md` | Architecture Review Required |
| **SEI-07C RJRAKP Explainability & Audit Architecture** | v1.0 | 📘 DOCUMENTED | `docs/IAEP-SEI-07C-RJRAKP-Explainability-Audit-Architecture.md` | Architecture Review Required |

---

## Entries Detail

### 1. Identity Shared Kernel
```
Version:       v1.0
Status:        Certified
Artifact:      docs/IAEP-Auth-Recovery-Closure-Report.md
Authority:     Architecture Review Required
Notes:         Identity Core is the Shared Kernel; it does not depend on
               any other bounded context. All domains depend on it.
```

### 2. Authentication Boundary
```
Version:       v1.0
Status:        Frozen
Artifact:      docs/IAEP-Auth-Recovery-Closure-Report.md §10
Authority:     Architecture Review Required
Notes:         AUTHENTICATION BOUNDARY — FROZEN. No changes without
               Architecture Review Board approval.
```

### 3. RBAC Boundary
```
Version:       v1.0
Status:        Certified
Artifact:      docs/IAEP-Auth-Recovery-Closure-Report.md §6–7
Authority:     Architecture Review Required
Notes:         Roles verified: Admin, Editor, Reviewer, Production Team.
               Role-based routing and endpoint protection enforced.
```

### 4. Proxy / Edge Boundary
```
Version:       v1.0
Status:        Certified
Artifact:      docs/IAEP-Auth-Recovery-Closure-Report.md §4
Authority:     Architecture Review Required
Notes:         Single source: src/proxy.ts. Conflicting files archived.
```

### 5. Security Remediation
```
Version:       v1.0
Status:        Complete
Artifact:      docs/IAEP-Auth-Recovery-Closure-Report.md §5
Authority:     Security Review Required
Notes:         SEC-01 → SEC-07 resolved. Hardcoded credentials removed.
               Plaintext passwords migrated to scrypt (56 + 106 users).
```

### 6. Publication Provider Layer
```
Version:       v0.1
Status:        Documented
Artifact:      docs/IAEP-Scholarly-Ecosystem-Integration-Architecture.md §5
Authority:     Architecture Review Required
Notes:         Foundation exists (Zenodo, OpenAIRE, OpenAlex). Provider
               registry model defined. Contract layer certified
               (see SEI Provider Contracts).
```

### 7. Scholarly Ecosystem Integration
```
Version:       v1.0
Status:        Documented
Artifact:      docs/IAEP-Scholarly-Ecosystem-Integration-Architecture.md
Authority:     Architecture Review Required
Notes:         SEI-00 Architecture Definition complete. Covers provider
               capability model, adapter architecture, identity mapping
               rules, lifecycle integration, and security architecture.
               Next phase: ADR + credential provisioning + certification.
```

### 8. SEI Provider Contracts
```
Version:       v1.1
Status:        Certified With Known Gaps
Artifact:      docs/IAEP-SEI-02-Provider-Contract-Hardening.md
Authority:     Architecture Review Required
Notes:         v1.0 contract architecture certified (SEI-01). v1.1
               hardening: formal contracts ICrossrefProvider,
               IDataCiteProvider, IOpenAIREProvider created; providers
               and verification services routed via ProviderRuntimeManager;
               mock/fake behavior removed. Remains CERTIFIED WITH KNOWN
               GAPS until runtime conformance validation passes.
```

### 9. SEI Provider Runtime
```
Version:       v1.1
Status:        Certified
Artifact:      docs/IAEP-SEI-04-Closure-Report.md
Authority:     Architecture Review Required
Notes:         v1.0 runtime conformance certified with findings (SEI-03).
               v1.1 remediation (SEI-04): FIND-01..FIND-06 ALL RESOLVED.
               ProviderRuntimeManager gateway enforced across all
               providers. No mock/fake responses, no hardcoded secrets,
               fail-closed enforced, evidence persistence complete via
               ExternalEvidenceStore. Build PASS (tsc).
```

Primary reference: `docs/IAEP-SEI-03-Runtime-Conformance-Certification.md` (v1.0 findings baseline; resolved in v1.1).

### 10. SEI Provider Ecosystem Expansion
```
Version:       v1.0
Status:        Documented
Artifact:      docs/IAEP-SEI-05-Provider-Ecosystem-Expansion.md
Authority:     Architecture Review Required
Notes:         SEI-05 architecture definition. Six provider categories:
               DOI (Crossref), Identity (ORCID), Repository (Zenodo),
               Discovery (OpenAIRE, OpenAlex), National Evaluation
               (SINTA), External Publisher Workflow (MDPI, Elsevier,
               Springer). Defines category capability model, adapter
               contracts, submission workflow, ranking/indexing
               workflow, publisher interoperability model, and RJRAKP
               intelligence integration. Boundary: ASIA = Publisher +
               Peer Review Authority; RJRAKP = Indexing + Ranking +
               Intelligence; External Publishers = destination only.
               No auth changes, no identity changes, no mock providers.
```

### 11. SEI-06A Crossref Production DOI Workflow
```
Version:       v1.0
Status:        Documented
Artifact:      docs/IAEP-SEI-06A-Crossref-DOI-Workflow.md
Authority:     Architecture Review Required
Notes:         Production-grade Crossref DOI lifecycle workflow for the
               DOI Provider category. Lifecycle: Acceptance → Metadata
               Validation → Crossref DOI Registration → Deposit
               Confirmation → Evidence Persistence → Citation Intelligence
               Ready. Built on existing pipeline:
               CrossrefFederationService.publishArticleDOI →
               CrossrefProvider (via ProviderRuntimeManager) →
               CrossrefAdapter/CrossrefMapper → ExternalEvidenceStore.
               No mock DOI, no fake metadata, fail-closed credentials.
               Protected boundaries untouched.
```

### 12. SEI-06B ORCID Author Identity Workflow
```
Version:       v1.0
Status:        Documented
Artifact:      docs/IAEP-SEI-06B-ORCID-Identity-Workflow.md
Authority:     Architecture Review Required
Notes:         Production-grade ORCID author identity integration for
               the Identity Provider category. Lifecycle: Author
               Registration → ORCID Identity Linking → OAuth
               Verification → Author Identity Evidence → Publication
               Association → ORCID Record Synchronization. Built on
               ORCIDIdentityService (connectIdentity / pushVerifiedWork)
               → ORCIDProvider (via ProviderRuntimeManager) →
               ORCIDAdapter/ORCIDMapper + IOrcidIdentityProvider.
               IAEP remains identity authority; ORCID cannot create,
               replace, or bypass IAEP identity. Documented gap:
               pushVerifiedWork evidence not yet persisted via
               ExternalEvidenceStore (follow-up). Protected boundaries
               untouched.
```

### 13. SEI-06C Zenodo Repository Deposit Workflow
```
Version:       v1.0
Status:        Documented
Artifact:      docs/IAEP-SEI-06C-Zenodo-Repository-Deposit-Workflow.md
Authority:     Architecture Review Required
Notes:         Production-grade Zenodo repository deposit lifecycle for
               the Repository Provider category. Lifecycle: Accepted
               Publication → Artifact Preparation → Zenodo Deposit
               Creation → File Upload → Metadata Validation → Record
               Publication → Repository Evidence Persistence → Discovery
               Ready. Built on PublicationDepositService.depositToZenodo
               (createDeposit → uploadFile → publishRecord → adapt →
               persist) → ZenodoProvider (via ProviderRuntimeManager) +
               IZenodoDepositProvider / ZenodoMapper / ZenodoAdapter /
               ZenodoVerificationService. No mock deposit, no fake
               repository record. Documented gap: depositToZenodo
               persists via private storeEvidence() not ExternalEvidenceStore
               (follow-up). Protected boundaries untouched.
```

### 14. SEI-06D Discovery & Citation Intelligence Workflow
```
Version:       v1.0
Status:        Documented
Artifact:      docs/IAEP-SEI-06D-Discovery-Citation-Intelligence-Workflow.md
Authority:     Architecture Review Required
Notes:         Production-grade scholarly discovery & citation lifecycle
               for Discovery (OpenAIRE) and Citation Intelligence
               (OpenAlex) categories. Lifecycle: Published Article → DOI
               Resolution → OpenAIRE Discovery Verification → OpenAlex
               Citation Discovery → Research Graph Update → RJRAKP
               Intelligence Layer. Built on IIndexVerificationProvider /
               OpenAIREProvider / OpenAlexProvider (via
               ProviderRuntimeManager) + ExternalEvidenceStore +
               OpenAIREDiscoveryService / OpenAlexIntelligenceService.
               OpenAIRE = discovery signal; OpenAlex = citation signal.
               RJRAKP consumes evidence only — never calls providers
               directly. No fabricated citation, no fake discovery
               evidence. Documented gap: OpenAlexIntelligenceService
               persists via console.log/TODO — not yet wired to
               ExternalEvidenceStore (follow-up). Protected boundaries
               untouched.
```

### 15. SEI-06E SINTA National Evaluation Workflow
```
Version:       v1.0
Status:        Documented
Artifact:      docs/IAEP-SEI-06E-SINTA-Evaluation-Workflow.md
Authority:     Architecture Review Required
Notes:         Production-grade SINTA National Evaluation integration for
               the National Research Evaluation category. Lifecycle:
               Published Article → Author Identity Lookup → Publication
               Sync → Evaluation Signal Reconciliation → Evidence
               Persistence → RJRAKP Evaluation Consumption. Built on
               ISintaProvider / SintaProvider / SintaAdapter (via
               ProviderRuntimeManager) + SintaCapability / SintaIdentityMapper
               / SintaProviderContract. ASIA = publisher; SINTA = external
               evaluation signal provider; RJRAKP = consumer of evaluation
               evidence. No mock data, no provider bypass. Documented gaps:
               fetchInstitution/fetchImpactSignals throw (adapter pending);
               mapToApasificIdentity returns undefined (matching pending).
               Protected boundaries untouched.
```

### 16. SEI-06F External Publisher Workflow
```
Version:       v1.0
Status:        Documented
Artifact:      docs/IAEP-SEI-06F-External-Publisher-Workflow.md
Authority:     Architecture Review Required
Notes:         Production-grade external publisher interoperability for
               External Publisher Workflow category (MDPI, Elsevier,
               Springer). Defines publisher adapter model, submission
               package generation, metadata mapping, author ORCID mapping,
               manuscript package, status synchronization, evidence
               persistence, and per-publisher workflows. Contract:
               IExternalPublisherWorkflow (submitArticle/checkStatus/
               withdraw). Gateway: ProviderRuntimeManager (no bypass).
               Evidence: ExternalEvidenceStore. All adapters PLANNED;
               no fake submission, no automatic bypass of external
               editorial systems, no identity bypass. Protected
               boundaries untouched.
```

### 17. SEI-06G Scholarly Evidence Consolidation
```
Version:       v1.0
Status:        Documented
Artifact:      docs/IAEP-SEI-06G-Evidence-Consolidation-Architecture.md
Authority:     Architecture Review Required
Notes:         Unified evidence foundation for RJRAKP Intelligence Layer.
               Defines ExternalEvidenceSnapshot + DiscoveryEvidenceSnapshot
               model, evidence provenance, lifecycle (ExternalPublication-
               Lifecycle enforced state machine), confidence scoring,
               immutable snapshot strategy, SHA-256 hash verification,
               per-publication provider evidence aggregation, and RJRAKP
               consumption boundary (consumes evidence repository only;
               never calls providers directly). Aggregates Crossref DOI,
               ORCID Identity, Zenodo Repository, OpenAIRE Discovery,
               OpenAlex Citation, SINTA Evaluation, and External Publisher
               Status evidence. No mock evidence, no fabricated metrics.
               Protected boundaries untouched.
```

### 18. SEI-07A RJRAKP Research Intelligence
```
Version:       v1.0
Status:        Documented
Artifact:      docs/IAEP-SEI-07A-RJRAKP-Intelligence-Architecture.md
Authority:     Architecture Review Required
Notes:         RJRAKP defined as the Scholarly Intelligence and Research
               Evaluation Layer. Boundary: ASIA = Publisher + Peer Review
               Authority; External Providers = Evidence Sources; Evidence
               Repository = Single source for intelligence input; RJRAKP =
               Analytics, Ranking, Scoring, Research Intelligence. Defines
               bounded context, evidence consumption model (read-only),
               article quality scoring, research impact scoring, author
               influence metrics, institution research metrics, ranking
governance (deterministic/versioned/auditable), explainability
               requirements, no-provider-direct-access rule (consumes only
               ExternalEvidenceRepository), and future AI intelligence layer
               (evidence-only, advisory). Prohibitions: never calls providers
               directly, never overrides ASIA peer review, never creates
               publication decisions, never replaces DOI/index providers.
               Protected boundaries untouched.
```

### 19. SEI-07B RJRAKP Scoring & Metrics Governance
```
Version:       v1.0
Status:        Documented
Artifact:      docs/IAEP-SEI-07B-RJRAKP-Scoring-Metrics-Governance.md
Authority:     Architecture Review Required
Notes:         Governance model for RJRAKP scoring, ranking, and research
               metrics. Defines four scoring models: Article Quality
               Score (AQS), Research Impact Score (RIS), Author Influence
               Score (AIS), Institution Research Score (IRS). Declared,
               versioned, sum-to-1.0 metric weights; model versioning
               strategy (<Model>-<Major>.<Minor>); explainability
               requirements (factor decomposition, source attribution,
               confidence, hash verification, model versioning, weight
               transparency); immutable audit trail; bias prevention
               (evidence-bound, confidence-weighted, provider-attributed,
               normalized, no over-weighting, limited autonomy); ranking
               change governance (deterministic, evidence-based,
               versioned, auditable, authority-boundary enforced). RJRAKP
               scores are analytical insights only — never decision
               acceptance, never override peer review, never replace
               SINTA/Scopus/Web of Science, never modify provider
               evidence. Consumes only ExternalEvidenceRepository.
               Protected boundaries untouched.
```

### 20. SEI-07C RJRAKP Explainability & Audit Architecture
```
Version:       v1.0
Status:        Documented
Artifact:      docs/IAEP-SEI-07C-RJRAKP-Explainability-Audit-Architecture.md
Authority:     Architecture Review Required
Notes:         Enforcement architecture operationalizing SEI-07A
               boundaries and SEI-07B governance. Defines the
               ExplainabilityEnvelope (no RJRAKP output without factor
               decomposition, source attribution, confidence, hash
               verification, model version, weight map, audit link,
               and reproducibility hash); score factor decomposition
               model (Score = Σ weight × normalizedValue × confidence;
               AQS 6 factors, RIS/AIS/IRS 4 factors each, bound to
               SEI-07B v1.0 weights); evidence attribution model
               (EvidenceReference binding to SEI-06G snapshots; hash
               mismatch invalidates; attribution never anonymized);
               confidence model (VERIFIED_HIGH..HASH_MISMATCH;
               corroboration/conflict/recency rules); immutable
               append-only audit trail (AuditRecord, single write
               path, reproducibility guarantee); bias audit
               architecture (detection signals, remediation workflow,
               prohibited-behavior detection); ranking governance
               workflow (trigger, candidate, diff, classification,
               review, publication; read-only change log); RJRAKP
               runtime boundary contract (RJRAKPEvidenceReader as the
               only input port; scoring/ranking/audit service
               contracts; no provider client; existing
               ResearchIntelligenceService conformance gap recorded
               for a future remediation phase); Future AI
               Intelligence readiness gates per SEI-07A §10
               (evidence-only, advisory). Documentation only — no
               code, database, or API changes. Protected boundaries
               untouched.
```

---

## Governance Status Legend

| Symbol | Meaning |
|:---:|---------|
| ✅ CERTIFIED | Architecture reviewed and certified for production |
| ❄️ FROZEN | Certified and locked; changes require Architecture Review |
| ⚙️ COMPLETE | Implementation complete with documented evidence |
| ⚙️ CERTIFIED WITH KNOWN GAPS | Architecture certified; implementation readiness gaps documented |
| ⚙️ CERTIFIED WITH FINDINGS | Runtime certified; findings tracked and pending remediation |
| 📘 DOCUMENTED | Architecture defined and documented; not yet implemented or certified |
| 🟦 PLANNED | Design/roadmap defined; not yet implemented or certified |

---

## How to Add a New Certification

1. Implement the subsystem behind its own provider/boundary layer.
2. Write an ADR recording the architecture decision.
3. Collect certification evidence (build verification, runtime validation, security review).
4. Create a certification artifact (e.g., `docs/<Subsystem>-Certification.md`).
5. Update this registry with the new subsystem, version, status, and artifact link.
6. Obtain Architecture Review Board sign-off before marking anything `CERTIFIED` or `FROZEN`.

---

## Governance Note

This registry does **not** claim full enterprise production certification by itself. It is the tracking index for **per-subsystem** architecture certification artifacts. Each entry must reference its own artifact that contains the supporting evidence.

*Registry maintained by IAEP Architecture Review Board.*  
*Next phase: Scholarly Ecosystem Integration (Publication Provider Layer).*
