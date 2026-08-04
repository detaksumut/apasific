# Production Environment Validation Plan

## 1. Required environment variables
The following variables are expected by the current provider and runtime implementation:

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

## 2. Provider credentials checklist
- Zenodo API token present and active
- ORCID OAuth client credentials present
- OpenAlex polite email configured
- Supabase service-role credentials configured
- Encryption key configured for token protection
- Cron secret configured for scheduled jobs

## 3. Zenodo validation steps
1. Confirm ZENODO_API_TOKEN is configured.
2. Confirm ZENODO_ENVIRONMENT is set to sandbox or production as intended.
3. Trigger a deposit request through the publication federation path.
4. Verify the response contains a deposit identifier and a successful publish result.
5. Verify the resulting DOI and external record metadata are persisted in the expected publication workflow.

Expected response:
- Deposit creation returns a valid record identifier.
- Publish response returns a successful published state.
- DOI is captured and stored.

Failure scenarios:
- Missing token
- Unauthorized token
- Timeout or retry exhaustion
- Service unavailable

## 4. OpenAIRE validation steps
1. Confirm the OpenAIRE endpoint can be reached from the deployment environment.
2. Submit a DOI-based discovery verification request.
3. Verify the response structure contains a valid discovery result or a clear negative result.
4. Confirm the index status is updated according to the existing publication visibility logic.

Expected response:
- Discovery result includes either a found record or a not-found result.
- The service updates publication visibility status consistently.

Failure scenarios:
- Network timeout
- Invalid DOI format
- External service outage
- Unexpected response shape

## 5. ORCID validation steps
1. Confirm ORCID client credentials are configured.
2. Confirm redirect URI matches the deployed callback route.
3. Run the authorization exchange flow.
4. Verify a profile is returned and tokens are encrypted before persistence.
5. Confirm the identity link is recorded without duplicate ORCID mapping.

Expected response:
- Authorization exchange returns a verified ORCID profile.
- Token data is encrypted and persisted safely.

Failure scenarios:
- Missing client credentials
- Redirect mismatch
- OAuth exchange failure
- Invalid token response

## 6. Citation provider validation steps
1. Confirm OpenAlex provider configuration is complete.
2. Submit a DOI-based citation request.
3. Verify the response returns a citation payload and hash.
4. Confirm the service can persist or propagate the metrics without breaking the existing citation workflow.

Expected response:
- Citation count and provider metadata are returned.
- Metrics flow into the existing citation intelligence path.

Failure scenarios:
- Provider rate limiting
- Network error
- Empty or malformed payload
- Timeout during request

## 7. Expected responses
- Provider requests should complete with structured success or failure logging.
- External failures should be surfaced as controlled errors rather than silent fallback.
- Trace identifiers should be present in logs for provider request correlation.

## 8. Failure scenarios
- Missing secrets
- Invalid credentials
- Timeouts or retry exhaustion
- Unexpected third-party response payloads
- Logging pipeline unavailable
- Supabase configuration incomplete
