# Golden Reference Checklist
**Platform**: Academic Identity Platform (AIP)
**Status**: ACTIVE

## Purpose
This checklist acts as the absolute quality gate for generating any new Bounded Context in the APASIFIC ONE platform. Every context MUST pass this checklist to ensure 100% uniformity with the Golden Reference (Identity Context).

## Checklist Items
- [ ] **Folder Structure Identical**: Conforms strictly to Domain, Application, Infrastructure, Presentation, Contracts.
- [ ] **Namespace Consistency**: Follows `namespace.manifest.json` completely. No manual deviation allowed.
- [ ] **Dependency Rules Obeyed**: Verified against `dependency-rules.manifest.json` (No infrastructure in Domain).
- [ ] **Shared Kernel Contracts**: Exclusively utilizes `Apasific.Backend.Shared` for `Result<T>`, `AggregateRoot`, etc.
- [ ] **CQRS Pattern Unbroken**: One Command per Handler, one Query per Handler.
- [ ] **Template Coverage**: 100% of generated files originated from the Template Registry.
- [ ] **Architecture Compliance**: Passes all `NetArchTest` automation in CI/CD.
- [ ] **Build Integrity**: Project compiles without warnings or errors.
- [ ] **Unit Tests Passed**: Core domain behaviors have >80% code coverage.
