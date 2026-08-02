# ADR-ASIA-003: Research Impact Analytics Layer Architecture

* **Status:** APPROVED & FROZEN
* **Version:** 1.0
* **Date:** 2026-08-02
* **Decisions:**
  * **Visualization Engine:** Native SVG Components styled with Tailwind/Vanilla CSS transitions (zero external library dependency like Chart.js or Recharts).
  * **Data Source:** Exclusively query existing metrics layers: `researcher_impact_profiles`, `research_metrics`, `researcher_identifiers`, and `publications`.
  * **Service Boundary:** Orchestrate analytical presentation logic inside [ResearchIntelligenceService.ts](file:///d:/Users/apasific/iaep-app/src/services/research-intelligence/ResearchIntelligenceService.ts).
  * **Security Boundary:** Expose public metrics only (citation/publication counts, public ORCID identifiers, and trend graphs). Strictly exclude emails, private profile metadata, or encrypted OAuth tokens.

## Context
To offer a lightweight and high-performance visual citation dashboard without bloat, we choose custom SVG data visualization. This ensures full layout control while preserving strict resource attribution.

## Constraints
1. **No External Chart Modules:** Do not install any React chart packages. Draw all charts using raw SVG path/polyline/circle elements.
2. **No Database schema changes:** Do not introduce new tables for analytical aggregation. Rely on calculations computed from metrics history.
3. **Strict RLS Scope:** The analytical services must limit output fields to public metrics to prevent credentials leaks.
