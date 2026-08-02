# ADR-ASIA-001: Publication Visibility Pipeline Architecture

* **Status:** APPROVED
* **Version:** 1.0
* **Date:** 2026-08-02
* **Decisions:**
  * **Primary DOI Provider:** Zenodo is selected as the primary Phase-1 DOI provider.
  * **Discovery Verification Layer:** OpenAIRE serves as the primary verification layer.
  * **Publication Standard:** Google Scholar metadata tags and Schema.org ScholarlyArticle JSON-LD are mandatory on landing pages.
  * **Future Iterations:** Crossref, ORCID, Scopus, and Web of Science (WoS) integration will be introduced in subsequent phases.

## Context
To establish global visibility for articles published on the ASIA platform immediately, we require a robust, automated pipeline to register DOIs, verify database indexing status, and make article landing pages crawlable by scholarly indexers.

## Details

### 1. Database Index State Model
The `publication.index_status` field (JSONB) dynamically stores verification states:
```typescript
export type VisibilityState = "NOT_STARTED" | "PROCESSING" | "PARTIAL" | "VISIBLE" | "FAILED";

export interface PublicationIndexStatus {
  overall: {
    visibility: VisibilityState;
    last_checked: string | null;
  };
  doi?: {
    value: string;
    provider: string;
    verified_at: string;
  };
  zenodo?: {
    status: string;
    record_id: string;
    checked_at: string;
  };
  openaire?: {
    status: string;
    checked_at: string;
  };
  googleScholar?: {
    status: string;
    last_checked: string | null;
  };
}
```

### 2. Interface Isolation
Zenodo integrations reside under a dedicated boundary interface to separate the publication domain from external provider API details:
- `src/providers/zenodo/IZenodoDepositProvider.ts`
- `src/providers/zenodo/IZenodoRecord.ts`

### 3. Federation Verification Contracts
All discovery monitoring services follow a unified contract under `src/services/publication-federation/`:
- `src/services/publication-federation/contracts/IIndexVerificationProvider.ts`

### 4. Search Crawler Adjustments
Google Scholar Dublin Core & Citation tags, Schema.org blocks, sitemaps, and robots.txt configurations are implemented as defined in the revised discovery requirements.
