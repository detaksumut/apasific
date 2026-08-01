# Environment Governance Policy

## 1. Environment Isolation
All environments (Development, Staging, Production) must be strictly isolated.
- **Development**: Local or sandbox environments. Mock data allowed.
- **Staging**: Exact replica of production. Uses sanitized production data or high-fidelity mock data.
- **Production**: Live global environment. No direct code mutations allowed.

## 2. Configuration Externalization
All configuration values must be externalized via Environment Variables. No hardcoded configuration is permitted in the codebase.
The `.env` files in this repository are **TEMPLATES/PLACEHOLDERS** only. True secrets must never be committed.

## 3. Secret Management
- **Rule**: DO NOT commit API keys, database credentials, or JWT secrets.
- **Mechanism**: Secrets must be injected at runtime using a secure vault (e.g., GitHub Secrets, AWS Secrets Manager, GCP Secret Manager).

## 4. Promotion Flow
Code changes must flow sequentially: `Development -> Staging -> Production`.
Deployments to production require architectural approval and automated test passage.
