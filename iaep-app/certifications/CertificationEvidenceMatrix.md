# Certification Evidence Matrix

| Capability | ADR Reference | Implementation Location | Certification Document | Validation Method | Current Status |
|---|---|---|---|---|---|
| Publication Visibility | ADR-ASIA-001 | src/services/publication-federation | PublicationVisibilityCertification.md | Build + integration validation | CERTIFIED |
| Citation Intelligence | ADR-ASIA-002 | src/services/citation-intelligence | CitationIntelligenceCertification.md | Build + service validation | CERTIFIED |
| Identity Federation / ORCID | ASIA Publication Identity Certificate | src/services/identity-federation and src/providers/orcid | IdentityFederationCertification.md | Build + identity flow validation | CERTIFIED |
| Research Impact Analytics | ADR-ASIA-003 | src/services/research-intelligence | ResearchImpactAnalyticsCertification.md | Architecture + documentation validation | DOCUMENTED |
| Reviewer Bounded Context | ADR-ReviewerContext | src/services/ReviewQueueService.ts and src/repositories/ReviewAssignmentRepository.ts | EnterpriseProductionReadinessReport.md | Architecture documentation review | DOCUMENTED |
| Operational Maturity | ADR-ASIA-001 / ADR-ASIA-002 / ADR-ASIA-003 | src/providers/core/ProviderRuntimeManager.ts | OperationalMaturityAssessment.md | Build + runtime hardening review | HARDENED |
