# IAEP SEI-07C — RJRAKP Explainability and Audit Architecture

**Document ID:** IAEP-SEI-07C-2026-08-04
**Phase:** SEI-07C RJRAKP Explainability and Audit Architecture
**Date:** 2026-08-04
**Status:** 📘 DOCUMENTED (architecture definition)
**Change Policy:** Architecture Review Required
**Authority:** IAEP Architecture Review Board
**Classification:** Documentation only — no authentication, Identity, RBAC, or proxy changes.

---

## 1. Purpose and Scope

### 1.1 Purpose

SEI-07C is the **enforcement architecture** of the RJRAKP Research Intelligence Layer. SEI-07A defined the RJRAKP bounded context and what it computes; SEI-07B defined the governance rules for scoring, ranking, and metrics. SEI-07C defines the concrete, enforceable mechanisms — data models, service contracts, persistence contracts, and workflow rules — that make the SEI-07A boundaries and SEI-07B governance **machine-checkable, auditable, and reproducible**.

### 1.2 Relationship to Prior Phases

```
SEI-06G  Scholarly Evidence Foundation      → immutable, hash-verified evidence repository
SEI-07A  RJRAKP Intelligence Architecture   → what RJRAKP computes; boundaries & prohibitions
SEI-07B  Scoring & Metrics Governance       → rules: models, weights, versioning, audit, bias
SEI-07C  Explainability & Audit Architecture → HOW the rules are enforced (this document)
```

SEI-07C is the prerequisite for:

- **RJRAKP runtime remediation** — a future implementation phase that conforms existing RJRAKP-related code to the runtime boundary contract (§9).
- **Future AI Intelligence Layer readiness** — SEI-07A §10 requires explainability certification and ranking governance alignment before any AI layer may be introduced (§10).

### 1.3 Governing Principles (inherited, unchanged)

> **RJRAKP consumes only: `ExternalEvidenceRepository`.**
> **RJRAKP scores are analytical insights only.**

RJRAKP never:

- calls external providers directly,
- decides publication acceptance,
- overrides ASIA peer review,
- replaces SINTA / Scopus / Web of Science,
- modifies provider evidence.

### 1.4 Scope

| In Scope (architecture definition) | Out of Scope (later phases) |
|------------------------------------|------------------------------|
| Explainability framework | Implementation of scoring/ranking services |
| Score factor decomposition model | Database migrations (audit store creation) |
| Evidence attribution model | API routes / endpoints |
| Confidence model | Provider credential provisioning |
| Audit trail architecture | Refactoring of existing RJRAKP-related code |
| Bias audit architecture | AI intelligence layer implementation (SEI-08 candidate) |
| Ranking governance workflow | Authentication / Identity / RBAC / proxy changes |
| RJRAKP runtime boundary contract | |
| Future AI intelligence readiness | |

### 1.5 Protected Boundaries

| Component | Status |
|-----------|--------|
| Authentication Boundary | ✅ UNTOUCHED (FROZEN) |
| Identity Core | ✅ UNTOUCHED |
| RBAC | ✅ UNTOUCHED |
| `src/proxy.ts` | ✅ UNTOUCHED |

---

## 2. Explainability Framework

### 2.1 Principle

Every RJRAKP output — score, metric, or ranking — must be **decomposable, traceable, verifiable, and reproducible**. SEI-07B §8 stated the explainability requirements; SEI-07C defines the **Explainability Envelope** that enforces them.

### 2.2 The Explainability Envelope

No RJRAKP output may be produced without a complete `ExplainabilityEnvelope`. An output missing any required field is non-explainable and must not be persisted or surfaced.

```ts
interface ExplainabilityEnvelope {
  factorDecomposition: FactorContribution[];  // §3
  sourceAttribution: EvidenceReference[];     // §4
  confidence: ConfidenceAssessment;           // §5
  hashVerification: HashVerification;         // §4.4
  modelVersion: string;                       // SEI-07B §7 (<Model>-<Major>.<Minor>)
  weightMapRef: WeightMapReference;           // SEI-07B §6 (declared, versioned, sum-to-1.0)
  auditRecordId: string;                      // §6
  reproducibilityHash: string;                // §6.4 — deterministic over inputs
}

interface WeightMapReference {
  weightMapId: string;              // versioned weight map identifier
  modelCode: ModelCode;             // AQS | RIS | AIS | IRS
  modelVersion: string;             // the model version the weight map belongs to
  weights: Record<string, number>;  // factorId → weight (sum 1.0)
}
```

### 2.3 Requirement Mapping (SEI-07B §8 → enforcement)

| SEI-07B §8 Requirement | Enforced By |
|------------------------|-------------|
| Factor decomposition | `factorDecomposition` (§3) |
| Source attribution | `sourceAttribution` (§4) |
| Confidence disclosure | `confidence` (§5) |
| Hash verification | `hashVerification` (§4.4) |
| Model versioning | `modelVersion` (SEI-07B §7) |
| Weight transparency | `weightMapRef` (SEI-07B §6) |
| Audit trail | `auditRecordId` (§6) |

### 2.4 Enforcement Rules

