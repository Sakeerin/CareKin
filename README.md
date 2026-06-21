# CareKin

Family Care Companion Platform for Thai families caring for elderly loved ones.

## Phase 2 — MVP Foundation

### Prerequisites

- Node.js 20+
- Supabase project ([supabase.com](https://supabase.com))

### Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Apply database migrations in Supabase SQL Editor (in order):

```
supabase/migrations/20260612000000_phase2_foundation.sql
supabase/migrations/20260613000000_phase3_care_tasks.sql
supabase/migrations/20260614000000_phase4_checkin_vitals.sql
supabase/migrations/20260615000000_phase5_reports_ai_summary.sql
supabase/migrations/20260616000000_phase6_pilot_launch.sql
supabase/migrations/20260617000000_phase7_commercial_launch.sql
supabase/migrations/20260618000000_phase8_scale_advanced_features.sql
supabase/migrations/20260619000000_phase9_production_readiness.sql
supabase/migrations/20260620000000_security_hardening_shared_reports.sql
```

4. Run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### App routes

| Route | Description |
|---|---|
| `/signup` | Create account |
| `/login` | Sign in |
| `/pricing` | Commercial launch pricing |
| `/terms` | Terms of Service |
| `/privacy` | Privacy Policy |
| `/consent` | Health data consent summary |
| `/help` | Public help center |
| `/demo` | Demo video storyboard and prototype links |
| `/sales` | B2B sales page |
| `/workspace/new` | Create family workspace |
| `/dashboard` | Main dashboard — today's tasks & alerts |
| `/onboarding` | Launch onboarding checklist |
| `/tasks` | Today's care tasks |
| `/tasks/[id]` | Confirm done / missed |
| `/notifications` | Notification log |
| `/alerts/[id]` | Alert detail + acknowledge |
| `/elders` | Elder profiles list |
| `/elders/new` | Add elder |
| `/elders/[id]` | Elder detail, emergency contacts, reminder settings |
| `/elders/[id]/check-in` | Caregiver daily check-in form |
| `/elders/[id]/check-in/elder` | Elder-friendly large-button check-in |
| `/elders/[id]/vitals` | Vital signs logging + trend chart |
| `/elders/[id]/thresholds` | Alert threshold settings |
| `/elders/[id]/reports` | Report generation + report history |
| `/elders/[id]/reports/[reportId]/review` | Human review/edit before export |
| `/elders/[id]/reports/[reportId]/export` | Print / Save PDF view |
| `/report/share/[token]` | Public expiring shared report |
| `/elders/[id]/medications` | Medication CRUD + schedules |
| `/elders/[id]/routines` | Routine care tasks |
| `/feedback` | Pilot bug / UX feedback form |
| `/support` | Launch support tickets and SLA workflow |
| `/scale` | Phase 8 feature gates and advanced feature hub |
| `/facility` | Facility dashboard readiness |
| `/marketplace` | Caregiver marketplace profile and request workflow |
| `/integrations` | Telecare and device integration requests |
| `/referrals` | Clinic referral coordination workflow |
| `/wellness` | Insurance/provider wellness programs |
| `/compliance` | Regulatory gate checklist and incident log |
| `/ops/pilot` | Pilot operations dashboard for admins |
| `/ops/production` | Production readiness dashboard for admins |
| `/api/health` | Public health check for uptime monitoring |
| `/members` | Invite & manage members |
| `/settings` | Profile & workspace settings |
| `/prototype` | Phase 1 UX prototype (mock data) |

### Phase 2 deliverables

- Supabase schema + RLS policies
- Auth (email/password)
- Workspace + RBAC (6 roles)
- Elder profile CRUD + emergency contacts
- Audit logging
- CI workflow (`.github/workflows/ci.yml`)
- RLS test guide (`docs/rls_test_guide.md`)

## Phase 3 — Care tasks and reminders

### Additional environment variables

| Variable | Required | Description |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Cron / launch gate | Service role key for background jobs and invite-only signup validation |
| `CRON_SECRET` | Cron route | Bearer token for `/api/cron/reminders` |
| `LINE_CHANNEL_ACCESS_TOKEN` | Optional | LINE push notifications |
| `LINE_CHANNEL_SECRET` | Optional | Verify LINE webhook signatures |

### Reminder cron

The cron endpoint generates today's task events, sends reminders, marks missed tasks (60 min grace), and escalates to family admins.

**Local test:**

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" http://localhost:3000/api/cron/reminders
```

**Production:** `vercel.json` schedules the route every 5 minutes. Set `CRON_SECRET` in Vercel env vars.

### LINE webhook

Configure your LINE Messaging API webhook URL to:

```
https://your-app.vercel.app/api/line/webhook
```

Set `LINE_CHANNEL_SECRET` and `LINE_CHANNEL_ACCESS_TOKEN`. On each elder's profile page, set reminder channel and LINE User ID.

### Phase 3 deliverables

- Medication + schedule CRUD
- Routine care tasks
- Task event generator + reminder queue
- Confirm done/missed (web + LINE deep link)
- Missed escalation + care alerts
- Notification log
- Dashboard today status

## Phase 4 — Check-in, vitals, and alerts

Phase 4 adds daily health capture and alert rules on top of Phase 3's notification stack.

### Phase 4 deliverables

- Daily check-in with caregiver form and elder-friendly mode
- Vitals logging for blood pressure, pulse, blood sugar, temperature, SpO2, and weight
- Default + custom threshold rules
- Alert engine for concerning check-ins and abnormal vitals
- Missed daily check-in escalation via the existing cron route
- Alert list/detail + acknowledge flow
- Basic trend charts on the vitals page

The existing `/api/cron/reminders` endpoint also checks for missed daily check-ins after 20:00 Asia/Bangkok and creates family alerts.

## Phase 5 — Reports and AI summary

Phase 5 adds report snapshots for family review and doctor visits.

### Phase 5 deliverables

- 7/14/30 day report generation
- Aggregates for medication adherence, check-ins, vitals, and alerts
- Structured AI draft summary with safety disclaimer and no diagnosis/treatment claims
- Human review/edit screen before export
- Print-friendly PDF export route
- Expiring public share links

The current AI draft is deterministic and validated with Zod, so it works without an external AI provider. A future provider can replace `src/lib/services/ai-summary.ts` while preserving the same structured output schema.

## Phase 6 — Pilot launch

Phase 6 adds operational tooling for a 30-day pilot cohort.

### Phase 6 deliverables

- Pilot cohort and setup tracking
- Baseline workflow capture
- Weekly interview notes and NPS/retention signal
- Pilot bug/UX feedback queue
- Reminder completion, active admin, report usage, and pricing-evidence metrics
- Pricing signal capture
- Pilot playbook and interview templates in `docs/`

Use `/ops/pilot` for admin pilot tracking and `/feedback` for pilot users to report issues.

## Phase 7 — Commercial launch

Phase 7 adds a controlled commercial launch layer on top of the pilot product.

### Additional environment variables

| Variable | Required | Description |
|---|---|---|
| `LAUNCH_INVITE_REQUIRED` | Optional | Set to `true` in production to require invite codes during signup. Requires `SUPABASE_SERVICE_ROLE_KEY`. |

### Phase 7 deliverables

- Public landing page, pricing page, legal pages, help center, demo storyboard, and B2B sales page
- Launch waitlist, invite codes, launch batches, referral codes, support tickets, subscription records, and billing events
- In-app support workflow at `/support`
- Billing plan intent and referral code management in `/settings`
- Launch onboarding guide at `/onboarding`
- Commercial launch, support SLA, and sales asset docs in `docs/`

See `docs/commercial_launch_plan.md`, `docs/support_sla.md`, and `docs/sales_assets.md` for operating details.

## Phase 8 — Scale and advanced features

Phase 8 adds the foundation for scale workflows while keeping clinical-adjacent features behind explicit safety gates.

### Phase 8 deliverables

- Feature gate system for advanced and clinical-adjacent workflows
- Facility dashboard readiness and provider profile tracking
- Caregiver marketplace profiles and family request workflow
- Telecare session request records
- Medical/fall device integration request records
- Clinic referral coordination drafts
- Wellness program and enrollment tracking
- Scale incident logging and regulatory/safety docs
- Preferred locale storage for future multilingual UI

Clinical-adjacent features such as telecare, device integrations, fall detection, AI voice check-in, and clinic referrals require approval in `/scale` before related actions can be created.

See `docs/phase8_scale_plan.md`, `docs/regulatory_boundary_memo.md`, `docs/clinical_safety_case.md`, and `docs/incident_response.md`.

## Phase 9 — Production hardening and validation

Phase 9 adds operational evidence tracking and deployment readiness checks before real production launch.

### Phase 9 deliverables

- Public `/api/health` endpoint for uptime monitoring
- Production readiness checks for migrations, RLS, E2E, billing, monitoring, backup, security, performance, accessibility, and release gates
- Operational drill records for backup restore, incident response, rollback, and security review
- Release readiness review records with commit, migration, health-check, checklist, and rollback plan
- Admin dashboard at `/ops/production`
- Production runbooks in `docs/`

See `docs/production_readiness_plan.md`, `docs/production_validation_checklist.md`, `docs/backup_restore_runbook.md`, and `docs/monitoring_runbook.md`.
