# APASIFIC AI — Knowledge Map v1.0

> Generated: 2026-09-03
> Source: Static codebase audit (READ-ONLY)
> Purpose: Foundation for APASIFIC AI Chatbot Knowledge Base

---

## 1. ORGANIZATION & PLATFORM

### 1.1 What is APASIFIC?

**APASIFIC** = **Association of Asia Pacific Academician**

- **Legal Entity**: PT. Bernas Sumut Jaya (AHU No. AHU-003707.AH.01.30.Tahun 2024)
- **Deed of Establishment**: No. C-1615.Ht.03.01-Th.2022
- **Publisher**: APASIFIC Press
- **Website**: apasific.org
- **KBLI**: 58130 (Journal Publishing), 63121 (Digital Web Portal)
- **Publishing Model**: Diamond Open Access (NO APC for authors or readers)
- **License**: CC BY 4.0
- **Scope**: 16 Academic Divisions across Asia Pacific

### 1.2 Vision

Centralized digital ecosystem for Asia Pacific scholars, researchers, and professionals for global collaboration.

### 1.3 Mission

Integrated end-to-end platform for:
- International-standard scholarly publication
- Competency certification (CBT exams)
- Academic membership management

### 1.4 Core Values

- Double-Blind Peer Review
- Diamond Open Access (free to publish, free to read)
- AI-assisted editorial governance (AI assists, human decides)
- ORCID-authenticated authorship
- Transparent publication lifecycle

---

## 2. USER ROLES

### 2.1 Role Definitions

| Role | Normalized Name | Description |
|------|----------------|-------------|
| `super_admin` | SUPER_ADMIN | Full system access |
| `admin` | ADMIN | System management, journals, users, financials |
| `co_admin` / `co-admin` | ADMIN | Member approval, reviewer assignment |
| `editor` | EDITOR | Editorial workflow management |
| `reviewer` | REVIEWER | Peer review evaluation |
| `supervisor` / `admin editor` | SUPERVISOR | Oversees production team |
| `layout` | PRODUCTION | Layout formatting |
| `cover` | PRODUCTION | Cover design |
| `publish` | PRODUCTION | Final publication |
| `author` | AUTHOR | Manuscript submission, tracking |

### 2.2 Login Portals

| Portal | Target Role | Auth Method |
|--------|-------------|-------------|
| Peneliti (ORCID) | Author | ORCID OAuth2 |
| Reviewer | Reviewer | Email + Password |
| Editorial & Staf | Editor, Admin, Staff | Email + Password |

### 2.3 Registration

- Author registration requires admin verification (status: "Pending")
- Reviewer registration requires admin verification
- Editor registration requires editorial track record + admin verification

---

## 3. JOURNALS (18 Total)

### 3.1 Journal Inventory

| # | Slug | Name | Division |
|---|------|------|----------|
| 1 | iaep | International Academic Excellence Proceedings | Multidisciplinary |
| 2 | rjrakp | Riset Jurnal Akuntansi dan Keuangan Publik | Accounting & Public Finance |
| 3 | ajaf | Akuntansi, Audit & Perpajakan | Accounting, Audit & Taxation |
| 4 | ajed | Ekonomi Pembangunan & Keuangan | Development Economics & Finance |
| 5 | ajep | Jurnal Pendidikan | Education |
| 6 | ajce | Teknik Sipil, Mesin & Elektro | Civil, Mechanical & Electrical Engineering |
| 7 | ajafr | Pertanian, Kehutanan & Perikanan | Agriculture, Forestry & Fisheries |
| 8 | ajadm | Seni, Desain & Media Kreatif | Arts, Design & Creative Media |
| 9 | ajir | Ilmu Politik & Hubungan Internasional | Political Science & International Relations |
| 10 | ajcs | Pengabdian Kepada Masyarakat (PKM) | Community Service |
| 11 | ajba | Manajemen, Bisnis dan Administrasi | Business, Management & Administration |
| 12 | ajls | Ilmu Hukum & Hak Asasi Manusia | Legal Studies & Human Rights |
| 13 | ajph | Kedokteran, Kesehatan Masyarakat & Keperawatan | Medicine, Public Health & Nursing |
| 14 | ajite | Ilmu Komputer & Teknologi Informasi | Computer Science & IT |
| 15 | ajssh | Sosiologi & Ilmu Pengetahuan Budaya | Sociology & Cultural Studies |
| 16 | ajes | Ilmu Lingkungan & Keberlanjutan | Environmental Science & Sustainability |
| 17 | ajthm | Pariwisata & Manajemen Perhotelan | Tourism & Hospitality Management |
| 18 | ajis | Disiplin Ilmu Agama dan Peradaban Islam | Islamic Studies |

