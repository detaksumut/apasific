# TODO — Fix AI Reviewer Settings Toggle

## Steps
- [x] 1. Analyze files (page, action, service, auth, schema, migration)
- [x] 2. Root cause confirmed
- [x] 3. Plan approved
- [x] 4. Edit `src/app/actions/auth.ts` — super admin role → `"super_admin"`
- [x] 5. Edit `src/app/actions/aiReviewer.ts` — normalize role in `resolveCaller` + env email fallback
- [x] 6. Edit `src/services/reviewer/AIReviewerService.ts` — upsert `onConflict: 'key'` + read resilience
- [x] 7. Verify changes (static checks passed via scratch/verify_ai_reviewer_fix.mjs)
- [x] 8. Report root cause, files changed, test results, warnings
