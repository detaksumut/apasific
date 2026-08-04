# IAEP SEI-07A — RJRAKP Research Intelligence Architecture

**Document ID:** IAEP-SEI-07A-2026-08-03
**Phase:** SEI-07A RJRAKP Research Intelligence Architecture Definition
**Date:** 2026-08-03
**Status:** 📘 DOCUMENTED (architecture definition)
**Change Policy:** Architecture Review Required
**Authority:** IAEP Architecture Review Board
**Classification:** Documentation only — no authentication, Identity, RBAC, or proxy changes.

---

## 1. RJRAKP Bounded Context

### 1.1 Critical Boundary

```
ASIA  = Publisher + Peer Review Authority
External Providers = Evidence Sources
Evidence Repository = Single source for intelligence input
RJRAKP = Analytics, Ranking, Scoring, Research Intelligence
```

### 1.2 Role of RJRAKP

RJRAKP is the **Scholarly Intelligence and Research Evaluation Layer** of IAEP. It transforms the consolidated, immutable evidence from the `ExternalEvidenceRepository` into:

- **Analytics** — research impact, visibility, and performance analytics.
- **Ranking** — journal/article ranking and evaluation.
- **Scoring** — article quality, research impact, author influence, institution metrics.
- **Research Intelligence** — insights for editorial/outreach decisions and national evaluation.

### 1.3 What RJRAKP Is NOT

| Prohibition | Rationale |
|-------------|-----------|
| **Never calls external providers directly** | All provider interaction lives in SEI adapters behind `ProviderRuntimeManager`; RJRAKP reads only the evidence repository |
| **Never overrides ASIA peer review** | RJRAKP provides insights; editorial/peer-review authority stays with ASIA |
| **Never creates publication decisions** | RJRAKP cannot accept/reject/publish; that is ASIA's authority |
| **Never replaces DOI/index providers** | RJRAKP consumes DOI/index evidence; it does not register DOIs or index content |

### 1.4 Ownership

- **RJRAKP owns:** scoring models, ranking logic, metrics, explainability, and intelligence presentation.
- **RJRAKP does NOT own:** evidence capture (SEI), provider adapters (SEI), editorial authority (ASIA), or identity (Identity Core).

---

## 2. Evidence Consumption Model

### 2.1 Single Input Source

> **RJRAKP consumes only: `ExternalEvidenceRepository`.**

```
ExternalEvidenceRepository
  ├── external_publication_records
  ├── external_evidence_payloads
  ├── external_discovery_records
  └── submissions.index_status (aggregated visibility)
        ↓
RJRAKP Intelligence Layer (read-only consumption)
```

### 2.2 Consumption Rules

1. **Read-only** — RJRAKP reads evidence; it never mutates provider evidence or domain state.
2. **Hash-verified** — only hash-verified snapshots are consumed; a hash mismatch excludes the evidence.
3. **Provider-attributed** — every signal retains its source provider; RJRAKP never anonymizes attribution.
4. **No direct provider access** — RJRAKP has no provider client; it only reads the repository.
5. **No fabricated input** — RJRAKP computes from real evidence only; no mock or synthesized metrics.

---

## 3. Article Quality Scoring Architecture

### 3.1 Purpose

Article quality scoring synthesizes **evidence-based signals** into a defensible quality score for an article. It does **not** replace peer review — it is a derived, evidence-grounded indicator.

### 3.2 Input Signals (from evidence repository)

| Signal | Source Evidence | Evidence Type |
|--------|-----------------|---------------|
| DOI registration | Crossref / Zenodo | `PUBLISHER_DOI` / `PUBLICATION` |
| Repository deposit | Zenodo | `PUBLICATION` / `DATASET` |
| Discovery presence | OpenAIRE | `DiscoveryEvidenceSnapshot` |
| Citation count | OpenAlex | `CITATION` |
| Indexing status | Zenodo / OpenAIRE | aggregated `index_status` |
| Author identity | ORCID / SINTA | `IDENTITY` |

### 3.3 Scoring Model

```
Article Quality Score = f(DOI integrity, discovery presence,
                         citation count, indexing status,
                         author identity verification, repository deposit)
```

- **Weighted, evidence-driven** — each factor maps to a real evidence field.
- **Confidence-weighted** — factors with higher confidence (verified, corroborated) contribute more.
- **Transparent** — the score is decomposable into per-factor contributions (explainability, §8).

### 3.4 Rules

- Score is **derived**, never a peer-review override.
- Score is **recomputable** from evidence; it is not stored as a fabricated static metric.
- No article quality score is produced without underlying evidence.

---

## 4. Research Impact Scoring

### 4.1 Purpose

Research impact scoring measures the scholarly footprint of an article/researcher using **citation and discovery evidence** from the repository.

### 4.2 Input Signals