### 3.2 Journal Metadata Defaults

- **Publisher**: Association of Asia Pacific Academician (APASIFIC)
- **Peer Review Type**: Double Blind
- **License**: CC BY 4.0
- **Language**: English (primary)
- **Country**: Indonesia
- **ISSN Status**: In Queue (belum ditetapkan untuk semua jurnal)

### 3.3 Volume & Issue Rules

- **Volume** = Year-based. Starting year: 2026 = Vol 1
- **Formula**: Volume = (currentYear - 2026) + 1
- **Issue** = Semester-based (2 issues per year)
  - Semester 1: months 1-6
  - Semester 2: months 7-12
- **Issue numbering**: Unlimited (no maximum)
- **Display format**: `Vol. X No. Y (Year)`

---

## 4. SUBMISSION WORKFLOW

### 4.1 Submission Form (5 Sections)

**Section 1 — Research Identity**
- Journal selection (1 of 18)
- Scope/subject area
- Title
- Abstract (Bahasa Indonesia + English)
- Keywords (comma-separated)
- Article type: Original Research, Review Article, Case Report, Short Communication, Perspective
- Research approach: Quantitative, Qualitative, Mixed-Methods, Meta-Analysis/SLR, Conceptual/Theoretical, Legal-Normative, Experimental, Bibliometric

**Section 2 — Authors & CRediT**
- Multiple authors supported
- Each author: name, email, affiliation, country
- Academic identifiers: ORCID, Scopus, WoS, SINTA, Google Scholar
- CRediT roles (14 roles): Conceptualization, Methodology, Software, Validation, Formal Analysis, Investigation, Resources, Data Curation, Writing - Original Draft, Writing - Review & Editing, Visualization, Supervision, Project Administration, Funding Acquisition

**Section 3 — Integrity & Compliance**
- AI Transparency Record (tools used, purposes, affected sections)
- Data Availability Statement
- Ethics Declaration
- Funding & Conflict of Interest
- Bibliography (minimum 50 characters)
- Cover Letter (optional)

**Section 4 — File Upload**
- Title Page (required) — contains author identity
- Anonymous Manuscript (required) — for blind review
- Supporting Data (optional)

**Section 5 — Submission Integrity Pledge**
- Originality confirmed
- No dual submission confirmed
- Co-authors approved
- Data accuracy accepted

### 4.2 Pre-Submission Check

- Plagiarism check runs BEFORE submission
- Uses `ParagraphSimilarityContextService` for paragraph-level similarity
- Risk levels: NO_HIGH_RISK_SIGNAL / REVIEW_RECOMMENDED / HIGH_RISK_SIGNAL_DETECTED

### 4.3 Submission Statuses

| Status | Phase | Level |
|--------|-------|-------|
| `queued` / `Submitted` / `pending` | Intake | 1 |
| `Awaiting Reviewers` | Screening | 2 |
| `Under Review` | Review | 3 |
| `Reviewed` | Review | 4 |
| `Needs Revision` / `Revision Required` | Review | 4 |
| `Revision Submitted` | Review | 4 |
| `Revision Under Review` | Review | 4 |
| `Accepted` | Editorial Decision | 5 |
| `Rejected` / `Declined` / `Desk Reject` | Editorial Decision | 5 |
| `Assigned to Layout` / `In Layout` | Copyediting | 6 |
| `Assigned to Cover` | Copyediting | 6 |
| `Assigned to Publish` | Production | 7 |
| `Pending Supervisor` | Production | 7 |
| `Production Completed` | Pre-Publication | 7 |
| `Published` | Terminal | 8 |

