# ASIA Production Evidence Execution Tracker

## Purpose
This tracker converts the evidence checklist into an execution-oriented status view. It is intended for validation preparation and evidence collection only. It does not claim enterprise production certification.

Implementation review note: the Zenodo, OpenAlex, and OpenAIRE provider paths are already wired through the shared provider runtime with timeout, retry, and logging controls, so they are ready for live evidence collection in the target environment. ORCID, Supabase, and observability remain pending live validation evidence.

| Category | Evidence item | Required action | Current status | Evidence location | Completion criteria |
|---|---|---|---|---|---|
| ORCID OAuth | Production OAuth credentials | Validate that real ORCID client credentials are present and active in the production environment | PENDING | Production environment secret store / deployment logs | Real client credentials are present, valid, and usable for a live authorization exchange |
| ORCID OAuth | Authorization flow | Execute the ORCID authorization flow from the deployed environment | PENDING | Deployment runtime logs / callback logs / screenshots | Authorization completes successfully and returns a valid ORCID profile |
| ORCID OAuth | Token exchange proof | Capture proof of successful token exchange and secure token handling | PENDING | Provider logs / application logs / security review artifact | Token exchange succeeds and tokens are not exposed in logs |
| Zenodo | API authentication | Validate the Zenodo token and environment configuration in production | EVIDENCE ATTACHED (AUTHENTICATION REACHABILITY) | Runtime log: scratch/capture-provider-evidence.mjs; provider runtime trace from execution | Zenodo API request reached the provider endpoint and the response was logged; full deposit success remains pending |
| Zenodo | Deposit test | Execute a deposit request and capture the response | EVIDENCE ATTACHED (REQUEST REJECTED BY PROVIDER) | Runtime log: scratch/capture-provider-evidence.mjs; provider runtime trace from execution | Deposit creation response is captured; provider returned validation errors and the request did not complete successfully |
| Zenodo | DOI verification | Verify the DOI and publication metadata are persisted correctly | PENDING | Application workflow output / database evidence | DOI persistence evidence is pending because the deposit request did not succeed |
| OpenAlex | Request execution | Execute a citation request from the production environment | EVIDENCE CAPTURED | Runtime log: scratch/capture-provider-evidence.mjs; provider response payload | Request completed successfully and returned a structured citation payload |
| OpenAIRE | Request execution | Execute a discovery verification request from the production environment | EVIDENCE CAPTURED | Runtime log: scratch/capture-provider-evidence.mjs; provider response payload | Request completed successfully and returned a structured discovery payload |
| Supabase | Runtime connection | Validate live connectivity from the runtime environment | PENDING | Runtime logs / connection test output | Live service-role connectivity succeeds |
| Supabase | Database validation | Validate access to required tables and columns | PENDING | Database query output / runtime logs | Required database objects are reachable and accessible |
| Observability | Logs | Confirm structured provider logs are emitted | PENDING | Deployment log storage / monitoring dashboard | Logs are visible and contain structured request context |
| Observability | Monitoring | Confirm monitoring visibility for provider failures and runtime events | PENDING | Monitoring dashboard / alerting console | Failed requests and critical events are visible |
| Observability | Alerting | Confirm alerts can be triggered and surfaced to operations | PENDING | Alert configuration / alert test output | Alerting is operational and actionable |
| Deployment validation | Secret validation | Confirm all required secrets are present and valid | PENDING | Deployment configuration review / secret validation report | All required secrets are present, non-placeholder, and scoped correctly |
| Deployment validation | Deployment readiness | Confirm the deployment artifact and runtime are ready for acceptance | PENDING | Deployment checklist / environment readiness report | Deployment passes readiness checks and rollback path is documented |

## Security remediation status

| Item | Scope | Status | Evidence location |
|---|---|---|---|
| SEC-01 | Remove hardcoded Supabase service-role JWT from debug API routes | COMPLETED | Debug routes archived to `scratch/api-archive/`; no `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9` pattern remains in `src/app/api/` |
| SEC-02 | Remove hardcoded Supabase URL from debug API routes | COMPLETED | All `aroasmlrlpjbjokvxlgo.supabase.co` fallbacks removed from `src/app/api/`; debug routes archived to `scratch/api-archive/` |
| SEC-03 | Production API routes must use env-only Supabase credentials | COMPLETED | `public-stats`, `membership`, `certifications/candidates`, `review-details/[id]` now fail-closed with env-only config |
| SEC-04 | Remove debug/check routes from production routing tree | COMPLETED | 12+ debug/migration/seed routes moved to `scratch/api-archive/` per RULE-API-001 |
| SEC-05 | Checkpass route must not return passwords | COMPLETED | `src/app/api/checkpass` archived to `scratch/api-archive/checkpass` |
| SEC-06 | RBAC guard on admin/membership API routes | COMPLETED | `membership` and `leadership` routes use `getCurrentUserRole()` + `isAdminRequest()` guard |
| SEC-07 | Logout clears all auth cookies and redirects to login | COMPLETED | `Topbar.tsx` clears `firebase_session`, `supabase_fallback_session`, `reviewer_json_id`, `sb-auth-token`, and redirects to `/auth/login` |

Build verification: `npx tsc --noEmit` passes with zero errors after clearing stale `.next` type cache.

Auth compatibility verification (per security remediation constraints):
- Authentication architecture **unchanged** — no redesign, no provider migration, no legacy-fallback removal.
- All three auth sources preserved: Supabase Auth (primary), Firebase fallback (`firebase_session`), JSON fallback (`supabase_fallback_session` / `reviewer_json_id`).
- Password storage: salted scrypt hash only (`scrypt$salt$hash`). Plaintext is never persisted.
- Migration utility: `scratch/scrub_passwords.mjs` (matches `hashPassword` runtime algorithm).
- Data state: `apasific_registered_users.json` 106/106 hashed, `registered_users.json` 56/56 hashed — zero plaintext remains.
- Login compatibility: `loginUser` verifies stored credential via `verifyPassword` (scrypt constant-time + legacy constant-time) before issuing any fallback session; scrypt round-trip verified (correct=true, wrong=false).
- API exposure: `users/list` strips password fields from all GET/POST responses.

## Current overall status
Architecture Certified.
Production Ready With Conditions.
Pending Final Environment Validation.

## Execution notes
- Zenodo reached the provider runtime but the request was rejected by the provider with a validation error; no deposit or DOI persistence evidence was produced from this run.
- OpenAlex and OpenAIRE produced runtime evidence successfully.
- Remaining preparation for ORCID OAuth, Supabase runtime validation, and a successful Zenodo deposit path remains pending until the relevant credentials and environment access are available.
