# IAEP SEI-07B — RJRAKP Scoring and Metrics Governance

**Document ID:** IAEP-SEI-07B-2026-08-03
**Phase:** SEI-07B RJRAKP Scoring and Metrics Governance
**Date:** 2026-08-03
**Status:** 📘 DOCUMENTED (architecture definition)
**Change Policy:** Architecture Review Required
**Authority:** IAEP Architecture Review Board
**Classification:** Documentation only — no authentication, Identity, RBAC, or proxy changes.

---

## 1. Governance Model Overview

This document defines the **governance model** for RJRAKP scoring, ranking, and research metrics. It specifies the scoring models, metric weights, versioning strategy, explainability requirements, audit trail, bias prevention, and ranking change governance.

### 1.1 Governing Principle

> **RJRAKP scores are analytical insights only.**

RJRAKP never:
- decides publication acceptance,
- overrides peer review,
- replaces SINTA,
- replaces Scopus/Web of Science,
- modifies provider evidence.

### 1.2 Input Source

> **RJRAKP consumes only: `ExternalEvidenceRepository`.**

No direct provider access. All scoring is a projection of immutable, hash-verified evidence.

### 1.3 Protected Boundaries

| Component | Status |
|-----------|--------|
| Authentication Boundary | ✅ UNTOUCHED (FROZEN) |
| Identity Core | ✅ UNTOUCHED |
| RBAC | ✅ UNTOUCHED |
| `src/proxy.ts` | ✅ UNTOUCHED |

---

## 2. Article Quality Score Model

### 2.1 Purpose

The **Article Quality Score (AQS)** synthesizes evidence-based signals into a defensible quality indicator for an article. It is derived, evidence-grounded, and never a peer-review override.

### 2.2 Factors

| Factor | Signal | Source Evidence |
|--------|--------|-----------------|
| DOI integrity | DOI registered & resolves | Crossref / Zenodo |
| Discovery presence | Found in research graph | OpenAIRE |
| Citation count | Citations received | OpenAlex |
| Indexing status | Visible in index | Zenodo / OpenAIRE |
| Author identity | Verified author identity | ORCID / SINTA |
| Repository deposit | Deposited & published | Zenodo |

### 2.3 Model

```
AQS = Σ (w_i × f_i)  for factors i=1..6
```

where `w_i` are weights (see §6) and `f_i` are normalized, confidence-weighted factor values.

### 2.4 Rules

- AQS is **derived**, never a peer-review override.
- AQS is **recomputable** from evidence; not a fabricated static metric.
- No AQS without underlying evidence.

---

## 3. Research Impact Score Model

### 3.1 Purpose

The **Research Impact Score (RIS)** measures scholarly footprint using citation and discovery evidence.

### 3.2 Factors

| Factor | Signal | Source Evidence |
|--------|--------|-----------------|
| Citation count | Citations received | OpenAlex |
| Cited-by | Cited-by relations | Crossref / OpenAIRE |
| Discovery breadth | Discovery presence | OpenAIRE / Zenodo / Google Scholar |
| Recency | Evidence recency | `verifiedAt` / `sourceTimestamp` |

### 3.3 Model

```
RIS = Σ (w_j × g_j)  for factors j=1..4
```

- Normalized across comparable articles/time windows.
- Attributed to the source provider for each citation.
- Confidence-weighted by evidence verification.

### 3.4 Rules

- RIS is computed from **real provider evidence**; no fabricated citations.
- RIS is a **projection**; RJRAKP never creates or modifies citation records.
- RIS is explainable and attributable to source evidence.

---

## 4. Author Influence Score Model

### 4.1 Purpose

The **Author Influence Score (AIS)** evaluates a researcher's scholarly influence using identity, publication, and citation evidence.

### 4.2 Factors

| Factor | Signal | Source Evidence |
|--------|--------|-----------------|
| Identity verification | Verified author identity | ORCID / SINTA |
| Publication count | Publications linked | DOI / repository evidence |
| Citation count | Citations received | OpenAlex |
| Evaluation signals | National evaluation | SINTA |

