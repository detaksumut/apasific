# ADR-ReviewerContext: Reviewer Bounded Context

- Status: DRAFT
- Version: 1.0
- Date: 2026-08-02

## Context
The reviewer domain already exists in the application through review assignment flows, reviewer dashboards, and review decision actions. However, the architecture was not documented as an explicit bounded context. This ADR restores a documented reviewer boundary so that the domain remains independent from the publication context while still participating in publication workflows through explicitly defined contracts.

## Context boundary
The reviewer bounded context owns:
- reviewer assignment lifecycle
- reviewer decision tracking
- review queue orchestration
- reviewer identity and assignment state

It does not own publication publication metadata, DOI registration, or discovery visibility decisions.

## Aggregate responsibilities
- ReviewAssignment: tracks assignment state, reviewer identity, submission association, lifecycle timestamps, and review outcome.
- ReviewerProfile: represents reviewer availability, expertise, and review-related profile information.
- ReviewQueue: represents the reviewer-facing list of pending, active, and completed assignments.

## Domain entities
- AssignmentId
- ReviewerId
- SubmissionId
- ReviewStatus
- ReviewDecision
- ReviewDeadline
- ReviewComment

## Service responsibilities
- ReviewQueueService: exposes reviewer-facing queues derived from review assignments.
- ReviewAssignmentRepository: persists and retrieves assignment state from the authoritative data source.
- Reviewer-facing actions remain server-side and perform state transitions through the assignment and submission workflow.

## Integration contracts with Publication Context
Publication Context
        |
        |
Review Assignment Contract
        |
        |
Reviewer Context

The contract is intentionally narrow:
- publication_id
- reviewer_id
- assignment_status
- assignment_deadline
- review_decision
- submission_stage

The reviewer context may consume publication context references but must not directly mutate publication metadata beyond the agreed state transition contract.

## Dependency direction
Dependencies flow inward to the reviewer context:
- Publication context may depend on the review assignment contract.
- Reviewer context must not depend on publication visibility or DOI registration services.

## Events
- ReviewAssignmentCreated
- ReviewAssignmentAccepted
- ReviewAssignmentRejected
- ReviewAssignmentCompleted
- ReviewRevisionRequested

## Security considerations
- Reviewer identities must remain isolated from author-facing publication context.
- Review comments and reviewer identity references must stay behind the reviewer boundary unless explicitly approved by the publication workflow.
- Assignment and decision updates must remain server-side and auditable.

## Architectural notes
This ADR is intentionally limited to documentation and boundary definition. It does not introduce a new implementation or duplicate service layer.
