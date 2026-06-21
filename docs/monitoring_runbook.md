# Monitoring Runbook

## Monitors

Configure external monitoring for:

- `GET /api/health`
- `/login`
- `/dashboard` authenticated smoke test if your monitoring vendor supports scripted checks
- `/api/cron/reminders` execution logs
- Error rate and latency in Vercel
- Supabase database availability

## Alerts

| Signal | Suggested threshold | Owner |
|---|---|---|
| `/api/health` down | 2 consecutive failures | On-call maintainer |
| Cron reminders failing | 2 failed runs | Product/engineering |
| Error rate spike | > 2% over 10 minutes | Engineering |
| DB connection errors | Any sustained error | Engineering |
| Support urgent ticket | Immediate | Customer support |

## Response

1. Confirm if issue is app, Supabase, Vercel, or external integration.
2. Create a support ticket or scale incident if customer-impacting.
3. If safety/privacy risk exists, block related feature gate.
4. Follow `docs/incident_response.md` and record the drill/incident in `/ops/production` or `/compliance`.