---

## 4A. AUTHOR RESOURCES (VERIFIED FROM LOGIN PAGE)

### Template Naskah
- **File**: `APASIFIC_Template_Naskah_v1.0.docx`
- **Location**: Halaman login APASIFIC (publik, tanpa login)
- **Button**: "Unduh Template Naskah (Word)"
- **Akses**: Tidak perlu login — tersedia langsung di halaman login

### Panduan Penulisan
- **File**: `AT-RQS-Methodology-Specification-v1.0.pdf`
- **Location**: Halaman login APASIFIC (publik, tanpa login)
- **Button**: "Panduan Penulisan (PDF)"
- **Akses**: Tidak perlu login — tersedia langsung di halaman login

### APASIFIC Author Formatting & Citation Rules v1.0
- Pedoman resmi penulisan & sitasi
- Format baku: 2-Kolom pada halaman pertama
- Font: Arial 11pt
- Kewajiban: Direct In-Text Citation per paragraf

### AT-RQS™ (APASIFIC Tri-Source Research Quality Score)

**Sumber Resmi**: `AT-RQS-Methodology-Specification-v1.0.pdf`
**Framework Version**: v1.0 | **Algorithm**: AT-RQS-1.0

#### Tujuan
Sistem evaluasi kualitas riset APASIFIC yang komprehensif, objektif, dan terstruktur. BUKAN sekadar jumlah sitasi atau H-Index.

#### 3 Sumber Data (Tri-Source)
1. **Score Layer**: Penilaian kuantitatif aspek naskah (topic, structure, methodology, data, dll)
2. **Screen Layer**: Penilaian editorial (novelty, methodology, clarity ratings)
3. **Clue Layer**: Ekstraksi bukti dari abstrak & naskah (objective, methodology, findings, conclusion, limitations)

#### 7 Dimensi Penilaian
| Dimensi | Bobot | Evaluasi |
|---------|-------|----------|
| Academic Contribution | 18% | Research gap, novelty, topic relevance |
| Procedural Rigor | 18% | Metodologi, desain penelitian, sampling rigor |
| Analytical Strength | 16% | Data statistik, model robustness, explained variance |
| Scholarly Communication | 12% | Struktur artikel, abstrak, diskusi, referensi |
| Integrity & Transparency | 12% | Kesimpulan, keterbukaan limitations, etika |
| Future Research Value | 10% | Potensi riset lanjutan, suggested improvements |
| Impact & Applicability | 14% | Manfaat praktis, relevansi kebijakan |

#### Proses Evaluasi
1. Normalisasi 3 layer → Score Normalized, Screen Normalized, Clue Normalized
2. Perhitungan 7 dimensi dengan bobot masing-masing
3. Base Weighted Score = Σ(dimensi × bobot)
4. Evidence Consistency Index (AECI): deteksi 5 elemen inti
5. Tri-Source Agreement (ARTI): kesepakatan antar 3 sumber data
6. Consistency Factor: [0.85, 1.00] — disesuaikan berdasarkan AECI
7. Final AT-RQS = Base Score × Consistency Factor

#### Klasifikasi Kualitas
| Skor | Klasifikasi |
|------|-------------|
| ≥ 88 | EXEMPLARY RESEARCH RIGOR |
| ≥ 80 | STRONG RESEARCH QUALITY |
| ≥ 70 | GOOD RESEARCH QUALITY |
| ≥ 60 | SATISFACTORY WITH LIMITATIONS |
| < 60 | PRELIMINARY EVIDENCE |

#### Assessment Confidence (AAC)
- Mengukur kepercayaan terhadap hasil evaluasi
- Berdasarkan: ARTI (50%) + Data Completeness (30%) + Extraction Consistency (20%)