### 4.3 Model

```
AIS = Σ (w_k × h_k)  for factors k=1..4
```

- Identity-linked to an existing IAEP identity; never creates a new identity.
- Evidence-attributed; each metric traces to a source provider.
- Confidence-weighted (verified identity/citations carry more weight).

### 4.4 Rules

- AIS is read-only intelligence; never alters identity or roles.
- AIS is explainable; each contribution maps to a specific evidence record.
- No fabricated author metrics.

---

## 5. Institution Research Score Model

### 5.1 Purpose

The **Institution Research Score (IRS)** aggregates research output and impact for an institution using repository evidence.

### 5.2 Factors

| Factor | Signal | Source Evidence |
|--------|--------|-----------------|
| Author affiliations | Affiliation evidence | ORCID / SINTA / publication metadata |
| Publication output | Publications linked | DOI / repository evidence |
| Citation impact | Citations received | OpenAlex |
| Evaluation signals | National evaluation | SINTA |

### 5.3 Model

```
IRS = Σ (w_m × i_m)  for factors m=1..4
```

- Institution-level aggregation of per-author/publication evidence.
- Provider-attributed; institution signals trace to SINTA/ORCID evidence.
- Explainable breakdown per institution, per signal.

### 5.4 Rules

- IRS is an aggregation of real evidence; never fabricated.
- Identity boundary preserved; institution data links to existing IAEP identities/affiliations.
- No institution ranking without underlying evidence.

---

## 6. Metric Weights

### 6.1 Weighting Principles

- Weights are **declared** and **versioned** (never implicit).
- Weights are **evidence-driven**: confidence-weighted factors contribute more.
- Weights are **explainable**: each score's weight map is recorded with the output.
- Weights are **subject to governance**: changes require Architecture Review.

### 6.2 Default Weight Table (v1.0)

| Model | Factor | Default Weight |
|-------|--------|:---:|
| **AQS** | DOI integrity | 0.20 |
| | Discovery presence | 0.15 |
| | Citation count | 0.25 |
| | Indexing status | 0.15 |
| | Author identity | 0.10 |
| | Repository deposit | 0.15 |
| **RIS** | Citation count | 0.40 |
| | Cited-by | 0.25 |
| | Discovery breadth | 0.20 |
| | Recency | 0.15 |
| **AIS** | Identity verification | 0.25 |
| | Publication count | 0.25 |
| | Citation count | 0.30 |
| | Evaluation signals | 0.20 |
| **IRS** | Author affiliations | 0.20 |
| | Publication output | 0.30 |
| | Citation impact | 0.30 |
| | Evaluation signals | 0.20 |

> Weights are versioned. Any change to a weight bumps the model version (see §7).

### 6.3 Weight Governance Rules

- Weights sum to 1.0 per model.
- Weights are applied to **normalized, confidence-weighted** factor values.
- No weight may be zeroed to hide a factor; no factor may be over-weighted to dominate a model.
- Weight changes are recorded in the model version and audit trail.

---

## 7. Versioning Strategy

### 7.1 Model Versioning

Each scoring model is **versioned**:

```
<Model>-<Major>.<Minor>
```

- **Major** bump: breaking change (new factor, removed factor, weight redistribution > threshold).
- **Minor** bump: non-breaking adjustment (tuning, normalization change).

### 7.2 Versioning Rules

| Rule | Description |
|------|-------------|
| **Versioned** | Every score, ranking, and metric output records the model version that produced it |
| **Reproducible** | Same evidence snapshot + same model version → same output |
| **Auditable** | Version changes are logged with rationale and date |
| **Backward-traceable** | Historical outputs are reproducible from the recorded version + evidence snapshot |
| **Governed** | Breaking changes require Architecture Review Board approval |

### 7.3 Default Versions (v1.0)

