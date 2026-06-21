# Clinical Safety Case

This document is a working checklist for Phase 8 features that may touch clinical workflows.

## Safety principles

- CareKin supports coordination; humans remain responsible for decisions.
- Alerts should be explainable and reviewable.
- AI output requires explicit disclaimers and human review before sharing.
- Device data must be treated as incomplete unless verified with the source device or clinician.
- Fall detection and emergency language must avoid guaranteed monitoring claims.

## Feature review template

For each feature gate:

| Field | Notes |
|---|---|
| Feature key | e.g. `telecare_sessions` |
| Intended user | Family admin, caregiver, clinician viewer, provider |
| Data used | Inputs, device data, reports, notes |
| Outputs | Alerts, referrals, summaries, reminders |
| Known risks | False positives, false negatives, privacy leakage, delayed response |
| Human review | Who reviews and when |
| Consent | Consent type and version |
| Audit coverage | Tables/actions logged |
| Rollback | How to disable or retire the feature |

## Initial gate recommendation

- `facility_dashboard`: low clinical risk, coordination only
- `caregiver_marketplace`: operational and legal risk, not clinical by default
- `insurance_wellness`: commercial/privacy risk, avoid medical outcome claims
- `telecare_sessions`: approve only after provider and consent workflow review
- `medical_device_integration`: approve only after ingestion validation and device disclaimer review
- `fall_detection`: highest risk; require advisor review and incident protocol
- `ai_voice_checkin`: require model validation and elder accessibility review
- `clinic_referrals`: approve only as coordination workflow with report-sharing controls