1. **No output without an envelope.** A score/metric/ranking returned without a complete `ExplainabilityEnvelope` is a contract violation.
2. **No envelope without evidence.** Every contributing factor in `factorDecomposition` must trace to at least one hash-verified evidence reference (§4.3 rule 1).
3. **No envelope without an audit record.** `auditRecordId` must resolve to a persisted, immutable `AuditRecord` (§6).
4. **Reproducible by construction.** `reproducibilityHash` is deterministic over `(input evidence + model version + weight map)`; a mismatch on recomputation is a defect (§6.4).

---

## 3. Score Factor Decomposition Model

### 3.1 Purpose

The decomposition model renders every score as a transparent sum of weighted, confidence-adjusted, evidence-bound factor contributions, implementing the SEI-07B model equations (`AQS = Σ w_i × f_i`, `RIS = Σ w_j × g_j`, `AIS = Σ w_k × h_k`, `IRS = Σ w_m × i_m`) with explicit confidence weighting.

### 3.2 Core Equation

```
Score = Σ ( weight_f × normalizedValue_f × confidence_f )   over factors f of the model
```

Each factor's `weightedContribution = weight × normalizedValue × confidence`. The aggregate score is the sum of contributions, and the full decomposition is retained so any score can be reverse-explained to its factors.

### 3.3 Factor Contribution Record

```ts
type ModelCode = 'AQS' | 'RIS' | 'AIS' | 'IRS';

interface FactorContribution {
  factorId: string;              // stable identifier (e.g., 'AQS.DOI_INTEGRITY')
  modelCode: ModelCode;
  factorName: string;            // human-readable factor name
  normalizedValue: number;       // 0..1, normalized per model (SEI-07B §10.2)
  weight: number;                // from the versioned weight map (SEI-07B §6)
  confidence: ConfidenceLevel;   // §5
  weightedContribution: number;  // weight × normalizedValue × confidence
  sourceEvidenceRefs: EvidenceReference[];  // §4 — never empty when the factor contributes
  hashVerified: boolean;         // every referenced payload hash-verified
}
```

### 3.4 Score Result Record

```ts
interface SubjectReference {
  subjectType: 'ARTICLE' | 'AUTHOR' | 'INSTITUTION';
  subjectId: string;             // IAEP submission id, IAEP identity id, or institution reference
}

interface EvidenceSnapshotReference {
  evidenceRecordIds: string[];   // the complete set of evidence records consumed
  inputEvidenceHash: string;     // aggregate hash over the consumed set (deterministic)
}

interface ScoreResult {
  scoreId: string;
  modelCode: ModelCode;
  modelVersion: string;          // e.g., 'AQS-1.0' (SEI-07B §7.3)
  subjectRef: SubjectReference;
  aggregateScore: number;        // Σ weightedContribution
  factorContributions: FactorContribution[];
  evidenceSnapshotRef: EvidenceSnapshotReference;
  computedAt: Date;
  trigger: AuditTrigger;         // §6.6
  envelope: ExplainabilityEnvelope;
}
```

### 3.5 Per-Model Factor Schemas (v1.0)

Factor schemas and weights are inherited verbatim from SEI-07B §2–§6 (default weight table v1.0). SEI-07C binds each factor to its evidence types and stable identifiers.

**AQS — Article Quality Score** (6 factors; weights sum 1.0):

| factorId | Factor | Weight | Source Evidence |
|----------|--------|:---:|-----------------|
| `AQS.DOI_INTEGRITY` | DOI integrity | 0.20 | Crossref / Zenodo `PUBLISHER_DOI` |
| `AQS.DISCOVERY_PRESENCE` | Discovery presence | 0.15 | OpenAIRE `DiscoveryEvidenceSnapshot` |
| `AQS.CITATION_COUNT` | Citation count | 0.25 | OpenAlex `CITATION` |
| `AQS.INDEXING_STATUS` | Indexing status | 0.15 | Zenodo / OpenAIRE aggregated index status |
| `AQS.AUTHOR_IDENTITY` | Author identity | 0.10 | ORCID / SINTA `IDENTITY` |
| `AQS.REPOSITORY_DEPOSIT` | Repository deposit | 0.15 | Zenodo `PUBLICATION` / `DATASET` |

**RIS — Research Impact Score** (4 factors; weights sum 1.0):

| factorId | Factor | Weight | Source Evidence |
|----------|--------|:---:|-----------------|
| `RIS.CITATION_COUNT` | Citation count | 0.40 | OpenAlex `CITATION` |
| `RIS.CITED_BY` | Cited-by relations | 0.25 | Crossref / OpenAIRE relations |
| `RIS.DISCOVERY_BREADTH` | Discovery breadth | 0.20 | OpenAIRE / Zenodo / Google Scholar |
| `RIS.RECENCY` | Recency | 0.15 | `verifiedAt` / `sourceTimestamp` |

**AIS — Author Influence Score** (4 factors; weights sum 1.0):

| factorId | Factor | Weight | Source Evidence |
|----------|--------|:---:|-----------------|
| `AIS.IDENTITY_VERIFICATION` | Identity verification | 0.25 | ORCID / SINTA `IDENTITY` |
| `AIS.PUBLICATION_COUNT` | Publication count | 0.25 | DOI / repository `PUBLICATION` |
| `AIS.CITATION_COUNT` | Citation count | 0.30 | OpenAlex `CITATION` |
| `AIS.EVALUATION_SIGNALS` | Evaluation signals | 0.20 | SINTA `IMPACT_METRIC` |

