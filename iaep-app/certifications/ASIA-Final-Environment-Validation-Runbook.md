# ASIA Final Environment Validation Runbook

## Purpose
This runbook defines the final environment validation steps required before any statement of "ASIA Enterprise Production Certified v1.0" can be made. It does not claim certification; it specifies the evidence that must exist.

## 1. Production environment prerequisites

The target production environment must provide:
- a runtime compatible with the current Next.js and Supabase client stack,
- network access to the required provider endpoints,
- deployment access to the required secrets and configuration values,
- monitoring and log aggregation capability,
- and a valid database access path for runtime validation.

### Required environment checks
- Confirm the deployment artifact matches the current certified build baseline.
- Confirm the target environment is configured for the intended production mode.
- Confirm cron routes and protected operational routes are reachable with the required secret configuration.
- Confirm the application can start and serve the production build successfully.

## 2. Required secrets validation

The following secrets and configuration values must be present and valid in the target environment:
- ZENODO_API_TOKEN
- ZENODO_ENVIRONMENT
- OPENALEX_POLITE_EMAIL
- ORCID_CLIENT_ID
- ORCID_CLIENT_SECRET
- ORCID_REDIRECT_URI
- ORCID_ENVIRONMENT
- ENCRYPTION_KEY
- NEXT_PUBLIC_SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- SERVICE_NAME
- ENVIRONMENT
- CRON_SECRET

### Validation evidence required
- Secret presence check for each required variable.
- Confirmation that values are not empty or placeholder values.
- Confirmation that the values are scoped to the intended environment.
- Confirmation that sensitive values are not exposed in application logs.

## 3. ORCID production OAuth validation procedure

### Objective
Validate that the ORCID integration can complete a real production OAuth exchange using real credentials.

### Procedure
1. Confirm the ORCID client credentials are present and valid.
2. Confirm the redirect URI matches the deployed callback route exactly.
3. Initiate the OAuth authorization flow from the deployed environment.
4. Complete the authorization exchange with real credentials.
5. Verify that the resulting profile data is returned successfully.
6. Verify that tokens are encrypted before persistence and not exposed in logs.
7. Verify that the identity link is recorded without duplicate mapping.

### Evidence required
- Screenshot or log of the successful OAuth exchange initiation.
- Successful callback result with a valid ORCID profile response.
- Proof that the token handling path uses encrypted storage and does not expose secrets.
- Confirmation that the provider handled the flow without fallback-only behavior.

### Acceptance condition
ORCID validation is complete only when a real authorization exchange succeeds in the target environment.

## 4. Zenodo production validation procedure

### Objective
Validate that the publication visibility pipeline can successfully create and publish a DOI deposit in the production environment.

### Procedure
1. Confirm the Zenodo API token is active and valid.
2. Confirm the Zenodo environment is set to the intended production target.
3. Trigger a deposit request through the publication federation path.
4. Confirm the deposit response contains a valid record identifier.
5. Confirm the publication publish response indicates success.
6. Confirm the DOI and related metadata are persisted in the publication workflow.

### Evidence required
- Successful deposit response payload.
- Successful publish response payload.
- Persisted DOI and publication metadata evidence.
- Logs showing the request completed without unresolved provider error.

### Acceptance condition
Zenodo validation is complete only when the full deposit-to-publish workflow completes successfully in the target environment.

## 5. OpenAlex/OpenAIRE validation procedure

### Objective
Validate that the discovery and citation provider paths function correctly in the deployment environment.

### Procedure
1. Confirm the OpenAlex polite email and configuration values are present.
2. Submit a citation request using a valid DOI or representative test case.
3. Confirm the response is processed without architecture or routing errors.
4. Confirm the OpenAIRE discovery request executes and returns a structured result.
5. Confirm the publication visibility logic updates status appropriately from the response.

### Evidence required
- OpenAlex request/response evidence.
- OpenAIRE request/response evidence.
- Confirmation that the provider path returned a structured result or a controlled failure state.
- Logs showing the request completed with trace context.

### Acceptance condition
OpenAlex and OpenAIRE validation are complete when both provider paths complete successfully or fail in a controlled, documented way without breaking the workflow.

## 6. Supabase runtime validation procedure

### Objective
Validate that the production runtime can successfully communicate with Supabase using the required service-role access path.

### Procedure
1. Confirm the Supabase URL and service-role key are present and valid.
2. Confirm the runtime environment supports the required Supabase client transport.
3. Execute a live service-role validation request from the production runtime.
4. Confirm that a database query or connectivity check succeeds.
5. Confirm the environment can access the required tables and columns for publication, identity, and citation workflows.

### Evidence required
- Successful runtime connection or query result.
- Evidence that the environment supports the required transport path.
- Confirmation that the required schema objects are reachable.
- Logs showing successful execution with trace context.

### Acceptance condition
Supabase validation is complete only when a live service-role request succeeds in the target runtime environment.

## 7. Observability validation procedure

### Objective
Validate that production logging and monitoring are operational and actionable.

### Procedure
1. Confirm structured logs are emitted for provider requests and workflow events.
2. Confirm each request includes trace context.
3. Confirm logs are visible in the deployment monitoring stack.
4. Confirm failed requests, retries, and timeouts are surfaced with enough context for diagnosis.
5. Confirm critical routes and scheduled jobs can be monitored.

### Evidence required
- Log excerpts showing structured provider events.
- Monitoring screenshots or reports showing request and error visibility.
- Evidence that trace identifiers are present.
- Evidence that rollback and recovery procedures are documented and reachable.

### Acceptance condition
Observability validation is complete only when logs and monitoring are demonstrably operational in the target deployment environment.

## 8. Acceptance evidence required

Before any certification statement is issued, the following evidence must be assembled:
- ORCID live OAuth success evidence
- Zenodo deposit/publish evidence
- OpenAlex and OpenAIRE response evidence
- Supabase runtime success evidence
- Observability monitoring evidence
- Secret validation evidence
- Deployment readiness evidence
- Rollback and recovery evidence

## 9. Final certification approval criteria

The statement "ASIA Enterprise Production Certified v1.0" may be considered only when all of the following are true:
- ORCID production OAuth validation is successful.
- Zenodo production validation is successful.
- OpenAlex/OpenAIRE validation is successful.
- Supabase runtime validation is successful.
- Observability validation is successful.
- Required secrets and environment configuration are verified.
- The evidence package is complete and reviewable.

If any of the above conditions remain unverified, the correct status remains:

Architecture Certified.
Production Ready With Conditions.
Pending Final Environment Validation.