| Model | Version |
|-------|:---:|
| Article Quality Score (AQS) | v1.0 |
| Research Impact Score (RIS) | v1.0 |
| Author Influence Score (AIS) | v1.0 |
| Institution Research Score (IRS) | v1.0 |

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
| **Model versioning** | The model version is recorded with the output |
| **Weight transparency** | The weight map used is recorded with the output |
| **Audit trail** | Outputs are reproducible from the same evidence snapshot |

### 8.3 Why Explainability Matters

- **Trust** — stakeholders can verify why a score/ranking was produced.
- **Compliance** — meets national evaluation transparency expectations.
- **Irrelevance of fabrication** — with full traceability, no fabricated metric can stand.

---

## 9. Audit Trail

### 9.1 Purpose

The audit trail provides a **durable, verifiable record** of every RJRAKP computation, input, and output.

### 9.2 Audit Capture

| Item | Captured |
|------|----------|
| Input evidence | Hash-verified evidence snapshot used |
| Model version | Version used to compute |
| Weight map | Weight configuration applied |
| Output | Computed score/ranking/metric |
| Timestamp | When computed |
| Trigger | What invoked the computation (publication event, manual refresh, scheduled job) |
| Actor | Authorized identity that triggered it (where applicable) |

### 9.3 Audit Rules

- All RJRAKP outputs are **persisted** to the audit trail (immutable).
- No RJRAKP output is produced without an audit record.
- Audit records are **reproducible** — same evidence + version + weights → same output.
- Audit records are **read-only**; no fabrication, no retroactive modification.

---

## 10. Bias Prevention

### 10.1 Purpose

Bias prevention ensures RJRAKP scoring, ranking, and metrics are **fair, transparent, and free from systematic distortion**.

### 10.2 Bias Prevention Rules

| Rule | Description |
|------|-------------|
| **Evidence-bound** | Scores derive only from real, hash-verified evidence; no fabricated/substituted metrics |
| **Confidence-weighted** | Low-confidence evidence contributes less; never extrapolated into high confidence |
| **Provider-attributed** | Every signal is attributed to its source provider; no anonymized or invented provider |
| **Normalized** | Scores are normalized across comparable article/time windows to avoid skew |
| **No over-weighting** | No single factor may dominate a model to bias outcomes |
| **Limited autonomy** | RJRAKP is analytical only; it cannot alter peer review, acceptance, or provider evidence |
| **Bias audit** | Periodic bias review of model outputs and weights for systematic distortion |

### 10.3 Prohibited Behaviors

- Fabricating citations/impact to inflate scores.
- Zeroing weights to hide unfavorable factors.
- Attributing a signal to a false provider.
- Using RJRAKP scores to override peer review or acceptance decisions.
- Replacing SINTA or Scopus/Web of Science evaluation authority.

---

## 11. Ranking Change Governance

### 11.1 Purpose

Ranking change governance defines **how** RJRAKP rankings are produced and **what triggers** a ranking change, ensuring determinism and transparency.

### 11.2 Ranking Model

```
Evidence Repository
        ↓
RJRAKP Ranking Engine (deterministic, model-versioned)
        ↓
Ranking Output (explainable, auditable)
        ↓
Governance Review (on change)
```

### 11.3 Change Triggers

A ranking change is governed when:

| Trigger | Description |
|---------|-------------|
| **New evidence** | New hash-verified evidence enters the repository |
| **Model update** | Model version or weights change |
| **Normalization change** | Comparison window or normalization changes |
| **Bias remediation** | A bias finding triggers a model correction |

### 11.4 Change Governance Rules

| Rule | Description |
|------|-------------|
| **Deterministic** | Rankings are reproducible from the same evidence + model version |
| **Evidence-based** | Rankings derive only from the evidence repository; no provider bypass |
| **Explainable** | Every ranking position decomposes into its scoring factors |
| **Versioned** | Model version is recorded with the ranking |
| **Auditable** | Ranking outputs trace to the evidence and model version that produced them |
| **Authority boundary** | Rankings are insights, never editorial/acceptance decisions |

