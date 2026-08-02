# ADR-ASIA-002: Citation Intelligence Layer Architecture

* **Status:** APPROVED & FROZEN
* **Version:** 1.0
* **Date:** 2026-08-02
* **Decisions:**
  * **Primary Citation Metrics Provider:** OpenAlex is selected for citation counts, works graph tracking, and author impact index calculation.
  * **Metadata Validation Provider:** Crossref is selected for DOI metadata registration checks, reference linking, and publication metadata verification.
  * **Architecture Model:** Strictly conforms to the IAEP Integration Layer. External APIs reside within the boundary layer (`src/providers/`).
  * **Database Preservation:** Reuse `researcher_impact_profiles`, `research_metrics`, and `submissions` citation statistics columns.

## Context
To build a scalable and auditable citation network for ASIA, we require an integration architecture that gathers real-time citation metrics, keeps track of historical citation growth, and maps global citation ecosystems directly back to ASIA's publications and researcher profiles.

## Constraints
1. **Reuse Existing DOI Source:** All citation checks must resolve utilizing the existing `submissions.doi` identifier.
2. **Reuse Existing Databases:** Do not introduce new tables for profile statistics. Update `researcher_impact_profiles` (aggregates) and `research_metrics` (history timeline).
3. **No Parallel Citation Systems:** Do not create separate citation services for different journals.
4. **Provider Isolation Mandatory:** No direct API calls from frontends or database triggers; all calls must flow through isolated providers.
