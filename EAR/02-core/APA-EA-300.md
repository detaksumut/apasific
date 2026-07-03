---
Document ID: APA-EA-300
Title: Enterprise Data Architecture
Version: 1.0.0
Status: Frozen
Owner: Architecture Board
Reviewer: Chief Enterprise Architect
Classification: Internal
---

# APA-EA-300 Enterprise Data Architecture

This document defines the high-level Domain Models and Entity Relationships for APASIFIC ONE. It focuses on the conceptual and logical data architecture (the "Entities") before moving into physical Entity-Relationship Diagrams (ERDs) or database schemas.

---

## 1. Domain Model Overview

The data architecture is centered entirely around the **Academic Identity**, which acts as the root node for all other domains.

`mermaid
graph TD
    AI((Academic Identity))
    
    AI -->|Affiliated with| INS[Institution Domain]
    AI -->|Holds| MEM[Membership Domain]
    AI -->|Authors / Reviews| PUB[Publication Domain]
    AI -->|Earns / Assesses| CERT[Certification Domain]
    AI -->|Attends / Speaks| CONF[Conference Domain]
    AI -->|Receives| AWD[Award Domain]
    AI -->|Collaborates in| RES[Research Domain]
`

---

## 2. Core Domain Entities

### 2.1 Academic Identity Domain (Master Data)
The central source of truth for a person within the ecosystem.
- **UserAccount**: Authentication credentials, SSO references, 2FA status.
- **AcademicIdentity**: Core profile (Name, Titles, ORCID, Scopus ID, Bio).
- **AcademicQualification**: Degrees earned, graduation years, fields of study.
- **ProfessionalExperience**: Work history, academic ranks (e.g., Professor).
- **CapabilityProfile**: Dynamically calculated traits by the Capability Engine.

### 2.2 Institution Domain (Master Data)
- **Institution**: Universities, Research Centers, Corporations.
- **Faculty/Department**: Sub-divisions within institutions.
- **Country/Region**: Geopolitical mapping for Chapters.

### 2.3 Membership Domain
- **MembershipRecord**: Membership ID, tier, join date, expiry date.
- **ChapterAffiliation**: Local or national chapter binding.
- **PaymentTransaction**: Invoices and receipts for renewals.

### 2.4 Publication Domain
- **Journal**: Journal metadata, ISSN, Editorial Board mapping.
- **Manuscript (Submission)**: Title, abstract, keywords, current workflow state.
- **AuthorContribution**: Linking Academic Identity to a Manuscript (First Author, Corresponding).
- **PeerReview**: Blinded evaluation scores, comments, reviewer identity link.
- **Issue/Volume**: Publishing collections.

### 2.5 Certification Domain
- **CompetencyStandard**: The rubric and requirements.
- **CertificationScheme**: Rules for acquiring the standard.
- **ExamAttempt**: CBT scores, timestamps, proctor logs.
- **AssessmentInterview**: Assessor notes, final grading.
- **CredentialRegistry**: The public immutable record of certification issuance.

### 2.6 Conference Domain
- **Event**: Conference dates, venues, themes.
- **CallForPaper**: Abstract submissions, track routing.
- **Ticket/Registration**: Attendance records.
- **Session**: Speakers, schedules, rooms.

### 2.7 Award & Research Domains
- **GrantProposal**: Research funding requests, budgets, principal investigators.
- **Nomination**: Award candidates, supporting evidence.

---

## 3. Shared Application Data Services

Data structures required by the ecosystem-wide Shared Services (APA-EA-400).

### 3.1 Document Center Domain
- **DocumentNode**: Unified file record (UUID, MIME type, storage bucket URL).
- **DocumentContext**: What the document is for (e.g., "Manuscript Revision", "BOC Certificate").

### 3.2 Notification & Timeline Domain
- **ActivityEvent**: Immutable ledger of user actions (e.g., User Submitted Paper, User Paid Dues).
- **NotificationLog**: Dispatch status (Email Sent, Push Delivered, Read Receipt).

### 3.3 Workflow State Engine
- **WorkflowInstance**: Tracks a specific entity (e.g., Manuscript ID #102) through its defined state machine.
- **TransitionHistory**: Log of who moved the state, when, and why.

---

## 4. Entity Lifecycle & Data Retention

- **Master Data (Academic Identity)**: Retained indefinitely to preserve the "Lifetime Academic Portfolio".
- **Transactional Data (Payments, Logs)**: Archived after 7 years for compliance.
- **Orphaned Submissions**: Purged after 24 months of inactivity.
- **Data Privacy**: PII (Personally Identifiable Information) strictly governed by regional compliance (e.g., GDPR equivalent policies).