**IRS — Institution Research Score** (4 factors; weights sum 1.0):

| factorId | Factor | Weight | Source Evidence |
|----------|--------|:---:|-----------------|
| `IRS.AUTHOR_AFFILIATIONS` | Author affiliations | 0.20 | ORCID / SINTA / publication metadata |
| `IRS.PUBLICATION_OUTPUT` | Publication output | 0.30 | DOI / repository `PUBLICATION` |
| `IRS.CITATION_IMPACT` | Citation impact | 0.30 | OpenAlex `CITATION` |
| `IRS.EVALUATION_SIGNALS` | Evaluation signals | 0.20 | SINTA `INSTITUTION` |

### 3.6 Decomposition Rules

1. A factor with **no source evidence** contributes zero (`normalizedValue = 0`); it is recorded as absent, never fabricated.
2. A factor whose evidence fails hash verification contributes zero (§4.4; SEI-06G §5 hash mismatch → excluded).
3. The aggregate score is **recomputable** from the stored decomposition + weight map + evidence set; it is never a stored fabricated static metric (SEI-07B §2.4).
4. Normalization windows and recency thresholds are versioned with the model (SEI-07B §7) so decomposition is reproducible.

---

## 4. Evidence Attribution Model

### 4.1 Purpose

Every factor contribution must be attributable to specific, named provider evidence records. This operationalizes the "source attribution" explainability requirement (SEI-07B §8) and the "provider-attributed" bias-prevention rule (SEI-07B §10.2).

### 4.2 Evidence Reference

An `EvidenceReference` binds a factor to an immutable SEI-06G evidence record. It **references** — never copies or mutates — records persisted via `ExternalEvidenceStore`.

```ts
type EvidenceRecordKind = 'EXTERNAL_EVIDENCE_SNAPSHOT' | 'DISCOVERY_EVIDENCE_SNAPSHOT';

interface EvidenceReference {
  evidenceRecordId: string;       // ExternalEvidenceSnapshot.id / DiscoveryEvidenceSnapshot.id
  recordKind: EvidenceRecordKind;
  provider: string;               // SINTA | ORCID | CROSSREF | OPENALEX | ZENODO | DATACITE
                                  // | OPENAIRE | GOOGLE_SCHOLAR
  evidenceType: string;           // IDENTITY | PUBLICATION | CITATION | INSTITUTION
                                  // | IMPACT_METRIC | PUBLISHER_DOI | DATASET | DISCOVERY
  providerEntityId: string;       // provider entity id (DOI, ORCID iD, Zenodo record id, ...)
  payloadHash: string;            // SHA-256 of the immutable payload (SEI-06G §6–§7)
  capturedAt: Date;               // snapshot sourceTimestamp / discoveredAt
  verifiedAt?: Date;              // snapshot verifiedAt (when verified)
}
```

### 4.3 Attribution Rules

1. **No orphan factors.** A contributing `FactorContribution.sourceEvidenceRefs` must contain at least one `EvidenceReference`.
2. **No anonymized attribution.** `provider` is always a named provider; RJRAKP never strips, invents, or merges attribution (SEI-07B §10.2).
3. **Hash-bound.** `payloadHash` must equal the persisted snapshot's hash; a mismatch invalidates the reference and zeroes the factor (§4.4; SEI-06G §5).
4. **Read-only.** References are pointers to persisted evidence; RJRAKP never mutates referenced records (SEI-07A §2.2 rule 1; SEI-06G §9).

### 4.4 Hash Verification Binding

```ts
interface HashVerification {
  verifiedReferenceCount: number;
  mismatchedReferenceCount: number;      // must be 0 for a valid envelope
  verificationBasis: 'SHA-256_PAYLOAD' | 'SHA-256_METADATA';
  verifiedAt: Date;
}
```

- `mismatchedReferenceCount > 0` invalidates the entire `ExplainabilityEnvelope`; outputs built on mismatched evidence must not be persisted or surfaced.
- Verification runs against the persisted payload hashes (`external_evidence_payloads` and discovery hash columns per SEI-06G §2.3, §7).

### 4.5 Cross-Provider Corroboration

A factor may be supported by evidence from multiple providers (e.g., `AQS.DOI_INTEGRITY` corroborated by Crossref and Zenodo). Corroborating references:

- raise the factor's confidence (§5.4),
- are each retained in `sourceEvidenceRefs` with full attribution,
- are never collapsed into a single anonymized signal.

---

## 5. Confidence Model

### 5.1 Purpose

Confidence quantifies how much a piece of evidence may drive a score. It operationalizes the "confidence-weighted" rules (SEI-07B §2.3, §3.3, §4.3, §5.3, §6.3, §10.2) and the SEI-06G rule "hash mismatch = zero confidence."

### 5.2 Confidence Levels

