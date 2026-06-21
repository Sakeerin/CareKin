# Production Validation Checklist

Use this checklist before inviting real launch customers.

## Environment

- `NEXT_PUBLIC_SUPABASE_URL` set
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` set
- `NEXT_PUBLIC_APP_URL` set to production URL
- `CRON_SECRET` set
- `SUPABASE_SERVICE_ROLE_KEY` set for cron/admin jobs
- LINE env vars set if reminders use LINE
- `LAUNCH_INVITE_REQUIRED=true` if signup should be invite-only

## Database

- Migrations applied through Phase 9
- RLS enabled on new tables
- Policies verified for owner/admin/viewer roles
- Seed/demo data removed or clearly marked

## Core flows

- Signup accepts terms/privacy
- Invite-only signup works when enabled
- Workspace creation attaches launch invite where applicable
- Elder profile requires consent
- Medication/routine tasks generate events
- Reminder cron succeeds
- Check-in/vitals create alerts when expected
- Report review required before sharing externally
- Support ticket workflow works
- Billing plan intent records events
- Phase 8 clinical-adjacent actions remain blocked until gates approved

## Operations

- `/api/health` returns 200
- External uptime monitor configured
- Backup restore drill completed
- Incident response drill completed
- Rollback plan recorded in `/ops/production`
- Support SLA reviewed