| Signal | Source Evidence |
|--------|-----------------|
| Citation count | OpenAlex `CITATION` |
| Cited-by | Crossref / OpenAIRE relations |
| Discovery breadth | OpenAIRE / Zenodo / Google Scholar |
| Recency | `verifiedAt` / `sourceTimestamp` |

### 4.3 Scoring Model

```
Research Impact Score = g(citation_count, discovery_breadth,
                         cited_by_relations, recency)
```

- **Normalized** across comparable articles/time windows.
- **Attributed** to the source provider for each citation.
- **Confidence-weighted** by evidence verification.

### 4.4 Rules

- Impact is computed from **real provider evidence**; no fabricated citations.
- Impact is a **projection** — RJRAKP never creates or modifies citation records.
- Impact scoring is **explainable** and attributable to source evidence.

---

## 5. Author Influence Metrics

### 5.1 Purpose

Author influence metrics evaluate a researcher's scholarly influence using **identity, publication, and citation evidence**.

### 5.2 Input Signals

| Signal | Source Evidence | Evidence Type |
|--------|-----------------|---------------|
| Author identity verification | ORCID / SINTA | `IDENTITY` |
| Publication count | Repository / DOI evidence | `PUBLICATION` / `PUBLISHER_DOI` |
| Citation count | OpenAlex | `CITATION` |
| Evaluation signals | SINTA | `IMPACT_METRIC` / `INSTITUTION` |

### 5.3 Metric Model

```
Author Influence = h(identity_verification, publication_count,
                     citation_count, evaluation_signals)
```

- **Identity-linked** — metrics are tied to an existing IAEP identity (via `apasificIdentityId`); never creates a new identity.
- **Evidence-attributed** — each metric traces to a source provider.
- **Confidence-weighted** — verified identity and citations carry more weight.

### 5.4 Rules

- Author metrics are **read-only intelligence**; they never alter identity or roles.
- Metrics are **explainable** — each contribution maps to a specific evidence record.
- No fabricated author metrics; only real identity/citation evidence.

---

## 6. Institution Research Metrics

### 6.1 Purpose

Institution research metrics aggregate research output and impact for an institution (affiliation) using repository evidence.

### 6.2 Input Signals

| Signal | Source Evidence |
|--------|-----------------|
| Author affiliations | ORCID / SINTA / publication metadata |
| Publication output | DOI / repository evidence |
| Citation impact | OpenAlex |
| Evaluation signals | SINTA `INSTITUTION` |

### 6.3 Metric Model

```
Institution Research Metric = i(affiliation_evidence, publication_output,
                                citation_impact, evaluation_signals)
```

- **Institution-level aggregation** of per-author/publication evidence.
- **Provider-attributed** — institution signals trace to SINTA/ORCID evidence.
- **Explanable** — breakdown available per institution, per signal.

### 6.4 Rules

- Institution metrics are **aggregations** of real evidence; never fabricated.
- Identity boundary preserved — institution data links to existing IAEP identities/affiliations.
- No institution ranking is produced without underlying evidence.

---

## 7. Ranking Governance

### 7.1 Purpose

Ranking governance defines **how** RJRAKP produces rankings and **who governs** them to ensure fairness, transparency, and authority boundaries.

### 7.2 Governance Model

```
Evidence Repository
        ↓
RJRAKP Ranking Engine (deterministic, evidence-based)
        ↓
Ranking Output (transparent, explainable)
        ↓
Governance Review (Architecture Review Board / editorial oversight)
```

### 7.3 Governance Rules

1. **Deterministic** — rankings are reproducible from the same evidence snapshot.
2. **Evidence-based** — rankings derive only from the evidence repository; no provider bypass.
3. **Explainable** — every ranking position is decomposable into its scoring factors.
4. **Authority boundary** — rankings are **insights**, not editorial decisions; they never accept/reject publications.
5. **Versioned** — ranking model versions are recorded so changes are auditable.
6. **Auditable** — ranking outputs are traced to the evidence and model version that produced them.

### 7.4 Prohibited Uses

- Rankings must not be used to override ASIA peer review.
- Rankings must not create publication decisions.
- Rankings must not replace DOI/index provider functions.

---

## 8. Explainability Requirements

### 8.1 Principle

Every RJRAKP output (score, ranking, metric) must be **explainable** — traceable to the specific evidence and model factors that produced it.

### 8.2 Requirements

| Requirement | Description |
|-------------|-------------|
| **Factor decomposition** | Each output decomposes into its contributing factors |
| **Source attribution** | Each factor maps to a named provider evidence record |
| **Confidence disclosure** | Each factor carries its confidence level |
| **Hash verification** | Each factor is tied to a hash-verified payload |
| **Model versioning** | The scoring model version is recorded with the output |
| **Audit trail** | Outputs are reproducible from the same evidence snapshot |

### 8.3 Why Explainability Matters

- **Trust** — editorial and evaluation stakeholders can verify why a score/ranking was produced.
- **Compliance** — meets national evaluation transparency expectations.
- **Irrelevance of fabrication** — with full traceability, no fabricated metric can stand.

