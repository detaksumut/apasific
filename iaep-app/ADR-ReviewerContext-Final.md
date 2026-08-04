# ADR-ReviewerContext: Reviewer Bounded Context

- Status: Proposed / Approved Recommendation
- Version: 1.0
- Date: 2026-08-03

## Context
The repository already contains reviewer assignment flows, reviewer-facing queues, review decision actions, and reviewer-related state transitions. However, the reviewer domain was not previously represented as an explicit bounded context in the governance documentation. This creates a risk that reviewer responsibilities may be interpreted as part of the publication context when architectural decisions are made.

## Decision
The reviewer domain should be recognized as a distinct bounded context with a narrow integration contract to the publication context. Reviewer state management remains separate from publication metadata ownership, and review lifecycle transitions remain server-side and auditable.

## Scope
This ADR covers the governance definition of the reviewer bounded context, including:
- reviewer assignment lifecycle,
- reviewer decision tracking,
- review queue orchestration,
- reviewer identity and assignment state.

## Boundaries
The reviewer bounded context owns reviewer-specific responsibilities and state transitions. It does not own:
- publication metadata,
- DOI registration,
- discovery visibility decisions,
- or publication-level indexing state.

## Dependencies
The reviewer bounded context depends on the publication context only through a narrow, explicitly defined contract. That contract should include the minimum data needed for assignment and workflow coordination, such as:
- publication_id,
- reviewer_id,
- assignment_status,
- assignment_deadline,
- review_decision,
- submission_stage.

## Consequences
Adopting this bounded context definition will:
- improve architectural clarity,
- reduce ambiguity between publication and reviewer responsibilities,
- preserve reviewer identity and review actions behind the reviewer boundary,
- and support future governance review without introducing parallel implementation layers.

## Compliance Impact
This decision is aligned with the repository governance position that service and domain logic should remain separated from direct external API concerns and that cross-context workflows should be coordinated through controlled contracts. It also supports the documentation and certification posture for the reviewer domain without implying full production certification.
