# Research Impact Analytics Certification

## Scope
This certification covers the ASIA research impact analytics layer as implemented through the research intelligence service, provider runtime, and existing research metrics data sources. It is intended to validate that analytics remain within the approved architecture boundaries and do not introduce duplicate services or parallel flows.

## Architecture components
- Research intelligence service: src/services/research-intelligence/ResearchIntelligenceService.ts
- Provider runtime boundary: src/providers/core/ProviderRuntimeManager.ts
- Research domain models: src/domain/research-impact/ResearcherImpactProfile.ts and src/domain/research-impact/ResearchMetric.ts
- Research timeline domain: src/domain/identity/ResearchTimelineEvent.ts
- Provider adapters and capability registry: src/services/scholarly-integration/runtime/ProviderRuntimeManager.ts and src/services/scholarly-integration/contracts/IProviderAdapter.ts

## Data sources
The analytics layer is expected to consume existing research metrics data only:
- researcher_impact_profiles
- research_metrics
- researcher_identifiers
- publications

The current implementation remains service-oriented and does not introduce new tables or additional persistence layers.

## Provider boundaries
- External provider access remains isolated behind provider boundaries.
- Business logic remains in service orchestration layers.
- No provider logic is moved into UI or route handlers.
- The provider runtime is the centralized execution path for outbound calls.

## Validation rules
- Provider access must flow through the runtime manager.
- External data sources must remain behind provider contracts.
- No parallel citation systems may be introduced.
- No new analytics persistence model may be introduced without explicit architecture approval.
- Public output must remain limited to non-sensitive fields.

## Audit evidence
- Research intelligence orchestration exists in src/services/research-intelligence/ResearchIntelligenceService.ts.
- Provider execution is centralized in src/providers/core/ProviderRuntimeManager.ts.
- Existing provider implementations such as ORCID, OpenAlex, Zenodo, and OpenAIRE are routed through the runtime boundary.
- The architecture remains aligned with ADR-ASIA-002 and ADR-ASIA-003.

## Reliability considerations
- Retry handling and timeout controls are implemented in the shared provider runtime.
- Request tracing is emitted through a request identifier and structured logging.
- Provider failures are logged and surfaced to the service layer for controlled handling.
- The implementation avoids introducing a new framework or parallel processing path.

## Certification checklist
- [x] Research intelligence service exists and remains in the service layer.
- [x] Provider boundaries remain isolated.
- [x] External calls are routed through a shared runtime boundary.
- [x] No duplicate services were introduced.
- [x] Certification remains aligned with current ADRs.
- [x] Operational hardening is present for provider execution.

## Gaps noted
- The current research intelligence service still contains placeholder persistence logic for profile and metric updates.
- This does not block certification for the current sprint because it is an implementation completeness gap rather than an architecture violation.
- The certification focuses on architectural compliance and operational readiness, not full production data persistence completion.
