# Sprint 2 Dependency Matrix (Academic Context)
**Project Group**: `Apasific.Backend.Academic.*`
**Sprint**: 2 - Study Program
**Date**: 2026-07-04

## Cross-Aggregate Dependency Verification
This matrix proves the isolation of `StudyProgram` and `Faculty` aggregates.

| Source Layer | Target Dependency | Status | Rationale |
| :--- | :--- | :--- | :--- |
| `Domain.StudyPrograms` | `Domain.Faculty` | ❌ FORBIDDEN | Aggregates cannot hold direct object references to other Aggregates. |
| `Domain.StudyPrograms` | `System.Guid (FacultyId)` | ✅ ALLOWED | Identity referencing is the designated mechanism for cross-aggregate linkage. |
| `Application.StudyPrograms` | `IFacultyRepository` | ✅ ALLOWED | Application Layer orchestrates state checks (e.g., verifying Faculty exists and is active). |
| `Application.StudyPrograms` | `Domain.Faculty.Faculty` | ❌ FORBIDDEN | Application Layer should only fetch read-models or interact via ID, not mutate other aggregates in the same command. |

**Conclusion**: The boundary between Faculty and Study Program is perfectly preserved. The Domain remains agnostic of data fetching, and Application strictly orchestrates validation via Identity.
