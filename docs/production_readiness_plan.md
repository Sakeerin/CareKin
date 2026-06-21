# CareKin Production Readiness Plan

Phase 9 focuses on making CareKin safe to operate in production before adding more advanced product surface area.

## Required gates before production release

1. All Supabase migrations applied in order through `20260619000000_phase9_production_readiness.sql`.
2. `npm run build` passes on the release commit.
3. RLS regression checklist completed for all workspace-scoped tables.
4. Core E2E flows validated:
   - Signup and workspace creation
   - Elder create with consent
   - Medication/routine event generation
   - Task confirmation
   - Daily check-in and vitals
   - Report generation, review, export, share
   - Support ticket creation
   - Billing plan selection
   - Phase 8 feature gates
5. `/api/health` returns `200` in production.
6. External uptime monitoring is configured against `/api/health`.
7. Backup restore drill is recorded.
8. Incident response and rollback drills are recorded.

Track evidence in `/ops/production`.

## Health endpoint

`GET /api/health` returns:

- service name
- timestamp
- required env status
- configured optional integrations

It returns `503` if required environment variables are missing.

## Release review

Create a release readiness review in `/ops/production` for every production deploy. Include commit SHA, migration version, health-check URL, checklist state, and rollback plan.
