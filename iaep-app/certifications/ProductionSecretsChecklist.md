# Production Secrets Checklist

## 1. Required Secrets
The following secrets and configuration values are required for acceptance validation:

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

## 2. Validation Method
For each item, validate:
- Presence in the target environment
- Correct value format
- Appropriate access scope for the target integration
- No exposure in logs or deployment output

## 3. Owner Responsibility Placeholder
- Platform / Operations Owner: [To be assigned]
- Application Owner: [To be assigned]
- Security Owner: [To be assigned]
- Provider Integration Owner: [To be assigned]
