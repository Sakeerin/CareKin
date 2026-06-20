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
| `/workspace/new` | Create family workspace |
| `/dashboard` | Main dashboard — today's tasks & alerts |
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
| `SUPABASE_SERVICE_ROLE_KEY` | Cron only | Service role key for background jobs |
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
