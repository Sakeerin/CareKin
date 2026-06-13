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

3. Apply database migration in Supabase SQL Editor:

```
supabase/migrations/20260612000000_phase2_foundation.sql
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
| `/dashboard` | Main dashboard |
| `/elders` | Elder profiles list |
| `/elders/new` | Add elder |
| `/elders/[id]` | Elder detail + emergency contacts |
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