#### Rubrik Adaptif (8 Pendekatan Penelitian)
1. Quantitative: Statistical/Empirical Rigor
2. Qualitative: Interpretive/Trustworthiness Rigor
3. Mixed-Methods: Integration Rigor
4. Meta-Analysis/SLR: PRISMA/Search Rigor
5. Conceptual/Theoretical: Conceptual Coherence
6. Legal-Normative: Doctrinal/Statutory Rigor
7. Experimental: Control/Protocol Rigor
8. Bibliometric: Scientometrics Rigor

#### 5-Layer Rubrik
- Layer 1: Identity/Taxonomy (10%)
- Layer 2: Integrity/Ethics (20%)
- Layer 3: Methodological Rigor (35%)
- Layer 4: Evidence & Data (20%)
- Layer 5: Scholarly Impact (15%)

#### Disclaimer
"This score is an assessment indicator, not a certification of research validity, originality, or scientific truth."

#### Keterbatasan
- BUKAN sertifikasi kebenaran ilmiah
- BUKAN pengganti peer review manusia
- Merupakan indikator penilaian, bukan penentu akhir

#### Sumber Implementasi
- Engine: `src/services/at-rqs/ATRQSEngine.ts`
- Types: `src/services/at-rqs/types.ts`
- Rubric: `src/domain/assessment/ATRQSAdaptiveRubric.ts`
- Test: `src/services/at-rqs/__tests__/atrqs_engine.test.ts`

### 5 Pilar APASIFIC
1. Integrity
2. Rigor
3. Evidence
4. Transparency
5. Scholarly Impact

### Sumber Implementasi
- Login page: `src/app/auth/login/page.tsx`
- Template file: `/public/APASIFIC_Template_Naskah_v1.0.docx`
- Panduan file: `/public/AT-RQS-Methodology-Specification-v1.0.pdf`

---

## 5. EDITORIAL WORKFLOW

### 5.1 Incoming Articles (Triage)

Editor sees submissions with status: `queued`, `submitted`, `Submitted`, `pending`

Three actions:
1. **"Terima & Teruskan"** → Status: `Awaiting Reviewers` (proceed to reviewer assignment)
2. **"Tolak (Desk Reject)"** → Status: `Desk Reject` (terminal)
3. **"Hapus"** → Permanent delete

### 5.2 Reviewer Assignment

- Editor assigns reviewer from registered profiles
- System calculates round number
- Reviewer receives WhatsApp notification
- Status: `Awaiting Reviewers` → `Under Review`

**AI Reviewer Recommendation** (advisory only):
- Top 2 ranked reviewers based on expertise, availability, workload
- Never auto-assigns

### 5.3 Reviewer Decision

| Decision | Assignment Status | Submission Status |
|----------|-------------------|-------------------|
| `accepted` | `accepted` | `Under Review` |
| `rejected` | `rejected` | Reverts to `Awaiting Reviewers` |

Deadline: 3 days from acceptance

### 5.4 Review Submission

Reviewer provides:
- Recommendation (Accept, Minor Revision, Major Revision, Reject)
- Comments for author (visible)
- Comments for editor (confidential)
- Correction notes
- Annotated file (optional)

Result: Status → `Reviewed`

### 5.5 Editorial Decision

| Decision | Result |
|----------|--------|
| Accepted | → `Accepted` (triggers LoA creation) |
| Needs/Revision Required | → `Needs Revision` (author revises) |
| Rejected | → `Rejected` (terminal) |
| Declined | → `Declined` (terminal) |

### 5.6 Author Revision

1. Author uploads revised file
2. Status → `Revision Submitted`
3. Editor forwards to reviewer
4. Status → `Revision Under Review`
5. Reviewer evaluates revision
6. Cycle repeats until decision

---

## 6. PUBLICATION PIPELINE

### 6.1 Post-Acceptance Flow

```
Accepted
  → Assigned to Layout (copyediting)
  → Assigned to Cover (design)
  → Assigned to Publish
  → Pending Supervisor
  → Production Completed
  → Published (TERMINAL)
```

### 6.2 Publication Process

When editor publishes:
1. Volume/Issue calculated automatically
2. Status → `Published`
3. Certificate created
4. LoA record persists
5. WordPress syndication (beritaindonesia.news)
6. ASIA Index registration
7. DOI/Zenodo federation (optional)

