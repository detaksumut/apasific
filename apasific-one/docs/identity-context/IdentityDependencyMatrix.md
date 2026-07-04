# Identity Context Dependency Matrix
**Project Group**: `Apasific.Backend.Identity.*`
**Certification Date**: 2026-07-04

## Allowed Internal References (Hexagonal Architecture)

| Source Layer | Target Layer | Status |
| :--- | :--- | :--- |
| `Presentation` | `Application` | ✅ ALLOWED |
| `Infrastructure` | `Application` | ✅ ALLOWED |
| `Application` | `Domain` | ✅ ALLOWED |
| `Domain` | `Shared.Kernel` | ✅ ALLOWED |
| `Presentation` | `Domain` | ❌ FORBIDDEN |
| `Infrastructure` | `Presentation` | ❌ FORBIDDEN |
| `Domain` | `Infrastructure` | ❌ FORBIDDEN |

## Nuget / Framework Dependencies

| Package | Used In | Status | Rationale |
| :--- | :--- | :--- | :--- |
| `Microsoft.AspNetCore.Mvc` | `Presentation` | ✅ ALLOWED | Required for exposing REST API endpoints. |
| `Microsoft.EntityFrameworkCore` | `Infrastructure` | ✅ ALLOWED | Identity persistence mechanism. |
| `MediatR` | `Application` | ✅ ALLOWED | Required for CQRS orchestration. |
| `AutoMapper` | `Application` | ❌ FORBIDDEN | Strict rule: Manual DTO mapping required for deterministic tracing. |

**Conclusion**: The Identity Context correctly implements strict dependency boundaries mapping perfectly to the `dependency-rules.manifest.json`.
