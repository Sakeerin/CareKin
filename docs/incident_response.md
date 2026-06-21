# Incident Response

Phase 8 adds `scale_incidents` for safety, privacy, support, and advanced feature issues.

## Severity levels

| Severity | Meaning | Target response |
|---|---|---|
| Critical | Privacy breach, safety risk, misleading clinical output, emergency workflow failure | Same day, pause feature if needed |
| High | Repeated data error, blocked clinical-adjacent workflow, support escalation | 1 business day |
| Medium | Single workspace issue or unclear advanced workflow behavior | 2 business days |
| Low | Documentation, copy, or non-blocking usability issue | 3 business days |

## Response process

1. Create an incident in `/compliance`.
2. Triage severity and affected feature gate.
3. If safety or privacy is involved, set the related feature gate to `blocked`.
4. Add mitigation notes and support/customer communication.
5. Resolve only after root cause and follow-up tasks are documented.

## Feature pause criteria

Pause or block a feature gate when:

- Users could interpret output as diagnosis or treatment advice.
- Device or AI data quality cannot be verified.
- Consent is missing or ambiguous.
- A privacy/data-sharing issue is suspected.
- The workflow creates emergency response expectations CareKin cannot meet.
