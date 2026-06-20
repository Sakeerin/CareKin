# CareKin Pilot Plan — Phase 6

> เป้าหมาย: ทดสอบกับ 10–30 ครอบครัว หรือ 1–3 care providers เป็นเวลาอย่างน้อย 30 วัน  
> ใช้คู่กับหน้า `/ops/pilot` และฟอร์ม `/feedback`

## Cohort Criteria

| Field | Target |
|---|---|
| Pilot size | 10–30 family workspaces หรือ 1–3 care providers |
| Pilot length | 30 วันขึ้นไป |
| Required setup | workspace, elder profile, consent, meds/routines, family admin, caregiver |
| Support channel | LINE group / phone / email |

## Success Metrics

| Metric | Target | Source |
|---|---|---|
| Reminder completion | 70%+ | `task_events` |
| Weekly active family admin | 60%+ | `audit_logs` proxy |
| Report usage | 50%+ workspaces generate report | `reports` |
| Qualitative NPS / confidence | positive | `pilot_interviews` |
| Willingness to pay | 5+ users | `pilot_pricing_signals` |

## Setup Checklist

1. Create workspace and mark pilot cohort in `/ops/pilot`.
2. Add elder profile and emergency contacts.
3. Record consent and privacy explanation.
4. Add medications and routine tasks.
5. Invite family admin/caregiver.
6. Configure reminders and optional LINE ID.
7. Run baseline workflow interview and save in `/ops/pilot`.
8. Explain `/feedback` for bug reports.
9. Schedule weekly interview.

## Weekly Ops Ritual

1. Review `/ops/pilot` success metrics.
2. Triage feedback queue: critical/high first.
3. Record weekly interview notes.
4. Record pricing signal if discussed.
5. Export report usage and reminder completion notes for pilot review.

## Exit Checklist

1. Critical bugs are resolved or accepted with workaround.
2. Consent/privacy flow was completed for every elder.
3. At least one report was generated and reviewed.
4. Churn/retention reason recorded.
5. Pricing evidence captured.