```ts
type ConfidenceLevel =
  | 'VERIFIED_HIGH'    // provider-verified, hash-verified, corroborated
  | 'VERIFIED'         // provider-verified, hash-verified, single source
  | 'CORROBORATED'     // multiple consistent sources, individually unverified
  | 'SINGLE_SOURCE'    // one unverified-but-plausible source
  | 'STALE'            // verified but aged beyond recency threshold
  | 'UNVERIFIED'       // not verified / PENDING
  | 'HASH_MISMATCH';   // hash verification failed → excluded (SEI-06G §5)
```

| Level | Numeric Band | Basis |
|-------|:---:|-------|
| `VERIFIED_HIGH` | 0.95–1.00 | Verified + hash-verified + corroborated |
| `VERIFIED` | 0.80–0.94 | Verified + hash-verified, single source |
| `CORROBORATED` | 0.65–0.79 | Multiple consistent unverified sources |
| `SINGLE_SOURCE` | 0.40–0.64 | One plausible unverified source |
| `STALE` | 0.10–0.39 | Verified but aged beyond recency threshold |
| `UNVERIFIED` | 0.00–0.09 | Not verified / `PENDING` |
| `HASH_MISMATCH` | 0.00 | Verification failed → factor excluded |

### 5.3 Per-Evidence Default Confidence

| Source Evidence | Provider | Default Confidence (when verified) |
|-----------------|----------|:---:|
| `PUBLISHER_DOI` | Crossref | `VERIFIED_HIGH` |
| `IDENTITY` | ORCID | `VERIFIED_HIGH` |
| `IDENTITY` / `IMPACT_METRIC` / `INSTITUTION` | SINTA | `VERIFIED` |
| `PUBLICATION` / `DATASET` | Zenodo | `VERIFIED` |
| `CITATION` | OpenAlex | `VERIFIED` |
| Discovery `VERIFIED` | OpenAIRE | `VERIFIED` |
| Discovery `DISCOVERED` | OpenAIRE | `SINGLE_SOURCE` |
| Discovery `PENDING` | any | `UNVERIFIED` |

### 5.4 Confidence Aggregation

- **Single reference:** factor confidence equals the reference's base confidence.
- **Corroboration:** consistent references from multiple providers raise confidence one band (capped at `VERIFIED_HIGH`).
- **Conflict:** contradictory references keep their own attribution; the factor confidence is capped at `CORROBORATED` and the conflict is flagged for bias audit (§7).

### 5.5 Recency Decay

When `sourceTimestamp` ages beyond the model's recency threshold, confidence decays toward `STALE` (SEI-07B §3.2 recency factor). Decay schedules are versioned with the model (SEI-07B §7), so confidence remains reproducible.

### 5.6 Confidence Disclosure

```ts
interface ConfidenceAssessment {
  perFactor: Record<string, ConfidenceLevel>;  // factorId → level
  aggregationBasis: 'SINGLE' | 'CORROBORATED' | 'CONFLICTED';
  recencyApplied: boolean;
  hashMismatches: number;                       // must be 0 for a valid envelope
}
```

Every factor's confidence level and basis are retained in the envelope, satisfying "confidence disclosure" (SEI-07B §8).

---

## 6. Audit Trail Architecture

### 6.1 Purpose

SEI-07B §9 requires an immutable, reproducible, read-only audit trail for every RJRAKP computation. SEI-07C defines the `AuditRecord` model, the persistence contract, and the reproducibility guarantee. **No storage is created in this phase** — the contract is architecture only.

### 6.2 Audit Record

```ts
type OutputType = 'SCORE' | 'RANKING' | 'METRIC';
type AuditTrigger = 'PUBLICATION_EVENT' | 'MANUAL_REFRESH' | 'SCHEDULED_JOB'
                  | 'MODEL_UPDATE' | 'NORMALIZATION_CHANGE' | 'BIAS_REMEDIATION';

interface AuditRecord {
  auditRecordId: string;              // immutable, append-only key
  outputType: OutputType;
  subjectRef: SubjectReference;
  modelCode: ModelCode;
  modelVersion: string;               // SEI-07B §7
  weightMapRef: WeightMapReference;   // SEI-07B §6
  evidenceSnapshotRef: EvidenceSnapshotReference;  // full consumed evidence set
  outputPayload: ScoreResult | RankingResult | MetricRecord;
  reproducibilityHash: string;        // §6.4
  computedAt: Date;
  trigger: AuditTrigger;
  actorRef?: string;                  // authorized IAEP identity; system actor for jobs
  governanceReviewRef?: string;       // §8 — present when a ranking change was governed
}
```

`MetricRecord` follows the same structure as `ScoreResult` for non-scored analytics metrics and carries a complete `ExplainabilityEnvelope`.

### 6.3 Persistence Contract

| Rule | Contract |
|------|----------|
| Single write path | Only `RJRAKPAuditService.persistAuditRecord` (§9.6) writes audit records |
| Append-only | Records are write-once; update and delete are prohibited |
| Immutability | Stored records are never retroactively modified (SEI-07B §9.3) |
| Read-only query | Governance review, bias audit, and ranking review read via `queryAuditTrail` |
| Retention | Records are retained for the governance retention period |
| Logical store | Audit records persist in a dedicated RJRAKP audit store (logical table `rjrakp_audit_trail`); created by a later implementation phase, not here |

