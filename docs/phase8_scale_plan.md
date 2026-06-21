# CareKin Phase 8 Scale Plan

Phase 8 extends CareKin from family launch to provider-scale workflows. The implementation intentionally starts with auditable coordination workflows, not automated clinical interpretation.

## Implemented foundation

- Feature gates for advanced capabilities
- Facility profile and dashboard readiness
- Caregiver marketplace profiles and family care requests
- Telecare session request records
- Device integration request records
- Clinic referral draft workflow
- Wellness program and enrollment tracking
- Scale incident logging
- Preferred locale storage

## Feature gate policy

Clinical-adjacent features must be explicitly approved in `/scale` before users can create related requests:

- Telecare sessions
- Medical device integration
- Fall detection
- AI voice check-in
- Clinic referrals

Approval should only happen after the review items in `docs/regulatory_boundary_memo.md` and `docs/clinical_safety_case.md` are complete.

## Operational notes

- Marketplace listings are self-reported until background check and verification policies are added.
- Device integrations are request records only; no webhook ingestion or automated alerts are enabled by this phase.
- Telecare is request/scheduling metadata only; no video provider tokens are minted yet.
- Clinic referrals are coordination drafts and must not be positioned as diagnosis or treatment advice.
- Wellness packages track engagement goals only and should avoid insurance/medical outcome claims without evidence.