---

## 9. No Provider Direct Access Rule

### 9.1 Rule

> **RJRAKP must never call external providers directly.**

### 9.2 Enforcement

```
SEI Provider Adapters → ProviderRuntimeManager → External Providers
        ↓  (evidence snapshots)
ExternalEvidenceRepository
        ↓  (read-only)
RJRAKP Intelligence Layer   ← NO provider client, NO direct fetch
```

- RJRAKP has **no provider adapter**, **no API client**, and **no direct fetch**.
- All provider interaction remains in SEI (SEI-06A–06G) behind `ProviderRuntimeManager`.
- RJRAKP consumes **only** the `ExternalEvidenceRepository`.

### 9.3 Consequences of Violation

A direct provider call from RJRAKP would:
- Bypass `ProviderRuntimeManager` (timeout/retry/trace/hashing).
- Circumvent evidence capture and auditability.
- Risk identity/authority bypass.
- Break the frozen SEI boundary and governance model.

---

## 10. Future AI Intelligence Layer

### 10.1 Vision

A future **AI Intelligence Layer** may enhance RJRAKP with:
- **Natural-language insights** — summarize evidence-driven findings.
- **Ambiguity-aware analysis** — detect low-confidence evidence.
- **Trend prediction** — suggest emerging research topics from evidence.
- **Anomaly detection** — flag fabricated/inconsistent evidence.

### 10.2 Constraints (must hold)

- AI consumes **only** the `ExternalEvidenceRepository` — never direct provider access.
- AI outputs are **advice**, never editorial decisions or publication decisions.
- AI cannot override ASIA peer review.
- AI cannot replace DOI/index providers.
- AI outputs must be **explainable** and traceable to evidence.
- No fabricated metrics — AI augments, never invents, evidence.
- Identity boundary preserved — AI never creates IAEP users/roles.

### 10.3 Governance

Any AI layer is introduced only after:
- Architecture Review Board approval.
- A dedicated ADR.
- Decision/ranking governance alignment (§7).
- Explainability certification (§8).

---

## 11. Rules Compliance Summary

| Rule | Status |
|------|--------|
| RJRAKP never calls external providers directly | ✅ CONFIRMED |
| RJRAKP never overrides ASIA peer review | ✅ CONFIRMED |
| RJRAKP never creates publication decisions | ✅ CONFIRMED |
| RJRAKP never replaces DOI/index providers | ✅ CONFIRMED |
| RJRAKP consumes only `ExternalEvidenceRepository` | ✅ CONFIRMED |

---

## 12. Validation & Scope Confirmation

### 12.1 Protected Boundaries

| Component | Status |
|-----------|--------|
| Authentication Boundary | ✅ UNTOUCHED (FROZEN) |
| Identity Core | ✅ UNTOUCHED |
| RBAC | ✅ UNTOUCHED |
| `src/proxy.ts` | ✅ UNTOUCHED |

### 12.2 Scope

| Requirement | Status |
|-------------|--------|
| RJRAKP bounded context | ✅ CONFIRMED (§1) |
| Evidence consumption model | ✅ CONFIRMED (§2) |
| Article quality scoring architecture | ✅ CONFIRMED (§3) |
| Research impact scoring | ✅ CONFIRMED (§4) |
| Author influence metrics | ✅ CONFIRMED (§5) |
| Institution research metrics | ✅ CONFIRMED (§6) |
| Ranking governance | ✅ CONFIRMED (§7) |
| Explainability requirements | ✅ CONFIRMED (§8) |
| No provider direct access rule | ✅ CONFIRMED (§9) |
| Future AI intelligence layer | ✅ CONFIRMED (§10) |

---

## 13. Closure Statement

```
SEI-07A RJRAKP RESEARCH INTELLIGENCE ARCHITECTURE
Status: DOCUMENTED

Bounded context: ASIA = Publisher + Peer Review Authority
                 External Providers = Evidence Sources
                 Evidence Repository = Single source for intelligence input
                 RJRAKP = Analytics, Ranking, Scoring, Research Intelligence

Consumption:     RJRAKP consumes ONLY ExternalEvidenceRepository
Prohibitions:    Never calls providers directly; never overrides ASIA
                 peer review; never creates publication decisions;
                 never replaces DOI/index providers
Scoring:         Article quality, research impact, author influence,
                 institution metrics — all evidence-based, explainable
Governance:      Deterministic, versioned, auditable, transparent
Explainability:  Factor decomposition, source attribution, confidence,
                 hash verification, model versioning
Future AI:       Evidence-only, advisory, explainable, governed
Boundaries:      Auth FROZEN, Identity Core/RBAC/proxy.ts untouched
```

*Architecture Definition Artifact — IAEP SEI-07A RJRAKP Research Intelligence Layer.*  
*RJRAKP is the scholarly intelligence and research evaluation layer, consuming only the consolidated evidence repository.*