### 6.4 Reproducibility Guarantee

```
reproducibilityHash = SHA-256( inputEvidenceHash || modelVersion || weightMapRef )
```

- Same evidence set + same model version + same weight map ⇒ same `reproducibilityHash` and same output (SEI-07B §7.2 "Reproducible", §9.3).
- `verifyReproducibility(auditRecordId)` (§9.6) recomputes from the recorded evidence set and asserts equality; a mismatch is a defect routed to bias audit / remediation (§7).

### 6.5 Audit Enforcement

| SEI-07B §9 Rule | Enforcement |
|-----------------|-------------|
| All RJRAKP outputs persisted | No `ScoreResult` / `RankingResult` / `MetricRecord` without a persisted `AuditRecord` (§2.4 rule 3) |
| No output without an audit record | `ExplainabilityEnvelope.auditRecordId` must resolve (§2.2) |
| Reproducible | `reproducibilityHash` + `verifyReproducibility` (§6.4) |
| Read-only | Append-only store contract (§6.3) |

### 6.6 Trigger and Actor Taxonomy

- **Trigger** records what invoked the computation: publication event, manual refresh, scheduled job, model update, normalization change, bias remediation (SEI-07B §9.2, §11.3).
- **Actor** is the authorized IAEP identity (RBAC-bound) for interactive triggers; scheduled/system triggers record a system actor. RJRAKP never creates identities (SEI-07A §1.4, boundary preserved).

---

## 7. Bias Audit Architecture

### 7.1 Purpose

SEI-07B §10 requires bias prevention and periodic bias review. SEI-07C defines detection signals, the bias-audit run model, and the remediation workflow that make bias prevention operational.

### 7.2 Bias Detection Signals

| Signal | Detection | Governing Rule |
|--------|-----------|----------------|
| **Over-weighting** | A factor's realized contribution share exceeds a governance threshold across a model's outputs | SEI-07B §10.2 "No over-weighting" |
| **Attribution drift** | Attribution concentrates in one provider or becomes degenerate | SEI-07B §10.2 "Provider-attributed" |
| **Normalization skew** | A normalization window produces systematic distortion across subjects | SEI-07B §10.2 "Normalized" |
| **Confidence inflation** | Low-confidence evidence contributes high-confidence scores | SEI-07B §10.2 "Confidence-weighted" |
| **Coverage skew** | Outputs concentrate in a subset of subjects while comparable subjects remain unscored | SEI-07B §10.2 "Evidence-bound" |
| **Fabrication marker** | A factor with no `EvidenceReference`, or a hash mismatch, yet a non-zero contribution | SEI-07B §10.3; SEI-06G §5 |

### 7.3 Bias Audit Run

```ts
type BiasFindingSeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH';

interface BiasFinding {
  findingId: string;
  signal: string;                     // §7.2 signal identifier
  modelCode: ModelCode;
  severity: BiasFindingSeverity;
  evidenceAuditRefs: string[];        // AuditRecord ids exhibiting the signal
  description: string;
}

interface BiasAuditRun {
  auditRunId: string;
  auditedModelCodes: ModelCode[];
  period: { from: Date; to: Date };
  findings: BiasFinding[];
  remediationActions: string[];       // remediation references / descriptions
  auditorRef: string;                 // authorized reviewer identity
  auditedAt: Date;
}
```

Bias audit runs consume only `AuditRecord` data (§6); they never read providers directly and never mutate evidence.

### 7.4 Remediation Workflow

```
1. DETECT     — scheduled or ad-hoc audit run raises a signal (§7.2)
2. CLASSIFY   — severity assigned; HIGH requires governance review
3. REMEDIATE  — propose model correction (weight redistribution,
                normalization change, confidence recalibration)
4. VERSION    — weight/normalization change bumps the model version
                (SEI-07B §7) and is recorded in the audit trail (§6)
5. REVIEW     — Architecture Review Board / editorial oversight review
                (breaking changes require Board approval, SEI-07B §7.2)
6. RE-AUDIT   — corrected model re-audited; finding closes only when
                the signal no longer appears
```

### 7.5 Prohibited-Behavior Detection

The bias audit explicitly checks the prohibited behaviors of SEI-07B §10.3:

| Prohibited Behavior | Detection Basis |
|---------------------|-----------------|
| Fabricated citations/impact inflating scores | Fabrication marker (§7.2); missing `EvidenceReference` |
| Zeroed weights hiding unfavorable factors | Weight-map diff vs prior version; factor contribution absence |
| False provider attribution | Attribution mismatch against persisted snapshot `provider` |
| Scores used to override peer review/acceptance | Authority-boundary audit (RJRAKP outputs must not write editorial state) |
| Replacing SINTA / Scopus / Web of Science authority | Authority-boundary audit; RJRAKP outputs are insights only |

Any detected prohibited behavior is a `HIGH` finding and blocks publication of the affected model version until remediated.

### 7.6 Cadence

- **Scheduled** — periodic bias audit runs; cadence is versioned with the governance model.
- **Ad-hoc** — triggered by anomalies detected during reproducibility verification (§6.4), ranking-change review (§8), or conflict-flagged confidence (§5.4).
- **Reporting** — each run produces a bias audit report for governance review; runs are linked to the audit trail.