### 11.5 Prohibited Uses

- Rankings must not override ASIA peer review.
- Rankings must not decide publication acceptance.
- Rankings must not replace SINTA or Scopus/Web of Science.
- Rankings must not modify provider evidence.

---

## 12. Rules Compliance Summary

| Rule | Status |
|------|--------|
| RJRAKP scores are analytical insights only | ✅ CONFIRMED |
| RJRAKP never decides publication acceptance | ✅ CONFIRMED |
| RJRAKP never overrides peer review | ✅ CONFIRMED |
| RJRAKP never replaces SINTA | ✅ CONFIRMED |
| RJRAKP never replaces Scopus/Web of Science | ✅ CONFIRMED |
| RJRAKP never modifies provider evidence | ✅ CONFIRMED |
| RJRAKP consumes only `ExternalEvidenceRepository` | ✅ CONFIRMED |
| No direct provider access | ✅ CONFIRMED |

---

## 13. Validation & Scope Confirmation

### 13.1 Scope

| Requirement | Status |
|-------------|--------|
| Article Quality Score model | ✅ CONFIRMED (§2) |
| Research Impact Score model | ✅ CONFIRMED (§3) |
| Author Influence Score model | ✅ CONFIRMED (§4) |
| Institution Research Score model | ✅ CONFIRMED (§5) |
| Metric weights | ✅ CONFIRMED (§6) |
| Versioning strategy | ✅ CONFIRMED (§7) |
| Explainability requirements | ✅ CONFIRMED (§8) |
| Audit trail | ✅ CONFIRMED (§9) |
| Bias prevention | ✅ CONFIRMED (§10) |
| Ranking change governance | ✅ CONFIRMED (§11) |

### 13.2 Protected Boundaries

| Component | Status |
|-----------|--------|
| Authentication Boundary | ✅ UNTOUCHED (FROZEN) |
| Identity Core | ✅ UNTOUCHED |
| RBAC | ✅ UNTOUCHED |
| `src/proxy.ts` | ✅ UNTOUCHED |

### 13.3 Files Changed

| File | Action |
|------|--------|
| `docs/IAEP-SEI-07B-RJRAKP-Scoring-Metrics-Governance.md` | CREATED (this document) |
| `docs/IAEP-Architecture-Certification-Registry.md` | UPDATED (registry entry) |
| `TODO.md` | UPDATED |

---

## 14. Closure Statement

```
SEI-07B RJRAKP SCORING AND METRICS GOVERNANCE
Status: DOCUMENTED

Models:        AQS (Article Quality), RIS (Research Impact),
               AIS (Author Influence), IRS (Institution Research)
Weights:       Declared, versioned, sum-to-1.0 per model
Versioning:    <Model>-<Major>.<Minor>; reproducible & auditable
Explainability: Factor decomposition, source attribution, confidence,
               hash verification, model versioning, weight transparency
Audit trail:   Immutable, reproducible, read-only
Bias prevention: Evidence-bound, confidence-weighted, provider-attributed,
               normalized, no over-weighting, limited autonomy
Ranking change: Deterministic, evidence-based, versioned, auditable,
               authority-boundary enforced

Governing rules:
  RJRAKP scores are analytical insights only.
  RJRAKP never decides publication acceptance.
  RJRAKP never overrides peer review.
  RJRAKP never replaces SINTA.
  RJRAKP never replaces Scopus/Web of Science.
  RJRAKP never modifies provider evidence.
  RJRAKP consumes only ExternalEvidenceRepository.
  No direct provider access.

Boundaries:    Auth FROZEN, Identity Core/RBAC/proxy.ts untouched.
```

*Architecture Definition Artifact — IAEP SEI-07B RJRAKP Scoring and Metrics Governance.*  
*RJRAKP scores are analytical insights only — governed, versioned, explainable, and evidence-bound.*
