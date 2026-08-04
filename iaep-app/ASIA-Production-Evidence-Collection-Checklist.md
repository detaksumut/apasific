# ASIA Production Evidence Collection Checklist

## Purpose
This checklist defines the evidence package required to support the current certification posture:

Architecture Certified.
Production Ready With Conditions.
Pending Final Environment Validation.

It does not authorize any enterprise production certification claim.

## 1. ORCID Production OAuth Evidence

### Required credentials
- Valid ORCID client ID
- Valid ORCID client secret
- Valid redirect URI registered for the deployed callback route
- Confirmed ORCID environment mode for the target deployment

### Evidence to collect
- Screenshot or log showing the OAuth authorization request initiation
- Screenshot or log showing successful callback return from the deployed environment
- Evidence of successful token exchange response
- Evidence that the returned ORCID profile is accepted by the application flow
- Evidence that token values are handled securely and not exposed in logs

### Acceptance criterion
ORCID evidence is complete only when a real authorization exchange succeeds in the target environment.

## 2. Zenodo Production Evidence

### Required authentication proof
- Valid Zenodo API token present in the production environment
- Environment mode set to production or the intended target mode
- Provider request executed using the configured token

### Evidence to collect
- Request/response log showing successful authentication to Zenodo
- Deposit creation response with a valid deposit identifier
- Publish response showing successful record publication
- DOI returned by the workflow and persisted in application state

### Acceptance criterion
Zenodo evidence is complete only when the deposit-to-publish workflow succeeds end-to-end in the production environment.

## 3. OpenAlex/OpenAIRE Evidence

### Required request execution proof
- OpenAlex request executed from the production environment
- OpenAIRE request executed from the production environment
- Response returned in a structured form or a controlled failure state

### Evidence to collect
- Request log or response payload for OpenAlex
- Request log or response payload for OpenAIRE
- Confirmation that the response was processed without breaking the workflow
- Evidence that provider errors are handled in a controlled way

### Acceptance criterion
OpenAlex/OpenAIRE evidence is complete when both provider paths are shown to execute successfully or fail in a documented, controlled manner.

## 4. Supabase Production Evidence

### Required runtime connection proof
- Valid Supabase URL present in the production environment
- Valid service-role key present in the production environment
- Runtime environment compatible with the Supabase client transport requirements

### Evidence to collect
- Successful runtime connection or query result from the deployment environment
- Evidence that the required database tables and columns are accessible
- Evidence that the runtime can reach the production database path without configuration errors

### Acceptance criterion
Supabase evidence is complete only when a live service-role validation succeeds in the target runtime environment.

## 5. Observability Evidence

### Required logs
- Structured provider request logs
- Trace identifiers attached to provider requests
- Error and retry logs with enough context for diagnosis

### Required monitoring evidence
- Monitoring dashboard or log export showing provider activity
- Evidence that failed requests are visible and actionable
- Evidence that critical routes and scheduled jobs can be monitored

### Required alerting evidence
- Alert configuration or alerting policy evidence
- Evidence that failures can be surfaced to responders
- Evidence that detection covers the relevant provider and runtime health paths

### Acceptance criterion
Observability evidence is complete only when logs, monitoring, and alerting are demonstrably operational in the production environment.

## 6. Final Acceptance Criteria

The evidence package is complete only when the following are present:
- ORCID production OAuth success evidence
- Zenodo production deployment and DOI evidence
- OpenAlex/OpenAIRE provider execution evidence
- Supabase runtime connectivity evidence
- Observability logs, monitoring, and alerting evidence
- Environment secret validation evidence
- Deployment readiness evidence
- Rollback and recovery evidence

## Final status wording
Architecture Certified.
Production Ready With Conditions.
Pending Final Environment Validation.

No enterprise production certification should be issued until all listed evidence is collected and reviewed successfully.