### 6.3 Published-Only Access

- All public article endpoints filter `status = 'Published'`
- PDF access via stable redirect: `/api/article/{id}/pdf`
- Metadata: JSON, JSON-LD, BibTeX, Dublin Core

---

## 7. LETTER OF ACCEPTANCE (LoA)

### 7.1 When Created

- Automatically created when editor decision = `Accepted`
- Idempotent (checks for existing record first)

### 7.2 LoA Number Format

```
{SUBMISSION_PREFIX}/LoA/APASIFIC/{YEAR}
```

Example: `ABC123/LoA/APASIFIC/2026`

### 7.3 Official Date

- Sourced from `submission_history.created_at` where `action = 'Editor Decision: Accepted'`
- NOT the current date/time
- Persisted in `loa_records.accepted_at`

### 7.4 Print Date

- "Dicetak pada:" — only the current print date
- NOT the official LoA date

### 7.5 QR Code

Contains: `Verified by APASIFIC. LOA ID: {id}. Date: {officialDate}. Author: {authorName}. Journal: {journalName}`

---

## 8. ORCID INTEGRATION

### 8.1 What is ORCID?

Open Researcher and Contributor ID — a persistent digital identifier for researchers.

### 8.2 ORCID in APASIFIC

- **Login Method**: Authors authenticate via ORCID OAuth2
- **Requirement**: Corresponding authors MUST have ORCID iD
- **Storage**: `author_profiles.authenticated_orcid` (1-to-1 constraint)
- **Work Push**: Published articles can be pushed to researcher's ORCID profile
- **Provenance**: `AUTHENTICATED` (verified via OAuth) vs `AUTHOR_CLAIMED` (self-declared)

### 8.3 ORCID Login Flow

1. User clicks "Penulis Login dengan ID ORCID"
2. Redirect to orcid.org/oauth/authorize
3. User authorizes
4. Callback exchanges code for token
5. Profile created/linked
6. Session cookies set

---

## 9. DOI & IDENTIFIERS

### 9.1 DOI Lifecycle

Forward-only stages:
1. `PUBLISHED` — article published internally
2. `DEPOSIT_REQUEST` — repository deposit requested
3. `REPOSITORY_DEPOSIT` — deposited to Zenodo
4. `DOI_RECEIVED` — DOI assigned
5. `METADATA_REGISTRATION` — registered with Crossref/ORCID
6. `INDEXING_QUEUE` — discovery probes queued
7. `INDEXED` — confirmed discoverable

### 9.2 DOI Sources

- **Zenodo**: Pre-reserves DOIs on deposit
- **Crossref**: Registers DOIs via XML deposit
- DOI is immutable once assigned

### 9.3 Article Identifiers

- `id` (UUID) — primary key
- `doi` — Crossref/Zenodo DOI
- `zenodo_id` — Zenodo record ID
- OAI identifier: `oai:apasific.org:article/{UUID}`

---

## 10. AUTHOR PROFILE

### 10.1 Author Master Profile

Each author has:
- `apasificAuthId`: Format `APASIFIC-AUTH-{base36timestamp}{4digits}`
- `authenticatedOrcid`: 1-to-1 ORCID link
- `preferredName`, `previousNames`, `nameVariants`
- `affiliations`: Array of institutional affiliations
- `academicIdentifiers`: ORCID, Scopus, WoS, Google Scholar, SINTA
- `researchProfile`: Fields, keywords, methods expertise
- `profileStatus`: ACTIVE, MERGED, SUSPENDED

### 10.2 Data Provenance

Each identifier claim has a provenance status:
- `AUTHENTICATED` — Verified via OAuth (ORCID)
- `SYSTEM_MATCHED` — Strong evidence by system
- `AUTHOR_CLAIMED` — Self-declared
- `EDITORIALLY_VERIFIED` — Verified by human editor
- `REVIEW_REQUIRED`, `DISPUTED`, `REJECTED`

---

## 11. AI FEATURES (Existing)

### 11.1 AI Reviewer

