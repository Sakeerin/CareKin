# CareKin Commercial Launch Plan

## Launch model

CareKin Phase 7 runs as a controlled launch. Signup can remain open during local testing, or be invite-gated in production by setting:

```bash
LAUNCH_INVITE_REQUIRED=true
```

When enabled, `/signup` requires a valid `launch_invites.code`. The first launch batch should target 50-100 paying family accounts or 3-5 B2B/provider customers.

Invite-only signup validation and invite claiming run on the server with `SUPABASE_SERVICE_ROLE_KEY`.
Set that key in production before enabling `LAUNCH_INVITE_REQUIRED=true`.

## Launch checklist

1. Apply `supabase/migrations/20260617000000_phase7_commercial_launch.sql`.
2. Create one or more `launch_batches`.
3. Create `launch_invites` for selected families/providers.
4. Publish pricing and legal pages: `/pricing`, `/terms`, `/privacy`, `/consent`.
5. Configure support workflow at `/support`.
6. Use `/onboarding` for each new workspace setup checklist.
7. Record demo from `/demo` storyboard and prototype routes.
8. Use `/sales` plus `docs/sales_assets.md` for B2B calls.
9. Review billing plan selections in `subscriptions` and `billing_events`.

## Billing approach

Phase 7 records plan intent and subscription state before adding a payment provider. This supports manual invoice, Stripe Checkout, Omise/PromptPay, or another Thailand-compatible provider later.

The source of truth for plan packaging is `src/lib/plans.ts`.

## Controlled growth guardrails

- Keep invite batches small enough for onboarding and support coverage.
- Do not market AI summaries as diagnosis, treatment, or medical advice.
- Use expiring report share links only with authorized recipients.
- Require consent before creating elder profiles and health-data workflows.
- Review open urgent support tickets before inviting a new batch.