---

## 8. Ranking Governance Workflow

### 8.1 Purpose

SEI-07B §11 defines ranking change governance. SEI-07C defines the concrete workflow — trigger, candidate computation, diff, classification, review, publication — and the ranking result model.

### 8.2 Ranking Result

```ts
type RankingScope = 'JOURNAL' | 'ARTICLE' | 'AUTHOR' | 'INSTITUTION';

interface RankedSubject {
  subjectRef: SubjectReference;
  rankPosition: number;
  scoreRef: string;             // ScoreResult.scoreId underpinning the position
  positionDelta?: number;       // vs prior published ranking (positive = up)
}

interface RankingResult {
  rankingId: string;
  scope: RankingScope;
  modelVersion: string;         // SEI-07B §7
  weightMapRef: WeightMapReference;
  rankedSubjects: RankedSubject[];
  evidenceSnapshotRef: EvidenceSnapshotReference;
  changeTrigger: AuditTrigger;  // §6.6 / SEI-07B §11.3
  governanceReviewRef?: string; // present when the change was governed (§8.4)
  computedAt: Date;
  envelope: ExplainabilityEnvelope;
}
```

### 8.3 Change Triggers (SEI-07B §11.3)

| Trigger | Description |
|---------|-------------|
| **New evidence** | New hash-verified evidence enters the repository |
| **Model update** | Model version or weights change |
| **Normalization change** | Comparison window or normalization changes |
| **Bias remediation** | A bias finding triggers a model correction |

### 8.4 Governance Workflow

```
1. TRIGGER    — change trigger detected (§8.3)
2. CANDIDATE  — candidate ranking computed (deterministic, model-versioned)
3. DIFF       — position deltas computed against the prior published ranking
4. CLASSIFY   — ROUTINE:  evidence-only change, same model version,
                          deltas within threshold
                GOVERNED: model update / normalization change / bias
                          remediation / deltas beyond threshold
5. REVIEW     — governed changes go to Governance Review
                (Architecture Review Board / editorial oversight)
6. DECIDE     — approval or denial with recorded rationale
                (governanceReviewRef on the RankingResult)
7. PUBLISH    — approved → ranking published with version stamp + audit link
                denied   → rationale recorded; prior ranking retained
```

### 8.5 Governance Rules (enforced)

| SEI-07B §11.4 Rule | Enforcement |
|--------------------|-------------|
| Deterministic | Reproducible from same evidence + model version + weight map (§6.4) |
| Evidence-based | Ranking basis references only repository evidence (§4) |
| Versioned | `modelVersion` recorded on every `RankingResult` |
| Auditable | Ranking computation persisted as an `AuditRecord` with `governanceReviewRef` (§6) |
| Authority boundary | Rankings are insights, never editorial/acceptance decisions (§8.6) |

### 8.6 Prohibited Uses (SEI-07B §11.5)

- Rankings must not override ASIA peer review.
- Rankings must not decide publication acceptance.
- Rankings must not replace SINTA or Scopus/Web of Science.
- Rankings must not modify provider evidence.

### 8.7 Ranking Change Log

Every ranking change — routine or governed — is recorded with trigger, diff, classification, review, decision, and audit linkage. The change log is read-only and sourced from the audit trail (§6); it is never edited retroactively.

---

## 9. RJRAKP Runtime Boundary Contract

### 9.1 Purpose

SEI-07C defines the concrete service contracts and the runtime boundary that RJRAKP implementations must conform to. This contract is the conformance target for a future RJRAKP runtime remediation phase, and the boundary the future AI layer must respect (§10). **No code is created or changed in this phase.**

### 9.2 Boundary Overview

```
ExternalEvidenceRepository   (SEI-06G — immutable, hash-verified)
        ↑ read-only
RJRAKPEvidenceReader         ← the ONLY input port (no provider client)
        ↓
RJRAKPScoringService         (AQS / RIS / AIS / IRS — §3)
RJRAKPRankingService         (rankings — §8)
        ↓ append-only (audit)
RJRAKPAuditService           → RJRAKP audit store (§6)

NO provider adapter. NO ProviderRuntimeManager capability execution.
NO direct provider fetch. NO mutation of evidence, identity, or
editorial state.
```

### 9.3 Evidence Reader Contract (only input port)

```ts
interface RJRAKPEvidenceReader {
  // Returns ExternalEvidenceSnapshot[] (SEI-06G §2.1) — read-only
  readEvidenceForArticle(articleId: string): Promise<ExternalEvidenceSnapshot[]>;
  readEvidenceForAuthor(apasificIdentityId: string): Promise<ExternalEvidenceSnapshot[]>;
  readEvidenceForInstitution(institutionRef: string): Promise<ExternalEvidenceSnapshot[]>;
  // Returns DiscoveryEvidenceSnapshot[] (SEI-06G §2.2) — read-only
  readDiscoveryForArticle(articleId: string): Promise<DiscoveryEvidenceSnapshot[]>;
}
```

Boundary rules:

- The reader returns **only** persisted, hash-verified snapshots from the `ExternalEvidenceRepository`.
- The reader holds **no** provider adapter, provider client, or capability-execution reference.
- The reader is **read-only**; it never mutates evidence or domain state.