- Initial manuscript screening
- Outputs: novelty rating, methodology rating, clarity rating, confidence score
- Provider: Gemini 1.5 Flash (via 9Router/OpenRouter/Google)
- Governance: Advisory only, never blocks human workflow
- Access: editor, admin, super_admin

### 11.2 AI Review Enhancement

- Enhances completed HUMAN review reports
- Deterministic (no LLM dependency)
- Advisory output with severity levels (0/1/2)
- Access: editor, admin, super_admin

### 11.3 Reviewer Matching

- Deterministic scoring: expertise (50%), availability (20%), workload (30%)
- READ-ONLY: never auto-assigns

### 11.4 AI Chatbot (APASIFIC AI)

- Research & Publishing Assistant
- Phase 1: Public knowledge only
- Login required
- History stored in `ai_chat_messages` table

---

## 12. PLATFORM FEATURES

### 12.1 Certifications

- CBT exam system
- Candidate registration (ID: `C-XXXXXXXX`)
- Exam sessions with access codes
- Credential issuance (ID: `APASIFIC-CERT-{YEAR}-{6hex}`)
- 3-year validity, renewable

### 12.2 Bookstore

- Book catalog (searchable by title/author)
- Category filtering
- Checkout flow

### 12.3 Social Sharing

- Facebook, WhatsApp, Instagram, TikTok
- HD Story poster generator (1080x1920)
- QR code generation
- Pre-built caption with hashtags

### 12.4 OAI-PMH

- Base URL: `/api/oai`
- Dublin Core metadata format
- Published articles only
- Public, unauthenticated

### 12.5 Notification System

All notifications via WhatsApp (Fonnte API):
- Submission confirmation
- Reviewer invitations
- Editorial decisions
- Revision requests
- Final review notifications

---

## 13. IMPORTANT TERMINOLOGY

| Term | Definition |
|------|------------|
| APASIFIC | Association of Asia Pacific Academician |
| Diamond Open Access | Free to publish, free to read (no APC) |
| Double Blind | Reviewer doesn't know author, author doesn't know reviewer |
| LoA | Letter of Acceptance |
| ORCID | Open Researcher and Contributor ID |
| DOI | Digital Object Identifier |
| CRediT | Contributor Roles Taxonomy |
| CBT | Computer-Based Testing (for certifications) |
| ASIA Index | APASIFIC's own indexing/citation tracking system |
| Publication Federation | Orchestrated deposit to Zenodo/Crossref/ORCID/OpenAIRE |
| Submission Lifecycle | State machine controlling all status transitions |
| Event Ledger | Append-only audit trail of all submission events |
| Desk Reject | Rejection before peer review (editorial triage) |
| Manuscript | The article/paper submitted for publication |
| Galley | Final formatted version for publication |

---

## 14. VERIFIED FACTS (from codebase)

1. APASIFIC has 18 journals (2 seeded + 16 AJxx)
2. All ISSNs are currently placeholders or in queue
3. Volume 1 starts in 2026
4. Diamond Open Access — NO publication charges
5. Double-blind peer review
6. ORCID is required for corresponding authors
7. WhatsApp is the primary notification channel
8. AI is advisory-only (never makes editorial decisions)
9. Published articles are indexed via OAI-PMH
10. DOIs are immutable once assigned
11. LoA official date = acceptance date from submission_history
12. All public endpoints filter by status = 'Published'

---

## 15. DO NOT CLAIM (Unknown / Unverified)

The following information is NOT verified from the codebase. AI should NOT make claims about these:

1. Specific number of published articles (data-dependent)
2. Specific journal impact factors (not tracked in codebase)
3. Exact APC policy history (current: no APC, but historical unknown)
4. Conference schedules or upcoming events
5. Specific reviewer identities or counts
6. Individual submission statuses (requires authenticated access)
7. Financial data or membership revenue
8. Partnership agreements with other institutions
9. SINTA/Scopus/WoS accreditation status for individual journals
10. Any information not explicitly found in this knowledge map

---

## 16. VERSION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-09-03 | Initial knowledge map from full codebase audit |
