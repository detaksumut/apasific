# Production Operational Checklist

## 1. Deployment checklist
- Confirm the target environment has the required secrets configured.
- Confirm the build artifact is the current certified build.
- Confirm the Next.js production build passed successfully.
- Confirm provider endpoints are reachable from the deployment environment.
- Confirm the cron routes and protected operational routes are configured with the required secret.

## 2. Database readiness
- Confirm Supabase URL and service-role key are configured.
- Confirm the required tables and columns for publication visibility, identity, and citation data are present.
- Confirm the publication index status structure and related evidence tables are available.
- Confirm the reviewer assignment tables are accessible.

## 3. Logging verification
- Confirm structured logs are emitted for provider requests.
- Confirm each provider request includes trace context.
- Confirm log output can be collected by the deployment monitoring stack.

## 4. Monitoring verification
- Confirm failed provider requests are visible in the operational logs.
- Confirm retries and timeouts are logged with enough context for diagnosis.
- Confirm critical routes and scheduled jobs can be monitored.

## 5. Backup verification
- Confirm database backup and recovery procedures are available.
- Confirm critical publication and identity data are included in backup scope.
- Confirm rollback procedure is documented and tested.

## 6. Security verification
- Confirm the encryption key is configured and protected.
- Confirm secrets are not exposed in application logs.
- Confirm service-role credentials are limited to the intended deployment context.
- Confirm production routes remain within the approved API boundary.

## 7. Rollback procedure
1. Revert to the previous known-good deployment artifact.
2. Restore the previous environment configuration if required.
3. Re-run the build and deployment health checks.
4. Verify provider integrations and core routes are functioning.
5. Reconcile any database or identity changes introduced during the failed release.