### 9.4 Scoring Service Contract

```ts
interface RJRAKPScoringService {
  computeAQS(articleId: string): Promise<ScoreResult>;
  computeRIS(articleId: string): Promise<ScoreResult>;
  computeAIS(apasificIdentityId: string): Promise<ScoreResult>;
  computeIRS(institutionRef: string): Promise<ScoreResult>;
}
```

Contract rules:

- Evidence is read **only** via `RJRAKPEvidenceReader` (§9.3).
- Every result carries a complete `ExplainabilityEnvelope` (§2) — no envelope, no result.
- Every computation persists an `AuditRecord` (§6) before returning.
- Scores are analytical insights only; the service never mutates evidence, identity, roles, peer review, or acceptance state.

### 9.5 Ranking Service Contract

```ts
interface RJRAKPRankingService {
  computeRanking(scope: RankingScope): Promise<RankingResult>;
}
```

- Consumes scores and evidence only through §9.3/§9.4.
- Produces a `RankingResult` with governance workflow linkage (§8.4).
- Rankings are insights, never editorial decisions (§8.6).

### 9.6 Audit Service Contract

```ts
interface RJRAKPAuditService {
  persistAuditRecord(record: AuditRecord): Promise<void>;          // append-only
  queryAuditTrail(filter: AuditQuery): Promise<AuditRecord[]>;     // read-only
  verifyReproducibility(auditRecordId: string): Promise<boolean>;  // §6.4
}
```

- `persistAuditRecord` is the **only** write path to the audit store.
- `queryAuditTrail` is read-only; used by governance review, bias audit, and ranking-change review.
- `verifyReproducibility` recomputes and asserts the `reproducibilityHash`.

### 9.7 Boundary Enforcement Summary

| Rule | Enforcement |
|------|-------------|
| RJRAKP never calls providers directly | No provider adapter/client in any RJRAKP service; `RJRAKPEvidenceReader` is the only input port (SEI-07A §9) |
| RJRAKP consumes only `ExternalEvidenceRepository` | Reader returns only persisted snapshots (SEI-07B §1.2; SEI-06G §9) |
| No fabricated metrics | Every contributing factor binds to ≥1 `EvidenceReference`; no envelope without evidence (§2.4, §4.3) |
| No mutation of evidence/identity/editorial state | Reader read-only; scoring/ranking produce insights only (SEI-07B §1.1) |
| Every output explainable and audited | `ExplainabilityEnvelope` + `AuditRecord` mandatory (§2.4, §6.5) |

### 9.8 Known Conformance Gap (documented, no code change here)

The existing `src/services/research-intelligence/ResearchIntelligenceService.ts` predates this contract: it executes provider capabilities through the provider runtime (a SEI-07A §9 violation for RJRAKP) and returns placeholder/mock structures (a "no fabricated metrics" violation under SEI-06G §1.1 / SEI-07B §10.3). SEI-07C records this as the **conformance target** for a future RJRAKP runtime remediation phase: refactor to (a) read evidence via `RJRAKPEvidenceReader`, (b) compute via `RJRAKPScoringService` semantics, (c) persist via `RJRAKPAuditService`. No source code is changed in SEI-07C.

---

## 10. Future AI Intelligence Readiness

### 10.1 SEI-07A §10 Entry Criteria

SEI-07A §10.3 permits a future AI Intelligence Layer only after:

1. Architecture Review Board approval.
2. A dedicated ADR.
3. Decision/ranking governance alignment (SEI-07A §7 / SEI-07B §11).
4. Explainability certification (SEI-07A §8 / SEI-07B §8).

### 10.2 Readiness Gates Provided by SEI-07C

| Entry Criterion | SEI-07C Mechanism | Gate |
|-----------------|-------------------|------|
| Explainability certification | ExplainabilityEnvelope + factor decomposition + attribution + confidence (§2–§5) | AI outputs must carry the same envelope; advisory outputs with no decomposition are rejected |
| Ranking governance alignment | Ranking governance workflow (§8) | AI-influenced ranking changes traverse the same trigger/review/publication workflow |
| Auditability | Audit trail architecture (§6) | Every AI computation persists an `AuditRecord` with reproducibility hash |
| Bias prevention | Bias audit architecture (§7) | AI augmentation is subject to the same detection signals and remediation workflow |
| Evidence-only consumption | Runtime boundary contract (§9) | AI consumes only `ExternalEvidenceRepository` via `RJRAKPEvidenceReader`; no provider access |

### 10.3 AI Constraints (must hold, inherited)

- AI consumes **only** the `ExternalEvidenceRepository` — never direct provider access.
- AI outputs are **advice**, never editorial or publication decisions.
- AI cannot override ASIA peer review.
- AI cannot replace DOI/index providers.
- AI outputs must be **explainable** and traceable to evidence.
- No fabricated metrics — AI augments, never invents, evidence.
- Identity boundary preserved — AI never creates IAEP users/roles.

### 10.4 Readiness Statement

With SEI-07C documented, the explainability, audit, bias, and governance enforcement mechanisms exist as architecture. A future AI Intelligence Layer (SEI-08 candidate) may proceed to ADR + Architecture Review once its design demonstrates conformance to the §10.2 gates. SEI-07C itself introduces no AI capability.

