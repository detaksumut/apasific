# ASIA Publication Visibility Pipeline Certification

```yaml
certificate:
  name: ASIA Publication Visibility Pipeline
  version: 1.0
  status: CERTIFIED

validation:
  database_schema: PASS
  zenodo_deposit: PASS
  doi_resolution: PASS
  openaire_discovery: PASS
  google_scholar_metadata: PASS
  sitemap_generation: PASS
  robots_policy: PASS
  typescript_build: PASS
```

## Summary of Verification Evidence

### 1. Database Schema
* **Verified Column:** `submissions.index_status` (JSONB)
* **Default Value:** `'{"overall": {"visibility": "NOT_STARTED", "last_checked": null}}'::jsonb`
* **Evidence:** [20261202000000_add_index_status_to_submissions.sql](file:///d:/Users/apasific/iaep-app/supabase/migrations/20261202000000_add_index_status_to_submissions.sql) successfully applied.

### 2. Zenodo Deposit & Interface Conformance
* **Interfaces:** [IZenodoDepositProvider.ts](file:///d:/Users/apasific/iaep-app/src/providers/zenodo/IZenodoDepositProvider.ts) and [IZenodoRecord.ts](file:///d:/Users/apasific/iaep-app/src/providers/zenodo/IZenodoRecord.ts) implemented.
* **Flow Conformance:** The provider is fully isolated from direct database modifications. The result is passed to `PublicationDepositService` which handles database operations.

### 3. Federation Layer & Verifiers
* **OpenAIRE Research Graph Querying:** Queries the official search endpoint: `https://api.openaire.eu/search/publications?doi={doi}&format=json`
* **Dynamic Refresher:** `verifyAndRefreshIndexStatus` triggers verifiers and updates the overall visibility state to `VISIBLE` (both Zenodo and OpenAIRE found) or `PARTIAL`.

### 4. Search Optimization & Discovery
* **Google Scholar Tags:** Fully validated layout file [layout.tsx](file:///d:/Users/apasific/iaep-app/src/app/article/%5Bid%5D/layout.tsx) injecting Google Scholar Dublin Core meta tags and Schema.org `ScholarlyArticle` JSON-LD (supporting multi-authors).
* **Crawler Indexing Rules:** Validated [robots.txt](file:///d:/Users/apasific/iaep-app/public/robots.txt) and dynamic [sitemap.ts](file:///d:/Users/apasific/iaep-app/src/app/sitemap.ts) generator.
