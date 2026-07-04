# Shared Kernel Dependency Matrix
**Project**: `Apasific.Backend.Shared`
**Certification Date**: 2026-07-04

## Allowed Internal References
- *None*. The Shared Kernel is the lowest layer in the hierarchy and depends on nothing internally.

## Nuget / Framework Dependencies
The following represents the `csproj` evaluation.

| Package / Namespace | Status | Rationale |
| :--- | :--- | :--- |
| `System.*` (Base Class Library) | ✅ ALLOWED | Core language features. |
| `MediatR` | ❌ FORBIDDEN | Messaging belongs in Application Layer. |
| `Microsoft.EntityFrameworkCore` | ❌ FORBIDDEN | Persistence belongs in Infrastructure. |
| `AutoMapper` | ❌ FORBIDDEN | Mapping belongs in Application Layer. |
| `Microsoft.AspNetCore.*` | ❌ FORBIDDEN | HTTP/Web belongs in Presentation Layer. |
| `Apasific.Backend.Contexts.*` | ❌ FORBIDDEN | Kernel must be context-agnostic. |

**Conclusion**: The Shared Kernel correctly acts as a pure `net9.0` class library with ZERO external dependencies.
