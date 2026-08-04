# Go-Live Readiness Checklist

## 1. Deployment Readiness
- Confirm the deployment artifact matches the currently validated build.
- Confirm the target environment has the required secrets configured.
- Confirm the application starts successfully in the target environment.

## 2. Database Readiness
- Confirm Supabase connection configuration is valid.
- Confirm service-role credentials can be used for required operational access.
- Confirm required schema and migration state are available.

## 3. Provider Readiness
- Confirm Zenodo, OpenAlex, OpenAIRE, and ORCID provider access paths are reachable.
- Confirm ORCID OAuth credentials are valid for live exchange.
- Confirm provider failures are handled by the existing runtime path.

## 4. Monitoring Readiness
- Confirm provider requests emit structured logs and trace context.
- Confirm failed requests and retries are visible to operations.
- Confirm monitoring alerts are configured for critical provider failures.

## 5. Rollback Readiness
- Confirm the previous deployment artifact is available.
- Confirm rollback steps are documented.
- Confirm database and configuration rollback steps are understood by operations.
