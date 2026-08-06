# IAEP Service Consolidation Matrix & Duplicate Detection

* **Version**: 1.1 (Consolidated & Certified)
* **Status**: FROZEN (Audit Only)
* **Domain**: Service Logic Consolidation

---

## 1. Identity Layer Services

| Component/Service | Scope/File | Used | Duplicate | Decision |
| :--- | :--- | :--- | :--- | :--- |
| **Auth Server Action** | `src/app/actions/auth.ts` | Yes | No | `KEEP` |
| **Role Permissions** | `src/lib/permissions.ts` | Yes | No | `KEEP` |
| **Role Resolver** | `src/lib/roles.ts` | Yes | No | `KEEP` |

---

## 2. Publication Layer Services

| Component/Service | Scope/File | Used | Duplicate | Decision |
| :--- | :--- | :--- | :--- | :--- |
| **Federation Provider Registry** | Database Table | Yes | No | `KEEP` |
| **Zenodo Preservation** | `src/services/publication/...` | Yes | No | `KEEP` |
| **Metadata Validator** | `src/app/article/[id]/page.tsx` | Yes | No | `KEEP` |
| **OAI PMH Compliance** | `src/app/api/oai/route.ts` | Yes | No | `KEEP` |

---

## 3. Reviewer Layer Services

| Component/Service | Scope/File | Used | Duplicate | Decision |
| :--- | :--- | :--- | :--- | :--- |
| **AI Reviewer screening** | `src/services/reviewer/AIReviewerService.ts` | Yes | No | `KEEP` |
| **Reviewer Workload & COI** | `src/services/reviewer/ReviewerWorkloadService.ts` | Yes | No | `KEEP` |
| **Academic Recognition** | `src/services/reviewer/ReviewerRecognitionService.ts` | Yes | No | `KEEP` |

---

## 4. Metrics Layer Services

| Component/Service | Scope/File | Used | Duplicate | Decision |
| :--- | :--- | :--- | :--- | :--- |
| **Journal Metrics** | `src/services/metrics/JournalMetricsService.ts` | Yes | No | `KEEP` |
| **Journal Health Scorer** | `src/services/metrics/JournalHealthCalculator.ts` | Yes | No | `KEEP` |
| **Editorial Intelligence** | `src/services/metrics/EditorialIntelligenceService.ts`| Yes | No | `MERGE_INTO_METRICS` |
| **Research Intelligence** | `src/services/reviewer/ResearchIntelligenceService.ts`| Yes | No | `KEEP` |

---

## 5. API Layer (src/app/api/*)

| Endpoint | Purpose | Status | Decision |
| :--- | :--- | :--- | :--- |
| `/api/oai` | OAI-PMH Feed | Production | `KEEP` |
| `/api/indexing/doaj` | XML DOAJ Export | Production | `KEEP` |
| `/api/indexing/sinta` | JSON SINTA Readiness | Production | `KEEP` |
| `/api/admin/accreditation` | SINTA Score Calculator | Production | `MERGE` |
| `/api/admin/indexing-readiness`| Scopus Score Calculator | Production | `MERGE` |

---

## 6. Database Layer (Supabase Migrations)

| Migration File | Bounded Context | Overlap | Decision |
| :--- | :--- | :--- | :--- |
| `20260806120000_create_accreditation_tables.sql` | Accreditation Readiness | None | `KEEP` |
| `20260806130000_create_research_intelligence_tables.sql` | Research Intelligence | None | `KEEP` |
| `20260806140000_create_reviewer_recognition_tables.sql` | Reviewer Recognition | None | `KEEP` |
