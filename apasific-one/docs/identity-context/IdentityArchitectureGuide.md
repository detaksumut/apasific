# Identity Architecture Guide
**Context**: Identity
**Role**: Golden Reference Implementation

## 1. Domain Layer Rules
- Contains pure business entities: `User`, `Role`, `Permission`, `Organization`, `IdentitySession`.
- Exclusively uses `AggregateRoot` and `Entity` from `Apasific.Backend.Shared`.
- All domain validations must throw `DomainException`.
- Holds zero dependencies aside from `Apasific.Backend.Shared`.

## 2. Application Layer Rules (CQRS)
- **Commands**: Modify state. Must be suffixed with `Command`. Handlers suffixed with `CommandHandler`.
- **Queries**: Read state. Must be suffixed with `Query`. Handlers suffixed with `QueryHandler`.
- Orchestrates Domain methods and `IRepository` operations. 

## 3. Infrastructure Layer Rules
- Only defines the implementation of Domain Contracts.
- **Forbidden**: Placing any business logic or validations here.

## 4. Presentation Layer Rules
- Exposes API endpoints mapping to `MediatR` (or similar command dispatchers).
- Controllers must be as thin as possible (ideally just forwarding the HTTP payload to the Command/Query).
