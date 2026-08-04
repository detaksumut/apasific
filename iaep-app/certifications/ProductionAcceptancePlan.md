# Production Acceptance Plan

## 1. Purpose
This plan prepares the ASIA production acceptance execution path using the validated architecture and provider integration evidence. It does not claim production certification; it defines the acceptance steps required before go-live.

## 2. Production Validation Steps
1. Confirm the deployment environment has the required secrets and runtime configuration.
2. Validate the application build artifact in the target environment.
3. Execute provider validation in sequence: Zenodo, OpenAlex, OpenAIRE, ORCID, and Supabase.
4. Confirm logging, tracing, and monitoring visibility for provider requests.
5. Verify database readiness and migration applicability.
6. Confirm rollback and recovery procedures are available.

## 3. Environment Requirements
The target environment must provide:
- A runtime compatible with the current Next.js and Supabase client stack
- Access to the required provider credentials and secrets
- Network access to the external provider endpoints
- Monitoring and log collection capability
- A database access path for Supabase service-role verification

## 4. Provider Validation Sequence
1. Zenodo
   - Validate token presence and API access.
   - Confirm deposit/publish flow executes successfully.
2. OpenAlex
   - Validate polite-email configuration.
   - Confirm request handling and fallback behavior are acceptable.
3. OpenAIRE
   - Validate endpoint reachability and response processing.
4. ORCID
   - Validate OAuth client credentials and callback registration.
   - Confirm authorization exchange and token handling behavior.
5. Supabase
   - Validate connection configuration and service-role access.
   - Confirm migration readiness in the live environment.

## 5. Acceptance Criteria
Acceptance may proceed only when all of the following are true:
- Required secrets are present and valid.
- Each provider completes its validation path without unresolved configuration errors.
- Logs and traces show successful request execution and error handling.
- The database runtime is reachable and migration readiness is confirmed.
- Rollback and recovery procedures are documented and available.
