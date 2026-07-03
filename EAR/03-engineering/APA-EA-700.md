---
Document ID: APA-EA-700
Title: Engineering Standards
Version: 1.0.0
Status: Frozen
Owner: Architecture Board
Reviewer: Chief Enterprise Architect
Classification: Internal
---

# APA-EA-700 Engineering Standards

This document establishes the strict engineering rulebook for APASIFIC ONE. It governs coding standards, version control strategies, CI/CD pipelines, and quality gates. All developers (internal or external) must adhere to these rules without exception.

---

## 1. Coding Standards & Architecture Rules

APASIFIC ONE follows a **Modular Monolith** architecture (ADR-0003) with strict domain boundaries.

- **Framework Agnostic Principles**: Business logic must not be tightly coupled to a specific web framework. Core logic must be isolated.
- **API-First (ADR-0004)**: All backend services must expose REST/GraphQL APIs. The UI must only consume these APIs and never query the database directly.
- **Event-Driven (ADR-0005)**: Cross-domain communication must happen via the Event Bus (e.g., ArticleAccepted event), not direct function calls between modules.
- **Linting & Formatting**: Prettier and ESLint (or equivalent backend linters) are mandatory. CI pipelines will reject code that fails linting.

---

## 2. Git Strategy & Branching Model

We utilize a strict **Trunk-Based Development** approach to minimize merge conflicts and accelerate delivery.

- **Main Branch**: main is sacred. It represents the production-ready state. Direct commits to main are strictly forbidden for developers.
- **Feature Branches**: eat/issue-number-short-desc (e.g., eat/102-submit-manuscript).
- **Bugfix Branches**: ix/issue-number-short-desc.
- **Commit Conventions**: We follow Conventional Commits format.
  - eat: (New feature)
  - ix: (Bug fix)
  - docs: (Documentation updates, like updating the EAR)
  - chore: (Maintenance, dependencies)
  - efactor: (Code changes that neither fix a bug nor add a feature)

---

## 3. Code Review Standards

A Pull Request (PR) cannot be merged without passing the following checks:

1. **Peer Review**: At least one senior engineer (or the Architecture Board) must approve.
2. **Automated Tests**: Unit and Integration tests must pass.
3. **No Secrets**: Automated scanning must confirm no API keys or secrets are hardcoded.
4. **Architecture Compliance**: The reviewer must verify that the PR does not violate the boundaries established in APA-EA-400 (Application Architecture) and APA-EA-300 (Data Architecture).

---

## 4. CI/CD Pipelines & Quality Gates

Continuous Integration and Continuous Deployment are mandatory.

### 4.1 CI Pipeline (On PR Creation)
1. **Linting Check**: Enforces coding style.
2. **Security Scan**: SAST (Static Application Security Testing) and dependency vulnerability checks.
3. **Test Execution**: Runs the automated test suite.
4. **Build Check**: Ensures the application compiles/builds successfully.

### 4.2 Quality Gate (Definition of Done)
- Code is peer-reviewed.
- Code coverage does not drop below 80%.
- No critical or high vulnerabilities introduced.
- Documentation (if impacted) is updated.

### 4.3 CD Pipeline (On Merge to Main)
1. **Automated Versioning**: Semantic versioning bumped based on commit prefixes.
2. **Containerization**: Docker image built and pushed to the registry.
3. **Deployment**: Deployed to the Staging Environment automatically. (Production deployment requires a manual trigger by the Release Manager).

---

> [!CAUTION]
> **Zero Tolerance Policy**
> Any Pull Request attempting to bypass the Capability Engine, writing directly to another domain's database tables, or failing the CI/CD Quality Gates will be automatically rejected.