---

## 11. Rules Compliance Summary

| Rule | Status |
|------|--------|
| RJRAKP never calls external providers directly | ✅ CONFIRMED (§9.2, §9.3, §9.7) |
| RJRAKP consumes only `ExternalEvidenceRepository` | ✅ CONFIRMED (§9.3) |
| RJRAKP scores are analytical insights only | ✅ CONFIRMED (§1.3, §9.4) |
| RJRAKP never decides publication acceptance | ✅ CONFIRMED (§8.6) |
| RJRAKP never overrides peer review | ✅ CONFIRMED (§8.6, §10.3) |
| RJRAKP never replaces SINTA / Scopus / Web of Science | ✅ CONFIRMED (§7.5, §8.6) |
| RJRAKP never modifies provider evidence | ✅ CONFIRMED (§4.3 rule 4, §9.7) |
| No mock evidence / no fabricated metrics | ✅ CONFIRMED (§2.4, §3.6, §7.2 fabrication marker, §9.8) |
| Every output explainable, versioned, audited | ✅ CONFIRMED (§2, §3, §6) |
| Future AI layer is evidence-only and advisory | ✅ CONFIRMED (§10) |

---

## 12. Validation & Scope Confirmation

### 12.1 Scope

| Requirement | Status |
|-------------|--------|
| Purpose and scope | ✅ CONFIRMED (§1) |
| Explainability framework | ✅ CONFIRMED (§2) |
| Score factor decomposition model | ✅ CONFIRMED (§3) |
| Evidence attribution model | ✅ CONFIRMED (§4) |
| Confidence model | ✅ CONFIRMED (§5) |
| Audit trail architecture | ✅ CONFIRMED (§6) |
| Bias audit architecture | ✅ CONFIRMED (§7) |
| Ranking governance workflow | ✅ CONFIRMED (§8) |
| RJRAKP runtime boundary contract | ✅ CONFIRMED (§9) |
| Future AI intelligence readiness | ✅ CONFIRMED (§10) |

### 12.2 Documentation-Only Confirmation

| Check | Status |
|-------|--------|
| No application code changes | ✅ CONFIRMED |
| No database migration | ✅ CONFIRMED (audit store is a logical contract only) |
| No API implementation | ✅ CONFIRMED |
| No mock provider / mock evidence introduced | ✅ CONFIRMED |

### 12.3 Protected Boundaries

| Component | Status |
|-----------|--------|
| Authentication Boundary | ✅ UNTOUCHED (FROZEN) |
| Identity Core | ✅ UNTOUCHED |
| RBAC | ✅ UNTOUCHED |
| `src/proxy.ts` | ✅ UNTOUCHED |

### 12.4 Files Changed

| File | Action |
|------|--------|
| `docs/IAEP-SEI-07C-RJRAKP-Explainability-Audit-Architecture.md` | CREATED (this document) |
| `docs/IAEP-Architecture-Certification-Registry.md` | UPDATED (registry entry #20) |
| `TODO.md` | UPDATED |

---

## 13. Closure Statement

```
SEI-07C RJRAKP EXPLAINABILITY AND AUDIT ARCHITECTURE
Status: DOCUMENTED

Explainability:  ExplainabilityEnvelope mandatory on every output
                 (factor decomposition, source attribution, confidence,
                 hash verification, model version, weight map, audit
                 link, reproducibility hash)
Decomposition:   Score = Σ (weight × normalizedValue × confidence)
                 AQS (6 factors), RIS (4), AIS (4), IRS (4)
                 weights inherited from SEI-07B v1.0 (sum-to-1.0)
Attribution:     EvidenceReference binds every factor to SEI-06G
                 snapshots; provider attribution never anonymized;
                 hash mismatch invalidates (SEI-06G §5)
Confidence:      VERIFIED_HIGH → HASH_MISMATCH levels; corroboration
                 raises; conflict caps; recency decays; disclosed
Audit trail:     Immutable append-only AuditRecord; single write path;
                 reproducibilityHash = H(evidence || version || weights);
                 no output without an audit record
Bias audit:      Detection signals (over-weighting, attribution drift,
                 normalization skew, confidence inflation, coverage
                 skew, fabrication marker); remediation workflow with
                 version bump + governance review + re-audit
Ranking change:  Trigger → candidate → diff → classify → review →
                 publish/deny; change log read-only
Boundary:        RJRAKPEvidenceReader = only input port;
                 scoring/ranking/audit service contracts;
                 no provider client, no fabricated metrics
Known gap:       Existing ResearchIntelligenceService predates this
                 contract (recorded for a future runtime remediation
                 phase; no code changed here)
AI readiness:    Explainability, audit, bias, governance, and boundary
                 gates defined for a future AI intelligence layer
                 (SEI-07A §10); advisory and evidence-only
Boundaries:      Auth FROZEN, Identity Core/RBAC/proxy.ts untouched
```

*Architecture Definition Artifact — IAEP SEI-07C RJRAKP Explainability and Audit Architecture.*
*Every RJRAKP output is decomposable, attributable, confidence-weighted, hash-verified, versioned, and audited.*