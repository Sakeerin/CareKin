# Backup and Restore Runbook

## Backup scope

- Supabase Postgres database
- Supabase auth users and profiles
- Storage buckets if added later
- Vercel environment variables
- GitHub repository and migration files

## Restore drill checklist

1. Create a fresh staging Supabase project.
2. Apply migrations in order.
3. Restore a sanitized database backup.
4. Verify row counts for core tables.
5. Run RLS smoke tests from `docs/rls_test_guide.md`.
6. Run a production build against staging env vars.
7. Validate core flows with test users.
8. Record findings and follow-up actions in `/ops/production`.

## Minimum restore validation

- Owner can see only their workspace.
- Family admin can manage elders and support tickets.
- Viewer cannot mutate protected data.
- Shared report tokens expire and do not expose workspace sessions.
- Cron route rejects missing/invalid `CRON_SECRET`.

## Frequency

Run a restore drill before first production launch, then at least monthly during active launch cohorts.
