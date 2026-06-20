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
| `/elders` | Elder profiles list |
| `/elders/new` | Add elder |
| `/elders/[id]` | Elder detail, emergency contacts, reminder settings |
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
