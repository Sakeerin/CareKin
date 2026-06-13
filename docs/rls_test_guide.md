# RLS Test Guide — CareKin Phase 2

Run these tests after applying `supabase/migrations/20260612000000_phase2_foundation.sql`.

## Setup

1. Create a Supabase project at https://supabase.com
2. Run the migration in SQL Editor (or `supabase db push`)
3. Copy `.env.example` → `.env.local` with your project keys
4. Create two test users via signup: `owner@test.com`, `viewer@test.com`

## Manual test checklist

### Auth & workspace

- [ ] Signup creates `profiles` row automatically
- [ ] Owner can call `create_workspace_with_owner('Test Family')`
- [ ] Owner appears in `workspace_members` with role `owner`
- [ ] Audit log entry `workspace.created` is written

### Elder profile

- [ ] Owner/Admin can create elder in their workspace
- [ ] Consent record created with elder
- [ ] Owner can add emergency contact
- [ ] Family viewer can SELECT elder but not UPDATE
- [ ] Caregiver without assignment cannot SELECT elder

### Invites

- [ ] Owner invites `viewer@test.com` as `family_viewer`
- [ ] Invite link `/invite/accept?token=...` works when logged in as viewer
- [ ] Viewer can see workspace elders (read-only)

### RLS isolation

- [ ] User A cannot SELECT workspace B's elders (returns empty / error)
- [ ] User A cannot INSERT elder into workspace B
- [ ] User A cannot read workspace B audit logs

## SQL verification queries

Run as authenticated user via Supabase client or SQL with `set request.jwt.claim.sub`:

```sql
-- Should return only workspaces user belongs to
select * from workspaces;

-- Should fail or return 0 rows for other workspace elders
select * from elders where workspace_id = '<other-workspace-id>';
```

## Automated RLS tests (optional)

Use Supabase local dev + pgTAP or the Supabase CLI test runner:

```bash
supabase start
supabase db reset
# Run app against local Supabase and execute checklist above
```

## Expected exit criteria

| Criterion | Pass condition |
|---|---|
| User signup + workspace | Owner creates workspace via UI |
| Add elder | CRUD works with consent |
| Invite family/caregiver | Invite link accepted, role assigned |
| RLS test | Cross-workspace access blocked |
